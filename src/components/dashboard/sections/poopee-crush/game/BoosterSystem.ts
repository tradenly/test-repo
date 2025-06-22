
export enum BoosterType {
  HAMMER = "HAMMER",
  SHUFFLE = "SHUFFLE", 
  EXTRA_MOVES = "EXTRA_MOVES",
  HINT = "HINT"
}

export interface BoosterCounts {
  [BoosterType.HAMMER]: number;
  [BoosterType.SHUFFLE]: number;
  [BoosterType.EXTRA_MOVES]: number;
  [BoosterType.HINT]: number;
}

export interface BoosterLimits {
  [BoosterType.HAMMER]: number;
  [BoosterType.SHUFFLE]: number;
  [BoosterType.EXTRA_MOVES]: number;
  [BoosterType.HINT]: number;
}

export class BoosterManager {
  private usageCounts: BoosterCounts;
  private limits: BoosterLimits;

  constructor() {
    this.usageCounts = {
      [BoosterType.HAMMER]: 0,
      [BoosterType.SHUFFLE]: 0,
      [BoosterType.EXTRA_MOVES]: 0,
      [BoosterType.HINT]: 0
    };

    this.limits = {
      [BoosterType.HAMMER]: 3,
      [BoosterType.SHUFFLE]: 2,
      [BoosterType.EXTRA_MOVES]: 1,
      [BoosterType.HINT]: 5
    };
  }

  public canUseBooster(type: BoosterType): boolean {
    return this.usageCounts[type] < this.limits[type];
  }

  public useBooster(type: BoosterType): boolean {
    if (this.canUseBooster(type)) {
      this.usageCounts[type]++;
      return true;
    }
    return false;
  }

  public getUsageCount(type: BoosterType): number {
    return this.usageCounts[type];
  }

  public getLimit(type: BoosterType): number {
    return this.limits[type];
  }

  public getRemainingUses(type: BoosterType): number {
    return this.limits[type] - this.usageCounts[type];
  }

  public resetForNewLevel(): void {
    this.usageCounts = {
      [BoosterType.HAMMER]: 0,
      [BoosterType.SHUFFLE]: 0,
      [BoosterType.EXTRA_MOVES]: 0,
      [BoosterType.HINT]: 0
    };
  }

  public getAllUsageCounts(): BoosterCounts {
    return { ...this.usageCounts };
  }

  public getAllLimits(): BoosterLimits {
    return { ...this.limits };
  }
}
