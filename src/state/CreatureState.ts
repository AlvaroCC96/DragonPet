import { Need } from "./Need";
import { NeedType } from "./NeedType";

/**
 * How the dragon feels right now — a snapshot of its five Needs. Represents
 * only internal state: never animations, navigation, or rendering, and
 * never touches Three.js or Tauri. CreatureBrain (via its Instincts) only
 * ever reads from this; only CreatureStateManager is allowed to mutate the
 * Needs it holds.
 */
export class CreatureState {
  private readonly needs: ReadonlyMap<NeedType, Need>;

  constructor(needs: Need[]) {
    this.needs = new Map(needs.map((need) => [need.type, need]));
  }

  /** The mutable Need itself — for CreatureStateManager, the only writer. */
  getNeed(type: NeedType): Need {
    const need = this.needs.get(type);
    if (!need) {
      throw new Error(`CreatureState has no Need registered for ${type}.`);
    }
    return need;
  }

  /** Read-only current value — for everyone else, Instincts included. */
  getNeedValue(type: NeedType): number {
    return this.getNeed(type).getValue();
  }

  /** Read-only current value, rescaled to 0..1. */
  getNormalizedNeedValue(type: NeedType): number {
    return this.getNeed(type).getNormalized();
  }

  getAllNeeds(): Need[] {
    return Array.from(this.needs.values());
  }
}

function createDefaultNeeds(): Need[] {
  return [
    new Need({ type: NeedType.Energy, initialValue: 80, min: 0, max: 100, increaseRate: 3, decreaseRate: 0.6 }),
    new Need({ type: NeedType.Sleepiness, initialValue: 10, min: 0, max: 100, increaseRate: 0.5, decreaseRate: 4 }),
    new Need({ type: NeedType.Curiosity, initialValue: 30, min: 0, max: 100, increaseRate: 1.2, decreaseRate: 0.8 }),
    new Need({ type: NeedType.Playfulness, initialValue: 30, min: 0, max: 100, increaseRate: 0.6, decreaseRate: 20 }),
    new Need({ type: NeedType.Trust, initialValue: 50, min: 0, max: 100, increaseRate: 8, decreaseRate: 0 }),
  ];
}

// Shared singleton: CreatureBrain/Instincts read from it, CreatureStateManager mutates it.
export const creatureState = new CreatureState(createDefaultNeeds());
