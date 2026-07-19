export interface InstinctOptions {
  id: string;
  priority: number;
  probability: number;
  minDuration: number;
  maxDuration: number;
}

/**
 * A natural action the creature can want to do (e.g. breathe, look left).
 * Instincts never touch Three.js or the model — they only describe intent
 * and hold whatever bookkeeping that intent needs. Something outside the
 * brain (an AnimationController, in a future sprint) decides how to render it.
 */
export abstract class Instinct {
  readonly id: string;
  readonly priority: number;
  readonly probability: number;
  readonly minDuration: number;
  readonly maxDuration: number;

  protected constructor(options: InstinctOptions) {
    this.id = options.id;
    this.priority = options.priority;
    this.probability = options.probability;
    this.minDuration = options.minDuration;
    this.maxDuration = options.maxDuration;
  }

  /** Called once when the brain activates this instinct. */
  abstract execute(): void;

  /** A random duration, in seconds, within this instinct's own bounds. */
  randomDuration(): number {
    return this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
  }
}
