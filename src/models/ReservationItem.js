const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Reservation = require('./Reservation');
const Product = require('./Product');

const ReservationItem = sequelize.define('ReservationItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reservation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Reservation,
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  timestamps: true,
});

// Relationships
Reservation.hasMany(ReservationItem, { foreignKey: 'reservation_id', as: 'items' });
ReservationItem.belongsTo(Reservation, { foreignKey: 'reservation_id' });

Product.hasMany(ReservationItem, { foreignKey: 'product_id' });
ReservationItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = ReservationItem;
