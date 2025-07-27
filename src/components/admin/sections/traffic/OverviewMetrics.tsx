import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Eye, Clock, BarChart3 } from "lucide-react";
import { TrafficMetrics } from "./useTrafficAnalytics";

interface OverviewMetricsProps {
  data: TrafficMetrics;
}

export const OverviewMetrics = ({ data }: OverviewMetricsProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const metrics = [
    {
      title: "Total Sessions",
      value: data.totalSessions.toLocaleString(),
      icon: TrendingUp,
      description: "Total visitor sessions"
    },
    {
      title: "Unique Visitors",
      value: data.uniqueVisitors.toLocaleString(),
      icon: Users,
      description: "Unique IP addresses"
    },
    {
      title: "Page Views",
      value: data.totalPageViews.toLocaleString(),
      icon: Eye,
      description: "Total pages viewed"
    },
    {
      title: "Avg. Session Duration",
      value: formatDuration(data.averageSessionDuration),
      icon: Clock,
      description: "Average time per session"
    },
    {
      title: "Bounce Rate",
      value: `${data.bounceRate.toFixed(1)}%`,
      icon: BarChart3,
      description: "Single-page sessions"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};