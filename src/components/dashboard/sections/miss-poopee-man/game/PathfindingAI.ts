
import { Position, Direction, GAME_CONFIG } from './GameTypes';
import { MAZE_LAYOUT } from './MazeData';

export class PathfindingAI {
  private static getDirectionVector(direction: Direction): Position {
    switch (direction) {
      case Direction.UP: return { x: 0, y: -1 };
      case Direction.DOWN: return { x: 0, y: 1 };
      case Direction.LEFT: return { x: -1, y: 0 };
      case Direction.RIGHT: return { x: 1, y: 0 };
      default: return { x: 0, y: 0 };
    }
  }

  private static isValidPosition(x: number, y: number, allowGhostHouse = false): boolean {
    if (x < 0 || x >= GAME_CONFIG.MAZE_WIDTH || y < 0 || y >= GAME_CONFIG.MAZE_HEIGHT) {
      return true; // Allow tunnel wrapping
    }
    
    const cell = MAZE_LAYOUT[y][x];
    return cell !== 1 && (allowGhostHouse || cell !== 4); // Not wall, optionally allow ghost house
  }

  private static getDistance(pos1: Position, pos2: Position): number {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    return dx + dy; // Manhattan distance
  }

  private static getOppositeDirection(direction: Direction): Direction {
    switch (direction) {
      case Direction.UP: return Direction.DOWN;
      case Direction.DOWN: return Direction.UP;
      case Direction.LEFT: return Direction.RIGHT;
      case Direction.RIGHT: return Direction.LEFT;
      default: return Direction.NONE;
    }
  }

  public static getValidDirections(
    position: Position, 
    currentDirection: Direction,
    allowGhostHouse = false,
    preventReverse = true
  ): Direction[] {
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    const oppositeDirection = this.getOppositeDirection(currentDirection);
    
    return directions.filter(dir => {
      if (preventReverse && dir === oppositeDirection) return false;
      
      const vector = this.getDirectionVector(dir);
      const newX = position.x + vector.x;
      const newY = position.y + vector.y;
      
      return this.isValidPosition(newX, newY, allowGhostHouse);
    });
  }

  public static getBestDirection(
    position: Position, 
    target: Position, 
    currentDirection: Direction,
    allowGhostHouse = false,
    flee = false
  ): Direction {
    const validDirections = this.getValidDirections(position, currentDirection, allowGhostHouse);
    
    if (validDirections.length === 0) {
      return currentDirection;
    }

    // If only one option, take it
    if (validDirections.length === 1) {
      return validDirections[0];
    }

    // Calculate best direction based on distance to target
    let bestDirection = validDirections[0];
    let bestDistance = flee ? -Infinity : Infinity;

    for (const direction of validDirections) {
      const vector = this.getDirectionVector(direction);
      const newPos = {
        x: position.x + vector.x,
        y: position.y + vector.y
      };

      // Handle tunnel wrapping
      if (newPos.x < 0) newPos.x = GAME_CONFIG.MAZE_WIDTH - 1;
      if (newPos.x >= GAME_CONFIG.MAZE_WIDTH) newPos.x = 0;

      const distance = this.getDistance(newPos, target);

      if (flee) {
        // When fleeing, choose direction that maximizes distance
        if (distance > bestDistance) {
          bestDistance = distance;
          bestDirection = direction;
        }
      } else {
        // When chasing, choose direction that minimizes distance
        if (distance < bestDistance) {
          bestDistance = distance;
          bestDirection = direction;
        }
      }
    }

    return bestDirection;
  }

  public static getRandomDirection(position: Position, currentDirection: Direction): Direction {
    const validDirections = this.getValidDirections(position, currentDirection);
    
    if (validDirections.length === 0) {
      return currentDirection;
    }

    return validDirections[Math.floor(Math.random() * validDirections.length)];
  }
}
