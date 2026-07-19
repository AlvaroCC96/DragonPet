import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

const CELEBRATE_DURATION = 1.2;
const BOUNCE_HEIGHT = 0.08;
const TILT_ANGLE = 0.1;

/** A small, friendly bounce + forward tilt — the dragon's reaction to being clicked. */
export class CelebrateAction extends AnimationAction {
  readonly id = "Celebrate";

  getTargetPose(_elapsedTime: number, actionElapsed: number): DragonPose {
    const t = Math.min(actionElapsed / CELEBRATE_DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to the Home Pose by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createHomePose();
    pose.position.y = BOUNCE_HEIGHT * amount;
    pose.rotation.x = -TILT_ANGLE * amount;
    return pose;
  }
}
