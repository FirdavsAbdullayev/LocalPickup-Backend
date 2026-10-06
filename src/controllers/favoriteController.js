const { Favorite, Product, Shop, Category } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getFavorites = catchAsync(async (req, res, next) => {
  const favorites = await Favorite.findAll({
    where: { userId: req.user.id },
    include: [{
      model: Product, as: 'product',
      include: [
        { model: Shop, as: 'shop', attributes: ['id', 'name', 'slug'] },
        { model: Category, as: 'category' },
      ],
    }],
  });
  res.status(200).json({ status: 'success', results: favorites.length, data: { favorites } });
});

exports.toggleFavorite = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) return next(new AppError('productId is required.', 400));

  const existing = await Favorite.findOne({ where: { userId: req.user.id, productId } });
  if (existing) {
    await existing.destroy();
    return res.status(200).json({ status: 'success', message: 'Removed from favorites' });
  }
  const favorite = await Favorite.create({ userId: req.user.id, productId });
  res.status(201).json({ status: 'success', message: 'Added to favorites', data: { favorite } });
});
