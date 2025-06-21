
export interface HippoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  rotation: number;
}

export class GamePhysics {
  private gravity = 0.6;
  private flapForce = -12;
  private maxVelocity = 15;
  private bounceForce = 8;

  updateHippo(hippo: HippoState, canvasHeight: number): HippoState {
    // Apply gravity
    hippo.velocity = Math.min(hippo.velocity + this.gravity, this.maxVelocity);
    
    // Update position
    hippo.y += hippo.velocity;
    
    // Update rotation based on velocity
    if (hippo.velocity > 0) {
      hippo.rotation = Math.min(hippo.rotation + 0.05, 0.5);
    }

    return hippo;
  }

  flap(hippo: HippoState): HippoState {
    hippo.velocity = this.flapForce;
    hippo.rotation = -0.3;
    return hippo;
  }

  handleCeilingBounce(hippo: HippoState): HippoState {
    if (hippo.y < 0) {
      hippo.y = 0;
      hippo.velocity = this.bounceForce;
    }
    return hippo;
  }

  isGroundCollision(hippo: HippoState, canvasHeight: number): boolean {
    return hippo.y + hippo.height > canvasHeight - 60;
  }
}
