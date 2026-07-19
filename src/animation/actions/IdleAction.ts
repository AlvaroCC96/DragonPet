import { AnimationAction } from "../AnimationAction";
import { DragonConfig } from "../../config/DragonConfig";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";

// Offsets the sway phase from the breath phase so they don't peak in sync.
const SWAY_PHASE = 1.3;

/** The existing gentle breathing + sway motion, layered on top of the Home Pose. */
export class IdleAction extends AnimationAction {
  readonly id = "Idle";

  getTargetPose(elapsedTime: number): DragonPose {
    const pose = createHomePose();
    pose.position.y = Math.sin(elapsedTime * DragonConfig.idleBreathingSpeed) * DragonConfig.idleBreathingAmplitude;
    pose.rotation.z =
      Math.sin(elapsedTime * DragonConfig.idleSwaySpeed + SWAY_PHASE) * DragonConfig.idleSwayAmplitude;
    return pose;
  }
}
