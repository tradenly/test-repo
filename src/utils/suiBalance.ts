
import { SuiClient } from '@mysten/sui/client';
import { ZK_LOGIN_CONFIG } from '@/config/zkLogin';

const suiClient = new SuiClient({ url: ZK_LOGIN_CONFIG.SUI_RPC_URL });

export interface SuiBalance {
  coinType: string;
  balance: string;
  totalBalance: string;
}

export const fetchSuiBalance = async (address: string): Promise<SuiBalance[]> => {
  try {
    console.log('Fetching SUI balance for address:', address);
    
    const balances = await suiClient.getAllBalances({ owner: address });
    
    return balances.map(balance => ({
      coinType: balance.coinType,
      balance: balance.totalBalance,
      totalBalance: balance.totalBalance,
    }));
  } catch (error) {
    console.error('Error fetching SUI balance:', error);
    return [];
  }
};

export const formatSuiAmount = (amount: string, decimals: number = 9): string => {
  const num = parseInt(amount) / Math.pow(10, decimals);
  return num.toFixed(4);
};
