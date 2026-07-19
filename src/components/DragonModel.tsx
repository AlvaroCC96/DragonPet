import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3, type Group } from "three";

const MODEL_PATH = "/models/red-dragon.glb";

/** Loads the dragon GLB and centers it at the origin based on its bounding box. */
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

    // Normalize scale so the largest dimension fits nicely in the viewport.
    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 2.2;
    const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

    if (group.current) {
      group.current.scale.setScalar(scale);
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
