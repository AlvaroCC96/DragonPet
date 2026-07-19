import type { AnimationAction } from "../AnimationAction";
import { IdleAction } from "./IdleAction";
import { LookLeftAction } from "./LookLeftAction";
import { LookRightAction } from "./LookRightAction";
import { ObserveCursorAction } from "./ObserveCursorAction";
import { StayStillAction } from "./StayStillAction";

export { IdleAction, LookLeftAction, LookRightAction, ObserveCursorAction, StayStillAction };

export const idleAction = new IdleAction();

/**
 * Maps a CreatureBrain instinct id to the AnimationAction that plays it.
 * ("Breathe" is the instinct id from Sprint 2.5; "Idle" is what it looks
 * like visually.) To support a new instinct: create its Action class, then
 * add one entry here — AnimationController never needs to change.
 */
export const defaultActions: Record<string, AnimationAction> = {
  Breathe: idleAction,
  StayStill: new StayStillAction(),
  LookLeft: new LookLeftAction(),
  LookRight: new LookRightAction(),
  ObserveCursor: new ObserveCursorAction(),
};
