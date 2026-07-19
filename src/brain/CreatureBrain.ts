import { creatureState, type CreatureState } from "../state/CreatureState";
import type { Instinct } from "./Instinct";
import { InstinctManager } from "./InstinctManager";
import { defaultInstincts } from "./instincts";

type InstinctListener = (instinct: Instinct) => void;

/**
 * The creature's decision-making loop: picks an Instinct, runs it for a
 * while, then picks another. Deliberately knows nothing about Three.js or
 * the model — it only decides WHAT the creature wants to do, weighing each
 * candidate's `priority(state)` against how the creature currently feels
 * (CreatureState). It only ever reads that state, never mutates it — only
 * CreatureStateManager does that. Anything that wants to react to a
 * decision (an AnimationController) subscribes via `onInstinctChange`
 * instead of the brain reaching out to render anything.
 */
export class CreatureBrain {
  private readonly manager: InstinctManager;
  private readonly state: CreatureState;
  private readonly listeners = new Set<InstinctListener>();
  private currentInstinct: Instinct | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private paused = false;

  constructor(instincts: Instinct[] = defaultInstincts, state: CreatureState = creatureState) {
    this.manager = new InstinctManager(instincts);
    this.state = state;
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
   * knowing anything about them.
   */
  triggerInstinct(instinct: Instinct): void {
    if (!this.running) return;
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

  private tick(): void {
    this.timeoutId = null;
    if (!this.running || this.paused) return;
    this.activate(this.manager.selectNext(this.currentInstinct, this.state));
  }

  private activate(instinct: Instinct): void {
    this.currentInstinct = instinct;
    instinct.execute();
    this.listeners.forEach((listener) => listener(instinct));

    const waitMs = instinct.randomDuration() * 1000;
    this.timeoutId = setTimeout(() => this.tick(), waitMs);
  }
}
