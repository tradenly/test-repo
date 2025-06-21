
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, CreditCard } from "lucide-react";
import { PaymentAddressModal } from "./PaymentAddressModal";

interface PhantomCreditPurchaseCardProps {
  className?: string;
}

export const PhantomCreditPurchaseCard = ({ className }: PhantomCreditPurchaseCardProps) => {
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const blockchains = [
    { value: "solana", label: "Solana", symbol: "SOL" },
    { value: "ethereum", label: "Ethereum", symbol: "ETH" },
    { value: "bitcoin", label: "Bitcoin", symbol: "BTC" },
    { value: "sui", label: "SUI", symbol: "SUI" }
  ];

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom wallet is not installed. Please install it from phantom.app");
        setIsConnecting(false);
        return;
      }

      // Connect to Phantom
      const response = await window.solana.connect();
      setWalletAddress(response.publicKey.toString());
      setIsWalletConnected(true);
      console.log("Connected to Phantom:", response.publicKey.toString());
    } catch (error) {
      console.error("Failed to connect to Phantom:", error);
      alert("Failed to connect to Phantom wallet");
    }
    setIsConnecting(false);
  };

  const handleDisconnectWallet = () => {
    if (window.solana) {
      window.solana.disconnect();
    }
    setIsWalletConnected(false);
    setWalletAddress("");
  };

  const handleSubmit = () => {
    if (!selectedBlockchain || !isWalletConnected || !creditAmount) {
      alert("Please select a blockchain, connect your wallet, and enter a credit amount");
      return;
    }

    const credits = parseInt(creditAmount);
    if (credits <= 0) {
      alert("Please enter a valid credit amount");
      return;
    }

    // Generate payment address and required amount based on blockchain
    const getPaymentInfo = (blockchain: string) => {
      const baseAddresses = {
        solana: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        ethereum: "0x742d35Cc6634C0532925a3b8D3aC6b4B4e0a47",
        bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        sui: "0x123456789abcdef123456789abcdef123456789abcdef"
      };
      
      const rates = {
        solana: 0.001,
        ethereum: 0.0001,
        bitcoin: 0.000001,
        sui: 0.01
      };

      const selectedChain = blockchains.find(b => b.value === blockchain);
      const rate = rates[blockchain as keyof typeof rates];
      const requiredAmount = (credits * rate).toFixed(6);
      
      return {
        address: baseAddresses[blockchain as keyof typeof baseAddresses],
        amount: `${requiredAmount} ${selectedChain?.symbol}`
      };
    };

    const paymentInfo = getPaymentInfo(selectedBlockchain);
    setShowPaymentModal(true);
  };

  const selectedChain = blockchains.find(b => b.value === selectedBlockchain);
  const paymentInfo = selectedChain ? {
    address: {
      solana: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      ethereum: "0x742d35Cc6634C0532925a3b8D3aC6b4B4e0a47",
      bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      sui: "0x123456789abcdef123456789abcdef123456789abcdef"
    }[selectedBlockchain as keyof typeof Object],
    amount: creditAmount ? `${(parseInt(creditAmount) * 0.001).toFixed(6)} ${selectedChain.symbol}` : "0"
  } : { address: "", amount: "0" };

  return (
    <>
      <Card className={`bg-gray-800 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Credits with Crypto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="blockchain" className="text-gray-300">
              Select Blockchain
            </Label>
            <Select value={selectedBlockchain} onValueChange={setSelectedBlockchain}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose blockchain..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {blockchains.map((blockchain) => (
                  <SelectItem
                    key={blockchain.value}
                    value={blockchain.value}
                    className="text-white hover:bg-gray-600"
                  >
                    {blockchain.label} ({blockchain.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300">Phantom Wallet</Label>
            {!isWalletConnected ? (
              <Button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Phantom Wallet"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">✓ Wallet Connected</p>
                  <p className="text-gray-300 text-xs font-mono">
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                  </p>
                </div>
                <Button
                  onClick={handleDisconnectWallet}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="credits" className="text-gray-300">
              Credits to Purchase
            </Label>
            <Input
              id="credits"
              type="number"
              placeholder="Enter amount..."
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              min="1"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedBlockchain || !isWalletConnected || !creditAmount}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
          >
            Generate Payment Address
          </Button>
        </CardContent>
      </Card>

      <PaymentAddressModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        blockchain={selectedChain?.label || ""}
        creditAmount={parseInt(creditAmount) || 0}
        paymentAddress={paymentInfo.address}
        requiredAmount={paymentInfo.amount}
      />
    </>
  );
};
