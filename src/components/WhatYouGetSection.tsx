import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Rocket } from "lucide-react";

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

  const handleContactUs = () => {
    if (user) {
      navigate('/contact');
    } else {
      navigate('/auth');
    }
  };

  const getGameCost = (gameType: string) => {
    const settings = gameSettings?.find(g => g.game_type === gameType);
    return settings?.entry_cost_credits || 1;
  };

  const gameCards = [
    {
      id: 'flappy-hippos',
      image: '/lovable-uploads/c0b71020-c9b3-45d6-ab9e-6039d6dd8bb4.png',
      alt: 'Hippo with sunglasses',
      title: 'Flappy Hippos',
      subtitle: 'Tap, Cry, Repeat',
      features: [
        'Navigate your hippo through pipes',
        `Costs ${getGameCost('flappy_hippos')} credit${getGameCost('flappy_hippos') !== 1 ? 's' : ''} per game`,
        'Built-in shield system (because you\'ll need it)',
        'Adjustable speed for maximum suffering'
      ],
      buttonText: 'Play & Suffer 🎮',
      buttonClass: 'bg-green-600 hover:bg-green-700 border-green-500',
      section: 'flappy-hippos'
    },
    {
      id: 'falling-logs',
      image: '/lovable-uploads/623aca37-1cc9-4d34-9467-be60a163841a.png',
      alt: 'Cool hippo character',
      title: 'Falling Logs',
      subtitle: 'Tetris, But Worse',
      features: [
        'Stack logs like a degenerate lumberjack',
        'Clear lines for points and credits',
        'Speeds up because we hate you',
        'Somehow more addictive than it should be'
      ],
      buttonText: 'Stack Some Logs 🪵',
      buttonClass: 'bg-purple-600 hover:bg-purple-700 border-purple-500',
      section: 'falling-logs'
    },
    {
      id: 'poopee-crush',
      image: '/lovable-uploads/70b8ec5d-bdc5-497f-823d-a9526fdc2baa.png',
      alt: 'Cool blue hippo with gold chain and sunglasses',
      title: 'POOPEE Crush',
      subtitle: 'Match 3, Regret Forever',
      features: [
        'Match 3 or more POOPEE tiles',
        `Costs ${getGameCost('poopee_crush')} credit${getGameCost('poopee_crush') !== 1 ? 's' : ''} per game`,
        'Special boosters for maximum chaos',
        'Addictive puzzle madness'
      ],
      buttonText: 'Crush Some POOPEE 💎',
      buttonClass: 'bg-pink-600 hover:bg-pink-700 border-pink-500',
      section: 'poopee-crush'
    },
    {
      id: 'miss-poopee-man',
      image: '/lovable-uploads/b896f4cd-250a-4f3c-b051-0128831d13f0.png',
      alt: 'Happy hippo with gold chain',
      title: 'Miss POOPEE-Man',
      subtitle: 'Pac-Man, But Hippo',
      features: [
        'Navigate mazes and collect pellets',
        `Costs ${getGameCost('miss_poopee_man')} credit${getGameCost('miss_poopee_man') !== 1 ? 's' : ''} per game`,
        'Avoid ghosts or hunt them down',
        'Classic arcade action with POOPEE twist'
      ],
      buttonText: (
        <span className="flex items-center gap-2">
          Hunt Some Ghosts
          <Gamepad2 className="h-4 w-4" />
        </span>
      ),
      buttonClass: 'bg-blue-600 hover:bg-blue-700 border-blue-500',
      section: 'miss-poopee-man'
    },
    {
      id: 'space-invaders',
      image: '/lovable-uploads/a17135f5-f44e-47e3-b35e-98de0b61ee4a.png',
      alt: 'Blue hippo with chain',
      title: 'Space Invaders',
      subtitle: 'Defend Earth, Hippo Style',
      features: [
        'Defend against waves of alien invaders',
        `Costs ${getGameCost('space_invaders')} credit${getGameCost('space_invaders') !== 1 ? 's' : ''} per game`,
        'Progressive difficulty with wave bonuses',
        'Classic arcade shooter with hippo flair'
      ],
      buttonText: (
        <span className="flex items-center gap-2">
          Defend Earth
          <Rocket className="h-4 w-4" />
        </span>
      ),
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500',
      section: 'space-invaders'
    }
  ];

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
            Five games that will make you question your life choices
          </p>
        </div>

        <div className="mb-16">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {gameCards.map((game) => (
                <CarouselItem key={game.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700 h-full flex flex-col">
                      <div className="mb-6">
                        <img 
                          src={game.image} 
                          alt={game.alt} 
                          className="w-20 h-20 mx-auto rounded-lg"
                        />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4 text-center">{game.title}</h3>
                      <p className="text-lg text-gray-300 mb-6">
                        <span className="font-bold">{game.subtitle}</span>
                      </p>
                      <div className="space-y-3 text-left text-gray-300 mb-6 flex-grow">
                        {game.features.map((feature, index) => (
                          <p key={index}>• {feature}</p>
                        ))}
                      </div>
                      <Button 
                        className={`w-full text-white font-bold py-3 border ${game.buttonClass}`}
                        onClick={() => handleGameNavigation(game.section)}
                      >
                        {game.buttonText}
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600" />
            <CarouselNext className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600" />
          </Carousel>
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
              onClick={handleContactUs}
            >
              Contact Us 💬
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
