import type { DragonPose } from "./DragonPose";
import { HOME_POSE } from "./DragonPose";

export function clonePose(pose: DragonPose): DragonPose {
  return {
    position: { ...pose.position },
    rotation: { ...pose.rotation },
    scale: { ...pose.scale },
  };
}

/** A fresh, mutable copy of the Home Pose — safe for actions to build on. */
export function createHomePose(): DragonPose {
  return clonePose(HOME_POSE);
}
