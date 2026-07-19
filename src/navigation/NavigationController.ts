import { walkAction } from "../animation/actions/WalkAction";
import type { AnimationController } from "../animation/AnimationController";
import { DragonConfig } from "../config/DragonConfig";
import { homePositionManager, type HomePositionManager } from "../layout/HomePositionManager";
import { desktopWindowManager, type DesktopWindowManager, type WindowPosition } from "../window/DesktopWindowManager";
import { easeInOutQuad, type MovementRequest } from "./MovementRequest";
import { NavigationState, navigationState } from "./NavigationState";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Translates a MovementRequest — an abstract "go there" — into an actual
 * eased window animation over time, via DesktopWindowManager, and reports
 * when it's done. The only class authorized to move the window on its own
 * initiative (as opposed to DragController, which moves it in direct
 * response to the user — the two share DesktopWindowManager but never know
 * about each other). While moving, hands the model's travel lean to
 * AnimationController via the same override mechanism dragging uses.
 */
export class NavigationController {
  private readonly windowManager: DesktopWindowManager;
  private readonly homeManager: HomePositionManager;
  private animationController: AnimationController | null = null;
  private animationFrameId: number | null = null;
  private lastX = 0;

  constructor(windowManager: DesktopWindowManager, homeManager: HomePositionManager) {
    this.windowManager = windowManager;
    this.homeManager = homeManager;
  }

  /** Connects this to the current AnimationController so travel can drive the lean. */
  bindAnimationController(controller: AnimationController | null): void {
    this.animationController = controller;
  }

  getState(): NavigationState {
    return navigationState.get();
  }

  /** Moves the window home. A convenience wrapper — the exact reuse case Home Zone calls for. */
  async returnHome(speed: number = DragonConfig.walkSpeed): Promise<void> {
    await this.moveTo({
      destination: { ...DragonConfig.homePosition },
      speed,
      easing: easeInOutQuad,
      faceDirection: true,
    });
  }

  /** Smoothly moves the window to the request's destination. Resolves once arrived. */
  async moveTo(request: MovementRequest): Promise<void> {
    this.cancelMovement();

    const [startPosition, targetPosition] = await Promise.all([
      this.windowManager.getWindowPosition(),
      this.homeManager.resolveScreenPosition(request.destination),
    ]);

    navigationState.set(NavigationState.Moving);
    if (request.faceDirection) {
      this.animationController?.setOverrideAction(walkAction);
    }

    const distance = Math.hypot(targetPosition.x - startPosition.x, targetPosition.y - startPosition.y);
    const duration = request.speed > 0 ? distance / request.speed : 0;

    return new Promise((resolve) => {
      const startTime = performance.now();
      this.lastX = startPosition.x;

      const step = (now: number): void => {
        const elapsed = (now - startTime) / 1000;
        const t = duration > 0 ? Math.min(elapsed / duration, 1) : 1;
        const eased = request.easing(t);
        const position = this.interpolate(startPosition, targetPosition, eased);

        if (request.faceDirection) {
          navigationState.pose.tilt = clamp(
            (position.x - this.lastX) * DragonConfig.navigationTiltSensitivity,
            -DragonConfig.maxNavigationTilt,
            DragonConfig.maxNavigationTilt,
          );
        }
        this.lastX = position.x;

        void this.windowManager.moveWindow(position.x, position.y);

        if (t < 1) {
          this.animationFrameId = requestAnimationFrame(step);
        } else {
          this.finishMovement();
          resolve();
        }
      };

      this.animationFrameId = requestAnimationFrame(step);
    });
  }

  private interpolate(start: WindowPosition, target: WindowPosition, t: number): WindowPosition {
    return {
      x: start.x + (target.x - start.x) * t,
      y: start.y + (target.y - start.y) * t,
    };
  }

  private finishMovement(): void {
    this.animationFrameId = null;
    navigationState.set(NavigationState.Idle);
    navigationState.pose.tilt = 0;
    this.animationController?.setOverrideAction(null);
  }

  private cancelMovement(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

// Shared singleton, paired with the shared DesktopWindowManager/HomePositionManager
// instances. Dragon.tsx binds the current AnimationController to it on mount.
export const navigationController = new NavigationController(desktopWindowManager, homePositionManager);
