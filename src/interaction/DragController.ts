import { dragAction } from "../animation/actions/DragAction";
import type { AnimationController } from "../animation/AnimationController";
import type { CreatureBrain } from "../brain/CreatureBrain";
import { dropSequenceInstinct } from "../brain/instincts";
import { DragonConfig } from "../config/DragonConfig";
import { desktopWindowManager } from "../window/DesktopWindowManager";
import { DragonInteractionState, dragonInteractionState } from "./DragonInteractionState";

interface ScreenPoint {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function damp(current: number, target: number, lambda: number, deltaTime: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}

/**
 * Detects a press-hold-move-release gesture on the dragon and turns it into
 * a live drag — of the whole OS window, not the 3D model. While held, it
 * eases the window's position toward wherever the cursor has carried it
 * (via DesktopWindowManager, the only class allowed to talk to Tauri) and
 * hands the model's subtle lean/tilt to AnimationController via the
 * existing override action. CreatureBrain is paused so it doesn't fight it
 * in the background. Never resizes or repositions the model directly, and
 * never reaches past DesktopWindowManager's API to touch the window itself.
 */
export class DragController {
  private readonly brain: CreatureBrain;
  private readonly animationController: AnimationController;

  private pendingDragStart = false;
  private dragStartPending = false;
  private isDragging = false;
  private dragStartScreen: ScreenPoint = { x: 0, y: 0 };
  private dragStartWindow: ScreenPoint = { x: 0, y: 0 };
  private targetWindow: ScreenPoint = { x: 0, y: 0 };
  private currentWindow: ScreenPoint = { x: 0, y: 0 };
  private lastCurrentX = 0;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.isDragging) return;

    this.pendingDragStart = true;
    this.dragStartScreen = { x: event.screenX, y: event.screenY };
    (event.target as Element | null)?.setPointerCapture?.(event.pointerId);
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.pendingDragStart && !this.isDragging && !this.dragStartPending) {
      const dx = event.screenX - this.dragStartScreen.x;
      const dy = event.screenY - this.dragStartScreen.y;
      if (Math.hypot(dx, dy) >= DragonConfig.dragThresholdPx) {
        this.dragStartPending = true;
        void this.beginDrag();
      }
    }

    if (this.isDragging) {
      this.targetWindow = {
        x: this.dragStartWindow.x + (event.screenX - this.dragStartScreen.x),
        y: this.dragStartWindow.y + (event.screenY - this.dragStartScreen.y),
      };
    }
  };

  private readonly handlePointerUp = (): void => {
    this.pendingDragStart = false;
    this.dragStartPending = false;
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

  private async beginDrag(): Promise<void> {
    const startWindow = await desktopWindowManager.getWindowPosition();

    // The gesture may have already ended (a very quick click) while this was in flight.
    if (!this.dragStartPending) return;
    this.dragStartPending = false;

    this.isDragging = true;
    this.dragStartWindow = startWindow;
    this.currentWindow = { ...startWindow };
    this.targetWindow = { ...startWindow };
    this.lastCurrentX = startWindow.x;

    dragonInteractionState.set(DragonInteractionState.BeingHeld);
    this.brain.pause();
    this.animationController.setOverrideAction(dragAction);

    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.stepWindowFollow);
  }

  private endDrag(): void {
    this.isDragging = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.animationController.setOverrideAction(null);
    dragonInteractionState.dragPose.tilt = 0;
    dragonInteractionState.set(DragonInteractionState.Idle);
    this.brain.resume();
    this.brain.triggerInstinct(dropSequenceInstinct);
  }

  private readonly stepWindowFollow = (now: number): void => {
    if (!this.isDragging) return;

    const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    this.currentWindow = {
      x: damp(this.currentWindow.x, this.targetWindow.x, DragonConfig.dragSmoothing, deltaTime),
      y: damp(this.currentWindow.y, this.targetWindow.y, DragonConfig.dragSmoothing, deltaTime),
    };

    const tilt = clamp(
      (this.currentWindow.x - this.lastCurrentX) * DragonConfig.dragTiltSensitivity,
      -DragonConfig.maxDragTilt,
      DragonConfig.maxDragTilt,
    );
    this.lastCurrentX = this.currentWindow.x;
    dragonInteractionState.dragPose.tilt = tilt;

    void desktopWindowManager.moveWindow(this.currentWindow.x, this.currentWindow.y);

    this.animationFrameId = requestAnimationFrame(this.stepWindowFollow);
  };
}
