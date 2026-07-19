import type { CreatureBrain } from "../brain/CreatureBrain";
import type { Instinct } from "../brain/Instinct";
import { type AnimatableTarget, AnimationAction } from "./AnimationAction";
import { defaultActions, idleAction } from "./actions";

// Exponential smoothing rate for easing toward the target pose; higher = catches up faster.
const POSE_DAMPING = 5;

function damp(current: number, target: number, lambda: number, deltaTime: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * deltaTime));
}

/**
 * Translates whatever Instinct the CreatureBrain is currently running into a
 * target pose, and eases the model toward it every frame. Never decides
 * anything itself — it only reacts to brain.onInstinctChange and to time.
 * Knows nothing about React (no hooks); the host component drives it by
 * calling `update()` from its own frame loop.
 */
export class AnimationController {
  private readonly target: AnimatableTarget;
  private readonly actions: Record<string, AnimationAction>;
  private currentAction: AnimationAction = idleAction;
  private actionStartedAt = 0;
  private pendingInstinct: Instinct | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(target: AnimatableTarget, actions: Record<string, AnimationAction> = defaultActions) {
    this.target = target;
    this.actions = actions;
  }

  /** Starts reacting to the brain's instinct changes. */
  bindBrain(brain: CreatureBrain): void {
    this.unsubscribe?.();
    this.unsubscribe = brain.onInstinctChange((instinct) => {
      this.pendingInstinct = instinct;
    });

    this.pendingInstinct = brain.getCurrentInstinct();
  }

  /** Stops reacting to the brain. Call on unmount to avoid touching a disposed target. */
  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Advances the current action and eases the target toward its pose. Call once per frame. */
  update(elapsedTime: number, deltaTime: number): void {
    if (this.pendingInstinct) {
      this.applyInstinct(this.pendingInstinct, elapsedTime);
      this.pendingInstinct = null;
    }

    const actionElapsed = elapsedTime - this.actionStartedAt;
    const pose = this.currentAction.getTargetPose(elapsedTime, actionElapsed);

    this.target.position.x = damp(this.target.position.x, pose.position.x, POSE_DAMPING, deltaTime);
    this.target.position.y = damp(this.target.position.y, pose.position.y, POSE_DAMPING, deltaTime);
    this.target.position.z = damp(this.target.position.z, pose.position.z, POSE_DAMPING, deltaTime);
    this.target.rotation.x = damp(this.target.rotation.x, pose.rotation.x, POSE_DAMPING, deltaTime);
    this.target.rotation.y = damp(this.target.rotation.y, pose.rotation.y, POSE_DAMPING, deltaTime);
    this.target.rotation.z = damp(this.target.rotation.z, pose.rotation.z, POSE_DAMPING, deltaTime);
  }

  private applyInstinct(instinct: Instinct, elapsedTime: number): void {
    const nextAction = this.actions[instinct.id] ?? idleAction;
    if (nextAction === this.currentAction) return;
    this.currentAction = nextAction;
    this.actionStartedAt = elapsedTime;
  }
}
