
import { Pipe, Missile } from './CollisionDetector';

export class GameObjectManager {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  createPipe(): Pipe {
    const gapSize = 160;
    const minGapY = 80;
    const maxGapY = this.canvas.height - gapSize - 120;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    return {
      x: this.canvas.width,
      topHeight: gapY,
      bottomY: gapY + gapSize,
      width: 60,
      hit: false
    };
  }

  createMissile(): Missile {
    const minY = this.canvas.height * 0.2;
    const maxY = this.canvas.height * 0.8 - 50;
    const y = Math.random() * (maxY - minY) + minY;

    return {
      x: this.canvas.width + 50,
      y: y,
      width: 70,
      height: 50
    };
  }

  updatePipes(pipes: Pipe[], speedMultiplier: number = 1): Pipe[] {
    // Remove off-screen pipes - now the movement happens in GameEngine
    return pipes.filter(pipe => pipe.x > -pipe.width);
  }

  updateMissiles(missiles: Missile[], speedMultiplier: number = 1): Missile[] {
    // Move missiles left with speed adjustment
    missiles.forEach(missile => {
      missile.x -= 2.5 * speedMultiplier;
    });

    // Remove off-screen missiles
    return missiles.filter(missile => missile.x > -missile.width);
  }

  shouldAddPipe(pipes: Pipe[]): boolean {
    return pipes.length === 0 || pipes[pipes.length - 1].x < 400;
  }
}
