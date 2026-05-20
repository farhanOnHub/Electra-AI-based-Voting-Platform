import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};
