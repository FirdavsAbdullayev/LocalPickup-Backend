const { Reservation, ReservationItem, Shop, Product, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Customer: Yangi band qilish yaratish
exports.createReservation = catchAsync(async (req, res, next) => {
  const { shop_id, items, pickup_time } = req.body;

  if (!items || items.length === 0) {
    return next(new AppError("Savat bo'sh, mahsulot tanlang!", 400));
  }

  // Jami summani hisoblash
  let total_amount = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findOne({ where: { id: item.product_id, shop_id, isAvailable: true } });
    if (!product) {
      return next(new AppError(`Mahsulot (${item.product_id}) topilmadi yoki mavjud emas`, 404));
    }
    const unit_price = product.discount_price || product.price;
    total_amount += Number(unit_price) * item.quantity;
    validatedItems.push({ product_id: product.id, quantity: item.quantity, unit_price });
  }

  // Rezervatsiya yaratish
  const reservation = await Reservation.create({
    customer_id: req.user.id,
    shop_id,
    pickup_time: pickup_time || new Date(Date.now() + 3600000), // 1 soat default
    total_amount,
    status: 'pending'
  });

  // Rezervatsiya buyumlari yaratish
  for (const item of validatedItems) {
    await ReservationItem.create({
      reservation_id: reservation.id,
      ...item
    });
  }

  // To'liq ma'lumot bilan qaytarish
  const fullReservation = await Reservation.findByPk(reservation.id, {
    include: [
      { model: ReservationItem, as: 'items', include: [{ model: Product }] },
      { model: Shop },
      { model: User, as: 'customer', attributes: ['name', 'email', 'phone'] }
    ]
  });

  res.status(201).json({
    status: 'success',
    data: { reservation: fullReservation }
  });
});

// Customer: O'zining bandlarini ko'rish
exports.getMyReservations = catchAsync(async (req, res, next) => {
  const reservations = await Reservation.findAll({
    where: { customer_id: req.user.id },
    include: [
      { model: ReservationItem, as: 'items', include: [{ model: Product }] },
      { model: Shop }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: reservations.length,
    data: { reservations }
  });
});

// Shop Owner: O'z do'koniga kelgan bandlarni ko'rish
exports.getShopReservations = catchAsync(async (req, res, next) => {
  const { shopId } = req.params;

  // Faqat o'z do'koni
  const shop = await Shop.findOne({ where: { id: shopId, owner_id: req.user.id } });
  if (!shop && req.user.role !== 'super_admin') {
    return next(new AppError("Siz bu do'konning egasi emassiz", 403));
  }

  const reservations = await Reservation.findAll({
    where: { shop_id: shopId },
    include: [
      { model: ReservationItem, as: 'items', include: [{ model: Product }] },
      { model: User, as: 'customer', attributes: ['name', 'phone', 'email'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: reservations.length,
    data: { reservations }
  });
});

// Shop Owner: Statusni o'zgartirish (confirmed, ready, cancelled)
exports.updateReservationStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const reservation = await Reservation.findByPk(id, { include: [{ model: Shop }] });
  if (!reservation) return next(new AppError("Rezervatsiya topilmadi", 404));

  // Faqat shop owner o'zgartira oladi
  if (reservation.Shop.owner_id !== req.user.id && req.user.role !== 'super_admin') {
    return next(new AppError("Ruxsat yo'q", 403));
  }

  const allowedStatuses = ['confirmed', 'ready', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return next(new AppError("Noto'g'ri status", 400));
  }

  reservation.status = status;
  await reservation.save();

  res.status(200).json({
    status: 'success',
    data: { reservation }
  });
});
