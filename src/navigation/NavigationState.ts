/** Whether the dragon is currently traveling under its own power.
 * Independent of CreatureBrain — this represents only the movement itself. */
export enum NavigationState {
  Idle = "Idle",
  Moving = "Moving",
}

export interface NavigationPoseSignal {
  /** Radians. The lean the model shows while traveling. */
  tilt: number;
}

type StateListener = (state: NavigationState) => void;

/**
 * Holds the current NavigationState plus the live travel lean while Moving.
 * NavigationController is the only writer; WalkAction reads `pose` to
 * render the lean. Doesn't replace CreatureBrain — it just tracks whether
 * an autonomous move is in flight.
 */
export class NavigationStateStore {
  private state: NavigationState = NavigationState.Idle;
  private readonly listeners = new Set<StateListener>();
  readonly pose: NavigationPoseSignal = { tilt: 0 };

  get(): NavigationState {
    return this.state;
  }

  set(state: NavigationState): void {
    if (this.state === state) return;
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  onChange(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Shared singleton: NavigationController writes it, WalkAction reads `pose`.
export const navigationState = new NavigationStateStore();
