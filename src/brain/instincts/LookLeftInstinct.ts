import { Instinct } from "../Instinct";

/** The creature slowly looks to the left. */
export class LookLeftInstinct extends Instinct {
  constructor() {
    super({
      id: "LookLeft",
      priority: 1,
      probability: 0.15,
      minDuration: 2,
      maxDuration: 3,
    });
  }

  execute(): void {
    // No dedicated look-left animation yet — reuses the existing Idle animation.
  }
}
