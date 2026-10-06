const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Favorite = sequelize.define('Favorite', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
}, { timestamps: true });

module.exports = Favorite;
