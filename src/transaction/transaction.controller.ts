import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './create-transaction.dto';

require('dotenv').config();

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService){}

  @Post()
  async create(@Query() query: CreateTransactionDto): Promise<object | string> {
    try {
      // Store Data in DB
      const newTransactionData = await this.transactionService.createTransaction(query);
      return
      // Check KYC
      const kycCheck = await this.transactionService.kycCheck(query);
      if(!kycCheck) return { message: "Account is Suspended!" }
      // Set the Transaction Status pending
      await this.transactionService.transactionStatus(false);
      // Checking Funds from Ledger
      const ledgerFunds = await this.transactionService.ledgerFunds(query.userId, query.chainId, kycCheck.tokenAddress);
      if(!ledgerFunds) return { message: "Funds are not sufficient!" }
      // Safe Withdraw
      const safeWithdraw = await this.transactionService.main(query)
      if(!safeWithdraw) return { message: "Withdrawal transaction failed to be processed" }
      // Update the Funds from Ledger
      const updateLedgerFunds = await this.transactionService.ledgerFunds(query.userId, query.chainId, kycCheck.tokenAddress, safeWithdraw.transactionHash);
      if(!updateLedgerFunds) return { message: "Ledger Funds couldn't updated" }
      // Set the Transaction Status completed
      const transactionStatus = await this.transactionService.transactionStatus(true);
      if(!transactionStatus) return { message: "Transaction Status couldn't updated" }

      // Update the Transaction Status in local database
      const updateTransactionData = await newTransactionData.update({"transactionStatus" : "Completed"});

      return {
        message: "Data received successfully",
        data: updateTransactionData,
      };
    } catch (error) {
      console.log(error);
      return "Unexpected Error"      
    }
  }

  @Post("/safeDeploy")
  async deploySafe(): Promise<any> {
    try {
      this.transactionService.deploySafe();
      console.log("inside safe deploy..");
      
      // const {  }
    } catch (error) {
      console.log(error.message);
      return "Unexpected Error"      
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<any> {
    return this.transactionService.findTransactionsById(id)
  }
}
