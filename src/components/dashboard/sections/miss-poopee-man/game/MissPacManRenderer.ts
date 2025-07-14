import { GameState, MAZE_LAYOUT, CellType, CELL_SIZE, Direction } from './MissPacManEngine';

export class MissPacManRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private scale = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    // Get the full container dimensions
    const containerRect = container.getBoundingClientRect();
    
    // Use the full available space
    const availableWidth = containerRect.width;
    const availableHeight = containerRect.height;
    
    // Calculate scale to fit the maze properly while filling the space
    const mazePixelWidth = MAZE_LAYOUT[0].length * CELL_SIZE;
    const mazePixelHeight = MAZE_LAYOUT.length * CELL_SIZE;
    
    // Scale to fit both dimensions, but prefer filling the space
    const scaleX = availableWidth / mazePixelWidth;
    const scaleY = availableHeight / mazePixelHeight;
    this.scale = Math.min(scaleX, scaleY, 3); // Max scale of 3 for readability
    
    // Calculate final dimensions
    const scaledWidth = mazePixelWidth * this.scale;
    const scaledHeight = mazePixelHeight * this.scale;
    
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas dimensions to fill the container
    this.canvas.width = scaledWidth * dpr;
    this.canvas.height = scaledHeight * dpr;
    this.canvas.style.width = `${scaledWidth}px`;
    this.canvas.style.height = `${scaledHeight}px`;
    
    // Center the canvas in the container if there's extra space
    this.canvas.style.margin = 'auto';
    this.canvas.style.display = 'block';
    
    this.ctx.scale(dpr * this.scale, dpr * this.scale);
  }

  public render(gameState: GameState): void {
    this.animationFrame++;
    this.clearCanvas();
    this.renderMaze();
    this.renderPellets(gameState);
    this.renderPowerPellets(gameState);
    this.renderPlayer(gameState);
    this.renderGhosts(gameState);
    this.renderUI(gameState);
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderMaze(): void {
    this.ctx.fillStyle = '#0000FF';
    this.ctx.strokeStyle = '#0000FF';
    this.ctx.lineWidth = 2;

    for (let y = 0; y < MAZE_LAYOUT.length; y++) {
      for (let x = 0; x < MAZE_LAYOUT[y].length; x++) {
        if (MAZE_LAYOUT[y][x] === CellType.WALL) {
          this.ctx.fillRect(
            x * CELL_SIZE + 2,
            y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
          );
        }
      }
    }
  }

  private renderPellets(gameState: GameState): void {
    this.ctx.fillStyle = '#FFFF00';
    
    for (let y = 0; y < gameState.pellets.length; y++) {
      for (let x = 0; x < gameState.pellets[y].length; x++) {
        if (gameState.pellets[y][x]) {
          this.ctx.beginPath();
          this.ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            2,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
        }
      }
    }
  }

  private renderPowerPellets(gameState: GameState): void {
    // Blinking effect for power pellets (💩)
    if (Math.floor(this.animationFrame / 15) % 2 === 0) {
      this.ctx.font = `${CELL_SIZE * 0.8}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      gameState.powerPellets.forEach(pellet => {
        this.ctx.fillText(
          '💩',
          pellet.x * CELL_SIZE + CELL_SIZE / 2,
          pellet.y * CELL_SIZE + CELL_SIZE / 2
        );
      });
    }
  }

  private renderPlayer(gameState: GameState): void {
    const { player } = gameState;
    const centerX = player.position.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = player.position.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE * 0.4;

    // Mouth animation
    const mouthAngle = player.isMoving ? 
      Math.abs(Math.sin(this.animationFrame * 0.3)) * Math.PI / 3 : 
      Math.PI / 6;

    // Direction-based rotation
    let rotation = 0;
    switch (player.direction) {
      case Direction.RIGHT: rotation = 0; break;
      case Direction.DOWN: rotation = Math.PI / 2; break;
      case Direction.LEFT: rotation = Math.PI; break;
      case Direction.UP: rotation = -Math.PI / 2; break;
    }

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation);

    // Body
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, mouthAngle, Math.PI * 2 - mouthAngle);
    this.ctx.lineTo(0, 0);
    this.ctx.fill();

    // Eye
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderGhosts(gameState: GameState): void {
    gameState.ghosts.forEach(ghost => {
      const centerX = ghost.position.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = ghost.position.y * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE * 0.4;

      let ghostColor = ghost.color;
      
      // Frightened mode - blue and blinking
      if (ghost.mode === 'frightened') {
        if (gameState.powerModeTimer < 2000 && Math.floor(this.animationFrame / 10) % 2 === 0) {
          ghostColor = '#FFFFFF'; // Blinking white when power mode ending
        } else {
          ghostColor = '#0000FF'; // Blue when frightened
        }
      }

      this.ctx.fillStyle = ghostColor;

      // Ghost body
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY - radius * 0.2, radius, Math.PI, 0);
      this.ctx.rect(centerX - radius, centerY - radius * 0.2, radius * 2, radius * 1.2);
      
      // Ghost bottom wavy edge
      for (let i = 0; i < 4; i++) {
        const waveX = centerX - radius + (i * radius * 0.5);
        const waveY = centerY + radius;
        if (i === 0) {
          this.ctx.lineTo(waveX, waveY);
        } else {
          this.ctx.lineTo(waveX, waveY - radius * 0.2);
          this.ctx.lineTo(waveX + radius * 0.25, waveY);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();

      // Eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
      this.ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Pupils
      if (ghost.mode !== 'frightened') {
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  private renderUI(gameState: GameState): void {
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    // Score
    this.ctx.fillText(`Score: ${gameState.score}`, 10, 10);
    
    // Level
    this.ctx.fillText(`Level: ${gameState.level}`, 10, 30);
    
    // Lives
    this.ctx.fillText(`Lives: ${gameState.lives}`, 10, 50);

    // Game status messages
    if (gameState.gameStatus === 'game-over') {
      this.renderCenteredText('GAME OVER!', '#FF0000', '24px Arial');
    } else if (gameState.gameStatus === 'level-complete') {
      this.renderCenteredText('LEVEL COMPLETE!', '#00FF00', '24px Arial');
    } else if (gameState.gameStatus === 'paused') {
      this.renderCenteredText('PAUSED', '#FFFFFF', '24px Arial');
    }
  }

  private renderCenteredText(text: string, color: string, font: string): void {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const centerX = (MAZE_LAYOUT[0].length * CELL_SIZE) / 2;
    const centerY = (MAZE_LAYOUT.length * CELL_SIZE) / 2;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(centerX - 100, centerY - 20, 200, 40);
    
    // Text
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, centerX, centerY);
    
    this.ctx.restore();
  }

  public resize(): void {
    this.setupCanvas();
  }
}
