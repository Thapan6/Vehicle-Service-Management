import asyncHandler from 'express-async-handler';
import Invoice from '../models/invoiceModel.js';
import ServiceRecord from '../models/serviceRecordModel.js';
import Vehicle from '../models/vehicleModel.js';
import User from '../models/userModel.js';
import { createNotification } from './notificationController.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getInvoiceGeneratedTemplate, getPaymentSuccessfulTemplate } from '../utils/emailTemplates.js';

// @desc    Get all global invoices
// @route   GET /api/invoices
// @access  Private/ServiceCenter
const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({})
    .populate('vehicle')
    .populate('serviceRecord')
    .populate('user', 'name');
  
  console.log(`📋 FETCHED ${invoices.length} INVOICES FOR SERVICE CENTER`);
  res.status(200).json(invoices);
});

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private/Staff
const createInvoice = asyncHandler(async (req, res) => {
  const { serviceRecord } = req.body;

  console.log(`🔷 CREATING INVOICE FOR SERVICE RECORD: ${serviceRecord}`);

  if (!serviceRecord) {
    res.status(400);
    throw new Error('serviceRecord ID is required');
  }

  const record = await ServiceRecord.findById(serviceRecord)
    .populate('vehicle')
    .populate({ path: 'appointment', select: 'user' });

  if (!record) {
    res.status(404);
    throw new Error('Service Record not found');
  }

  console.log(`   Service Record Status: ${record.status}`);
  console.log(`   Expected Status: Completed`);

  // ⭐ CRITICAL: Status enforcement
  if (record.status !== 'Completed') {
    res.status(400);
    throw new Error(`Cannot generate invoice. Service is not completed. Current status: "${record.status}"`);
  }

  // ⭐ CRITICAL: Duplicate & Payment prevention
  if (record.invoiceGenerated) {
    res.status(400);
    throw new Error('Invoice already generated for this service.');
  }

  if (record.isPaid) {
    res.status(400);
    throw new Error('This service has already been paid for.');
  }

  const existingInvoice = await Invoice.findOne({ serviceRecord: record._id });
  if (existingInvoice) {
    // Sync the flag if it was somehow missed but doc exists
    record.invoiceGenerated = true;
    await record.save();
    res.status(400);
    throw new Error('Invoice already strictly exists in system registry.');
  }

  // ✅ Calculate totals properly
  const partsTotal = record.partsUsed && record.partsUsed.length > 0
    ? record.partsUsed.reduce((acc, part) => acc + (part.price * part.quantity), 0)
    : 0;

  const FIXED_RATE = 100; // $100/hr
  const laborCost = (record.laborHours || 0) * FIXED_RATE;
  
  const amount = partsTotal + laborCost;
  const tax = amount * 0.10; // 10% tax rate
  const totalAmount = amount + tax;

  console.log(`   Parts Total: $${partsTotal.toFixed(2)}`);
  console.log(`   Labor Cost ($${FIXED_RATE}/hr × ${record.laborHours} hrs): $${laborCost.toFixed(2)}`);
  console.log(`   Subtotal: $${amount.toFixed(2)}`);
  console.log(`   Tax (10%): $${tax.toFixed(2)}`);
  console.log(`   TOTAL: $${totalAmount.toFixed(2)}`);

  const invoice = await Invoice.create({
    user: record.appointment ? record.appointment.user : null,
    vehicle: record.vehicle._id || record.vehicle,
    serviceRecord: record._id,
    amount,
    tax,
    totalAmount,
  });

  console.log(`✅ INVOICE CREATED: ${invoice._id}`);

  // ⭐ Sync state back to ServiceRecord
  record.invoiceGenerated = true;
  await record.save();

  if (invoice.user) {
    await createNotification(
      invoice.user,
      'Invoice Generated',
      `Your final invoice of $${totalAmount.toFixed(2)} is ready for payment.`,
      'Alert'
    );

    // Asynchronously send Invoice Generated Email (non-blocking)
    const customer = await User.findById(invoice.user);
    if (customer) {
      const vehicleName = record.vehicle ? `${record.vehicle.make} ${record.vehicle.model}` : 'Vehicle';
      sendEmail({
        to: customer.email,
        subject: `Invoice Ready: $${totalAmount.toFixed(2)} - AutoCare 💳`,
        htmlContent: getInvoiceGeneratedTemplate(customer.name, {
          invoiceId: invoice._id.toString(),
          vehicleName,
          laborHours: record.laborHours || 0,
          partsUsed: record.partsUsed || [],
          laborCost,
          partsCost: partsTotal,
          tax,
          totalAmount,
        })
      });
    }
  }

  // Return fully populated invoice for frontend to use immediately
  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate('vehicle', 'make model')
    .populate('serviceRecord');

  res.status(201).json(populatedInvoice);
});

// @desc    Get user invoices
// @route   GET /api/invoices/myinvoices
// @access  Private
const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id })
    .populate('vehicle', 'make model')
    .populate('serviceRecord');
  
  console.log(`📋 FETCHED ${invoices.length} INVOICES FOR USER ${req.user._id}`);
  res.status(200).json(invoices);
});

// @desc    Mark invoice as paid
// @route   PUT /api/invoices/:id/pay
// @access  Private
const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  // Authorization: Only customers can initiate payment through this endpoint
  if (req.user.role !== 'Customer') {
    res.status(403);
    throw new Error('Not authorized: only customers can initiate invoice payment');
  }

  // Determine invoice ownership from invoice, vehicle, or service record appointment
  let ownerUserId = invoice.user ? invoice.user.toString() : null;

  if (!ownerUserId && invoice.vehicle) {
    const vehicle = await Vehicle.findById(invoice.vehicle);
    if (vehicle && vehicle.user) {
      ownerUserId = vehicle.user.toString();
    }
  }

  if (!ownerUserId && invoice.serviceRecord) {
    const record = await ServiceRecord.findById(invoice.serviceRecord).populate('appointment');
    if (record && record.appointment && record.appointment.user) {
      ownerUserId = record.appointment.user.toString();
    }
  }

  // Reject attempts to pay another customer's invoice
  if (!ownerUserId || ownerUserId !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay this invoice');
  }

  // Fast-fail checks on current state
  if (invoice.paymentStatus === 'Paid') {
    res.status(400);
    throw new Error('Invoice is already marked as paid');
  }

  if (invoice.paymentStatus !== 'Pending') {
    res.status(400);
    throw new Error(`Invalid payment transition: invoice is in '${invoice.paymentStatus}' state`);
  }

  // Check associated ServiceRecord state consistency
  if (invoice.serviceRecord) {
    const existingRecord = await ServiceRecord.findById(invoice.serviceRecord);
    if (existingRecord && existingRecord.isPaid) {
      res.status(400);
      throw new Error('Associated service record is already marked as paid');
    }
  }

  // Atomic conditional transition: Only one concurrent request can transition from 'Pending' to 'Paid'
  const paymentDate = new Date();
  const paymentMethod = req.body.paymentMethod || invoice.paymentMethod || 'Online';

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { _id: invoice._id, paymentStatus: 'Pending' },
    {
      $set: {
        paymentStatus: 'Paid',
        paymentDate,
        paymentMethod,
      },
    },
    { new: true }
  );

  if (!updatedInvoice) {
    res.status(400);
    throw new Error('Invoice payment failed: invoice is already paid or undergoing payment');
  }

  // Sync state back to ServiceRecord with failure handling / compensating rollback
  if (invoice.serviceRecord) {
    try {
      const syncResult = await ServiceRecord.updateOne(
        { _id: invoice.serviceRecord },
        { $set: { isPaid: true } }
      );

      if (syncResult.matchedCount === 0) {
        throw new Error(`Service record ${invoice.serviceRecord} was not found for payment synchronization`);
      }
    } catch (syncError) {
      console.error(`Failed to synchronize isPaid on ServiceRecord ${invoice.serviceRecord}:`, syncError.message);
      // Compensating rollback: Revert Invoice back to 'Pending' so documents do not silently diverge
      try {
        await Invoice.updateOne(
          { _id: invoice._id, paymentStatus: 'Paid' },
          {
            $set: { paymentStatus: 'Pending' },
            $unset: { paymentDate: 1 }
          }
        );
      } catch (rollbackErr) {
        console.error(`CRITICAL: Compensating rollback failed for Invoice ${invoice._id}:`, rollbackErr.message);
      }
      res.status(500);
      throw new Error('Payment processing failed during service record synchronization. Please try again.');
    }
  }

  const recipientUserId = invoice.user || ownerUserId;

  // Notification Hook for CUSTOMER
  if (recipientUserId) {
    await createNotification(
      recipientUserId,
      'Payment Processed',
      `Thank you! Payment for invoice #${invoice._id.toString().substring(0, 6)} securely tracked.`,
      'Info'
    );
  }

  // Asynchronously send Payment Successful Email (non-blocking)
  const customer = await User.findById(recipientUserId);
  const vehicleObj = await Vehicle.findById(invoice.vehicle);
  const vehicleName = vehicleObj ? `${vehicleObj.make} ${vehicleObj.model}` : 'Vehicle';

  if (customer) {
    sendEmail({
      to: customer.email,
      subject: `Payment Confirmed: Invoice #${invoice._id.toString().substring(0, 8).toUpperCase()} - AutoCare 🧾`,
      htmlContent: getPaymentSuccessfulTemplate(customer.name, {
        invoiceId: invoice._id.toString(),
        vehicleName,
        amountPaid: invoice.totalAmount || invoice.amount || 0,
        paymentDate: new Date(updatedInvoice.paymentDate).toLocaleDateString(),
      })
    });
  }

  // Notification Hook for SERVICE CENTER (Staff)
  const staff = await User.find({ role: 'ServiceCenter' });
  await Promise.all(staff.map(member => 
    createNotification(
      member._id,
      'Payment Received',
      `Invoice #${invoice._id.toString().substring(0, 6)} for ${vehicleName} has been settled.`,
      'Success'
    )
  ));

  console.log(`💰 PAYMENT RECEIVED for Invoice ${invoice._id}`);

  res.status(200).json(updatedInvoice);
});

export { createInvoice, getAllInvoices, getMyInvoices, markInvoiceAsPaid };
