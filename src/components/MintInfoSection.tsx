
import { Button } from "@/components/ui/button";

export const MintInfoSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-green-400 via-blue-500 to-purple-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-16">
          The Memeomics 📊
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/30">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-white mb-4">SUI NFT Mint</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-yellow-200"><span className="font-bold">Platform:</span> TradePort</p>
              <p className="text-lg text-yellow-200"><span className="font-bold">Supply:</span> TBD</p>
              <p className="text-lg text-yellow-200"><span className="font-bold">Date:</span> Coming Soon</p>
              <p className="text-lg text-yellow-200"><span className="font-bold">Price:</span> Your Regret</p>
            </div>
            <Button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Mint coming soon on tradeport.xyz
            </Button>
            <p className="text-sm text-red-200 mt-2 font-bold">
              MINTING MAY CAUSE REGRET.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 border border-white/30">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-4">Cardano Token</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-yellow-200"><span className="font-bold">Token:</span> POOPEE</p>
              <p className="text-lg text-yellow-200"><span className="font-bold">Supply:</span> 420,069,000</p>
              <p className="text-lg text-yellow-200"><span className="font-bold">Distribution:</span> TBD</p>
              <p className="text-lg text-yellow-200"><span className="font-bold">Utility:</span> Literally Forever</p>
            </div>
            <Button className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold">
              Coming Soon (Maybe)
            </Button>
            <p className="text-sm text-red-200 mt-2 font-bold">
              THERE IS NO REFUND. THERE IS NO ESCAPE.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-red-500/80 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">💾</div>
            <p className="text-white font-bold">RGS Diary</p>
            <p className="text-sm text-red-100">What was Lost</p>
          </div>
          
          <div className="bg-yellow-500/80 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-white font-bold">2K</p>
            <p className="text-sm text-yellow-100">What we Bought</p>
          </div>
          
          <div className="bg-purple-500/80 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🧻</div>
            <p className="text-white font-bold">Unlimited Ptoper</p>
            <p className="text-sm text-purple-100">What Forever</p>
          </div>

          <div className="bg-blue-500/80 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-white font-bold">Lost All Ash</p>
            <p className="text-sm text-blue-100">What's at Ash</p>
          </div>

          <div className="bg-gray-500/80 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-white font-bold">Moon</p>
            <p className="text-sm text-gray-100">What'd</p>
          </div>

          <div className="bg-green-500/80 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">🎭</div>
            <p className="text-white font-bold">Regret</p>
            <p className="text-sm text-green-100">What's</p>
          </div>
        </div>
      </div>
    </section>
  );
};
