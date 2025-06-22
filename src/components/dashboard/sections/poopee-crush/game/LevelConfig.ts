
export interface LevelObjective {
  type: 'score' | 'clear_tiles' | 'special_tiles' | 'cascades';
  target: number;
  description: string;
}

export interface LevelConfig {
  level: number;
  moves: number;
  requiredScore: number;
  objectives: LevelObjective[];
  availableTileTypes: number; // How many different basic tile types to use
  specialTileSpawnRate: number; // 0.0 to 1.0
  blockedPositions?: {row: number, col: number}[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

const calculateDifficulty = (level: number, moves: number, requiredScore: number, objectives: LevelObjective[], blockedPositions?: {row: number, col: number}[]): 'easy' | 'medium' | 'hard' | 'expert' => {
  let difficultyScore = 0;
  
  // Factor 1: Level number (0-30 points)
  difficultyScore += Math.min(level * 1.2, 30);
  
  // Factor 2: Moves (fewer moves = harder) (0-25 points)
  if (moves >= 25) difficultyScore += 0;
  else if (moves >= 20) difficultyScore += 8;
  else if (moves >= 15) difficultyScore += 15;
  else difficultyScore += 25;
  
  // Factor 3: Score requirement (0-20 points)
  if (requiredScore >= 8000) difficultyScore += 20;
  else if (requiredScore >= 5000) difficultyScore += 15;
  else if (requiredScore >= 3000) difficultyScore += 8;
  else difficultyScore += 0;
  
  // Factor 4: Number of objectives (0-15 points)
  difficultyScore += Math.min((objectives.length - 1) * 5, 15);
  
  // Factor 5: Blocked positions (0-10 points)
  if (blockedPositions && blockedPositions.length > 0) {
    difficultyScore += Math.min(blockedPositions.length * 2, 10);
  }
  
  // Determine difficulty based on total score
  if (difficultyScore >= 70) return 'expert';
  if (difficultyScore >= 45) return 'hard';
  if (difficultyScore >= 20) return 'medium';
  return 'easy';
};

export const getLevelConfig = (level: number): LevelConfig => {
  // DRAMATICALLY REBALANCED: Much lower requirements for achievable gameplay lasting 15-25+ moves
  const baseConfig: LevelConfig = {
    level: level,
    moves: 30, // More moves for all levels
    requiredScore: 1500 + (level * 500), // Much lower and more achievable
    objectives: [
      {
        type: 'score',
        target: 1500 + (level * 500),
        description: `Reach ${1500 + (level * 500)} points`
      }
    ],
    availableTileTypes: Math.min(4 + Math.floor(level / 3), 6),
    specialTileSpawnRate: 0.05 + (level * 0.01),
    difficulty: 'easy' // Will be calculated below
  };

  // Level-specific configurations - MUCH MORE ACHIEVABLE
  let config: LevelConfig;
  
  switch (level) {
    case 1:
      config = {
        ...baseConfig,
        moves: 30, // Generous moves for tutorial
        requiredScore: 1500, // Very achievable starting requirement
        objectives: [
          {
            type: 'score',
            target: 1500,
            description: 'Reach 1500 points'
          },
          {
            type: 'clear_tiles',
            target: 30, // Much more reasonable
            description: 'Clear 30 tiles'
          }
        ],
        availableTileTypes: 4,
        specialTileSpawnRate: 0.03
      };
      break;

    case 2:
      config = {
        ...baseConfig,
        moves: 28,
        requiredScore: 2500,
        objectives: [
          {
            type: 'score',
            target: 2500,
            description: 'Reach 2500 points'
          },
          {
            type: 'special_tiles',
            target: 2, // Much more achievable
            description: 'Create 2 special tiles'
          },
          {
            type: 'clear_tiles',
            target: 40,
            description: 'Clear 40 tiles'
          }
        ],
        availableTileTypes: 4,
        specialTileSpawnRate: 0.04
      };
      break;

    case 3:
      config = {
        ...baseConfig,
        moves: 25,
        requiredScore: 3500,
        objectives: [
          {
            type: 'score',
            target: 3500,
            description: 'Reach 3500 points'
          },
          {
            type: 'cascades',
            target: 3, // Much more achievable
            description: 'Create 3 cascade combinations'
          },
          {
            type: 'clear_tiles',
            target: 50,
            description: 'Clear 50 tiles'
          }
        ],
        availableTileTypes: 5,
        specialTileSpawnRate: 0.05,
        blockedPositions: [
          {row: 3, col: 3},
          {row: 3, col: 4},
          {row: 4, col: 3},
          {row: 4, col: 4}
        ]
      };
      break;

    case 4:
      config = {
        ...baseConfig,
        moves: 25,
        requiredScore: 4500,
        objectives: [
          {
            type: 'score',
            target: 4500,
            description: 'Reach 4500 points'
          },
          {
            type: 'clear_tiles',
            target: 60,
            description: 'Clear 60 tiles'
          },
          {
            type: 'special_tiles',
            target: 3,
            description: 'Create 3 special tiles'
          },
          {
            type: 'cascades',
            target: 2,
            description: 'Create 2 cascades'
          }
        ],
        availableTileTypes: 5,
        specialTileSpawnRate: 0.06
      };
      break;

    case 5:
      config = {
        ...baseConfig,
        moves: 25,
        requiredScore: 6000,
        objectives: [
          {
            type: 'score',
            target: 6000,
            description: 'Reach 6000 points'
          },
          {
            type: 'cascades',
            target: 4,
            description: 'Create 4 cascade combinations'
          },
          {
            type: 'special_tiles',
            target: 4,
            description: 'Create 4 special tiles'
          }
        ],
        availableTileTypes: 6,
        specialTileSpawnRate: 0.07,
        blockedPositions: [
          {row: 1, col: 1}, {row: 1, col: 6},
          {row: 6, col: 1}, {row: 6, col: 6},
          {row: 3, col: 3}, {row: 3, col: 4},
          {row: 4, col: 3}, {row: 4, col: 4}
        ]
      };
      break;

    default:
      // Progressive difficulty for higher levels - MUCH MORE ACHIEVABLE
      const progressiveLevel = Math.min(level, 50);
      config = {
        ...baseConfig,
        moves: Math.max(20, 30 - Math.floor(progressiveLevel / 5)), // Slower reduction
        requiredScore: 1500 + (progressiveLevel * 750), // Much more achievable scaling
        objectives: [
          {
            type: 'score',
            target: 1500 + (progressiveLevel * 750),
            description: `Reach ${1500 + (progressiveLevel * 750)} points`
          },
          {
            type: 'clear_tiles',
            target: 30 + (progressiveLevel * 8), // More reasonable progression
            description: `Clear ${30 + (progressiveLevel * 8)} tiles`
          },
          {
            type: 'special_tiles',
            target: 2 + Math.floor(progressiveLevel / 4),
            description: `Create ${2 + Math.floor(progressiveLevel / 4)} special tiles`
          },
          {
            type: 'cascades',
            target: 1 + Math.floor(progressiveLevel / 5),
            description: `Create ${1 + Math.floor(progressiveLevel / 5)} cascades`
          }
        ],
        availableTileTypes: Math.min(4 + Math.floor(progressiveLevel / 3), 6),
        specialTileSpawnRate: Math.min(0.05 + (progressiveLevel * 0.01), 0.15)
      };
  }

  // Calculate the actual difficulty based on level parameters
  config.difficulty = calculateDifficulty(
    config.level,
    config.moves,
    config.requiredScore,
    config.objectives,
    config.blockedPositions
  );

  return config;
};
