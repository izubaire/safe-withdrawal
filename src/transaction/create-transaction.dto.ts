export class CreateTransactionDto {
  walletAddress: string;
  amount: string;
  chainId: string;
  userId: string;
  transactionStatus: string;
  safeWalletAddress: string;
  transactionHash: string;
}