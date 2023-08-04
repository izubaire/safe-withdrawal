import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateTransactionRequest } from './create-transaction-request.dto';
import { CreateTransactionEvent } from './create-transaction.event';

@Injectable()
export class AppService {
  private readonly users: any[] = []

  constructor(
    @Inject('COMMUNICATION') private readonly communicationClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  createUser(createUserRequest: CreateTransactionRequest) {
    this.users.push(createUserRequest);
    // this.communicationClient.emit('transaction_created', new CreateTransactionEvent(CreateTransactionRequest.walletId))
  }

}
