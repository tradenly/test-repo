import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Coins, Zap, Target, Clock, Star, Users } from "lucide-react";

export const MissPoopeeManDoc = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Gamepad2 className="h-8 w-8 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Miss POOPEE-Man</h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Navigate through mazes, collect pellets, and avoid ghosts in our thrilling Pac-Man inspired adventure!
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Trophy className="h-3 w-3 mr-1" />
            Arcade Classic
          </Badge>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Coins className="h-3 w-3 mr-1" />
            Earn Credits
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Zap className="h-3 w-3 mr-1" />
            Fast-Paced
          </Badge>
        </div>
      </div>

      {/* Game Overview */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-yellow-400" />
            Game Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <p>
            Miss POOPEE-Man is our exciting take on the classic Pac-Man arcade game. Navigate through challenging 
            mazes while collecting pellets and avoiding dangerous ghosts. Use power pellets to turn the tables 
            and hunt the ghosts for bonus points!
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">🎯 Objective</h4>
              <p className="text-sm">Collect all pellets in the maze while avoiding ghosts</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">💰 Rewards</h4>
              <p className="text-sm">Earn credits based on score and pellets collected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-blue-400" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🎮 Controls</h4>
              <ul className="space-y-1 text-sm">
                <li><kbd className="bg-gray-800 px-2 py-1 rounded">W</kbd> or <kbd className="bg-gray-800 px-2 py-1 rounded">↑</kbd> - Move Up</li>
                <li><kbd className="bg-gray-800 px-2 py-1 rounded">S</kbd> or <kbd className="bg-gray-800 px-2 py-1 rounded">↓</kbd> - Move Down</li>
                <li><kbd className="bg-gray-800 px-2 py-1 rounded">A</kbd> or <kbd className="bg-gray-800 px-2 py-1 rounded">←</kbd> - Move Left</li>
                <li><kbd className="bg-gray-800 px-2 py-1 rounded">D</kbd> or <kbd className="bg-gray-800 px-2 py-1 rounded">→</kbd> - Move Right</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">📱 Mobile Controls</h4>
              <ul className="space-y-1 text-sm">
                <li>• Touch/tap to move in desired direction</li>
                <li>• Swipe gestures for quick movement</li>
                <li>• On-screen directional buttons</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Elements */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-400" />
            Game Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">🟡</div>
              <h4 className="font-semibold text-white">Pellets</h4>
              <p className="text-xs">Collect for points</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-white">Power Pellets</h4>
              <p className="text-xs">Make ghosts vulnerable</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">👻</div>
              <h4 className="font-semibold text-white">Ghosts</h4>
              <p className="text-xs">Avoid or hunt them</p>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl mb-2">🍒</div>
              <h4 className="font-semibold text-white">Bonus Items</h4>
              <p className="text-xs">Extra points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold-400" />
            Scoring & Rewards
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🎯 Point Values</h4>
              <ul className="space-y-1 text-sm">
                <li>• Small Pellet: <span className="text-yellow-400">10 points</span></li>
                <li>• Power Pellet: <span className="text-yellow-400">50 points</span></li>
                <li>• Ghost (vulnerable): <span className="text-yellow-400">200-800 points</span></li>
                <li>• Bonus Items: <span className="text-yellow-400">100-1000 points</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">💰 Credit Rewards</h4>
              <ul className="space-y-1 text-sm">
                <li>• Base reward: <span className="text-green-400">Score / 1000</span></li>
                <li>• Pellet bonus: <span className="text-green-400">0.1 per pellet</span></li>
                <li>• High score bonus: <span className="text-green-400">+50% if new record</span></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Tips */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-400" />
            Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">🧠 Basic Strategy</h4>
              <ul className="space-y-1 text-sm">
                <li>• Learn ghost movement patterns</li>
                <li>• Save power pellets for when cornered</li>
                <li>• Clear corners first for escape routes</li>
                <li>• Use tunnel teleports strategically</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white">⚡ Advanced Tips</h4>
              <ul className="space-y-1 text-sm">
                <li>• Chain ghost captures for bonus multipliers</li>
                <li>• Time bonus item appearances</li>
                <li>• Master the art of ghost baiting</li>
                <li>• Plan optimal maze clearing routes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Modes */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            Game Modes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">🎮 Classic Mode</h4>
              <p className="text-sm">Traditional Pac-Man gameplay with progressive difficulty</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">⚡ Speed Mode</h4>
              <p className="text-sm">Faster gameplay for increased challenge and rewards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboards */}
      <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Compete & Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <p>
            Compete with other players on our global leaderboards! Track your progress and see how 
            you rank against the community in various categories.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <h5 className="font-semibold text-white">🏆 High Scores</h5>
              <p className="text-xs">Best single game scores</p>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <h5 className="font-semibold text-white">🎯 Most Pellets</h5>
              <p className="text-xs">Highest pellet collection</p>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <h5 className="font-semibold text-white">⚡ Speed Records</h5>
              <p className="text-xs">Fastest maze completions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};