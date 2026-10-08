const { Op } = require('sequelize');
const { Shop, User, Product, Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const toRad = (deg) => (deg * Math.PI) / 180;

// Haversine formulasi — ikki koordinata orasidagi masofa (km)
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Yurish ~5 km/soat, mashina ~30 km/soat
const etaMinutes = (distanceKm) => ({
  walking: Math.round((distanceKm / 5) * 60),
  driving: Math.round((distanceKm / 30) * 60),
});

exports.getAllShops = catchAsync(async (req, res, next) => {
  const { search, lat, lng, radius } = req.query;
  const where = { isApproved: true };
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  let shops = await Shop.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'fullName', 'email'] }],
    order: [['createdAt', 'DESC']],
  });

  const userLat = Number.parseFloat(lat);
  const userLng = Number.parseFloat(lng);
  const hasLocation = Number.isFinite(userLat) && Number.isFinite(userLng);
  const maxRadius = Number.parseFloat(radius);
  const hasRadius = Number.isFinite(maxRadius) && maxRadius > 0;

  if (hasLocation) {
    shops = shops
      .map((shop) => {
        const sLat = shop.latitude;
        const sLng = shop.longitude;
        if (Number.isFinite(sLat) && Number.isFinite(sLng)) {
          const distanceKm = Math.round(haversineKm(userLat, userLng, sLat, sLng) * 100) / 100;
          if (!hasRadius || distanceKm <= maxRadius) {
            shop.setDataValue('distanceKm', distanceKm);
            shop.setDataValue('etaMinutes', etaMinutes(distanceKm));
          }
        }
        return shop;
      })
      .filter((shop) => shop.dataValues.distanceKm != null);
  }

  // Featured do'konlar birinchi, so'ng yaqinlik / sana bo'yicha
  shops.sort((a, b) => {
    if (!!a.isFeatured !== !!b.isFeatured) return a.isFeatured ? -1 : 1;
    if (hasLocation) return (a.dataValues.distanceKm || 0) - (b.dataValues.distanceKm || 0);
    return 0;
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
