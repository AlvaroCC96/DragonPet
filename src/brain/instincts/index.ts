import type { Instinct } from "../Instinct";
import { BreatheInstinct } from "./BreatheInstinct";
import { CelebrateInstinct } from "./CelebrateInstinct";
import { LookLeftInstinct } from "./LookLeftInstinct";
import { LookRightInstinct } from "./LookRightInstinct";
import { ObserveCursorInstinct } from "./ObserveCursorInstinct";
import { StayStillInstinct } from "./StayStillInstinct";

export {
  BreatheInstinct,
  CelebrateInstinct,
  LookLeftInstinct,
  LookRightInstinct,
  ObserveCursorInstinct,
  StayStillInstinct,
};

// Shared singleton: CursorAwareness/HoverInteraction set its `direction` and
// trigger it directly, so it needs to be the same instance CreatureBrain and
// ObserveCursorAction see.
export const observeCursorInstinct = new ObserveCursorInstinct();

// Shared singleton: ClickInteraction triggers it directly.
export const celebrateInstinct = new CelebrateInstinct();

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
];
