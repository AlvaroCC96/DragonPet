import { stretchInstinct } from "../../brain/instincts";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const DURATION = 3;
const BASE_TILT = 0.14;
const BASE_LIFT = 0.03;

/**
 * A small backward stretch, as if waking up, then back to the Home Pose.
 * Reads `intensity` from the shared StretchInstinct singleton, rolled fresh
 * each occurrence.
 */
export class StretchAction extends AnimationAction {
  readonly id = "Stretch";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to the Home Pose by the end.
    const amount = Math.sin(t * Math.PI) * stretchInstinct.intensity;

    const pose = createHomePose();
    pose.rotation.x = BASE_TILT * amount;
    pose.position.y = BASE_LIFT * amount;
    return pose;
  }
}
