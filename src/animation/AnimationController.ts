import type { CreatureBrain } from "../brain/CreatureBrain";
import type { Instinct } from "../brain/Instinct";
import type { DragonPose } from "../pose/DragonPose";
import { PoseInterpolator } from "../pose/PoseInterpolator";
import { AnimationAction } from "./AnimationAction";
import { defaultActions, idleAction } from "./actions";

/**
 * Translates whatever Instinct the CreatureBrain is currently running into
 * an AnimationAction, and asks a PoseInterpolator to ease toward that
 * action's target Pose every frame. Never decides anything itself, and
 * never touches Three.js or React — it only deals in Poses. The host
 * component reads the resulting Pose from `update()` and applies it.
 */
export class AnimationController {
  private readonly actions: Record<string, AnimationAction>;
  private readonly interpolator: PoseInterpolator;
  private currentAction: AnimationAction = idleAction;
  private actionStartedAt = 0;
  private pendingInstinct: Instinct | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(
    actions: Record<string, AnimationAction> = defaultActions,
    interpolator: PoseInterpolator = new PoseInterpolator(),
  ) {
    this.actions = actions;
    this.interpolator = interpolator;
  }

  /** Starts reacting to the brain's instinct changes. */
  bindBrain(brain: CreatureBrain): void {
    this.unsubscribe?.();
    this.unsubscribe = brain.onInstinctChange((instinct) => {
      this.pendingInstinct = instinct;
    });

    this.pendingInstinct = brain.getCurrentInstinct();
  }

  /** Stops reacting to the brain. Call on unmount. */
  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Advances the current action and the interpolator by one frame. Returns the resulting Pose. */
  update(elapsedTime: number, deltaTime: number): DragonPose {
    if (this.pendingInstinct) {
      this.applyInstinct(this.pendingInstinct, elapsedTime);
      this.pendingInstinct = null;
    }

    const actionElapsed = elapsedTime - this.actionStartedAt;
    const targetPose = this.currentAction.getTargetPose(elapsedTime, actionElapsed);
    this.interpolator.setTarget(targetPose);

    return this.interpolator.step(deltaTime);
  }

  private applyInstinct(instinct: Instinct, elapsedTime: number): void {
    const nextAction = this.actions[instinct.id] ?? idleAction;
    if (nextAction === this.currentAction) return;
    this.currentAction = nextAction;
    this.actionStartedAt = elapsedTime;
  }
}
