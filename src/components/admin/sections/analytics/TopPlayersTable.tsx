
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from 'lucide-react';

interface TopPlayer {
  user_id: string;
  username: string;
  full_name: string;
  total_games: number;
  highest_score: number;
  total_credits_earned: number;
  longest_survival: number;
  last_played: string;
}

interface TopPlayersTableProps {
  players: TopPlayer[];
}

export const TopPlayersTable = ({ players }: TopPlayersTableProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Top Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-400">Player</TableHead>
              <TableHead className="text-gray-400">Total Games</TableHead>
              <TableHead className="text-gray-400">Highest Score</TableHead>
              <TableHead className="text-gray-400">Credits Earned</TableHead>
              <TableHead className="text-gray-400">Longest Survival</TableHead>
              <TableHead className="text-gray-400">Last Played</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.user_id}>
                <TableCell className="text-white">
                  <div>
                    <div className="font-medium">{player.username || 'Anonymous'}</div>
                    <div className="text-sm text-gray-400">{player.full_name || 'Unknown'}</div>
                  </div>
                </TableCell>
                <TableCell className="text-white">{player.total_games}</TableCell>
                <TableCell className="text-white">{player.highest_score}</TableCell>
                <TableCell className="text-white">{Number(player.total_credits_earned).toFixed(1)}</TableCell>
                <TableCell className="text-white">{Math.round(player.longest_survival / 60)}m</TableCell>
                <TableCell className="text-white">
                  {new Date(player.last_played).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
