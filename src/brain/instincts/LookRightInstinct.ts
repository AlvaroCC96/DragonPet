import { Instinct } from "../Instinct";

/** The creature slowly looks to the right. */
export class LookRightInstinct extends Instinct {
  constructor() {
    super({
      id: "LookRight",
      priority: 1,
      probability: 0.15,
      minDuration: 2,
      maxDuration: 3,
    });
  }

  execute(): void {
    // No dedicated look-right animation yet — reuses the existing Idle animation.
  }
}
