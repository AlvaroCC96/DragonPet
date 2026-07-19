import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Dragon from "./Dragon";
import ModelErrorBoundary from "./ModelErrorBoundary";

function Scene() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />

      <Suspense fallback={null}>
        <ModelErrorBoundary>
          <Dragon />
        </ModelErrorBoundary>
      </Suspense>
    </Canvas>
  );
}

export default Scene;
