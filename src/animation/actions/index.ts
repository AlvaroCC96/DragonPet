import type { AnimationAction } from "../AnimationAction";
import { CelebrateAction } from "./CelebrateAction";
import { HeadTiltAction } from "./HeadTiltAction";
import { IdleAction } from "./IdleAction";
import { LookLeftAction } from "./LookLeftAction";
import { LookRightAction } from "./LookRightAction";
import { LookUpAction } from "./LookUpAction";
import { ObserveCursorAction } from "./ObserveCursorAction";
import { StayStillAction } from "./StayStillAction";
import { StretchAction } from "./StretchAction";
import { TinyBounceAction } from "./TinyBounceAction";

export {
  CelebrateAction,
  HeadTiltAction,
  IdleAction,
  LookLeftAction,
  LookRightAction,
  LookUpAction,
  ObserveCursorAction,
  StayStillAction,
  StretchAction,
  TinyBounceAction,
};

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
  Celebrate: new CelebrateAction(),
  LookUp: new LookUpAction(),
  HeadTilt: new HeadTiltAction(),
  Stretch: new StretchAction(),
  TinyBounce: new TinyBounceAction(),
};
