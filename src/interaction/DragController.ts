import { dragAction } from "../animation/actions/DragAction";
import type { AnimationController } from "../animation/AnimationController";
import type { CreatureBrain } from "../brain/CreatureBrain";
import { dropSequenceInstinct } from "../brain/instincts";
import { DragonInteractionState, dragonInteractionState } from "./DragonInteractionState";

// Cursor must be within this many pixels of the window's center to start a drag.
const NEAR_RADIUS_PX = 160;
// Minimum movement, in pixels, before a press-and-hold is treated as a drag (vs. a click).
const DRAG_THRESHOLD_PX = 6;
// Keeps the dragon from ever reaching the literal edge of the window while dragged.
const SOFT_LIMIT = 0.85;
// World-space range the dragon can be dragged across.
const DRAG_RANGE = 1.6;
const MAX_TILT = 0.25;
const TILT_SENSITIVITY = 4;

interface ScreenPoint {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Detects a press-hold-move-release gesture on the dragon and turns it into
 * a live drag: while held, it writes the target position/tilt to the shared
 * DragonInteractionState and hands rendering over to AnimationController via
 * a dedicated override action, pausing CreatureBrain so it doesn't fight it
 * in the background. Never touches the model or the PoseInterpolator
 * directly — everything visual still flows through AnimationController.
 */
export class DragController {
  private readonly brain: CreatureBrain;
  private readonly animationController: AnimationController;

  private pendingDragStart = false;
  private isDragging = false;
  private dragStartScreen: ScreenPoint = { x: 0, y: 0 };
  private lastTargetX = 0;

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.isDragging || !this.isNearDragon(event.clientX, event.clientY)) return;

    this.pendingDragStart = true;
    this.dragStartScreen = { x: event.clientX, y: event.clientY };
    (event.target as Element | null)?.setPointerCapture?.(event.pointerId);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.pendingDragStart && !this.isDragging) {
      const dx = event.clientX - this.dragStartScreen.x;
      const dy = event.clientY - this.dragStartScreen.y;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        this.beginDrag();
      }
    }

    if (this.isDragging) {
      this.updateDragPose(event.clientX, event.clientY);
    }
  };

  private readonly handlePointerUp = (): void => {
    this.pendingDragStart = false;
    if (this.isDragging) {
      this.endDrag();
    }
  };

  constructor(brain: CreatureBrain, animationController: AnimationController) {
    this.brain = brain;
    this.animationController = animationController;
  }

  start(): void {
    window.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
  }

  stop(): void {
    window.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    if (this.isDragging) {
      this.endDrag();
    }
  }

  private beginDrag(): void {
    this.pendingDragStart = false;
    this.isDragging = true;
    this.lastTargetX = dragonInteractionState.dragPose.x;

    dragonInteractionState.set(DragonInteractionState.BeingHeld);
    this.brain.pause();
    this.animationController.setOverrideAction(dragAction);
  }

  private endDrag(): void {
    this.isDragging = false;

    this.animationController.setOverrideAction(null);
    dragonInteractionState.set(DragonInteractionState.Idle);
    this.brain.resume();
    this.brain.triggerInstinct(dropSequenceInstinct);
  }

  private updateDragPose(clientX: number, clientY: number): void {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    const normalizedX = clamp((clientX - halfWidth) / halfWidth, -SOFT_LIMIT, SOFT_LIMIT);
    const normalizedY = clamp((halfHeight - clientY) / halfHeight, -SOFT_LIMIT, SOFT_LIMIT);

    const targetX = normalizedX * DRAG_RANGE;
    const targetY = normalizedY * DRAG_RANGE;
    const tilt = clamp((targetX - this.lastTargetX) * TILT_SENSITIVITY, -MAX_TILT, MAX_TILT);
    this.lastTargetX = targetX;

    dragonInteractionState.dragPose.x = targetX;
    dragonInteractionState.dragPose.y = targetY;
    dragonInteractionState.dragPose.tilt = tilt;
  }

  private isNearDragon(x: number, y: number): boolean {
    const dx = x - window.innerWidth / 2;
    const dy = y - window.innerHeight / 2;
    return Math.hypot(dx, dy) <= NEAR_RADIUS_PX;
  }
}
