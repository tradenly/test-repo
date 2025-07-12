
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { 
  Calculator, 
  PieChart, 
  TrendingUp, 
  Coins, 
  BarChart3, 
  Hash,
  ExternalLink,
  Wrench
} from "lucide-react";

interface FreeToolsSectionProps {
  user: UnifiedUser;
}

export const FreeToolsSection = ({ user }: FreeToolsSectionProps) => {
  const tools = [
    {
      title: "Crypto Calculator",
      description: "Calculate crypto conversions and portfolio values",
      icon: Calculator,
      status: "Available",
      action: "Use Tool"
    },
    {
      title: "Portfolio Tracker",
      description: "Track your crypto portfolio performance",
      icon: PieChart,
      status: "Available",
      action: "Launch"
    },
    {
      title: "Market Analysis",
      description: "Basic market trends and analysis tools",
      icon: TrendingUp,
      status: "Available",
      action: "Analyze"
    },
    {
      title: "Yield Calculator",
      description: "Calculate potential staking and farming yields",
      icon: Coins,
      status: "Available",
      action: "Calculate"
    },
    {
      title: "Price Alerts",
      description: "Set up price alerts for your favorite tokens",
      icon: BarChart3,
      status: "Coming Soon",
      action: "Notify Me"
    },
    {
      title: "Hash Converter",
      description: "Convert between different hash formats",
      icon: Hash,
      status: "Available",
      action: "Convert"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wrench className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Free Tools</h1>
          <p className="text-gray-400">
            Access powerful crypto and blockchain tools at no cost
          </p>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-blue-400 font-semibold">Free Access</span>
        </div>
        <p className="text-gray-300 text-sm">
          All tools in this section are completely free to use. Some advanced features may require credits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <tool.icon className="h-6 w-6 text-blue-400" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  tool.status === 'Available' 
                    ? 'bg-green-900/30 text-green-400 border border-green-600/30' 
                    : 'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30'
                }`}>
                  {tool.status}
                </span>
              </div>
              <CardTitle className="text-white text-lg">{tool.title}</CardTitle>
              <CardDescription className="text-gray-400">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                className={`w-full ${
                  tool.status === 'Available'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                disabled={tool.status !== 'Available'}
              >
                {tool.status === 'Available' && <ExternalLink className="h-4 w-4 mr-2" />}
                {tool.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Request a Tool</CardTitle>
          <CardDescription className="text-gray-400">
            Have an idea for a useful crypto tool? Let us know and we'll consider adding it to our free tools collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Submit Tool Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
