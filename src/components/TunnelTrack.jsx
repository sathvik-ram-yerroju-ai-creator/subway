import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { LANE_WIDTH, LANE_HEIGHT } from './SurferShip';

const TUNNEL_LENGTH = 160;
const SEGMENT_COUNT = 16;
const SEGMENT_SPACING = TUNNEL_LENGTH / SEGMENT_COUNT; // 10 units each

export function TunnelTrack() {
  const ringsGroup = useRef();
  const floorGridRef = useRef();
  const ceilingGridRef = useRef();
  const speed = useGameStore((state) => state.speed);
  const gameState = useGameStore((state) => state.gameState);

  // Pre-generate ring segments
  const ringOffsets = useMemo(() => {
    return Array.from({ length: SEGMENT_COUNT }, (_, i) => -i * SEGMENT_SPACING);
  }, []);

  // Tunnel bounds: width ~12, height ~9
  const halfW = 6.2;
  const halfH = 4.8;
  const gridOffsetZ = useRef(0);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const activeSpeed = gameState === 'GAME_OVER' ? speed * 0.15 : speed;
    const moveDist = activeSpeed * safeDelta;

    // Move rings toward camera
    if (ringsGroup.current) {
      ringsGroup.current.children.forEach((ring) => {
        ring.position.z += moveDist;
        if (ring.position.z > 20) {
          ring.position.z -= TUNNEL_LENGTH;
        }
      });
    }

    // Mathematical seamless grid scrolling:
    // Grid has 1-unit spacing; wrapping by exactly 2.0 units ensures zero hitch or jump
    gridOffsetZ.current = (gridOffsetZ.current + moveDist) % 2.0;

    if (floorGridRef.current) {
      floorGridRef.current.position.z = gridOffsetZ.current - 70;
    }
    if (ceilingGridRef.current) {
      ceilingGridRef.current.position.z = gridOffsetZ.current - 70;
    }
  });

  return (
    <group>
      {/* 4 Neon Cyber Conduits along the corners of the space corridor */}
      {/* Top Left */}
      <mesh position={[-halfW, halfH, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[0.2, 0.2, TUNNEL_LENGTH + 40]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>
      {/* Top Right */}
      <mesh position={[halfW, halfH, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[0.2, 0.2, TUNNEL_LENGTH + 40]} />
        <meshBasicMaterial color="#ff007f" />
      </mesh>
      {/* Bottom Left */}
      <mesh position={[-halfW, -halfH, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[0.2, 0.2, TUNNEL_LENGTH + 40]} />
        <meshBasicMaterial color="#ff007f" />
      </mesh>
      {/* Bottom Right */}
      <mesh position={[halfW, -halfH, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[0.2, 0.2, TUNNEL_LENGTH + 40]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Subtle glowing lane separators on floor to visually guide the 3 horizontal lanes */}
      <mesh position={[-LANE_WIDTH / 2, -halfH + 0.05, -TUNNEL_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, TUNNEL_LENGTH + 40]} />
        <meshBasicMaterial color="#00f0ff" opacity={0.4} transparent />
      </mesh>
      <mesh position={[LANE_WIDTH / 2, -halfH + 0.05, -TUNNEL_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, TUNNEL_LENGTH + 40]} />
        <meshBasicMaterial color="#00f0ff" opacity={0.4} transparent />
      </mesh>

      {/* Cyber Grid Floor (140 units long, 70 divisions = exactly 2.0 units per division) */}
      <group ref={floorGridRef} position={[0, -halfH, -70]}>
        <gridHelper
          args={[halfW * 2, 70, '#00f0ff', '#0a2335']}
          rotation={[0, 0, 0]}
          scale={[1, 1, 10]}
        />
      </group>

      {/* Cyber Grid Ceiling */}
      <group ref={ceilingGridRef} position={[0, halfH, -70]}>
        <gridHelper
          args={[halfW * 2, 70, '#ff007f', '#2c071d']}
          rotation={[0, 0, 0]}
          scale={[1, 1, 10]}
        />
      </group>

      {/* Outer corridor dark structural hull plates */}
      {/* Left Wall */}
      <mesh position={[-halfW - 0.2, 0, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[0.4, halfH * 2, TUNNEL_LENGTH + 40]} />
        <meshStandardMaterial color="#06090e" roughness={0.7} metalness={0.6} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[halfW + 0.2, 0, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[0.4, halfH * 2, TUNNEL_LENGTH + 40]} />
        <meshStandardMaterial color="#06090e" roughness={0.7} metalness={0.6} />
      </mesh>
      {/* Top Roof */}
      <mesh position={[0, halfH + 0.2, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[halfW * 2 + 0.8, 0.4, TUNNEL_LENGTH + 40]} />
        <meshStandardMaterial color="#05080c" roughness={0.7} metalness={0.6} />
      </mesh>
      {/* Bottom Floor */}
      <mesh position={[0, -halfH - 0.2, -TUNNEL_LENGTH / 2]}>
        <boxGeometry args={[halfW * 2 + 0.8, 0.4, TUNNEL_LENGTH + 40]} />
        <meshStandardMaterial color="#05080c" roughness={0.7} metalness={0.6} />
      </mesh>

      {/* Repeating Sci-Fi Neon Tunnel Ribs & Gate Arches */}
      <group ref={ringsGroup}>
        {ringOffsets.map((zOffset, index) => {
          const isMagenta = index % 2 === 0;
          const ringColor = isMagenta ? '#ff007f' : '#00f0ff';
          return (
            <group key={index} position={[0, 0, zOffset]}>
              {/* Top Bar */}
              <mesh position={[0, halfH, 0]}>
                <boxGeometry args={[halfW * 2, 0.25, 0.35]} />
                <meshStandardMaterial
                  color="#111827"
                  emissive={ringColor}
                  emissiveIntensity={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Bottom Bar */}
              <mesh position={[0, -halfH, 0]}>
                <boxGeometry args={[halfW * 2, 0.25, 0.35]} />
                <meshStandardMaterial
                  color="#111827"
                  emissive={ringColor}
                  emissiveIntensity={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Left Bar */}
              <mesh position={[-halfW, 0, 0]}>
                <boxGeometry args={[0.25, halfH * 2, 0.35]} />
                <meshStandardMaterial
                  color="#111827"
                  emissive={ringColor}
                  emissiveIntensity={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Right Bar */}
              <mesh position={[halfW, 0, 0]}>
                <boxGeometry args={[0.25, halfH * 2, 0.35]} />
                <meshStandardMaterial
                  color="#111827"
                  emissive={ringColor}
                  emissiveIntensity={0.8}
                  roughness={0.2}
                />
              </mesh>

              {/* Glowing Corner Accents */}
              <mesh position={[-halfW, halfH, 0]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshBasicMaterial color={ringColor} />
              </mesh>
              <mesh position={[halfW, halfH, 0]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshBasicMaterial color={ringColor} />
              </mesh>
              <mesh position={[-halfW, -halfH, 0]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshBasicMaterial color={ringColor} />
              </mesh>
              <mesh position={[halfW, -halfH, 0]}>
                <sphereGeometry args={[0.25, 8, 8]} />
                <meshBasicMaterial color={ringColor} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
