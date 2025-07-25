import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin } from "lucide-react";
import { GeographyData } from "./useTrafficAnalyticsData";

interface GeographicDistributionProps {
  data?: GeographyData;
}

export const GeographicDistribution = ({ data }: GeographicDistributionProps) => {
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
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
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Countries */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <Globe className="h-5 w-5 mr-2" />
          <CardTitle className="text-lg font-semibold">Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">Pages</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No country data available
                  </TableCell>
                </TableRow>
              ) : (
                data.countries
                  .sort((a, b) => b.visitors - a.visitors)
                  .slice(0, 10)
                  .map((country, index) => (
                    <TableRow key={country.countryCode}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {country.countryCode}
                          </Badge>
                          <span className="font-medium">{country.countryName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {country.visitors.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {country.pageViews.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDuration(country.averageSessionDuration)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cities */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
          <MapPin className="h-5 w-5 mr-2" />
          <CardTitle className="text-lg font-semibold">Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Visitors</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No city data available
                  </TableCell>
                </TableRow>
              ) : (
                data.cities.map((city, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{city.city}</div>
                        <div className="text-sm text-muted-foreground">{city.country}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {city.visitors.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-12 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${city.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          {city.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};