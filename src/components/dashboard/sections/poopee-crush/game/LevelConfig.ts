
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
  // BALANCED LEVEL CONFIGURATIONS: Increased score requirements to prevent instant wins
  const baseConfig: LevelConfig = {
    level: level,
    moves: 20,
    requiredScore: 2000 + (level * 500), // Increased base requirement
    objectives: [
      {
        type: 'score',
        target: 2000 + (level * 500), // Increased score targets
        description: `Reach ${2000 + (level * 500)} points`
      }
    ],
    availableTileTypes: Math.min(4 + Math.floor(level / 3), 6),
    specialTileSpawnRate: 0.05 + (level * 0.01),
    difficulty: 'easy' // Will be calculated below
  };

  // Level-specific configurations
  let config: LevelConfig;
  
  switch (level) {
    case 1:
      config = {
        ...baseConfig,
        moves: 25,
        requiredScore: 3000, // Significantly increased from potential instant win scores
        objectives: [
          {
            type: 'score',
            target: 3000,
            description: 'Reach 3000 points'
          },
          {
            type: 'clear_tiles',
            target: 50,
            description: 'Clear 50 tiles'
          }
        ],
        availableTileTypes: 4,
        specialTileSpawnRate: 0.03,
        difficulty: 'easy' // Will be calculated
      };
      break;

    case 2:
      config = {
        ...baseConfig,
        moves: 22,
        requiredScore: 4000,
        objectives: [
          {
            type: 'score',
            target: 4000,
            description: 'Reach 4000 points'
          },
          {
            type: 'special_tiles',
            target: 2,
            description: 'Create 2 special tiles'
          }
        ],
        availableTileTypes: 4,
        specialTileSpawnRate: 0.04,
        difficulty: 'easy' // Will be calculated
      };
      break;

    case 3:
      config = {
        ...baseConfig,
        moves: 20,
        requiredScore: 5000,
        objectives: [
          {
            type: 'score',
            target: 5000,
            description: 'Reach 5000 points'
          },
          {
            type: 'cascades',
            target: 3,
            description: 'Create 3 cascade combinations'
          }
        ],
        availableTileTypes: 5,
        specialTileSpawnRate: 0.05,
        blockedPositions: [
          {row: 3, col: 3},
          {row: 3, col: 4},
          {row: 4, col: 3},
          {row: 4, col: 4}
        ],
        difficulty: 'easy' // Will be calculated
      };
      break;

    case 4:
      config = {
        ...baseConfig,
        moves: 18,
        requiredScore: 6500,
        objectives: [
          {
            type: 'score',
            target: 6500,
            description: 'Reach 6500 points'
          },
          {
            type: 'clear_tiles',
            target: 80,
            description: 'Clear 80 tiles'
          },
          {
            type: 'special_tiles',
            target: 3,
            description: 'Create 3 special tiles'
          }
        ],
        availableTileTypes: 5,
        specialTileSpawnRate: 0.06,
        difficulty: 'easy' // Will be calculated
      };
      break;

    case 5:
      config = {
        ...baseConfig,
        moves: 16,
        requiredScore: 8000,
        objectives: [
          {
            type: 'score',
            target: 8000,
            description: 'Reach 8000 points'
          },
          {
            type: 'cascades',
            target: 5,
            description: 'Create 5 cascade combinations'
          }
        ],
        availableTileTypes: 6,
        specialTileSpawnRate: 0.07,
        blockedPositions: [
          {row: 1, col: 1}, {row: 1, col: 6},
          {row: 6, col: 1}, {row: 6, col: 6},
          {row: 3, col: 3}, {row: 3, col: 4},
          {row: 4, col: 3}, {row: 4, col: 4}
        ],
        difficulty: 'easy' // Will be calculated
      };
      break;

    default:
      // Progressive difficulty for higher levels
      const progressiveLevel = Math.min(level, 50);
      config = {
        ...baseConfig,
        moves: Math.max(12, 25 - Math.floor(progressiveLevel / 3)),
        requiredScore: 3000 + (progressiveLevel * 750), // Continued scaling
        objectives: [
          {
            type: 'score',
            target: 3000 + (progressiveLevel * 750),
            description: `Reach ${3000 + (progressiveLevel * 750)} points`
          },
          {
            type: 'clear_tiles',
            target: 40 + (progressiveLevel * 10),
            description: `Clear ${40 + (progressiveLevel * 10)} tiles`
          },
          {
            type: 'special_tiles',
            target: 1 + Math.floor(progressiveLevel / 5),
            description: `Create ${1 + Math.floor(progressiveLevel / 5)} special tiles`
          }
        ],
        availableTileTypes: Math.min(4 + Math.floor(progressiveLevel / 3), 6),
        specialTileSpawnRate: Math.min(0.05 + (progressiveLevel * 0.01), 0.15),
        difficulty: 'easy' // Will be calculated
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
