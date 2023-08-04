import { Controller, Get, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService){}

  @Get()
  getTransaction(
    @Query('walletAddress') walletAddress: string,
    @Query('amount') amount: string,
    @Query('chainId') chainId: string,
    @Query('userId') userId: string,
  ) {
    this.transactionService.main(walletAddress, amount, chainId, userId)
    // .then(() => process.exit(0))
    // .catch((error) => {
    //   console.error(error);
    //   process.exit(1);
    // })
    return `Transaction details: Wallet ID - ${walletAddress}, amount - $${amount}`;
  }
}
