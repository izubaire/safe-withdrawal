import { Controller, Get, Query } from '@nestjs/common';

@Controller('transaction')
export class TransactionController {
    @Get()
  getTransaction(
    @Query('walletId') walletId: string,
    @Query('price') price: number,
  ) {
    return `Transaction details: Wallet ID - ${walletId}, Price - $${price}`;
  }
}
