import { Instinct } from "../Instinct";

/** The creature stays calm and still for a while. */
export class StayStillInstinct extends Instinct {
  constructor() {
    super({
      id: "StayStill",
      priority: 1,
      probability: 0.3,
      minDuration: 5,
      maxDuration: 8,
    });
  }

  execute(): void {
    // No dedicated "still" animation yet — reuses the existing Idle animation.
  }
}
