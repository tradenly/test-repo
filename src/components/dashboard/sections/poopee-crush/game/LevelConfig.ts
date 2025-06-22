
import { DifficultyLevel } from "./DifficultySelector";

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
  availableTileTypes: number;
  specialTileSpawnRate: number;
  blockedPositions?: {row: number, col: number}[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

const calculateDifficulty = (level: number, moves: number, requiredScore: number, objectives: LevelObjective[], blockedPositions?: {row: number, col: number}[]): 'easy' | 'medium' | 'hard' | 'expert' => {
  let difficultyScore = 0;
  
  difficultyScore += Math.min(level * 1.2, 30);
  
  if (moves >= 25) difficultyScore += 0;
  else if (moves >= 20) difficultyScore += 8;
  else if (moves >= 15) difficultyScore += 15;
  else difficultyScore += 25;
  
  if (requiredScore >= 800) difficultyScore += 20;
  else if (requiredScore >= 600) difficultyScore += 15;
  else if (requiredScore >= 400) difficultyScore += 8;
  else difficultyScore += 0;
  
  difficultyScore += Math.min((objectives.length - 1) * 5, 15);
  
  if (blockedPositions && blockedPositions.length > 0) {
    difficultyScore += Math.min(blockedPositions.length * 2, 10);
  }
  
  if (difficultyScore >= 70) return 'expert';
  if (difficultyScore >= 45) return 'hard';
  if (difficultyScore >= 20) return 'medium';
  return 'easy';
};

const applyDifficultyMultiplier = (baseScore: number, baseMoves: number, difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 'easy':
      return { score: baseScore, moves: baseMoves };
    case 'medium':
      return { score: Math.floor(baseScore * 1.5), moves: Math.max(baseMoves - 2, 20) };
    case 'advanced':
      return { score: baseScore * 2, moves: Math.max(baseMoves - 4, 18) };
    default:
      return { score: baseScore, moves: baseMoves };
  }
};

export const getLevelConfig = (level: number, difficulty: DifficultyLevel = 'easy'): LevelConfig => {
  let baseConfig: LevelConfig;
  
  switch (level) {
    case 1:
      baseConfig = {
        level: 1,
        moves: 30,
        requiredScore: 250, // FIXED: Much lower score requirement (was 4000)
        objectives: [
          {
            type: 'score',
            target: 250,
            description: 'Reach 250 points'
          },
          {
            type: 'clear_tiles',
            target: 40,
            description: 'Clear 40 tiles'
          }
        ],
        availableTileTypes: 4,
        specialTileSpawnRate: 0.03,
        difficulty: 'easy'
      };
      break;

    case 2:
      baseConfig = {
        level: 2,
        moves: 28,
        requiredScore: 400, // FIXED: Much lower score requirement (was 6000)
        objectives: [
          {
            type: 'score',
            target: 400,
            description: 'Reach 400 points'
          },
          {
            type: 'special_tiles',
            target: 3,
            description: 'Create 3 special tiles'
          },
          {
            type: 'clear_tiles',
            target: 50,
            description: 'Clear 50 tiles'
          }
        ],
        availableTileTypes: 4,
        specialTileSpawnRate: 0.04,
        difficulty: 'easy'
      };
      break;

    case 3:
      baseConfig = {
        level: 3,
        moves: 25,
        requiredScore: 600, // FIXED: Much lower score requirement (was 8500)
        objectives: [
          {
            type: 'score',
            target: 600,
            description: 'Reach 600 points'
          },
          {
            type: 'cascades',
            target: 4,
            description: 'Create 4 cascade combinations'
          },
          {
            type: 'clear_tiles',
            target: 60,
            description: 'Clear 60 tiles'
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
        difficulty: 'medium'
      };
      break;

    case 4:
      baseConfig = {
        level: 4,
        moves: 25,
        requiredScore: 800, // FIXED: Much lower score requirement (was 11000)
        objectives: [
          {
            type: 'score',
            target: 800,
            description: 'Reach 800 points'
          },
          {
            type: 'clear_tiles',
            target: 75,
            description: 'Clear 75 tiles'
          },
          {
            type: 'special_tiles',
            target: 4,
            description: 'Create 4 special tiles'
          },
          {
            type: 'cascades',
            target: 3,
            description: 'Create 3 cascades'
          }
        ],
        availableTileTypes: 5,
        specialTileSpawnRate: 0.06,
        difficulty: 'medium'
      };
      break;

    case 5:
      baseConfig = {
        level: 5,
        moves: 25,
        requiredScore: 1000, // FIXED: Much lower score requirement (was 15000)
        objectives: [
          {
            type: 'score',
            target: 1000,
            description: 'Reach 1000 points'
          },
          {
            type: 'cascades',
            target: 5,
            description: 'Create 5 cascade combinations'
          },
          {
            type: 'special_tiles',
            target: 5,
            description: 'Create 5 special tiles'
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
        difficulty: 'hard'
      };
      break;

    default:
      const progressiveLevel = Math.min(level, 50);
      baseConfig = {
        level: level,
        moves: Math.max(20, 30 - Math.floor(progressiveLevel / 5)),
        requiredScore: 250 + (progressiveLevel * 100), // FIXED: Much more gradual progression
        objectives: [
          {
            type: 'score',
            target: 250 + (progressiveLevel * 100),
            description: `Reach ${250 + (progressiveLevel * 100)} points`
          },
          {
            type: 'clear_tiles',
            target: 40 + (progressiveLevel * 10),
            description: `Clear ${40 + (progressiveLevel * 10)} tiles`
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
        specialTileSpawnRate: Math.min(0.05 + (progressiveLevel * 0.01), 0.15),
        difficulty: 'medium'
      };
  }

  // Apply difficulty multiplier
  const { score, moves } = applyDifficultyMultiplier(baseConfig.requiredScore, baseConfig.moves, difficulty);
  baseConfig.requiredScore = score;
  baseConfig.moves = moves;

  // Update objectives with new score target
  baseConfig.objectives = baseConfig.objectives.map(obj => 
    obj.type === 'score' ? { ...obj, target: score, description: `Reach ${score} points` } : obj
  );

  // Calculate the actual difficulty based on level parameters
  baseConfig.difficulty = calculateDifficulty(
    baseConfig.level,
    baseConfig.moves,
    baseConfig.requiredScore,
    baseConfig.objectives,
    baseConfig.blockedPositions
  );

  return baseConfig;
};
