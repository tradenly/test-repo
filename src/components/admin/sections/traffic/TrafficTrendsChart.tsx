import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { TrafficMetrics } from "./useTrafficAnalytics";

interface TrafficTrendsChartProps {
  data: TrafficMetrics;
}

export const TrafficTrendsChart = ({ data }: TrafficTrendsChartProps) => {
  const chartData = data.dailyTraffic.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-yellow-400">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Traffic Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Sessions"
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "#1D4ED8" }}
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Page Views"
                  dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2, fill: "#047857" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-lg mb-2">📊</div>
              <p className="font-medium">No traffic data yet</p>
              <p className="text-sm mt-1">Traffic tracking is now active. Data will appear as visitors browse your site.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};