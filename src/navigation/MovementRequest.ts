import type { NormalizedPoint } from "../config/DragonConfig";

export type EasingFunction = (t: number) => number;

export const linearEasing: EasingFunction = (t) => t;

export const easeInOutQuad: EasingFunction = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

/**
 * An abstract "go there" — the only vocabulary CreatureBrain (via its
 * Instincts) uses to ask for movement. `destination` is a normalized screen
 * fraction (same convention as DragonConfig.homePosition: 0 = left/top edge,
 * 1 = right/bottom edge), never a raw window pixel — whoever creates a
 * MovementRequest never needs to know the screen size. NavigationController
 * is the only thing that resolves it into an actual window position.
 */
export interface MovementRequest {
  destination: NormalizedPoint;
  /** Roughly pixels per second; NavigationController converts this to a travel duration. */
  speed: number;
  /** Shapes travel progress from 0 (start) to 1 (arrived). */
  easing: EasingFunction;
  /** Whether the model should lean toward the direction of travel while moving. */
  faceDirection: boolean;
}
