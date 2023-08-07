import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTransactionRequest } from './create-transaction-request.dto';
import { CreateTransactionEvent } from './create-transaction.event';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
