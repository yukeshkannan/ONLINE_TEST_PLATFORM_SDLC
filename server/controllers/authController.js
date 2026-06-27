import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import ViolationLog from '../models/ViolationLog.js';
import { sendTokens, clearTokens } from '../utils/generateToken.js';
import { sendCredentialsEmail, sendOTPEmail } from '../utils/emailSender.js';

export const adminLogin = async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, user } = sendTokens(res, admin, rememberMe);
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const studentLogin = async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, user } = sendTokens(res, student, rememberMe);
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(200).json({ authenticated: false, message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Invalidate refresh token on fresh browser sessions if "Remember Me" was not checked
    const { freshSession } = req.body;
    if (freshSession && !decoded.rememberMe) {
      clearTokens(res);
      return res.status(200).json({ authenticated: false, message: 'Session expired (Remember Me was not checked)' });
    }
    
    let user;
    if (decoded.role === 'admin' || decoded.role === 'trainer') {
      // Both admins and trainers are stored in the Admin collection
      user = await Admin.findById(decoded.id);
    } else {
      user = await Student.findById(decoded.id);
    }

    if (!user) {
      return res.status(200).json({ authenticated: false, message: 'User not found' });
    }

    const { accessToken, user: userPayload } = sendTokens(res, user, decoded.rememberMe);
    res.status(200).json({ accessToken, user: userPayload });
  } catch (error) {
    // If token verification fails (e.g. expired or tampered), clear cookie
    clearTokens(res);
    return res.status(200).json({ authenticated: false, message: 'Refresh token expired or invalid' });
  }
};

export const logout = (req, res) => {
  clearTokens(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find({}, '-password')
      .sort({ rollNumber: 1 });
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  const { name, rollNumber, email, department, batch, year } = req.body;

  try {
    if (!name || !rollNumber || !email || !department || !batch || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingStudent = await Student.findOne({
      $or: [
        { rollNumber: rollNumber.toUpperCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingStudent) {
      if (existingStudent.rollNumber === rollNumber.toUpperCase()) {
        return res.status(400).json({ message: 'Student with this roll number already exists' });
      }
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const defaultPassword = rollNumber.trim().toUpperCase();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const student = await Student.create({
      name,
      rollNumber: rollNumber.toUpperCase(),
      email: email.toLowerCase(),
      department,
      batch,
      year,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.department,
        batch: student.batch,
        year: student.year
      }
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateStudents = async (req, res, next) => {
  const studentsArray = req.body;

  try {
    if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
      return res.status(400).json({ message: 'Payload must be a non-empty array of students' });
    }

    for (let i = 0; i < studentsArray.length; i++) {
      const { name, rollNumber, email, department, batch, year } = studentsArray[i];
      if (!name || !rollNumber || !email || !department || !batch || !year) {
        return res.status(400).json({ message: `Student record at index ${i + 1} is missing required fields.` });
      }
    }

    const existingStudents = await Student.find({}, 'rollNumber email');
    const existingRolls = new Set(existingStudents.map(s => s.rollNumber ? s.rollNumber.toUpperCase() : ''));
    const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()));

    const toInsert = [];
    const skipped = [];
    const salt = await bcrypt.genSalt(10);

    for (const item of studentsArray) {
      const roll = item.rollNumber.trim().toUpperCase();
      const email = item.email.trim().toLowerCase();

      if (existingRolls.has(roll) || existingEmails.has(email)) {
        skipped.push({
          rollNumber: roll,
          email,
          reason: existingRolls.has(roll) ? 'Roll number already exists' : 'Email already exists'
        });
        continue;
      }

      const defaultPassword = roll;
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      toInsert.push({
        name: item.name.trim(),
        rollNumber: roll,
        email,
        department: item.department.trim(),
        batch: item.batch.trim(),
        year: item.year.trim(),
        password: hashedPassword
      });

      existingRolls.add(roll);
      existingEmails.add(email);
    }

    if (toInsert.length > 0) {
      await Student.insertMany(toInsert);
    }

    res.status(201).json({
      message: `Successfully registered ${toInsert.length} students.`,
      insertedCount: toInsert.length,
      skippedCount: skipped.length,
      skipped
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.id);

    // Cascade delete associated results and proctoring logs
    await Result.deleteMany({ studentId: req.params.id });
    await ViolationLog.deleteMany({ studentId: req.params.id });

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  const { name, rollNumber, email, department, batch, year } = req.body;

  try {
    if (!name || !rollNumber || !email || !department || !batch || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingStudent = await Student.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { rollNumber: rollNumber.toUpperCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingStudent) {
      if (existingStudent.rollNumber === rollNumber.toUpperCase()) {
        return res.status(400).json({ message: 'Student with this roll number already exists' });
      }
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.name = name.trim();
    student.email = email.trim().toLowerCase();
    student.department = department;
    student.batch = batch.trim();
    student.year = year;

    // If roll number changes, re-hash default password
    if (student.rollNumber !== rollNumber.trim().toUpperCase()) {
      student.rollNumber = rollNumber.trim().toUpperCase();
      const defaultPassword = student.rollNumber;
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(defaultPassword, salt);
    }

    await student.save();

    res.status(200).json({
      message: 'Student updated successfully',
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.department,
        batch: student.batch,
        year: student.year
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (req, res, next) => {
  try {
    const currentAdminId = req.user ? req.user.id : null;
    const query = currentAdminId ? { _id: { $ne: currentAdminId } } : {};
    const admins = await Admin.find(query, '-password').sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  const { name, email, department, role, password } = req.body;

  try {
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      department: department || 'N/A',
      role,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        department: admin.department,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user && req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own administrator account' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const sendStudentCredentials = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await sendCredentialsEmail(student.email, student.name, student.rollNumber);

    res.status(200).json({ success: true, message: `Credentials sent successfully to ${student.email}` });
  } catch (error) {
    next(error);
  }
};

export const sendAllStudentsCredentials = async (req, res, next) => {
  try {
    const students = await Student.find({});
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found in the database.' });
    }

    let successCount = 0;
    let failureCount = 0;
    const failures = [];

    for (const student of students) {
      try {
        await sendCredentialsEmail(student.email, student.name, student.rollNumber);
        successCount++;
      } catch (err) {
        failureCount++;
        failures.push({ email: student.email, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Completed sending emails. Sent: ${successCount}, Failed: ${failureCount}`,
      successCount,
      failureCount,
      failures
    });
  } catch (error) {
    next(error);
  }
};

export const adminForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ message: 'No administrator account found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.resetOTP = otp;
    admin.resetOTPExpires = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    await sendOTPEmail(admin.email, admin.name, otp);

    res.status(200).json({ success: true, message: `OTP code sent to ${admin.email}` });
  } catch (error) {
    next(error);
  }
};

export const adminVerifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and verification OTP.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!admin.resetOTP || admin.resetOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (new Date() > admin.resetOTPExpires) {
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const adminResetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please fill in all details.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!admin.resetOTP || admin.resetOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code session.' });
    }

    if (new Date() > admin.resetOTPExpires) {
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    
    admin.resetOTP = null;
    admin.resetOTPExpires = null;
    await admin.save();

    res.status(200).json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    next(error);
  }
};

