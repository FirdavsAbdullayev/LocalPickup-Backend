const { Product, Shop, Category } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createProduct = catchAsync(async (req, res, next) => {
  // Verify that the user owns the shop
  const shop = await Shop.findOne({ where: { id: req.body.shop_id, owner_id: req.user.id } });
  
  if (!shop && req.user.role !== 'super_admin') {
    return next(new AppError("Siz faqat o'zingizning do'koningizga mahsulot qo'sha olasiz", 403));
  }

  // Fallback: If category_id is missing, assign it to a default category to fix PostgreSQL constraints
  if (!req.body.category_id) {
    let defaultCategory = await Category.findOne({ where: { slug: 'boshqa' } });
    if (!defaultCategory) {
      defaultCategory = await Category.create({ name: 'Boshqa', slug: 'boshqa', icon: 'box' });
    }
    req.body.category_id = defaultCategory.id;
  }

  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

exports.getProductsByShop = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { shop_id: req.params.shopId }
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});
