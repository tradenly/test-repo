
import { useState } from "react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameSessions } from "@/hooks/useGameSessions";
import { useCredits } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, Zap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FallingLogsSectionProps {
  user: UnifiedUser;
}

export const FallingLogsSection = ({ user }: FallingLogsSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { data: gameSessions, isLoading: sessionsLoading } = useGameSessions(user.id);
  const { data: credits } = useCredits(user.id);
  const isMobile = useIsMobile();

  // Filter for Tetris games only
  const tetrisGames = gameSessions?.filter(session => 
    session.metadata && 
    (session.metadata as any).game_type === 'falling_logs'
  ) || [];

  const stats = {
    highestScore: Math.max(0, ...tetrisGames.map(g => g.score)),
    totalGames: tetrisGames.length,
    highestLevel: Math.max(0, ...tetrisGames.map(g => (g.metadata as any)?.level || 0)),
    totalLinesCleared: tetrisGames.reduce((sum, g) => sum + ((g.metadata as any)?.lines_cleared || 0), 0)
  };

  const startGame = () => {
    setIsPlaying(true);
  };

  const handleGameEnd = () => {
    setIsPlaying(false);
  };

  if (isPlaying) {
    return (
      <div className="space-y-6 h-full">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🪵 Falling Logs</h1>
          <p className="text-gray-400">
            Stack those logs perfectly! Clear lines to earn points and credits.
            {isMobile && " Use the touch controls below to move and rotate blocks."}
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TetrisGame 
            user={user} 
            onGameEnd={handleGameEnd} 
            creditsBalance={credits?.balance || 0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">🪵 Falling Logs</h1>
        <p className="text-gray-400">
          The classic block-stacking game with a lumber twist! Clear lines by filling rows completely.
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Highest Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.highestScore.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Personal best</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Games Played</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
            <p className="text-xs text-gray-400">Total attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Highest Level</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.highestLevel}</div>
            <p className="text-xs text-gray-400">Speed reached</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Lines Cleared</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLinesCleared}</div>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Ready to Stack Some Logs?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
            <div>
              <p className="text-gray-300">Cost per game: <span className="text-yellow-400 font-bold">1 Credit</span></p>
              <p className="text-sm text-gray-400">
                Your balance: <span className="text-green-400">{credits?.balance || 0} credits</span>
              </p>
            </div>
            
            <Button 
              onClick={startGame}
              disabled={(credits?.balance || 0) < 1}
              className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-600 ${isMobile ? 'w-full py-3 text-lg' : ''}`}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Playing
            </Button>
          </div>
          
          <div className="text-sm text-gray-400">
            <p><strong>How to play:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{isMobile ? 'Use touch controls' : 'Use arrow keys'} to move and rotate falling pieces</li>
              <li>Fill complete horizontal lines to clear them</li>
              <li>Game speeds up as you progress through levels</li>
              <li>Earn credits based on your final score</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      {tetrisGames.length > 0 && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tetrisGames.slice(0, 5).map((game) => (
                <div key={game.id} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 rounded-lg bg-gray-700/30`}>
                  <div className={`flex ${isMobile ? 'justify-around' : 'items-center gap-4'}`}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{game.score.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">
                        {(game.metadata as any)?.level || 1}
                      </div>
                      <div className="text-xs text-gray-400">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        {(game.metadata as any)?.lines_cleared || 0}
                      </div>
                      <div className="text-xs text-gray-400">Lines</div>
                    </div>
                  </div>
                  
                  <div className={`text-${isMobile ? 'center' : 'right'}`}>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      +{game.credits_earned} credits
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(game.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
