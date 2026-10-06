const express = require('express');
const fc = require('../../controllers/favoriteController');
const { protect } = require('../../middlewares/auth');
const router = express.Router();

router.use(protect);
router.route('/').get(fc.getFavorites).post(fc.toggleFavorite);

module.exports = router;
