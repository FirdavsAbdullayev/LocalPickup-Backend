const { Op } = require('sequelize');
const { Order, OrderItem, Product, Shop, User, CartItem, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { notifyVendorNewOrder } = require('../services/telegramBot');

// Ikki mahsulot bitta buyurtmada bo'lsa ham, har biri stockda tekshiriladi.
// Atomic (race-safe) update — ikki buyurtma bir vaqtda bo'lsa ham stock manfiy bo'lmaydi.
const reserveStock = async (product, quantity, transaction) => {
  const [affected] = await Product.update(
    { stockQuantity: sequelize.literal(`"stockQuantity" - ${Math.abs(Number(quantity))}`) },
    { where: { id: product.id, stockQuantity: { [Op.gte]: Number(quantity) } }, transaction }
  );
  if (affected === 0) {
    throw new AppError(
      `"${product.title}" uchun omborda yetarli qoldiq yo'q (mavjud: ${product.stockQuantity}).`,
      409
    );
  }
};

const restoreStock = async (orderId, transaction) => {
  const items = await OrderItem.findAll({ where: { orderId }, transaction });
  for (const item of items) {
    await Product.update(
      { stockQuantity: sequelize.literal(`"stockQuantity" + ${Math.abs(Number(item.quantity))}`) },
      { where: { id: item.productId }, transaction }
    );
  }
};

// Status o'tishlarining qat'iy tartibi
const FLOW = { PENDING: 'PREPARING', PREPARING: 'READY', READY: 'COMPLETED' };

const markOrderCancelled = async (order, transaction) => {
  await order.update({ status: 'CANCELLED' }, { transaction });
  await restoreStock(order.id, transaction);
};

exports.createOrder = catchAsync(async (req, res, next) => {
  const { shopId, pickupTime, items, notes } = req.body;
  if (!items || items.length === 0) return next(new AppError('Order must have at least one item.', 400));
  if (!shopId) return next(new AppError('shopId is required.', 400));

  const shop = await Shop.findByPk(shopId);
  if (!shop) return next(new AppError('Shop not found.', 404));

  // Buyurtma + stock kamaytirish + savatni tozalash — bitta transaction ichida
  const created = await sequelize.transaction(async (t) => {
    const productIds = items.map(i => i.productId);
    const products = await Product.findAll({
      where: { id: productIds, shopId, isAvailable: true },
      transaction: t,
    });
    if (products.length !== items.length) {
      throw new AppError('Some products are invalid, unavailable, or not from this shop.', 400);
    }

    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    let total = 0;
    for (const item of items) {
      const product = productMap[item.productId];
      const qty = Number(item.quantity);
      if (Number(product.stockQuantity) < qty) {
        throw new AppError(
          `"${product.title}" uchun omborda yetarli qoldiq yo'q (mavjud: ${product.stockQuantity}).`,
          409
        );
      }
      total += Number(product.discountPrice || product.price) * qty;
    }

    // Platforma komissiyasi (per-shop commissionRate, odatda 2-5%)
    const commissionRate = Number(shop.commissionRate || 0.03);
    const commissionAmount = Math.round(total * commissionRate * 100) / 100;

    const order = await Order.create(
      {
        customerId: req.user.id,
        shopId,
        pickupTime: pickupTime || null,
        notes: notes || null,
        totalAmount: total,
        commissionAmount,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(productMap[item.productId].discountPrice || productMap[item.productId].price),
      })),
      { transaction: t }
    );

    // Ombor qoldig'ini atomik kamaytirish (reservation)
    for (const item of items) {
      await reserveStock(productMap[item.productId], item.quantity, t);
    }

    // Buyurtma qilingan mahsulotlarni savatdan olib tashlash
    await CartItem.destroy({ where: { userId: req.user.id, productId: productIds }, transaction: t });

    return order;
  });

  const fullOrder = await Order.findByPk(created.id, {
    include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
  });

  // Async notification to vendor via Telegram
  (async () => {
    try {
      const shop = await Shop.findByPk(shopId, {
        include: [{ model: User, as: 'owner' }],
      });
      await notifyVendorNewOrder({
        order: fullOrder,
        shop,
        vendor: shop?.owner,
        customer: req.user,
        items: fullOrder.items,
      });
    } catch (e) {
      console.error('Telegram notification error:', e.message);
    }
  })();

  res.status(201).json({ status: 'success', data: { order: fullOrder } });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.findAll({
    where: { customerId: req.user.id },
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'slug'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'title', 'image'] }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: Shop, as: 'shop' },
      { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
    ],
  });
  if (!order) return next(new AppError('Order not found.', 404));

  if (order.customerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    const shop = await Shop.findByPk(order.shopId);
    if (!shop || shop.ownerId !== req.user.id) return next(new AppError('Access denied.', 403));
  }
  res.status(200).json({ status: 'success', data: { order } });
});

exports.getShopOrders = catchAsync(async (req, res, next) => {
  const shop = await Shop.findByPk(req.params.shopId);
  if (!shop) return next(new AppError('Shop not found.', 404));
  if (shop.ownerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') return next(new AppError('Access denied.', 403));

  const orders = await Order.findAll({
    where: { shopId: req.params.shopId },
    include: [
      { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'title', 'image', 'stockQuantity'] }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) return next(new AppError('Invalid status.', 400));

  const order = await Order.findByPk(req.params.id);
  if (!order) return next(new AppError('Order not found.', 404));

  const shop = await Shop.findByPk(order.shopId);
  if (!shop || (shop.ownerId !== req.user.id && req.user.role !== 'SUPER_ADMIN')) return next(new AppError('Access denied.', 403));

  if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
    return next(new AppError(`Buyurtma allaqachon yakunlangan: ${order.status}.`, 400));
  }

  // Sotuvchi tomonidan bekor qilish — stock ham qaytariladi
  if (status === 'CANCELLED') {
    await sequelize.transaction((t) => markOrderCancelled(order, t));
    return res.status(200).json({ status: 'success', data: { order } });
  }

  // Qat'iy ketma-ketlik: PENDING → PREPARING → READY → COMPLETED
  if (FLOW[order.status] && FLOW[order.status] !== status) {
    return next(new AppError(`Noto'g'ri status o'tishi: ${order.status} → ${status} (kerak bo'lgani: ${FLOW[order.status]}).`, 400));
  }

  await order.update({ status });
  res.status(200).json({ status: 'success', data: { order } });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return next(new AppError('Order not found.', 404));
  if (order.customerId !== req.user.id) return next(new AppError('Access denied.', 403));
  if (['COMPLETED', 'CANCELLED'].includes(order.status)) return next(new AppError('Cannot cancel this order.', 400));

  // Bekor qilish + ombor qoldig'ini tiklash — transaction ichida
  await sequelize.transaction((t) => markOrderCancelled(order, t));

  res.status(200).json({ status: 'success', data: { order } });
});