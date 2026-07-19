import { navigationState } from "../../navigation/NavigationState";
import type { DragonPose } from "../../pose/DragonPose";
import { createHomePose } from "../../pose/PoseUtils";
import { AnimationAction } from "../AnimationAction";

/**
 * The subtle lean while the window travels toward a destination on its own
 * (exploring, returning home). The window itself carries position —
 * DesktopWindowManager, via NavigationController — so this only supplies
 * rotation. Not instinct-driven: NavigationController activates it directly
 * via AnimationController.setOverrideAction() for as long as the trip lasts.
 */
export class WalkAction extends AnimationAction {
  readonly id = "Walk";

  getTargetPose(): DragonPose {
    const pose = createHomePose();
    pose.rotation.z = navigationState.pose.tilt;
    return pose;
  }
}

// Shared singleton: NavigationController passes this same instance to
// AnimationController.setOverrideAction().
export const walkAction = new WalkAction();
