import { observeCursorInstinct } from "../../brain/instincts";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const GLANCE_DURATION = 2;
const MAX_ANGLE = 0.15;

/**
 * A brief, bounded glance toward wherever the cursor was noticed, then back
 * to the Home Pose. Reads `direction` from the shared ObserveCursorInstinct
 * singleton — the only place this action reaches outside the Pose system.
 */
export class ObserveCursorAction extends AnimationAction {
  readonly id = "ObserveCursor";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / GLANCE_DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to center by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createHomePose();
    pose.rotation.y = MAX_ANGLE * observeCursorInstinct.direction * amount;
    return pose;
  }
}
