/** The dragon's physical interaction state — independent of CreatureBrain's
 * instinct-driven behavior. Represents whether it's being touched at all. */
export enum DragonInteractionState {
  Idle = "Idle",
  Hover = "Hover",
  BeingHeld = "BeingHeld",
}

export interface DragPoseSignal {
  /** Radians. The position itself is now the window's job (DesktopWindowManager) —
   * this is just the subtle lean/bank the model shows while being carried. */
  tilt: number;
}

type StateListener = (state: DragonInteractionState) => void;

/**
 * Holds the current DragonInteractionState plus the live drag tilt while
 * BeingHeld. DragController is the only writer; DragAction reads `dragPose`
 * to render the live lean, and anything that cares about state changes
 * (e.g. pausing the brain) can subscribe via `onChange`.
 */
export class DragonInteractionStateStore {
  private state: DragonInteractionState = DragonInteractionState.Idle;
  private readonly listeners = new Set<StateListener>();
  readonly dragPose: DragPoseSignal = { tilt: 0 };

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
