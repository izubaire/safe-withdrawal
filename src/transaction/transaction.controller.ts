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
      // // Check KYC
      // const kycCheck = await this.transactionService.kycCheck(query);
      // if(!kycCheck) return { message: "Account is Suspended!" }
      // // Set the Transaction Status pending
      // await this.transactionService.transactionStatus(false);
      // // Checking Funds from Ledger
      // const ledgerFunds = await this.transactionService.ledgerFunds(query.userId, query.chainId, kycCheck.tokenAddress);
      // if(!ledgerFunds) return { message: "Funds are not sufficient!" }
      // // Safe Withdraw
      // const safeWithdraw = await this.transactionService.main(query)
      // if(!safeWithdraw) return { message: "Withdrawal transaction failed to be processed" }
      // // Update the Funds from Ledger
      // const updateLedgerFunds = await this.transactionService.ledgerFunds(query.userId, query.chainId, kycCheck.tokenAddress, safeWithdraw.transactionHash);
      // if(!updateLedgerFunds) return { message: "Ledger Funds couldn't updated" }
      // // Set the Transaction Status completed
      // const transactionStatus = await this.transactionService.transactionStatus(true);
      // if(!transactionStatus) return { message: "Transaction Status couldn't updated" }

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

  @Post("/create")
  async createTransaction(@Query() query): Promise<any> {
    try {
      const newTransactionData = await this.transactionService.createTransaction(query);
      return newTransactionData;
    } catch (error) {
      console.log(error.message);
      return `create-transaction Unexpected Error: ${error.message}`
    }
  }

  @Post("/safe-deploy")
  async safeDeploy(@Query() query): Promise<any> {
    try {
      const { userId } = query;
      const transactionData = await this.transactionService.findTransactionByUserId(userId);
      const safeWalletAddress = await this.transactionService.deploySafe();
      if(!safeWalletAddress) throw new Error("Deployment of Safe isn't successful!")
      await transactionData.update({ safeWalletAddress })
      return transactionData;
    } catch (error) {
      console.log(error.message);
      return `safe-deploy Unexpected Error: ${error.message}` 
    }
  }

  @Post("/funds-deposit")
  async fundsDeposit(@Query() query): Promise<any> {
    try {
      const { userId, amount } = query;
      const transactionData = await this.transactionService.findTransactionByUserId(userId);
      const { safeWalletAddress } = transactionData;
      const depositTransactionHash = await this.transactionService.depositFunds(amount, safeWalletAddress);
      if(!depositTransactionHash) throw new Error("Funds deposit isn't successful!")
      await transactionData.update({ depositTransactionHash })
      return transactionData;
    } catch (error) {
      console.log(error.message);
      return `funds-deposit Unexpected Error: ${error.message}` 
    }
  }

  @Post("/funds-withdraw")
  async fundsWithdraw(@Query() query): Promise<any> {
    try {
      const { userId, signSafeTransaction } = query;
      const transactionData = await this.transactionService.findTransactionByUserId(userId);
      if(!transactionData) throw new Error("Could not find the User Transaction!")
      const { amount, safeWalletAddress, walletAddress, safeTransactionHash, transactionStatus, isSignSafeTransactionHash } = transactionData;
      // Propose Transaction
      if(!safeTransactionHash){
        const safeTransactionHash = await this.transactionService.proposeWithDrawFunds(safeWalletAddress, walletAddress, amount);
        if(!safeTransactionHash) throw new Error("Propose Transaction isn't successful!")
        await transactionData.update({ safeTransactionHash })
      }
      // Sign Transaction
      if(!signSafeTransaction && !isSignSafeTransactionHash ) throw new Error("Need approval to sign transaction!")
      if(!isSignSafeTransactionHash) {
        const signWithDrawFunds = await this.transactionService.signWithDrawFunds(safeWalletAddress, safeTransactionHash);
        if(!signWithDrawFunds) throw new Error("Transaction hasn't signed successfully!")
        await transactionData.update({ isSignSafeTransactionHash: signWithDrawFunds })
      }
      // withdraw funds
      if(transactionStatus === "Completed") throw new Error("Funds already withdrawn for safeTransactionHash!")
      const withDrawFunds = await this.transactionService.withDrawFunds(safeWalletAddress, safeTransactionHash, amount)
      if(!withDrawFunds) throw new Error("Funds Withdrawal isn't successful!")
      await transactionData.update({ transactionStatus: "Completed" })
      return {
        message: "Funds Withdrawal successful!",
        success: withDrawFunds
      }
    } catch (error) {
      console.log(error.message);
      return `funds-withdraw Unexpected Error: ${error.message}`      
    }
  }

  @Get(':id')
  async getById(@Param('id') id: number): Promise<any> {
    return this.transactionService.findTransactionsById(id)
  }
}
