import { lookUpInstinct } from "../../brain/instincts";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const DURATION = 2.2;

/**
 * A brief, curious glance upward, then back to the Home Pose. Reads `angle`
 * from the shared LookUpInstinct singleton, rolled fresh each occurrence.
 */
export class LookUpAction extends AnimationAction {
  readonly id = "LookUp";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to center by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createHomePose();
    pose.rotation.x = -lookUpInstinct.angle * amount;
    return pose;
  }
}
