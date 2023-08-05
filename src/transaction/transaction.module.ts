import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import sequelize from '../../sequelize.config';

@Module({
  providers: [TransactionService, {
    provide: 'SEQUELIZE',
    useValue: sequelize,
  }]
})
export class TransactionModule {}
