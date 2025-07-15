import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import { MissPoopeeManGameCanvas } from "./MissPoopeeManGameCanvas";
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
        <MissPoopeeManGameCanvas 
          onGameEnd={onGameEnd}
          onGameStart={onGameStart}
          canPlay={canPlay}
          credits={credits}
        />
        
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4 mt-6`}>
          <div className="bg-gray-900/40 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">How to Play</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• {isMobile ? 'Use touch controls' : 'Use arrow keys'} to move</li>
              <li>• Collect all pellets to win</li>
              <li>• Avoid the ghosts</li>
              <li>• Power pellets make ghosts vulnerable</li>
              <li>• Costs 1 credit per game</li>
            </ul>
          </div>
          
          <div className="bg-gray-900/40 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Credit Rewards</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Pellet collected: 0.01 credits</li>
              <li>• Ghost eaten: 0.05 credits</li>
              <li>• Level complete: 0.5 credits</li>
              <li>• New high score: +1 credit bonus</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};