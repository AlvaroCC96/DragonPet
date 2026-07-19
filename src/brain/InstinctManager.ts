import type { Goal } from "../goals/Goal";
import type { CreatureState } from "../state/CreatureState";
import type { Instinct } from "./Instinct";

/**
 * Owns the registered instincts and picks the next one to run. First narrows
 * to whichever instincts support the brain's current Goal (falling back to
 * the full repertoire if nothing yet does, so the creature is never stuck),
 * then — within that pool — weighs by priority(state) * probability, never
 * picks the same instinct twice in a row, and respects each instinct's own
 * cooldown so the creature doesn't feel like a repetitive loop. Also rolls a
 * fresh random intensity for whichever instinct it picks, if it defines one.
 */
export class InstinctManager {
  private readonly instincts: Instinct[];
  private readonly lastActivatedAt = new Map<string, number>();

  constructor(instincts: Instinct[]) {
    if (instincts.length === 0) {
      throw new Error("InstinctManager requires at least one Instinct.");
    }
    this.instincts = instincts;
  }

  selectNext(previous: Instinct | null, goal: Goal, state: CreatureState): Instinct {
    const supportingGoal = this.instincts.filter((instinct) => instinct.supportsGoal(goal.type));
    // Falls back to the full repertoire if nothing (yet) supports this Goal,
    // so the creature is never left with nothing to do.
    const candidates = supportingGoal.length > 0 ? supportingGoal : this.instincts;

    const eligible = candidates.filter(
      (instinct) => instinct.id !== previous?.id && !this.isOnCooldown(instinct),
    );
    // Falls back to ignoring cooldowns (but still avoiding an immediate repeat) if
    // everything else is cooling down, so the creature is never stuck idle.
    const withoutRepeat = candidates.filter((instinct) => instinct.id !== previous?.id);
    const pool = eligible.length > 0 ? eligible : withoutRepeat.length > 0 ? withoutRepeat : candidates;

    const chosen = this.weightedRandomPick(pool, state);
    chosen.rollIntensity();
    this.lastActivatedAt.set(chosen.id, Date.now());
    return chosen;
  }

  private isOnCooldown(instinct: Instinct): boolean {
    if (instinct.cooldown <= 0) return false;
    const lastActivated = this.lastActivatedAt.get(instinct.id);
    if (lastActivated === undefined) return false;
    return Date.now() - lastActivated < instinct.cooldown * 1000;
  }

  private weightedRandomPick(pool: Instinct[], state: CreatureState): Instinct {
    const weights = pool.map((instinct) => instinct.priority(state) * instinct.probability);
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
