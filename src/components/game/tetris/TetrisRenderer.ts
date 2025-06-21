import { TetrisGameState } from './TetrisEngine';
import { TetrisPiece, BOARD_WIDTH, BOARD_HEIGHT, CELL_SIZE } from './TetrisPieces';

export class TetrisRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public setCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public render(gameState: TetrisGameState): void {
    this.clearCanvas();
    this.drawBoard(gameState.board);
    
    if (gameState.currentPiece) {
      this.drawPiece(gameState.currentPiece);
    }
    
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
    // Calculate scale to fit canvas
    const scaleX = this.canvas.width / (BOARD_WIDTH * CELL_SIZE);
    const scaleY = this.canvas.height / (BOARD_HEIGHT * CELL_SIZE);
    const scale = Math.min(scaleX, scaleY);
    
    const scaledCellSize = CELL_SIZE * scale;
    const boardWidth = BOARD_WIDTH * scaledCellSize;
    const boardHeight = BOARD_HEIGHT * scaledCellSize;
    const offsetX = (this.canvas.width - boardWidth) / 2;
    const offsetY = (this.canvas.height - boardHeight) / 2;

    // Draw board background
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
    
    // Draw grid lines
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX + x * scaledCellSize, offsetY);
      this.ctx.lineTo(offsetX + x * scaledCellSize, offsetY + boardHeight);
      this.ctx.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, offsetY + y * scaledCellSize);
      this.ctx.lineTo(offsetX + boardWidth, offsetY + y * scaledCellSize);
      this.ctx.stroke();
    }
    
    // Draw placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          this.drawCell(
            offsetX + x * scaledCellSize, 
            offsetY + y * scaledCellSize, 
            scaledCellSize,
            '#666'
          );
        }
      }
    }
  }

  private drawPiece(piece: TetrisPiece): void {
    const scaleX = this.canvas.width / (BOARD_WIDTH * CELL_SIZE);
    const scaleY = this.canvas.height / (BOARD_HEIGHT * CELL_SIZE);
    const scale = Math.min(scaleX, scaleY);
    
    const scaledCellSize = CELL_SIZE * scale;
    const boardWidth = BOARD_WIDTH * scaledCellSize;
    const boardHeight = BOARD_HEIGHT * scaledCellSize;
    const offsetX = (this.canvas.width - boardWidth) / 2;
    const offsetY = (this.canvas.height - boardHeight) / 2;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const pixelX = offsetX + (piece.x + x) * scaledCellSize;
          const pixelY = offsetY + (piece.y + y) * scaledCellSize;
          this.drawCell(pixelX, pixelY, scaledCellSize, piece.color);
        }
      }
    }
  }

  private drawCell(x: number, y: number, size: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    
    // Add highlight for 3D effect
    this.ctx.fillStyle = this.lightenColor(color, 0.3);
    this.ctx.fillRect(x + 1, y + 1, size - 2, 4);
    this.ctx.fillRect(x + 1, y + 1, 4, size - 2);
    
    // Add shadow
    this.ctx.fillStyle = this.darkenColor(color, 0.3);
    this.ctx.fillRect(x + size - 5, y + 1, 4, size - 2);
    this.ctx.fillRect(x + 1, y + size - 5, size - 2, 4);
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
