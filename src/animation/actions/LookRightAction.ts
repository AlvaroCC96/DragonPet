import { AnimationAction, createNeutralPose, type AnimationTargetPose } from "../AnimationAction";

const TURN_DURATION = 2.5;
const LOOK_ANGLE = 0.12;

/** Slowly turns the head/model to the right, then eases back to center. */
export class LookRightAction extends AnimationAction {
  readonly id = "LookRight";

  getTargetPose(_elapsedTime: number, actionElapsed: number): AnimationTargetPose {
    const t = Math.min(actionElapsed / TURN_DURATION, 1);
    // Eases in, peaks at the midpoint, eases back to center by the end.
    const amount = Math.sin(t * Math.PI);

    const pose = createNeutralPose();
    pose.rotation.y = LOOK_ANGLE * amount;
    return pose;
  }
}
