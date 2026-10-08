const { User, Shop, Order, Product, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [
    totalUsers,
    totalShops,
    totalOrders,
    pendingOrders,
    pendingShops,
    usersThisMonth,
    usersPrevMonth,
    shopsThisMonth,
    shopsPrevMonth,
    ordersThisMonth,
    ordersPrevMonth,
  ] = await Promise.all([
    User.count(),
    Shop.count({ where: { isApproved: true } }),
    Order.count(),
    Order.count({ where: { status: 'PENDING' } }),
    Shop.count({ where: { isApproved: false } }),
    User.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
    User.count({ where: { createdAt: { [Op.gte]: prevMonthStart, [Op.lt]: monthStart } } }),
    Shop.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
    Shop.count({ where: { createdAt: { [Op.gte]: prevMonthStart, [Op.lt]: monthStart } } }),
    Order.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
    Order.count({ where: { createdAt: { [Op.gte]: prevMonthStart, [Op.lte]: prevMonthEnd } } }),
  ]);

  const gmv = await Order.sum('totalAmount', { where: { status: { [Op.ne]: 'CANCELLED' } } });
  const platformRevenue = await Order.sum('commissionAmount', { where: { status: { [Op.ne]: 'CANCELLED' } } });

  // MoM growth (%): joriy oy vs o'tgan oy
  const growthPct = (current, previous) =>
    previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

  const growth = {
    users: { current: usersThisMonth, previous: usersPrevMonth, growthPct: growthPct(usersThisMonth, usersPrevMonth) },
    shops: { current: shopsThisMonth, previous: shopsPrevMonth, growthPct: growthPct(shopsThisMonth, shopsPrevMonth) },
    orders: { current: ordersThisMonth, previous: ordersPrevMonth, growthPct: growthPct(ordersThisMonth, ordersPrevMonth) },
  };

  // Retention: kamida 2 ta buyurtma bergan mijozlar ulushi (qayta xaridor)
  const buyerCounts = await Order.findAll({
    attributes: ['customerId', [sequelize.fn('COUNT', sequelize.col('customerId')), 'cnt']],
    where: { status: { [Op.ne]: 'CANCELLED' } },
    group: ['customerId'],
    raw: true,
  });
  const totalBuyers = buyerCounts.length;
  const repeatBuyers = buyerCounts.filter((o) => Number(o.cnt) >= 2).length;

  const retention = {
    totalBuyers,
    repeatBuyers,
    repeatRate: totalBuyers ? Math.round((repeatBuyers / totalBuyers) * 100) : 0,
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers,
        totalShops,
        totalOrders,
        pendingOrders,
        pendingShops,
        gmv: gmv || 0,
        platformRevenue: platformRevenue || 0,
        growth,
        retention,
      },
    },
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

// ─── Monetizatsiya (Featured / SaaS plan) ───────────────────────────────────

// Toggle "Reklama" — isFeatured + featuredUntil (kun soni orqali)
exports.setShopFeatured = catchAsync(async (req, res, next) => {
  const { featured, days = 30 } = req.body;
  const shop = await Shop.findByPk(req.params.id);
  if (!shop) return next(new AppError('Shop not found.', 404));

  const isFeatured = Boolean(featured);
  const featuredUntil = isFeatured
    ? new Date(Date.now() + (Number(days) || 30) * 24 * 60 * 60 * 1000)
    : null;

  await shop.update({ isFeatured, featuredUntil });
  res.status(200).json({ status: 'success', data: { shop } });
});

// SaaS obuna planini o'zgartirish (FREE / PRO / PREMIUM)
exports.setShopPlan = catchAsync(async (req, res, next) => {
  const { plan } = req.body;
  if (!['FREE', 'PRO', 'PREMIUM'].includes(plan)) return next(new AppError('Invalid plan.', 400));

  const shop = await Shop.findByPk(req.params.id);
  if (!shop) return next(new AppError('Shop not found.', 404));

  await shop.update({ plan });
  res.status(200).json({ status: 'success', data: { shop } });
});

// Do'kon komissiya stavkasini o'zgartirish (0.02 = 2%)
exports.setShopCommission = catchAsync(async (req, res, next) => {
  const { commissionRate } = req.body;
  const rate = Number(commissionRate);
  if (!Number.isFinite(rate) || rate < 0 || rate > 0.25) {
    return next(new AppError('commissionRate 0 va 0.25 (25%) oralig\'ida bo\'lishi kerak.', 400));
  }

  const shop = await Shop.findByPk(req.params.id);
  if (!shop) return next(new AppError('Shop not found.', 404));

  await shop.update({ commissionRate: rate });
  res.status(200).json({ status: 'success', data: { shop } });
});
