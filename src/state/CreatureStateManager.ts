import type { CreatureBrain } from "../brain/CreatureBrain";
import { celebrateInstinct } from "../brain/instincts";
import { DragonConfig } from "../config/DragonConfig";
import type { CreatureState } from "./CreatureState";
import { NeedType } from "./NeedType";

// How often Needs are updated. Biological drift doesn't need frame-rate precision.
const TICK_INTERVAL_MS = 1000;

/**
 * Owns the ticking that drives CreatureState's Needs over time — the only
 * thing that ever mutates them. Reads CreatureBrain's current/changing
 * instinct only to decide WHICH drift applies right now (e.g. Curiosity
 * only rises while idle); it never tells the brain what to do, and the
 * brain never reaches into this — it only ever reads CreatureState itself.
 */
export class CreatureStateManager {
  private readonly state: CreatureState;
  private readonly brain: CreatureBrain;
  private unsubscribe: (() => void) | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastTickAt = 0;

  constructor(state: CreatureState, brain: CreatureBrain) {
    this.state = state;
    this.brain = brain;
  }

  start(): void {
    this.unsubscribe?.();
    this.unsubscribe = this.brain.onInstinctChange((instinct) => {
      // A positive interaction: being celebrated with (clicked). Builds trust
      // and takes the edge off "wanting to play".
      if (instinct === celebrateInstinct) {
        const trust = this.state.getNeed(NeedType.Trust);
        trust.increase(trust.increaseRate);

        const playfulness = this.state.getNeed(NeedType.Playfulness);
        playfulness.decrease(playfulness.decreaseRate);
      }
    });

    this.lastTickAt = Date.now();
    this.tick();
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private tick(): void {
    const now = Date.now();
    const deltaSeconds = (now - this.lastTickAt) / 1000;
    this.lastTickAt = now;

    const idle = this.isCurrentlyIdle();

    const energy = this.state.getNeed(NeedType.Energy);
    energy.decrease(energy.decreaseRate * deltaSeconds);

    const sleepiness = this.state.getNeed(NeedType.Sleepiness);
    sleepiness.increase(sleepiness.increaseRate * deltaSeconds);

    // Curiosity builds up while the dragon stays still, and settles back down once it's busy.
    const curiosity = this.state.getNeed(NeedType.Curiosity);
    if (idle) {
      curiosity.increase(curiosity.increaseRate * deltaSeconds);
    } else {
      curiosity.decrease(curiosity.decreaseRate * deltaSeconds);
    }

    // Playfulness builds up over time; interacting with the dragon relieves it (see start()).
    const playfulness = this.state.getNeed(NeedType.Playfulness);
    playfulness.increase(playfulness.increaseRate * deltaSeconds);

    if (DragonConfig.debugNeedsLogging) {
      this.logNeeds();
    }

    this.timeoutId = setTimeout(() => this.tick(), TICK_INTERVAL_MS);
  }

  private isCurrentlyIdle(): boolean {
    const current = this.brain.getCurrentInstinct();
    return current?.id === "Breathe" || current?.id === "StayStill";
  }

  private logNeeds(): void {
    console.table(
      this.state.getAllNeeds().map((need) => ({
        Need: need.type,
        Value: Math.round(need.getValue()),
        Min: need.min,
        Max: need.max,
      })),
    );
  }
}
