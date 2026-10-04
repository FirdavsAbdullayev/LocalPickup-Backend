const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Product = require('./Product');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  attribute_name: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'Size', 'Color'
  },
  attribute_value: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'XL', 'Red'
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  price_override: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  }
}, {
  timestamps: true,
});

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = ProductVariant;
