
import { HippoState } from './GamePhysics';

export interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  hit: boolean;
}

export interface Missile {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CollisionDetector {
  checkPipeCollision(hippo: HippoState, pipe: Pipe): boolean {
    if (pipe.hit) return false;
    
    const hippoInPipeX = hippo.x + hippo.width > pipe.x && hippo.x < pipe.x + pipe.width;
    if (!hippoInPipeX) return false;

    const hippoHitsTop = hippo.y < pipe.topHeight;
    const hippoHitsBottom = hippo.y + hippo.height > pipe.bottomY;
    
    return hippoHitsTop || hippoHitsBottom;
  }

  checkMissileCollision(hippo: HippoState, missile: Missile): boolean {
    return (
      hippo.x + hippo.width > missile.x &&
      hippo.x < missile.x + missile.width &&
      hippo.y + hippo.height > missile.y &&
      hippo.y < missile.y + missile.height
    );
  }

  checkPipeScored(hippo: HippoState, pipe: Pipe): boolean {
    return !pipe.hit && pipe.x + pipe.width < hippo.x;
  }
}
