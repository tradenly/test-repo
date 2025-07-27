import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useGameSettings } from "@/hooks/useGameSettings";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Rocket, Github } from "lucide-react";

export const WhatYouGetSection = () => {
  const { user } = useUnifiedAuth();
  const navigate = useNavigate();
  const { data: gameSettings } = useGameSettings();

  const handleGameNavigation = (gameSection: string) => {
    if (user) {
      // Special handling for Meta Mint to route to free-tools
      if (gameSection === 'meta-mint') {
        navigate('/dashboard?section=free-tools');
      } else if (gameSection === 'ai-agents') {
        // Special handling for AI Agents - route to ai-agent section (singular)
        navigate('/dashboard?section=ai-agent');
      } else {
        // Navigate to dashboard with the specific game section
        navigate(`/dashboard?section=${gameSection}`);
      }
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
      image: '/lovable-uploads/33d54ff0-7a4e-4d66-b934-820e481d4969.png',
      alt: 'Hippo with sunglasses in yellow jacket',
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
      image: '/lovable-uploads/ad926715-76b4-4182-aebc-10180448ef7e.png',
      alt: 'Hippo lumberjack with axe in forest setting',
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
      image: '/lovable-uploads/8d85cb45-80d6-4eb2-a0a8-45a2ae6184bf.png',
      alt: 'Cool hippo with mohawk in leather jacket on city street',
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
      image: '/lovable-uploads/d83c348a-6414-47f1-9824-d7a332f2c68b.png',
      alt: 'Hippo performer with microphone on stage',
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
      image: '/lovable-uploads/7073f22a-130b-4987-8545-386bd2851696.png',
      alt: 'Hippo in urban setting with fur-lined jacket',
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
    },
    {
      id: 'hippo-kong',
      image: '/lovable-uploads/e52b0387-1d8b-4c6b-b594-f2e824a3a72b.png',
      alt: 'Gorilla character in green jacket with brown fur',
      title: 'Hippo Kong',
      subtitle: 'Climb, Jump, Survive',
      features: [
        'Help the gorilla climb to the top',
        `Costs ${getGameCost('hippo_kong')} credit${getGameCost('hippo_kong') !== 1 ? 's' : ''} per game`,
        'Dodge falling barrels and obstacles',
        'Classic arcade climbing action'
      ],
      buttonText: (
        <span className="flex items-center gap-2">
          Start Climbing
          <Gamepad2 className="h-4 w-4" />
        </span>
      ),
      buttonClass: 'bg-orange-600 hover:bg-orange-700 border-orange-500',
      section: 'hippo-kong'
    },
    {
      id: 'meta-mint',
      image: '/lovable-uploads/e2ca9815-80dc-4e4b-aa77-bdbe18f425f1.png',
      alt: 'Hippo character with green mohawk in urban setting',
      title: 'Meta Mint',
      subtitle: 'AI Generated Metadata',
      features: [
        'Effortlessly generate metadata',
        'No layers, No problem',
        'Generate metadata for up to 10k NFTs',
        'Use completely FREE integrated Tensorflow'
      ],
      buttonText: (
        <span className="flex items-center gap-2">
          Generate Metadata
          <Rocket className="h-4 w-4" />
        </span>
      ),
      buttonClass: 'bg-cyan-600 hover:bg-cyan-700 border-cyan-500',
      section: 'meta-mint'
    },
    {
      id: 'ai-agents',
      image: '/lovable-uploads/c0f514c3-8d68-420d-a918-91676558536b.png',
      alt: 'Hippo character with green mohawk and tattoos in urban setting',
      title: 'AI Agents',
      subtitle: 'Bots That Actually Work',
      features: [
        'Deploy intelligent AI agents',
        'Automate your POOPEE empire',
        'Custom agent personalities',
        'Actually helpful digital assistants'
      ],
      buttonText: (
        <span className="flex items-center gap-2">
          Deploy Agents
          <Rocket className="h-4 w-4" />
        </span>
      ),
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500',
      section: 'ai-agents'
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
            Six games that will make you question your life choices
          </p>
        </div>

        <div className="mb-16 relative">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {gameCards.map((game) => (
                <CarouselItem key={game.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 h-full flex flex-col min-h-[520px]">
                      <div className="mb-6">
                        <img 
                          src={game.image} 
                          alt={game.alt} 
                          className="w-20 h-20 mx-auto rounded-lg object-cover"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 text-center">{game.title}</h3>
                      <p className="text-lg text-gray-300 mb-6 text-center">
                        <span className="font-bold">{game.subtitle}</span>
                      </p>
                      <div className="space-y-2 text-left text-gray-300 mb-6 flex-grow">
                        {game.features.map((feature, index) => (
                          <p key={index} className="text-sm leading-relaxed">• {feature}</p>
                        ))}
                      </div>
                      <Button 
                        className={`w-full text-white font-bold py-3 border ${game.buttonClass} mt-auto`}
                        onClick={() => handleGameNavigation(game.section)}
                      >
                        {game.buttonText}
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 -left-6 sm:-left-12" />
            <CarouselNext className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 -right-6 sm:-right-12" />
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
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg border border-gray-600"
              onClick={() => window.open('https://x.com/tropicalfattys', '_blank')}
            >
              Complain With Us 🐦
            </Button>
            
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg border border-gray-600"
              onClick={() => window.open('https://medium.com/@poopee', '_blank')}
            >
              Read Our Lies 📖
            </Button>
            
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg border border-gray-600 flex items-center gap-2"
              onClick={() => window.open('https://github.com/Tropicalfattys', '_blank')}
            >
              Maliciously Infected Code
              <Github className="h-4 w-4" />
            </Button>
            
            <Button 
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full text-lg border border-gray-600"
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
