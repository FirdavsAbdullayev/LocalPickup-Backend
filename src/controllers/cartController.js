const { CartItem, Product, Shop } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getCart = catchAsync(async (req, res, next) => {
  const cartItems = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Product, as: 'product',
      include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'slug'] }],
    }],
  });
  res.status(200).json({ status: 'success', results: cartItems.length, data: { cart: cartItems } });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return next(new AppError('productId is required.', 400));

  let cartItem = await CartItem.findOne({ where: { userId: req.user.id, productId } });
  if (cartItem) {
    cartItem.quantity += parseInt(quantity);
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({ userId: req.user.id, productId, quantity: parseInt(quantity) });
  }
  const full = await CartItem.findByPk(cartItem.id, {
    include: [{ model: Product, as: 'product', include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'slug'] }] }],
  });
  res.status(200).json({ status: 'success', data: { cartItem: full } });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return next(new AppError('Quantity must be at least 1.', 400));
  const cartItem = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cartItem) return next(new AppError('Cart item not found.', 404));
  await cartItem.update({ quantity: parseInt(quantity) });
  res.status(200).json({ status: 'success', data: { cartItem } });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const deleted = await CartItem.destroy({ where: { id: req.params.id, userId: req.user.id } });
  if (!deleted) return next(new AppError('Cart item not found.', 404));
  res.status(204).json({ status: 'success', data: null });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  await CartItem.destroy({ where: { userId: req.user.id } });
  res.status(204).json({ status: 'success', data: null });
});
