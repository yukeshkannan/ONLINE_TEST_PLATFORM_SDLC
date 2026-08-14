import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import ViolationLog from '../models/ViolationLog.js';
import { sendTokens, clearTokens } from '../utils/generateToken.js';
import { sendCredentialsEmail, sendOTPEmail } from '../utils/emailSender.js';
import { calculateAcademicYear } from '../utils/academicYearHelper.js';

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
  const { identifier, email, password, rememberMe, loginType, studentType } = req.body;
  const loginId = (identifier || email || '').trim();
  const portalType = loginType || studentType; // 'college' or 'institute'

  try {
    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please enter your login ID and password.' });
    }

    // Smart lookup: Match Email OR College Roll Number OR Institute Enrollment ID
    const student = await Student.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { rollNumber: loginId.toUpperCase() },
        { enrollmentId: loginId.toUpperCase() }
      ]
    });

    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials. Student account not found.' });
    }

    // Strict Portal Access Verification: Prevent College students from logging in via SDLC portal and vice-versa
    if (portalType) {
      const studentCat = student.studentType || 'college';
      if (portalType === 'institute' && studentCat === 'college') {
        return res.status(403).json({
          message: 'Access Denied: This is a College Student account. Please log in through the College Portal tab.'
        });
      }
      if (portalType === 'college' && studentCat === 'institute') {
        return res.status(403).json({
          message: 'Access Denied: This is an SDLC Institute account. Please log in through the SDLC Portal tab.'
        });
      }
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password or Roll Number does not match.' });
    }

    const { accessToken, user } = sendTokens(res, student, rememberMe);
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};


export const refreshToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];

  if (!token) {
    return res.status(401).json({ authenticated: false, message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Invalidate refresh token on fresh browser sessions if "Remember Me" was not checked
    const { freshSession } = req.body;
    if (freshSession && !decoded.rememberMe) {
      clearTokens(res);
      return res.status(401).json({ authenticated: false, message: 'Session expired (Remember Me was not checked)' });
    }
    
    let user;
    if (decoded.role === 'admin' || decoded.role === 'trainer') {
      // Both admins and trainers are stored in the Admin collection
      user = await Admin.findById(decoded.id);
    } else {
      user = await Student.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ authenticated: false, message: 'User not found' });
    }

    const { accessToken, user: userPayload } = sendTokens(res, user, decoded.rememberMe);
    res.status(200).json({ accessToken, user: userPayload });
  } catch (error) {
    // If token verification fails (e.g. expired or tampered), clear cookie
    clearTokens(res);
    return res.status(401).json({ authenticated: false, message: 'Refresh token expired or invalid' });
  }
};

export const logout = (req, res) => {
  clearTokens(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find({}, '-password')
      .sort({ name: 1 })
      .collation({ locale: 'en', strength: 2 });
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

const getDistrictCode = (centerName) => {
  const map = {
    'Karur': 'KRR',
    'Coimbatore': 'CBE',
    'Namakkal': 'NKL',
    'Dindigul': 'DGL'
  };
  return map[centerName] || (centerName ? centerName.substring(0, 3).toUpperCase() : 'KRR');
};

const formatDobDigits = (dobStr) => {
  if (!dobStr) return '';
  if (dobStr.includes('-') && dobStr.indexOf('-') === 4) {
    const parts = dobStr.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
    }
  }
  return dobStr.replace(/\D/g, '');
};

export const createStudent = async (req, res, next) => {
  const {
    name,
    studentType = 'college',
    rollNumber,
    enrollmentId,
    email,
    department,
    batch,
    year,
    courseTrack,
    batchTime,
    center = 'Karur',
    dob = ''
  } = req.body;

  try {
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required' });
    }

    const type = studentType === 'institute' ? 'institute' : 'college';
    const cleanEmail = email.trim().toLowerCase();

    let identifier = '';
    if (type === 'college') {
      if (!rollNumber || !department) {
        return res.status(400).json({ message: 'Roll Number and Department are required for college students' });
      }
      identifier = rollNumber.trim().toUpperCase();
    } else {
      if (!courseTrack || !courseTrack.trim() || courseTrack.trim() === 'General') {
        return res.status(400).json({ message: 'SDLC Course Track is required for Institute students' });
      }
      // Auto-generate Enrollment ID if not provided
      if (!enrollmentId || enrollmentId.trim() === '') {
        const distCode = getDistrictCode(center);
        const dobClean = formatDobDigits(dob);
        if (dobClean && dobClean.length === 8) {
          identifier = `SDLC-${distCode}-${dobClean}`;
        } else {
          const currentYear = new Date().getFullYear();
          const prefix = `SDLC-${distCode}-${currentYear}-`;

          const count = await Student.countDocuments({
            studentType: 'institute',
            $or: [
              { enrollmentId: new RegExp(`^(SDLC|INS)-${distCode}-`, 'i') },
              { center: center }
            ]
          });

          let nextSeq = count + 1;
          let generatedId = `${prefix}${String(nextSeq).padStart(4, '0')}`;

          while (await Student.findOne({ $or: [{ enrollmentId: generatedId }, { rollNumber: generatedId }] })) {
            nextSeq += 1;
            generatedId = `${prefix}${String(nextSeq).padStart(4, '0')}`;
          }
          identifier = generatedId;
        }
      } else {
        identifier = enrollmentId.trim().toUpperCase();
      }
    }

    // Check duplicate student
    const existingStudent = await Student.findOne({
      $or: [
        { email: cleanEmail },
        ...(type === 'college' && identifier ? [{ rollNumber: identifier }] : []),
        ...(type === 'institute' && identifier ? [{ enrollmentId: identifier }, { rollNumber: identifier }] : [])
      ]
    });

    if (existingStudent) {
      const isEmailDup = existingStudent.email.toLowerCase() === cleanEmail;
      const dupTypeStr = existingStudent.studentType === 'institute' ? 'SDLC Institute' : 'College';
      if (isEmailDup) {
        return res.status(400).json({ 
          message: `Email "${cleanEmail}" already exists for ${existingStudent.name} (${dupTypeStr} Portal).` 
        });
      }
      return res.status(400).json({ 
        message: `Roll Number / ID "${identifier}" already exists for ${existingStudent.name} (${dupTypeStr} Portal).` 
      });
    }

    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    if (existingAdmin) {
      return res.status(400).json({
        message: `Email "${cleanEmail}" is already in use by an Admin/Trainer account.`
      });
    }

    const defaultPassword = identifier;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const studentData = {
      name: name.trim(),
      email: cleanEmail,
      studentType: type,
      password: hashedPassword,
      center: center || 'Karur'
    };

    if (type === 'college') {
      studentData.rollNumber = identifier;
      studentData.department = department.trim();
      studentData.batch = batch ? batch.trim() : (year ? `${year} Batch` : 'General');
      studentData.year = year ? year.trim() : '1st Year';
      studentData.courseTrack = courseTrack ? courseTrack.trim() : '';
      studentData.dob = dob ? dob.trim() : '';
    } else {
      studentData.enrollmentId = identifier;
      studentData.rollNumber = identifier;
      studentData.courseTrack = (courseTrack || 'General').trim();
      studentData.batchTime = (batchTime || 'Standard Batch').trim();
      studentData.department = (courseTrack || 'Institute').trim();
      studentData.batch = (batchTime || 'Institute Batch').trim();
      studentData.year = 'Institute';
      studentData.dob = dob ? dob.trim() : '';
    }

    const student = await Student.create(studentData);

    res.status(201).json({
      message: `${type === 'college' ? 'College' : 'Institute'} student registered successfully`,
      student
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

    const existingStudents = await Student.find({}, 'rollNumber enrollmentId email');
    const existingRolls = new Set(existingStudents.map(s => s.rollNumber ? s.rollNumber.toUpperCase() : ''));
    const existingEnrollments = new Set(existingStudents.map(s => s.enrollmentId ? s.enrollmentId.toUpperCase() : ''));
    const existingEmails = new Set(existingStudents.map(s => s.email.toLowerCase()));

    const toInsert = [];
    const skipped = [];
    const salt = await bcrypt.genSalt(10);

    for (let i = 0; i < studentsArray.length; i++) {
      const item = studentsArray[i];
      const name = (item.name || '').trim();
      const email = (item.email || '').trim().toLowerCase();
      const type = item.studentType === 'institute' ? 'institute' : 'college';

      if (!name || !email) {
        skipped.push({ name, email, reason: 'Missing name or email' });
        continue;
      }

      if (existingEmails.has(email)) {
        skipped.push({ email, reason: 'Email already exists' });
        continue;
      }

      const center = item.center || 'Karur';

      let identifier = '';
      if (type === 'college') {
        identifier = (item.rollNumber || '').trim().toUpperCase();
        if (!identifier) {
          skipped.push({ name, email, reason: 'Missing roll number for college student' });
          continue;
        }
        if (existingRolls.has(identifier)) {
          skipped.push({ rollNumber: identifier, email, reason: 'Roll number already exists' });
          continue;
        }
      } else {
        identifier = (item.enrollmentId || item.rollNumber || '').trim().toUpperCase();
        if (!identifier) {
          const distCode = getDistrictCode(center);
          const dobClean = formatDobDigits(item.dob);
          if (dobClean && dobClean.length === 8) {
            identifier = `SDLC-${distCode}-${dobClean}`;
          } else {
            const currentYear = new Date().getFullYear();
            const prefix = `SDLC-${distCode}-${currentYear}-`;
            let seq = 1;
            while (existingEnrollments.has(`${prefix}${String(seq).padStart(4, '0')}`) || existingRolls.has(`${prefix}${String(seq).padStart(4, '0')}`)) {
              seq++;
            }
            identifier = `${prefix}${String(seq).padStart(4, '0')}`;
          }
        }

        // If duplicate SDLC ID exists due to same DOB or duplicate row, append sequence suffix
        if (existingEnrollments.has(identifier) || existingRolls.has(identifier)) {
          let dupSeq = 2;
          let newId = `${identifier}-${dupSeq}`;
          while (existingEnrollments.has(newId) || existingRolls.has(newId)) {
            dupSeq++;
            newId = `${identifier}-${dupSeq}`;
          }
          identifier = newId;
        }
      }

      const defaultPassword = identifier;
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const doc = {
        name,
        email,
        studentType: type,
        password: hashedPassword,
        center
      };

      if (type === 'college') {
        doc.rollNumber = identifier;
        doc.department = (item.department || 'CSE').trim();
        doc.batch = (item.batch || '2023-2027').trim();
        doc.year = (item.year || '3rd Year').trim();
        doc.courseTrack = (item.courseTrack || '').trim();
        existingRolls.add(identifier);
      } else {
        doc.enrollmentId = identifier;
        doc.rollNumber = identifier;
        doc.courseTrack = (item.courseTrack || 'Full Stack Web Dev').trim();
        doc.batchTime = (item.batchTime || 'Regular Batch').trim();
        doc.department = doc.courseTrack;
        doc.batch = doc.batchTime;
        doc.year = 'Institute';
        existingEnrollments.add(identifier);
        existingRolls.add(identifier);
      }

      existingEmails.add(email);
      toInsert.push(doc);
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
  const {
    name,
    studentType,
    rollNumber,
    enrollmentId,
    email,
    department,
    batch,
    year,
    courseTrack,
    batchTime,
    center,
    dob
  } = req.body;

  try {
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const type = studentType || student.studentType || 'college';
    const cleanEmail = email.trim().toLowerCase();

    let identifier = '';
    if (type === 'college') {
      identifier = (rollNumber || student.rollNumber || '').trim().toUpperCase();
    } else {
      const activeCenter = center || student.center || 'Karur';
      const activeDob = dob !== undefined ? dob : (student.dob || '');
      const dobClean = formatDobDigits(activeDob);

      if (dobClean && dobClean.length === 8 && (!enrollmentId || enrollmentId.trim() === '' || enrollmentId.startsWith('SDLC-'))) {
        const distCode = getDistrictCode(activeCenter);
        identifier = `SDLC-${distCode}-${dobClean}`;
      } else if (enrollmentId && enrollmentId.trim() !== '') {
        identifier = enrollmentId.trim().toUpperCase();
      } else {
        identifier = (student.enrollmentId || student.rollNumber || '').trim().toUpperCase();
      }
    }

    const existingStudent = await Student.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { email: cleanEmail },
        ...(type === 'college' && identifier ? [{ rollNumber: identifier }] : []),
        ...(type === 'institute' && identifier ? [{ enrollmentId: identifier }] : [])
      ]
    });

    if (existingStudent) {
      const isEmailDup = existingStudent.email.toLowerCase() === cleanEmail;
      const dupTypeStr = existingStudent.studentType === 'institute' ? 'SDLC Institute' : 'College';
      if (isEmailDup) {
        return res.status(400).json({ 
          message: `Email "${cleanEmail}" already exists for ${existingStudent.name} (${dupTypeStr} Portal).` 
        });
      }
      return res.status(400).json({ 
        message: `Roll Number / ID "${identifier}" already exists for ${existingStudent.name} (${dupTypeStr} Portal).` 
      });
    }

    student.name = name.trim();
    student.email = cleanEmail;
    student.studentType = type;
    if (dob !== undefined) student.dob = dob.trim();

    if (type === 'college') {
      const oldRoll = student.rollNumber;
      student.rollNumber = identifier;
      student.department = department ? department.trim() : student.department;
      student.batch = batch ? batch.trim() : student.batch;
      student.year = year ? year.trim() : student.year;
      student.courseTrack = courseTrack !== undefined ? courseTrack.trim() : student.courseTrack;

      if (oldRoll !== identifier) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(identifier, salt);
      }
    } else {
      if (!courseTrack || !courseTrack.trim() || courseTrack.trim() === 'General') {
        return res.status(400).json({ message: 'SDLC Course Track is required for Institute students' });
      }
      const oldEnroll = student.enrollmentId || student.rollNumber;
      student.center = center || student.center || 'Karur';
      student.enrollmentId = identifier;
      student.rollNumber = identifier;
      student.courseTrack = courseTrack.trim();
      student.batchTime = batchTime ? batchTime.trim() : (student.batchTime || 'Standard Batch');
      student.department = student.courseTrack;
      student.batch = student.batchTime;
      student.year = 'Institute';

      if (oldEnroll !== identifier) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(identifier, salt);
      }
    }

    await student.save();

    res.status(200).json({
      message: 'Student profile updated successfully',
      student
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
  const { name, email, department, courseTrack, categoryMode, role, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department ? department.trim() : 'N/A',
      courseTrack: courseTrack ? courseTrack.trim() : 'N/A',
      categoryMode: categoryMode === 'institute' ? 'institute' : 'college',
      role: role || 'trainer',
      password: hashedPassword
    });

    res.status(201).json({
      message: 'Staff account registered successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        department: admin.department,
        courseTrack: admin.courseTrack,
        categoryMode: admin.categoryMode,
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
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const passwordToSend = student.rollNumber || student.enrollmentId || 'Student123';
    await sendCredentialsEmail(student.email, student.name, passwordToSend);

    res.status(200).json({ success: true, message: `Login credentials dispatched to ${student.email}` });
  } catch (error) {
    console.error('Error dispatching credentials email:', error);
    res.status(500).json({
      message: error.message || 'Failed to send credentials email. Please verify Brevo API Key configuration.'
    });
  }
};

export const sendAllStudentsCredentials = async (req, res, next) => {
  try {
    const students = await Student.find({});
    if (students.length === 0) {
      return res.status(400).json({ message: 'No student records found in database.' });
    }

    let successCount = 0;
    let failureCount = 0;
    const failures = [];

    for (const student of students) {
      try {
        const passwordToSend = student.rollNumber || student.enrollmentId || 'Student123';
        await sendCredentialsEmail(student.email, student.name, passwordToSend);
        successCount++;
      } catch (err) {
        failureCount++;
        failures.push({ email: student.email, error: err.message });
      }
    }

    if (successCount === 0 && failureCount > 0) {
      return res.status(500).json({
        message: `Failed to dispatch emails: ${failures[0]?.error || 'Brevo API key or Sender configuration error.'}`,
        failures
      });
    }

    res.status(200).json({
      success: true,
      message: `Completed email dispatch. Sent: ${successCount}${failureCount > 0 ? `, Failed: ${failureCount}` : ''}`,
      successCount,
      failureCount,
      failures
    });
  } catch (error) {
    console.error('Error in sendAllStudentsCredentials:', error);
    res.status(500).json({
      message: error.message || 'Failed to dispatch credentials emails.'
    });
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

