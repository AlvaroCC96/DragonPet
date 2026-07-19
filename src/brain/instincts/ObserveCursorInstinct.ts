import { Instinct } from "../Instinct";

/**
 * Represents the dragon noticing the cursor. Probability 0 — the normal
 * random cycle never picks it; it's only ever activated directly via
 * CreatureBrain.triggerInstinct(), by CursorAwareness. `direction` is set by
 * whoever triggers it, just before triggering, to say which way to glance
 * (-1 = left, 1 = right); AnimationController and CreatureBrain never read it.
 */
export class ObserveCursorInstinct extends Instinct {
  direction = 0;

  constructor() {
    super({
      id: "ObserveCursor",
      priority: 1,
      probability: 0,
      minDuration: 1.5,
      maxDuration: 2.5,
    });
  }

  execute(): void {
    // No side effects here — the matching AnimationAction reads `direction` directly.
  }
}
