
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
            Payment Instructions
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
              <span className="font-medium">Amount Required:</span> {requiredAmount}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send payment to this address:
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

          <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded-lg">
            <p className="text-yellow-200 text-xs">
              <strong>Important:</strong> Send exactly the required amount to the address above. 
              Your credits will be added to your account once the transaction is confirmed.
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
