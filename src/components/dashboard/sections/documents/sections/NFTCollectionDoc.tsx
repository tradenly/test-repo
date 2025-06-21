
export const NFTCollectionDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🖼️ POOPEE NFT Collection</h2>
        <p className="text-lg text-gray-300">
          Unique, toilet-worthy hippo NFTs on the SUI blockchain
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Collection Overview</h3>
        <p>
          The POOPEE NFT collection features uniquely designed hippos with various traits, accessories, 
          and toilet-themed attributes. Each NFT is not just a collectible but provides real utility 
          within the POOPEE ecosystem.
        </p>

        <h3 className="text-xl font-semibold text-white">Why SUI Blockchain?</h3>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Low transaction fees for minting and trading</li>
          <li>Fast transaction speeds</li>
          <li>Advanced smart contract capabilities</li>
          <li>Growing NFT ecosystem</li>
          <li>Excellent developer tools and support</li>
        </ul>

        <h3 className="text-xl font-semibold text-white">NFT Utilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🎮 Gaming Benefits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Extra starting shields in Flappy Hippos</li>
              <li>Bonus credit multipliers</li>
              <li>Exclusive game modes</li>
              <li>Special hippo skins</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 Staking Rewards</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Stake NFTs for passive income</li>
              <li>Higher staking yields than tokens</li>
              <li>Exclusive staking pools</li>
              <li>Compound rewards automatically</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Rarity Tiers</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-green-900/20 border border-green-600/30 rounded p-3">
            <span className="font-medium">Common Hippos</span>
            <span className="text-green-400">60% of collection</span>
          </div>
          <div className="flex justify-between items-center bg-blue-900/20 border border-blue-600/30 rounded p-3">
            <span className="font-medium">Rare Hippos</span>
            <span className="text-blue-400">25% of collection</span>
          </div>
          <div className="flex justify-between items-center bg-purple-900/20 border border-purple-600/30 rounded p-3">
            <span className="font-medium">Epic Hippos</span>
            <span className="text-purple-400">12% of collection</span>
          </div>
          <div className="flex justify-between items-center bg-orange-900/20 border border-orange-600/30 rounded p-3">
            <span className="font-medium">Legendary Hippos</span>
            <span className="text-orange-400">3% of collection</span>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mt-6">
          <h4 className="text-blue-400 font-semibold mb-2">🔄 Subject to Change</h4>
          <p className="text-blue-200">
            NFT deployment details, including the specific blockchain, are still being finalized. 
            While SUI is our current target, we may adjust based on market conditions and technical considerations.
          </p>
        </div>
      </div>
    </div>
  );
};
