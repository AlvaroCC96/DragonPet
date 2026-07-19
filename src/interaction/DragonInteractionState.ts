/** The dragon's physical interaction state — independent of CreatureBrain's
 * instinct-driven behavior. Represents whether it's being touched at all. */
export enum DragonInteractionState {
  Idle = "Idle",
  Hover = "Hover",
  BeingHeld = "BeingHeld",
}

export interface DragPoseSignal {
  x: number;
  y: number;
  tilt: number;
}

type StateListener = (state: DragonInteractionState) => void;

/**
 * Holds the current DragonInteractionState plus the live drag position while
 * BeingHeld. DragController is the only writer; DragAction reads `dragPose`
 * to render the live follow, and anything that cares about state changes
 * (e.g. pausing the brain) can subscribe via `onChange`.
 */
export class DragonInteractionStateStore {
  private state: DragonInteractionState = DragonInteractionState.Idle;
  private readonly listeners = new Set<StateListener>();
  readonly dragPose: DragPoseSignal = { x: 0, y: 0, tilt: 0 };

  get(): DragonInteractionState {
    return this.state;
  }

  set(state: DragonInteractionState): void {
    if (this.state === state) return;
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  onChange(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Shared singleton: DragController writes it, DragAction reads `dragPose`.
export const dragonInteractionState = new DragonInteractionStateStore();
