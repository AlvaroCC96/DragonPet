import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Scene from "./components/Scene";
import "./App.css";

function App() {
  useEffect(() => {
    // Dev-only shortcut: close the app window with Escape.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void getCurrentWindow().close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <Scene />;
}

export default App;
