
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
    console.log('🎮 Miss POOPEE-Man game ended with score:', score, 'duration:', duration);
    onGameEnd(score, duration);
  };

  const handleGameStart = () => {
    console.log('🎮 Miss POOPEE-Man game started');
    onGameStart();
  };

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center">
      <NewPacManGame
        user={user}
        onGameEnd={handleGameEnd}
      />
    </div>
  );
};
