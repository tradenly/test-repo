
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DailyActivityData {
  date: string;
  sessions: number;
  revenue: number;
}

interface DailyActivityChartProps {
  data: DailyActivityData[];
}

export const DailyActivityChart = ({ data }: DailyActivityChartProps) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '6px'
            }}
          />
          <Line type="monotone" dataKey="sessions" stroke="#3B82F6" name="Sessions" />
          <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
