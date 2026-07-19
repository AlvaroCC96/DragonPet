import type { Instinct } from "../Instinct";
import { BreatheInstinct } from "./BreatheInstinct";
import { LookLeftInstinct } from "./LookLeftInstinct";
import { LookRightInstinct } from "./LookRightInstinct";
import { StayStillInstinct } from "./StayStillInstinct";

export { BreatheInstinct, LookLeftInstinct, LookRightInstinct, StayStillInstinct };

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
];
