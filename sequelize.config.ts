import { Sequelize } from 'sequelize-typescript';
import { Transaction } from './src/transaction/transaction.entity';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'safe',
  models: [Transaction],
  logging: false, // Set to true to see SQL queries in the console
});

export default sequelize;
