
export enum BoosterType {
  HAMMER = "hammer",
  SHUFFLE = "shuffle",
  EXTRA_MOVES = "extra_moves",
  COLOR_BOMB_START = "color_bomb_start",
  HINT = "hint"
}

export interface Booster {
  type: BoosterType;
  name: string;
  description: string;
  cost: number; // in credits
  icon: string;
  usageLimit?: number; // per level, undefined = unlimited
}

export const AVAILABLE_BOOSTERS: Record<BoosterType, Booster> = {
  [BoosterType.HAMMER]: {
    type: BoosterType.HAMMER,
    name: "Hammer",
    description: "Remove any single tile",
    cost: 0.5,
    icon: "🔨",
    usageLimit: 3
  },
  [BoosterType.SHUFFLE]: {
    type: BoosterType.SHUFFLE,
    name: "Shuffle",
    description: "Shuffle the board when stuck",
    cost: 1,
    icon: "🔀",
    usageLimit: 1
  },
  [BoosterType.EXTRA_MOVES]: {
    type: BoosterType.EXTRA_MOVES,
    name: "+5 Moves",
    description: "Add 5 extra moves",
    cost: 2,
    icon: "⏰",
    usageLimit: 2
  },
  [BoosterType.COLOR_BOMB_START]: {
    type: BoosterType.COLOR_BOMB_START,
    name: "Color Bomb Start",
    description: "Start with a color bomb on the board",
    cost: 3,
    icon: "💣"
  },
  [BoosterType.HINT]: {
    type: BoosterType.HINT,
    name: "Hint",
    description: "Show possible moves",
    cost: 0.25,
    icon: "💡"
  }
};

export interface BoosterUsage {
  type: BoosterType;
  usedCount: number;
  available: number;
}

export class BoosterManager {
  private usageTracking: Map<BoosterType, number> = new Map();

  resetForNewLevel(): void {
    this.usageTracking.clear();
  }

  canUseBooster(type: BoosterType): boolean {
    const booster = AVAILABLE_BOOSTERS[type];
    if (!booster.usageLimit) return true;
    
    const used = this.usageTracking.get(type) || 0;
    return used < booster.usageLimit;
  }

  useBooster(type: BoosterType): boolean {
    if (!this.canUseBooster(type)) return false;
    
    const used = this.usageTracking.get(type) || 0;
    this.usageTracking.set(type, used + 1);
    return true;
  }

  getUsageCount(type: BoosterType): number {
    return this.usageTracking.get(type) || 0;
  }

  getRemainingUses(type: BoosterType): number {
    const booster = AVAILABLE_BOOSTERS[type];
    if (!booster.usageLimit) return Infinity;
    
    const used = this.getUsageCount(type);
    return Math.max(0, booster.usageLimit - used);
  }
}
