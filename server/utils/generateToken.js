import jwt from 'jsonwebtoken';

export const sendTokens = (res, user, rememberMe = false) => {
  const role = user.role || 'student';
  
  const accessToken = jwt.sign(
    { id: user._id, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role, rememberMe },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Configure cookie options
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER || process.env.COOKIE_SECURE === 'true';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  };

  if (rememberMe) {
    cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  }

  res.cookie('refreshToken', refreshToken, cookieOptions);

  return {
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email || undefined,
      studentType: user.studentType || (user.enrollmentId ? 'institute' : 'college'),
      portalType: user.studentType === 'institute' || user.enrollmentId ? 'sdlc' : 'college',
      rollNumber: user.rollNumber || undefined,
      enrollmentId: user.enrollmentId || undefined,
      department: user.department,
      batch: user.batch || undefined,
      year: user.year || undefined,
      courseTrack: user.courseTrack || undefined,
      center: user.center || undefined,
      batchTime: user.batchTime || undefined,
      role
    }
  };
};

export const clearTokens = (res) => {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER || process.env.COOKIE_SECURE === 'true';
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0)
  });
};
