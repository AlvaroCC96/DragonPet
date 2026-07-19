import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { CreatureBrain } from "../brain/CreatureBrain";
import { AnimationController } from "../animation/AnimationController";
import DragonModel from "./DragonModel";

/**
 * Wires the CreatureBrain's decisions to visible motion: creates the brain
 * and an AnimationController targeting this group, connects them, and
 * drives the per-frame update. No behavior logic lives here — that's the
 * brain's (what to do) and the controller/actions' (how it looks) job.
 */
function Dragon() {
  const rootRef = useRef<Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const brain = new CreatureBrain();
    const controller = new AnimationController(root);
    controller.bindBrain(brain);
    brain.start();

    controllerRef.current = controller;

    return () => {
      brain.stop();
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useFrame((state, delta) => {
    controllerRef.current?.update(state.clock.elapsedTime, delta);
  });

  return (
    <group ref={rootRef}>
      <DragonModel />
    </group>
  );
}

export default Dragon;
