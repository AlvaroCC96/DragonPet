import type { CreatureBrain } from "../brain/CreatureBrain";
import { celebrateInstinct } from "../brain/instincts";

// Minimum time between celebrations, so rapid/simultaneous clicks can't spam the brain.
const COOLDOWN_MS = 1500;

/**
 * Reacts to a click on the dragon by asking the brain to celebrate. Owns its
 * own cooldown so InteractionManager doesn't need to know about timing.
 */
export class ClickInteraction {
  private readonly brain: CreatureBrain;
  private lastTriggeredAt = -Infinity;

  constructor(brain: CreatureBrain) {
    this.brain = brain;
  }

  handleClick(): void {
    const now = Date.now();
    if (now - this.lastTriggeredAt < COOLDOWN_MS) return;

    this.lastTriggeredAt = now;
    this.brain.triggerInstinct(celebrateInstinct);
  }
}
