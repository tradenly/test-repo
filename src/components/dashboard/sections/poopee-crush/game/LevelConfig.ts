
import { DifficultyLevel } from './DifficultySelector';

export interface LevelObjective {
  type: 'score' | 'tiles' | 'moves' | 'cascades' | 'special';
  target: number;
  description: string;
}

export interface LevelConfig {
  level: number;
  moves: number;
  requiredScore: number;
  objectives: LevelObjective[];
  specialTileTypes?: string[];
  powerUps?: string[];
  difficulty: DifficultyLevel;
}

export const getLevelConfig = (level: number, difficulty: DifficultyLevel): LevelConfig => {
  console.log(`📋 [Level Config] Generating config for level ${level} (${difficulty})`);
  
  // Base values that scale with level
  const baseScore = 250;
  const baseMoves = 30;
  
  // Difficulty multipliers
  const difficultyMultipliers = {
    easy: { score: 0.8, moves: 1.2 },
    medium: { score: 1.0, moves: 1.0 },
    hard: { score: 1.3, moves: 0.8 }
  };
  
  const multiplier = difficultyMultipliers[difficulty];
  
  // Scale values based on level (progressive difficulty)
  const levelMultiplier = 1 + (level - 1) * 0.15; // 15% increase per level
  
  const requiredScore = Math.floor(baseScore * levelMultiplier * multiplier.score);
  const moves = Math.floor(baseMoves * multiplier.moves);
  
  // Generate objectives based on level
  const objectives: LevelObjective[] = [];
  
  // Always have a score objective
  objectives.push({
    type: 'score',
    target: requiredScore,
    description: `Reach ${requiredScore.toLocaleString()} points`
  });
  
  // Add more objectives for higher levels
  if (level >= 2) {
    const tilesTarget = Math.floor(50 + level * 10);
    objectives.push({
      type: 'tiles',
      target: tilesTarget,
      description: `Clear ${tilesTarget} tiles`
    });
  }
  
  if (level >= 3) {
    const cascadesTarget = Math.floor(3 + level * 0.5);
    objectives.push({
      type: 'cascades',
      target: cascadesTarget,
      description: `Create ${cascadesTarget} cascades`
    });
  }
  
  if (level >= 5) {
    const specialTarget = Math.floor(5 + level * 2);
    objectives.push({
      type: 'special',
      target: specialTarget,
      description: `Clear ${specialTarget} special tiles`
    });
  }
  
  const config: LevelConfig = {
    level,
    moves,
    requiredScore,
    objectives,
    specialTileTypes: level >= 3 ? ['RAINBOW', 'BOMB'] : undefined,
    powerUps: level >= 4 ? ['SHUFFLE', 'HINT'] : undefined,
    difficulty
  };
  
  console.log(`📋 [Level Config] Generated config for level ${level}:`, config);
  
  return config;
};

// Helper function to check if a level exists (always true for infinite levels)
export const isValidLevel = (level: number): boolean => {
  return level >= 1 && level <= 9999; // Support up to level 9999
};

// Get the maximum level (for infinite progression)
export const getMaxLevel = (): number => {
  return 9999;
};
