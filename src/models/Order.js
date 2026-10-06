const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customerId: { type: DataTypes.UUID, allowNull: false },
  shopId: { type: DataTypes.UUID, allowNull: false },
  status: {
    type: DataTypes.ENUM('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  paymentStatus: {
    type: DataTypes.ENUM('UNPAID', 'PAID'),
    defaultValue: 'UNPAID',
  },
  totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  pickupTime: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = Order;
