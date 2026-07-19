import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { currentMonitor, getCurrentWindow, primaryMonitor } from "@tauri-apps/api/window";

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * The only class in the project authorized to talk to Tauri's window API.
 * Everything that needs to read or change the OS window goes through here —
 * nothing else should import "@tauri-apps/api/window" directly. All sizes
 * and positions are physical pixels, matching what the monitor APIs report,
 * so there's no logical/physical mismatch to reason about elsewhere.
 */
export class DesktopWindowManager {
  private readonly window = getCurrentWindow();

  async getWindowSize(): Promise<WindowSize> {
    const size = await this.window.innerSize();
    return { width: size.width, height: size.height };
  }

  async getWindowPosition(): Promise<WindowPosition> {
    const position = await this.window.outerPosition();
    return { x: position.x, y: position.y };
  }

  /** The current monitor's size, falling back to the primary monitor. */
  async getScreenSize(): Promise<WindowSize> {
    const monitor = (await currentMonitor()) ?? (await primaryMonitor());
    if (!monitor) return this.getWindowSize();
    return { width: monitor.size.width, height: monitor.size.height };
  }

  async resizeWindow(width: number, height: number): Promise<void> {
    await this.window.setSize(new PhysicalSize(Math.round(width), Math.round(height)));
  }

  async moveWindow(x: number, y: number): Promise<void> {
    await this.window.setPosition(new PhysicalPosition(Math.round(x), Math.round(y)));
  }

  async centerWindow(): Promise<void> {
    await this.window.center();
  }
}

// Shared singleton: the app's single point of contact with the Tauri window.
export const desktopWindowManager = new DesktopWindowManager();
