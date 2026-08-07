import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getCenters,
  createCenter,
  updateCenter,
  deleteCenter
} from '../controllers/cohortController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Read routes (authenticated students & admins)
router.use(authMiddleware);

router.get('/departments', getDepartments);
router.get('/batches', getBatches);
router.get('/centers', getCenters);

// Admin & Trainer mutations
router.post('/departments', roleMiddleware('admin', 'trainer'), createDepartment);
router.put('/departments/:id', roleMiddleware('admin', 'trainer'), updateDepartment);
router.delete('/departments/:id', roleMiddleware('admin', 'trainer'), deleteDepartment);

router.post('/batches', roleMiddleware('admin', 'trainer'), createBatch);
router.put('/batches/:id', roleMiddleware('admin', 'trainer'), updateBatch);
router.delete('/batches/:id', roleMiddleware('admin', 'trainer'), deleteBatch);

router.post('/centers', roleMiddleware('admin', 'trainer'), createCenter);
router.put('/centers/:id', roleMiddleware('admin', 'trainer'), updateCenter);
router.delete('/centers/:id', roleMiddleware('admin', 'trainer'), deleteCenter);

export default router;
