import { Instinct } from "../Instinct";

const MIN_INTENSITY = 0.85;
const MAX_INTENSITY = 1.15;

/** A small backward stretch, as if waking up. Rolls a fresh intensity each time it runs. */
export class StretchInstinct extends Instinct {
  /** Multiplier applied to the base stretch pose for this particular occurrence. */
  intensity = 1;

  constructor() {
    super({
      id: "Stretch",
      priority: 1,
      probability: 0.1,
      minDuration: 2.5,
      maxDuration: 3.5,
      cooldown: 15,
    });
  }

  execute(): void {
    // No side effects here — StretchAction reads `intensity` directly.
  }

  rollIntensity(): void {
    this.intensity = MIN_INTENSITY + Math.random() * (MAX_INTENSITY - MIN_INTENSITY);
  }
}
