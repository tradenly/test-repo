
export const WalletsDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">💳 Wallets & Credits Guide</h2>
        <p className="text-lg text-gray-300">
          Connect your wallet and manage your credits like a pro
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Why Connect a Wallet?</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Seamless Payments:</strong> Purchase credits directly with cryptocurrency</li>
            <li><strong>Instant Transactions:</strong> No waiting for bank transfers or card processing</li>
            <li><strong>Lower Fees:</strong> Bypass traditional payment processor fees</li>
            <li><strong>True Ownership:</strong> Your tokens and NFTs remain in your control</li>
            <li><strong>Multi-Chain Support:</strong> Use different cryptocurrencies across various blockchains</li>
            <li><strong>Future-Proof:</strong> Ready for upcoming DeFi features and token rewards</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Supported Wallets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🌐 Browser Extensions</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>MetaMask (Ethereum, Polygon, BSC)</li>
              <li>Phantom (Solana)</li>
              <li>SUI Wallet (SUI Network)</li>
              <li>Nami/Eternl (Cardano)</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📱 Mobile Wallets</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Trust Wallet</li>
              <li>Coinbase Wallet</li>
              <li>Rainbow Wallet</li>
              <li>Phantom Mobile</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">How to Connect Your Wallet</h3>
        <div className="space-y-3">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 1: Install a Wallet</h4>
            <p className="text-sm">Download and set up a supported wallet extension or mobile app. Make sure to securely store your seed phrase!</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 2: Navigate to Wallets Section</h4>
            <p className="text-sm">Go to Dashboard → Wallets in your POOPEE account to see available connection options.</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 3: Click Connect</h4>
            <p className="text-sm">Select your wallet type and approve the connection request. No private keys are shared!</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Step 4: Verify Connection</h4>
            <p className="text-sm">Once connected, you'll see your wallet address and can start purchasing credits immediately.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Buying Credits with Crypto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💰 Supported Cryptocurrencies</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>ETH (Ethereum)</li>
              <li>MATIC (Polygon)</li>
              <li>BNB (Binance Smart Chain)</li>
              <li>SOL (Solana)</li>
              <li>SUI (SUI Network)</li>
              <li>ADA (Cardano) - Coming Soon</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">⚡ Purchase Process</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Select amount of credits to buy</li>
              <li>Choose your preferred cryptocurrency</li>
              <li>Approve the transaction in your wallet</li>
              <li>Credits appear instantly after confirmation</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Credit Exchange Rates</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">1 Credit</div>
              <div className="text-sm">≈ $0.10 USD</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">10 Credits</div>
              <div className="text-sm">≈ $0.95 USD</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">100 Credits</div>
              <div className="text-sm">≈ $9.00 USD</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">1000 Credits</div>
              <div className="text-sm">≈ $85.00 USD</div>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            * Rates are approximate and may vary based on network fees and market conditions
          </p>
        </div>

        <h3 className="text-xl font-semibold text-white">Security Best Practices</h3>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-2">🔒 Keep Your Wallet Safe</h4>
          <ul className="list-disc list-inside space-y-1 text-red-200">
            <li>Never share your private keys or seed phrase with anyone</li>
            <li>Only connect to the official POOPEE platform</li>
            <li>Always verify transaction details before approving</li>
            <li>Use hardware wallets for large amounts</li>
            <li>Keep your wallet software updated</li>
            <li>Be cautious of phishing attempts</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Troubleshooting</h3>
        <div className="space-y-2">
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Wallet won't connect?</summary>
            <p className="mt-2 text-sm">Make sure your wallet is unlocked, on the correct network, and that you're approving the connection request.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Transaction failed?</summary>
            <p className="mt-2 text-sm">Check that you have sufficient balance for both the purchase and network fees. Try increasing gas fees if the network is congested.</p>
          </details>
          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-white cursor-pointer">Credits not appearing?</summary>
            <p className="mt-2 text-sm">Credits appear after blockchain confirmation. This usually takes 1-5 minutes depending on network congestion.</p>
          </details>
        </div>
      </div>
    </div>
  );
};
