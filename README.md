# Desktop Dragon 🐉

A little 3D dragon that lives on your desktop. Borderless, transparent, always-on-top window rendering a GLB model with React Three Fiber — no browser chrome, no background, just the pet. The window itself is sized snugly around the dragon and sits in a corner of your screen; dragging it moves the whole window, not just the model inside it.

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
- **Sprint 6** — Bugfix: removed the dev-only `OrbitControls` entirely so the camera can never be moved, rotated, or zoomed by the user — the framing is now permanently fixed. Also added the first direct interactions: `InteractionManager` (`src/interaction/`) centralizes mouse events and figures out if they're near the dragon, without ever importing `CreatureBrain` itself; `ClickInteraction` (own cooldown) triggers a new `CelebrateInstinct` — a small friendly bounce — and `HoverInteraction` (own dwell-time + cooldown) reuses `ObserveCursorInstinct` when the cursor lingers nearby. No Drag & Drop yet.
- **Sprint 7** — First personality pass: four new spontaneous instincts (`LookUp`, `HeadTilt`, `Stretch`, `TinyBounce`) that fire occasionally while idle, each built purely from the existing Pose system. `InstinctManager` gained two general capabilities to support them: a per-instinct `cooldown` (so the same quirk can't repeat too soon, on top of the existing "never twice in a row" rule) and an optional `rollIntensity()` hook, called each time an instinct is picked, that lets it randomize its own angle/height/intensity for that one occurrence — so no two glances or bounces feel identical.

- **Sprint 8** — First Drag & Drop: `DragController` (`src/interaction/`) detects a press-hold-move gesture on the dragon and, while held, hands rendering of a subtle lean to `AnimationController` via a new `setOverrideAction()` — bypassing the instinct system entirely, since a drag's duration is however long the user holds it. `CreatureBrain` gained `pause()`/`resume()` so it stops picking new instincts while held without losing its place. On release, the override clears and a `DropSequenceInstinct` plays a small fall/bounce/settle/glance-at-the-user sequence through the normal `triggerInstinct()` path, then Idle resumes on its own. (Originally moved the 3D model within a large window — see Sprint 8.6.)
- **Sprint 8.6** — Architecture pivot: instead of a large window with the model moving inside it, the *window itself* is now sized to the dragon (`DesktopWindowManager`, the only class allowed to talk to Tauri's window API) and placed at a configurable screen corner (`HomePositionManager`, now async and window-position-based instead of a 3D offset). `DragController` moves the whole OS window to follow drags (eased via `requestAnimationFrame`), not the model. Every tunable — scale, window padding, home corner, drag feel, bounce/return timing, idle breathing — now lives in `DragonConfig` (`src/config/`). Sets up cleanly for future click-through, walking, and multi-monitor support.

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
    Scene.tsx            Canvas setup: fixed camera, lights; mounts <Dragon /> (no orbit controls)
    Dragon.tsx             Sizes/places the window on mount, connects CreatureBrain + AnimationController
                              + perception/interaction + DragonModel
    DragonModel.tsx        Loads and centers the GLB, applies DragonConfig's scale/rotation correction
    DragonBehaviour.tsx    Sprint 2's state machine — unused since Sprint 3, kept for reference
    ModelErrorBoundary.tsx  Visible fallback if the GLB fails to load
  config/
    DragonConfig.ts         Every tunable "feel" parameter: scale, window padding/home corner, drag
                               feel, drop-sequence timing, idle breathing — no magic numbers elsewhere
  window/
    DesktopWindowManager.ts  The only class allowed to talk to @tauri-apps/api/window
  layout/
    HomePositionManager.ts   Computes the window's default screen-corner position from DragonConfig
  dragon/
    behaviourStates.ts    Sprint 2's pure state/pose logic — unused since Sprint 3
  brain/
    Instinct.ts             Abstract base: id, priority, probability, min/maxDuration, cooldown, rollIntensity()
    InstinctManager.ts       Weighted random selection, cooldown-aware, never repeats the last instinct
    CreatureBrain.ts         Continuous think-act-wait loop + triggerInstinct() + pause()/resume()
    instincts/                One file per instinct (Breathe, StayStill, LookLeft, LookRight, ObserveCursor,
                                 Celebrate, LookUp, HeadTilt, Stretch, TinyBounce, DropSequence)
  animation/
    AnimationAction.ts       Abstract base — describes a target DragonPose, applies nothing
    AnimationController.ts   Listens to CreatureBrain, delegates all smoothing to PoseInterpolator,
                                setOverrideAction() for brain-independent rendering (e.g. dragging)
    actions/                  One file per action (Idle, StayStill, LookLeft, LookRight, ObserveCursor,
                                 Celebrate, LookUp, HeadTilt, Stretch, TinyBounce, Drag, DropSequence);
                                 Drag only supplies a lean now — the window itself carries position
  pose/
    DragonPose.ts             Position/rotation/scale structure + the frozen HOME_POSE
    PoseUtils.ts               clonePose(), createHomePose() — no Three.js/GLB dependency
    PoseInterpolator.ts        Current + target Pose, damps toward it each frame (all smoothing lives here)
  input/
    CursorTracker.ts           pointermove/pointerleave on window; only knows the cursor's position
  awareness/
    CursorAwareness.ts         Polls the tracker, decides "is it close?", triggers ObserveCursorInstinct
  interaction/
    InteractionManager.ts      Reads clicks + hover; never imports CreatureBrain itself — the window
                                  is dragon-sized now, so any event it gets is inherently "on the dragon"
    ClickInteraction.ts         Own cooldown; triggers CelebrateInstinct
    HoverInteraction.ts         Own dwell-time + cooldown; triggers ObserveCursorInstinct
    DragController.ts           Press-hold-move-release gesture; moves the whole OS window via
                                    DesktopWindowManager, pauses the brain, triggers DropSequenceInstinct
    DragonInteractionState.ts   Idle/Hover/BeingHeld enum + observable store + live drag lean
public/
  models/red-dragon.glb   The dragon asset
src-tauri/
  tauri.conf.json          Window config: transparent, decorations off, always-on-top; size/position
                              are set at runtime by DesktopWindowManager, not fixed here
```

## License

Personal project — no license specified yet.
