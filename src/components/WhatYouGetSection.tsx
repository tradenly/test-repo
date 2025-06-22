import { Button } from "@/components/ui/button";

export const WhatYouGetSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-black to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-16">
          What We Actually Built (Somehow) 🎮
        </h2>
        
        <div className="mb-16">
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            We said we'd build games. We actually did. Shocking, we know.
          </p>
          <p className="text-lg text-gray-400 italic">
            Two games that will make you question your life choices
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/c0b71020-c9b3-45d6-ab9e-6039d6dd8bb4.png" 
                alt="Hippo with sunglasses" 
                className="w-20 h-20 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 text-center">Flappy Hippos</h3>
            <p className="text-lg text-gray-300 mb-6">
              <span className="font-bold">Tap, Cry, Repeat</span>
            </p>
            <div className="space-y-3 text-left text-gray-300 mb-6">
              <p>• Navigate your hippo through pipes</p>
              <p>• Costs 1 credit per game</p>
              <p>• Built-in shield system (because you'll need it)</p>
              <p>• Adjustable speed for maximum suffering</p>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 border border-green-500"
              onClick={() => window.location.href = '/dashboard'}
            >
              Play & Suffer 🎮
            </Button>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/623aca37-1cc9-4d34-9467-be60a163841a.png" 
                alt="Cool hippo character" 
                className="w-20 h-20 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">🪵 Falling Logs</h3>
            <p className="text-lg text-gray-300 mb-6">
              <span className="font-bold">Tetris, But Worse</span>
            </p>
            <div className="space-y-3 text-left text-gray-300 mb-6">
              <p>• Stack logs like a degenerate lumberjack</p>
              <p>• Clear lines for points and credits</p>
              <p>• Speeds up because we hate you</p>
              <p>• Somehow more addictive than it should be</p>
            </div>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 border border-purple-500"
              onClick={() => window.location.href = '/dashboard'}
            >
              Stack Some Logs 🪵
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 mb-12 border border-gray-700">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-white mb-6">
            Future Games: Maybe. Depends on How We Feel.
          </h3>
          <p className="text-lg text-gray-300 mb-4">
            More games coming... probably. Don't hold your breath.
          </p>
          <p className="text-sm text-gray-400 italic">
            Our development strategy: Chaos with occasional bursts of productivity.
          </p>
        </div>

        <div className="space-y-8">
          <h3 className="text-4xl font-bold text-white">
            Join the Chaos 🌪️
          </h3>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Follow our journey into degeneracy. Complain with us. Read our lies. Suffer together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full text-lg border border-gray-600"
              onClick={() => window.open('https://x.com/OGpoopee', '_blank')}
            >
              Complain With Us 🐦
            </Button>
            
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full text-lg border border-gray-600"
              onClick={() => window.open('https://medium.com/@poopee', '_blank')}
            >
              Read Our Lies 📖
            </Button>
            
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full text-lg border border-gray-600"
            >
              Suffer Together 💬
            </Button>
          </div>
          
          <p className="text-sm text-gray-400 font-bold">
            No promises. No roadmap. Just vibes and questionable decisions.
          </p>
        </div>
      </div>
    </section>
  );
};
