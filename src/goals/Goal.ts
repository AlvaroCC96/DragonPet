import type { GoalType } from "./GoalType";

/**
 * An intention — "I want to explore," not "walk to (x, y)." Never an
 * animation, a navigation instruction, or anything renderable.
 * InstinctManager is what turns this into a concrete Instinct to run.
 */
export interface Goal {
  readonly type: GoalType;
}

export function createGoal(type: GoalType): Goal {
  return { type };
}
