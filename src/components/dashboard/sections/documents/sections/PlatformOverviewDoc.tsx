
export const PlatformOverviewDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">💩 Welcome to POOPEE Platform</h2>
        <p className="text-lg text-gray-300 mb-2">
          A toilet-worthy project that's taking the meme economy to the next level! 🚽✨
        </p>
        <p className="text-sm text-yellow-400 mb-4 italic">
          We do not guarantee the accuracy of any of this information as we used AI to write it and didn't even bother proofreading it. Take all information contained within this document section with a grain of salt.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">What is POOPEE?</h3>
        <p>
          POOPEE is a comprehensive multi-game platform and ecosystem built around hilarious toilet humor 
          and real economic rewards. We've created an entertainment hub that's both fun and profitable, 
          featuring three exciting games, a complete USDC payment system, and cashout functionality.
        </p>
        
        <h3 className="text-xl font-semibold text-white">Platform Components</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Three Exciting Games:</strong> Flappy Hippos, POOPEE Crush (Match-3), and Falling Logs (Tetris-style)</li>
          <li><strong>Complete Payment System:</strong> Buy credits with USDC via Phantom wallet across multiple blockchains</li>
          <li><strong>Cashout System:</strong> Convert earned credits back to USDC with admin-approved payouts</li>
          <li><strong>Multi-Game Leaderboards:</strong> Compete across all games with comprehensive analytics</li>
          <li><strong>NFT Collection:</strong> Unique hippo-themed NFTs on the SUI blockchain</li>
          <li><strong>Meme Coin:</strong> POOPEE token launching on multiple chains including Cardano</li>
          <li><strong>Advanced Credit System:</strong> Earn credits through gameplay, purchase with USDC, and track all transactions</li>
          <li><strong>Social Features:</strong> Compete with friends and earn extra credits</li>
          <li><strong>Portfolio Management:</strong> Track all your POOPEE assets in one place</li>
        </ul>

        <h3 className="text-xl font-semibold text-white">Game Ecosystem</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🦛 Flappy Hippos</h4>
            <p className="text-sm text-gray-300">Navigate hippos through pipes in this challenging arcade-style game</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💩 POOPEE Crush</h4>
            <p className="text-sm text-gray-300">Match-3 puzzle game with POOPEE-themed tiles and power-ups</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🪵 Falling Logs</h4>
            <p className="text-sm text-gray-300">Tetris-style block puzzle with toilet-themed pieces</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Payment & Credit System</h3>
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2">💰 Complete Financial Ecosystem</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>USDC Payments:</strong> Purchase credits using USDC on Solana, Ethereum, or SUI networks</li>
            <li><strong>Phantom Wallet Integration:</strong> Seamless wallet connection and payment processing</li>
            <li><strong>Credit Earning:</strong> Earn credits through gameplay performance across all three games</li>
            <li><strong>Cashout System:</strong> Convert earned credits back to USDC (5 credits = 1 USDC)</li>
            <li><strong>Transaction Tracking:</strong> Complete history of all credit purchases, earnings, and cashouts</li>
            <li><strong>Admin-Approved Payouts:</strong> Secure cashout process with 24-hour processing timeframes</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Why POOPEE?</h3>
        <p>
          This isn't just another meme project - it's a fully functional gaming ecosystem that combines:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Three different game genres for varied entertainment</li>
          <li>Real cryptocurrency rewards through USDC integration</li>
          <li>Comprehensive leaderboard and analytics system</li>
          <li>Complete financial ecosystem with earnings and payouts</li>
          <li>Multi-chain token deployment</li>
          <li>Community-driven social features</li>
          <li>Long-term value through staking and NFT utility</li>
        </ul>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mt-6">
          <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Note</h4>
          <p className="text-yellow-200">
            The blockchain deployment details are subject to change. While we're planning NFTs on SUI and 
            the meme coin on Cardano, final decisions will be announced as development progresses. 
            All payment processing currently uses USDC on supported networks. 
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};
