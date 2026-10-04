const { sequelize } = require('../config/db');

// Import all models to ensure relationships are established
const User = require('./User');
const Shop = require('./Shop');
const Category = require('./Category');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const ProductImage = require('./ProductImage');
const Reservation = require('./Reservation');
const ReservationItem = require('./ReservationItem');

module.exports = {
  sequelize,
  User,
  Shop,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Reservation,
  ReservationItem
};
