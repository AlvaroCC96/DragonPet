import type { DragonPose } from "../pose/DragonPose";

/**
 * A translatable unit of visible behavior. Given how long it has been
 * active, describes the Pose the dragon should ease toward — it never
 * applies that pose itself. Knows nothing about React, the CreatureBrain,
 * or any specific 3D library; the PoseInterpolator owns all the smoothing.
 */
export abstract class AnimationAction {
  abstract readonly id: string;
  abstract getTargetPose(elapsedTime: number, actionElapsed: number): DragonPose;
}
