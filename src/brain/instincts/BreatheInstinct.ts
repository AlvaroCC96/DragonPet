import { Instinct } from "../Instinct";

/** The creature simply breathes. The most common, low-key instinct. */
export class BreatheInstinct extends Instinct {
  constructor() {
    super({
      id: "Breathe",
      priority: 1,
      probability: 0.4,
      minDuration: 4,
      maxDuration: 8,
    });
  }

  execute(): void {
    // No dedicated breathing animation yet — the existing Idle animation
    // already breathes on its own, so there's nothing to trigger here.
  }
}
