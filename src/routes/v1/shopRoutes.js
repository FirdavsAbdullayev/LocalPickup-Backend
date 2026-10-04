const express = require('express');
const shopController = require('../../controllers/shopController');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/', shopController.getAllShops);
router.get('/slug/:slug', shopController.getShopBySlug);

// Protected routes (Only logged in users)
router.use(protect);

router.get('/my-shops', restrictTo('shop_owner', 'super_admin'), shopController.getMyShops);
router.post('/', restrictTo('shop_owner', 'super_admin'), shopController.createShop);

module.exports = router;
