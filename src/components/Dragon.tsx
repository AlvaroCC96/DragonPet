import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { CreatureBrain } from "../brain/CreatureBrain";
import { AnimationController } from "../animation/AnimationController";
import DragonModel from "./DragonModel";

/**
 * Wires the CreatureBrain's decisions to visible motion: creates the brain
 * and an AnimationController, connects them, and applies the Pose the
 * controller computes each frame to this group. No behavior logic lives
 * here — that's the brain's (what to do), the actions' (what pose that
 * looks like), and the PoseInterpolator's (how smoothly to get there) job.
 */
function Dragon() {
  const rootRef = useRef<Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);

  useEffect(() => {
    const brain = new CreatureBrain();
    const controller = new AnimationController();
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
    const controller = controllerRef.current;
    const root = rootRef.current;
    if (!controller || !root) return;

    const pose = controller.update(state.clock.elapsedTime, delta);
    root.position.set(pose.position.x, pose.position.y, pose.position.z);
    root.rotation.set(pose.rotation.x, pose.rotation.y, pose.rotation.z);
    root.scale.set(pose.scale.x, pose.scale.y, pose.scale.z);
  });

  return (
    <group ref={rootRef}>
      <DragonModel />
    </group>
  );
}

export default Dragon;
