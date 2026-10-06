const express = require('express');
const router = express.Router();

const adminRoutes = require('./adminRoutes');
const cartRoutes = require('./cartRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const orderRoutes = require('./orderRoutes');
const productRoutes = require('./productRoutes');
const shopRoutes = require('./shopRoutes');
const userRoutes = require('./userRoutes');

router.use('/admin', adminRoutes);
router.use('/cart', cartRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/orders', orderRoutes);
router.use('/products', productRoutes);
router.use('/shops', shopRoutes);
router.use('/users', userRoutes);

module.exports = router;
