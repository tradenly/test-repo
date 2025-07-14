
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useGameSessions } from "@/hooks/useGameSessions";
import { MissPoopeeManStats } from "./miss-poopee-man/MissPoopeeManStats";
import { MissPoopeeManGameArea } from "./miss-poopee-man/MissPoopeeManGameArea";
import { MissPoopeeManRecentGames } from "./miss-poopee-man/MissPoopeeManRecentGames";

interface MissPoopeeManSectionProps {
  user: UnifiedUser;
}

export const MissPoopeeManSection = ({ user }: MissPoopeeManSectionProps) => {
  const { data: credits } = useCredits(user.id);
  const { data: gameSessions } = useGameSessions(user.id);

  // Filter for Miss POOPEE-Man game sessions
  const missPoopeeManSessions = gameSessions?.filter(session => 
    session.game_type === 'miss_poopee_man'
  ) || [];

  // Calculate stats
  const totalGames = missPoopeeManSessions.length;
  const highScore = totalGames > 0 ? Math.max(...missPoopeeManSessions.map(s => s.score)) : 0;
  const averageScore = totalGames > 0 
    ? Math.round(missPoopeeManSessions.reduce((sum, s) => sum + s.score, 0) / totalGames)
    : 0;
  const totalCreditsEarned = missPoopeeManSessions.reduce((sum, s) => sum + s.credits_earned, 0);

  const handleGameEnd = (score: number, duration: number) => {
    console.log('Game ended with score:', score, 'duration:', duration);
    // Refresh game sessions data
    window.location.reload();
  };

  const handleGameStart = () => {
    console.log('Game starting...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">👾</span>
        <div>
          <h1 className="text-3xl font-bold text-white">Miss POOPEE-Man</h1>
          <p className="text-gray-400">Navigate the maze and collect 💩 pellets!</p>
        </div>
      </div>

      {/* Stats Row - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MissPoopeeManStats
          totalGames={totalGames}
          highScore={highScore}
          averageScore={averageScore}
          totalCreditsEarned={totalCreditsEarned}
          currentCredits={credits?.balance || 0}
        />
      </div>

      {/* Game Area - Full Width */}
      <MissPoopeeManGameArea
        user={user}
        currentCredits={credits?.balance || 0}
        onGameEnd={handleGameEnd}
        onGameStart={handleGameStart}
      />

      {/* Recent Games */}
      {totalGames > 0 && (
        <div className="mt-8">
          <MissPoopeeManRecentGames 
            gameSessions={missPoopeeManSessions.slice(0, 5)}
          />
        </div>
      )}
    </div>
  );
};
