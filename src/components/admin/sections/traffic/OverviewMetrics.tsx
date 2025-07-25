import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Eye, Clock, MousePointer } from "lucide-react";
import { TrafficOverview } from "./useTrafficAnalyticsData";

interface OverviewMetricsProps {
  data?: TrafficOverview;
}

export const OverviewMetrics = ({ data }: OverviewMetricsProps) => {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const metrics = [
    {
      title: "Total Visitors",
      value: data.totalVisitors.toLocaleString(),
      icon: Users,
      description: "Last 7 days",
      trend: null // Can be calculated with historical data
    },
    {
      title: "Page Views",
      value: data.totalPageViews.toLocaleString(),
      icon: Eye,
      description: "Total page views",
      trend: null
    },
    {
      title: "Avg. Session Duration",
      value: formatDuration(data.averageSessionDuration),
      icon: Clock,
      description: "Time spent on site",
      trend: null
    },
    {
      title: "Bounce Rate",
      value: `${data.bounceRate.toFixed(1)}%`,
      icon: MousePointer,
      description: "Single page sessions",
      trend: data.bounceRate > 50 ? 'down' : 'up'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">{metric.value}</div>
              {metric.trend && (
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Additional Stats Cards */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Visitor Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {data.newVisitors.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">New Visitors</p>
              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${data.totalVisitors ? (data.newVisitors / data.totalVisitors) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {data.returningVisitors.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Returning Visitors</p>
              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${data.totalVisitors ? (data.returningVisitors / data.totalVisitors) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Countries */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{country.country}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {country.visitors}
                  </span>
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {country.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};