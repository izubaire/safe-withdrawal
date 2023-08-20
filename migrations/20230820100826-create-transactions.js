'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      walletAddress: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.STRING
      },
      chainId: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.STRING
      },
      transactionStatus: {
        type: Sequelize.STRING
      },
      depositTransactionHash: {
        type: Sequelize.STRING
      },
      safeWalletAddress: {
        type: Sequelize.STRING
      },
      safeTransactionHash: {
        type: Sequelize.STRING
      },
      isSignSafeTransactionHash: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};