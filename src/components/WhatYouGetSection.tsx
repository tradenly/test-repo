
import { Button } from "@/components/ui/button";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useNavigate } from "react-router-dom";

export const WhatYouGetSection = () => {
  const { user } = useUnifiedAuth();
  const navigate = useNavigate();
  const { data: gameSettings } = useGameSettings();

  const handleGameNavigation = (gameSection: string) => {
    if (user) {
      // Navigate to dashboard with the specific game section
      navigate(`/dashboard?section=${gameSection}`);
    } else {
      // Redirect to auth page if not logged in
      navigate('/auth');
    }
  };

  const getGameCost = (gameType: string) => {
    const settings = gameSettings?.find(g => g.game_type === gameType);
    return settings?.entry_cost_credits || 1;
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 via-black to-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-white mb-16 text-center">
          What We Actually Built (Somehow)
        </h2>
        
        <div className="mb-16">
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            We said we'd build games. We actually did. Shocking, we know.
          </p>
          <p className="text-lg text-gray-400 italic">
            Three games that will make you question your life choices
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/43cb426f-322a-4c07-bdd7-73f27fa00f34.png" 
                alt="Hippo with spiked hair in leather jacket and yellow pants" 
                className="w-20 h-20 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 text-center">Flappy Hippos</h3>
            <p className="text-lg text-gray-300 mb-6">
              <span className="font-bold">Tap, Cry, Repeat</span>
            </p>
            <div className="space-y-3 text-left text-gray-300 mb-6">
              <p>• Navigate your hippo through pipes</p>
              <p>• Costs {getGameCost('flappy_hippos')} credit{getGameCost('flappy_hippos') !== 1 ? 's' : ''} per game</p>
              <p>• Built-in shield system (because you'll need it)</p>
              <p>• Adjustable speed for maximum suffering</p>
            </div>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 border border-green-500"
              onClick={() => handleGameNavigation('flappy-hippos')}
            >
              Play & Suffer 🎮
            </Button>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/b0325990-35ce-441f-be10-6ce07fe18f0d.png" 
                alt="Hippo with dark hair in leather jacket and red pants with tattoos" 
                className="w-20 h-20 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 text-center">Falling Logs</h3>
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
              onClick={() => handleGameNavigation('falling-logs')}
            >
              Stack Some Logs 🪵
            </Button>
          </div>

          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/201efece-ee9a-4e45-b03e-cb82231d457d.png" 
                alt="Hippo with blue spiky hair in white jacket and jeans with tattoos" 
                className="w-20 h-20 mx-auto rounded-lg"
              />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 text-center">POOPEE Crush</h3>
            <p className="text-lg text-gray-300 mb-6">
              <span className="font-bold">Match 3, Regret Forever</span>
            </p>
            <div className="space-y-3 text-left text-gray-300 mb-6">
              <p>• Match 3 or more POOPEE tiles</p>
              <p>• Costs {getGameCost('poopee_crush')} credit{getGameCost('poopee_crush') !== 1 ? 's' : ''} per game</p>
              <p>• Special boosters for maximum chaos</p>
              <p>• Addictive puzzle madness</p>
            </div>
            <Button 
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 border border-pink-500"
              onClick={() => handleGameNavigation('poopee-crush')}
            >
              Crush Some POOPEE 💎
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
              onClick={() => window.open('https://x.com/tropicalfattys', '_blank')}
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
