
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Target, Shield, Trophy, Coins, Star } from "lucide-react";

export const SpaceInvadersDoc = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Rocket className="h-12 w-12 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Space Invaders</h1>
          <Rocket className="h-12 w-12 text-blue-400" />
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Defend Earth from waves of alien invaders in this classic arcade-style shooter! 
          Test your reflexes and strategy while earning credits for your performance.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Badge variant="secondary" className="bg-blue-600 text-white">Arcade Shooter</Badge>
          <Badge variant="secondary" className="bg-green-600 text-white">Wave-Based</Badge>
          <Badge variant="secondary" className="bg-purple-600 text-white">Credit Rewards</Badge>
          <Badge variant="secondary" className="bg-red-600 text-white">High Score Competition</Badge>
        </div>
      </div>

      {/* Game Overview */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-400" />
            Game Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <p>
            Space Invaders brings the classic arcade experience to the POOPEE platform. Command your spaceship 
            to defend Earth against incoming waves of alien invaders. Each wave becomes progressively more 
            challenging, testing both your shooting accuracy and tactical positioning.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">🎯 Objective</h4>
              <p>Eliminate all alien invaders in each wave before they reach the bottom of the screen or destroy your ship.</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">💰 Rewards</h4>
              <p>Earn credits based on your score, wave progression, and survival time. Higher waves yield better rewards!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-6">
          {/* Controls */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">🎮 Controls</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-400 mb-2">Desktop Controls</h5>
                <ul className="space-y-2 text-sm">
                  <li><span className="font-mono bg-gray-600 px-2 py-1 rounded">←→</span> Move left/right</li>
                  <li><span className="font-mono bg-gray-600 px-2 py-1 rounded">SPACE</span> Shoot lasers</li>
                  <li><span className="font-mono bg-gray-600 px-2 py-1 rounded">P</span> Pause game</li>
                </ul>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-semibold text-green-400 mb-2">Mobile Controls</h5>
                <ul className="space-y-2 text-sm">
                  <li>Touch and drag to move your ship</li>
                  <li>Tap anywhere to shoot</li>
                  <li>Pause button available on screen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Game Mechanics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">⚙️ Game Mechanics</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-400 mb-2">Wave System</h5>
                <p className="text-sm">Each wave introduces more aliens with increased speed and aggression.</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-semibold text-red-400 mb-2">Health System</h5>
                <p className="text-sm">You have limited lives. Getting hit by aliens or their projectiles reduces your health.</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-400 mb-2">Speed Levels</h5>
                <p className="text-sm">Choose from Novice, Intermediate, or Advanced difficulty for different challenge levels.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring & Rewards */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-400" />
            Scoring & Credit Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">🎯 Point Values</h4>
              <div className="space-y-2">
                <div className="flex justify-between bg-gray-700/50 p-2 rounded">
                  <span>Basic Alien</span>
                  <span className="text-green-400">10 points</span>
                </div>
                <div className="flex justify-between bg-gray-700/50 p-2 rounded">
                  <span>Medium Alien</span>
                  <span className="text-green-400">20 points</span>
                </div>
                <div className="flex justify-between bg-gray-700/50 p-2 rounded">
                  <span>Elite Alien</span>
                  <span className="text-green-400">50 points</span>
                </div>
                <div className="flex justify-between bg-gray-700/50 p-2 rounded">
                  <span>Wave Completion</span>
                  <span className="text-blue-400">Bonus x Wave #</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">💰 Credit Conversion</h4>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="mb-3">Credits earned are calculated based on:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Base score multiplier: <strong>1.0x</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-400" />
                    <span>Performance bonus: <strong>0.1x</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-400" />
                    <span>Wave completion bonus: <strong>0.05x per wave</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy & Tips */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-400" />
            Strategy & Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">🏆 Pro Tips</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Focus on eliminating the bottom row of aliens first to prevent them from advancing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use the edges of the screen for safety, but don't get trapped</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Time your shots carefully - rapid firing can be less accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Watch for alien projectiles and prioritize dodging over shooting</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">⚡ Advanced Strategies</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Create "safe lanes" by clearing vertical columns of aliens</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Save high-value targets for last to maximize point streaks</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Practice movement patterns to avoid predictable positioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Master the timing between alien movement cycles</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Modes */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Difficulty Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-lg border border-green-700/50">
              <h4 className="text-lg font-semibold text-green-400 mb-2">🟢 Novice</h4>
              <ul className="text-sm space-y-1">
                <li>• Slower alien movement</li>
                <li>• More time to react</li>
                <li>• Reduced projectile frequency</li>
                <li>• Perfect for beginners</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 p-4 rounded-lg border border-yellow-700/50">
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">🟡 Intermediate</h4>
              <ul className="text-sm space-y-1">
                <li>• Standard game speed</li>
                <li>• Balanced challenge</li>
                <li>• Normal projectile patterns</li>
                <li>• Classic experience</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 p-4 rounded-lg border border-red-700/50">
              <h4 className="text-lg font-semibold text-red-400 mb-2">🔴 Advanced</h4>
              <ul className="text-sm space-y-1">
                <li>• Fast alien movement</li>
                <li>• Quick reactions required</li>
                <li>• High projectile frequency</li>
                <li>• Maximum challenge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Entry */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">🚀 Ready to Defend Earth?</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            Each game costs <span className="text-yellow-400 font-semibold">1 credit</span> to play. 
            Credits earned are based on your performance and can be cashed out or used for other platform features.
          </p>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">🎮 Access Space Invaders from:</p>
            <p className="text-white">Dashboard → Space Invaders</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
