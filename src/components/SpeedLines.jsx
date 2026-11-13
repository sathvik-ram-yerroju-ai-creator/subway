import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export function SpeedLines({ count = 80 }) {
  const linesRef = useRef();
  const speed = useGameStore((state) => state.speed);
  const gameState = useGameStore((state) => state.gameState);

  const lines = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.5 + Math.random() * 4.5;
      data.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: -Math.random() * 150,
        len: 2 + Math.random() * 6,
        color: Math.random() > 0.4 ? '#00f0ff' : '#ff007f'
      });
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    if (!linesRef.current) return;
    const safeDelta = Math.min(delta, 0.05);
    const activeSpeed = gameState === 'GAME_OVER' ? speed * 0.2 : speed;
    const moveZ = activeSpeed * safeDelta * 1.5;

    linesRef.current.children.forEach((child, i) => {
      const lineData = lines[i];
      lineData.z += moveZ;

      if (lineData.z > 15) {
        lineData.z = -140 - Math.random() * 20;
      }

      child.position.set(lineData.x, lineData.y, lineData.z);
    });
  });

  return (
    <group ref={linesRef}>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, l.z]}>
          <boxGeometry args={[0.04, 0.04, l.len]} />
          <meshBasicMaterial color={l.color} opacity={0.7} transparent />
        </mesh>
      ))}
    </group>
  );
}
