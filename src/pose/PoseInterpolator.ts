import type { DragonPose } from "./DragonPose";
import { createHomePose } from "./PoseUtils";

// Exponential smoothing rate; higher = catches up to the target faster.
const DEFAULT_DAMPING = 5;

function damp(current: number, target: number, lambda: number, deltaTime: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}

/**
 * Owns the dragon's current Pose and its target Pose, and eases the current
 * one toward the target every frame. This is the only place smoothing math
 * lives — everything upstream just describes where the dragon should end up.
 */
export class PoseInterpolator {
  private readonly damping: number;
  private current: DragonPose;
  private target: DragonPose;

  constructor(damping: number = DEFAULT_DAMPING, initialPose: DragonPose = createHomePose()) {
    this.damping = damping;
    this.current = initialPose;
    this.target = createHomePose();
  }

  /** Sets where the current pose should ease toward next. */
  setTarget(pose: DragonPose): void {
    this.target = pose;
  }

  /** Advances the current pose toward the target by one frame. Returns the result. */
  step(deltaTime: number): DragonPose {
    this.current = {
      position: {
        x: damp(this.current.position.x, this.target.position.x, this.damping, deltaTime),
        y: damp(this.current.position.y, this.target.position.y, this.damping, deltaTime),
        z: damp(this.current.position.z, this.target.position.z, this.damping, deltaTime),
      },
      rotation: {
        x: damp(this.current.rotation.x, this.target.rotation.x, this.damping, deltaTime),
        y: damp(this.current.rotation.y, this.target.rotation.y, this.damping, deltaTime),
        z: damp(this.current.rotation.z, this.target.rotation.z, this.damping, deltaTime),
      },
      scale: {
        x: damp(this.current.scale.x, this.target.scale.x, this.damping, deltaTime),
        y: damp(this.current.scale.y, this.target.scale.y, this.damping, deltaTime),
        z: damp(this.current.scale.z, this.target.scale.z, this.damping, deltaTime),
      },
    };
    return this.current;
  }

  getCurrentPose(): DragonPose {
    return this.current;
  }
}
