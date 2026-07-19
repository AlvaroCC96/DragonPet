import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { CreatureBrain } from "../brain/CreatureBrain";
import { AnimationController } from "../animation/AnimationController";
import { CursorTracker } from "../input/CursorTracker";
import { CursorAwareness } from "../awareness/CursorAwareness";
import { ClickInteraction } from "../interaction/ClickInteraction";
import { HoverInteraction } from "../interaction/HoverInteraction";
import { InteractionManager } from "../interaction/InteractionManager";
import DragonModel from "./DragonModel";

/**
 * Wires the CreatureBrain's decisions to visible motion, plus the cursor
 * perception and mouse interaction loops that can nudge the brain to react.
 * Applies the Pose the controller computes each frame to this group. No
 * behavior logic lives here — that's the brain's (what to do), the actions'
 * (what pose that looks like), and the PoseInterpolator's (how smoothly to
 * get there) job.
 */
function Dragon() {
  const rootRef = useRef<Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);

  useEffect(() => {
    const brain = new CreatureBrain();
    const controller = new AnimationController();
    controller.bindBrain(brain);

    const tracker = new CursorTracker();
    const awareness = new CursorAwareness(tracker, brain);

    const click = new ClickInteraction(brain);
    const hover = new HoverInteraction(brain);
    const interactions = new InteractionManager(tracker, click, hover);

    brain.start();
    tracker.start();
    awareness.start();
    interactions.start();

    controllerRef.current = controller;

    return () => {
      interactions.stop();
      awareness.stop();
      tracker.stop();
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
