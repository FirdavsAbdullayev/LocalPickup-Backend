const { sequelize } = require('../config/db');

const User     = require('./User');
const Shop     = require('./Shop');
const Category = require('./Category');
const Product  = require('./Product');
const Order    = require('./Order');
const OrderItem= require('./OrderItem');
const CartItem = require('./CartItem');
const Favorite = require('./Favorite');

// ─── Associations ────────────────────────────────────────────────────────────

// User → Shop
User.hasMany(Shop, { foreignKey: 'ownerId', as: 'shops' });
Shop.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Shop → Product
Shop.hasMany(Product, { foreignKey: 'shopId', as: 'products' });
Product.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

// Category → Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User → Order
User.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// Shop → Order
Shop.hasMany(Order, { foreignKey: 'shopId', as: 'orders' });
Order.belongsTo(Shop, { foreignKey: 'shopId', as: 'shop' });

// Order → OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product → OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User → CartItem
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cart' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Product → CartItem
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User → Favorite
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

// Product → Favorite
Product.hasMany(Favorite, { foreignKey: 'productId' });
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  sequelize,
  User, Shop, Category, Product,
  Order, OrderItem, CartItem, Favorite,
};
