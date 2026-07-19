import type { NeedType } from "./NeedType";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface NeedOptions {
  type: NeedType;
  initialValue: number;
  min: number;
  max: number;
  /** How fast this need rises — per second during CreatureStateManager's
   * regular ticking, or per triggering event for needs that only move on
   * specific events (see each Need's actual usage in CreatureStateManager). */
  increaseRate: number;
  /** How fast this need falls — same units as `increaseRate`. */
  decreaseRate: number;
}

/**
 * A single biological need — e.g. how sleepy the dragon is right now. A
 * domain object, not a bare number: it owns its own bounds and the rates it
 * drifts at. Only CreatureStateManager ever calls increase()/decrease();
 * everything else (CreatureBrain's Instincts included) only reads it.
 */
export class Need {
  readonly type: NeedType;
  readonly min: number;
  readonly max: number;
  readonly increaseRate: number;
  readonly decreaseRate: number;
  private value: number;

  constructor(options: NeedOptions) {
    this.type = options.type;
    this.min = options.min;
    this.max = options.max;
    this.increaseRate = options.increaseRate;
    this.decreaseRate = options.decreaseRate;
    this.value = clamp(options.initialValue, options.min, options.max);
  }

  getValue(): number {
    return this.value;
  }

  /** This need's value rescaled to 0..1, regardless of its own min/max range. */
  getNormalized(): number {
    return this.max > this.min ? (this.value - this.min) / (this.max - this.min) : 0;
  }

  increase(amount: number): void {
    this.value = clamp(this.value + amount, this.min, this.max);
  }

  decrease(amount: number): void {
    this.value = clamp(this.value - amount, this.min, this.max);
  }
}
