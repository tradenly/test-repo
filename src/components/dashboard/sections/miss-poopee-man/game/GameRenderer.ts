
// Canvas renderer for Miss POOPEE-Man
import { GameState, Position, Ghost, MazeCell, CELL_SIZE, MAZE_WIDTH, MAZE_HEIGHT } from './GameEngine';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private animationFrame: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas 2D context');
    }
    this.ctx = context;
    
    // Set canvas size with proper cell size
    this.canvas.width = MAZE_WIDTH * CELL_SIZE;
    this.canvas.height = MAZE_HEIGHT * CELL_SIZE;
    
    // Configure canvas for better rendering
    this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
    this.ctx.textBaseline = 'top';
    
    console.log('🎨 GameRenderer initialized:', this.canvas.width, 'x', this.canvas.height);
    
    // Test render to verify canvas is working
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('Game Loading...', 10, 10);
  }

  public render(gameState: GameState): void {
    try {
      this.animationFrame++;
      this.clearCanvas();
      
      this.renderMaze(gameState.maze);
      this.renderPlayer(gameState.player);
      this.renderGhosts(gameState.ghosts);
      this.renderUI(gameState);
      
      if (gameState.powerMode.active) {
        this.renderPowerModeEffect();
      }
    } catch (error) {
      console.error('❌ Error in render:', error);
    }
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderMaze(maze: MazeCell[][]): void {
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const cell = maze[y][x];
        const cellX = x * CELL_SIZE;
        const cellY = y * CELL_SIZE;
        
        if (cell.type === 'wall') {
          // Enhanced wall rendering with 3D effect
          this.ctx.fillStyle = '#2563eb';
          this.ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
          
          // Add 3D border effect
          this.ctx.fillStyle = '#3b82f6';
          this.ctx.fillRect(cellX, cellY, CELL_SIZE, 2);
          this.ctx.fillRect(cellX, cellY, 2, CELL_SIZE);
          
          this.ctx.fillStyle = '#1e40af';
          this.ctx.fillRect(cellX + CELL_SIZE - 2, cellY, 2, CELL_SIZE);
          this.ctx.fillRect(cellX, cellY + CELL_SIZE - 2, CELL_SIZE, 2);
        } else if (cell.type === 'pellet') {
          // Regular pellets - bright yellow
          this.ctx.fillStyle = '#fbbf24';
          this.ctx.beginPath();
          this.ctx.arc(
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2,
            3,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
        } else if (cell.type === 'powerPellet') {
          // Animated power pellets - larger and pulsing
          const pulseSize = 8 + Math.sin(this.animationFrame * 0.15) * 2;
          this.ctx.fillStyle = '#f59e0b';
          this.ctx.beginPath();
          this.ctx.arc(
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2,
            pulseSize,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
          
          // Add glow effect
          this.ctx.shadowColor = '#f59e0b';
          this.ctx.shadowBlur = 15;
          this.ctx.beginPath();
          this.ctx.arc(
            cellX + CELL_SIZE / 2,
            cellY + CELL_SIZE / 2,
            pulseSize - 2,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
        }
      }
    }
  }

  private renderPlayer(player: GameState['player']): void {
    const centerX = player.position.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = player.position.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 4;
    
    // Player body - bright yellow
    this.ctx.fillStyle = '#eab308';
    this.ctx.beginPath();
    
    // Animated mouth based on direction and time
    const mouthAnimation = (Math.sin(this.animationFrame * 0.25) + 1) * 0.3;
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
    
    this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    this.ctx.lineTo(centerX, centerY);
    this.ctx.fill();
    
    // Add subtle outline
    this.ctx.strokeStyle = '#ca8a04';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private renderGhosts(ghosts: Ghost[]): void {
    ghosts.forEach(ghost => {
      const centerX = ghost.position.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = ghost.position.y * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE / 2 - 4;
      
      // Ghost body with rounded top
      this.ctx.fillStyle = ghost.color;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY - 2, radius, Math.PI, 0);
      this.ctx.lineTo(centerX + radius, centerY + radius);
      
      // Ghost bottom with wavy pattern
      const waveCount = 4;
      for (let i = 0; i <= waveCount; i++) {
        const waveX = centerX - radius + (i * (radius * 2) / waveCount);
        const waveY = centerY + radius + Math.sin(this.animationFrame * 0.1 + i) * 3;
        this.ctx.lineTo(waveX, waveY);
      }
      
      this.ctx.lineTo(centerX - radius, centerY + radius);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Ghost eyes - larger and more expressive
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 8, centerY - 8, 5, 0, Math.PI * 2);
      this.ctx.arc(centerX + 8, centerY - 8, 5, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pupils
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(centerX - 8, centerY - 8, 2, 0, Math.PI * 2);
      this.ctx.arc(centerX + 8, centerY - 8, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add outline for better visibility
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY - 2, radius, Math.PI, 0);
      this.ctx.stroke();
    });
  }

  private renderUI(gameState: GameState): void {
    // Score display - top left
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(5, 5, 150, 25);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${gameState.score}`, 10, 8);
    
    // Lives display - top left below score
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(5, 35, 150, 25);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Lives: ${gameState.lives}`, 10, 38);
    
    // Level display - top left below lives
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(5, 65, 150, 25);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Level: ${gameState.level}`, 10, 68);
    
    // Progress bar - top right
    const progressWidth = 200;
    const progressHeight = 20;
    const progressX = this.canvas.width - progressWidth - 10;
    const progressY = 10;
    const progressPercent = gameState.pellets.collected / gameState.pellets.total;
    
    // Progress background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(progressX - 5, progressY - 5, progressWidth + 10, progressHeight + 10);
    
    // Progress bar background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    
    // Progress bar fill
    this.ctx.fillStyle = '#4ade80';
    this.ctx.fillRect(progressX, progressY, progressWidth * progressPercent, progressHeight);
    
    // Progress text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `${gameState.pellets.collected}/${gameState.pellets.total}`,
      progressX + progressWidth / 2,
      progressY + 6
    );
    
    // Power mode indicator
    if (gameState.powerMode.active) {
      const timeLeft = Math.ceil(gameState.powerMode.timeLeft / 60);
      this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `POWER MODE! ${timeLeft}s`,
        this.canvas.width / 2,
        50
      );
    }
  }

  private renderPowerModeEffect(): void {
    // Screen flash effect during power mode
    const alpha = 0.05 + Math.sin(this.animationFrame * 0.2) * 0.03;
    this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
