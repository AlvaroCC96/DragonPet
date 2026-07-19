export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

/**
 * The dragon's full spatial state: position, rotation, and scale. A plain
 * data structure with no dependency on Three.js or the GLB model — the
 * base unit every animation action and the interpolator work with.
 */
export interface DragonPose {
  position: Vector3Like;
  rotation: Vector3Like;
  scale: Vector3Like;
}

/**
 * The resting pose the dragon always eases back toward once an action ends.
 * Note scale's identity is 1, not 0 — unlike position/rotation.
 */
export const HOME_POSE: Readonly<DragonPose> = Object.freeze({
  position: Object.freeze({ x: 0, y: 0, z: 0 }),
  rotation: Object.freeze({ x: 0, y: 0, z: 0 }),
  scale: Object.freeze({ x: 1, y: 1, z: 1 }),
});
