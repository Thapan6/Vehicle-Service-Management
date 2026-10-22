import express from 'express';
import {
  createServiceRecord,
  updateServiceRecordStatus,
  getMyTasks,
  getServiceRecords,
  deleteServiceRecord,
  getMyServiceRecords,
} from '../controllers/serviceRecordController.js';
import { protect, serviceCenter, technician, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, serviceCenter, createServiceRecord).get(protect, serviceCenter, getServiceRecords);
router.route('/myservices').get(protect, getMyServiceRecords);
router.route('/myjobs').get(protect, technician, getMyTasks);
// Route-level role gate: Allow Technician, ServiceCenter, and Admin roles (record-level assignment is verified in controller)
const canUpdateStatus = (req, res, next) => {
  if (req.user && ['Technician', 'ServiceCenter', 'Admin'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized to update service record status' });
};

router.route('/:id').delete(protect, admin, deleteServiceRecord);
router.route('/:id/status').put(protect, canUpdateStatus, updateServiceRecordStatus);

export default router;
