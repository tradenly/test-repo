import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { RealTimeData } from "./useTrafficAnalyticsData";
import { formatDistanceToNow } from "date-fns";

interface RealTimeVisitorsProps {
  data?: RealTimeData;
}

export const RealTimeVisitors = ({ data }: RealTimeVisitorsProps) => {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Active Visitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Active Visitors</CardTitle>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="text-4xl font-bold text-green-600">
              {data.activeVisitors}
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Visitors active in the last 15 minutes
          </p>
        </CardContent>
      </Card>

      {/* Current Page Views */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current Page Views</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {data.currentPageViews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active page views</p>
              ) : (
                data.currentPageViews.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {page.page}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {page.viewers}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                data.recentActivity.map((activity) => {
                  const DeviceIcon = getDeviceIcon(activity.device);
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium truncate">
                            {activity.page}
                          </span>
                          {activity.isNewVisitor && (
                            <Badge variant="outline" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{activity.country}</span>
                          <span>•</span>
                          <span>{activity.device}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};