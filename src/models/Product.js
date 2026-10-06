const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  shopId: { type: DataTypes.UUID, allowNull: false },
  categoryId: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  discountPrice: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

module.exports = Product;
