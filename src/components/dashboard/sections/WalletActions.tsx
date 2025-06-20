
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface WalletActionsProps {
  user: UnifiedUser;
}

export const WalletActions = ({ user }: WalletActionsProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <span className="text-2xl mr-2">💰</span>
          Wallet Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center space-y-4">
        <div className="bg-blue-900/20 border border-blue-600 rounded p-4">
          <p className="text-blue-200 text-sm mb-2">
            🚧 <strong>Coming Soon:</strong> Wallet functionality will be available in a future update.
          </p>
          <p className="text-gray-400 text-xs">
            Currently logged in as: {user.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
