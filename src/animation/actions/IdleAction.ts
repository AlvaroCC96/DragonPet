import { AnimationAction } from "../AnimationAction";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";

const BREATH_SPEED = 1.4;
const BREATH_AMPLITUDE = 0.02;
const SWAY_SPEED = 0.55;
const SWAY_AMPLITUDE = 0.012;
// Offsets the sway phase from the breath phase so they don't peak in sync.
const SWAY_PHASE = 1.3;

/** The existing gentle breathing + sway motion, layered on top of the Home Pose. */
export class IdleAction extends AnimationAction {
  readonly id = "Idle";

  getTargetPose(elapsedTime: number): DragonPose {
    const pose = createHomePose();
    pose.position.y = Math.sin(elapsedTime * BREATH_SPEED) * BREATH_AMPLITUDE;
    pose.rotation.z = Math.sin(elapsedTime * SWAY_SPEED + SWAY_PHASE) * SWAY_AMPLITUDE;
    return pose;
  }
}
