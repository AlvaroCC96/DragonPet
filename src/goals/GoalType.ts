/** The dragon's possible high-level intentions. Adding a new one: add a
 * case here, teach GoalEvaluator when to pick it, and have at least one
 * Instinct declare `supportsGoal` for it. */
export enum GoalType {
  Idle = "Idle",
  Explore = "Explore",
  Sleep = "Sleep",
  Play = "Play",
  Observe = "Observe",
}
