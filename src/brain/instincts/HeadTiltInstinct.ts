import { Instinct } from "../Instinct";

const MIN_ANGLE_DEG = 8;
const MAX_ANGLE_DEG = 14;

/** A curious head tilt to one side. Rolls a fresh angle and side each time it runs. */
export class HeadTiltInstinct extends Instinct {
  /** Radians, signed: negative = tilt left, positive = tilt right. */
  angle = 0;

  constructor() {
    super({
      id: "HeadTilt",
      priority: 1,
      probability: 0.12,
      minDuration: 2,
      maxDuration: 3,
      cooldown: 12,
    });
  }

  execute(): void {
    // No side effects here — HeadTiltAction reads `angle` directly.
  }

  rollIntensity(): void {
    const degrees = MIN_ANGLE_DEG + Math.random() * (MAX_ANGLE_DEG - MIN_ANGLE_DEG);
    const side = Math.random() < 0.5 ? -1 : 1;
    this.angle = side * ((degrees * Math.PI) / 180);
  }
}
