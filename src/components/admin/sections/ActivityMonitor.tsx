
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Coins, Gamepad2 } from "lucide-react";

export const ActivityMonitor = () => {
  const { data: recentActivity, isLoading } = useQuery({
    queryKey: ['adminActivity'],
    queryFn: async () => {
      // Get recent credit transactions
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get recent game sessions
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      return {
        transactions: transactions || [],
        sessions: sessions || [],
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Activity Monitor</h1>
        <div className="text-gray-400">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Activity Monitor</h1>
        <p className="text-gray-400">Real-time user activity and system events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-400" />
              Recent Credit Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity?.transactions?.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">
                      {transaction.profiles?.username || 'Unknown User'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {transaction.description || transaction.transaction_type}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-blue-400" />
              Recent Game Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActivity?.sessions?.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">
                      {session.profiles?.username || 'Unknown User'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Score: {session.score} | Duration: {session.duration_seconds}s
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm">
                    <div className="text-green-400">+{session.credits_earned}</div>
                    <div className="text-red-400">-{session.credits_spent}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
