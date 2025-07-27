import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrafficMetrics } from "./useTrafficAnalytics";

interface GeographicDistributionProps {
  data: TrafficMetrics;
}

export const GeographicDistribution = ({ data }: GeographicDistributionProps) => {
  const chartData = data.geoData.slice(0, 10).map(country => ({
    name: country.country.length > 15 ? country.country.substring(0, 15) + '...' : country.country,
    fullName: country.country,
    sessions: country.sessions,
    percentage: country.percentage
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-yellow-400">
            Sessions: {data.sessions.toLocaleString()}
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
        <CardTitle className="text-white">Geographic Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="sessions" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {data.geoData.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No geographic data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};