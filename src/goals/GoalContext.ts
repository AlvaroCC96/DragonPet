import type { Instinct } from "../brain/Instinct";
import type { DragonInteractionState } from "../interaction/DragonInteractionState";
import type { NavigationState } from "../navigation/NavigationState";
import type { CreatureState } from "../state/CreatureState";

/**
 * Everything GoalEvaluator needs to decide the current Goal, gathered by
 * whoever calls it (CreatureBrain) so the evaluator itself never has to
 * reach into CreatureState, NavigationState, or anything else directly.
 */
export interface GoalContext {
  readonly creatureState: CreatureState;
  readonly navigationState: NavigationState;
  readonly interactionState: DragonInteractionState;
  readonly currentInstinct: Instinct | null;
  /** Seconds since the last externally-triggered interaction (click/hover/drag). */
  readonly secondsSinceLastInteraction: number;
}
