const { User, Shop, Order, Product } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const [totalUsers, totalShops, totalOrders, pendingOrders, pendingShops] = await Promise.all([
    User.count(),
    Shop.count({ where: { isApproved: true } }),
    Order.count(),
    Order.count({ where: { status: 'PENDING' } }),
    Shop.count({ where: { isApproved: false } }),
  ]);
  const gmv = await Order.sum('totalAmount', { where: { status: { [Op.ne]: 'CANCELLED' } } });
  res.status(200).json({
    status: 'success',
    data: { stats: { totalUsers, totalShops, totalOrders, pendingOrders, pendingShops, gmv: gmv || 0 } },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['ACTIVE', 'BLOCKED'].includes(status)) return next(new AppError('Invalid status.', 400));
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  await user.update({ status });
  res.status(200).json({ status: 'success', data: { user } });
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!['SUPER_ADMIN', 'VENDOR', 'CUSTOMER'].includes(role)) return next(new AppError('Invalid role.', 400));
  const user = await User.findByPk(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));
  await user.update({ role });
  res.status(200).json({ status: 'success', data: { user } });
});

exports.getAllShopsAdmin = catchAsync(async (req, res, next) => {
  const shops = await Shop.findAll({
    include: [{ model: User, as: 'owner', attributes: ['id', 'fullName', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', results: shops.length, data: { shops } });
});

exports.approveShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findByPk(req.params.id);
  if (!shop) return next(new AppError('Shop not found.', 404));
  await shop.update({ isApproved: true });
  res.status(200).json({ status: 'success', data: { shop } });
});

exports.rejectShop = catchAsync(async (req, res, next) => {
  const shop = await Shop.findByPk(req.params.id);
  if (!shop) return next(new AppError('Shop not found.', 404));
  await shop.destroy();
  res.status(204).json({ status: 'success', data: null });
});
