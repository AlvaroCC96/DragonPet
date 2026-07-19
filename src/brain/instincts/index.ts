import type { Instinct } from "../Instinct";
import { BreatheInstinct } from "./BreatheInstinct";
import { CelebrateInstinct } from "./CelebrateInstinct";
import { DropSequenceInstinct } from "./DropSequenceInstinct";
import { HeadTiltInstinct } from "./HeadTiltInstinct";
import { LookLeftInstinct } from "./LookLeftInstinct";
import { LookRightInstinct } from "./LookRightInstinct";
import { LookUpInstinct } from "./LookUpInstinct";
import { ObserveCursorInstinct } from "./ObserveCursorInstinct";
import { StayStillInstinct } from "./StayStillInstinct";
import { StretchInstinct } from "./StretchInstinct";
import { TinyBounceInstinct } from "./TinyBounceInstinct";

export {
  BreatheInstinct,
  CelebrateInstinct,
  DropSequenceInstinct,
  HeadTiltInstinct,
  LookLeftInstinct,
  LookRightInstinct,
  LookUpInstinct,
  ObserveCursorInstinct,
  StayStillInstinct,
  StretchInstinct,
  TinyBounceInstinct,
};

// Shared singleton: CursorAwareness/HoverInteraction set its `direction` and
// trigger it directly, so it needs to be the same instance CreatureBrain and
// ObserveCursorAction see.
export const observeCursorInstinct = new ObserveCursorInstinct();

// Shared singleton: ClickInteraction triggers it directly.
export const celebrateInstinct = new CelebrateInstinct();

// Shared singletons: InstinctManager rolls each one's random intensity when it
// picks them, and the matching AnimationAction reads it from these same instances.
export const lookUpInstinct = new LookUpInstinct();
export const headTiltInstinct = new HeadTiltInstinct();
export const stretchInstinct = new StretchInstinct();
export const tinyBounceInstinct = new TinyBounceInstinct();

// Shared singleton: DragController triggers it directly when a drag ends.
export const dropSequenceInstinct = new DropSequenceInstinct();

/**
 * The creature's default repertoire. To add a new instinct: create its class
 * in this folder, then add one entry here — CreatureBrain and InstinctManager
 * never need to change.
 */
export const defaultInstincts: Instinct[] = [
  new BreatheInstinct(),
  new StayStillInstinct(),
  new LookLeftInstinct(),
  new LookRightInstinct(),
  observeCursorInstinct,
  celebrateInstinct,
  lookUpInstinct,
  headTiltInstinct,
  stretchInstinct,
  tinyBounceInstinct,
  dropSequenceInstinct,
];
