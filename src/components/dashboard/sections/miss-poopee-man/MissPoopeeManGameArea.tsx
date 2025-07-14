
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
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
  const handleGameEnd = (score: number, duration: number) => {
    console.log('Game ended with score:', score, 'duration:', duration);
    onGameEnd(score, duration);
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-2xl">👾</span>
          Miss POOPEE-Man Game
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full bg-black flex items-center justify-center" style={{ height: '600px' }}>
          <SimplePacManGame
            user={user}
            onGameEnd={handleGameEnd}
          />
        </div>
      </CardContent>
    </Card>
  );
};
