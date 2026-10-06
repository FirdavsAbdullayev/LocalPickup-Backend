const { Order, OrderItem, Product, Shop, User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { notifyVendorNewOrder } = require('../services/telegramBot');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { shopId, pickupTime, items, notes } = req.body;
  if (!items || items.length === 0) return next(new AppError('Order must have at least one item.', 400));
  if (!shopId) return next(new AppError('shopId is required.', 400));

  const productIds = items.map(i => i.productId);
  const products = await Product.findAll({ where: { id: productIds, shopId } });
  if (products.length !== items.length) return next(new AppError('Some products are invalid or not from this shop.', 400));

  const productMap = {};
  products.forEach(p => { productMap[p.id] = p; });

  let total = 0;
  items.forEach(item => {
    const price = Number(productMap[item.productId].discountPrice || productMap[item.productId].price);
    total += price * item.quantity;
  });

  const order = await Order.create({ customerId: req.user.id, shopId, pickupTime: pickupTime || null, notes: notes || null, totalAmount: total });

  await OrderItem.bulkCreate(items.map(item => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: Number(productMap[item.productId].discountPrice || productMap[item.productId].price),
  })));

  const fullOrder = await Order.findByPk(order.id, {
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
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'title', 'image'] }] },
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

  await order.update({ status });
  res.status(200).json({ status: 'success', data: { order } });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return next(new AppError('Order not found.', 404));
  if (order.customerId !== req.user.id) return next(new AppError('Access denied.', 403));
  if (['COMPLETED', 'CANCELLED'].includes(order.status)) return next(new AppError('Cannot cancel this order.', 400));
  await order.update({ status: 'CANCELLED' });
  res.status(200).json({ status: 'success', data: { order } });
});
