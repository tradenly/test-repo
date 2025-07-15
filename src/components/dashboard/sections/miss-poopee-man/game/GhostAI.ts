
import { Ghost, Player, Position, Direction, GhostMode, GAME_CONFIG } from './GameTypes';
import { GHOST_HOUSE, HOME_CORNERS } from './MazeData';
import { PathfindingAI } from './PathfindingAI';

export class GhostAI {
  private static getGhostTarget(ghost: Ghost, player: Player, redGhost?: Ghost): Position {
    const playerPos = player.position;
    
    switch (ghost.id) {
      case 'red':
        // Red ghost directly targets player
        return playerPos;
        
      case 'pink':
        // Pink ghost targets 4 cells ahead of player
        const playerDir = this.getDirectionVector(player.direction);
        return {
          x: Math.max(0, Math.min(GAME_CONFIG.MAZE_WIDTH - 1, playerPos.x + playerDir.x * 4)),
          y: Math.max(0, Math.min(GAME_CONFIG.MAZE_HEIGHT - 1, playerPos.y + playerDir.y * 4))
        };
        
      case 'cyan':
        // Cyan ghost uses complex targeting based on red ghost and player
        if (redGhost) {
          const distance = Math.abs(ghost.position.x - playerPos.x) + Math.abs(ghost.position.y - playerPos.y);
          if (distance > 8) {
            return playerPos;
          } else {
            // Target opposite side of player from red ghost
            const dx = playerPos.x - redGhost.position.x;
            const dy = playerPos.y - redGhost.position.y;
            return {
              x: Math.max(0, Math.min(GAME_CONFIG.MAZE_WIDTH - 1, playerPos.x + dx)),
              y: Math.max(0, Math.min(GAME_CONFIG.MAZE_HEIGHT - 1, playerPos.y + dy))
            };
          }
        }
        return playerPos;
        
      case 'orange':
        // Orange ghost chases when far, retreats when close
        const distanceToPlayer = Math.abs(ghost.position.x - playerPos.x) + Math.abs(ghost.position.y - playerPos.y);
        if (distanceToPlayer > 8) {
          return playerPos;
        } else {
          return ghost.homeCorner;
        }
        
      default:
        return playerPos;
    }
  }

  private static getDirectionVector(direction: Direction): Position {
    switch (direction) {
      case Direction.UP: return { x: 0, y: -1 };
      case Direction.DOWN: return { x: 0, y: 1 };
      case Direction.LEFT: return { x: -1, y: 0 };
      case Direction.RIGHT: return { x: 1, y: 0 };
      default: return { x: 0, y: 0 };
    }
  }

  public static updateGhost(
    ghost: Ghost, 
    player: Player, 
    allGhosts: Ghost[], 
    currentMode: 'scatter' | 'chase',
    powerMode: boolean
  ): Ghost {
    const updatedGhost = { ...ghost };
    
    // Determine ghost mode
    if (powerMode && ghost.mode !== GhostMode.EATEN) {
      updatedGhost.mode = GhostMode.FRIGHTENED;
      updatedGhost.color = '#0000FF'; // Blue when frightened
    } else if (ghost.mode === GhostMode.EATEN) {
      // Ghost is eaten, return to house
      updatedGhost.target = GHOST_HOUSE.center;
      updatedGhost.color = '#888888'; // Gray eyes
    } else if (ghost.isInHouse && ghost.exitDelay <= 0) {
      // Exit house
      updatedGhost.mode = GhostMode.EXITING_HOUSE;
      updatedGhost.target = GHOST_HOUSE.exit;
      updatedGhost.isInHouse = false;
    } else if (!ghost.isInHouse && !powerMode) {
      // Normal chase/scatter behavior
      updatedGhost.mode = currentMode === 'chase' ? GhostMode.CHASE : GhostMode.SCATTER;
      updatedGhost.color = ghost.baseColor;
      
      if (updatedGhost.mode === GhostMode.SCATTER) {
        updatedGhost.target = ghost.homeCorner;
      } else {
        const redGhost = allGhosts.find(g => g.id === 'red');
        updatedGhost.target = this.getGhostTarget(ghost, player, redGhost);
      }
    }

    // Reduce exit delay
    if (updatedGhost.exitDelay > 0) {
      updatedGhost.exitDelay--;
    }

    // Determine next direction
    const allowGhostHouse = ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.EXITING_HOUSE || ghost.isInHouse;
    const flee = ghost.mode === GhostMode.FRIGHTENED;
    
    updatedGhost.nextDirection = PathfindingAI.getBestDirection(
      ghost.position,
      updatedGhost.target,
      ghost.direction,
      allowGhostHouse,
      flee
    );

    // Handle reaching house center when eaten
    if (ghost.mode === GhostMode.EATEN && 
        ghost.position.x === GHOST_HOUSE.center.x && 
        ghost.position.y === GHOST_HOUSE.center.y) {
      updatedGhost.mode = GhostMode.IN_HOUSE;
      updatedGhost.isInHouse = true;
      updatedGhost.exitDelay = 60; // Wait 1 second before exiting
      updatedGhost.color = ghost.baseColor;
    }

    // Handle exiting house
    if (ghost.mode === GhostMode.EXITING_HOUSE && 
        ghost.position.x === GHOST_HOUSE.exit.x && 
        ghost.position.y === GHOST_HOUSE.exit.y) {
      updatedGhost.mode = currentMode === 'chase' ? GhostMode.CHASE : GhostMode.SCATTER;
    }

    return updatedGhost;
  }

  public static initializeGhosts(): Ghost[] {
    return [
      {
        id: 'red',
        position: { x: 16, y: 11 },
        direction: Direction.UP,
        nextDirection: null,
        mode: GhostMode.IN_HOUSE,
        color: '#FF0000',
        baseColor: '#FF0000',
        target: { x: 16, y: 8 },
        modeTimer: 0,
        homeCorner: HOME_CORNERS.red,
        isInHouse: true,
        exitDelay: 0,
        stuckCounter: 0,
        lastPositions: []
      },
      {
        id: 'pink', 
        position: { x: 15, y: 11 },
        direction: Direction.UP,
        nextDirection: null,
        mode: GhostMode.IN_HOUSE,
        color: '#FFB8FF',
        baseColor: '#FFB8FF',
        target: { x: 16, y: 8 },
        modeTimer: 0,
        homeCorner: HOME_CORNERS.pink,
        isInHouse: true,
        exitDelay: 30,
        stuckCounter: 0,
        lastPositions: []
      },
      {
        id: 'cyan',
        position: { x: 17, y: 11 },
        direction: Direction.UP,
        nextDirection: null,
        mode: GhostMode.IN_HOUSE,
        color: '#00FFFF',
        baseColor: '#00FFFF',
        target: { x: 16, y: 8 },
        modeTimer: 0,
        homeCorner: HOME_CORNERS.cyan,
        isInHouse: true,
        exitDelay: 60,
        stuckCounter: 0,
        lastPositions: []
      },
      {
        id: 'orange',
        position: { x: 16, y: 12 },
        direction: Direction.UP,
        nextDirection: null,
        mode: GhostMode.IN_HOUSE,
        color: '#FFB852',
        baseColor: '#FFB852',
        target: { x: 16, y: 8 },
        modeTimer: 0,
        homeCorner: HOME_CORNERS.orange,
        isInHouse: true,
        exitDelay: 90,
        stuckCounter: 0,
        lastPositions: []
      }
    ];
  }
}
