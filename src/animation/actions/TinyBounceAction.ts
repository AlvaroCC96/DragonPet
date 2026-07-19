import { tinyBounceInstinct } from "../../brain/instincts";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const DURATION = 1.2;

/**
 * A tiny, playful hop, then back to the Home Pose. Reads `height` from the
 * shared TinyBounceInstinct singleton, rolled fresh each occurrence.
 */
export class TinyBounceAction extends AnimationAction {
  readonly id = "TinyBounce";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to the Home Pose by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createHomePose();
    pose.position.y = tinyBounceInstinct.height * amount;
    return pose;
  }
}
