
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useState } from "react";
import { SimplePacManGame } from "./game/SimplePacManGame";

interface MissPoopeeManGameAreaProps {
  user: UnifiedUser;
  currentCredits: number;
  onGameEnd: (score: number, duration: number) => void;
  onGameStart: () => void;
}

export const MissPoopeeManGameArea = ({ 
  user, 
  currentCredits, 
  onGameEnd, 
  onGameStart 
}: MissPoopeeManGameAreaProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const canPlay = currentCredits >= 1;

  const handleGameEnd = (score: number, duration: number) => {
    console.log('Game ended with score:', score, 'duration:', duration);
    setGameStarted(false);
    onGameEnd(score, duration);
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-2xl">👾</span>
          Miss POOPEE-Man Game
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="w-full min-h-[500px] bg-black rounded-lg flex items-center justify-center">
          <SimplePacManGame
            user={user}
            onGameEnd={handleGameEnd}
          />
        </div>
      </CardContent>
    </Card>
  );
};
