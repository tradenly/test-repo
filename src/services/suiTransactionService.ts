
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { suiClient } from '@/config/zkLogin';

export class SuiTransactionService {
  private client: SuiClient;

  constructor() {
    this.client = suiClient;
  }

  async createSuiTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number
  ) {
    try {
      console.log('Creating SUI transfer transaction...');
      
      // Create transaction
      const tx = new Transaction();
      
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountInMist = Math.floor(amount * 1_000_000_000);
      
      // Split coin and transfer
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      tx.transferObjects([coin], toAddress);
      
      // Set sender
      tx.setSender(fromAddress);
      
      console.log('Transaction created successfully');
      
      return {
        success: true,
        transaction: tx,
      };
      
    } catch (error) {
      console.error('Failed to create transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transaction',
      };
    }
  }

  async getUserAssets(address: string) {
    try {
      console.log('Fetching user assets for:', address);
      
      // Get all owned objects
      const ownedObjects = await this.client.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        },
      });
      
      // Get SUI balance
      const suiBalance = await this.client.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI',
      });
      
      // Get all coin balances
      const allBalances = await this.client.getAllBalances({
        owner: address,
      });
      
      console.log('Assets fetched successfully');
      
      return {
        success: true,
        suiBalance: {
          totalBalance: suiBalance.totalBalance,
          coinObjectCount: suiBalance.coinObjectCount,
          lockedBalance: suiBalance.lockedBalance,
        },
        allBalances,
        ownedObjects: ownedObjects.data,
      };
      
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assets',
      };
    }
  }

  async getTransactionHistory(address: string, limit: number = 20) {
    try {
      console.log('Fetching transaction history for:', address);
      
      const transactions = await this.client.queryTransactionBlocks({
        filter: {
          FromAddress: address,
        },
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true,
        },
        limit,
        order: 'descending',
      });
      
      console.log('Transaction history fetched successfully');
      
      return {
        success: true,
        transactions: transactions.data,
        hasNextPage: transactions.hasNextPage,
        nextCursor: transactions.nextCursor,
      };
      
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction history',
      };
    }
  }
}

export const suiTransactionService = new SuiTransactionService();
