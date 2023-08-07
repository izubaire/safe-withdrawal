import { Module } from '@nestjs/common';
import { Client, ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionService } from './transaction/transaction.service';
// import { sequelize } from '../sequelize.config'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KYCCHECK",
        transport: Transport.TCP,
      },
      {
        name: "TRANSACTIONSTATUS",
        transport: Transport.TCP,
        options: { port: 3001 },
      },
      {
        name: "LEDGERFUNDS",
        transport: Transport.TCP,
        options: { port: 3002 },
      },
  ]),
    TransactionModule
  ],
  controllers: [AppController, TransactionController],
  providers: [AppService, TransactionService],
})
export class AppModule {}
