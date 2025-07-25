import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { DeviceData } from "./useTrafficAnalyticsData";

interface DeviceBrowserAnalyticsProps {
  data?: DeviceData;
}

export const DeviceBrowserAnalytics = ({ data }: DeviceBrowserAnalyticsProps) => {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  // Mock data for demonstration
  const mockDeviceTypes = [
    { type: 'Desktop', count: 450, percentage: 60 },
    { type: 'Mobile', count: 225, percentage: 30 },
    { type: 'Tablet', count: 75, percentage: 10 },
  ];

  const mockBrowsers = [
    { browser: 'Chrome', count: 400, percentage: 53.3 },
    { browser: 'Safari', count: 150, percentage: 20 },
    { browser: 'Firefox', count: 100, percentage: 13.3 },
    { browser: 'Edge', count: 75, percentage: 10 },
    { browser: 'Other', count: 25, percentage: 3.3 },
  ];

  const mockOS = [
    { os: 'Windows', count: 350, percentage: 46.7 },
    { os: 'macOS', count: 200, percentage: 26.7 },
    { os: 'iOS', count: 125, percentage: 16.7 },
    { os: 'Android', count: 50, percentage: 6.7 },
    { os: 'Linux', count: 25, percentage: 3.3 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Device Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Device Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDeviceTypes.map((device, index) => {
              const DeviceIcon = getDeviceIcon(device.type);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{device.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {device.count}
                    </span>
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Browsers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Browsers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBrowsers.map((browser, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{browser.browser}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {browser.count}
                  </span>
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${browser.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {browser.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operating Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Operating Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOS.map((os, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{os.os}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {os.count}
                  </span>
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${os.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {os.percentage.toFixed(1)}%
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