
import { Transaction } from '@mysten/sui/transactions';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Basic Sui client for transaction building
const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

export interface TransactionResult {
  success: boolean;
  digest?: string;
  error?: string;
}

export const buildBasicTransaction = async (
  targetAddress: string,
  amount: number
): Promise<Transaction> => {
  const tx = new Transaction();
  
  // Add a basic coin transfer
  const [coin] = tx.splitCoins(tx.gas, [amount]);
  tx.transferObjects([coin], targetAddress);
  
  return tx;
};

export const executeTransaction = async (
  transaction: Transaction,
  keypair: Ed25519Keypair
): Promise<TransactionResult> => {
  try {
    // Build the transaction
    const txBytes = await transaction.build({ client: suiClient });
    
    // Sign the transaction
    const signature = await keypair.sign(txBytes);
    
    // Execute the transaction
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: txBytes,
      signature,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return {
      success: true,
      digest: result.digest,
    };
  } catch (error) {
    console.error('Transaction execution failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Utility function to get current epoch
export const getCurrentEpoch = async (): Promise<number> => {
  try {
    const epoch = await suiClient.getLatestSuiSystemState();
    return parseInt(epoch.epoch);
  } catch (error) {
    console.error('Failed to get current epoch:', error);
    throw new Error('Failed to get current epoch');
  }
};
