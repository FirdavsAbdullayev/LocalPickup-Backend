const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('Not authenticated. Please log in.', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) return next(new AppError('User no longer exists.', 401));
  if (currentUser.status !== 'ACTIVE') return next(new AppError('Account is blocked. Contact support.', 403));

  req.user = currentUser;
  next();
});

// requireRole('VENDOR', 'SUPER_ADMIN')
exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

// Backward compat alias
exports.restrictTo = exports.requireRole;
