import dotenv from 'dotenv';
import { sendEmail } from './sendEmail.js';
import * as templates from './emailTemplates.js';

dotenv.config();

const runTest = async () => {
  const targetEmail = process.argv[2] || 'test@example.com';
  console.log(`\n🚀 AutoCare Transactional Email Flow Verification Script`);
  console.log(`=======================================================`);
  console.log(`Target Email: <${targetEmail}>`);
  console.log(`EMAIL_ENABLED: ${process.env.EMAIL_ENABLED}`);
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`\n(Pass a custom email as an argument to test: "node utils/testEmailFlow.js user@domain.com")\n`);

  try {
    // 1. Welcome Email
    console.log('Sending Welcome Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Welcome to AutoCare! 🚗',
      htmlContent: templates.getWelcomeTemplate('John Doe'),
    });

    // 2. Appointment Submitted
    console.log('Sending Appointment Submitted Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Service Appointment Received - AutoCare 📅',
      htmlContent: templates.getAppointmentSubmittedTemplate('John Doe', {
        vehicleName: '2022 Honda Civic',
        licensePlate: 'ABC-1234',
        serviceType: 'Brake Pad Replacement',
        date: '2026-06-25',
        time: '10:00 AM',
        notes: 'Brakes squeak when stopping on hills.',
      }),
    });

    // 3. Appointment Approved
    console.log('Sending Appointment Approved Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Service Appointment Approved! 🔧',
      htmlContent: templates.getAppointmentApprovedTemplate('John Doe', {
        vehicleName: '2022 Honda Civic',
        serviceType: 'Brake Pad Replacement',
        date: '2026-06-25',
        time: '10:00 AM',
      }),
    });

    // 4. Technician Assigned
    console.log('Sending Technician Assigned Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Technician Assigned to Your Vehicle - AutoCare 🛠️',
      htmlContent: templates.getTechnicianAssignedTemplate('John Doe', {
        vehicleName: '2022 Honda Civic',
        serviceType: 'Brake Pad Replacement',
        date: '2026-06-25',
        time: '10:00 AM',
        technicianName: 'Marcus Miller (Master Mechanic)',
      }),
    });

    // 5. Repair Completed
    console.log('Sending Repair Completed Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Repair Work Completed - AutoCare 🏁',
      htmlContent: templates.getRepairCompletedTemplate('John Doe', {
        vehicleName: '2022 Honda Civic',
        serviceType: 'Brake Pad Replacement',
        laborHours: 2.5,
      }),
    });

    // 6. Invoice Generated
    console.log('Sending Invoice Generated Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Invoice Ready: $295.00 - AutoCare 💳',
      htmlContent: templates.getInvoiceGeneratedTemplate('John Doe', {
        invoiceId: '507f1f77bcf86cd799439011',
        vehicleName: '2022 Honda Civic',
        laborHours: 2.5,
        partsUsed: [
          { name: 'Front Brake Pads Set', quantity: 1, price: 45.0 },
          { name: 'Brake Fluid Dot 4', quantity: 1, price: 15.0 },
        ],
        laborCost: 250.0,
        partsCost: 60.0,
        tax: 31.0,
        totalAmount: 341.0,
      }),
    });

    // 7. Payment Successful
    console.log('Sending Payment Successful Email...');
    await sendEmail({
      to: targetEmail,
      subject: 'Payment Confirmed: Invoice #507F1F77 - AutoCare 🧾',
      htmlContent: templates.getPaymentSuccessfulTemplate('John Doe', {
        invoiceId: '507f1f77bcf86cd799439011',
        vehicleName: '2022 Honda Civic',
        amountPaid: 341.0,
        paymentDate: new Date().toLocaleDateString(),
      }),
    });

    console.log(`\n=======================================================`);
    console.log(`🎉 All email templates processed and dispatched successfully!`);
  } catch (error) {
    console.error('❌ Verification run crashed:', error.message);
  }
};

runTest();
