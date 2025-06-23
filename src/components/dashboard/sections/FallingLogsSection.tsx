
import { useState } from "react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { TetrisGame } from "@/components/game/tetris/TetrisGame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGameSessions } from "@/hooks/useGameSessions";
import { useCredits } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, Zap, Play, ArrowLeft } from "lucide-react";
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
      <div className="space-y-4 h-full">
        {/* Mobile Header with Back Button */}
        {isMobile && (
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGameEnd}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">🪵 Falling Logs</h1>
              <p className="text-sm text-gray-400">
                Use controls below to move blocks
              </p>
            </div>
          </div>
        )}
        
        {/* Desktop Header */}
        {!isMobile && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🪵 Falling Logs</h1>
            <p className="text-gray-400">
              Stack those logs perfectly! Clear lines to earn points and credits.
              Use the touch controls below to move and rotate blocks.
            </p>
          </div>
        )}
        
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-2`}>
          🪵 Falling Logs
        </h1>
        <p className={`text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
          The classic block-stacking game with a lumber twist! Clear lines by filling rows completely.
        </p>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-300`}>
              High Score
            </CardTitle>
            <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-400`} />
          </CardHeader>
          <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              {stats.highestScore.toLocaleString()}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>Personal best</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-300`}>
              Games
            </CardTitle>
            <Target className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-400`} />
          </CardHeader>
          <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              {stats.totalGames}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>Total played</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-300`}>
              Max Level
            </CardTitle>
            <Zap className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-purple-400`} />
          </CardHeader>
          <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              {stats.highestLevel}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>Speed reached</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-300`}>
              Lines
            </CardTitle>
            <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-green-400`} />
          </CardHeader>
          <CardContent className={isMobile ? 'px-3 pb-3' : ''}>
            <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              {stats.totalLinesCleared}
            </div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400`}>Cleared</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Controls - Mobile Optimized */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
          <CardTitle className={`text-white ${isMobile ? 'text-lg' : ''}`}>
            Ready to Stack Some Logs?
          </CardTitle>
        </CardHeader>
        <CardContent className={`space-y-4 ${isMobile ? 'px-4 pb-4' : ''}`}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <p className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>
                Cost per game: <span className="text-yellow-400 font-bold">1 Credit</span>
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
                Your balance: <span className="text-green-400">{credits?.balance || 0} credits</span>
              </p>
            </div>
            
            <Button 
              onClick={startGame}
              disabled={(credits?.balance || 0) < 1}
              className={`bg-green-600 hover:bg-green-700 disabled:bg-gray-600 ${
                isMobile ? 'w-full py-4 text-lg font-bold' : ''
              }`}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Playing
            </Button>
          </div>
          
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400`}>
            <p className="font-semibold mb-2">How to play:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{isMobile ? 'Use touch controls below the game' : 'Use arrow keys'} to move and rotate pieces</li>
              <li>Fill complete horizontal lines to clear them</li>
              <li>Game speeds up as you progress through levels</li>
              <li>Earn credits based on your final score</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Games - Mobile Optimized */}
      {tetrisGames.length > 0 && (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
            <CardTitle className={`text-white ${isMobile ? 'text-lg' : ''}`}>Recent Games</CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-4 pb-4' : ''}>
            <div className="space-y-3">
              {tetrisGames.slice(0, isMobile ? 3 : 5).map((game) => (
                <div key={game.id} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'} p-3 rounded-lg bg-gray-700/30`}>
                  <div className={`flex ${isMobile ? 'justify-around text-center' : 'items-center gap-6'}`}>
                    <div>
                      <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white`}>
                        {game.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>
                    <div>
                      <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-purple-400`}>
                        {(game.metadata as any)?.level || 1}
                      </div>
                      <div className="text-xs text-gray-400">Level</div>
                    </div>
                    <div>
                      <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-green-400`}>
                        {(game.metadata as any)?.lines_cleared || 0}
                      </div>
                      <div className="text-xs text-gray-400">Lines</div>
                    </div>
                  </div>
                  
                  <div className={`${isMobile ? 'text-center' : 'text-right'}`}>
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
