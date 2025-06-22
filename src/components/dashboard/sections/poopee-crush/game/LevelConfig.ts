
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
  if (requiredScore >= 15000) difficultyScore += 20;
  else if (requiredScore >= 10000) difficultyScore += 15;
  else if (requiredScore >= 8000) difficultyScore += 8;
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
  // HEAVILY REBALANCED LEVEL CONFIGURATIONS: Much higher requirements for longer gameplay
  const baseConfig: LevelConfig = {
    level: level,
    moves: 25,
    requiredScore: 8000 + (level * 2000), // Much higher base requirement
    objectives: [
      {
        type: 'score',
        target: 8000 + (level * 2000),
        description: `Reach ${8000 + (level * 2000)} points`
      }
    ],
    availableTileTypes: Math.min(4 + Math.floor(level / 3), 6),
    specialTileSpawnRate: 0.05 + (level * 0.01),
    difficulty: 'easy' // Will be calculated below
  };

  // Level-specific configurations - MUCH MORE CHALLENGING
  let config: LevelConfig;
  
  switch (level) {
    case 1:
      config = {
        ...baseConfig,
        moves: 30, // More moves for tutorial level
        requiredScore: 8000, // Significantly higher starting requirement
        objectives: [
          {
            type: 'score',
            target: 8000,
            description: 'Reach 8000 points'
          },
          {
            type: 'clear_tiles',
            target: 100, // More tiles to clear
            description: 'Clear 100 tiles'
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
        requiredScore: 12000,
        objectives: [
          {
            type: 'score',
            target: 12000,
            description: 'Reach 12000 points'
          },
          {
            type: 'special_tiles',
            target: 5, // More special tiles required
            description: 'Create 5 special tiles'
          },
          {
            type: 'clear_tiles',
            target: 120,
            description: 'Clear 120 tiles'
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
        requiredScore: 15000,
        objectives: [
          {
            type: 'score',
            target: 15000,
            description: 'Reach 15000 points'
          },
          {
            type: 'cascades',
            target: 8, // More cascades required
            description: 'Create 8 cascade combinations'
          },
          {
            type: 'clear_tiles',
            target: 150,
            description: 'Clear 150 tiles'
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
        moves: 22,
        requiredScore: 18000,
        objectives: [
          {
            type: 'score',
            target: 18000,
            description: 'Reach 18000 points'
          },
          {
            type: 'clear_tiles',
            target: 180,
            description: 'Clear 180 tiles'
          },
          {
            type: 'special_tiles',
            target: 8,
            description: 'Create 8 special tiles'
          },
          {
            type: 'cascades',
            target: 5,
            description: 'Create 5 cascades'
          }
        ],
        availableTileTypes: 5,
        specialTileSpawnRate: 0.06
      };
      break;

    case 5:
      config = {
        ...baseConfig,
        moves: 20,
        requiredScore: 22000,
        objectives: [
          {
            type: 'score',
            target: 22000,
            description: 'Reach 22000 points'
          },
          {
            type: 'cascades',
            target: 12,
            description: 'Create 12 cascade combinations'
          },
          {
            type: 'special_tiles',
            target: 10,
            description: 'Create 10 special tiles'
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
      // Progressive difficulty for higher levels - MUCH MORE CHALLENGING
      const progressiveLevel = Math.min(level, 50);
      config = {
        ...baseConfig,
        moves: Math.max(15, 30 - Math.floor(progressiveLevel / 2)), // Gradually reduce moves
        requiredScore: 8000 + (progressiveLevel * 3000), // Much higher scaling
        objectives: [
          {
            type: 'score',
            target: 8000 + (progressiveLevel * 3000),
            description: `Reach ${8000 + (progressiveLevel * 3000)} points`
          },
          {
            type: 'clear_tiles',
            target: 100 + (progressiveLevel * 20), // More tiles to clear
            description: `Clear ${100 + (progressiveLevel * 20)} tiles`
          },
          {
            type: 'special_tiles',
            target: 3 + Math.floor(progressiveLevel / 3),
            description: `Create ${3 + Math.floor(progressiveLevel / 3)} special tiles`
          },
          {
            type: 'cascades',
            target: 2 + Math.floor(progressiveLevel / 4),
            description: `Create ${2 + Math.floor(progressiveLevel / 4)} cascades`
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
