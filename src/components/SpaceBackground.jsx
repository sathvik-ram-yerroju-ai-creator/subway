import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export function SpaceBackground() {
  const nebulaRef = useRef();

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    if (nebulaRef.current) {
      nebulaRef.current.rotation.z += safeDelta * 0.02;
    }
  });

  return (
    <group>
      {/* Distant Stars via Drei */}
      <Stars
        radius={150}
        depth={60}
        count={6000}
        factor={5}
        saturation={1}
        fade
        speed={1.5}
      />

      {/* Distant Futuristic Space Station Ring & Cyber Nebula */}
      <group ref={nebulaRef} position={[0, 0, -220]}>
        <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
          <torusGeometry args={[70, 1.2, 16, 64]} />
          <meshBasicMaterial color="#ff007f" wireframe />
        </mesh>
        <mesh rotation={[-Math.PI / 4, -Math.PI / 5, 0]}>
          <torusGeometry args={[95, 0.8, 16, 64]} />
          <meshBasicMaterial color="#00f0ff" wireframe />
        </mesh>
        <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[25, 24, 24]} />
          <meshBasicMaterial color="#0b001a" />
        </mesh>
      </group>

      {/* Atmospheric Lighting */}
      <ambientLight intensity={0.45} />
      <pointLight position={[-8, 6, -10]} color="#00f0ff" intensity={3.0} distance={45} />
      <pointLight position={[8, -6, -10]} color="#ff007f" intensity={3.0} distance={45} />
      <pointLight position={[0, 8, -40]} color="#ffe600" intensity={1.5} distance={50} />
      <directionalLight position={[0, 12, 10]} intensity={0.6} color="#cceeff" />
    </group>
  );
}
