
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

export const WelcomeCreditSettings = () => {
  const [newAmount, setNewAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSetting, isLoading } = useQuery({
    queryKey: ['welcomeCreditsSettings'],
    queryFn: async () => {
      console.log('🔍 WelcomeCreditSettings: Fetching welcome credits setting');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'welcome_credits_amount')
        .single();

      if (error) {
        console.error('❌ WelcomeCreditSettings: Error fetching setting:', error);
        throw error;
      }

      console.log('✅ WelcomeCreditSettings: Current setting:', data);
      return data;
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (amount: number) => {
      console.log('🔧 WelcomeCreditSettings: Updating welcome credits amount to:', amount);
      
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: amount.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', 'welcome_credits_amount');

      if (error) {
        console.error('❌ WelcomeCreditSettings: Error updating setting:', error);
        throw error;
      }
      
      console.log('✅ WelcomeCreditSettings: Successfully updated welcome credits amount');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['welcomeCreditsSettings'] });
      setNewAmount("");
      toast({
        title: "Success",
        description: "Welcome credits amount updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('💥 WelcomeCreditSettings: Update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update welcome credits amount.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateAmount = () => {
    if (!newAmount) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    updateSettingMutation.mutate(amount);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Welcome Credits Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const currentAmount = currentSetting?.setting_value ? parseFloat(currentSetting.setting_value.toString()) : 10;

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Welcome Credits Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-2">
            Configure how many credits new users receive when they first sign up.
          </div>
          <div className="text-lg text-white">
            Current Amount: <span className="text-green-400 font-semibold">{currentAmount.toFixed(2)} credits</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">New Welcome Credits Amount</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter new amount..."
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={handleUpdateAmount}
              disabled={updateSettingMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          This change will affect all new users who sign up after the update. Existing users will not be affected.
        </div>
      </CardContent>
    </Card>
  );
};
