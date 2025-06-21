
export const MemeCoinDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🪙 POOPEE Meme Coin</h2>
        <p className="text-lg text-gray-300">
          The ultimate toilet-worthy cryptocurrency launching across multiple blockchains
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Token Overview</h3>
        <p>
          The POOPEE token ($POOPEE) is our native cryptocurrency that powers the entire ecosystem. 
          It's designed to be both hilarious and functional, providing real utility while maintaining 
          that toilet humor we all love.
        </p>

        <h3 className="text-xl font-semibold text-white">Multi-Chain Deployment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🔗 Primary Chain: Cardano</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Low transaction fees</li>
              <li>Sustainable proof-of-stake</li>
              <li>Strong DeFi ecosystem</li>
              <li>Excellent for meme coins</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🌉 Additional Chains</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Ethereum (for maximum reach)</li>
              <li>Polygon (for gaming rewards)</li>
              <li>BSC (for DeFi integration)</li>
              <li>More chains as needed</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Token Utilities</h3>
        <div className="space-y-3">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎮 Gaming Integration</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Purchase game credits directly with $POOPEE</li>
              <li>Earn tokens through gameplay achievements</li>
              <li>Tournament entry fees and prize pools</li>
              <li>Special in-game purchases and upgrades</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 DeFi Features</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Stake tokens for passive rewards</li>
              <li>Liquidity mining opportunities</li>
              <li>Governance voting rights</li>
              <li>Yield farming in partner protocols</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🏆 Social Rewards</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Referral bonuses in $POOPEE</li>
              <li>Social challenge rewards</li>
              <li>Community event prizes</li>
              <li>Content creation incentives</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Tokenomics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-gray-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">40%</div>
            <div className="text-sm">Community & Gaming</div>
          </div>
          <div className="text-center bg-gray-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">25%</div>
            <div className="text-sm">Liquidity & DEX</div>
          </div>
          <div className="text-center bg-gray-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">20%</div>
            <div className="text-sm">Development</div>
          </div>
          <div className="text-center bg-gray-800/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">15%</div>
            <div className="text-sm">Marketing & Partnerships</div>
          </div>
        </div>

        <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4 mt-6">
          <h4 className="text-orange-400 font-semibold mb-2">🚧 Development Status</h4>
          <p className="text-orange-200">
            Token deployment details are subject to change based on market conditions, regulatory requirements, 
            and technical considerations. While Cardano is our primary target, final blockchain selection 
            will be announced closer to launch date.
          </p>
        </div>
      </div>
    </div>
  );
};
