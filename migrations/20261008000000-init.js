'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ─── Users ───────────────────────────────────────────────────────────────
    await queryInterface.createTable('Users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      password: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('SUPER_ADMIN', 'VENDOR', 'CUSTOMER'), allowNull: false, defaultValue: 'CUSTOMER' },
      status: { type: Sequelize.ENUM('ACTIVE', 'BLOCKED'), allowNull: false, defaultValue: 'ACTIVE' },
      telegramChatId: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── Shops ───────────────────────────────────────────────────────────────
    await queryInterface.createTable('Shops', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: true, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      logo: { type: Sequelize.STRING, allowNull: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      latitude: { type: Sequelize.FLOAT, allowNull: true },
      longitude: { type: Sequelize.FLOAT, allowNull: true },
      isApproved: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── Categories ──────────────────────────────────────────────────────────
    await queryInterface.createTable('Categories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: true, unique: true },
      icon: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── Products ────────────────────────────────────────────────────────────
    await queryInterface.createTable('Products', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      shopId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Shops', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      price: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      discountPrice: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      image: { type: Sequelize.STRING, allowNull: true },
      stockQuantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      isAvailable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── Orders ──────────────────────────────────────────────────────────────
    await queryInterface.createTable('Orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      shopId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Shops', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      paymentStatus: {
        type: Sequelize.ENUM('UNPAID', 'PAID'),
        allowNull: false,
        defaultValue: 'UNPAID',
      },
      totalAmount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      pickupTime: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── OrderItems ──────────────────────────────────────────────────────────
    await queryInterface.createTable('OrderItems', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unitPrice: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── CartItems ───────────────────────────────────────────────────────────
    await queryInterface.createTable('CartItems', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── Favorites ───────────────────────────────────────────────────────────
    await queryInterface.createTable('Favorites', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ─── FK indexes ──────────────────────────────────────────────────────────
    await queryInterface.addIndex('Shops', ['ownerId']);
    await queryInterface.addIndex('Products', ['shopId']);
    await queryInterface.addIndex('Products', ['categoryId']);
    await queryInterface.addIndex('Orders', ['customerId']);
    await queryInterface.addIndex('Orders', ['shopId']);
    await queryInterface.addIndex('OrderItems', ['orderId']);
    await queryInterface.addIndex('OrderItems', ['productId']);
    await queryInterface.addIndex('CartItems', ['userId']);
    await queryInterface.addIndex('CartItems', ['productId']);
    await queryInterface.addIndex('Favorites', ['userId']);
    await queryInterface.addIndex('Favorites', ['productId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Favorites');
    await queryInterface.dropTable('CartItems');
    await queryInterface.dropTable('OrderItems');
    await queryInterface.dropTable('Orders');
    await queryInterface.dropTable('Products');
    await queryInterface.dropTable('Categories');
    await queryInterface.dropTable('Shops');
    await queryInterface.dropTable('Users');
  },
};