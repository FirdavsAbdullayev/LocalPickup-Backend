const express = require('express');
const router = express.Router();

const adminRoutes = require('./v1/adminRoutes');
const cartRoutes = require('./v1/cartRoutes');
const favoriteRoutes = require('./v1/favoriteRoutes');
const orderRoutes = require('./v1/orderRoutes');
const productRoutes = require('./v1/productRoutes');
const shopRoutes = require('./v1/shopRoutes');
const userRoutes = require('./v1/userRoutes');

router.use('/admin', adminRoutes);
router.use('/cart', cartRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/shops', shopRoutes);
router.use('/users', userRoutes);

module.exports = router;