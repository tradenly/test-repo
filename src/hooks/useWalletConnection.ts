
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ConnectedWallet {
  type: 'metamask' | 'phantom' | 'eternl';
  address: string;
  isConnected: boolean;
}

export const useWalletConnection = () => {
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectMetaMask = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setConnectedWallet({
            type: 'metamask',
            address: accounts[0],
            isConnected: true,
          });
          toast({
            title: "MetaMask Connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your Ethereum wallet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask wallet.",
        variant: "destructive",
      });
    }
    setIsConnecting(false);
  }, [toast]);

  const connectPhantom = useCallback(async () => {
    setIsConnecting(true);
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setConnectedWallet({
          type: 'phantom',
          address: response.publicKey.toString(),
          isConnected: true,
        });
        toast({
          title: "Phantom Connected",
          description: `Connected to ${response.publicKey.toString().slice(0, 6)}...${response.publicKey.toString().slice(-4)}`,
        });
      } else {
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom to connect your Solana wallet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet.",
        variant: "destructive",
      });
    }
    setIsConnecting(false);
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    setConnectedWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  }, [toast]);

  return {
    connectedWallet,
    isConnecting,
    connectMetaMask,
    connectPhantom,
    disconnectWallet,
  };
};
