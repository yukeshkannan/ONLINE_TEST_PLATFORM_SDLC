import express from 'express';
import { addQuestions, updateQuestion, deleteQuestion, syncQuestions } from '../controllers/questionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Guard all question routes with authorization and faculty roles
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'trainer'));

router.post('/add', addQuestions);
router.post('/sync/:testId', syncQuestions);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
