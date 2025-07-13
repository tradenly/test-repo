
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GamepadIcon, DollarSign, Clock } from 'lucide-react';

interface OverviewData {
  totalSessions: number;
  uniquePlayers: number;
  totalRevenue: number;
  avgSessionDuration: number;
}

interface OverviewMetricsProps {
  data: OverviewData;
}

export const OverviewMetrics = ({ data }: OverviewMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Sessions</CardTitle>
          <GamepadIcon className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data.totalSessions}</div>
          <p className="text-xs text-gray-500">Across all games</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Unique Players</CardTitle>
          <Users className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data.uniquePlayers}</div>
          <p className="text-xs text-gray-500">Active users</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{data.totalRevenue.toFixed(0)} Credits</div>
          <p className="text-xs text-gray-500">Net profit</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Avg Session Time</CardTitle>
          <Clock className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{Math.round(data.avgSessionDuration)}s</div>
          <p className="text-xs text-gray-500">Per session</p>
        </CardContent>
      </Card>
    </div>
  );
};
