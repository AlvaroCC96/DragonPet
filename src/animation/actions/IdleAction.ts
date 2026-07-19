import { AnimationAction, type AnimationTargetPose } from "../AnimationAction";

const BREATH_SPEED = 1.4;
const BREATH_AMPLITUDE = 0.02;
const SWAY_SPEED = 0.55;
const SWAY_AMPLITUDE = 0.012;
// Offsets the sway phase from the breath phase so they don't peak in sync.
const SWAY_PHASE = 1.3;

/** The existing gentle breathing + sway motion — the creature's resting pose. */
export class IdleAction extends AnimationAction {
  readonly id = "Idle";

  getTargetPose(elapsedTime: number): AnimationTargetPose {
    const breathe = Math.sin(elapsedTime * BREATH_SPEED) * BREATH_AMPLITUDE;
    const sway = Math.sin(elapsedTime * SWAY_SPEED + SWAY_PHASE) * SWAY_AMPLITUDE;
    return {
      position: { x: 0, y: breathe, z: 0 },
      rotation: { x: 0, y: 0, z: sway },
    };
  }
}
