import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrafficMetrics } from "./useTrafficAnalytics";

interface TopPagesTableProps {
  data: TrafficMetrics;
}

export const TopPagesTable = ({ data }: TopPagesTableProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-600 hover:bg-gray-700/50">
              <TableHead className="text-gray-300">Page</TableHead>
              <TableHead className="text-gray-300 text-right">Views</TableHead>
              <TableHead className="text-gray-300 text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topPages.map((page, index) => (
              <TableRow key={index} className="border-gray-600 hover:bg-gray-700/50">
                <TableCell className="text-white font-mono text-sm max-w-xs">
                  <div className="truncate" title={page.page}>
                    {page.page}
                  </div>
                </TableCell>
                <TableCell className="text-yellow-400 text-right font-medium">
                  {page.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-300 text-right">
                  {page.percentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.topPages.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No page data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};