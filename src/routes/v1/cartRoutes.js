const express = require('express');
const cc = require('../../controllers/cartController');
const { protect } = require('../../middlewares/auth');
const router = express.Router();

router.use(protect);
router.route('/').get(cc.getCart).post(cc.addToCart).delete(cc.clearCart);
router.route('/:id').patch(cc.updateCartItem).delete(cc.removeFromCart);

module.exports = router;
