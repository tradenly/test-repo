
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewMetrics } from "./analytics/OverviewMetrics";
import { GamePopularityChart } from "./analytics/GamePopularityChart";
import { FinancialPerformanceChart } from "./analytics/FinancialPerformanceChart";
import { DailyActivityChart } from "./analytics/DailyActivityChart";
import { TopPlayersTable } from "./analytics/TopPlayersTable";
import { GamePerformanceCards } from "./analytics/GamePerformanceCards";
import { useAnalyticsData } from "./analytics/useAnalyticsData";

export const AdminAnalytics = () => {
  const { data: analytics, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="text-gray-400">Loading comprehensive analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="text-gray-400">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive insights into game performance and user engagement</p>
      </div>

      {/* Overview Metrics Cards */}
      <OverviewMetrics data={analytics.overview} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Popularity Pie Chart */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Game Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <GamePopularityChart data={analytics.gamePopularityData} />
          </CardContent>
        </Card>

        {/* Financial Performance */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Performance by Game</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialPerformanceChart data={analytics.gameFinancialData} />
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Activity (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyActivityChart data={analytics.dailyActivityData} />
        </CardContent>
      </Card>

      {/* Top Players Table */}
      <TopPlayersTable players={analytics.topPlayers} />

      {/* Game Performance Details */}
      <GamePerformanceCards gameStats={analytics.gameStats} />
    </div>
  );
};
