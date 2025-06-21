
export const StakingDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🏦 Staking Guide</h2>
        <p className="text-lg text-gray-300">
          Earn passive rewards by staking your POOPEE tokens and NFTs
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">What is Staking?</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="mb-3">
            Staking allows you to lock up your POOPEE tokens or NFTs for a set period to earn rewards. 
            It's like earning interest on your crypto holdings while supporting the platform's ecosystem.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Passive Income:</strong> Earn rewards without actively playing</li>
            <li><strong>Compound Growth:</strong> Automatically reinvest rewards for exponential gains</li>
            <li><strong>Platform Support:</strong> Help secure and stabilize the POOPEE ecosystem</li>
            <li><strong>Flexible Options:</strong> Choose from multiple staking pools and durations</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Token Staking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">🪙 POOPEE Token Pools</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Flexible Pool:</strong> 5% APY, withdraw anytime</li>
              <li><strong>30-Day Lock:</strong> 12% APY, moderate commitment</li>
              <li><strong>90-Day Lock:</strong> 25% APY, serious stakers</li>
              <li><strong>1-Year Lock:</strong> 50% APY, maximum rewards</li>
            </ul>
          </div>
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">💰 Token Rewards</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Paid in additional POOPEE tokens</li>
              <li>Compound automatically or claim manually</li>
              <li>No minimum staking amount</li>
              <li>Rewards calculated and distributed daily</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">NFT Staking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">🖼️ NFT Staking Pools</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Common Hippos:</strong> 15% APY in POOPEE tokens</li>
              <li><strong>Rare Hippos:</strong> 25% APY + bonus gaming credits</li>
              <li><strong>Epic Hippos:</strong> 40% APY + exclusive perks</li>
              <li><strong>Legendary Hippos:</strong> 75% APY + governance rights</li>
            </ul>
          </div>
          <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-orange-400 mb-2">🎁 NFT Staking Benefits</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Higher yields than token staking</li>
              <li>Exclusive access to new features</li>
              <li>Priority in tournaments and events</li>
              <li>Special cosmetic unlocks in-game</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">How to Start Staking</h3>
        <div className="space-y-3">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📝 Step-by-Step Process</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Connect Your Wallet:</strong> Ensure your wallet with tokens/NFTs is connected</li>
              <li><strong>Navigate to Staking:</strong> Go to Dashboard → Staking</li>
              <li><strong>Choose Pool:</strong> Select the staking pool that matches your goals</li>
              <li><strong>Enter Amount:</strong> Specify how many tokens or which NFTs to stake</li>
              <li><strong>Confirm Transaction:</strong> Approve the staking transaction in your wallet</li>
              <li><strong>Start Earning:</strong> Rewards begin accruing immediately after confirmation</li>
            </ol>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Reward Calculation</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">🧮 Example Calculations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-900/10 rounded p-3">
              <h5 className="font-medium text-blue-400 mb-1">Token Staking Example</h5>
              <p className="text-sm">
                Stake: 1,000 POOPEE<br/>
                Pool: 90-Day Lock (25% APY)<br/>
                Daily Reward: ~0.68 POOPEE<br/>
                90-Day Total: ~62.5 POOPEE
              </p>
            </div>
            <div className="bg-purple-900/10 rounded p-3">
              <h5 className="font-medium text-purple-400 mb-1">NFT Staking Example</h5>
              <p className="text-sm">
                Stake: 1 Epic Hippo NFT<br/>
                Pool: Epic Pool (40% APY)<br/>
                Base Value: 500 POOPEE<br/>
                Annual Reward: 200 POOPEE
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * APY rates are variable and subject to change based on pool performance and market conditions
          </p>
        </div>

        <h3 className="text-xl font-semibold text-white">Advanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🔄 Auto-Compound</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Automatically reinvest rewards</li>
              <li>Maximize compound growth</li>
              <li>No manual claiming required</li>
              <li>Can be enabled/disabled anytime</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🗳️ Governance Staking</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Vote on platform decisions</li>
              <li>Proposal creation rights</li>
              <li>Bonus rewards for participation</li>
              <li>Shape the future of POOPEE</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Risks and Considerations</h3>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Important Notes</h4>
          <ul className="list-disc list-inside space-y-1 text-yellow-200">
            <li><strong>Lock-up Periods:</strong> Some pools prevent withdrawals for set periods</li>
            <li><strong>Market Risk:</strong> Token values can fluctuate independent of staking rewards</li>
            <li><strong>Smart Contract Risk:</strong> Though audited, DeFi protocols carry inherent risks</li>
            <li><strong>Reward Variability:</strong> APY rates may change based on pool performance</li>
            <li><strong>Gas Fees:</strong> Network fees apply for staking and unstaking transactions</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Frequently Asked Questions</h3>
        <div className="space-y-2">
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Can I unstake anytime?</summary>
            <p className="mt-2 text-sm">Depends on the pool. Flexible pools allow instant withdrawal, while locked pools have minimum periods.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">What happens to my NFT when staked?</summary>
            <p className="mt-2 text-sm">Your NFT remains in your wallet but is locked from trading. You retain ownership and can unstake to regain full control.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Are staking rewards taxable?</summary>
            <p className="mt-2 text-sm">Tax implications vary by jurisdiction. Consult with a tax professional regarding crypto staking in your area.</p>
          </details>
        </div>
      </div>
    </div>
  );
};
