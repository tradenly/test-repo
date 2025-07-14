
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useState } from "react";
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  Zap,
  Info,
  CheckCircle,
  Gamepad2,
  Coins,
  Users,
  X
} from "lucide-react";

interface NewsUpdatesSectionProps {
  user: UnifiedUser;
}

interface NewsItem {
  title: string;
  description: string;
  fullContent: string;
  date: string;
  category: string;
  type: string;
  isNew: boolean;
}

export const NewsUpdatesSection = ({ user }: NewsUpdatesSectionProps) => {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const newsItems: NewsItem[] = [
    {
      title: "Platform Update v2.1 Released",
      description: "New features including enhanced staking rewards and improved mobile experience",
      fullContent: "We're excited to announce the release of Platform Update v2.1, bringing significant improvements to your gaming and staking experience. This update includes enhanced staking rewards with higher APY rates, a completely redesigned mobile interface for better gameplay on phones and tablets, improved security measures to protect your assets, and new notification system to keep you informed about important updates. The mobile experience has been completely overhauled with touch-optimized controls for all our games, faster loading times, and better responsive design. Staking rewards have been increased across all pools, with some pools now offering up to 15% APY. We've also added new security features including two-factor authentication and enhanced wallet protection.",
      date: "2025-07-10",
      category: "Platform",
      type: "update",
      isNew: true
    },
    {
      title: "New Retro Arcade Games in Production",
      description: "Classic games like Miss Pac-Man, Space Invaders, and PoopeeVille (Farmville-style) coming soon",
      fullContent: "Get ready for a nostalgic gaming experience! We're currently developing three exciting retro arcade games that will launch on our platform in the coming months. Miss Pac-Man brings the classic maze-chase gameplay with our unique credit reward system, allowing players to earn credits while navigating through challenging levels. Space Invaders features the timeless alien-shooting action with modern graphics and multiplayer competitions. Our most ambitious project, PoopeeVille, is a farming simulation game inspired by Farmville where players can build their own virtual farms, grow crops, raise animals, and trade with other players. All games will feature our signature credit earning system, leaderboards, and community challenges. Beta testing will begin next month for selected users.",
      date: "2025-06-25",
      category: "Gaming",
      type: "feature",
      isNew: true
    },
    {
      title: "POOPEE Token IDO Announcement",
      description: "Pre-sale launching on MINSWAP platform within 30 days - Early access to Cardano's newest gaming token",
      fullContent: "We're thrilled to announce the upcoming Initial DEX Offering (IDO) of the POOPEE token on the Cardano blockchain! The pre-sale will launch on the MINSWAP platform within the next 30 days, offering early investors exclusive access to our native gaming token. POOPEE tokens will serve as the primary currency for all platform activities, including game entry fees, staking rewards, and marketplace transactions. Early pre-sale participants will receive bonus tokens and exclusive benefits including priority access to new games, enhanced staking rewards, and special NFT airdrops. The token will feature deflationary mechanics through regular burns, governance voting rights for platform decisions, and cross-platform utility across all our gaming ecosystem. Stay tuned for exact launch date and pre-sale details. This is a limited opportunity to get involved with the future of gaming on Cardano.",
      date: "2025-05-15",
      category: "Token",
      type: "event",
      isNew: true
    },
    {
      title: "Ad Campaign & Community Rewards Program",
      description: "Join our referral program and meme contests to earn credits while spreading the word",
      fullContent: "We're launching an exciting community-driven advertising campaign that rewards our users for helping spread the word about our platform! Our comprehensive referral program offers generous credit rewards for every friend you bring to the platform. Share your unique referral link and earn 5 credits for each successful signup, plus ongoing rewards when your referrals play games and make purchases. We're also hosting regular meme contests with prizes up to 100 credits for the best community-created content. Contest categories include funniest memes, best platform reviews, creative video content, and social media engagement challenges. Top contributors will receive exclusive badges, bonus credits, and early access to new features. Our goal is to build the strongest gaming community on Cardano while rewarding our most dedicated supporters. Join our Discord and Telegram channels to participate in daily challenges and connect with other players.",
      date: "2025-04-08",
      category: "Community",
      type: "event",
      isNew: true
    },
    {
      title: "New Cardano USDM Support",
      description: "We now support USDM transactions on the Cardano network for faster, cheaper payments",
      fullContent: "We've added support for USDM (USD-backed stablecoin) transactions on the Cardano network, providing our users with faster and more cost-effective payment options. This integration allows for seamless credit purchases with minimal transaction fees, typically under $0.50 per transaction. USDM transactions settle within 20 seconds on average, significantly faster than traditional payment methods. Users can now deposit USDM directly to their accounts, purchase credits with USDM, and withdraw earnings in USDM for maximum stability. This update also includes automatic conversion rates, transparent fee structures, and enhanced security for all stablecoin transactions. The integration supports both desktop and mobile wallets, making it easier than ever to manage your gaming funds.",
      date: "2025-03-12",
      category: "Payment",
      type: "feature",
      isNew: false
    },
    {
      title: "Security Enhancement Completed",
      description: "Additional security measures have been implemented to protect user accounts",
      fullContent: "We've completed a comprehensive security upgrade to better protect our users' accounts and assets. New security features include advanced encryption for all user data, multi-layer authentication systems, automated threat detection and prevention, regular security audits by third-party firms, and enhanced wallet protection protocols. We've also implemented real-time monitoring for suspicious activities, automatic account lockdown procedures for potential threats, and improved backup and recovery systems. All user passwords are now encrypted with military-grade algorithms, and we're adding optional two-factor authentication for enhanced account security. These improvements ensure that your gaming experience remains safe and secure while maintaining the seamless user experience you expect.",
      date: "2025-01-20",
      category: "Security",
      type: "update",
      isNew: false
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'update': return <Zap className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'feature': return <TrendingUp className="h-4 w-4" />;
      case 'milestone': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'update': return 'bg-blue-900/30 text-blue-400 border-blue-600/30';
      case 'event': return 'bg-purple-900/30 text-purple-400 border-purple-600/30';
      case 'feature': return 'bg-green-900/30 text-green-400 border-green-600/30';
      case 'milestone': return 'bg-yellow-900/30 text-yellow-400 border-yellow-600/30';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Newspaper className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">News & Updates</h1>
          <p className="text-gray-400">
            Stay informed about platform updates, new features, and community news
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="bg-gray-800/30 border-gray-700 flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Latest Stats</span>
            </div>
            <p className="text-gray-300 text-sm mb-1">
              Platform Activity
            </p>
            <p className="text-white font-semibold">
              Growing Community
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Updates</h2>
        
        {newsItems.map((item, index) => (
          <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(item.type)}
                    <Badge className={`text-xs border ${getTypeBadgeColor(item.type)}`}>
                      {item.category}
                    </Badge>
                    {item.isNew && (
                      <Badge className="text-xs bg-red-900/30 text-red-400 border-red-600/30">
                        New
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-lg mb-1">{item.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {item.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-gray-500 text-sm">{item.date}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => setSelectedArticle(item)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Read More
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[80vh] p-0">
                      <DialogHeader className="p-6 pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(item.type)}
                              <Badge className={`text-xs border ${getTypeBadgeColor(item.type)}`}>
                                {item.category}
                              </Badge>
                              {item.isNew && (
                                <Badge className="text-xs bg-red-900/30 text-red-400 border-red-600/30">
                                  New
                                </Badge>
                              )}
                            </div>
                            <DialogTitle className="text-white text-xl">{item.title}</DialogTitle>
                            <p className="text-gray-500 text-sm mt-1">{item.date}</p>
                          </div>
                        </div>
                      </DialogHeader>
                      <ScrollArea className="px-6 pb-6 max-h-[60vh]">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {item.fullContent}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Stay Connected</CardTitle>
          <CardDescription className="text-gray-400">
            Follow us on social media for real-time updates and community discussions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => window.open('https://twitter.com/Tropicalfattys', '_blank')}
            >
              Twitter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-500 cursor-not-allowed"
              disabled
            >
              Discord (Coming Soon)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-600 text-gray-500 cursor-not-allowed"
              disabled
            >
              Telegram (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
