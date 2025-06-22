
export const FallingLogsDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🪵 Falling Logs Game Guide</h2>
        <p className="text-lg text-gray-300">
          Master the classic block-puzzle gameplay with a toilet-themed twist!
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">How to Play</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🎮 Basic Controls</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Arrow Keys/WASD:</strong> Move pieces left, right, and down</li>
            <li><strong>Up Arrow/W:</strong> Rotate pieces clockwise</li>
            <li><strong>Space Bar:</strong> Instantly drop piece to bottom</li>
            <li><strong>Shift:</strong> Hold to store current piece for later use</li>
            <li><strong>Objective:</strong> Clear horizontal lines by filling them completely</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Game Pieces</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🚽 Toilet-Themed Pieces</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Toilet Paper Roll (I-piece) - 4 blocks in a line</li>
              <li>Toilet Seat (O-piece) - 2x2 square block</li>
              <li>Plunger Handle (L-piece) - L-shaped piece</li>
              <li>Reverse Plunger (J-piece) - Mirrored L-shape</li>
              <li>Toilet Base (T-piece) - T-shaped piece</li>
              <li>Log Pieces (S & Z-pieces) - Zigzag shapes</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎯 Piece Strategy</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Save I-pieces for clearing multiple lines</li>
              <li>Use T-pieces to fill awkward gaps</li>
              <li>Stack efficiently to avoid gaps</li>
              <li>Plan rotations before pieces land</li>
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
              <li>Credits work across all POOPEE games</li>
              <li>No time limits on credit usage</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 Earning Credits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Level progression rewards</li>
              <li>Lines cleared bonuses</li>
              <li>High score achievements</li>
              <li>Speed bonus multipliers</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Scoring System</h3>
        <div className="space-y-3">
          <p>Your score and level determine how many credits you earn:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
              <div className="font-medium">Level 1-2: <span className="text-green-400">0.1 credits</span></div>
            </div>
            <div className="bg-blue-900/20 border border-blue-600/30 rounded p-3">
              <div className="font-medium">Level 3-5: <span className="text-blue-400">0.3 credits</span></div>
            </div>
            <div className="bg-purple-900/20 border border-purple-600/30 rounded p-3">
              <div className="font-medium">Level 6-9: <span className="text-purple-400">0.7 credits</span></div>
            </div>
            <div className="bg-orange-900/20 border border-orange-600/30 rounded p-3">
              <div className="font-medium">Level 10+: <span className="text-orange-400">1.5+ credits</span></div>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-white mt-4">Line Clearing Bonuses</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-gray-700/50 rounded p-2 text-center">
              <div className="font-medium text-white">Single</div>
              <div className="text-sm text-gray-300">100 × Level</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2 text-center">
              <div className="font-medium text-yellow-400">Double</div>
              <div className="text-sm text-gray-300">300 × Level</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2 text-center">
              <div className="font-medium text-orange-400">Triple</div>
              <div className="text-sm text-gray-300">500 × Level</div>
            </div>
            <div className="bg-gray-700/50 rounded p-2 text-center">
              <div className="font-medium text-red-400">Tetris</div>
              <div className="text-sm text-gray-300">800 × Level</div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Game Progression</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">📈 Level System</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Level Up:</strong> Clear 10 lines to advance to the next level</li>
            <li><strong>Speed Increase:</strong> Pieces fall faster as you progress</li>
            <li><strong>Score Multiplier:</strong> Higher levels give more points per action</li>
            <li><strong>Credit Multiplier:</strong> Better rewards at higher levels</li>
            <li><strong>Challenge Increase:</strong> Game becomes progressively more difficult</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Advanced Strategies</h3>
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">🏗️ Stacking Techniques</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li><strong>9-0 Stacking:</strong> Keep one column clear for I-pieces</li>
              <li><strong>LST Stacking:</strong> Use L, S, and T pieces efficiently</li>
              <li><strong>Flat Top:</strong> Maintain an even surface when possible</li>
              <li><strong>Well Creation:</strong> Create gaps for specific piece types</li>
            </ul>
          </div>
          
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">⚡ Speed Techniques</h4>
            <ul className="list-disc list-inside space-y-1 text-purple-200">
              <li><strong>Soft Drop:</strong> Use down arrow to place pieces faster</li>
              <li><strong>Hard Drop:</strong> Space bar for instant placement</li>
              <li><strong>DAS (Delayed Auto Shift):</strong> Hold left/right for rapid movement</li>
              <li><strong>T-Spin Setup:</strong> Advanced technique for massive points</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Leaderboard Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🏆 Tracking Metrics</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Highest Level Reached</li>
              <li>Total Lines Cleared</li>
              <li>Best Single Game Score</li>
              <li>Most Games Played</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📊 Analytics</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Average level progression</li>
              <li>Lines per minute rate</li>
              <li>Credit earning efficiency</li>
              <li>Cross-game performance comparison</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Pro Tips</h3>
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Preview Planning:</strong> Always look at the next piece to plan your moves</li>
            <li><strong>Hold Strategy:</strong> Save I-pieces for Tetris opportunities</li>
            <li><strong>Speed Building:</strong> Practice at lower levels to build muscle memory</li>
            <li><strong>Gap Management:</strong> Avoid creating unreachable holes in your stack</li>
            <li><strong>Level Grinding:</strong> Higher levels yield better credit rewards</li>
            <li><strong>Patience Pays:</strong> Sometimes waiting for the right piece is worth it</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
