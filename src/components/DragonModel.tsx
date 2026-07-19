import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3, type Group } from "three";
import { DragonConfig } from "../config/DragonConfig";

const MODEL_PATH = "/models/red-dragon.glb";

/**
 * Loads the dragon GLB and centers it at the origin based on its bounding
 * box, then applies DragonConfig's scale/rotation correction on top — pure
 * transforms, the GLB file itself is never touched.
 */
function DragonModel() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  const model = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());

    // Recenter geometry so the model rotates around its own center.
    model.position.sub(center);

    // Normalize scale so the largest dimension matches DragonConfig.dragonBaseSize,
    // then apply the configured correction on top (~20% smaller by default).
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale =
      (maxDimension > 0 ? DragonConfig.dragonBaseSize / maxDimension : 1) * DragonConfig.dragonScale;

    if (group.current) {
      group.current.scale.setScalar(scale);
      const { x, y, z } = DragonConfig.rotationCorrection;
      group.current.rotation.set(x, y, z);
    }
  }, [model]);

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

export default DragonModel;
