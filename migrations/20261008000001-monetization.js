'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Shops', 'isFeatured', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Shops', 'featuredUntil', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Shops', 'plan', {
      type: Sequelize.ENUM('FREE', 'PRO', 'PREMIUM'),
      allowNull: false,
      defaultValue: 'FREE',
    });

    await queryInterface.addColumn('Shops', 'commissionRate', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.03,
    });

    await queryInterface.addColumn('Orders', 'commissionAmount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Orders', 'commissionAmount');
    await queryInterface.removeColumn('Shops', 'commissionRate');
    await queryInterface.removeColumn('Shops', 'plan');
    await queryInterface.removeColumn('Shops', 'featuredUntil');
    await queryInterface.removeColumn('Shops', 'isFeatured');
  },
};