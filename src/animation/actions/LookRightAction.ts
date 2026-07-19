import { AnimationAction } from "../AnimationAction";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";

const TURN_DURATION = 2.5;
const LOOK_ANGLE = 0.12;

/** Slightly turned pose to the right; eases back to the Home Pose by TURN_DURATION. */
export class LookRightAction extends AnimationAction {
  readonly id = "LookRight";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / TURN_DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to center by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createHomePose();
    pose.rotation.y = LOOK_ANGLE * amount;
    return pose;
  }
}
