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
import { SaveOptions } from 'sequelize';

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
        // @Inject('KYCCHECK') private readonly kycClient: ClientProxy,
        // @Inject('TRANSACTIONSTATUS') private readonly transactionClient: ClientProxy,
        // @Inject('LEDGERFUNDS') private readonly ledgerClient: ClientProxy,
    ) {}

    async kycCheck(data: any): Promise<any> {
        if(development) return { tokenAddress: "0x" };
        // return this.kycClient.emit('kyc_check', data)
    }
    async transactionStatus(isConfirmed: boolean): Promise<any> {
        if(development) return isConfirmed;
        // return this.kycClient.emit('transaction_status', isConfirmed)
    }
    async ledgerFunds(userId, chainId, tokenAddress, transactionHash?): Promise<any> {
        if(development) return true;
        // this.kycClient.emit('ledger_funds', {userId, chainId, tokenAddress, transactionHash})
    }

    async createTransaction(data: any): Promise<any> {
        console.log("data....", data);
        return await Transaction.create(data); 
    }
    async findTransactionsById(id: number): Promise<Transaction[]> {
        console.log("inside transaction by id");
        return Transaction.findAll({
          where: { id },
        });
    }
    async findTransactionByUserId(userId: any): Promise<Transaction> {
        console.log("inside findTransactionByUserId");
        return await Transaction.findOne({
          where: { userId },
        });
    }
    async updateTransaction(id: number, updateData:any): Promise<any> {
        const transaction = await Transaction.findByPk(id);
        return await transaction.update(updateData)
    }

    async deploySafe() {
        console.log("inside deploySafe...");
        
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
        console.log("safeSdkOwner1...", safeSdkOwner1);
        
    
        const safeAddress = await safeSdkOwner1.getAddress()
    
        console.log('Your Safe has been deployed:')
        console.log(`https://goerli.etherscan.io/address/${safeAddress}`)
        console.log(`https://app.safe.global/gor:${safeAddress}`)
        return safeAddress;
    }

    async depositFunds(amount, safeAddress) {
        const balance = await owner1Signer.getBalance();
        const ownerBalance = ethers.utils.formatEther(balance)
        console.log('Owner Balance:', ownerBalance, 'ETH');
        console.log("Requested Balance:", amount, 'ETH');
        if(ownerBalance <= amount) throw new Error("Balance is insufficient for fund!")

        const safeAmount = ethers.utils.parseUnits(amount, 'ether').toHexString()
    
        const transactionParameters = {
            to: safeAddress,
            value: safeAmount,
        }
        
        // console.log("ownerBalance...", ownerBalance);

        
        const tx = await owner1Signer.sendTransaction(transactionParameters)
    
        const owner3Address = await owner1Signer.getAddress()
        console.log(`Fundrasing of ${amount} ETH from ${owner3Address}`)
        console.log(`Deposit Transaction: https://goerli.etherscan.io/tx/${tx.hash}`)
        return tx.hash;
    }

    async proposeWithDrawFunds(safeAddress, walletAddress, price){
        try {
            const ethAdapterOwner1 = new EthersAdapter({
                ethers,
                signerOrProvider: owner1Signer
            })
        
            const safeSdkOwner1 = await Safe.create({
                ethAdapter: ethAdapterOwner1,
                safeAddress
            })
            

            const balance = await safeSdkOwner1.getBalance()
            const safeBalance = ethers.utils.formatUnits(balance, 'ether');
            console.log(`The Initial balance of the Safe: ${safeBalance} ETH`)
            if(price > safeBalance) throw new Error("Withdraw Amount exceeds!")

            const destination = walletAddress
            const amount = ethers.utils.parseUnits(price, 'ether').toString()
            const safeTransactionData: SafeTransactionDataPartial = {
                to: destination,
                data: '0x',
                value: amount,
            }
        
            // Create a Safe transaction with the provided parameters
            const safeTransaction = await safeSdkOwner1.createTransaction({ safeTransactionData })
            console.log(`Owner 1 creates a transaction..`);
        
        
            // Deterministic hash based on transaction parameters
            const safeTxHash = await safeSdkOwner1.getTransactionHash(safeTransaction)
        
            // Sign transaction to verify that the transaction is coming from owner 1
            const senderSignature = await safeSdkOwner1.signTransactionHash(safeTxHash)
        
            const proposeTransaction = await safeService.proposeTransaction({
                safeAddress,
                safeTransactionData: safeTransaction.data,
                safeTxHash,
                senderAddress: await owner1Signer.getAddress(),
                senderSignature: senderSignature.data,
            })
            console.log(`Owner 1 proposed the transaction to other owners..`);
            return safeTxHash;

        } catch (error) {
            console.log(error.message);
        }
    }

    async signWithDrawFunds(safeAddress, safeTxHash) {
        
        try {
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
            return true;
        } catch (error) {
            console.log(error.message);
        }   

    }
    
    async withDrawFunds(safeAddress, safeTxHash, amount) {
        
        try {
            const ethAdapterOwner1 = new EthersAdapter({
                ethers,
                signerOrProvider: owner1Signer
            })
        
            const safeSdkOwner1 = await Safe.create({
                ethAdapter: ethAdapterOwner1,
                safeAddress
            })
            
            const safeTransactionE = await safeService.getTransaction(safeTxHash)
            const executeTxResponse = await safeSdkOwner1.executeTransaction(safeTransactionE)
            const receipt = await executeTxResponse.transactionResponse?.wait()
        
            console.log('Transaction executed:')
            console.log(`Withdrawal of ${amount} took places`)
            console.log(`https://goerli.etherscan.io/tx/${receipt!.transactionHash}`)
        
            const afterBalance = await safeSdkOwner1.getBalance()
        
            console.log(`The final balance of the Safe: ${ethers.utils.formatUnits(afterBalance, 'ether')} ETH`)

            return true
        } catch (error) {
            console.log(error.message);
        }   

    }

}