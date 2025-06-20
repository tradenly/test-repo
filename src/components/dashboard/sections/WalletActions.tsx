
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
  Copy
} from "lucide-react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface WalletActionsProps {
  user: UnifiedUser;
}

export const WalletActions = ({ user }: WalletActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

  // Get user's wallet address
  const walletAddress = user.walletAddress || user.email;

  // Fetch SUI balance
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ["suiBalance", walletAddress],
    queryFn: async () => {
      if (!user.walletAddress) return "0";
      
      try {
        const balanceData = await suiClient.getBalance({
          owner: user.walletAddress,
          coinType: "0x2::sui::SUI"
        });
        return (parseInt(balanceData.totalBalance) / 1000000000).toFixed(4); // Convert from MIST to SUI
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        return "0";
      }
    },
    enabled: !!user.walletAddress,
  });

  const handleRefreshBalance = () => {
    refetchBalance();
    toast({
      title: "Balance refreshed",
      description: "Your SUI balance has been updated.",
    });
  };

  const handleSend = () => {
    if (!user.walletAddress) {
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
    toast({
      title: "View Assets",
      description: "Asset viewing feature coming soon!",
    });
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
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      toast({
        title: "Address copied",
        description: "Your wallet address has been copied to clipboard.",
      });
    }
  };

  const submitSendTransaction = () => {
    // For now, just show a toast - actual transaction implementation would need proper signing
    toast({
      title: "Send Transaction",
      description: `Would send ${sendAmount} SUI to ${recipientAddress}. Transaction signing coming soon!`,
    });
    setShowSendForm(false);
    setSendAmount("");
    setRecipientAddress("");
  };

  if (!user.walletAddress) {
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
          <p className="text-gray-400 text-sm">
            Address: {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
          </p>
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
              View Assets
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
                disabled={!sendAmount || !recipientAddress}
                className="bg-blue-600 hover:bg-blue-500"
              >
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

            <p className="text-sm text-gray-400">
              Note: Transaction signing implementation coming soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
