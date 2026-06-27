import express from 'express';
import { submitTest, getResultsByTest, getResultsByStudent, getResultById, resetStudentAttempt, deleteResultById } from '../controllers/resultController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Guard all result routes with JWT authentication
router.use(authMiddleware);

router.post('/submit', roleMiddleware('student'), submitTest);
router.get('/test/:testId', roleMiddleware('admin', 'trainer'), getResultsByTest);
router.get('/student/:studentId', getResultsByStudent);
router.delete('/student/:studentId/test/:testId', roleMiddleware('admin', 'trainer'), resetStudentAttempt);
router.get('/:id', getResultById);
router.delete('/:id', roleMiddleware('admin', 'trainer'), deleteResultById);

export default router;
