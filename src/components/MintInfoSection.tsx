
import { Button } from "@/components/ui/button";

export const MintInfoSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-16">
          The MEMENOMICS
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/5550bd81-24fd-4185-af5c-e08477374db2.png" 
                alt="Poopee NFT mint logo with blue circular design" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Poopee NFT Mint</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-gray-300"><span className="font-bold">Platform:</span> Who Knows?</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Supply:</span> 5k</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Price:</span> FREE</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Blockchain:</span> Community Vote</p>
            </div>
            <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold border border-gray-600">
              Tropical Fattys Mint Coming Soon 
            </Button>
            <p className="text-sm text-gray-400 mt-2 font-bold">
              MINTING MAY CAUSE REGRET.
            </p>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/94ca39da-e299-4a30-994c-b6540013f7c2.png" 
                alt="Poopee hippo character with leather jacket" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Poopee Meme Token</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-gray-300"><span className="font-bold">Ticker:</span> PPEE</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Supply:</span> 420,069,000</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Date:</span> July 28th 2025</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Blockchain:</span> Cardano </p>
            </div>
            <Button 
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold border border-gray-600"
              onClick={() => window.open('https://minswap.org/launch-bowl?t=live-launch', '_blank')}
            >
              Buy On Minswap
            </Button>
            <p className="text-sm text-gray-400 mt-2 font-bold">
              THERE IS NO REFUND. THERE IS NO ESCAPE.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/edd10e7d-afa4-408d-9aaf-dca2c14ed667.png" 
                alt="Hippo with sunglasses" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Flappy Hippos</p>
            <p className="text-sm text-gray-300">Tap, Cry, Repeat</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/aa3fd7bd-0166-4a43-8ed8-87dca2caacbf.png" 
                alt="Cool hippo character" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Falling Logs</p>
            <p className="text-sm text-gray-300">Tetris, But Worse</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/3c169d5a-bf8a-4792-8dee-1b753b85cc39.png" 
                alt="Happy hippo with gold chain" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Meme Coin Launch</p>
            <p className="text-sm text-gray-300">Probably Cardano, Maybe</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/56303339-9d85-4af3-865e-8f0a80fda0c9.png" 
                alt="Blue hippo with chain" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">NFT Collection</p>
            <p className="text-sm text-gray-300">Total Waste</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/6dde568d-a13d-46ef-944c-5959fae3fe53.png" 
                alt="Purple hippo with sunglasses" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Poopee Crush</p>
            <p className="text-sm text-gray-300">Candy Crush Rip Off</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/2ff5720f-be7a-4ea8-a088-74c4321ad5aa.png" 
                alt="Stylish hippo character" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Free Tools</p>
            <p className="text-sm text-gray-300">Somehow, They Works</p>
          </div>
        </div>
      </div>
    </section>
  );
};
