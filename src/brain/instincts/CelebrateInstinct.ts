import { Instinct } from "../Instinct";

/**
 * A small, friendly reaction to being clicked. Probability 0 — the normal
 * random cycle never picks it; it's only ever activated directly via
 * CreatureBrain.triggerInstinct(), by ClickInteraction.
 */
export class CelebrateInstinct extends Instinct {
  constructor() {
    super({
      id: "Celebrate",
      priority: 1,
      probability: 0,
      minDuration: 1.0,
      maxDuration: 1.4,
    });
  }

  execute(): void {
    // No side effects here — CelebrateAction supplies the pose.
  }
}
