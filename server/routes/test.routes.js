import express from 'express';
import { getTests, getTestById, createTest, updateTest, deleteTest, duplicateTest, getTestQuestions } from '../controllers/testController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Apply authentication to all test routes
router.use(authMiddleware);

router.get('/', getTests);
router.get('/:id', getTestById);
router.get('/:id/questions', getTestQuestions);

// Faculty (Admin & Trainer) routes
router.post('/create', roleMiddleware('admin', 'trainer'), createTest);
router.put('/:id', roleMiddleware('admin', 'trainer'), updateTest);
router.delete('/:id', roleMiddleware('admin', 'trainer'), deleteTest);
router.post('/:id/duplicate', roleMiddleware('admin', 'trainer'), duplicateTest);

export default router;
