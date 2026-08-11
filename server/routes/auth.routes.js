import express from 'express';
import { adminLogin, studentLogin, refreshToken, logout, getAllStudents, createStudent, deleteStudent, updateStudent, bulkCreateStudents, getAllAdmins, createAdmin, deleteAdmin, sendStudentCredentials, sendAllStudentsCredentials, adminForgotPassword, adminVerifyOTP, adminResetPassword } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

// Public auth routes (Protected with rate limiting against brute force attacks)
router.post('/admin/login', authLimiter, adminLogin);
router.post('/student/login', authLimiter, studentLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/admin/forgot-password', otpLimiter, adminForgotPassword);
router.post('/admin/verify-otp', otpLimiter, adminVerifyOTP);
router.post('/admin/reset-password', otpLimiter, adminResetPassword);

// Protected routes (Students CRUD for Admins & Trainers)
router.get('/students', authMiddleware, roleMiddleware('admin', 'trainer'), getAllStudents);
router.post('/students', authMiddleware, roleMiddleware('admin', 'trainer'), createStudent);
router.post('/students/bulk', authMiddleware, roleMiddleware('admin', 'trainer'), bulkCreateStudents);
router.put('/students/:id', authMiddleware, roleMiddleware('admin', 'trainer'), updateStudent);
router.delete('/students/:id', authMiddleware, roleMiddleware('admin', 'trainer'), deleteStudent);
router.post('/students/:id/send-credentials', authMiddleware, roleMiddleware('admin', 'trainer'), sendStudentCredentials);
router.post('/students/send-credentials/all', authMiddleware, roleMiddleware('admin', 'trainer'), sendAllStudentsCredentials);
router.post('/students/send-credentials-bulk', authMiddleware, roleMiddleware('admin', 'trainer'), sendAllStudentsCredentials);

// Protected admin routes (Admins/Trainers CRUD)
router.get('/admins', authMiddleware, roleMiddleware('admin'), getAllAdmins);
router.post('/admins', authMiddleware, roleMiddleware('admin'), createAdmin);
router.delete('/admins/:id', authMiddleware, roleMiddleware('admin'), deleteAdmin);

export default router;
