
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, DollarSign, Loader2 } from "lucide-react";
import { UserCredits } from "@/hooks/useCredits";

interface UserWallet {
  id: string;
  wallet_name?: string;
  blockchain: string;
}

interface CashoutFormProps {
  creditsData?: UserCredits;
  userWallets?: UserWallet[];
  selectedWallet: string;
  setSelectedWallet: (value: string) => void;
  cashoutAmount: number;
  setCashoutAmount: (value: number) => void;
  onCashout: () => void;
  isLoading: boolean;
}

export const CashoutForm = ({
  creditsData,
  userWallets,
  selectedWallet,
  setSelectedWallet,
  cashoutAmount,
  setCashoutAmount,
  onCashout,
  isLoading
}: CashoutFormProps) => {
  return (
    <div className="bg-gray-900/40 rounded-lg p-4">
      <div className="space-y-4">
        {/* Wallet Selection */}
        <div>
          <Label className="text-gray-300">Select Withdrawal Wallet</Label>
          <Select value={selectedWallet} onValueChange={setSelectedWallet}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
              <SelectValue placeholder="Choose a wallet for withdrawal" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {userWallets?.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id} className="text-white">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>{wallet.wallet_name || `${wallet.blockchain} Wallet`}</span>
                    <Badge variant="secondary" className="text-xs">
                      {wallet.blockchain}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(!userWallets || userWallets.length === 0) && (
            <p className="text-yellow-400 text-sm mt-1">
              You need to add a wallet before requesting cashouts.
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <Label className="text-gray-300">Credits to Cash Out</Label>
          <div className="relative mt-1">
            <Input
              type="number"
              value={cashoutAmount}
              onChange={(e) => setCashoutAmount(Number(e.target.value))}
              className="bg-gray-700 border-gray-600 text-white pr-20"
              placeholder="Enter amount..."
              min="5"
              max={Math.floor((creditsData?.balance || 0) / 5) * 5}
              step="5"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              ≈ {(cashoutAmount / 5).toFixed(2)} USDC
            </div>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">
              Min: 5 credits (1 USDC)
            </span>
            <span className="text-gray-400">
              Max: {Math.floor((creditsData?.balance || 0) / 5) * 5} credits
            </span>
          </div>
        </div>

        <Button
          onClick={onCashout}
          disabled={
            !selectedWallet ||
            !cashoutAmount ||
            cashoutAmount < 5 ||
            cashoutAmount > (creditsData?.balance || 0) ||
            isLoading ||
            (userWallets?.length || 0) === 0
          }
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Request Cashout
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
