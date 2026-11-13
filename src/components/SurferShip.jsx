import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const LANE_WIDTH = 3.2;
export const LANE_HEIGHT = 2.2;

export function SurferShip({ shipRef }) {
  const meshRef = useRef();
  const visualGroupRef = useRef();
  const enginesRef = useRef();
  const shieldMeshRef = useRef();

  const laneX = useGameStore((state) => state.laneX);
  const laneY = useGameStore((state) => state.laneY);
  const speed = useGameStore((state) => state.speed);
  const hasShield = useGameStore((state) => state.hasShield);

  // Target coordinates
  const targetX = laneX * LANE_WIDTH;
  const targetY = laneY * LANE_HEIGHT - 0.2; // Slightly lower profile to ensure clear sightlines

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const safeDelta = Math.min(delta, 0.05);
    const time = state.clock.getElapsedTime();

    // Smooth frame-rate independent position dampening
    meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, targetX, 18, safeDelta);
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 18, safeDelta);

    // Subtle zero-gravity idle float
    const floatBobY = Math.sin(time * 5) * 0.04;
    const floatBobX = Math.cos(time * 3.5) * 0.02;

    // Banking roll, pitch, and yaw calculations based on offset from target
    const dx = targetX - meshRef.current.position.x;
    const dy = targetY - meshRef.current.position.y;

    const targetRoll = -dx * 0.28;
    const targetPitch = dy * 0.15 + Math.sin(time * 4) * 0.02;
    const targetYaw = -dx * 0.10;

    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, targetRoll, 15, safeDelta);
    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, targetPitch, 15, safeDelta);
    meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, targetYaw, 15, safeDelta);

    if (visualGroupRef.current) {
      visualGroupRef.current.position.y = floatBobY;
      visualGroupRef.current.position.x = floatBobX;
    }

    // Share exact position for collision detection and particle trails
    if (shipRef) {
      shipRef.current.copy(meshRef.current.position);
    }

    // Engine exhaust glow flicker & stretch
    if (enginesRef.current) {
      const flicker = 0.85 + Math.sin(time * 25) * 0.15;
      const stretch = 1.0 + (speed / 100) * 0.7;
      enginesRef.current.scale.set(flicker, flicker, stretch * flicker);
    }

    // Shield animation
    if (shieldMeshRef.current && hasShield) {
      shieldMeshRef.current.rotation.y += safeDelta * 2.5;
      shieldMeshRef.current.rotation.x += safeDelta * 1.5;
      const pulse = 1.0 + Math.sin(time * 8) * 0.06;
      shieldMeshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.2, 0]}>
      {/* Streamlined, scaled ship model (0.7 scale) ensures clear view of all 3x3 lanes */}
      <group ref={visualGroupRef} scale={[0.7, 0.7, 0.7]}>
        {/* Sleek Aerodynamic Fuselage */}
        <mesh position={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.48, 2.3, 5]} />
          <meshStandardMaterial
            color="#0d1117"
            roughness={0.2}
            metalness={0.9}
            emissive="#001827"
            flatShading
          />
        </mesh>

        {/* Low-Profile Cyberpunk Cockpit Canopy (Glowing Neon Cyan) */}
        <mesh position={[0, 0.18, 0.1]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.85]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2.0}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        {/* Streamlined Left Wing */}
        <mesh position={[-0.85, -0.04, 0.35]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[1.05, 0.05, 0.8]} />
          <meshStandardMaterial
            color="#161b22"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Left Wing Neon Blade Strip (Cyan) */}
        <mesh position={[-1.38, -0.04, 0.4]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.07, 0.08, 0.95]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Streamlined Right Wing */}
        <mesh position={[0.85, -0.04, 0.35]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[1.05, 0.05, 0.8]} />
          <meshStandardMaterial
            color="#161b22"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Right Wing Neon Blade Strip (Cyan) */}
        <mesh position={[1.38, -0.04, 0.4]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.07, 0.08, 0.95]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Lower Anti-Gravity Hoverboard Platform */}
        <mesh position={[0, -0.28, 0.08]}>
          <boxGeometry args={[0.6, 0.07, 1.6]} />
          <meshStandardMaterial
            color="#0a0c10"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Hoverboard Anti-Gravity Emitter (Glowing Magenta Core) */}
        <mesh position={[0, -0.33, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.48, 1.4]} />
          <meshBasicMaterial
            color="#ff007f"
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Twin Engines & Exhaust Thruster Plumes */}
        <group ref={enginesRef} position={[0, 0, 1.0]}>
          {/* Left Engine */}
          <mesh position={[-0.28, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.18, 0.3, 12]} />
            <meshStandardMaterial color="#21262d" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[-0.28, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.14, 0.8, 12]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>

          {/* Right Engine */}
          <mesh position={[0.28, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.18, 0.3, 12]} />
            <meshStandardMaterial color="#21262d" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.28, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.14, 0.8, 12]} />
            <meshBasicMaterial color="#ff007f" />
          </mesh>

          <pointLight position={[0, 0, 0.5]} color="#00f0ff" intensity={2.0} distance={5.5} />
        </group>

        {/* Holographic Protective Energy Shield (Active when hasShield is true) */}
        {hasShield && (
          <group ref={shieldMeshRef} position={[0, 0, 0.1]}>
            <mesh>
              <sphereGeometry args={[1.45, 24, 24]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.6}
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[1.48, 16, 16]} />
              <meshBasicMaterial
                color="#ffe600"
                wireframe
                transparent
                opacity={0.45}
              />
            </mesh>
            <pointLight color="#00ffff" intensity={2.2} distance={5} />
          </group>
        )}
      </group>
    </group>
  );
}
