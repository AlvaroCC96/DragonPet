# Desktop Dragon 🐉

A little 3D dragon that lives on your desktop. Borderless, transparent, always-on-top window rendering a GLB model with React Three Fiber — no browser chrome, no background, just the pet.

## Stack

- [Tauri 2](https://tauri.app/) — native window & bundling (Rust)
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) and [@react-three/drei](https://github.com/pmndrs/drei)

## Status

Built incrementally in small sprints.

- **Sprint 1** — Transparent, borderless, always-on-top 420×420 window. Loads and centers the dragon GLB, basic lighting, dev-only OrbitControls, Escape to quit.
- **Sprint 2** — The dragon feels alive without any GLB animations, physics, or AI: a small state machine (`Idle`, `LookingLeft`, `LookingRight`, `Thinking`, `Stretch`) drives subtle breathing, sway, head turns, and tilts, all interpolated smoothly every frame via `useFrame`.
- **Sprint 2.5** — The creature's "brain": a standalone, Three.js-agnostic decision system (`src/brain/`) that continuously picks natural instincts (Breathe, StayStill, LookLeft, LookRight) using weighted random selection, never repeating the same one twice in a row. Not wired into the render tree yet — this sprint is architecture only, ready for a future `AnimationController` to subscribe to it.
- **Sprint 3** — The brain is wired up for the first time: `AnimationController` (`src/animation/`) subscribes to `CreatureBrain`, maps each Instinct to an `AnimationAction` (Idle breathing, LookLeft/LookRight turns, StayStill), and eases the model toward each action's pose every frame. `Dragon.tsx` is the thin component that connects brain + controller + model and contains no behavior logic itself.
- **Sprint 4** — Introduced a proper Pose system (`src/pose/`): `AnimationAction`s now only *describe* a target `DragonPose` (position + rotation + scale, always built from a frozen `HOME_POSE`) instead of touching any transform directly. All smoothing math moved into `PoseInterpolator`, the single place interpolation logic lives. `AnimationController` no longer touches Three.js at all — it just asks the interpolator to ease toward each action's pose and hands the result to `Dragon.tsx`, which is now the only place that applies numbers to the actual model.
- **Sprint 5** — First environment perception: `CursorTracker` (`src/input/`) just knows where the cursor is; `CursorAwareness` (`src/awareness/`) polls it every 400ms and, if the cursor lingers close to the window's center, asks `CreatureBrain` to trigger `ObserveCursorInstinct` — a brief, bounded glance toward the cursor's side, reusing the existing Pose system, that returns to Idle on its own once its duration elapses. The dragon notices the cursor; it never follows it.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust toolchain](https://www.rust-lang.org/tools/install) (`rustc`, `cargo`)
- Windows: [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (preinstalled on most modern Windows) and the MSVC C++ Build Tools
- macOS: Xcode Command Line Tools

## Getting started

```bash
npm install
npm run tauri dev
```

Press **Escape** to close the window during development.

## Scripts

| Command              | Description                              |
| --------------------- | ----------------------------------------- |
| `npm run tauri dev`   | Run the desktop app with hot-reload       |
| `npm run tauri build` | Build the production installer/executable |
| `npm run dev`          | Run only the Vite frontend in a browser   |
| `npm run build`        | Type-check and build the frontend bundle  |

## Project structure

```
src/
  components/
    Scene.tsx            Canvas setup: camera, lights, controls; mounts <Dragon />
    Dragon.tsx             Connects CreatureBrain + AnimationController + DragonModel
    DragonModel.tsx        Loads and centers the GLB
    DragonBehaviour.tsx    Sprint 2's state machine — unused since Sprint 3, kept for reference
    ModelErrorBoundary.tsx  Visible fallback if the GLB fails to load
  dragon/
    behaviourStates.ts    Sprint 2's pure state/pose logic — unused since Sprint 3
  brain/
    Instinct.ts             Abstract base: id, priority, probability, min/maxDuration
    InstinctManager.ts       Weighted random selection, never repeats the last instinct
    CreatureBrain.ts         Continuous think-act-wait loop + triggerInstinct() for external requests
    instincts/                One file per instinct (Breathe, StayStill, LookLeft, LookRight, ObserveCursor)
  animation/
    AnimationAction.ts       Abstract base — describes a target DragonPose, applies nothing
    AnimationController.ts   Listens to CreatureBrain, delegates all smoothing to PoseInterpolator
    actions/                  One file per action (Idle, StayStill, LookLeft, LookRight, ObserveCursor)
  pose/
    DragonPose.ts             Position/rotation/scale structure + the frozen HOME_POSE
    PoseUtils.ts               clonePose(), createHomePose() — no Three.js/GLB dependency
    PoseInterpolator.ts        Current + target Pose, damps toward it each frame (all smoothing lives here)
  input/
    CursorTracker.ts           pointermove/pointerleave on window; only knows the cursor's position
  awareness/
    CursorAwareness.ts         Polls the tracker, decides "is it close?", triggers ObserveCursorInstinct
public/
  models/red-dragon.glb   The dragon asset
src-tauri/
  tauri.conf.json          Window config: transparent, decorations off, always-on-top
```

## License

Personal project — no license specified yet.
