import type { CreatureState } from "../../state/CreatureState";
import { NeedType } from "../../state/NeedType";
import { Instinct } from "../Instinct";

const MIN_HEIGHT = 0.03;
const MAX_HEIGHT = 0.06;

/** A tiny, playful hop. Rolls a fresh height each time it runs. */
export class TinyBounceInstinct extends Instinct {
  /** World units; how high this particular occurrence hops. */
  height = 0;

  constructor() {
    super({
      id: "TinyBounce",
      priority: 1,
      probability: 0.12,
      minDuration: 1,
      maxDuration: 1.5,
      cooldown: 8,
    });
  }

  execute(): void {
    // No side effects here — TinyBounceAction reads `height` directly.
  }

  rollIntensity(): void {
    this.height = MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT);
  }

  /** The more playful the dragon is, the more it wants to bounce around. */
  priority(state: CreatureState): number {
    const playfulness = state.getNormalizedNeedValue(NeedType.Playfulness);
    return this.basePriority * (1 + playfulness * 3);
  }
}
