export type DragonStateName = "Idle" | "LookingLeft" | "LookingRight" | "Thinking" | "Stretch";

export interface DragonPose {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

type TransientState = Exclude<DragonStateName, "Idle">;

const TRANSIENT_STATES: TransientState[] = ["LookingLeft", "LookingRight", "Thinking", "Stretch"];

const STATE_DURATION: Record<TransientState, number> = {
  LookingLeft: 2.2,
  LookingRight: 2.2,
  Thinking: 2.4,
  Stretch: 2.4,
};

const IDLE_BREATH_SPEED = 1.4;
const IDLE_BREATH_AMPLITUDE = 0.02;
const IDLE_SWAY_SPEED = 0.55;
const IDLE_SWAY_AMPLITUDE = 0.012;
// Offsets the sway phase from the breath phase so they don't peak in sync.
const IDLE_SWAY_PHASE = 1.3;

const LOOK_ANGLE = 0.12;
const THINK_TILT = 0.09;
const STRETCH_TILT = 0.1;
const STRETCH_LIFT = 0.015;

export function randomIdleDuration(): number {
  return 8 + Math.random() * 7; // 8s to 15s
}

export function pickRandomTransientState(): DragonStateName {
  return TRANSIENT_STATES[Math.floor(Math.random() * TRANSIENT_STATES.length)];
}

export function getStateDuration(state: DragonStateName): number {
  return state === "Idle" ? Infinity : STATE_DURATION[state];
}

/**
 * Pure function of (state, time) -> pose offset. Kept free of React/Three.js
 * so the state machine can be unit-tested and so the same pose values can
 * later be retargeted from the whole model onto individual bones.
 */
export function computePose(state: DragonStateName, elapsedTime: number, stateElapsed: number): DragonPose {
  if (state === "Idle") {
    const breathe = Math.sin(elapsedTime * IDLE_BREATH_SPEED) * IDLE_BREATH_AMPLITUDE;
    const sway = Math.sin(elapsedTime * IDLE_SWAY_SPEED + IDLE_SWAY_PHASE) * IDLE_SWAY_AMPLITUDE;
    return {
      position: { x: 0, y: breathe, z: 0 },
      rotation: { x: 0, y: 0, z: sway },
    };
  }

  const duration = STATE_DURATION[state];
  const t = Math.min(stateElapsed / duration, 1);
  // Eases in, peaks at the midpoint, eases back out to 0 by the end of the state.
  const amount = Math.sin(t * Math.PI);

  const pose: DragonPose = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  };

  switch (state) {
    case "LookingLeft":
      pose.rotation.y = -LOOK_ANGLE * amount;
      break;
    case "LookingRight":
      pose.rotation.y = LOOK_ANGLE * amount;
      break;
    case "Thinking":
      pose.rotation.x = THINK_TILT * amount;
      break;
    case "Stretch":
      pose.rotation.x = -STRETCH_TILT * amount;
      pose.position.y = STRETCH_LIFT * amount;
      break;
  }

  return pose;
}
