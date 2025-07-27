import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrafficMetrics } from "./useTrafficAnalytics";

interface DeviceBrowserStatsProps {
  data: TrafficMetrics;
}

const DEVICE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const DeviceBrowserStats = ({ data }: DeviceBrowserStatsProps) => {
  const deviceData = data.deviceData.map((device, index) => ({
    name: device.type,
    value: device.sessions,
    percentage: device.percentage,
    color: DEVICE_COLORS[index % DEVICE_COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-yellow-400">
            Sessions: {data.value.toLocaleString()}
          </p>
          <p className="text-gray-300">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Device Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {deviceData.map((device) => (
            <div key={device.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: device.color }}
                />
                <span className="text-gray-300">{device.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{device.value}</div>
                <div className="text-gray-400 text-xs">{device.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
        {data.deviceData.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No device data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};