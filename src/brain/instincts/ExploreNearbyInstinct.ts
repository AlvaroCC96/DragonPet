import { DragonConfig } from "../../config/DragonConfig";
import { easeInOutQuad } from "../../navigation/MovementRequest";
import { navigationController } from "../../navigation/NavigationController";
import type { CreatureState } from "../../state/CreatureState";
import { NeedType } from "../../state/NeedType";
import { Instinct } from "../Instinct";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * The dragon's first autonomous movement: wander to a random nearby spot,
 * look around for a bit, then walk back home. Never touches window
 * coordinates itself — it only ever expresses intent (a normalized
 * destination) to NavigationController, which does the actual traveling.
 * Probability > 0, unlike the triggered-only instincts (ObserveCursor,
 * Celebrate, DropSequence): this one is picked by the normal random cycle,
 * same as Breathe or LookLeft.
 */
export class ExploreNearbyInstinct extends Instinct {
  /** Normalized screen point (same convention as DragonConfig.homePosition). */
  private destination = { ...DragonConfig.homePosition };

  constructor() {
    super({
      id: "ExploreNearby",
      priority: 1,
      probability: 0.08,
      // Roughly covers walk-out + observe + walk-back at the configured walkSpeed.
      minDuration: 5,
      maxDuration: 6,
      cooldown: 25,
    });
  }

  rollIntensity(): void {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * DragonConfig.exploreRadius;
    const home = DragonConfig.homePosition;

    this.destination = {
      x: clamp(home.x + Math.cos(angle) * radius, 0, 1),
      y: clamp(home.y + Math.sin(angle) * radius, 0, 1),
    };
  }

  /** The more curious the dragon is, the more it wants to go look around. */
  priority(state: CreatureState): number {
    const curiosity = state.getNormalizedNeedValue(NeedType.Curiosity);
    return this.basePriority * (1 + curiosity * 3);
  }

  execute(): void {
    void this.runSequence();
  }

  private async runSequence(): Promise<void> {
    await navigationController.moveTo({
      destination: this.destination,
      speed: DragonConfig.walkSpeed,
      easing: easeInOutQuad,
      faceDirection: true,
    });

    await sleep(DragonConfig.exploreObserveDuration);

    await navigationController.returnHome(DragonConfig.walkSpeed);
  }
}
