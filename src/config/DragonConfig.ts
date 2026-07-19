export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface EdgeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Every tunable "feel" parameter for the dragon lives here — scale, timing,
 * distances, speeds, and how its window is sized/placed. Nothing about how
 * the dragon looks or moves should be a magic number scattered across
 * components/actions; change it here instead.
 */
export const DragonConfig = {
  // --- Model transform (applied on top of the GLB, never edits the file) ---
  /** The model's largest dimension, in world units, after auto-centering. */
  dragonBaseSize: 2.2,
  /** Extra uniform scale multiplier applied on top of that (~20% smaller). */
  dragonScale: 0.8,
  /** One-time rotation correction (radians) to straighten the model's built-in tilt. */
  rotationCorrection: { x: 0, y: 0, z: -0.03 },

  // --- Window (the window is what lives on the desktop now, not the model) ---
  /** How many screen pixels one world unit maps to, used to size the window
   * around the dragon — there's no fixed window size otherwise. */
  pixelsPerWorldUnit: 150,
  /** Extra room around the dragon's rendered size, in pixels, so future
   * animations (wings, tail) have room without clipping. */
  windowPadding: { top: 40, bottom: 20, left: 40, right: 40 } as EdgeInsets,
  /** Where the window sits by default, normalized to the screen: 0 = left/top
   * edge, 1 = right/bottom edge. Bottom-right-ish, like a favorite spot. */
  homePosition: { x: 1, y: 1 } as NormalizedPoint,

  // --- Drag (moves the whole window now, not the model within it) ---
  /** Minimum pointer movement, in pixels, before a press-and-hold becomes a drag. */
  dragThresholdPx: 6,
  /** How quickly the window (and local poses in general) ease toward their target. */
  dragSmoothing: 10,
  /** How much the dragon banks in response to window drag velocity, and its cap (radians). */
  dragTiltSensitivity: 0.015,
  maxDragTilt: 0.25,

  // --- Autonomous navigation (NavigationController) ---
  /** How fast the window travels during autonomous movement, in pixels/second. */
  walkSpeed: 180,
  /** How far from home (normalized, same scale as homePosition) ExploreNearbyInstinct
   * may wander before turning back. */
  exploreRadius: 0.15,
  /** How long to linger at the destination before walking back home, in seconds. */
  exploreObserveDuration: 2,
  /** How much the dragon leans in response to travel velocity, and its cap (radians). */
  navigationTiltSensitivity: 0.02,
  maxNavigationTilt: 0.2,

  // --- Drop sequence (fall / bounce / settle / look) ---
  fallDuration: 0.2,
  fallDepth: 0.05,
  bounceDuration: 0.35,
  bounceHeight: 0.03,
  squashAmount: 0.08,
  returnDuration: 0.25,
  lookDuration: 0.6,
  lookAngle: 0.1,

  // --- Idle breathing/sway ---
  idleBreathingSpeed: 1.4,
  idleBreathingAmplitude: 0.02,
  idleSwaySpeed: 0.55,
  idleSwayAmplitude: 0.012,

  // --- CreatureState debugging ---
  /** Logs a table of current Need values to the console on every tick.
   * No dedicated dev panel yet — this is the simple stand-in for now. */
  debugNeedsLogging: true,
} as const;
