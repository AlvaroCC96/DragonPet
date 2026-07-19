import type { CursorPosition, CursorTracker } from "../input/CursorTracker";
import type { ClickInteraction } from "./ClickInteraction";
import type { HoverInteraction } from "./HoverInteraction";

// How often to re-check hover proximity; keeps it calm, not per-pixel-jittery.
const CHECK_INTERVAL_MS = 200;
// Cursor must be within this many pixels of the window's center to count as "on the dragon".
const NEAR_RADIUS_PX = 160;

/**
 * Centralizes mouse interaction with the dragon: reads cursor position and
 * click events, works out whether they're relevant (near the dragon) and
 * which way, and hands the interpreted signal to the matching Interaction.
 * Doesn't know Three.js, and never talks to CreatureBrain directly —
 * ClickInteraction and HoverInteraction own that translation.
 */
export class InteractionManager {
  private readonly tracker: CursorTracker;
  private readonly click: ClickInteraction;
  private readonly hover: HoverInteraction;

  private readonly handlePointerDown = (event: MouseEvent): void => {
    if (this.isNearDragon({ x: event.clientX, y: event.clientY })) {
      this.click.handleClick();
    }
  };

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor(tracker: CursorTracker, click: ClickInteraction, hover: HoverInteraction) {
    this.tracker = tracker;
    this.click = click;
    this.hover = hover;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    window.addEventListener("pointerdown", this.handlePointerDown);
    this.checkHover();
  }

  stop(): void {
    this.running = false;
    window.removeEventListener("pointerdown", this.handlePointerDown);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private checkHover(): void {
    if (!this.running) return;

    const position = this.tracker.getPosition();
    if (position && this.isNearDragon(position)) {
      const halfWidth = window.innerWidth / 2;
      const directionX = Math.max(-1, Math.min(1, (position.x - halfWidth) / halfWidth));
      this.hover.setNear(true, directionX);
    } else {
      this.hover.setNear(false, 0);
    }

    this.timeoutId = setTimeout(() => this.checkHover(), CHECK_INTERVAL_MS);
  }

  private isNearDragon(position: CursorPosition): boolean {
    const dx = position.x - window.innerWidth / 2;
    const dy = position.y - window.innerHeight / 2;
    return Math.hypot(dx, dy) <= NEAR_RADIUS_PX;
  }
}
