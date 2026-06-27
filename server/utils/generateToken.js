import jwt from 'jsonwebtoken';

export const sendTokens = (res, user, rememberMe = false) => {
  const role = user.role || 'student';
  
  const accessToken = jwt.sign(
    { id: user._id, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role, rememberMe },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: rememberMe ? '7d' : '1d' }
  );

  // Configure cookie options
  const isProduction = process.env.NODE_ENV === 'production';
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
      rollNumber: user.rollNumber || undefined,
      department: user.department,
      batch: user.batch || undefined,
      year: user.year || undefined,
      role
    }
  };
};

export const clearTokens = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0)
  });
};
