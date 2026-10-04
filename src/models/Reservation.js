const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Shop = require('./Shop');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  shop_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Shop,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'ready', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pickup_time: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  timestamps: true,
});

// Relationships
User.hasMany(Reservation, { foreignKey: 'customer_id' });
Reservation.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });

Shop.hasMany(Reservation, { foreignKey: 'shop_id' });
Reservation.belongsTo(Shop, { foreignKey: 'shop_id' });

module.exports = Reservation;
