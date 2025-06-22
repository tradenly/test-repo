
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GameOverScreenProps {
  finalScore: number;
  level: number;
  onRestart: () => void;
  onQuit: () => void;
}

export const GameOverScreen = ({ finalScore, level, onRestart, onQuit }: GameOverScreenProps) => {
  const getEncouragementMessage = () => {
    if (finalScore >= 10000) return "Amazing effort! You're getting really good at this!";
    if (finalScore >= 5000) return "Great progress! Keep practicing to improve!";
    if (finalScore >= 2000) return "Good attempt! Try different strategies next time!";
    return "Every expert was once a beginner. Keep playing!";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-600 max-w-md w-full mx-4">
        <CardContent className="p-8 text-center space-y-6">
          {/* Game Over Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-red-400">
              💀 Game Over 💀
            </h2>
            <p className="text-lg text-gray-300">Level {level}</p>
          </div>

          {/* Final Score */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-2">
            <div className="text-sm text-gray-400">Final Score</div>
            <div className="text-3xl font-bold text-yellow-400">
              {finalScore.toLocaleString()}
            </div>
          </div>

          {/* Encouragement */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-blue-400 font-medium">
              {getEncouragementMessage()}
            </p>
          </div>

          {/* Performance Stats */}
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-300">Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white font-semibold">Level Reached</div>
                <div className="text-gray-400">{level}</div>
              </div>
              <div>
                <div className="text-white font-semibold">Points per Level</div>
                <div className="text-gray-400">{Math.round(finalScore / Math.max(1, level))}</div>
              </div>
            </div>
          </div>

          {/* Tips for Improvement */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips for Next Time</h3>
            <ul className="text-xs text-blue-200 space-y-1 text-left">
              <li>• Look for opportunities to create special tiles (4+ matches)</li>
              <li>• Use the hint system when you're stuck</li>
              <li>• Plan your moves to create cascading matches</li>
              <li>• Save boosters for challenging levels</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onRestart} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              size="lg"
            >
              🎮 Play Again
            </Button>
            
            <Button 
              onClick={onQuit} 
              variant="outline" 
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Footer Message */}
          <div className="text-gray-500 text-xs">
            Thanks for playing POOPEE Crush! 🎯
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
