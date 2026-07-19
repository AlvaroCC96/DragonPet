import { GoalType } from "../../goals/GoalType";
import { Instinct } from "../Instinct";

/**
 * The creature stays calm and still for a while. Also stands in for the
 * Sleep Goal — a future dedicated SleepInstinct could take over without
 * anything else needing to change.
 */
export class StayStillInstinct extends Instinct {
  constructor() {
    super({
      id: "StayStill",
      priority: 1,
      probability: 0.3,
      minDuration: 5,
      maxDuration: 8,
    });
  }

  execute(): void {
    // No dedicated "still" animation yet — reuses the existing Idle animation.
  }

  supportsGoal(goalType: GoalType): boolean {
    return goalType === GoalType.Idle || goalType === GoalType.Sleep;
  }
}
