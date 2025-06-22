
export const PoopeeCrushDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">💩 POOPEE Crush Game Guide</h2>
        <p className="text-lg text-gray-300">
          Master the art of tile matching and earn real rewards in our Match-3 puzzle game!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">How to Play</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🎮 Basic Controls</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Click/Tap Tiles:</strong> Select adjacent tiles to swap their positions</li>
            <li><strong>Match 3 or More:</strong> Create lines of 3+ identical tiles to clear them</li>
            <li><strong>Chain Reactions:</strong> Clearing tiles can cause cascading matches for bonus points</li>
            <li><strong>Special Tiles:</strong> Create power-ups by matching 4+ tiles in specific patterns</li>
            <li><strong>Time Management:</strong> Complete objectives before time runs out</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Tile Types & Power-ups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💩 Standard Tiles</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Brown POOPEE - Basic tile type</li>
              <li>Golden POOPEE - Higher point value</li>
              <li>Rainbow POOPEE - Special wildcard tile</li>
              <li>Toilet Paper - Bonus clearing tile</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">⚡ Power-up Tiles</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Line Blaster - Clears entire row/column</li>
              <li>Bomb Tile - Clears 3x3 area around it</li>
              <li>Color Burst - Removes all tiles of one color</li>
              <li>Super POOPEE - Mega explosion effect</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Credit System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💳 Game Costs</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Each game costs 1 credit to play</li>
              <li>Purchase credits with USDC via Phantom wallet</li>
              <li>Credits work across all three POOPEE games</li>
              <li>Credits never expire</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 Earning Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Score-based rewards (fractional credits)</li>
              <li>Level completion bonuses</li>
              <li>High score achievements</li>
              <li>Daily challenges and events</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Scoring System</h3>
        <div className="space-y-3">
          <p>Your score determines how many credits you earn back from each game:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
              <div className="font-medium">Score 0-499: <span className="text-green-400">0.1 credits</span></div>
            </div>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3">
              <div className="font-medium">Score 500-999: <span className="text-blue-400">0.3 credits</span></div>
            </div>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded p-3">
              <div className="font-medium">Score 1000-2499: <span className="text-purple-400">0.7 credits</span></div>
            </div>
            <div className="bg-orange-900/20 border border-orange-600/30 rounded p-3">
              <div className="font-medium">Score 2500+: <span className="text-orange-400">1.5+ credits</span></div>
            </div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
            <div className="font-medium">🏆 New High Score Bonus: <span className="text-yellow-400">+1.0 credit</span></div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Game Modes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">⏱️ Timed Mode</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Race against the clock</li>
              <li>Score as many points as possible</li>
              <li>Time bonuses for quick matches</li>
              <li>Perfect for quick sessions</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎯 Objective Mode</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Complete specific challenges</li>
              <li>Clear certain tile types</li>
              <li>Reach target scores</li>
              <li>Strategic gameplay focus</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Leaderboard Integration</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🏆 Ranking Categories</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Highest Single Score:</strong> Your best game performance</li>
            <li><strong>Total Games Played:</strong> Dedication tracking</li>
            <li><strong>Average Score:</strong> Consistency measurement</li>
            <li><strong>Recent Champions:</strong> Latest high achievers</li>
            <li><strong>Cross-Game Rankings:</strong> Performance across all POOPEE games</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Strategy Tips</h3>
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Plan Ahead:</strong> Look for potential matches before making moves</li>
            <li><strong>Create Cascades:</strong> Set up chain reactions for massive point bonuses</li>
            <li><strong>Save Power-ups:</strong> Use special tiles strategically for maximum impact</li>
            <li><strong>Corner Strategy:</strong> Work from corners to create more matching opportunities</li>
            <li><strong>Time Management:</strong> Balance speed with strategic thinking</li>
            <li><strong>Power-up Combos:</strong> Combine special tiles for devastating effects</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Advanced Techniques</h3>
        <div className="space-y-3">
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">🔥 Combo Mastery</h4>
            <ul className="list-disc list-inside space-y-1 text-purple-200">
              <li>T-Shape matches create line blasters</li>
              <li>L-Shape matches create corner bombs</li>
              <li>4-in-a-row creates directional blasters</li>
              <li>5-in-a-row creates color burst power-ups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
