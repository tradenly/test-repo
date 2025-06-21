
export const PortfolioDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">📊 Portfolio Management</h2>
        <p className="text-lg text-gray-300">
          Track and manage all your POOPEE assets in one comprehensive dashboard
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Portfolio Overview</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="mb-3">
            Your POOPEE portfolio is your financial command center, providing real-time tracking 
            of all your platform assets, earnings, and performance metrics. Think of it as your 
            personal toilet-worthy financial dashboard! 🚽💰
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Asset Tracking:</strong> Monitor all tokens, NFTs, and credits in real-time</li>
            <li><strong>Performance Analytics:</strong> Detailed charts and statistics</li>
            <li><strong>Profit/Loss Tracking:</strong> See your gains and investment performance</li>
            <li><strong>Historical Data:</strong> Complete transaction and earning history</li>
            <li><strong>Tax Reporting:</strong> Export data for tax preparation</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Asset Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">💰 Liquid Assets</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Game Credits:</strong> Available balance + pending rewards</li>
              <li><strong>POOPEE Tokens:</strong> Unstaked tokens in your wallet</li>
              <li><strong>Earned Rewards:</strong> Unclaimed staking and gaming rewards</li>
              <li><strong>Referral Bonuses:</strong> Credits earned from referrals</li>
            </ul>
          </div>
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">🔒 Locked Assets</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Staked Tokens:</strong> Tokens earning rewards in staking pools</li>
              <li><strong>Staked NFTs:</strong> NFTs locked in staking contracts</li>
              <li><strong>Vesting Rewards:</strong> Time-locked bonus rewards</li>
              <li><strong>Team Tournament Prizes:</strong> Rewards pending distribution</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">NFT Collection Tracking</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">🖼️ Your Hippo Collection</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-green-400 mb-2">Collection Overview</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Total NFTs owned with rarity breakdown</li>
                <li>Current floor price and collection value</li>
                <li>Staking status and earning potential</li>
                <li>Recent acquisition and sales history</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-orange-400 mb-2">Performance Metrics</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Purchase price vs current market value</li>
                <li>Realized and unrealized gains/losses</li>
                <li>Earning efficiency (rewards per NFT)</li>
                <li>Rarity score and ranking within collection</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Gaming Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎮 Gameplay Stats</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Total games played</li>
              <li>Average score progression</li>
              <li>High score achievements</li>
              <li>Win rate and improvement trends</li>
              <li>Time spent playing</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💳 Credit Economy</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Credits spent vs earned</li>
              <li>Net profit/loss from gaming</li>
              <li>Credit purchase history</li>
              <li>Efficiency metrics (credits per game)</li>
              <li>Bonus credits from achievements</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🏆 Achievements</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Unlocked badges and titles</li>
              <li>Leaderboard positions</li>
              <li>Tournament placements</li>
              <li>Social challenge completions</li>
              <li>Milestone rewards earned</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Staking & Rewards Dashboard</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">🏦 Passive Income Tracking</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/10 rounded p-3">
              <h5 className="font-medium text-green-400 mb-2">Current Positions</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Active staking pools and amounts</li>
                <li>Lock-up periods and end dates</li>
                <li>Current APY rates for each position</li>
                <li>Daily/weekly reward accumulation</li>
                <li>Auto-compound settings status</li>
              </ul>
            </div>
            <div className="bg-blue-900/10 rounded p-3">
              <h5 className="font-medium text-blue-400 mb-2">Rewards History</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Total rewards earned to date</li>
                <li>Claimed vs unclaimed rewards</li>
                <li>Compound interest calculations</li>
                <li>Performance comparison across pools</li>
                <li>Tax year summaries for reporting</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Financial Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📈 Investment Performance</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Total Portfolio Value:</strong> Real-time USD value</li>
              <li><strong>Cost Basis Tracking:</strong> What you paid vs current value</li>
              <li><strong>ROI Calculations:</strong> Return on investment percentages</li>
              <li><strong>Performance Charts:</strong> Value over time visualizations</li>
              <li><strong>Asset Allocation:</strong> Breakdown by asset type</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💹 Risk Metrics</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Diversification Score:</strong> Portfolio balance assessment</li>
              <li><strong>Volatility Analysis:</strong> Price movement patterns</li>
              <li><strong>Liquidity Ratios:</strong> Liquid vs locked asset balance</li>
              <li><strong>Exposure Levels:</strong> Risk concentration by asset type</li>
              <li><strong>Stress Testing:</strong> Performance in market downturns</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Tax & Reporting Tools</h3>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-400 mb-3">📋 Built-in Tax Support</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-white mb-2">Transaction Reports</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-200">
                <li>Complete transaction history with timestamps</li>
                <li>Cost basis calculations for all trades</li>
                <li>Realized gains/losses for each tax year</li>
                <li>Staking reward income categorization</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-white mb-2">Export Options</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-200">
                <li>CSV exports for popular tax software</li>
                <li>PDF reports for accountant review</li>
                <li>Custom date range filtering</li>
                <li>Multiple currency denomination options</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-yellow-300 mt-3">
            * Tax reporting tools are for convenience only. Always consult with a qualified tax professional.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-white">Mobile & Alerts</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">📱 Stay Connected Anywhere</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-cyan-400 mb-2">Mobile Experience</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Responsive design for all devices</li>
                <li>Touch-optimized charts and controls</li>
                <li>Quick action buttons for common tasks</li>
                <li>Offline data caching for smooth experience</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-purple-400 mb-2">Smart Alerts</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Price movement notifications</li>
                <li>Staking reward claim reminders</li>
                <li>New high score achievements</li>
                <li>Portfolio milestone celebrations</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Getting Started</h3>
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-400 mb-2">🚀 Portfolio Setup Guide</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-green-200">
            <li><strong>Connect All Wallets:</strong> Link all wallets containing POOPEE assets</li>
            <li><strong>Verify Asset Recognition:</strong> Ensure all tokens and NFTs are detected</li>
            <li><strong>Set Cost Basis:</strong> Input purchase prices for accurate P&L tracking</li>
            <li><strong>Configure Alerts:</strong> Set up notifications for important events</li>
            <li><strong>Explore Analytics:</strong> Familiarize yourself with available reports</li>
            <li><strong>Regular Reviews:</strong> Check your portfolio weekly for optimal management</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
