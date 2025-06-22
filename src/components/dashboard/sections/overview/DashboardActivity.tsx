
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface DashboardActivityProps {
  user: UnifiedUser;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  amount?: number;
  status: string;
  date: string;
  metadata?: any;
}

// Type guard for metadata to ensure safe property access
const isMetadataObject = (metadata: any): metadata is Record<string, any> => {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata);
};

// Safe accessor for metadata properties
const getMetadataProperty = (metadata: any, property: string): any => {
  if (isMetadataObject(metadata) && property in metadata) {
    return metadata[property];
  }
  return null;
};

export const DashboardActivity = ({ user }: DashboardActivityProps) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["dashboard-activity", user.id],
    queryFn: async () => {
      console.log("Fetching dashboard activity for user:", user.id);
      
      // Fetch recent credit transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }
      
      // Fetch recent game sessions
      const { data: gameSessions, error: gameSessionsError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (gameSessionsError) {
        console.error("Error fetching game sessions:", gameSessionsError);
        throw gameSessionsError;
      }
      
      // Fetch recent cashout requests
      const { data: cashoutRequests, error: cashoutError } = await supabase
        .from("credit_cashout_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (cashoutError) {
        console.error("Error fetching cashout requests:", cashoutError);
        throw cashoutError;
      }
      
      const activities: ActivityItem[] = [];
      
      // Process credit transactions
      transactions?.forEach(transaction => {
        let description = transaction.description || transaction.transaction_type;
        let type = transaction.transaction_type;
        
        // Special handling for cashout completion notifications with safe metadata access
        if (getMetadataProperty(transaction.metadata, 'cashout_completed')) {
          const cryptoAmount = getMetadataProperty(transaction.metadata, 'crypto_amount');
          const transactionId = getMetadataProperty(transaction.metadata, 'transaction_id');
          
          description = `Cashout Complete • ${cryptoAmount} USDC`;
          if (transactionId) {
            description += ` • TX: ${String(transactionId).substring(0, 8)}...`;
          }
          type = 'cashout_completed';
        }
        
        activities.push({
          id: transaction.id,
          type,
          description,
          amount: transaction.amount,
          status: transaction.status,
          date: transaction.created_at,
          metadata: transaction.metadata,
        });
      });
      
      // Process game sessions
      gameSessions?.forEach(session => {
        activities.push({
          id: session.id,
          type: 'game_session',
          description: `${session.game_type.replace('_', ' ')} - Score: ${session.score}`,
          amount: session.credits_earned,
          status: 'completed',
          date: session.created_at,
        });
      });
      
      // Process cashout requests (non-completed ones)
      cashoutRequests?.forEach(request => {
        if (request.status !== 'completed') {
          let description = `Cashout Request - ${request.amount_crypto} USDC`;
          if (request.status === 'pending') {
            description += ' • Pending Approval';
          } else if (request.status === 'approved') {
            description += ' • Approved - Processing';
          } else if (request.status === 'rejected') {
            description += ' • Rejected';
          }
          
          activities.push({
            id: request.id,
            type: 'cashout_request',
            description,
            amount: request.amount_credits,
            status: request.status,
            date: request.created_at,
          });
        }
      });
      
      // Sort all activities by date
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log("Dashboard activities:", activities);
      return activities.slice(0, 10);
    },
    enabled: !!user.id,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase': return '💳';
      case 'earned': return '🎮';
      case 'spent': return '🎯';
      case 'cashout': return '💰';
      case 'cashout_completed': return '✅';
      case 'cashout_request': return '⏳';
      case 'bonus': return '🎁';
      case 'refund': return '↩️';
      case 'nft_verification': return '🖼️';
      case 'memecoin_verification': return '🪙';
      case 'game_session': return '🎮';
      default: return '📄';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'approved': return 'bg-blue-600';
      case 'failed': return 'bg-red-600';
      case 'rejected': return 'bg-red-600';
      case 'cancelled': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const isPositiveActivity = (type: string, amount?: number) => {
    if (type === 'cashout_completed') return true; // Show as positive news
    if (type === 'game_session' && amount && amount > 0) return true;
    return ['purchase', 'earned', 'bonus', 'nft_verification', 'memecoin_verification', 'refund'].includes(type);
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="text-gray-400">Loading recent activity...</div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between border-b border-gray-700 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {activity.description}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(activity.date).toLocaleDateString()} at{' '}
                      {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  {activity.amount !== undefined && activity.amount !== 0 && activity.type !== 'cashout_completed' && (
                    <div className={`text-sm font-medium ${
                      isPositiveActivity(activity.type, activity.amount) ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositiveActivity(activity.type, activity.amount) ? '+' : ''}
                      {activity.amount}
                    </div>
                  )}
                  <Badge className={`text-xs ${getStatusBadgeColor(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">
              No recent activity. Start playing games or managing your credits!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
