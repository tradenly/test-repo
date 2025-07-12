
interface PhantomProvider {
  isPhantom: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
}

interface MetaMaskProvider {
  isMetaMask?: boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
    ethereum?: MetaMaskProvider;
  }
}

export {};
