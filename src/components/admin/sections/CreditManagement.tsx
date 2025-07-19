import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Search } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { CreditReceiptsCard } from "./CreditReceiptsCard";
import { WelcomeCreditSettings } from "./WelcomeCreditSettings";

export const CreditManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminCreditUsers', searchTerm],
    queryFn: async () => {
      console.log('🔍 CreditManagement: Fetching users for credit management');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }
      
      console.log('🔐 CreditManagement: Using session:', !!session);

      let profileQuery = supabase
        .from('profiles')
        .select('id, username, full_name');

      if (searchTerm) {
        profileQuery = profileQuery.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      const { data: profiles, error } = await profileQuery;
      if (error) {
        console.error('❌ CreditManagement: Profile fetch error:', error);
        throw error;
      }

      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map(p => p.id);

      const { data: userCredits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, balance')
        .in('user_id', userIds);

      if (creditsError) {
        console.error('❌ CreditManagement: Credits fetch error:', creditsError);
      }

      return profiles.map(profile => ({
        ...profile,
        user_credits: userCredits?.filter(credit => credit.user_id === profile.id) || [],
      }));
    },
    enabled: !!user,
  });

  const adjustCreditsMutation = useMutation({
    mutationFn: async ({ userId, amount, type, description }: {
      userId: string;
      amount: number;
      type: 'add' | 'subtract';
      description: string;
    }) => {
      console.log('🔧 CreditManagement: Adjusting credits:', { userId, amount, type, description });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }

      const { data: currentCredits, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ CreditManagement: Error fetching current credits:', fetchError);
        throw fetchError;
      }

      const currentBalance = currentCredits?.balance || 0;
      const newBalance = type === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount);

      console.log('📊 CreditManagement: Balance change:', { currentBalance, newBalance });

      if (currentCredits) {
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ CreditManagement: Error updating credits:', updateError);
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: newBalance,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error('❌ CreditManagement: Error creating credits:', insertError);
          throw insertError;
        }
      }

      const transactionType = type === 'add' ? 'earned' : 'spent';
      const transactionAmount = type === 'add' ? amount : amount;
      
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          transaction_type: transactionType,
          amount: transactionAmount,
          description: description || `Admin ${type === 'add' ? 'credit grant' : 'credit deduction'}`,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('❌ CreditManagement: Error recording transaction:', transactionError);
        throw transactionError;
      }
      
      console.log('✅ CreditManagement: Successfully adjusted credits');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCreditUsers'] });
      setCreditAmount("");
      setDescription("");
      setSelectedUserId("");
      toast({
        title: "Success",
        description: "Credits adjusted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('💥 CreditManagement: Credit adjustment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to adjust credits.",
        variant: "destructive",
      });
    },
  });

  const handleAdjustCredits = (type: 'add' | 'subtract') => {
    if (!selectedUserId || !creditAmount) {
      toast({
        title: "Error",
        description: "Please select a user and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    adjustCreditsMutation.mutate({
      userId: selectedUserId,
      amount,
      type,
      description,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Credit Management</h1>
        <p className="text-gray-400">Adjust user credits and monitor automated payments</p>
      </div>

      <WelcomeCreditSettings />

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Adjust User Credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Search Users</Label>
            <div className="flex items-center gap-2 mt-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username or full name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {users && users.length > 0 && (
            <div>
              <Label className="text-gray-300">Select User</Label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-700 border-gray-600 rounded-md text-white"
              >
                <option value="">Select a user...</option>
                {users.map((user) => {
                  const userBalance = user.user_credits?.[0]?.balance || 0;
                  return (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.username} - {Number(userBalance).toFixed(2)} credits
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <Label className="text-gray-300">Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount..."
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Description (Optional)</Label>
            <Input
              placeholder="Reason for adjustment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleAdjustCredits('add')}
              disabled={adjustCreditsMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Credits
            </Button>
            <Button
              onClick={() => handleAdjustCredits('subtract')}
              disabled={adjustCreditsMutation.isPending}
              variant="destructive"
            >
              <Minus className="h-4 w-4 mr-1" />
              Subtract Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreditReceiptsCard />
    </div>
  );
};
