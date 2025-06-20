
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/integrations/supabase/types";

type Wallet = Database["public"]["Tables"]["user_wallets"]["Row"];

interface EditWalletModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (walletId: string, updates: { wallet_name: string; is_primary: boolean }) => void;
  isSaving: boolean;
}

export const EditWalletModal = ({ wallet, isOpen, onClose, onSave, isSaving }: EditWalletModalProps) => {
  const [formData, setFormData] = useState({
    wallet_name: "",
    is_primary: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (wallet) {
      setFormData({
        wallet_name: wallet.wallet_name || "",
        is_primary: wallet.is_primary || false
      });
      setErrors({});
    }
  }, [wallet]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.wallet_name.trim()) {
      newErrors.wallet_name = "Wallet name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet || !validateForm()) return;
    
    onSave(wallet.id, formData);
    onClose();
  };

  if (!wallet) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit Wallet</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Wallet Name</Label>
            <Input
              value={formData.wallet_name}
              onChange={(e) => setFormData({ ...formData, wallet_name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., My Main Wallet"
            />
            {errors.wallet_name && (
              <p className="text-red-400 text-sm mt-1">{errors.wallet_name}</p>
            )}
          </div>

          <div>
            <Label className="text-gray-300">Wallet Address (Read-only)</Label>
            <Input
              value={wallet.wallet_address}
              disabled
              className="bg-gray-600 border-gray-600 text-gray-400 font-mono"
            />
          </div>

          <div>
            <Label className="text-gray-300">Blockchain (Read-only)</Label>
            <Input
              value={wallet.blockchain.toUpperCase()}
              disabled
              className="bg-gray-600 border-gray-600 text-gray-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit_is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => setFormData({ ...formData, is_primary: !!checked })}
              className="border-gray-600"
            />
            <Label htmlFor="edit_is_primary" className="text-gray-300">
              Set as primary wallet (for payouts and rewards)
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
