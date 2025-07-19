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
                src="/lovable-uploads/4e915684-75cb-44da-8466-58e7758c3d10.png" 
                alt="Hippo character with white hair in leather jacket" 
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
              Mint Coming Soon 
            </Button>
            <p className="text-sm text-gray-400 mt-2 font-bold">
              MINTING MAY CAUSE REGRET.
            </p>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/e30e94f0-926b-4f04-8fb4-99e1b71c1690.png" 
                alt="Poopee token blue design" 
                className="w-16 h-16 mx-auto"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Poopee Meme Token</h3>
            <div className="space-y-3 text-left">
              <p className="text-lg text-gray-300"><span className="font-bold">Ticker:</span> PPEE</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Supply:</span> 420,069,000</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Date:</span> TBD</p>
              <p className="text-lg text-gray-300"><span className="font-bold">Blockchain:</span> Cardano </p>
            </div>
            <Button 
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold border border-gray-600"
              onClick={() => window.open('https://minswap.org/launch-bowl?t=live-launch', '_blank')}
            >
              Coming Soon To Minswap
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
                src="/lovable-uploads/0db4a572-2651-453b-aad7-009524574ac5.png" 
                alt="Gray hippo with white hair in leather jacket" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Flappy Hippos</p>
            <p className="text-sm text-gray-300">Tap, Cry, Repeat</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/8346bb4c-b6a6-473a-bd55-22e521d0c64e.png" 
                alt="Hippo with dark hair and halo in leather jacket" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Falling Logs</p>
            <p className="text-sm text-gray-300">Tetris, But Worse</p>
          </div>
          
          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/de5c3f49-e668-4835-a60e-8a561fe63937.png" 
                alt="Hippo with blonde hair in beige leather jacket" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Meme Coin Launch</p>
            <p className="text-sm text-gray-300">Probably Cardano, Maybe</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/b795a125-6dda-463c-b27e-800950d0f2a5.png" 
                alt="Hippo with pink mohawk in leather jacket" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">NFT Collection</p>
            <p className="text-sm text-gray-300">Total Waste</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/94cd6eac-81ac-496d-aba5-58f0b332241e.png" 
                alt="Hippo with black hair in white leather jacket" 
                className="w-16 h-16 mx-auto rounded-lg"
              />
            </div>
            <p className="text-white font-bold">Poopee Crush</p>
            <p className="text-sm text-gray-300">Candy Crush Rip Off</p>
          </div>

          <div className="bg-gray-700/60 rounded-lg p-6 text-center border border-gray-600">
            <div className="mb-2">
              <img 
                src="/lovable-uploads/120ff7e9-7ccb-469b-9f7e-b1a2bfb461a1.png" 
                alt="Hippo with brown beard in dark leather jacket" 
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
