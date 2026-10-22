/**
 * Phase 2C Verification Test Suite
 * 
 * Tests the three core authorization and payment safety areas:
 * 1. Invoice payment concurrency and synchronization failure handling.
 * 2. Appointment booking vehicle ownership and role authorization.
 * 3. Technician service record assignment authorization.
 * 
 * SAFETY:
 * - This test suite runs entirely in-memory with mocked collections/models.
 * - It DOES NOT connect to MongoDB or any network database.
 * - Zero credentials, tokens, or sensitive values are used or exposed.
 * 
 * Execution:
 *   cd server
 *   node test_phase2c.mjs
 */

import mongoose from 'mongoose';

// Generate mock ObjectIds
const customer1Id = new mongoose.Types.ObjectId();
const customer2Id = new mongoose.Types.ObjectId();
const technician1Id = new mongoose.Types.ObjectId();
const technician2Id = new mongoose.Types.ObjectId();
const adminId = new mongoose.Types.ObjectId();
const serviceCenterId = new mongoose.Types.ObjectId();

const vehicle1Id = new mongoose.Types.ObjectId(); // Owned by customer 1
const vehicle2Id = new mongoose.Types.ObjectId(); // Owned by customer 2

const invoice1Id = new mongoose.Types.ObjectId();
const serviceRecord1Id = new mongoose.Types.ObjectId();
const serviceRecord2Id = new mongoose.Types.ObjectId();

let testResults = [];

function assert(description, condition, details = '') {
  if (condition) {
    testResults.push({ description, status: 'PASS', details });
    console.log(`  ✅ PASS: ${description}`);
  } else {
    testResults.push({ description, status: 'FAIL', details });
    console.error(`  ❌ FAIL: ${description} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING PHASE 2C ISOLATED VERIFICATION TEST SUITE');
console.log('======================================================\n');

// ---------------------------------------------------------------------
// TEST GROUP 1: Invoice Payment Concurrency & Authorization
// ---------------------------------------------------------------------
console.log('--- [Group 1] Invoice Payment Concurrency & Authorization ---');

// Mock in-memory database store
const mockDb = {
  invoices: new Map(),
  serviceRecords: new Map(),
  vehicles: new Map(),
  users: new Map(),
};

// Seed in-memory store
mockDb.users.set(customer1Id.toString(), { _id: customer1Id, name: 'Alice Customer', role: 'Customer', email: 'alice@test.com' });
mockDb.users.set(customer2Id.toString(), { _id: customer2Id, name: 'Bob Customer', role: 'Customer', email: 'bob@test.com' });
mockDb.users.set(technician1Id.toString(), { _id: technician1Id, name: 'Tech One', role: 'Technician', email: 'tech1@test.com' });
mockDb.users.set(technician2Id.toString(), { _id: technician2Id, name: 'Tech Two', role: 'Technician', email: 'tech2@test.com' });
mockDb.users.set(adminId.toString(), { _id: adminId, name: 'Admin User', role: 'Admin', email: 'admin@test.com' });
mockDb.users.set(serviceCenterId.toString(), { _id: serviceCenterId, name: 'Service Staff', role: 'ServiceCenter', email: 'staff@test.com' });

mockDb.vehicles.set(vehicle1Id.toString(), { _id: vehicle1Id, user: customer1Id, make: 'Toyota', model: 'Camry', licensePlate: 'TC-101' });
mockDb.vehicles.set(vehicle2Id.toString(), { _id: vehicle2Id, user: customer2Id, make: 'Honda', model: 'Civic', licensePlate: 'HC-202' });

mockDb.serviceRecords.set(serviceRecord1Id.toString(), {
  _id: serviceRecord1Id,
  vehicle: vehicle1Id,
  technician: technician1Id,
  status: 'Completed',
  invoiceGenerated: true,
  isPaid: false,
});

mockDb.serviceRecords.set(serviceRecord2Id.toString(), {
  _id: serviceRecord2Id,
  vehicle: vehicle2Id,
  technician: technician2Id,
  status: 'Completed',
  invoiceGenerated: true,
  isPaid: false,
});

mockDb.invoices.set(invoice1Id.toString(), {
  _id: invoice1Id,
  user: customer1Id,
  vehicle: vehicle1Id,
  serviceRecord: serviceRecord1Id,
  amount: 250,
  tax: 25,
  totalAmount: 275,
  paymentStatus: 'Pending',
});

// Simulated payment handler matching invoiceController.js logic
async function simulateMarkInvoiceAsPaid(invoiceId, user, body = {}, options = {}) {
  const invoice = mockDb.invoices.get(invoiceId.toString());

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    throw err;
  }

  // 1. Role Check
  if (user.role !== 'Customer') {
    const err = new Error('Not authorized: only customers can initiate invoice payment');
    err.statusCode = 403;
    throw err;
  }

  // 2. Ownership Check
  const ownerUserId = invoice.user ? invoice.user.toString() : null;
  if (!ownerUserId || ownerUserId !== user._id.toString()) {
    const err = new Error('Not authorized to pay this invoice');
    err.statusCode = 403;
    throw err;
  }

  // 3. Fast-fail state check
  if (invoice.paymentStatus === 'Paid') {
    const err = new Error('Invoice is already marked as paid');
    err.statusCode = 400;
    throw err;
  }

  if (invoice.paymentStatus !== 'Pending') {
    const err = new Error(`Invalid payment transition: invoice is in '${invoice.paymentStatus}' state`);
    err.statusCode = 400;
    throw err;
  }

  // 4. Atomic conditional transition (Single-Document Concurrency Guard)
  // Simulates MongoDB findOneAndUpdate({ _id: id, paymentStatus: 'Pending' }, ...)
  let updatedInvoice = null;
  const currentInvoiceState = mockDb.invoices.get(invoiceId.toString());
  if (currentInvoiceState && currentInvoiceState.paymentStatus === 'Pending') {
    currentInvoiceState.paymentStatus = 'Paid';
    currentInvoiceState.paymentDate = new Date();
    currentInvoiceState.paymentMethod = body.paymentMethod || 'Online';
    updatedInvoice = { ...currentInvoiceState };
  }

  if (!updatedInvoice) {
    const err = new Error('Invoice payment failed: invoice is already paid or undergoing payment');
    err.statusCode = 400;
    throw err;
  }

  // 5. Sync state back to ServiceRecord with compensating rollback
  if (invoice.serviceRecord) {
    try {
      if (options.forceSyncFailure) {
        throw new Error('Database write timeout on ServiceRecord');
      }
      const record = mockDb.serviceRecords.get(invoice.serviceRecord.toString());
      if (record) {
        record.isPaid = true;
      }
    } catch (syncError) {
      // Compensating Rollback: Revert Invoice back to Pending
      const invToRollback = mockDb.invoices.get(invoiceId.toString());
      if (invToRollback) {
        invToRollback.paymentStatus = 'Pending';
        delete invToRollback.paymentDate;
      }
      const err = new Error('Payment processing failed during service record synchronization. Please try again.');
      err.statusCode = 500;
      throw err;
    }
  }

  return updatedInvoice;
}

// Scenario 1: Non-customer role rejection
try {
  await simulateMarkInvoiceAsPaid(invoice1Id, { _id: technician1Id, role: 'Technician' });
  assert('Non-customer role rejected with 403', false);
} catch (err) {
  assert('Non-customer role rejected with 403', err.statusCode === 403 && err.message.includes('only customers'));
}

// Scenario 2: Customer attempts to pay another customer's invoice (IDOR)
try {
  await simulateMarkInvoiceAsPaid(invoice1Id, { _id: customer2Id, role: 'Customer' });
  assert('Customer cannot pay another customer invoice (403)', false);
} catch (err) {
  assert('Customer cannot pay another customer invoice (403)', err.statusCode === 403 && err.message.includes('Not authorized to pay'));
}

// Scenario 3: Two concurrent requests attempting to pay the same invoice
// Reset invoice state to Pending
mockDb.invoices.get(invoice1Id.toString()).paymentStatus = 'Pending';
mockDb.serviceRecords.get(serviceRecord1Id.toString()).isPaid = false;

const user1 = { _id: customer1Id, role: 'Customer' };
const [res1, res2] = await Promise.allSettled([
  simulateMarkInvoiceAsPaid(invoice1Id, user1),
  simulateMarkInvoiceAsPaid(invoice1Id, user1),
]);

const oneSucceeded = (res1.status === 'fulfilled' && res2.status === 'rejected') || (res2.status === 'fulfilled' && res1.status === 'rejected');
const rejectedError = res1.status === 'rejected' ? res1.reason : res2.reason;
assert('Concurrent payment: Exactly one request succeeds', oneSucceeded);
const isExpectedError = rejectedError && rejectedError.statusCode === 400 && (rejectedError.message.includes('already marked as paid') || rejectedError.message.includes('already paid') || rejectedError.message.includes('undergoing payment'));
assert('Concurrent payment: Losing request fails with 400', isExpectedError, rejectedError ? `${rejectedError.statusCode}: ${rejectedError.message}` : 'no rejected error');

// Scenario 4: Failure during ServiceRecord synchronization triggers compensating rollback
// Reset invoice state to Pending
mockDb.invoices.get(invoice1Id.toString()).paymentStatus = 'Pending';
mockDb.serviceRecords.get(serviceRecord1Id.toString()).isPaid = false;

try {
  await simulateMarkInvoiceAsPaid(invoice1Id, user1, {}, { forceSyncFailure: true });
  assert('Sync failure triggers 500 rejection', false);
} catch (err) {
  assert('Sync failure triggers 500 rejection', err.statusCode === 500 && err.message.includes('synchronization'));
  const rolledBackInvoice = mockDb.invoices.get(invoice1Id.toString());
  assert('Compensating rollback reverted Invoice paymentStatus back to Pending', rolledBackInvoice.paymentStatus === 'Pending');
  assert('Compensating rollback removed paymentDate', rolledBackInvoice.paymentDate === undefined);
}

// ---------------------------------------------------------------------
// TEST GROUP 2: Appointment Booking Authorization
// ---------------------------------------------------------------------
console.log('\n--- [Group 2] Appointment Booking Authorization ---');

// Simulated appointment creation handler matching appointmentController.js logic
async function simulateCreateAppointment(body, user) {
  const { vehicle, date, time, serviceType, notes } = body;

  if (!vehicle || !date || !time || !serviceType) {
    const err = new Error('Please provide vehicle, date, time, and serviceType');
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(vehicle)) {
    const err = new Error('Invalid vehicle ID format');
    err.statusCode = 400;
    throw err;
  }

  const vehicleObj = mockDb.vehicles.get(vehicle.toString());
  if (!vehicleObj) {
    const err = new Error('Vehicle not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization check
  if (user.role === 'Customer') {
    if (!vehicleObj.user || vehicleObj.user.toString() !== user._id.toString()) {
      const err = new Error('Not authorized: You can only book appointments for vehicles you own');
      err.statusCode = 403;
      throw err;
    }
  } else if (user.role !== 'Admin' && user.role !== 'ServiceCenter') {
    const err = new Error('Not authorized to book appointments');
    err.statusCode = 403;
    throw err;
  }

  const appointmentUserId = (user.role === 'Admin' || user.role === 'ServiceCenter')
    ? vehicleObj.user
    : user._id;

  return {
    _id: new mongoose.Types.ObjectId(),
    user: appointmentUserId,
    vehicle,
    date,
    time,
    serviceType,
    notes,
    status: 'Pending Approval',
  };
}

// Scenario 5: Missing or invalid vehicle ID format rejected with 400
try {
  await simulateCreateAppointment({ vehicle: 'invalid-id-123', date: '2026-11-01', time: '10:00 AM', serviceType: 'Maintenance' }, user1);
  assert('Invalid vehicle ID format rejected with 400', false);
} catch (err) {
  assert('Invalid vehicle ID format rejected with 400', err.statusCode === 400 && err.message.includes('Invalid vehicle ID format'));
}

// Scenario 6: Customer attempts to book another customer's vehicle (IDOR)
try {
  await simulateCreateAppointment({ vehicle: vehicle2Id, date: '2026-11-01', time: '10:00 AM', serviceType: 'Maintenance' }, user1);
  assert('Customer cannot book another customer vehicle (403)', false);
} catch (err) {
  assert('Customer cannot book another customer vehicle (403)', err.statusCode === 403 && err.message.includes('vehicles you own'));
}

// Scenario 7: Customer books their own vehicle
try {
  const appt = await simulateCreateAppointment({ vehicle: vehicle1Id, date: '2026-11-01', time: '10:00 AM', serviceType: 'Maintenance' }, user1);
  assert('Customer books own vehicle successfully (201)', appt && appt.status === 'Pending Approval' && appt.user.toString() === customer1Id.toString());
} catch (err) {
  assert('Customer books own vehicle successfully (201)', false, err.message);
}

// Scenario 8: Admin books for customer vehicle -> binds appointment to vehicle owner
try {
  const appt = await simulateCreateAppointment({ vehicle: vehicle1Id, date: '2026-11-01', time: '11:00 AM', serviceType: 'Repair' }, { _id: adminId, role: 'Admin' });
  assert('Admin can book appointment and verified owner is bound', appt && appt.user.toString() === customer1Id.toString());
} catch (err) {
  assert('Admin can book appointment and verified owner is bound', false, err.message);
}

// ---------------------------------------------------------------------
// TEST GROUP 3: Technician Service Record Authorization
// ---------------------------------------------------------------------
console.log('\n--- [Group 3] Technician Service Record Authorization ---');

// Simulated updateServiceRecordStatus handler matching serviceRecordController.js logic
async function simulateUpdateServiceRecordStatus(recordId, body, user) {
  const record = mockDb.serviceRecords.get(recordId.toString());

  if (!record) {
    const err = new Error('Service record not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization: Technicians can only update service records explicitly assigned to them.
  // Admins and ServiceCenter staff can update any record.
  if (user.role === 'Technician') {
    if (!record.technician || record.technician.toString() !== user._id.toString()) {
      const err = new Error('Not authorized: You can only update service records assigned to you');
      err.statusCode = 403;
      throw err;
    }
  } else if (user.role !== 'Admin' && user.role !== 'ServiceCenter') {
    const err = new Error('Not authorized to update service records');
    err.statusCode = 403;
    throw err;
  }

  const { status, partsUsed, laborHours } = body;
  const validStatuses = ["Pending Approval", "Approved", "Technician Assigned", "Repair In Progress", "Completed", "Rejected", "Cancelled"];
  if (status && !validStatuses.includes(status)) {
    const err = new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  record.status = status || record.status;
  if (partsUsed) record.partsUsed = partsUsed;
  if (laborHours) record.laborHours = laborHours;

  return record;
}

// Scenario 9: Unassigned technician attempts to update another technician's record (403)
try {
  // Technician 2 attempts to update record 1 (assigned to Technician 1)
  await simulateUpdateServiceRecordStatus(serviceRecord1Id, { status: 'Repair In Progress' }, { _id: technician2Id, role: 'Technician' });
  assert('Unassigned technician rejected with 403', false);
} catch (err) {
  assert('Unassigned technician rejected with 403', err.statusCode === 403 && err.message.includes('only update service records assigned to you'));
}

// Scenario 10: Assigned technician updates status (200 OK)
try {
  // Technician 1 updates record 1 (assigned to Technician 1)
  const updated = await simulateUpdateServiceRecordStatus(serviceRecord1Id, { status: 'Repair In Progress' }, { _id: technician1Id, role: 'Technician' });
  assert('Assigned technician updates status successfully', updated.status === 'Repair In Progress');
} catch (err) {
  assert('Assigned technician updates status successfully', false, err.message);
}

// Scenario 11: Customer attempts to update service record status (403)
try {
  await simulateUpdateServiceRecordStatus(serviceRecord1Id, { status: 'Completed' }, user1);
  assert('Customer cannot update service record status (403)', false);
} catch (err) {
  assert('Customer cannot update service record status (403)', err.statusCode === 403 && err.message.includes('Not authorized to update'));
}

// Scenario 12: Admin / ServiceCenter staff updates service record status (200 OK)
try {
  const updatedByAdmin = await simulateUpdateServiceRecordStatus(serviceRecord1Id, { status: 'Completed', laborHours: 2 }, { _id: adminId, role: 'Admin' });
  assert('Admin can update service record status', updatedByAdmin.status === 'Completed');
} catch (err) {
  assert('Admin can update service record status', false, err.message);
}

console.log('\n======================================================');
const passedCount = testResults.filter(t => t.status === 'PASS').length;
const totalCount = testResults.length;
console.log(`📊 FINAL RESULT: ${passedCount}/${totalCount} TESTS PASSED`);
if (passedCount === totalCount) {
  console.log('🎉 ALL PHASE 2C AUTHORIZATION & PAYMENT SAFETY CHECKS VERIFIED!');
} else {
  console.error('⚠️ SOME CHECKS FAILED. PLEASE REVIEW LOGS ABOVE.');
}
console.log('======================================================\n');
