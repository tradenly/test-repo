
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialData {
  name: string;
  spent: number;
  earned: number;
  profit: number;
  avgPerSession: string;
}

interface FinancialPerformanceChartProps {
  data: FinancialData[];
}

export const FinancialPerformanceChart = ({ data }: FinancialPerformanceChartProps) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="spent" fill="#EF4444" name="Credits Spent" />
          <Bar dataKey="earned" fill="#10B981" name="Credits Earned" />
          <Bar dataKey="profit" fill="#3B82F6" name="Net Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
