import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrafficAnalyticsData } from "./traffic/useTrafficAnalyticsData";
import { OverviewMetrics } from "./traffic/OverviewMetrics";
import { RealTimeVisitors } from "./traffic/RealTimeVisitors";
import { GeographicDistribution } from "./traffic/GeographicDistribution";
import { DeviceBrowserAnalytics } from "./traffic/DeviceBrowserAnalytics";
import { TrafficSources } from "./traffic/TrafficSources";
import { PopularPages } from "./traffic/PopularPages";
import { SessionAnalytics } from "./traffic/SessionAnalytics";
import { Loader2 } from "lucide-react";

export const TrafficAnalytics = () => {
  const { data, isLoading, error } = useTrafficAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading traffic analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
              <p>Unable to load traffic analytics data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Traffic Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into your website traffic and visitor behavior
        </p>
      </div>

      {/* Overview Metrics */}
      <OverviewMetrics data={data?.overview} />

      <Tabs defaultValue="real-time" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="real-time">Real-time</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="real-time" className="space-y-4">
          <RealTimeVisitors data={data?.realTime} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <GeographicDistribution data={data?.geography} />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <DeviceBrowserAnalytics data={data?.devices} />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <TrafficSources data={data?.sources} />
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <PopularPages data={data?.pages} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionAnalytics data={data?.sessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};