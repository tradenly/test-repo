
export const PlatformOverviewDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">💩 Welcome to POOPEE Platform</h2>
        <p className="text-lg text-gray-300 mb-4">
          A toilet-worthy project that's taking the meme economy to the next level! 🚽✨
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">What is POOPEE?</h3>
        <p>
          POOPEE is a comprehensive gaming and NFT platform built around the hilarious concept of hippos 
          and toilet humor. We believe in creating entertainment that's both fun and profitable, making 
          this a truly toilet-worthy project that users will love to engage with.
        </p>
        
        <h3 className="text-xl font-semibold text-white">Platform Components</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Flappy Hippos Game:</strong> Our signature game where players navigate hippos through obstacles</li>
          <li><strong>NFT Collection:</strong> Unique hippo-themed NFTs on the SUI blockchain</li>
          <li><strong>Meme Coin:</strong> POOPEE token launching on multiple chains including Cardano</li>
          <li><strong>Staking System:</strong> Earn rewards by staking your NFTs and tokens</li>
          <li><strong>Social Features:</strong> Compete with friends and earn extra credits</li>
          <li><strong>Portfolio Management:</strong> Track all your POOPEE assets in one place</li>
        </ul>

        <h3 className="text-xl font-semibold text-white">Why POOPEE?</h3>
        <p>
          This isn't just another meme project - it's a fully functional ecosystem that combines:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Engaging gameplay with real rewards</li>
          <li>Collectible NFTs with utility</li>
          <li>Multi-chain token deployment</li>
          <li>Community-driven social features</li>
          <li>Long-term value through staking</li>
        </ul>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mt-6">
          <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Note</h4>
          <p className="text-yellow-200">
            The blockchain deployment details are subject to change. While we're planning NFTs on SUI and 
            the meme coin on Cardano, final decisions will be announced as development progresses. 
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};
