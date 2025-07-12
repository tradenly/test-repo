import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { ToolRequestDialog } from "./ToolRequestDialog";
import { UserToolRequestsView } from "./UserToolRequestsView";
import { 
  Calculator, 
  PieChart, 
  TrendingUp, 
  Coins, 
  BarChart3, 
  Hash,
  ExternalLink,
  Wrench,
  Info,
  Sparkles
} from "lucide-react";

interface FreeToolsSectionProps {
  user: UnifiedUser;
}

export const FreeToolsSection = ({ user }: FreeToolsSectionProps) => {
  const tools = [
    {
      title: "MetaMint",
      description: "AI generated Meta data",
      icon: Sparkles,
      status: "Available",
      action: "Use Tool",
      url: "https://metamint-ai.vercel.app/",
      hasPopup: true,
      popupContent: {
        title: "🚨 Introducing MetaMint – Your Image-to-Metadata AI Tool 💾🎨",
        description: "MetaMint uses TensorFlow.js to analyze your NFT collection images locally and automatically detect traits like backgrounds, accessories, clothing, and more — perfect for AI-generated PFPs or 1/1s with no layer files. Just upload, train the model with examples, and let MetaMint generate full metadata in JSON + CSV formats — complete with rarity stats.",
        features: [
          "🧠 Powered by browser-based AI",
          "🔐 Fully client-side (nothing is uploaded anywhere)",
          "📦 Outputs ready-to-mint metadata",
          "💯 Free to use while we test"
        ]
      }
    },
    {
      title: "Portfolio Tracker",
      description: "Track your crypto portfolio performance",
      icon: PieChart,
      status: "Coming Soon",
      action: "Notify Me",
      hasPopup: false
    },
    {
      title: "Market Analysis",
      description: "Basic market trends and analysis tools",
      icon: TrendingUp,
      status: "Coming Soon",
      action: "Notify Me",
      hasPopup: false
    },
    {
      title: "Yield Calculator",
      description: "Calculate potential staking and farming yields",
      icon: Coins,
      status: "Coming Soon",
      action: "Notify Me",
      hasPopup: false
    },
    {
      title: "Price Alerts",
      description: "Set up price alerts for your favorite tokens",
      icon: BarChart3,
      status: "Coming Soon",
      action: "Notify Me",
      hasPopup: false
    },
    {
      title: "Hash Converter",
      description: "Convert between different hash formats",
      icon: Hash,
      status: "Coming Soon",
      action: "Notify Me",
      hasPopup: false
    }
  ];

  const handleToolClick = (tool: any) => {
    if (tool.url && tool.status === 'Available') {
      window.open(tool.url, '_blank');
    }
  };

  return (
    <TooltipProvider>
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
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg">{tool.title}</CardTitle>
                  {tool.hasPopup ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-gray-700">
                          <Info className="h-4 w-4 text-gray-400 hover:text-blue-400" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-white text-xl mb-4">
                            {tool.popupContent?.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {tool.popupContent?.description}
                          </p>
                          <div className="space-y-2">
                            {tool.popupContent?.features.map((feature, idx) => (
                              <p key={idx} className="text-gray-300 text-sm">{feature}</p>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-gray-700">
                            <p className="text-gray-400 text-sm mb-4">
                              We'd love your feedback! Help us improve it before we roll out the next version.
                            </p>
                            <Button 
                              onClick={() => handleToolClick(tool)}
                              className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Try MetaMint Now
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-gray-700">
                          <Info className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-700 text-white border-gray-600">
                        <p>More details coming soon</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
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
                  onClick={() => handleToolClick(tool)}
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
            <ToolRequestDialog>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Submit Tool Request
              </Button>
            </ToolRequestDialog>
          </CardContent>
        </Card>

        <UserToolRequestsView />
      </div>
    </TooltipProvider>
  );
};
