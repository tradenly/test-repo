
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface PaymentAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockchain: string;
  creditAmount: number;
  paymentAddress: string;
  requiredAmount: string;
}

export const PaymentAddressModal = ({ 
  isOpen, 
  onClose, 
  blockchain, 
  creditAmount, 
  paymentAddress, 
  requiredAmount 
}: PaymentAddressModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            USDC Payment Instructions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-green-400 mb-2">Payment Details</h3>
            <p className="text-sm text-gray-300 mb-1">
              <span className="font-medium">Credits to Purchase:</span> {creditAmount}
            </p>
            <p className="text-sm text-gray-300 mb-1">
              <span className="font-medium">Blockchain:</span> {blockchain}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">USDC Amount Required:</span> {requiredAmount}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send USDC to this address:
            </label>
            <div className="flex gap-2">
              <Input
                value={paymentAddress}
                readOnly
                className="bg-gray-800 border-gray-600 text-white font-mono text-xs"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                className="border-gray-600 hover:bg-gray-700"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-green-400 text-xs mt-1">Address copied to clipboard!</p>
            )}
          </div>

          <div className="bg-red-900/30 border border-red-700 p-3 rounded-lg">
            <p className="text-red-200 text-xs">
              <strong>⚠️ IMPORTANT:</strong> Send exactly {requiredAmount} to the address above. 
              Only send USDC tokens on the {blockchain} network. 
              Your credits will be added to your account once the transaction is confirmed.
            </p>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 p-3 rounded-lg">
            <p className="text-blue-200 text-xs">
              <strong>💡 Note:</strong> Make sure you're sending USDC (USD Coin) and not native tokens. 
              Double-check the network matches your selected blockchain.
            </p>
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
