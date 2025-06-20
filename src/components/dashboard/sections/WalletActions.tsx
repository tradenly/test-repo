import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Send, 
  Eye, 
  Download, 
  QrCode,
  Copy,
  ExternalLink,
  Loader2
} from "lucide-react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { suiTransactionService } from "@/services/suiTransactionService";
import { useZkLogin } from "@/hooks/useZkLogin";

interface WalletActionsProps {
  user: UnifiedUser;
}

export const WalletActions = ({ user }: WalletActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { executeTransaction } = useZkLogin();
  const [showSendForm, setShowSendForm] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  // Use mainnet to match our configuration
  const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

  // Get user's wallet address
  const walletAddress = user.walletAddress;

  // Fetch SUI balance
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ["suiBalance", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return "0";
      
      try {
        const balanceData = await suiClient.getBalance({
          owner: walletAddress,
          coinType: "0x2::sui::SUI"
        });
        return (parseInt(balanceData.totalBalance) / 1000000000).toFixed(4);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        return "0";
      }
    },
    enabled: !!walletAddress,
  });

  // Fetch user assets
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["userAssets", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      return await suiTransactionService.getUserAssets(walletAddress);
    },
    enabled: !!walletAddress && showAssets,
  });

  // Send transaction mutation
  const sendTransactionMutation = useMutation({
    mutationFn: async ({ amount, recipient }: { amount: string; recipient: string }) => {
      if (!walletAddress || user.authType !== 'zklogin') {
        throw new Error('ZK Login required for transactions');
      }

      // Create the transaction using the service
      const txResult = await suiTransactionService.createSuiTransaction(
        walletAddress,
        recipient,
        parseFloat(amount)
      );

      if (!txResult.success) {
        throw new Error(txResult.error);
      }

      // Execute the transaction using Enoki
      const executeResult = await executeTransaction(txResult.transaction);
      
      if (!executeResult.success) {
        throw new Error(executeResult.error);
      }

      return executeResult;
    },
    onSuccess: (result) => {
      toast({
        title: "Transaction Sent",
        description: `Transaction completed successfully!`,
      });
      refetchBalance();
      setShowSendForm(false);
      setSendAmount("");
      setRecipientAddress("");
    },
    onError: (error) => {
      toast({
        title: "Transaction Failed", 
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const handleRefreshBalance = () => {
    refetchBalance();
    toast({
      title: "Balance refreshed",
      description: "Your SUI balance has been updated.",
    });
  };

  const handleSend = () => {
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect a wallet to send transactions.",
        variant: "destructive",
      });
      return;
    }
    setShowSendForm(true);
  };

  const handleViewAssets = () => {
    setShowAssets(!showAssets);
  };

  const handleBackup = () => {
    if (user.authType === 'zklogin') {
      toast({
        title: "ZK Login Backup",
        description: "Your wallet is backed up through your Google account authentication.",
      });
    } else {
      toast({
        title: "Backup Wallet",
        description: "Backup feature for email accounts coming soon!",
      });
    }
  };

  const handleReceive = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied",
        description: "Your wallet address has been copied to clipboard.",
      });
    }
  };

  const handleViewOnExplorer = () => {
    if (walletAddress) {
      const explorerUrl = `https://suivision.xyz/account/${walletAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const submitSendTransaction = () => {
    if (!sendAmount || !recipientAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter both amount and recipient address.",
        variant: "destructive",
      });
      return;
    }

    sendTransactionMutation.mutate({
      amount: sendAmount,
      recipient: recipientAddress,
    });
  };

  if (!walletAddress) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">
            Wallet actions are available for ZK Login users with connected wallets.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <span className="text-2xl mr-2">💰</span>
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">
            {balanceLoading ? "Loading..." : `${balance} SUI`}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Address: {walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</span>
            <Button
              onClick={handleViewOnExplorer}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              title="View on SuiVision Explorer"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              onClick={handleReceive}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              title="Copy Address"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Wallet Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              onClick={handleRefreshBalance}
              disabled={balanceLoading}
              className="bg-gray-700 hover:bg-gray-600 flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Balance
            </Button>

            <Button
              onClick={handleSend}
              className="bg-gray-700 hover:bg-gray-600 flex items-center"
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>

            <Button
              onClick={handleViewAssets}
              className="bg-gray-700 hover:bg-gray-600 flex items-center"
            >
              <Eye className="mr-2 h-4 w-4" />
              {showAssets ? 'Hide Assets' : 'View Assets'}
            </Button>

            <Button
              onClick={handleBackup}
              className="bg-gray-700 hover:bg-gray-600 flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Backup
            </Button>

            <Button
              onClick={handleReceive}
              className="bg-gray-700 hover:bg-gray-600 flex items-center"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Receive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assets Display */}
      {showAssets && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="ml-2 text-white">Loading assets...</span>
              </div>
            ) : assets?.success ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Balances</h4>
                  <div className="space-y-2">
                    {assets.allBalances.map((balance, index) => (
                      <div key={index} className="flex justify-between text-gray-300">
                        <span>{balance.coinType === '0x2::sui::SUI' ? 'SUI' : balance.coinType}</span>
                        <span>{(parseInt(balance.totalBalance) / 1000000000).toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Objects ({assets.ownedObjects.length})</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {assets.ownedObjects.slice(0, 10).map((obj, index) => (
                      <div key={index} className="bg-gray-700/50 p-2 rounded text-sm">
                        <div className="text-gray-300">Type: {obj.data?.type || 'Unknown'}</div>
                        <div className="text-gray-400 text-xs">ID: {obj.data?.objectId}</div>
                      </div>
                    ))}
                    {assets.ownedObjects.length > 10 && (
                      <div className="text-gray-400 text-sm">
                        ...and {assets.ownedObjects.length - 10} more objects
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400">Failed to load assets: {assets?.error}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Send Form Modal */}
      {showSendForm && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Send SUI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Recipient Address</Label>
              <Input
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter recipient's address"
              />
            </div>

            <div>
              <Label className="text-gray-300">Amount (SUI)</Label>
              <Input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="0.0"
                step="0.001"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={submitSendTransaction}
                disabled={!sendAmount || !recipientAddress || sendTransactionMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {sendTransactionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Transaction
              </Button>
              <Button
                onClick={() => setShowSendForm(false)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </div>

            <p className="text-sm text-yellow-400">
              Note: Transactions are executed through Enoki's proving service.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
