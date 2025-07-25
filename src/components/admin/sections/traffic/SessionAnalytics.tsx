import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { SessionData } from "./useTrafficAnalyticsData";

interface SessionAnalyticsProps {
  data?: SessionData;
}

export const SessionAnalytics = ({ data }: SessionAnalyticsProps) => {
  if (!data) {
    return (
      <div className="grid gap-4">
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

  // Mock data for demonstration
  const mockSessionDurations = [
    { range: '0-10s', count: 125 },
    { range: '11-30s', count: 89 },
    { range: '31-60s', count: 156 },
    { range: '1-3m', count: 234 },
    { range: '3-10m', count: 189 },
    { range: '10-30m', count: 94 },
    { range: '30m+', count: 32 }
  ];

  const mockPageViewDistribution = [
    { pages: '1 page', sessions: 285 },
    { pages: '2 pages', sessions: 198 },
    { pages: '3-5 pages', sessions: 167 },
    { pages: '6-10 pages', sessions: 89 },
    { pages: '11-20 pages', sessions: 45 },
    { pages: '20+ pages', sessions: 18 }
  ];

  const mockHourlyActivity = [
    { hour: 0, sessions: 12, pageViews: 18 },
    { hour: 1, sessions: 8, pageViews: 12 },
    { hour: 2, sessions: 5, pageViews: 8 },
    { hour: 3, sessions: 4, pageViews: 6 },
    { hour: 4, sessions: 6, pageViews: 9 },
    { hour: 5, sessions: 11, pageViews: 17 },
    { hour: 6, sessions: 18, pageViews: 28 },
    { hour: 7, sessions: 25, pageViews: 42 },
    { hour: 8, sessions: 35, pageViews: 58 },
    { hour: 9, sessions: 48, pageViews: 78 },
    { hour: 10, sessions: 52, pageViews: 89 },
    { hour: 11, sessions: 58, pageViews: 95 },
    { hour: 12, sessions: 62, pageViews: 108 },
    { hour: 13, sessions: 65, pageViews: 112 },
    { hour: 14, sessions: 71, pageViews: 125 },
    { hour: 15, sessions: 68, pageViews: 118 },
    { hour: 16, sessions: 64, pageViews: 102 },
    { hour: 17, sessions: 59, pageViews: 94 },
    { hour: 18, sessions: 45, pageViews: 72 },
    { hour: 19, sessions: 38, pageViews: 61 },
    { hour: 20, sessions: 32, pageViews: 48 },
    { hour: 21, sessions: 28, pageViews: 42 },
    { hour: 22, sessions: 22, pageViews: 35 },
    { hour: 23, sessions: 16, pageViews: 24 }
  ];

  const mockWeeklyTrends = [
    { date: '2024-01-15', sessions: 425, pageViews: 892, uniqueVisitors: 325 },
    { date: '2024-01-16', sessions: 389, pageViews: 756, uniqueVisitors: 298 },
    { date: '2024-01-17', sessions: 512, pageViews: 1043, uniqueVisitors: 398 },
    { date: '2024-01-18', sessions: 478, pageViews: 978, uniqueVisitors: 365 },
    { date: '2024-01-19', sessions: 556, pageViews: 1156, uniqueVisitors: 425 },
    { date: '2024-01-20', sessions: 445, pageViews: 867, uniqueVisitors: 338 },
    { date: '2024-01-21', sessions: 398, pageViews: 782, uniqueVisitors: 312 }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="grid gap-4">
      {/* Weekly Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <TrendingUp className="h-5 w-5 mr-2" />
          <CardTitle className="text-lg font-semibold">Weekly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockWeeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Sessions"
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Page Views"
              />
              <Line 
                type="monotone" 
                dataKey="uniqueVisitors" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Unique Visitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <Clock className="h-5 w-5 mr-2" />
          <CardTitle className="text-lg font-semibold">Hourly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockHourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" />
              <Bar dataKey="pageViews" fill="#8884d8" name="Page Views" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Session Duration Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockSessionDurations}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percent }) => `${range} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {mockSessionDurations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Page Views Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pages per Session</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockPageViewDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="pages" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};