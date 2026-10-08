const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ownerId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  logo: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: true },
  latitude: { type: DataTypes.FLOAT, allowNull: true },
  longitude: { type: DataTypes.FLOAT, allowNull: true },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },

  // ─── Monetizatsiya ──────────────────────────────────────────────────────
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  featuredUntil: { type: DataTypes.DATE, allowNull: true },
  plan: {
    type: DataTypes.ENUM('FREE', 'PRO', 'PREMIUM'),
    defaultValue: 'FREE',
  },
  // Do'kon uchun tranzaksiya komissiyasi (0.02 = 2%)
  commissionRate: { type: DataTypes.FLOAT, defaultValue: 0.03 },
}, { timestamps: true });

module.exports = Shop;
