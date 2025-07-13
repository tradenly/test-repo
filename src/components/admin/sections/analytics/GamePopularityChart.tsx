
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const gameColors = {
  flappy_hippos: '#3B82F6',
  poopee_crush: '#10B981', 
  falling_logs: '#F59E0B'
};

interface GamePopularityData {
  name: string;
  value: number;
  percentage: string;
}

interface GamePopularityChartProps {
  data: GamePopularityData[];
}

export const GamePopularityChart = ({ data }: GamePopularityChartProps) => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={Object.values(gameColors)[index % Object.values(gameColors).length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
