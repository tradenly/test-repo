
import { TetrisGameState } from './TetrisEngine';
import { TetrisPiece, BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } from './TetrisPieces';

export class TetrisRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = BOARD_WIDTH * CELL_SIZE + 200; // Extra space for UI
    this.canvas.height = BOARD_HEIGHT * CELL_SIZE + 100;
  }

  public render(gameState: TetrisGameState): void {
    this.clearCanvas();
    this.drawBoard(gameState.board);
    
    if (gameState.currentPiece) {
      this.drawPiece(gameState.currentPiece);
    }
    
    this.drawUI(gameState);
    
    if (gameState.isPaused) {
      this.drawPauseOverlay();
    }
    
    if (gameState.isGameOver) {
      this.drawGameOverOverlay();
    }
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBoard(board: number[][]): void {
    // Draw board background
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    
    // Draw grid lines
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * CELL_SIZE, 0);
      this.ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * CELL_SIZE);
      this.ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      this.ctx.stroke();
    }
    
    // Draw placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          this.drawCell(x * CELL_SIZE, y * CELL_SIZE, '#666');
        }
      }
    }
  }

  private drawPiece(piece: TetrisPiece): void {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const pixelX = (piece.x + x) * CELL_SIZE;
          const pixelY = (piece.y + y) * CELL_SIZE;
          this.drawCell(pixelX, pixelY, piece.color);
        }
      }
    }
  }

  private drawCell(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    
    // Add highlight for 3D effect
    this.ctx.fillStyle = this.lightenColor(color, 0.3);
    this.ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, 4);
    this.ctx.fillRect(x + 1, y + 1, 4, CELL_SIZE - 2);
    
    // Add shadow
    this.ctx.fillStyle = this.darkenColor(color, 0.3);
    this.ctx.fillRect(x + CELL_SIZE - 5, y + 1, 4, CELL_SIZE - 2);
    this.ctx.fillRect(x + 1, y + CELL_SIZE - 5, CELL_SIZE - 2, 4);
  }

  private drawUI(gameState: TetrisGameState): void {
    const uiX = BOARD_WIDTH * CELL_SIZE + 20;
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    
    this.ctx.fillText(`Score: ${gameState.score}`, uiX, 30);
    this.ctx.fillText(`Level: ${gameState.level}`, uiX, 60);
    this.ctx.fillText(`Lines: ${gameState.lines}`, uiX, 90);
    
    // Draw next piece
    if (gameState.nextPiece) {
      this.ctx.fillText('Next:', uiX, 130);
      this.drawNextPiece(gameState.nextPiece, uiX, 150);
    }
    
    // Draw controls
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Controls:', uiX, 250);
    this.ctx.fillText('←→ Move', uiX, 270);
    this.ctx.fillText('↑ Rotate', uiX, 290);
    this.ctx.fillText('↓ Soft Drop', uiX, 310);
    this.ctx.fillText('Space Hard Drop', uiX, 330);
    this.ctx.fillText('P Pause', uiX, 350);
  }

  private drawNextPiece(piece: TetrisPiece, x: number, y: number): void {
    const scale = 0.7;
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px]) {
          this.ctx.fillStyle = piece.color;
          this.ctx.fillRect(
            x + px * CELL_SIZE * scale,
            y + py * CELL_SIZE * scale,
            CELL_SIZE * scale - 1,
            CELL_SIZE * scale - 1
          );
        }
      }
    }
  }

  private drawPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.textAlign = 'left';
  }

  private drawGameOverOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    this.ctx.textAlign = 'left';
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  }
}
