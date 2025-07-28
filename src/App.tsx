import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import * as THREE from "three";

function LockedVideo({ video }: { video: HTMLVideoElement }) {
  const texture = useMemo(() => new THREE.VideoTexture(video), [video]);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const cam = camera as THREE.PerspectiveCamera;
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      const pos = new THREE.Vector3()
        .copy(cam.position)
        .add(dir.multiplyScalar(1.5));

      meshRef.current.position.copy(pos);
      meshRef.current.quaternion.copy(cam.quaternion);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3.2, 1.8]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function App() {
  const store = createXRStore({ emulate: true });

  const video = useMemo(() => {
    const v = document.createElement("video");
    v.src = "./video.mp4";
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    v.load();
    return v;
  }, []);

  useEffect(() => {
    video.play().catch(console.warn);
  }, [video]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          background: "black",
          userSelect: "none",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          zIndex: 9999,
        }}
        onClick={() => store.enterVR()}
      >
        Tap to Enter VR
      </div>
      <Canvas>
        <XR store={store}>
          <LockedVideo video={video} />
        </XR>
      </Canvas>
    </>
  );
}

export default App;
