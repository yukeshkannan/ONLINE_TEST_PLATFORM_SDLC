import express from 'express';
import { adminLogin, studentLogin, refreshToken, logout, getAllStudents, createStudent, deleteStudent, updateStudent, bulkCreateStudents, getAllAdmins, createAdmin, deleteAdmin, sendStudentCredentials, sendAllStudentsCredentials, adminForgotPassword, adminVerifyOTP, adminResetPassword } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public auth routes
router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/admin/forgot-password', adminForgotPassword);
router.post('/admin/verify-otp', adminVerifyOTP);
router.post('/admin/reset-password', adminResetPassword);

// Protected admin routes (Students CRUD)
router.get('/students', authMiddleware, roleMiddleware('admin'), getAllStudents);
router.post('/students', authMiddleware, roleMiddleware('admin'), createStudent);
router.post('/students/bulk', authMiddleware, roleMiddleware('admin'), bulkCreateStudents);
router.put('/students/:id', authMiddleware, roleMiddleware('admin'), updateStudent);
router.delete('/students/:id', authMiddleware, roleMiddleware('admin'), deleteStudent);
router.post('/students/:id/send-credentials', authMiddleware, roleMiddleware('admin'), sendStudentCredentials);
router.post('/students/send-credentials/all', authMiddleware, roleMiddleware('admin'), sendAllStudentsCredentials);

// Protected admin routes (Admins/Trainers CRUD)
router.get('/admins', authMiddleware, roleMiddleware('admin'), getAllAdmins);
router.post('/admins', authMiddleware, roleMiddleware('admin'), createAdmin);
router.delete('/admins/:id', authMiddleware, roleMiddleware('admin'), deleteAdmin);

export default router;
