const express = require('express');
const productController = require('../../controllers/productController');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.get('/shop/:shopId', productController.getProductsByShop);

router.use(protect);
router.post('/', restrictTo('shop_owner', 'super_admin'), productController.createProduct);

module.exports = router;
