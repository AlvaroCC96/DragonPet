import { DragonConfig } from "../config/DragonConfig";
import { GoalEvaluator } from "../goals/GoalEvaluator";
import type { Goal } from "../goals/Goal";
import type { GoalContext } from "../goals/GoalContext";
import { dragonInteractionState } from "../interaction/DragonInteractionState";
import { navigationState } from "../navigation/NavigationState";
import { creatureState, type CreatureState } from "../state/CreatureState";
import type { Instinct } from "./Instinct";
import { InstinctManager } from "./InstinctManager";
import { defaultInstincts } from "./instincts";

type InstinctListener = (instinct: Instinct) => void;

/**
 * The creature's decision-making loop, now two-staged: figure out WHAT it
 * wants (a Goal, via GoalEvaluator) before figuring out HOW (an Instinct,
 * via InstinctManager). Deliberately knows nothing about Three.js or the
 * model. Only ever reads CreatureState/NavigationState/DragonInteractionState
 * to build the GoalContext — never mutates any of them. Anything that wants
 * to react to a decision (an AnimationController) subscribes via
 * `onInstinctChange` instead of the brain reaching out to render anything.
 */
export class CreatureBrain {
  private readonly manager: InstinctManager;
  private readonly state: CreatureState;
  private readonly goalEvaluator: GoalEvaluator;
  private readonly listeners = new Set<InstinctListener>();
  private currentInstinct: Instinct | null = null;
  private currentGoal: Goal | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private paused = false;
  private lastInteractionAt = Date.now();

  constructor(
    instincts: Instinct[] = defaultInstincts,
    state: CreatureState = creatureState,
    goalEvaluator: GoalEvaluator = new GoalEvaluator(),
  ) {
    this.manager = new InstinctManager(instincts);
    this.state = state;
    this.goalEvaluator = goalEvaluator;
  }

  /** Starts the continuous think-act-wait loop. Safe to call once. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.tick();
  }

  /** Stops the loop. The brain can be restarted later with `start()`. */
  stop(): void {
    this.running = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  getCurrentInstinct(): Instinct | null {
    return this.currentInstinct;
  }

  getCurrentGoal(): Goal | null {
    return this.currentGoal;
  }

  /** Subscribe to instinct changes. Returns an unsubscribe function. */
  onInstinctChange(listener: InstinctListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Immediately activates the given instinct, interrupting whatever is
   * currently running. Normal autonomous selection resumes on its own once
   * it finishes — no separate "resume" step needed. Lets external perception
   * systems (e.g. CursorAwareness) make the creature react without the brain
   * knowing anything about them. Also counts as "an interaction" for
   * `getSecondsSinceLastInteraction()`, since every caller of this method
   * (ClickInteraction, HoverInteraction, DragController) represents one.
   */
  triggerInstinct(instinct: Instinct): void {
    if (!this.running) return;
    this.lastInteractionAt = Date.now();
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.activate(instinct);
  }

  /**
   * Stops picking new instincts. Whatever is currently running keeps going
   * to its own natural end — this only stops the *next* pick from happening,
   * so a physical interaction (e.g. being picked up) can take over rendering
   * without the brain fighting it in the background.
   */
  pause(): void {
    this.paused = true;
  }

  /** Resumes normal autonomous instinct selection after `pause()`. */
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    if (this.running && this.timeoutId === null) {
      this.tick();
    }
  }

  /** Seconds since the last externally-triggered interaction (click/hover/drag). */
  getSecondsSinceLastInteraction(): number {
    return (Date.now() - this.lastInteractionAt) / 1000;
  }

  private tick(): void {
    this.timeoutId = null;
    if (!this.running || this.paused) return;

    const goal = this.goalEvaluator.evaluate(this.buildGoalContext());
    const goalChanged = this.currentGoal === null || goal.type !== this.currentGoal.type;
    this.currentGoal = goal;

    const instinct = this.manager.selectNext(this.currentInstinct, goal, this.state);
    if (goalChanged) {
      this.logGoalChange(goal, instinct);
    }

    this.activate(instinct);
  }

  private buildGoalContext(): GoalContext {
    return {
      creatureState: this.state,
      navigationState: navigationState.get(),
      interactionState: dragonInteractionState.get(),
      currentInstinct: this.currentInstinct,
      secondsSinceLastInteraction: this.getSecondsSinceLastInteraction(),
    };
  }

  private logGoalChange(goal: Goal, instinct: Instinct): void {
    if (!DragonConfig.debugGoalLogging) return;
    const needs = Object.fromEntries(
      this.state.getAllNeeds().map((need) => [need.type, Math.round(need.getValue())]),
    );
    console.log(`[Goal] ${goal.type} -> ${instinct.id}`, needs);
  }

  private activate(instinct: Instinct): void {
    this.currentInstinct = instinct;
    instinct.execute();
    this.listeners.forEach((listener) => listener(instinct));

    const waitMs = instinct.randomDuration() * 1000;
    this.timeoutId = setTimeout(() => this.tick(), waitMs);
  }
}
