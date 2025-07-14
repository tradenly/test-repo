
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GameOverScreenProps {
  finalScore: number;
  onRestart: () => void;
  onQuit: () => void;
}

export const GameOverScreen = ({ finalScore, onRestart, onQuit }: GameOverScreenProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-600 max-w-md w-full mx-4">
        <CardContent className="p-8 text-center space-y-6">
          {/* Game Over Header */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-red-400">
              💀 Game Over 💀
            </h2>
            <p className="text-gray-300">
              No more moves available!
            </p>
          </div>

          {/* Final Score */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-2">
            <div className="text-sm text-gray-400">Final Score</div>
            <div className="text-3xl font-bold text-white">
              {finalScore.toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onRestart} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 text-lg"
              size="lg"
            >
              🎮 Play Again 🎮
            </Button>
            
            <Button 
              onClick={onQuit} 
              variant="outline" 
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
