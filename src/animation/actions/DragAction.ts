import { dragonInteractionState } from "../../interaction/DragonInteractionState";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

/**
 * The subtle lean the model shows while being carried — the window itself
 * (via DesktopWindowManager) is what actually moves across the desktop now.
 * Not instinct-driven at all — AnimationController activates this directly
 * via setOverrideAction() for as long as the drag lasts, bypassing the
 * brain entirely, since a drag's duration is however long the user holds it.
 */
export class DragAction extends AnimationAction {
  readonly id = "Drag";

  getTargetPose(): DragonPose {
    const pose = createHomePose();
    pose.rotation.z = dragonInteractionState.dragPose.tilt;
    return pose;
  }
}

// Shared singleton: DragController passes this same instance to
// AnimationController.setOverrideAction().
export const dragAction = new DragAction();
