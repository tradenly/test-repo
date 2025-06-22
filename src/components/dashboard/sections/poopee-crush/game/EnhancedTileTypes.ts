
export enum TileType {
  EMPTY = "empty",
  POOP = "poop",
  TOILET = "toilet",
  TOILET_PAPER = "toilet_paper",
  FART = "fart",
  BANANA = "banana",
  BELL = "bell",
  // Special tiles
  STRIPED_HORIZONTAL = "striped_horizontal",
  STRIPED_VERTICAL = "striped_vertical",
  WRAPPED = "wrapped",
  COLOR_BOMB = "color_bomb",
  // Blocked tile
  BLOCKED = "blocked"
}

export const BASIC_TILE_TYPES = [
  TileType.POOP,
  TileType.TOILET,
  TileType.TOILET_PAPER,
  TileType.FART,
  TileType.BANANA,
  TileType.BELL
];

export const SPECIAL_TILE_TYPES = [
  TileType.STRIPED_HORIZONTAL,
  TileType.STRIPED_VERTICAL,
  TileType.WRAPPED,
  TileType.COLOR_BOMB
];

export const isSpecialTile = (tile: TileType): boolean => {
  return SPECIAL_TILE_TYPES.includes(tile);
};

export const isBasicTile = (tile: TileType): boolean => {
  return BASIC_TILE_TYPES.includes(tile);
};

export const getBasicTileFromSpecial = (specialTile: TileType): TileType => {
  // Return a random basic tile type for special tile creation
  return BASIC_TILE_TYPES[Math.floor(Math.random() * BASIC_TILE_TYPES.length)];
};

export interface MatchResult {
  tiles: {row: number, col: number}[];
  type: 'horizontal' | 'vertical' | 'l_shape' | 't_shape';
  length: number;
  specialTileCreated?: {
    position: {row: number, col: number};
    type: TileType;
  };
}

export interface PowerUpEffect {
  type: 'stripe_horizontal' | 'stripe_vertical' | 'wrapped_explosion' | 'color_bomb';
  tiles: {row: number, col: number}[];
  centerTile?: {row: number, col: number};
}
