import { AnimationAction } from "../AnimationAction";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";

/** Completely neutral pose — the Home Pose itself, with no extra motion. */
export class StayStillAction extends AnimationAction {
  readonly id = "StayStill";

  getTargetPose(): DragonPose {
    return createHomePose();
  }
}
