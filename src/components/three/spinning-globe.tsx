"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import { MeshoptDecoder } from "meshoptimizer";
import type { Group, MeshStandardMaterial, Mesh } from "three";
import { Color } from "three";

function GlobeModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF("/media4uglobe.glb", true, true, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  scene.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mat = (child as Mesh).material as MeshStandardMaterial;
      if (mat.color) {
        mat.color = new Color("#1a3a5c");
      }
      if (mat.emissive) {
        mat.emissive = new Color("#0a1e3d");
        mat.emissiveIntensity = 0.3;
      }
    }
  });

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.9} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-3 text-zinc-500 text-sm">
        <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
        Loading globe...
      </div>
    </Html>
  );
}

export function SpinningGlobe() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 3.5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} color="#a0c4ff" />
      <pointLight position={[-4, -3, -4]} intensity={0.5} color="#0077B6" />
      <pointLight position={[4, 2, 3]} intensity={0.4} color="#00A5E0" />
      <Suspense fallback={<LoadingFallback />}>
        <GlobeModel />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/media4uglobe.glb");
