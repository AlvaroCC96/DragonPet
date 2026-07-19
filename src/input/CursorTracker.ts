export interface CursorPosition {
  x: number;
  y: number;
}

/**
 * Tracks the cursor's position within the window. Single responsibility:
 * know where the cursor is right now. Doesn't know about Three.js, the
 * CreatureBrain, the AnimationController, or the dragon.
 */
export class CursorTracker {
  private position: CursorPosition | null = null;

  private readonly handlePointerMove = (event: PointerEvent): void => {
    this.position = { x: event.clientX, y: event.clientY };
  };

  private readonly handlePointerLeave = (): void => {
    this.position = null;
  };

  start(): void {
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerleave", this.handlePointerLeave);
  }

  stop(): void {
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerleave", this.handlePointerLeave);
    this.position = null;
  }

  /** Null when the cursor isn't over the window. */
  getPosition(): CursorPosition | null {
    return this.position;
  }
}
