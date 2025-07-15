
// Advanced canvas renderer for Miss POOPEE-Man
import { GameState, Position, Ghost, MazeCell, CELL_SIZE } from './GameEngine';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationFrame: number = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
    
    // Enable smooth rendering
    this.ctx.imageSmoothingEnabled = false;
    
    console.log('🎨 GameRenderer initialized with canvas dimensions:', canvas.width, 'x', canvas.height);
  }

  public render(gameState: GameState): void {
    this.animationFrame++;
    this.clearCanvas();
    
    this.renderMaze(gameState.maze);
    this.renderPellets(gameState.maze);
    this.renderPlayer(gameState.player);
    this.renderGhosts(gameState.ghosts);
    this.renderUI(gameState);
    
    if (gameState.powerMode.active) {
      this.renderPowerModeEffect();
    }
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderMaze(maze: MazeCell[][]): void {
    this.ctx.fillStyle = '#0066FF';
    this.ctx.strokeStyle = '#0088FF';
    this.ctx.lineWidth = 1;
    
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.type === 'wall') {
          const cellX = x * CELL_SIZE;
          const cellY = y * CELL_SIZE;
          
          // Fill the wall
          this.ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
          
          // Add border for better visibility
          this.ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
        }
      });
    });
  }

  private renderPellets(maze: MazeCell[][]): void {
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const centerX = x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = y * CELL_SIZE + CELL_SIZE / 2;
        
        if (cell.type === 'pellet') {
          this.ctx.fillStyle = '#FFFF00';
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (cell.type === 'powerPellet') {
          // Animated power pellet using emoji
          const pulseSize = 16 + Math.sin(this.animationFrame * 0.2) * 3;
          this.ctx.font = `${pulseSize}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('💩', centerX, centerY);
        }
      });
    });
  }

  private renderPlayer(player: GameState['player']): void {
    const centerX = player.position.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = player.position.y * CELL_SIZE + CELL_SIZE / 2;
    
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.beginPath();
    
    // Animated mouth based on direction and animation frame
    const mouthAnimation = (Math.sin(this.animationFrame * 0.3) + 1) * 0.4;
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    if (player.direction.x > 0) { // Moving right
      startAngle = mouthAnimation;
      endAngle = Math.PI * 2 - mouthAnimation;
    } else if (player.direction.x < 0) { // Moving left
      startAngle = Math.PI + mouthAnimation;
      endAngle = Math.PI - mouthAnimation;
    } else if (player.direction.y > 0) { // Moving down
      startAngle = Math.PI / 2 + mouthAnimation;
      endAngle = Math.PI / 2 - mouthAnimation;
    } else if (player.direction.y < 0) { // Moving up
      startAngle = -Math.PI / 2 + mouthAnimation;
      endAngle = -Math.PI / 2 - mouthAnimation;
    }
    
    this.ctx.arc(centerX, centerY, CELL_SIZE / 2 - 2, startAngle, endAngle);
    this.ctx.lineTo(centerX, centerY);
    this.ctx.fill();
  }

  private renderGhosts(ghosts: Ghost[]): void {
    ghosts.forEach(ghost => {
      const centerX = ghost.position.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = ghost.position.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Ghost body
      this.ctx.fillStyle = ghost.color;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY - 3, CELL_SIZE / 2 - 2, Math.PI, 0);
      this.ctx.lineTo(centerX + CELL_SIZE / 2 - 2, centerY + CELL_SIZE / 2 - 2);
      
      // Ghost bottom with wavy pattern
      for (let i = 0; i < 4; i++) {
        const waveX = centerX + (i - 2) * 4;
        const waveY = centerY + CELL_SIZE / 2 - 2 + Math.sin(this.animationFrame * 0.1 + i) * 2;
        this.ctx.lineTo(waveX, waveY);
      }
      
      this.ctx.lineTo(centerX - CELL_SIZE / 2 + 2, centerY + CELL_SIZE / 2 - 2);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Ghost eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 4, centerY - 4, 3, 0, Math.PI * 2);
      this.ctx.arc(centerX + 4, centerY - 4, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pupils
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 4, centerY - 4, 1, 0, Math.PI * 2);
      this.ctx.arc(centerX + 4, centerY - 4, 1, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private renderUI(gameState: GameState): void {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    // Score
    this.ctx.fillText(`Score: ${gameState.score}`, 10, 20);
    
    // Lives
    this.ctx.fillText(`Lives: ${gameState.lives}`, 10, 40);
    
    // Level
    this.ctx.fillText(`Level: ${gameState.level}`, 10, 60);
    
    // Progress
    const progress = Math.round((gameState.pellets.collected / gameState.pellets.total) * 100);
    this.ctx.fillText(`Progress: ${progress}%`, 10, 80);
    
    // Power mode timer
    if (gameState.powerMode.active) {
      const timeLeft = Math.ceil(gameState.powerMode.timeLeft / 60);
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`POWER MODE! ${timeLeft}s`, this.canvas.width / 2, 30);
    }
  }

  private renderPowerModeEffect(): void {
    // Screen flash effect during power mode
    const alpha = 0.1 + Math.sin(this.animationFrame * 0.2) * 0.05;
    this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
