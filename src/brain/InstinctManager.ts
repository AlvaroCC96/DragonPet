import type { Instinct } from "./Instinct";

/**
 * Owns the registered instincts and picks the next one to run. Weighted by
 * priority * probability, and never picks the same instinct twice in a row.
 */
export class InstinctManager {
  private readonly instincts: Instinct[];

  constructor(instincts: Instinct[]) {
    if (instincts.length === 0) {
      throw new Error("InstinctManager requires at least one Instinct.");
    }
    this.instincts = instincts;
  }

  selectNext(previous: Instinct | null): Instinct {
    const candidates = this.instincts.filter((instinct) => instinct.id !== previous?.id);
    // Only happens if a single instinct is registered; repeating is unavoidable then.
    const pool = candidates.length > 0 ? candidates : this.instincts;
    return this.weightedRandomPick(pool);
  }

  private weightedRandomPick(pool: Instinct[]): Instinct {
    const weights = pool.map((instinct) => instinct.priority * instinct.probability);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight <= 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    let roll = Math.random() * totalWeight;
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return pool[i];
      }
    }

    return pool[pool.length - 1];
  }
}
