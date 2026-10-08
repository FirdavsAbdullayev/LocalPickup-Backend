'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`UPDATE "Users" SET status = 'ACTIVE' WHERE status = 'BLOCKED';`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`UPDATE "Users" SET status = 'BLOCKED' WHERE status = 'ACTIVE';`);
  },
};