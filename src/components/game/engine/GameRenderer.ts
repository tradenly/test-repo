import { HippoState } from './GamePhysics';
import { Pipe, Missile } from './CollisionDetector';
import { PacManState, Ghost, Pellet, GameMode } from '../GameEngine';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private parallaxOffset = 0;
  private gameMode: GameMode;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, gameMode: GameMode = 'flappy_hippos') {
    this.ctx = ctx;
    this.canvas = canvas;
    this.gameMode = gameMode;
  }

  updateParallax() {
    this.parallaxOffset -= 1;
  }

  renderBackground(missileWarningTime: number, hitEffectTime: number) {
    // Enhanced sky gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.3, '#98D8E8');
    gradient.addColorStop(0.7, '#B0E0E6');
    gradient.addColorStop(1, '#F0F8FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Missile warning effect
    if (missileWarningTime > 0) {
      this.ctx.strokeStyle = '#ff0000';
      this.ctx.lineWidth = 8;
      this.ctx.globalAlpha = 0.3 + (Math.sin(missileWarningTime * 0.3) * 0.3);
      this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
    }

    // Screen shake during hits
    if (hitEffectTime > 0) {
      this.ctx.save();
      const shakeIntensity = Math.min(hitEffectTime / 10, 3);
      this.ctx.translate(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity
      );
    }
  }

  renderClouds() {
    this.ctx.fillStyle = 'white';
    this.ctx.globalAlpha = 0.8;
    
    for (let i = 0; i < 4; i++) {
      const x = (i * 250) + 30 + (this.parallaxOffset * 0.3);
      const y = 60 + (i * 20);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20, 0, Math.PI * 2);
      this.ctx.arc(x + 20, y, 30, 0, Math.PI * 2);
      this.ctx.arc(x + 40, y, 25, 0, Math.PI * 2);
      this.ctx.arc(x + 60, y, 20, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1;
  }

  renderPipe(pipe: Pipe) {
    const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, '#228B22');
    gradient.addColorStop(0.5, '#32CD32');
    gradient.addColorStop(1, '#228B22');
    
    this.ctx.fillStyle = gradient;
    
    this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
    this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, this.canvas.height - pipe.bottomY);
    
    this.ctx.fillStyle = '#32CD32';
    this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 35, pipe.width + 10, 35);
    this.ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 35);
    
    this.ctx.strokeStyle = '#1F5F1F';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < pipe.topHeight; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, i);
      this.ctx.lineTo(pipe.x + pipe.width, i);
      this.ctx.stroke();
    }
    for (let i = pipe.bottomY; i < this.canvas.height; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(pipe.x, i);
      this.ctx.lineTo(pipe.x + pipe.width, i);
      this.ctx.stroke();
    }
  }

  renderMissile(missile: Missile) {
    this.ctx.save();
    this.ctx.translate(missile.x + missile.width/2, missile.y + missile.height/2);
    
    // Enhanced emoji rendering with proper font stack
    this.ctx.font = 'bold 60px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", "Noto Color Emoji", system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Clear shadow effects that might interfere with emoji
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Render the poop emoji directly without shadow effects
    this.ctx.fillText('🦛', 0, 0);
    
    this.ctx.restore();
  }

  renderGround() {
    const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 60, 0, this.canvas.height);
    groundGradient.addColorStop(0, '#4682B4');
    groundGradient.addColorStop(0.5, '#5F9EA0');
    groundGradient.addColorStop(1, '#2F4F4F');
    
    this.ctx.fillStyle = groundGradient;
    this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
    
    this.ctx.strokeStyle = '#87CEEB';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.5;
    for (let i = 0; i < this.canvas.width; i += 50) {
      this.ctx.beginPath();
      this.ctx.arc(i + (this.parallaxOffset % 50), this.canvas.height - 30, 10, 0, Math.PI, false);
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;
  }

  renderHippo(hippo: HippoState, invincibilityTime: number) {
    this.ctx.save();
    this.ctx.translate(hippo.x + hippo.width/2, hippo.y + hippo.height/2);
    this.ctx.rotate(hippo.rotation);
    
    if (invincibilityTime > 0 && Math.floor(invincibilityTime / 5) % 2 === 0) {
      this.ctx.globalAlpha = 0.5;
    }
    
    // FIXED: Enhanced emoji font rendering for poop emoji
    this.ctx.font = 'bold 50px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", "EmojiOne Mozilla", "Twemoji Mozilla", "Segoe UI Symbol", system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Remove shadow effects that interfere with emoji rendering
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Render the poop emoji with enhanced font support
    this.ctx.fillText('💩', 0, 0);
    
    this.ctx.globalAlpha = 1;
    this.ctx.restore();
  }

  renderScore(score: number) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(this.canvas.width/2 - 50, 10, 100, 50);
    
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 3;
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.strokeText(score.toString(), this.canvas.width / 2, 45);
    this.ctx.fillText(score.toString(), this.canvas.width / 2, 45);
  }

  renderShieldCounter(pipeHitsRemaining: number, maxShields: number) {
    const shieldWidth = 25;
    const padding = 20;
    const labelWidth = 70;
    const counterWidth = 40;
    const totalWidth = labelWidth + (maxShields * shieldWidth) + counterWidth + (padding * 2);
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(10, 10, totalWidth, 50);
    
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('SHIELDS:', 20, 30);
    
    this.ctx.font = 'bold 20px Arial';
    for (let i = 0; i < maxShields; i++) {
      this.ctx.fillStyle = i < pipeHitsRemaining ? '#4CAF50' : '#666';
      this.ctx.fillText('🛡️', 20 + labelWidth + (i * shieldWidth), 45);
    }
    
    this.ctx.fillStyle = pipeHitsRemaining > 0 ? '#4CAF50' : '#f44336';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText(`${pipeHitsRemaining}/${maxShields}`, 20 + labelWidth + (maxShields * shieldWidth), 50);
  }

  restoreContext(hitEffectTime: number) {
    if (hitEffectTime > 0) {
      this.ctx.restore();
    }
  }

  // Miss POOPEE-Man rendering methods
  renderMissPoopeeManGame(
    maze: number[][], 
    pacman: PacManState, 
    ghosts: Ghost[], 
    pellets: Pellet[], 
    score: number, 
    cellSize: number
  ) {
    // Clear canvas with black background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render maze
    this.renderMaze(maze, cellSize);
    
    // Render pellets
    this.renderPellets(pellets, cellSize);
    
    // Render ghosts
    this.renderGhosts(ghosts, cellSize);
    
    // Render Pac-Man
    this.renderPacMan(pacman, cellSize);
    
    // Render score
    this.renderMissPoopeeManScore(score);
  }

  private renderMaze(maze: number[][], cellSize: number) {
    this.ctx.fillStyle = '#0000FF';
    this.ctx.strokeStyle = '#0000FF';
    this.ctx.lineWidth = 2;
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        if (maze[y][x] === 1) {
          this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  private renderPellets(pellets: Pellet[], cellSize: number) {
    pellets.forEach(pellet => {
      if (!pellet.collected) {
        if (pellet.isPowerPellet) {
          // Render power pellet (💩)
          this.ctx.font = `${cellSize * 0.8}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('💩', pellet.x, pellet.y);
        } else {
          // Render regular pellet
          this.ctx.fillStyle = '#FFFF00';
          this.ctx.beginPath();
          this.ctx.arc(pellet.x, pellet.y, 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });
  }

  private renderGhosts(ghosts: Ghost[], cellSize: number) {
    ghosts.forEach(ghost => {
      this.ctx.save();
      this.ctx.translate(ghost.x + cellSize/2, ghost.y + cellSize/2);
      
      if (ghost.isVulnerable) {
        if (ghost.isBlinking) {
          this.ctx.fillStyle = '#FFFFFF';
        } else {
          this.ctx.fillStyle = '#0000FF';
        }
      } else {
        this.ctx.fillStyle = ghost.color;
      }
      
      // Draw ghost body
      this.ctx.beginPath();
      this.ctx.arc(0, -cellSize/4, cellSize/3, Math.PI, 0, false);
      this.ctx.lineTo(cellSize/3, cellSize/4);
      this.ctx.lineTo(cellSize/4, cellSize/6);
      this.ctx.lineTo(cellSize/6, cellSize/4);
      this.ctx.lineTo(0, cellSize/6);
      this.ctx.lineTo(-cellSize/6, cellSize/4);
      this.ctx.lineTo(-cellSize/4, cellSize/6);
      this.ctx.lineTo(-cellSize/3, cellSize/4);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Draw eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(-cellSize/6, -cellSize/6, cellSize/12, 0, Math.PI * 2);
      this.ctx.arc(cellSize/6, -cellSize/6, cellSize/12, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(-cellSize/6, -cellSize/6, cellSize/18, 0, Math.PI * 2);
      this.ctx.arc(cellSize/6, -cellSize/6, cellSize/18, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private renderPacMan(pacman: PacManState, cellSize: number) {
    this.ctx.save();
    this.ctx.translate(pacman.x + cellSize/2, pacman.y + cellSize/2);
    
    // Rotate based on direction
    switch (pacman.direction) {
      case 'right': break;
      case 'left': this.ctx.rotate(Math.PI); break;
      case 'up': this.ctx.rotate(-Math.PI/2); break;
      case 'down': this.ctx.rotate(Math.PI/2); break;
    }
    
    // Draw Pac-Man as a circle with animated mouth
    const radius = cellSize * 0.4;
    const time = Date.now() * 0.01; // Animation speed
    const mouthAngle = Math.abs(Math.sin(time)) * Math.PI * 0.6; // Mouth opens and closes
    
    this.ctx.fillStyle = '#FFFF00'; // Classic Pac-Man yellow
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, mouthAngle / 2, 2 * Math.PI - mouthAngle / 2);
    this.ctx.lineTo(0, 0);
    this.ctx.fill();
    
    // Add a small eye
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private renderMissPoopeeManScore(score: number) {
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${score}`, 10, 30);
  }
}
