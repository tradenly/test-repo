
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { Coins, TrendingUp, Users, Zap, Coffee } from "lucide-react";

interface TokenomicsProps {
  user: UnifiedUser;
}

const tokenDistributionData = [
  { name: "Public Sale", value: 40, color: "#8B5CF6" },
  { name: "Liquidity Pool", value: 25, color: "#06B6D4" },
  { name: "Team & Advisors", value: 15, color: "#10B981" },
  { name: "Marketing", value: 10, color: "#F59E0B" },
  { name: "Reserve", value: 10, color: "#EF4444" },
];

const fundingAllocation = [
  {
    icon: Coins,
    title: "Staking Pool & Cash Out Rewards Funding",
    description: "A significant portion of raised funds will be allocated to stock the staking pools, ensuring sustainable rewards and smooth cash-out processes for our P2E games & DEX LP.",
    percentage: "40%"
  },
  {
    icon: TrendingUp,
    title: "Development & Partnerships",
    description: "Continued development of new features, games, and strategic partnerships to expand the POOPEE ecosystem and enhance user experience.",
    percentage: "25%"
  },
  {
    icon: Users,
    title: "Operations & Team",
    description: "Operational expenses, team salaries, and maintaining the platform infrastructure to ensure everything runs smoothly.",
    percentage: "25%"
  },
  {
    icon: Coffee,
    title: "Staying Functional",
    description: "We will always use a portion of the funds to stay as drunk and high as possible, while trying our best not to overdose. Transparency is key.",
    percentage: "10%"
  }
];

export const TokenomicsSection = ({ user }: TokenomicsProps) => {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">💩 POOPEE Tokenomics</h1>
        <p className="text-gray-400">
          Complete transparency on token distribution and fund allocation. No bullshit, just facts.
        </p>
      </div>

      {/* Token Distribution Chart */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            Token Distribution
          </CardTitle>
          <CardDescription className="text-gray-400">
            How POOPEE tokens will be distributed across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#F9FAFB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fund Allocation */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Fund Allocation Strategy
          </CardTitle>
          <CardDescription className="text-gray-400">
            How we plan to use the funds raised - with brutal honesty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {fundingAllocation.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-100">{item.title}</h3>
                        <span className="text-sm font-bold text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
                          {item.percentage}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-900/20 border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-200 mb-2">Disclaimer</h3>
              <p className="text-yellow-300/80 text-sm leading-relaxed">
                POOPEE is a meme coin and NFT collection with no real purpose, no roadmap, and absolutely no future. 
                Just like every other project pretending otherwise — we're just the first to admit it. 
                This tokenomics breakdown is our commitment to transparency, even about the parts that don't make sense.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
