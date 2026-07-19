import { DragonInteractionState } from "../interaction/DragonInteractionState";
import { NavigationState } from "../navigation/NavigationState";
import { NeedType } from "../state/NeedType";
import { createGoal, type Goal } from "./Goal";
import type { GoalContext } from "./GoalContext";
import { GoalType } from "./GoalType";

const SLEEPINESS_THRESHOLD = 70;
const PLAYFULNESS_THRESHOLD = 65;
const CURIOSITY_THRESHOLD = 60;
const RECENT_INTERACTION_SECONDS = 8;

/**
 * The only class that decides the dragon's current Goal — the "what do I
 * want" layer above Instinct selection. Only ever reads the GoalContext
 * it's handed; never reaches into CreatureState/NavigationState/etc.
 * directly, never touches Three.js, never moves a window, never executes
 * anything. It only decides — InstinctManager is what turns a Goal into an
 * actual Instinct to run.
 */
export class GoalEvaluator {
  evaluate(context: GoalContext): Goal {
    const { creatureState, navigationState, interactionState, secondsSinceLastInteraction } = context;

    // Already physically engaged — don't layer a new goal on top of that.
    if (interactionState === DragonInteractionState.BeingHeld || navigationState === NavigationState.Moving) {
      return createGoal(GoalType.Idle);
    }

    // A recent, direct interaction takes priority: acknowledge the user first.
    if (secondsSinceLastInteraction < RECENT_INTERACTION_SECONDS) {
      return createGoal(GoalType.Observe);
    }

    if (creatureState.getNeedValue(NeedType.Sleepiness) > SLEEPINESS_THRESHOLD) {
      return createGoal(GoalType.Sleep);
    }

    if (creatureState.getNeedValue(NeedType.Playfulness) > PLAYFULNESS_THRESHOLD) {
      return createGoal(GoalType.Play);
    }

    if (creatureState.getNeedValue(NeedType.Curiosity) > CURIOSITY_THRESHOLD) {
      return createGoal(GoalType.Explore);
    }

    return createGoal(GoalType.Idle);
  }
}
