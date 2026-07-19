import { headTiltInstinct } from "../../brain/instincts";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const DURATION = 2.4;

/**
 * A curious head tilt to one side, then back to the Home Pose. Reads
 * `angle` from the shared HeadTiltInstinct singleton, rolled fresh each
 * occurrence (sign included, so the side varies too).
 */
export class HeadTiltAction extends AnimationAction {
  readonly id = "HeadTilt";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to center by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createHomePose();
    pose.rotation.z = headTiltInstinct.angle * amount;
    return pose;
  }
}
