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
    CreatureBrain.ts         Continuous think-act-wait loop (setTimeout, no useFrame)
    instincts/                One file per instinct (Breathe, StayStill, LookLeft, LookRight)
  animation/
    AnimationAction.ts       Abstract base + AnimatableTarget (no Three.js import needed)
    AnimationController.ts   Listens to CreatureBrain, eases the model toward each action's pose
    actions/                  One file per action (Idle, StayStill, LookLeft, LookRight)
public/
  models/red-dragon.glb   The dragon asset
src-tauri/
  tauri.conf.json          Window config: transparent, decorations off, always-on-top
```

## License

Personal project — no license specified yet.
