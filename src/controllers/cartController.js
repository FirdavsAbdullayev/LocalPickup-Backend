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

  const qty = parseInt(quantity, 10);
  if (!productId) return next(new AppError('productId is required.', 400));
  if (!Number.isInteger(qty) || qty < 1) return next(new AppError('Quantity must be a positive integer.', 400));

  const product = await Product.findByPk(productId);
  if (!product) return next(new AppError('Product not found.', 404));
  if (!product.isAvailable || product.stockQuantity <= 0) {
    return next(new AppError(`"${product.title}" hozircha mavjud emas.`, 409));
  }

  let cartItem = await CartItem.findOne({ where: { userId: req.user.id, productId } });
  const newQuantity = (cartItem ? cartItem.quantity : 0) + qty;
  if (newQuantity > product.stockQuantity) {
    return next(
      new AppError(`"${product.title}" uchun omborda faqat ${product.stockQuantity} dona bor.`, 409)
    );
  }
  if (cartItem) {
    cartItem.quantity = newQuantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({ userId: req.user.id, productId, quantity: qty });
  }
  const full = await CartItem.findByPk(cartItem.id, {
    include: [{ model: Product, as: 'product', include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'slug'] }] }],
  });
  res.status(200).json({ status: 'success', data: { cartItem: full } });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);
  if (!Number.isInteger(qty) || qty < 1) return next(new AppError('Quantity must be at least 1.', 400));
  const cartItem = await CartItem.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: Product, as: 'product' }],
  });
  if (!cartItem) return next(new AppError('Cart item not found.', 404));
  const stock = Number(cartItem.product?.stockQuantity);
  if (qty > stock) {
    return next(new AppError(`"${cartItem.product.title}" uchun omborda faqat ${stock} dona bor.`, 409));
  }
  await cartItem.update({ quantity: qty });
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
