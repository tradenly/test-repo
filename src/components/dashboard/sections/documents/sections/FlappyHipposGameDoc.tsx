
export const FlappyHipposGameDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🦛 Flappy Hippos Game Guide</h2>
        <p className="text-lg text-gray-300">
          Master the art of hippo navigation and earn real rewards!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">How to Play</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🎮 Basic Controls</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Click or Spacebar:</strong> Make your hippo flap and fly upward</li>
            <li><strong>Gravity:</strong> Your hippo naturally falls down when not flapping</li>
            <li><strong>Objective:</strong> Navigate through pipes without hitting them</li>
            <li><strong>Scoring:</strong> Each pipe you pass through increases your score</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Credit System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💳 Buying Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Each game costs 1 credit to play</li>
              <li>Purchase credits with connected wallet</li>
              <li>Multiple payment options available</li>
              <li>Credits never expire</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 Earning Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Score-based rewards (fractional credits)</li>
              <li>High score bonuses (1.0 credit)</li>
              <li>Daily challenges and events</li>
              <li>Social competitions</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Scoring System</h3>
        <div className="space-y-3">
          <p>Your score determines how many credits you earn back from each game:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
              <div className="font-medium">Score 1-9: <span className="text-green-400">0.1 credits</span></div>
            </div>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3">
              <div className="font-medium">Score 10-24: <span className="text-blue-400">0.3 credits</span></div>
            </div>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded p-3">
              <div className="font-medium">Score 25-49: <span className="text-purple-400">0.7 credits</span></div>
            </div>
            <div className="bg-orange-900/20 border border-orange-600/30 rounded p-3">
              <div className="font-medium">Score 50+: <span className="text-orange-400">1.5+ credits</span></div>
            </div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
            <div className="font-medium">🏆 New High Score Bonus: <span className="text-yellow-400">+1.0 credit</span></div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Shield System</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🛡️ Protection Mechanism</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Starting Shields:</strong> Every player begins with 3 shields</li>
            <li><strong>Shield Function:</strong> Each shield protects you from one collision</li>
            <li><strong>Shield Loss:</strong> Hitting pipes or missiles removes one shield</li>
            <li><strong>Game Over:</strong> When all shields are depleted, the game ends</li>
          </ul>
          
          <h4 className="font-semibold text-white mb-2 mt-4">💰 Buying Extra Shields</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Cost:</strong> 5 credits per purchase</li>
            <li><strong>Quantity:</strong> Each purchase adds 3 shields</li>
            <li><strong>Timing:</strong> Buy shields before or during gameplay</li>
            <li><strong>Strategy:</strong> More shields = longer games = higher scores</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Leaderboard System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🏆 Ranking Categories</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Highest Single Score</li>
              <li>Most Games Played</li>
              <li>Longest Survival Time</li>
              <li>Recent Champions</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📊 Analytics Tracking</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Personal best scores</li>
              <li>Average performance</li>
              <li>Play frequency</li>
              <li>Credit earnings history</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Pro Tips</h3>
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Timing is Everything:</strong> Learn the rhythm of tapping to maintain consistent height</li>
            <li><strong>Shield Investment:</strong> Buying extra shields early can lead to much higher scores</li>
            <li><strong>Practice Mode:</strong> Use low-stakes games to improve before going for high scores</li>
            <li><strong>Stay Calm:</strong> The game gets faster as you progress, but panic leads to mistakes</li>
            <li><strong>Watch the Patterns:</strong> Pipe gaps have patterns you can learn to anticipate</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
