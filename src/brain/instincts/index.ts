import type { Instinct } from "../Instinct";
import { BreatheInstinct } from "./BreatheInstinct";
import { LookLeftInstinct } from "./LookLeftInstinct";
import { LookRightInstinct } from "./LookRightInstinct";
import { ObserveCursorInstinct } from "./ObserveCursorInstinct";
import { StayStillInstinct } from "./StayStillInstinct";

export { BreatheInstinct, LookLeftInstinct, LookRightInstinct, ObserveCursorInstinct, StayStillInstinct };

// Shared singleton: CursorAwareness sets its `direction` and triggers it directly,
// so it needs to be the same instance CreatureBrain and ObserveCursorAction see.
export const observeCursorInstinct = new ObserveCursorInstinct();

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
];
