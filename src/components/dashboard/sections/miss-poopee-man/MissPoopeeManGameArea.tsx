import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import { GameCanvas } from "@/components/game/GameCanvas";
import { useIsMobile } from "@/hooks/use-mobile";

interface MissPoopeeManGameAreaProps {
  onGameEnd: (score: number, pelletsCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const MissPoopeeManGameArea = ({ 
  onGameEnd, 
  onGameStart, 
  canPlay, 
  credits 
}: MissPoopeeManGameAreaProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Game Arena
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Info Cards - Horizontal layout at top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded-lg p-3">
            <h4 className="font-semibold text-white mb-1 text-sm">How to Play</h4>
            <ul className="text-xs text-gray-400 space-y-0.5">
              <li>• {isMobile ? 'Use touch controls' : 'Use arrow keys'} to move</li>
              <li>• Collect all pellets to win</li>
              <li>• Avoid the ghosts</li>
              <li>• Power pellets make ghosts vulnerable</li>
              <li>• Costs 3 credits per game (3 lives)</li>
            </ul>
          </div>
          
          <div className="bg-gray-900/40 rounded-lg p-3">
            <h4 className="font-semibold text-white mb-1 text-sm">Credit Rewards</h4>
            <ul className="text-xs text-gray-400 space-y-0.5">
              <li>• Pellet collected: 0.01 credits</li>
              <li>• Ghost eaten: 0.05 credits</li>
              <li>• Level complete: 0.5 credits</li>
              <li>• New high score: +1 credit bonus</li>
            </ul>
          </div>
        </div>

        <GameCanvas 
          onGameEnd={onGameEnd}
          onGameStart={onGameStart}
          canPlay={canPlay}
          credits={credits}
          gameMode="miss_poopee_man"
        />
      </CardContent>
    </Card>
  );
};