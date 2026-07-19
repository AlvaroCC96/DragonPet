import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { CreatureBrain } from "../brain/CreatureBrain";
import { AnimationController } from "../animation/AnimationController";
import { DragonConfig } from "../config/DragonConfig";
import { CursorTracker } from "../input/CursorTracker";
import { CursorAwareness } from "../awareness/CursorAwareness";
import { ClickInteraction } from "../interaction/ClickInteraction";
import { DragController } from "../interaction/DragController";
import { HoverInteraction } from "../interaction/HoverInteraction";
import { InteractionManager } from "../interaction/InteractionManager";
import { homePositionManager } from "../layout/HomePositionManager";
import { desktopWindowManager } from "../window/DesktopWindowManager";
import DragonModel from "./DragonModel";

// StrictMode double-invokes effects in dev mode; this isn't cancellable
// async work like the brain/tracker's start()/stop() pairs, so guard it
// to actually run once per page load instead of racing itself.
let windowSetupStarted = false;

/** Sizes the window snugly around the dragon and moves it to its home spot. */
async function setUpWindow(): Promise<void> {
  if (windowSetupStarted) return;
  windowSetupStarted = true;

  const { dragonBaseSize, dragonScale, pixelsPerWorldUnit, windowPadding } = DragonConfig;
  const contentSize = dragonBaseSize * dragonScale * pixelsPerWorldUnit;

  await desktopWindowManager.resizeWindow(
    contentSize + windowPadding.left + windowPadding.right,
    contentSize + windowPadding.top + windowPadding.bottom,
  );
  await homePositionManager.restoreHomePosition();
}

/**
 * Wires the CreatureBrain's decisions to visible motion, plus the cursor
 * perception and mouse interaction loops that can nudge the brain to react.
 * Also sizes and places the window around the dragon on mount — the window
 * is the thing that lives on and moves around the desktop now, not the
 * model within it. Applies the Pose the controller computes each frame to
 * this group. No behavior logic lives here — that's the brain's (what to
 * do), the actions' (what pose that looks like), and the PoseInterpolator's
 * (how smoothly to get there) job.
 */
function Dragon() {
  const rootRef = useRef<Group>(null);
  const controllerRef = useRef<AnimationController | null>(null);

  useEffect(() => {
    void setUpWindow();

    const brain = new CreatureBrain();
    const controller = new AnimationController();
    controller.bindBrain(brain);

    const tracker = new CursorTracker();
    const awareness = new CursorAwareness(tracker, brain);

    const click = new ClickInteraction(brain);
    const hover = new HoverInteraction(brain);
    const interactions = new InteractionManager(tracker, click, hover);

    const drag = new DragController(brain, controller);

    brain.start();
    tracker.start();
    awareness.start();
    interactions.start();
    drag.start();

    controllerRef.current = controller;

    return () => {
      drag.stop();
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
