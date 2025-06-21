
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import { GameCanvas } from "@/components/game/GameCanvas";

interface FlappyHipposGameAreaProps {
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const FlappyHipposGameArea = ({ 
  onGameEnd, 
  onGameStart, 
  canPlay, 
  credits 
}: FlappyHipposGameAreaProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Game Arena
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GameCanvas 
          onGameEnd={onGameEnd}
          onGameStart={onGameStart}
          canPlay={canPlay}
          credits={credits}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-900/40 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">How to Play</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Click or press Space to flap</li>
              <li>• Avoid hitting pipes or ground</li>
              <li>• Each pipe passed = 1 point</li>
              <li>• Costs 1 credit per game</li>
            </ul>
          </div>
          
          <div className="bg-gray-900/40 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Credit Rewards</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Score 1+: 0.1 credits</li>
              <li>• Score 10+: 0.5 credits</li>
              <li>• Score 25+: 1 credit</li>
              <li>• New high score: +1 credit bonus</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
