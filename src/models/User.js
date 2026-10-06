const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'VENDOR', 'CUSTOMER'),
    defaultValue: 'CUSTOMER',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'BLOCKED'),
    defaultValue: 'ACTIVE',
  },
  telegramChatId: { type: DataTypes.STRING, allowNull: true },
}, {
  timestamps: true,
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: {} } },
});

module.exports = User;
