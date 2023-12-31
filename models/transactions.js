'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  transactions.init({
    walletAddress: DataTypes.STRING,
    amount: DataTypes.STRING,
    chainId: DataTypes.STRING,
    userId: DataTypes.STRING,
    transactionStatus: DataTypes.STRING,
    depositTransactionHash: DataTypes.STRING,
    safeWalletAddress: DataTypes.STRING,
    safeTransactionHash: DataTypes.STRING,
    isSignSafeTransactionHash: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'transactions',
  });
  return transactions;
};