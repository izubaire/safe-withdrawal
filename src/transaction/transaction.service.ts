import { Inject, Injectable } from '@nestjs/common';
import { ethers } from 'ethers'
import { EthersAdapter, SafeTransactionOptionalProps } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'
import { SafeAccountConfig } from '@safe-global/protocol-kit'
import { Sequelize } from 'sequelize';
import { Transaction } from './transaction.entity';
import sequelize from '../../sequelize.config';
import { ClientProxy } from '@nestjs/microservices';

require('dotenv').config();


// DEVELOPMENT
const development = process.env.DEVELOPMENT

// https://chainlist.org/?search=goerli&testnets=true
const RPC_URL = 'https://rpc.ankr.com/eth_goerli'
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

// Initialize signers
const owner1Signer = new ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY!, provider)
const owner2Signer = new ethers.Wallet(process.env.OWNER_2_PRIVATE_KEY!, provider)
const owner3Signer = new ethers.Wallet(process.env.OWNER_3_PRIVATE_KEY!, provider)

const ethAdapterOwner1 = new EthersAdapter({
    ethers,
    signerOrProvider: owner1Signer
})


const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapterOwner1 })



@Injectable()
export class TransactionService {
    constructor(
        @Inject('KYCCHECK') private readonly kycClient: ClientProxy,
        @Inject('TRANSACTIONSTATUS') private readonly transactionClient: ClientProxy,
        @Inject('LEDGERFUNDS') private readonly ledgerClient: ClientProxy,
    ) {}

    async kycCheck(data: any): Promise<any> {
        if(development) return { tokenAddress: "0x" };
        return this.kycClient.emit('kyc_check', data)
    }
    async transactionStatus(isConfirmed: boolean): Promise<any> {
        if(development) return isConfirmed;
        return this.kycClient.emit('transaction_status', isConfirmed)
    }
    async ledgerFunds(userId, chainId, tokenAddress, transactionHash?): Promise<any> {
        if(development) return true;
        this.kycClient.emit('ledger_funds', {userId, chainId, tokenAddress, transactionHash})
    }

    async createTransaction(data: any): Promise<Transaction> {
        return Transaction.create(data); 
    }
    async findTransactionsById(id: number): Promise<Transaction[]> {
        console.log("inside transaction by id");
        return Transaction.findAll({
          where: { id },
        });
    }
    async main({walletAddress, amount:price, chainId, userId}): Promise<any> {
        // console.log("inside...");
        // return `Transaction details: Wallet ID - ${walletAddress}, price - $${price}`
        
        const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapterOwner1 })
    
    
        const safeAccountConfig: SafeAccountConfig = {
            owners: [
                await owner1Signer.getAddress(),
                await owner2Signer.getAddress(),
                await owner3Signer.getAddress()
            ],
            threshold: 2,
            // ... (Optional params)
    
    
    
        }
    
        /* This Safe is tied to owner 1 because the factory was initialized with
        an adapter that had owner 1 as the signer. */
        const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig })
    
        const safeAddress = await safeSdkOwner1.getAddress()
    
        console.log('Your Safe has been deployed:')
        console.log(`https://goerli.etherscan.io/address/${safeAddress}`)
        console.log(`https://app.safe.global/gor:${safeAddress}`)
    
    
    
        const safeAmount = ethers.utils.parseUnits('0.01', 'ether').toHexString()
    
        const transactionParameters = {
            to: safeAddress,
            value: safeAmount,
    
        }
    
        const tx = await owner1Signer.sendTransaction(transactionParameters)
    
        const owner1Address = await owner1Signer.getAddress()
        console.log(`Fundrasing of 0.001 ETH from ${owner1Address}`)
        console.log(`Deposit Transaction: https://goerli.etherscan.io/tx/${tx.hash}`)
    
    
        // Any address can be used. In this example you will use vitalik.eth
        const destination = walletAddress
        const amount = ethers.utils.parseUnits(price, 'ether').toString()
    
        const safeTransactionData: SafeTransactionDataPartial = {
            to: destination,
            data: '0x',
            value: amount,
    
    
        }
        const InitailBalance = await safeSdkOwner1.getBalance()
    
        console.log(`The Initial balance of the Safe: ${ethers.utils.formatUnits(InitailBalance, 'ether')} ETH`)
    
        // Create a Safe transaction with the provided parameters
        const safeTransaction = await safeSdkOwner1.createTransaction({ safeTransactionData })
        console.log(`Owner 1 creates a transction..`);
    
    
        // Deterministic hash based on transaction parameters
        const safeTxHash = await safeSdkOwner1.getTransactionHash(safeTransaction)
    
        // Sign transaction to verify that the transaction is coming from owner 1
        const senderSignature = await safeSdkOwner1.signTransactionHash(safeTxHash)
    
        await safeService.proposeTransaction({
            safeAddress,
            safeTransactionData: safeTransaction.data,
            safeTxHash,
            senderAddress: await owner1Signer.getAddress(),
            senderSignature: senderSignature.data,
        })
        console.log(`Owner 1 proposed the transaction to other owners..`);
    
    
    
        const ethAdapterOwner2 = new EthersAdapter({
            ethers,
            signerOrProvider: owner2Signer
        })
    
        const safeSdkOwner2 = await Safe.create({
            ethAdapter: ethAdapterOwner2,
            safeAddress
        })
    
        const signature = await safeSdkOwner2.signTransactionHash(safeTxHash)
        const response = await safeService.confirmTransaction(safeTxHash, signature.data)
        console.log(`Owner 2 approves the transction`);
    
    
        const safeTransactionE = await safeService.getTransaction(safeTxHash)
        const executeTxResponse = await safeSdkOwner1.executeTransaction(safeTransactionE)
        const receipt = await executeTxResponse.transactionResponse?.wait()
    
    
        console.log('Transaction executed:')
        console.log(`Widthrawl of ${amount} took places`)
        console.log(`https://goerli.etherscan.io/tx/${receipt!.transactionHash}`)
    
        const afterBalance = await safeSdkOwner1.getBalance()
    
        console.log(`The final balance of the Safe: ${ethers.utils.formatUnits(afterBalance, 'ether')} ETH`)

        return {
            transactionHash: safeTxHash,
        }
    }
    
}