import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token)
    return res
      .status(401)
      .json({ message: 'Access Denied. No Token Provided.' });
  try {
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (error, decode) => {
        if (error) {
          reject(error);
        } else {
          resolve(decode);
        }
      });
    });
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'invalid or expired token',
      error: error.message,
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient Permissions' });
    }
    next();
  };
};
