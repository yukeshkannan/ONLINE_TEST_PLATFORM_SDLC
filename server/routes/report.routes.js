import express from 'express';
import { getDashboardStats, downloadExcelReport } from '../controllers/reportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// All reporting routes are for logged-in faculty only
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'trainer'));

router.get('/dashboard', getDashboardStats);
router.get('/excel/:testId', downloadExcelReport);

export default router;
