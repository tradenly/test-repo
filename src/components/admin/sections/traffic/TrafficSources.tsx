import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, Share2, Mail, Tag } from "lucide-react";
import { SourceData } from "./useTrafficAnalyticsData";

interface TrafficSourcesProps {
  data?: SourceData;
}

export const TrafficSources = ({ data }: TrafficSourcesProps) => {
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

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType.toLowerCase()) {
      case 'search':
        return Search;
      case 'social':
        return Share2;
      case 'email':
        return Mail;
      case 'campaign':
        return Tag;
      default:
        return ExternalLink;
    }
  };

  // Mock data for demonstration
  const mockTrafficSources = [
    { sourceType: 'direct', sourceName: 'Direct', visitors: 320, percentage: 42.7, bounceRate: 35.2 },
    { sourceType: 'search', sourceName: 'Google', visitors: 180, percentage: 24, bounceRate: 42.1 },
    { sourceType: 'social', sourceName: 'Facebook', visitors: 95, percentage: 12.7, bounceRate: 65.3 },
    { sourceType: 'referral', sourceName: 'reddit.com', visitors: 75, percentage: 10, bounceRate: 28.4 },
    { sourceType: 'social', sourceName: 'Twitter', visitors: 45, percentage: 6, bounceRate: 58.7 },
    { sourceType: 'email', sourceName: 'Newsletter', visitors: 35, percentage: 4.7, bounceRate: 15.2 },
  ];

  const mockReferrers = [
    { domain: 'google.com', visitors: 180, percentage: 24 },
    { domain: 'facebook.com', visitors: 95, percentage: 12.7 },
    { domain: 'reddit.com', visitors: 75, percentage: 10 },
    { domain: 'twitter.com', visitors: 45, percentage: 6 },
    { domain: 'github.com', visitors: 25, percentage: 3.3 },
  ];

  const mockCampaigns = [
    { campaign: 'Summer Sale 2024', source: 'Google Ads', visitors: 85, conversions: 12 },
    { campaign: 'Social Media Boost', source: 'Facebook', visitors: 65, conversions: 8 },
    { campaign: 'Email Newsletter', source: 'Email', visitors: 35, conversions: 15 },
    { campaign: 'Influencer Partnership', source: 'Instagram', visitors: 28, conversions: 5 },
  ];

  return (
    <div className="grid gap-4">
      {/* Traffic Sources Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead className="text-right">Bounce Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrafficSources.map((source, index) => {
                const SourceIcon = getSourceIcon(source.sourceType);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <SourceIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{source.sourceName}</div>
                          <Badge variant="outline" className="text-xs">
                            {source.sourceType}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {source.visitors.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {source.percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm ${
                        source.bounceRate > 50 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {source.bounceRate}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockReferrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{referrer.domain}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {referrer.visitors}
                    </span>
                    <div className="w-12 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${referrer.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {referrer.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCampaigns.map((campaign, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{campaign.campaign}</span>
                    <Badge variant="secondary" className="text-xs">
                      {campaign.source}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{campaign.visitors} visitors</span>
                    <span>{campaign.conversions} conversions</span>
                    <span>
                      {((campaign.conversions / campaign.visitors) * 100).toFixed(1)}% CVR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};