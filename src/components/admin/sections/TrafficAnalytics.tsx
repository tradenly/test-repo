import { useState } from "react";
import { subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { useTrafficAnalytics, DateRange } from "./traffic/useTrafficAnalytics";
import { DateRangePicker } from "./traffic/DateRangePicker";
import { OverviewMetrics } from "./traffic/OverviewMetrics";
import { TrafficSourcesChart } from "./traffic/TrafficSourcesChart";
import { TrafficTrendsChart } from "./traffic/TrafficTrendsChart";
import { TopPagesTable } from "./traffic/TopPagesTable";
import { GeographicDistribution } from "./traffic/GeographicDistribution";
import { DeviceBrowserStats } from "./traffic/DeviceBrowserStats";

export const TrafficAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const { data, loading, error } = useTrafficAnalytics(dateRange);

  // Don't show "no data" state - show the UI with empty states instead
  const displayData = data || {
    totalSessions: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    trafficSources: [],
    geoData: [],
    deviceData: [],
    dailyTraffic: []
  };

  const handleExport = () => {
    if (!data || data.totalSessions === 0) return;
    
    const csvData = [
      'Metric,Value',
      `Total Sessions,${data.totalSessions}`,
      `Unique Visitors,${data.uniqueVisitors}`,
      `Total Page Views,${data.totalPageViews}`,
      `Average Session Duration,${data.averageSessionDuration}`,
      `Bounce Rate,${data.bounceRate}%`,
      '',
      'Top Pages',
      'Page,Views,Percentage',
      ...data.topPages.map(page => `"${page.page}",${page.views},${page.percentage.toFixed(1)}%`),
      '',
      'Traffic Sources',
      'Source,Sessions,Percentage',
      ...data.trafficSources.map(source => `"${source.source}",${source.sessions},${source.percentage.toFixed(1)}%`)
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traffic-analytics-${dateRange.from.toISOString().split('T')[0]}-to-${dateRange.to.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading traffic analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="pt-6">
            <div className="text-red-400 text-center">
              <p className="font-medium">Error loading traffic data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Traffic Analytics</h1>
          <p className="text-gray-400 mt-1">
            Monitor and analyze your website traffic patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <OverviewMetrics data={displayData} />

      {/* Status Banner for New Tracking */}
      {displayData.totalSessions === 0 && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3 text-blue-400">
            <div className="animate-pulse w-2 h-2 bg-blue-400 rounded-full"></div>
            <div>
              <p className="font-medium">Traffic Tracking Active</p>
              <p className="text-sm text-blue-300 mt-1">
                Your site is now tracking visitor data. Charts will populate as visitors browse your website.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficTrendsChart data={displayData} />
        <TrafficSourcesChart data={displayData} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeographicDistribution data={displayData} />
        <DeviceBrowserStats data={displayData} />
      </div>

      {/* Top Pages Table */}
      <TopPagesTable data={displayData} />
    </div>
  );
};