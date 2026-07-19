export interface AnimationTargetPose {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

/** Anything with a mutable position/rotation the controller can ease toward.
 * A THREE.Group satisfies this structurally — this file never imports "three". */
export interface AnimatableTarget {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export function createNeutralPose(): AnimationTargetPose {
  return {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };
}

/**
 * A translatable unit of visible behavior. Given how long it has been
 * active, returns the pose the model should ease toward. Knows nothing
 * about React, the CreatureBrain, or any specific 3D library.
 */
export abstract class AnimationAction {
  abstract readonly id: string;
  abstract getTargetPose(elapsedTime: number, actionElapsed: number): AnimationTargetPose;
}
