import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Appointment from '../models/appointmentModel.js';
import Vehicle from '../models/vehicleModel.js';
import User from '../models/userModel.js';
import { createNotification } from './notificationController.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getAppointmentSubmittedTemplate, getAppointmentApprovedTemplate } from '../utils/emailTemplates.js';

// @desc    Book new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = asyncHandler(async (req, res) => {
  const { vehicle, date, time, serviceType, notes } = req.body;

  if (!vehicle || !date || !time || !serviceType) {
    res.status(400);
    throw new Error('Please provide vehicle, date, time, and serviceType');
  }

  // Reject invalid vehicle ID format
  if (!mongoose.Types.ObjectId.isValid(vehicle)) {
    res.status(400);
    throw new Error('Invalid vehicle ID format');
  }

  const vehicleObj = await Vehicle.findById(vehicle);
  if (!vehicleObj) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  // Role-based authorization & ownership validation:
  // Customers can only book appointments for vehicles they own.
  if (req.user.role === 'Customer') {
    if (!vehicleObj.user || vehicleObj.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized: You can only book appointments for vehicles you own');
    }
  } else if (req.user.role !== 'Admin' && req.user.role !== 'ServiceCenter') {
    res.status(403);
    throw new Error('Not authorized to book appointments');
  }

  // Ensure vehicle has an associated owner
  if (!vehicleObj.user) {
    res.status(400);
    throw new Error('Vehicle record is missing an associated owner');
  }

  // Never trust a vehicle owner ID supplied by the client; bind appointment to verified DB owner
  const appointmentUserId = (req.user.role === 'Admin' || req.user.role === 'ServiceCenter')
    ? vehicleObj.user
    : req.user._id;

  const appointment = await Appointment.create({
    user: appointmentUserId,
    vehicle,
    date,
    time,
    serviceType,
    notes,
    status: 'Pending Approval', // Strictly Enforced
  });

  // Asynchronously send Appointment Submitted Email (non-blocking)
  const customer = await User.findById(appointmentUserId);
  const recipientEmail = customer ? customer.email : req.user.email;
  const recipientName = customer ? customer.name : req.user.name;
  const vehicleName = vehicleObj ? `${vehicleObj.make} ${vehicleObj.model}` : 'Vehicle';
  const licensePlate = vehicleObj ? vehicleObj.licensePlate : 'N/A';

  sendEmail({
    to: recipientEmail,
    subject: 'Service Appointment Received - AutoCare 📅',
    htmlContent: getAppointmentSubmittedTemplate(recipientName, {
      vehicleName,
      licensePlate,
      serviceType,
      date,
      time,
      notes,
    })
  });

  res.status(201).json(appointment);
});

// @desc    Approve an appointment
// @route   PUT /api/appointments/:id/approve
// @access  Private/ServiceCenter
const approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('vehicle');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found natively');
  }

  // VALIDATION: Only Pending Approval can be approved
  if (appointment.status !== 'Pending Approval') {
    res.status(400);
    throw new Error(`Cannot approve appointment in '${appointment.status}' state`);
  }

  appointment.status = 'Approved';
  await appointment.save();

  await createNotification(
    appointment.user,
    'Appointment Approved',
    `Your upcoming ${appointment.serviceType} service request has been formalized and approved.`,
    'Info'
  );

  // Asynchronously send Appointment Approved Email (non-blocking)
  const customer = await User.findById(appointment.user);
  if (customer) {
    const vehicleName = appointment.vehicle ? `${appointment.vehicle.make} ${appointment.vehicle.model}` : 'Vehicle';
    sendEmail({
      to: customer.email,
      subject: 'Service Appointment Approved! 🔧',
      htmlContent: getAppointmentApprovedTemplate(customer.name, {
        vehicleName,
        serviceType: appointment.serviceType,
        date: appointment.date,
        time: appointment.time,
      })
    });
  }

  res.status(200).json(appointment);
});

// @desc    Get logged in user's appointments
// @route   GET /api/appointments/myappointments
// @access  Private
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id }).populate('vehicle', 'make model licensePlate');
  res.status(200).json(appointments);
});

// @desc    Get all appointments (Admin/Staff)
// @route   GET /api/appointments
// @access  Private/Admin
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({}).populate('user', 'name email').populate('vehicle', 'make model');
  res.status(200).json(appointments);
});

// @desc    Reject an appointment
// @route   PUT /api/appointments/:id/reject
// @access  Private/ServiceCenter
const rejectAppointment = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // VALIDATION: Cannot reject after technician is assigned
  const allowedForRejection = ['Pending Approval', 'Approved'];
  if (!allowedForRejection.includes(appointment.status)) {
    res.status(400);
    throw new Error(`Rejection blocked: Appointment is already in '${appointment.status}' state`);
  }

  appointment.status = 'Rejected';
  appointment.rejectionReason = rejectionReason || 'No reason provided';
  appointment.rejectedAt = new Date();
  await appointment.save();

  await createNotification(
    appointment.user,
    'Appointment Rejected',
    `Your service request for ${appointment.serviceType} has been rejected. Reason: ${appointment.rejectionReason}`,
    'Alert'
  );

  res.status(200).json(appointment);
});

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // SECURITY: Only creator can cancel
  if (appointment.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to cancel this appointment');
  }

  // VALIDATION: Terminal state lock & restricted states
  // User can cancel until before the technician starts the repair
  const allowedStatuses = ['Pending Approval', 'Approved', 'Technician Assigned'];
  if (!allowedStatuses.includes(appointment.status)) {
    res.status(400);
    throw new Error(`Cancellation blocked: Repair has already started or appointment is in '${appointment.status}' status.`);
  }

  appointment.status = 'Cancelled';
  appointment.cancellationReason = cancellationReason || 'Cancelled by customer';
  appointment.cancelledAt = new Date();
  await appointment.save();

  // Notify Service Center (Admin/Staff)
  // We'll notify the first ServiceCenter user found to maintain model integrity
  try {
    const User = (await import('../models/userModel.js')).default;
    const staff = await User.findOne({ role: 'ServiceCenter' });
    if (staff) {
      await createNotification(
        staff._id,
        'Appointment Cancelled',
        `Customer cancelled appointment #${appointment._id.toString().slice(-6)}`,
        'Alert'
      );
    }
  } catch (err) {
    console.error('Failed to notify staff:', err.message);
  }

  res.status(200).json(appointment);
});

export { createAppointment, approveAppointment, getMyAppointments, getAppointments, rejectAppointment, cancelAppointment };
