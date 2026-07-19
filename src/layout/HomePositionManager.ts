import { DragonConfig } from "../config/DragonConfig";
import { desktopWindowManager, type DesktopWindowManager, type WindowPosition } from "../window/DesktopWindowManager";

/**
 * Computes where the window should sit by default. No longer a position for
 * the dragon inside a fixed window — the window itself is what lives on the
 * desktop now, so "home" means the window's own resting spot. Delegates all
 * actual window I/O to DesktopWindowManager, the only class allowed to talk
 * to Tauri; this class only knows the math for turning DragonConfig's
 * normalized screen anchor into a real position.
 */
export class HomePositionManager {
  private readonly windowManager: DesktopWindowManager;

  constructor(windowManager: DesktopWindowManager) {
    this.windowManager = windowManager;
  }

  /** The window position that satisfies the configured normalized screen anchor. */
  async getHomeWindowPosition(): Promise<WindowPosition> {
    const [screenSize, windowSize] = await Promise.all([
      this.windowManager.getScreenSize(),
      this.windowManager.getWindowSize(),
    ]);

    return {
      x: Math.round((screenSize.width - windowSize.width) * DragonConfig.homePosition.x),
      y: Math.round((screenSize.height - windowSize.height) * DragonConfig.homePosition.y),
    };
  }

  /** Moves the window to its configured home position. */
  async restoreHomePosition(): Promise<void> {
    const position = await this.getHomeWindowPosition();
    await this.windowManager.moveWindow(position.x, position.y);
  }
}

// Shared singleton, paired with the shared DesktopWindowManager instance.
export const homePositionManager = new HomePositionManager(desktopWindowManager);
