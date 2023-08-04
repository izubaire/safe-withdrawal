import { Module } from '@nestjs/common';
import { Client, ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MicroserviceController } from './microservice/microservice.controller';
import { MicroserviceModule } from './microservice/microservice.module';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionService } from './transaction/transaction.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: "COMMUNICATION",
      transport: Transport.TCP,
    }]),
    TransactionModule
  ],
  controllers: [AppController, MicroserviceController, TransactionController],
  providers: [AppService, TransactionService],
})
export class AppModule {}
