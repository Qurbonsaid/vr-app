import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createXRStore, XR } from "@react-three/xr";
import * as THREE from "three";
import "./App.css";

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
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("./video.mp4");

  const video = useMemo(() => {
    const v = document.createElement("video");
    v.src = videoUrl;
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    v.load();
    return v;
  }, [videoUrl]);

  useEffect(() => {
    video.play().catch(console.warn);
  }, [video]);

  useEffect(() => {
    if (selectedVideoFile) {
      const url = URL.createObjectURL(selectedVideoFile);
      setVideoUrl(url);

      // Cleanup URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [selectedVideoFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedVideoFile(file);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "28px" }}>VR Video Player</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <label
            htmlFor="video-upload"
            style={{
              cursor: "pointer",
              padding: "10px 20px",
              background: "#333",
              borderRadius: "5px",
              border: "2px solid #555",
              fontSize: "16px",
            }}
          >
            Choose Video File
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {selectedVideoFile && (
            <p style={{ margin: 0, fontSize: "14px", color: "#ccc" }}>
              Selected: {selectedVideoFile.name}
            </p>
          )}
        </div>
        <button
          onClick={() => store.enterVR()}
          style={{
            cursor: "pointer",
            padding: "15px 30px",
            background: "#007ACC",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "18px",
            marginTop: "10px",
          }}
        >
          Enter VR
        </button>
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
