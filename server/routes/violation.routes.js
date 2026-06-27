import express from 'express';
import {
  logViolation,
  markAutoSubmitted,
  getAllViolations,
  getViolationsByTest
} from '../controllers/violationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Student routes — log violations during exam
router.post('/log', authMiddleware, logViolation);
router.patch('/auto-submit', authMiddleware, markAutoSubmitted);

// Admin/Trainer routes — view proctoring feed
router.get('/', authMiddleware, roleMiddleware('admin', 'trainer'), getAllViolations);
router.get('/test/:testId', authMiddleware, roleMiddleware('admin', 'trainer'), getViolationsByTest);

export default router;
