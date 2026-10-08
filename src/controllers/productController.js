const { Product, Shop, Category } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  res.status(200).json({ status: 'success', results: categories.length, data: { categories } });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, icon } = req.body;
  if (!name) return next(new AppError('Category name is required.', 400));
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [cat, created] = await Category.findOrCreate({
    where: { slug },
    defaults: { name, slug, icon },
  });
  res.status(created ? 201 : 200).json({ status: 'success', data: { category: cat } });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return next(new AppError('Category not found.', 404));
  await cat.update(req.body);
  res.status(200).json({ status: 'success', data: { category: cat } });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return next(new AppError('Category not found.', 404));
  await cat.destroy();
  res.status(204).json({ status: 'success', data: null });
});

exports.getProductsByShop = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { shopId: req.params.shopId },
    include: [{ model: Category, as: 'category' }],
    order: [['createdAt', 'DESC']],
  });
  res.status(200).json({ status: 'success', results: products.length, data: { products } });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: Category, as: 'category' }, { model: Shop, as: 'shop' }],
  });
  if (!product) return next(new AppError('Product not found.', 404));
  res.status(200).json({ status: 'success', data: { product } });
});

// SaaS plan bo'yicha mahsulot limiti (null = cheksiz)
const PLAN_LIMITS = { FREE: 15, PRO: 200, PREMIUM: null };

exports.createProduct = catchAsync(async (req, res, next) => {
  const { shopId, categoryId, title, description, price, discountPrice, image, stockQuantity } = req.body;
  if (!shopId || !title || !price) return next(new AppError('shopId, title and price are required.', 400));

  const where = req.user.role === 'SUPER_ADMIN' ? { id: shopId } : { id: shopId, ownerId: req.user.id };
  const shop = await Shop.findOne({ where });
  if (!shop) return next(new AppError('Shop not found or you are not the owner.', 403));

  const limit = PLAN_LIMITS[shop.plan];
  if (limit != null) {
    const count = await Product.count({ where: { shopId: shop.id } });
    if (count >= limit) {
      return next(
        new AppError(
          `Do'koningiz ${shop.plan} tarifida maksimal ${limit} ta mahsulot qo'yish mumkin. PRO tarifiga o'ting.`,
          400
        )
      );
    }
  }

  let catId = categoryId;
  if (!catId) {
    const [defaultCat] = await Category.findOrCreate({
      where: { slug: 'boshqa' },
      defaults: { name: 'Boshqa', slug: 'boshqa', icon: '📦' },
    });
    catId = defaultCat.id;
  }

  const product = await Product.create({
    shopId, categoryId: catId, title, description,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    image: image || null,
    stockQuantity: stockQuantity || 0,
  });

  res.status(201).json({ status: 'success', data: { product } });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, { include: [{ model: Shop, as: 'shop' }] });
  if (!product) return next(new AppError('Product not found.', 404));
  if (req.user.role !== 'SUPER_ADMIN' && product.shop.ownerId !== req.user.id) {
    return next(new AppError('Not authorized.', 403));
  }
  await product.update(req.body);
  res.status(200).json({ status: 'success', data: { product } });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByPk(req.params.id, { include: [{ model: Shop, as: 'shop' }] });
  if (!product) return next(new AppError('Product not found.', 404));
  if (req.user.role !== 'SUPER_ADMIN' && product.shop.ownerId !== req.user.id) {
    return next(new AppError('Not authorized.', 403));
  }
  await product.destroy();
  res.status(204).json({ status: 'success', data: null });
});
