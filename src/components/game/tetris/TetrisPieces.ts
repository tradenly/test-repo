
export type TetrisPieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface TetrisPiece {
  type: TetrisPieceType;
  shape: number[][];
  color: string;
  x: number;
  y: number;
  rotation: number;
}

// Define all Tetris piece shapes (4 rotations each)
export const TETRIS_PIECES: Record<TetrisPieceType, { shape: number[][][], color: string }> = {
  I: {
    color: '#00f0f0',
    shape: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ]
  },
  O: {
    color: '#f0f000',
    shape: [
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]]
    ]
  },
  T: {
    color: '#a000f0',
    shape: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]]
    ]
  },
  S: {
    color: '#00f000',
    shape: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]]
    ]
  },
  Z: {
    color: '#f00000',
    shape: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]]
    ]
  },
  J: {
    color: '#0000f0',
    shape: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]]
    ]
  },
  L: {
    color: '#f0a000',
    shape: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]]
    ]
  }
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const CELL_SIZE = 30;

export function createEmptyBoard(): number[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
}

export function getRandomPieceType(): TetrisPieceType {
  const types: TetrisPieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

export function createPiece(type: TetrisPieceType): TetrisPiece {
  return {
    type,
    shape: TETRIS_PIECES[type].shape[0],
    color: TETRIS_PIECES[type].color,
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
    rotation: 0
  };
}

export function rotatePiece(piece: TetrisPiece): TetrisPiece {
  const newRotation = (piece.rotation + 1) % 4;
  return {
    ...piece,
    shape: TETRIS_PIECES[piece.type].shape[newRotation],
    rotation: newRotation
  };
}
