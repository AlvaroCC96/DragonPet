import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import {
  computePose,
  getStateDuration,
  pickRandomTransientState,
  randomIdleDuration,
  type DragonStateName,
} from "../dragon/behaviourStates";

interface DragonBehaviourProps {
  children: ReactNode;
}

interface BehaviourState {
  name: DragonStateName;
  enteredAt: number;
  idleDuration: number;
}

// Exponential smoothing rate for MathUtils.damp; higher = catches up to the target faster.
const POSE_DAMPING = 5;

/**
 * Drives a simple state machine (Idle / LookingLeft / LookingRight / Thinking / Stretch)
 * and smoothly interpolates the wrapped group toward each state's pose every frame.
 * Applies the pose to the whole group for now; once the model has a rig, this is the
 * only place that would change to target bones instead.
 */
function DragonBehaviour({ children }: DragonBehaviourProps) {
  const rootRef = useRef<Group>(null);
  const behaviour = useRef<BehaviourState>({
    name: "Idle",
    enteredAt: 0,
    idleDuration: randomIdleDuration(),
  });

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    const current = behaviour.current;
    const stateElapsed = elapsed - current.enteredAt;

    if (current.name === "Idle") {
      if (stateElapsed >= current.idleDuration) {
        current.name = pickRandomTransientState();
        current.enteredAt = elapsed;
      }
    } else if (stateElapsed >= getStateDuration(current.name)) {
      current.name = "Idle";
      current.enteredAt = elapsed;
      current.idleDuration = randomIdleDuration();
    }

    const pose = computePose(current.name, elapsed, elapsed - current.enteredAt);

    const root = rootRef.current;
    if (!root) return;

    root.position.x = MathUtils.damp(root.position.x, pose.position.x, POSE_DAMPING, delta);
    root.position.y = MathUtils.damp(root.position.y, pose.position.y, POSE_DAMPING, delta);
    root.position.z = MathUtils.damp(root.position.z, pose.position.z, POSE_DAMPING, delta);
    root.rotation.x = MathUtils.damp(root.rotation.x, pose.rotation.x, POSE_DAMPING, delta);
    root.rotation.y = MathUtils.damp(root.rotation.y, pose.rotation.y, POSE_DAMPING, delta);
    root.rotation.z = MathUtils.damp(root.rotation.z, pose.rotation.z, POSE_DAMPING, delta);
  });

  return <group ref={rootRef}>{children}</group>;
}

export default DragonBehaviour;
