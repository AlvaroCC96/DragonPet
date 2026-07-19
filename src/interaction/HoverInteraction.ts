import type { CreatureBrain } from "../brain/CreatureBrain";
import { observeCursorInstinct } from "../brain/instincts";

// How long the cursor must stay near the dragon before it's "noticed".
const DWELL_THRESHOLD_MS = 600;
// Minimum time between hover reactions, so lingering nearby doesn't retrigger constantly.
const COOLDOWN_MS = 4000;

/**
 * Reacts when the cursor lingers near the dragon for a short while by
 * reusing ObserveCursorInstinct — a light glance, not a continuous follow.
 * Owns its own dwell-time and cooldown state so InteractionManager only
 * has to report "near or not", nothing more.
 */
export class HoverInteraction {
  private readonly brain: CreatureBrain;
  private hoverStartedAt: number | null = null;
  private lastTriggeredAt = -Infinity;

  constructor(brain: CreatureBrain) {
    this.brain = brain;
  }

  /** Call with whether the cursor is currently near the dragon, and its horizontal
   * direction relative to it (-1 = left, 1 = right), whenever that's checked. */
  setNear(isNear: boolean, directionX: number): void {
    if (!isNear) {
      this.hoverStartedAt = null;
      return;
    }

    const now = Date.now();
    if (this.hoverStartedAt === null) {
      this.hoverStartedAt = now;
    }

    const dwellTime = now - this.hoverStartedAt;
    const offCooldown = now - this.lastTriggeredAt >= COOLDOWN_MS;
    const alreadyObserving = this.brain.getCurrentInstinct()?.id === observeCursorInstinct.id;

    if (dwellTime >= DWELL_THRESHOLD_MS && offCooldown && !alreadyObserving) {
      observeCursorInstinct.direction = directionX;
      this.brain.triggerInstinct(observeCursorInstinct);
      this.lastTriggeredAt = now;
    }
  }
}
