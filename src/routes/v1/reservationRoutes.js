const express = require('express');
const rc = require('../../controllers/reservationController');
const { protect, restrictTo } = require('../../middlewares/auth');

const router = express.Router();

router.use(protect); // Barcha routelar himoyalangan

// Customer
router.post('/', restrictTo('customer', 'super_admin'), rc.createReservation);
router.get('/my', restrictTo('customer', 'super_admin'), rc.getMyReservations);

// Shop Owner
router.get('/shop/:shopId', restrictTo('shop_owner', 'super_admin'), rc.getShopReservations);
router.patch('/:id/status', restrictTo('shop_owner', 'super_admin'), rc.updateReservationStatus);

module.exports = router;
