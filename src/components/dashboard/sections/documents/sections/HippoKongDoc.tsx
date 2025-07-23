import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const HippoKongDoc = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏔️ Hippo Kong Game Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">🎮 How to Play</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Help the gorilla 🦍 climb to the top to rescue the princess 👸</li>
              <li>Use arrow keys to move left/right and climb ladders</li>
              <li>Avoid falling barrels 🛢️ - they will end your game!</li>
              <li>Reach the top platform to advance to the next level</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🕹️ Controls</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><kbd>←</kbd> <kbd>→</kbd> Move left/right</li>
              <li><kbd>↑</kbd> <kbd>↓</kbd> Climb up/down ladders</li>
              <li>Alternative: WASD keys</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🏆 Scoring</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Points awarded for climbing height</li>
              <li>Bonus points for reaching higher levels</li>
              <li>Time bonuses for quick completion</li>
              <li>Credits earned based on final score</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">💡 Strategy Tips</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Watch barrel patterns - they bounce off platforms</li>
              <li>Use ladders strategically to avoid falling barrels</li>
              <li>Higher levels spawn barrels faster</li>
              <li>Take your time - rushing leads to mistakes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};