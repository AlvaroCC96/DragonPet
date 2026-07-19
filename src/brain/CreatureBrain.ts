import type { Instinct } from "./Instinct";
import { InstinctManager } from "./InstinctManager";
import { defaultInstincts } from "./instincts";

type InstinctListener = (instinct: Instinct) => void;

/**
 * The creature's decision-making loop: picks an Instinct, runs it for a
 * while, then picks another. Deliberately knows nothing about Three.js or
 * the model — it only decides WHAT the creature wants to do. Anything that
 * wants to react to that (an AnimationController, later) subscribes via
 * `onInstinctChange` instead of the brain reaching out to render anything.
 */
export class CreatureBrain {
  private readonly manager: InstinctManager;
  private readonly listeners = new Set<InstinctListener>();
  private currentInstinct: Instinct | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor(instincts: Instinct[] = defaultInstincts) {
    this.manager = new InstinctManager(instincts);
  }

  /** Starts the continuous think-act-wait loop. Safe to call once. */
  start(): void {
    if (this.running) return;
    this.running = true;
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

  private tick(): void {
    if (!this.running) return;

    const next = this.manager.selectNext(this.currentInstinct);
    this.currentInstinct = next;
    next.execute();
    this.listeners.forEach((listener) => listener(next));

    const waitMs = next.randomDuration() * 1000;
    this.timeoutId = setTimeout(() => this.tick(), waitMs);
  }
}
