const { Op } = require('sequelize');
const { Shop, User, Product, Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.getAllShops = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  const where = { isApproved: true };
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  const shops = await Shop.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'fullName', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', results: shops.length, data: { shops } });
});

exports.getShopBySlug = catchAsync(async (req, res, next) => {
  const shop = await Shop.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: User, as: 'owner', attributes: ['id', 'fullName', 'email'] },
      {
        model: Product, as: 'products',
        where: { isAvailable: true },
        required: false,
        include: [{ model: Category, as: 'category' }],
      },
    ],
  });
  if (!shop) return next(new AppError('Shop not found.', 404));
  res.status(200).json({ status: 'success', data: { shop } });
});

exports.getMyShops = catchAsync(async (req, res, next) => {
  const shops = await Shop.findAll({
    where: { ownerId: req.user.id },
    include: [{ model: Product, as: 'products', required: false }],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', results: shops.length, data: { shops } });
});

exports.getShopById = catchAsync(async (req, res, next) => {
  const shop = await Shop.findByPk(req.params.id, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'fullName', 'email'] },
      { model: Product, as: 'products', required: false, include: [{ model: Category, as: 'category' }] },
    ],
  });
  if (!shop) return next(new AppError('Shop not found.', 404));
  res.status(200).json({ status: 'success', data: { shop } });
});

exports.createShop = catchAsync(async (req, res, next) => {
  const { name, description, phone, address, latitude, longitude, logo } = req.body;
  if (!name) return next(new AppError('Shop name is required.', 400));
  const slug = slugify(name) + '-' + Date.now();
  const shop = await Shop.create({
    ownerId: req.user.id, name, slug, description, phone, address, latitude, longitude, logo,
    isApproved: false,
  });
  res.status(201).json({ status: 'success', data: { shop } });
});

exports.updateShop = catchAsync(async (req, res, next) => {
  const where = req.user.role === 'SUPER_ADMIN' ? { id: req.params.id } : { id: req.params.id, ownerId: req.user.id };
  const shop = await Shop.findOne({ where });
  if (!shop) return next(new AppError('Shop not found or you are not the owner.', 404));
  await shop.update(req.body);
  res.status(200).json({ status: 'success', data: { shop } });
});

exports.deleteShop = catchAsync(async (req, res, next) => {
  const where = req.user.role === 'SUPER_ADMIN' ? { id: req.params.id } : { id: req.params.id, ownerId: req.user.id };
  const shop = await Shop.findOne({ where });
  if (!shop) return next(new AppError('Shop not found or you are not the owner.', 404));
  await shop.destroy();
  res.status(204).json({ status: 'success', data: null });
});
