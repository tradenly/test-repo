
import React from 'react';
import { SpaceInvadersGameArea } from './space-invaders/SpaceInvadersGameArea';
import { SpaceInvadersStats } from './space-invaders/SpaceInvadersStats';
import { SpaceInvadersRecentGames } from './space-invaders/SpaceInvadersRecentGames';

export const SpaceInvadersSection = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🛸</span>
        <h1 className="text-3xl font-bold text-white">Space Invaders</h1>
      </div>
      
      <p className="text-gray-400">
        Defend Earth from waves of alien invaders! Use arrow keys to move and space to shoot.
        Destroy all aliens to advance to the next wave and earn credits based on your performance.
      </p>

      {/* Game Stats */}
      <SpaceInvadersStats />

      {/* Game Area */}
      <SpaceInvadersGameArea />

      {/* Recent Games */}
      <SpaceInvadersRecentGames />
    </div>
  );
};
