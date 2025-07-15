
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { NewPacManGame } from "./game/NewPacManGame";

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
    <div className="w-full">
      <NewPacManGame
        user={user}
        onGameEnd={handleGameEnd}
      />
    </div>
  );
};
