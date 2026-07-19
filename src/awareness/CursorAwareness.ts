import type { CreatureBrain } from "../brain/CreatureBrain";
import { observeCursorInstinct } from "../brain/instincts";
import type { CursorTracker } from "../input/CursorTracker";

// How often to check the cursor; keeps reactions calm instead of jittery.
const CHECK_INTERVAL_MS = 400;
// Cursor must be within this many pixels of the window's center to be noticed.
const NOTICE_RADIUS_PX = 160;

/**
 * Interprets whether the cursor is close enough to the mascot to be
 * noticed. If so, asks the CreatureBrain to run ObserveCursorInstinct.
 * Doesn't know about Three.js, the AnimationController, or the dragon —
 * only about the tracker it reads from and the brain it can request from.
 */
export class CursorAwareness {
  private readonly tracker: CursorTracker;
  private readonly brain: CreatureBrain;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor(tracker: CursorTracker, brain: CreatureBrain) {
    this.tracker = tracker;
    this.brain = brain;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.check();
  }

  stop(): void {
    this.running = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private check(): void {
    if (!this.running) return;

    const alreadyObserving = this.brain.getCurrentInstinct()?.id === observeCursorInstinct.id;
    const position = this.tracker.getPosition();

    if (position && !alreadyObserving) {
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      const dx = position.x - halfWidth;
      const dy = position.y - halfHeight;

      if (Math.hypot(dx, dy) <= NOTICE_RADIUS_PX) {
        observeCursorInstinct.direction = Math.max(-1, Math.min(1, dx / halfWidth));
        this.brain.triggerInstinct(observeCursorInstinct);
      }
    }

    this.timeoutId = setTimeout(() => this.check(), CHECK_INTERVAL_MS);
  }
}
