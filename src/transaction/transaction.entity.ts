import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'transactions' })
export class Transaction extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  walletAddress: string;

  @Column({
    type: DataType.DECIMAL(18, 2),
    allowNull: false,
  })
  amount: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  chainId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "Pending"
  })
  transactionStatus: string;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
    // defaultValue: ""
  })
  safeWalletAddress: string;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
    // defaultValue: ""
  })
  depositTransactionHash: string;

  @Column({
    type: DataType.STRING,
    // allowNull: false,
    // defaultValue: ""
  })
  safeTransactionHash: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isSignSafeTransactionHash: boolean;
}
