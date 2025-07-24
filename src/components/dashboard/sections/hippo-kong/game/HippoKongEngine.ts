export interface HippoKongPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  onGround: boolean;
  onLadder: boolean;
  isJumping: boolean;
  direction: 'left' | 'right' | 'up' | 'down';
}

export interface HippoKongBarrel {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  state: 'rolling' | 'falling' | 'seeking_ladder' | 'on_ladder';
  platformIndex: number; // Track which platform level the barrel is on
  rollTimer: number; // Time spent rolling on current platform
  rollDirection: number; // 1 for right, -1 for left
}

export interface HippoKongPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HippoKongLadder {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class HippoKongEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;
  private animationId: number | null = null;
  private lastTime = 0;
  private princessImage: HTMLImageElement;
  
  private player: HippoKongPlayer;
  private barrels: HippoKongBarrel[] = [];
  private platforms: HippoKongPlatform[] = [];
  private ladders: HippoKongLadder[] = [];
  
  private score = 0;
  private level = 1;
  private startTime = 0;
  private barrelSpawnTimer = 0;
  private barrelSpawnInterval = 3000; // 3 seconds
  
  private keys: { [key: string]: boolean } = {};
  
  // Callbacks
  private onGameEnd: (score: number, level: number, duration: number) => void;
  private onScoreUpdate: (score: number) => void;
  private onLevelUp: (level: number) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    onGameEnd: (score: number, level: number, duration: number) => void,
    onScoreUpdate: (score: number) => void,
    onLevelUp: (level: number) => void
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.onGameEnd = onGameEnd;
    this.onScoreUpdate = onScoreUpdate;
    this.onLevelUp = onLevelUp;

    // Load princess image
    this.princessImage = new Image();
    this.princessImage.src = '/lovable-uploads/3ba2104a-d1f9-4bda-aa36-23d071c5fcc8.png';

    this.setupLevel();
    this.bindEvents();
  }

  private setupLevel() {
    // Initialize player at bottom
    this.player = {
      x: 50,
      y: 520,
      width: 40,
      height: 40,
      velocityY: 0,
      onGround: true,
      onLadder: false,
      isJumping: false,
      direction: 'right'
    };

    // Create platforms (bottom to top)
    this.platforms = [
      { x: 0, y: 560, width: 800, height: 40 },     // Bottom platform
      { x: 100, y: 450, width: 600, height: 20 },   // Level 1
      { x: 50, y: 340, width: 700, height: 20 },    // Level 2
      { x: 150, y: 230, width: 500, height: 20 },   // Level 3
      { x: 250, y: 120, width: 300, height: 20 },   // Top platform
    ];

    // Create ladders connecting platforms
    this.ladders = [
      { x: 200, y: 450, width: 30, height: 110 },   // Bottom to Level 1
      { x: 600, y: 340, width: 30, height: 110 },   // Level 1 to Level 2
      { x: 150, y: 230, width: 30, height: 110 },   // Level 2 to Level 3
      { x: 500, y: 120, width: 30, height: 110 },   // Level 3 to Top
    ];

    this.barrels = [];
    this.score = 0;
    this.level = 1;
    this.barrelSpawnTimer = 0;
  }

  private bindEvents() {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys, WASD, and spacebar to stop page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys, WASD, and spacebar
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  pause() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  reset() {
    this.pause();
    this.setupLevel();
  }

  cleanup() {
    this.pause();
    // Remove event listeners would be handled by component cleanup
  }

  private gameLoop(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number) {
    this.updatePlayer(deltaTime);
    this.updateBarrels(deltaTime);
    this.spawnBarrels(deltaTime);
    this.checkCollisions();
    this.updateScore();
    this.checkWinCondition();
  }

  private updatePlayer(deltaTime: number) {
    const speed = 200; // pixels per second
    const moveDistance = (speed * deltaTime) / 1000;

    // Handle horizontal movement
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.player.x = Math.max(0, this.player.x - moveDistance);
      this.player.direction = 'left';
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + moveDistance);
      this.player.direction = 'right';
    }

    // Check if player is on a ladder
    this.player.onLadder = this.isOnLadder();

    // Handle jump (spacebar)
    if (this.keys[' '] && (this.player.onGround || this.player.onLadder) && !this.player.isJumping) {
      this.player.velocityY = -250; // Jump ~39px high - enough to clear 30px barrels with collision buffer
      this.player.isJumping = true;
      this.player.onGround = false;
    }

    // Handle vertical movement (ladders and jumping)
    if (this.player.onLadder && !this.player.isJumping) {
      // On ladder - can move up/down
      if (this.keys['ArrowUp'] || this.keys['w']) {
        this.player.y = Math.max(0, this.player.y - moveDistance);
        this.player.direction = 'up';
      }
      if (this.keys['ArrowDown'] || this.keys['s']) {
        this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + moveDistance);
        this.player.direction = 'down';
      }
      this.player.velocityY = 0; // No gravity on ladders
    } else {
    // Apply gravity
    this.player.velocityY += 800 * (deltaTime / 1000); // gravity
    this.player.y += this.player.velocityY * (deltaTime / 1000);
    
    // Prevent player from going off screen top
    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.velocityY = 0;
    }
    }

    // Check platform collisions
    this.handlePlatformCollisions();
  }

  private isOnLadder(): boolean {
    return this.ladders.some(ladder => 
      this.player.x + this.player.width > ladder.x &&
      this.player.x < ladder.x + ladder.width &&
      this.player.y + this.player.height > ladder.y &&
      this.player.y < ladder.y + ladder.height
    );
  }

  private handlePlatformCollisions() {
    this.player.onGround = false;

    for (const platform of this.platforms) {
      if (this.player.x + this.player.width > platform.x &&
          this.player.x < platform.x + platform.width &&
          this.player.y + this.player.height > platform.y &&
          this.player.y < platform.y + platform.height) {
        
        // Landing on top of platform
        if (this.player.velocityY > 0) {
          this.player.y = platform.y - this.player.height;
          this.player.velocityY = 0;
          this.player.onGround = true;
          this.player.isJumping = false;
        }
      }
    }

    // Prevent falling through bottom
    if (this.player.y + this.player.height > this.canvas.height) {
      this.player.y = this.canvas.height - this.player.height;
      this.player.velocityY = 0;
      this.player.onGround = true;
      this.player.isJumping = false;
    }
  }

  private spawnBarrels(deltaTime: number) {
    this.barrelSpawnTimer += deltaTime;
    
    if (this.barrelSpawnTimer > this.barrelSpawnInterval) {
      this.barrelSpawnTimer = 0;
      
      // Spawn multiple barrels at higher levels
      const barrelCount = Math.min(1 + Math.floor(this.level / 3), 3); // 1-3 barrels based on level
      
      for (let i = 0; i < barrelCount; i++) {
        // Spawn barrel from top platform with slight delay between multiple barrels
        setTimeout(() => {
          this.barrels.push({
            x: 250 + Math.random() * 200, // Random position on top platform
            y: 80,
            width: 30,
            height: 30,
            velocityX: 0,
            velocityY: 0,
            state: 'rolling',
            platformIndex: 4, // Top platform index
            rollTimer: 0,
            rollDirection: Math.random() > 0.5 ? 1 : -1
          });
        }, i * 200); // 200ms delay between barrels
      }
    }
  }

  private updateBarrels(deltaTime: number) {
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const barrel = this.barrels[i];
      
      // Update barrel based on its state
      this.updateBarrelState(barrel, deltaTime);
      
      // Apply physics based on state
      if (barrel.state === 'falling' || barrel.state === 'seeking_ladder') {
        barrel.velocityY += 600 * (deltaTime / 1000); // Apply gravity
      } else if (barrel.state === 'rolling') {
        barrel.velocityY = 0; // No vertical movement when rolling
        barrel.velocityX = barrel.rollDirection * 80; // Consistent rolling speed
      } else if (barrel.state === 'on_ladder') {
        barrel.velocityY = 150; // Move down ladder
        barrel.velocityX = 0; // No horizontal movement on ladder
      }
      
      // Update position
      barrel.x += barrel.velocityX * (deltaTime / 1000);
      barrel.y += barrel.velocityY * (deltaTime / 1000);
      
      // Check platform collisions and state transitions
      this.handleBarrelCollisions(barrel);
      
      // Remove barrels that fall off screen
      if (barrel.y > this.canvas.height + 100) {
        this.barrels.splice(i, 1);
      }
    }
  }

  private updateBarrelState(barrel: HippoKongBarrel, deltaTime: number) {
    barrel.rollTimer += deltaTime;
    
    switch (barrel.state) {
      case 'rolling':
        // Roll for 2-4 seconds before seeking ladder
        if (barrel.rollTimer > 2000 + Math.random() * 2000) {
          barrel.state = 'seeking_ladder';
          barrel.rollTimer = 0;
        }
        break;
        
      case 'seeking_ladder':
        // Look for nearby ladder to go down
        const nearbyLadder = this.findNearestLadder(barrel);
        if (nearbyLadder && this.isBarrelNearLadder(barrel, nearbyLadder)) {
          barrel.state = 'on_ladder';
          barrel.x = nearbyLadder.x + (nearbyLadder.width - barrel.width) / 2; // Center on ladder
          barrel.rollTimer = 0;
        }
        break;
        
      case 'on_ladder':
        // Check if reached bottom of ladder
        const ladderBottom = this.ladders.find(l => 
          Math.abs(barrel.x - (l.x + l.width/2 - barrel.width/2)) < 20
        );
        if (ladderBottom && barrel.y + barrel.height >= ladderBottom.y + ladderBottom.height) {
          // Reached bottom of ladder, start falling to find next platform
          barrel.state = 'falling';
          barrel.rollTimer = 0;
        }
        break;
        
      case 'falling':
        // Will be handled by collision detection
        break;
    }
  }

  private handleBarrelCollisions(barrel: HippoKongBarrel) {
    // Check platform collisions
    for (let platformIndex = 0; platformIndex < this.platforms.length; platformIndex++) {
      const platform = this.platforms[platformIndex];
      
      if (barrel.x + barrel.width > platform.x &&
          barrel.x < platform.x + platform.width &&
          barrel.y + barrel.height > platform.y &&
          barrel.y < platform.y + platform.height &&
          barrel.velocityY > 0) {
        
        // Barrel lands on platform
        barrel.y = platform.y - barrel.height;
        barrel.velocityY = 0;
        barrel.platformIndex = platformIndex;
        
        // Transition to rolling state
        if (barrel.state === 'falling' || barrel.state === 'on_ladder') {
          barrel.state = 'rolling';
          barrel.rollDirection = Math.random() > 0.5 ? 1 : -1;
          barrel.rollTimer = 0;
        }
        
        // Handle edge bouncing when rolling
        if (barrel.state === 'rolling') {
          if (barrel.x <= platform.x + 5) {
            barrel.x = platform.x + 5;
            barrel.rollDirection = 1; // Bounce right
          } else if (barrel.x + barrel.width >= platform.x + platform.width - 5) {
            barrel.x = platform.x + platform.width - 5 - barrel.width;
            barrel.rollDirection = -1; // Bounce left
          }
        }
        
        return; // Found collision, exit
      }
    }
    
    // Check if barrel is falling off platform edge while seeking ladder
    if (barrel.state === 'seeking_ladder') {
      const currentPlatform = this.platforms[barrel.platformIndex];
      if (currentPlatform) {
        // If barrel moves off platform edge, start falling
        if (barrel.x + barrel.width < currentPlatform.x || barrel.x > currentPlatform.x + currentPlatform.width) {
          barrel.state = 'falling';
          barrel.rollTimer = 0;
        }
      }
    }
    
    // Force barrels to continue falling if they're not on any platform
    if (barrel.state === 'rolling' || barrel.state === 'seeking_ladder') {
      let onPlatform = false;
      for (const platform of this.platforms) {
        if (barrel.x + barrel.width > platform.x &&
            barrel.x < platform.x + platform.width &&
            Math.abs((barrel.y + barrel.height) - platform.y) < 10) {
          onPlatform = true;
          break;
        }
      }
      if (!onPlatform) {
        barrel.state = 'falling';
        barrel.rollTimer = 0;
      }
    }
  }

  private findNearestLadder(barrel: HippoKongBarrel): HippoKongLadder | null {
    let nearestLadder: HippoKongLadder | null = null;
    let nearestDistance = Infinity;
    
    for (const ladder of this.ladders) {
      // Check if ladder is accessible from current platform
      const ladderBottom = ladder.y + ladder.height;
      const barrelBottom = barrel.y + barrel.height;
      
      // Ladder should be roughly at the same level as the barrel's platform
      if (Math.abs(ladderBottom - barrelBottom) < 50) {
        const distance = Math.abs(barrel.x - ladder.x);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestLadder = ladder;
        }
      }
    }
    
    return nearestLadder;
  }

  private isBarrelNearLadder(barrel: HippoKongBarrel, ladder: HippoKongLadder): boolean {
    const barrelCenter = barrel.x + barrel.width / 2;
    const ladderCenter = ladder.x + ladder.width / 2;
    return Math.abs(barrelCenter - ladderCenter) < 40; // Within 40 pixels
  }

  private checkCollisions() {
    // Check player-barrel collisions BEFORE win condition
    for (const barrel of this.barrels) {
      if (this.player.x + this.player.width - 5 > barrel.x &&
          this.player.x + 5 < barrel.x + barrel.width &&
          this.player.y + this.player.height - 5 > barrel.y &&
          this.player.y + 5 < barrel.y + barrel.height) {
        
        // Game over - collision detected!
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.onGameEnd(this.score, this.level, duration);
        this.pause();
        return;
      }
    }
  }

  private updateScore() {
    // Only award base points for climbing - no massive score increases
    const heightScore = Math.floor((this.canvas.height - this.player.y) / 50); // Much smaller increments
    const newScore = heightScore + (this.level - 1) * 50; // Smaller level bonus
    
    if (newScore > this.score) {
      this.score = newScore;
      this.onScoreUpdate(this.score);
    }
  }

  private checkWinCondition() {
    // Check if player reached the top platform (near princess)
    if (this.player.y <= 140) { // Near the top platform
      // Award 1 credit for rescuing princess (this triggers the credit award)
      const duration = Math.floor((Date.now() - this.startTime) / 1000);
      this.score += 100; // Small bonus for completing level
      this.onScoreUpdate(this.score);
      
      this.level++;
      this.onLevelUp(this.level);
      
      // Reset player position and increase difficulty
      this.player.x = 50;
      this.player.y = 520;
      
      // Progressive difficulty: much faster spawning and more aggressive progression
      this.barrelSpawnInterval = Math.max(300, this.barrelSpawnInterval - 500); // Faster reduction
      
      // Add more ladders for higher levels
      this.addMoreLadders();
      
      this.barrels = []; // Clear existing barrels
    }
  }

  private addMoreLadders() {
    // Add additional ladders progressively each level
    if (this.level === 2 && this.ladders.length === 4) {
      this.ladders.push(
        { x: 400, y: 450, width: 30, height: 110 }   // Extra ladder Level 0 to 1
      );
    }
    if (this.level === 3 && this.ladders.length === 5) {
      this.ladders.push(
        { x: 300, y: 340, width: 30, height: 110 }    // Extra ladder Level 1 to 2
      );
    }
    if (this.level === 4 && this.ladders.length === 6) {
      this.ladders.push(
        { x: 350, y: 230, width: 30, height: 110 }    // Extra ladder Level 2 to 3
      );
    }
    if (this.level === 5 && this.ladders.length === 7) {
      this.ladders.push(
        { x: 450, y: 120, width: 30, height: 110 }    // Extra ladder Level 3 to Top
      );
    }
    if (this.level >= 6 && this.ladders.length === 8) {
      // Add even more ladders for extreme difficulty
      this.ladders.push(
        { x: 550, y: 450, width: 30, height: 110 },   // Another Level 0 to 1
        { x: 100, y: 340, width: 30, height: 110 }    // Another Level 1 to 2
      );
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1e293b'; // Dark blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms
    this.ctx.fillStyle = '#8b4513'; // Brown
    for (const platform of this.platforms) {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw ladders
    this.ctx.fillStyle = '#daa520'; // Gold
    for (const ladder of this.ladders) {
      this.ctx.fillRect(ladder.x, ladder.y, ladder.width, ladder.height);
      
      // Draw ladder rungs
      this.ctx.fillStyle = '#b8860b'; // Darker gold
      for (let y = ladder.y; y < ladder.y + ladder.height; y += 15) {
        this.ctx.fillRect(ladder.x, y, ladder.width, 3);
      }
      this.ctx.fillStyle = '#daa520';
    }

    // Draw player (gorilla emoji)
    this.ctx.font = '40px serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🦍', this.player.x + this.player.width / 2, this.player.y + this.player.height);

    // Draw barrels
    this.ctx.font = '30px serif';
    for (const barrel of this.barrels) {
      this.ctx.fillText('🛢️', barrel.x + barrel.width / 2, barrel.y + barrel.height);
    }

    // Draw princess at the top
    if (this.princessImage.complete) {
      this.ctx.drawImage(this.princessImage, 370, 70, 60, 60); // 60x60 size, centered around original position
    } else {
      // Fallback to emoji if image hasn't loaded yet
      this.ctx.font = '40px serif';
      this.ctx.fillText('👸', 400, 110);
    }

    // Draw UI
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Level: ${this.level}`, 10, 55);
    
    // Draw goal text
    this.ctx.textAlign = 'center';
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillText('Rescue the Princess!', 400, 90);
  }
}