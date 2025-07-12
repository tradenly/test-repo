
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { 
  Newspaper, 
  Calendar, 
  ExternalLink, 
  Bell, 
  TrendingUp,
  Zap,
  Info,
  CheckCircle
} from "lucide-react";

interface NewsUpdatesSectionProps {
  user: UnifiedUser;
}

export const NewsUpdatesSection = ({ user }: NewsUpdatesSectionProps) => {
  const newsItems = [
    {
      title: "Platform Update v2.1 Released",
      description: "New features including enhanced staking rewards and improved mobile experience",
      date: "2024-12-07",
      category: "Platform",
      type: "update",
      isNew: true
    },
    {
      title: "POOPEE Crush Tournament Announced",
      description: "Join our biggest gaming tournament yet with prizes up to 1000 credits",
      date: "2024-12-05",
      category: "Gaming",
      type: "event",
      isNew: true
    },
    {
      title: "New Cardano USDM Support",
      description: "We now support USDM transactions on the Cardano network for faster, cheaper payments",
      date: "2024-12-03",
      category: "Payment",
      type: "feature",
      isNew: false
    },
    {
      title: "Security Enhancement Completed",
      description: "Additional security measures have been implemented to protect user accounts",
      date: "2024-12-01",
      category: "Security",
      type: "update",
      isNew: false
    },
    {
      title: "Community Milestone: 10K Users",
      description: "We've reached 10,000 registered users! Thank you for being part of our community",
      date: "2024-11-28",
      category: "Community",
      type: "milestone",
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
        <Card className="bg-blue-900/20 border-blue-600/30 flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Notifications</span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Get notified about important updates and announcements
            </p>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
              Enable Notifications
            </Button>
          </CardContent>
        </Card>

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
              10,247 Active Users
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
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Read More
                  </Button>
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
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Twitter
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Discord
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Telegram
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
