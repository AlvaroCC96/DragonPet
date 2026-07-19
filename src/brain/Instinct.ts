export interface InstinctOptions {
  id: string;
  priority: number;
  probability: number;
  minDuration: number;
  maxDuration: number;
  /** Minimum seconds before this instinct can be selected again after it last
   * ran. Defaults to 0 (no extra restriction beyond never repeating immediately). */
  cooldown?: number;
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
  readonly cooldown: number;

  protected constructor(options: InstinctOptions) {
    this.id = options.id;
    this.priority = options.priority;
    this.probability = options.probability;
    this.minDuration = options.minDuration;
    this.maxDuration = options.maxDuration;
    this.cooldown = options.cooldown ?? 0;
  }

  /** Called once when the brain activates this instinct. */
  abstract execute(): void;

  /**
   * Optional hook: called each time InstinctManager picks this instinct, so
   * it can roll a fresh random intensity (angle, height, etc.) for this
   * particular occurrence. No-op by default — override only if the
   * instinct's matching AnimationAction needs per-activation variation.
   */
  rollIntensity(): void {}

  /** A random duration, in seconds, within this instinct's own bounds. */
  randomDuration(): number {
    return this.minDuration + Math.random() * (this.maxDuration - this.minDuration);
  }
}
