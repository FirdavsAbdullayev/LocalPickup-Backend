const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '90d' });

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *               role: { type: string, enum: [CUSTOMER, VENDOR] }
 *     responses:
 *       201:
 *         description: User registered
 */
exports.register = catchAsync(async (req, res, next) => {
  const { fullName, email, password, phone, role } = req.body;
  if (!fullName || !email || !password) return next(new AppError('fullName, email and password are required.', 400));

  const existing = await User.findOne({ where: { email } });
  if (existing) return next(new AppError('Email already registered.', 409));

  const hashed = await bcrypt.hash(password, 12);
  const allowedRoles = ['CUSTOMER', 'VENDOR'];
  const userRole = allowedRoles.includes(role) ? role : 'CUSTOMER';

  const user = await User.create({ fullName, email, password: hashed, phone, role: userRole });
  const token = signToken(user.id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, status: user.status },
    },
  });
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Email and password are required.', 400));

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password.', 401));
  }
  if (user.status !== 'ACTIVE') return next(new AppError('Account is blocked.', 403));

  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, status: user.status },
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { fullName, phone } = req.body;
  await req.user.update({ fullName, phone });
  res.status(200).json({ status: 'success', data: { user: req.user } });
});
