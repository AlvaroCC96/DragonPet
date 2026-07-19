import { AnimationAction, createNeutralPose, type AnimationTargetPose } from "../AnimationAction";

/** Freezes the small idle movements — the controller eases smoothly into stillness. */
export class StayStillAction extends AnimationAction {
  readonly id = "StayStill";

  getTargetPose(): AnimationTargetPose {
    return createNeutralPose();
  }
}
