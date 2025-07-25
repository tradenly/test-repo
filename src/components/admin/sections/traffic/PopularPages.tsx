import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, LogIn, LogOut } from "lucide-react";
import { PageData } from "./useTrafficAnalyticsData";

interface PopularPagesProps {
  data?: PageData;
}

export const PopularPages = ({ data }: PopularPagesProps) => {
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mock data for demonstration
  const mockPopularPages = [
    {
      path: '/',
      title: 'Home Page',
      pageViews: 1250,
      uniquePageViews: 950,
      averageTimeOnPage: 185,
      bounceRate: 35.2,
      exitRate: 25.1
    },
    {
      path: '/dashboard',
      title: 'Dashboard',
      pageViews: 890,
      uniquePageViews: 720,
      averageTimeOnPage: 420,
      bounceRate: 15.3,
      exitRate: 30.5
    },
    {
      path: '/auth',
      title: 'Login / Register',
      pageViews: 650,
      uniquePageViews: 580,
      averageTimeOnPage: 95,
      bounceRate: 45.8,
      exitRate: 35.2
    },
    {
      path: '/admin',
      title: 'Admin Panel',
      pageViews: 320,
      uniquePageViews: 85,
      averageTimeOnPage: 680,
      bounceRate: 8.1,
      exitRate: 20.3
    },
    {
      path: '/contact',
      title: 'Contact Us',
      pageViews: 180,
      uniquePageViews: 165,
      averageTimeOnPage: 125,
      bounceRate: 62.4,
      exitRate: 78.9
    }
  ];

  const mockEntryPages = [
    { path: '/', entries: 750, bounceRate: 35.2 },
    { path: '/auth', entries: 420, bounceRate: 45.8 },
    { path: '/dashboard', entries: 280, bounceRate: 15.3 },
    { path: '/contact', entries: 125, bounceRate: 62.4 },
    { path: '/admin', entries: 45, bounceRate: 8.1 }
  ];

  const mockExitPages = [
    { path: '/contact', exits: 142, exitRate: 78.9 },
    { path: '/auth', exits: 229, exitRate: 35.2 },
    { path: '/dashboard', exits: 271, exitRate: 30.5 },
    { path: '/', exits: 314, exitRate: 25.1 },
    { path: '/admin', exits: 65, exitRate: 20.3 }
  ];

  return (
    <div className="grid gap-4">
      {/* Popular Pages */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <FileText className="h-5 w-5 mr-2" />
          <CardTitle className="text-lg font-semibold">Popular Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Unique</TableHead>
                <TableHead className="text-right">Avg. Time</TableHead>
                <TableHead className="text-right">Bounce Rate</TableHead>
                <TableHead className="text-right">Exit Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPopularPages.map((page, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-sm text-muted-foreground">{page.path}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {page.pageViews.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {page.uniquePageViews.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDuration(page.averageTimeOnPage)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`${
                      page.bounceRate > 50 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {page.bounceRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`${
                      page.exitRate > 50 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {page.exitRate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Entry Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <LogIn className="h-5 w-5 mr-2" />
            <CardTitle className="text-lg font-semibold">Top Entry Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEntryPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{page.path}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {page.entries} entries
                    </Badge>
                    <span className={`text-xs ${
                      page.bounceRate > 50 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {page.bounceRate}% bounce
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exit Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-4">
            <LogOut className="h-5 w-5 mr-2" />
            <CardTitle className="text-lg font-semibold">Top Exit Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockExitPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{page.path}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {page.exits} exits
                    </Badge>
                    <span className={`text-xs ${
                      page.exitRate > 50 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {page.exitRate}% exit rate
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