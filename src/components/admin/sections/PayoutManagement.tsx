
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PayoutManagement = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Payout Management</h1>
        <p className="text-gray-400">Authorize and manage user payouts</p>
      </div>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Payout management features will be implemented when payment integration is added to the system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
