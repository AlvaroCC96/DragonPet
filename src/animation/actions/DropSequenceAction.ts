import { DragonConfig } from "../../config/DragonConfig";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const FALL_END = DragonConfig.fallDuration;
const BOUNCE_END = FALL_END + DragonConfig.bounceDuration;
const HOME_END = BOUNCE_END + DragonConfig.returnDuration;
const LOOK_END = HOME_END + DragonConfig.lookDuration;

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
      const t = actionElapsed / DragonConfig.fallDuration;
      pose.position.y = -DragonConfig.fallDepth * t;
      pose.scale.y = 1 - DragonConfig.squashAmount * t;
      pose.scale.x = 1 + DragonConfig.squashAmount * 0.5 * t;
      pose.scale.z = 1 + DragonConfig.squashAmount * 0.5 * t;
    } else if (actionElapsed < BOUNCE_END) {
      const t = (actionElapsed - FALL_END) / DragonConfig.bounceDuration;
      const amount = Math.sin(t * Math.PI);
      pose.position.y = -DragonConfig.fallDepth * (1 - t) + DragonConfig.bounceHeight * amount;
      pose.scale.y = 1 - DragonConfig.squashAmount * (1 - t) * 0.5;
    } else if (actionElapsed < HOME_END) {
      // Resting at the Home Pose for a beat before the look.
    } else if (actionElapsed < LOOK_END) {
      const t = (actionElapsed - HOME_END) / DragonConfig.lookDuration;
      const amount = Math.sin(t * Math.PI);
      pose.rotation.x = -DragonConfig.lookAngle * amount;
    }
    // After LOOK_END: stays at the Home Pose until CreatureBrain switches instinct.

    return pose;
  }
}
