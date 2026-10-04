const { Shop, Product, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createShop = catchAsync(async (req, res, next) => {
  // Only shop_owners can create shops
  if (req.user.role !== 'shop_owner' && req.user.role !== 'super_admin') {
    return next(new AppError("Faqatgina do'kon egalari yangi do'kon yaratishi mumkin", 403));
  }

  const { name, description, phone, address, location_lat, location_lng } = req.body;
  
  // Create a slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

  const newShop = await Shop.create({
    owner_id: req.user.id,
    name,
    slug,
    description,
    phone,
    address,
    location_lat,
    location_lng,
    isVerified: false // Super admin will verify later, but let's make it usable for now
  });

  res.status(201).json({
    status: 'success',
    data: {
      shop: newShop
    }
  });
});

exports.getAllShops = catchAsync(async (req, res, next) => {
  const shops = await Shop.findAll({
    include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
  });

  res.status(200).json({
    status: 'success',
    results: shops.length,
    data: {
      shops
    }
  });
});

exports.getShopBySlug = catchAsync(async (req, res, next) => {
  const shop = await Shop.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: User, as: 'owner', attributes: ['name', 'phone'] },
      { model: Product } // Include products of the shop
    ]
  });

  if (!shop) {
    return next(new AppError("Ushbu do'kon topilmadi", 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      shop
    }
  });
});

exports.getMyShops = catchAsync(async (req, res, next) => {
  const shops = await Shop.findAll({
    where: { owner_id: req.user.id }
  });

  res.status(200).json({
    status: 'success',
    results: shops.length,
    data: {
      shops
    }
  });
});
