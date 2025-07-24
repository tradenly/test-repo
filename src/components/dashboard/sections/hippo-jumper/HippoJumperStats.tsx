import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useQuery } from "@tanstack/react-query";

interface HippoJumperStatsProps {
  user: UnifiedUser;
}

export const HippoJumperStats = ({ user }: HippoJumperStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hippo-jumper-stats', user?.id],
    queryFn: async () => {
      // This would fetch real stats from your backend
      // For now, return mock data
      return {
        totalGames: 15,
        highScore: 1250,
        averageScore: 650,
        totalJumps: 480
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Games:</span>
          <span className="font-medium">{stats?.totalGames || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">High Score:</span>
          <span className="font-medium">{stats?.highScore || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Average Score:</span>
          <span className="font-medium">{stats?.averageScore || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Jumps:</span>
          <span className="font-medium">{stats?.totalJumps || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
};