
export interface LevelObjective {
  type: 'score' | 'clear_tiles' | 'special_tiles' | 'cascades';
  target: number;
  description: string;
}

export interface LevelConfig {
  level: number;
  moves: number;
  objectives: LevelObjective[];
  requiredScore: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  availableTileTypes: number; // Number of different tile types
  specialTileSpawnRate: number; // 0-1, chance of special tiles appearing
  blockedPositions?: {row: number, col: number}[]; // Unmovable tiles
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  // Beginner levels (1-5)
  {
    level: 1,
    moves: 25,
    objectives: [{type: 'score', target: 1000, description: 'Score 1,000 points'}],
    requiredScore: 1000,
    difficulty: 'easy',
    availableTileTypes: 4,
    specialTileSpawnRate: 0.1
  },
  {
    level: 2,
    moves: 22,
    objectives: [{type: 'score', target: 1500, description: 'Score 1,500 points'}],
    requiredScore: 1500,
    difficulty: 'easy',
    availableTileTypes: 4,
    specialTileSpawnRate: 0.1
  },
  {
    level: 3,
    moves: 20,
    objectives: [
      {type: 'score', target: 2000, description: 'Score 2,000 points'},
      {type: 'clear_tiles', target: 50, description: 'Clear 50 tiles'}
    ],
    requiredScore: 2000,
    difficulty: 'easy',
    availableTileTypes: 5,
    specialTileSpawnRate: 0.15
  },
  {
    level: 4,
    moves: 18,
    objectives: [{type: 'score', target: 2500, description: 'Score 2,500 points'}],
    requiredScore: 2500,
    difficulty: 'medium',
    availableTileTypes: 5,
    specialTileSpawnRate: 0.15
  },
  {
    level: 5,
    moves: 18,
    objectives: [
      {type: 'score', target: 3000, description: 'Score 3,000 points'},
      {type: 'special_tiles', target: 3, description: 'Create 3 special tiles'}
    ],
    requiredScore: 3000,
    difficulty: 'medium',
    availableTileTypes: 6,
    specialTileSpawnRate: 0.2
  },
  // Progressive levels continue...
  {
    level: 6,
    moves: 16,
    objectives: [{type: 'score', target: 4000, description: 'Score 4,000 points'}],
    requiredScore: 4000,
    difficulty: 'medium',
    availableTileTypes: 6,
    specialTileSpawnRate: 0.2,
    blockedPositions: [{row: 3, col: 3}, {row: 4, col: 4}]
  },
  {
    level: 7,
    moves: 15,
    objectives: [
      {type: 'score', target: 5000, description: 'Score 5,000 points'},
      {type: 'cascades', target: 5, description: 'Create 5 cascades'}
    ],
    requiredScore: 5000,
    difficulty: 'hard',
    availableTileTypes: 6,
    specialTileSpawnRate: 0.25
  },
  {
    level: 8,
    moves: 14,
    objectives: [{type: 'score', target: 6000, description: 'Score 6,000 points'}],
    requiredScore: 6000,
    difficulty: 'hard',
    availableTileTypes: 6,
    specialTileSpawnRate: 0.25,
    blockedPositions: [{row: 2, col: 2}, {row: 2, col: 5}, {row: 5, col: 2}, {row: 5, col: 5}]
  }
];

export const generateDynamicLevel = (levelNumber: number): LevelConfig => {
  const baseLevel = LEVEL_CONFIGS[Math.min(levelNumber - 1, LEVEL_CONFIGS.length - 1)];
  const extraLevels = Math.max(0, levelNumber - LEVEL_CONFIGS.length);
  
  return {
    level: levelNumber,
    moves: Math.max(10, baseLevel.moves - Math.floor(extraLevels / 3)),
    objectives: [
      {
        type: 'score',
        target: baseLevel.requiredScore + (extraLevels * 1000),
        description: `Score ${(baseLevel.requiredScore + (extraLevels * 1000)).toLocaleString()} points`
      }
    ],
    requiredScore: baseLevel.requiredScore + (extraLevels * 1000),
    difficulty: extraLevels > 10 ? 'expert' : baseLevel.difficulty,
    availableTileTypes: Math.min(6, baseLevel.availableTileTypes),
    specialTileSpawnRate: Math.min(0.3, baseLevel.specialTileSpawnRate + (extraLevels * 0.01))
  };
};

export const getLevelConfig = (level: number): LevelConfig => {
  if (level <= LEVEL_CONFIGS.length) {
    return LEVEL_CONFIGS[level - 1];
  }
  return generateDynamicLevel(level);
};
