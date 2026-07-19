import { Instinct } from "../Instinct";

const MIN_ANGLE_DEG = 6;
const MAX_ANGLE_DEG = 10;

/** A brief, curious glance upward. Rolls a fresh angle each time it runs. */
export class LookUpInstinct extends Instinct {
  /** Radians; how far up this particular occurrence looks. */
  angle = 0;

  constructor() {
    super({
      id: "LookUp",
      priority: 1,
      probability: 0.12,
      minDuration: 2,
      maxDuration: 3,
      cooldown: 10,
    });
  }

  execute(): void {
    // No side effects here — LookUpAction reads `angle` directly.
  }

  rollIntensity(): void {
    const degrees = MIN_ANGLE_DEG + Math.random() * (MAX_ANGLE_DEG - MIN_ANGLE_DEG);
    this.angle = (degrees * Math.PI) / 180;
  }
}
