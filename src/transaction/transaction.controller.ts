import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './create-transaction.dto';

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
    // this.transactionService.main(walletAddress, amount, chainId, userId)
    // .then(() => process.exit(0))
    // .catch((error) => {
    //   console.error(error);
    //   process.exit(1);
    // })
    return `Transaction details: Wallet ID - ${walletAddress}, amount - $${amount}`;
  }

  @Post()
  async create(@Query() query: CreateTransactionDto): Promise<object | string> {
    try {
      const newTransactionData = await this.transactionService.createTransaction(query);
      this.transactionService.main(query)
      return {
        message: "Data received successfully",
        data: newTransactionData
      };
    } catch (error) {
      console.log(error);
      return "Unexpected Error"      
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<any> {
    return this.transactionService.findTransactionsById(id)
  }
}
