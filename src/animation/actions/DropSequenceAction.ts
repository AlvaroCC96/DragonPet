import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const FALL_DURATION = 0.2;
const BOUNCE_DURATION = 0.35;
const HOME_HOLD_DURATION = 0.25;
const LOOK_DURATION = 0.6;

const FALL_END = FALL_DURATION;
const BOUNCE_END = FALL_END + BOUNCE_DURATION;
const HOME_END = BOUNCE_END + HOME_HOLD_DURATION;
const LOOK_END = HOME_END + LOOK_DURATION;

const FALL_DEPTH = 0.05;
const BOUNCE_HEIGHT = 0.03;
const SQUASH_AMOUNT = 0.08;
const LOOK_ANGLE = 0.1;

/**
 * The sequence that plays right after the dragon is released: a small fall,
 * a small bounce, settling at the Home Pose, then a brief glance at the
 * user before CreatureBrain resumes normal Idle cycling on its own. Purely
 * phase-based Pose math — no new interpolation mechanism, PoseInterpolator
 * still eases the model toward whatever this returns each frame.
 */
export class DropSequenceAction extends AnimationAction {
  readonly id = "DropSequence";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const pose = createHomePose();

    if (actionElapsed < FALL_END) {
      const t = actionElapsed / FALL_DURATION;
      pose.position.y = -FALL_DEPTH * t;
      pose.scale.y = 1 - SQUASH_AMOUNT * t;
      pose.scale.x = 1 + SQUASH_AMOUNT * 0.5 * t;
      pose.scale.z = 1 + SQUASH_AMOUNT * 0.5 * t;
    } else if (actionElapsed < BOUNCE_END) {
      const t = (actionElapsed - FALL_END) / BOUNCE_DURATION;
      const amount = Math.sin(t * Math.PI);
      pose.position.y = -FALL_DEPTH * (1 - t) + BOUNCE_HEIGHT * amount;
      pose.scale.y = 1 - SQUASH_AMOUNT * (1 - t) * 0.5;
    } else if (actionElapsed < HOME_END) {
      // Resting at the Home Pose for a beat before the look.
    } else if (actionElapsed < LOOK_END) {
      const t = (actionElapsed - HOME_END) / LOOK_DURATION;
      const amount = Math.sin(t * Math.PI);
      pose.rotation.x = -LOOK_ANGLE * amount;
    }
    // After LOOK_END: stays at the Home Pose until CreatureBrain switches instinct.

    return pose;
  }
}
