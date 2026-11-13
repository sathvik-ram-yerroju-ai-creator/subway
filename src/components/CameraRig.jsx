import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { LANE_WIDTH, LANE_HEIGHT } from './SurferShip';

export function CameraRig({ shipRef }) {
  const laneX = useGameStore((state) => state.laneX);
  const laneY = useGameStore((state) => state.laneY);
  const gameState = useGameStore((state) => state.gameState);
  const shakeIntensity = useGameStore((state) => state.shakeIntensity);

  const lookTarget = useRef(new THREE.Vector3(0, 0, -35));

  useFrame((state, delta) => {
    const camera = state.camera;
    const safeDelta = Math.min(delta, 0.05);

    // Elevated, clear third-person camera vantage point
    // High enough so the player ship never occludes incoming obstacles in any lane
    const targetX = laneX * LANE_WIDTH * 0.32;
    const targetY = laneY * LANE_HEIGHT * 0.35 + 2.9;
    const targetZ = gameState === 'START' ? 8.5 : 7.0;

    // Smooth frame-rate independent dampening
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 12, safeDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 12, safeDelta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 8, safeDelta);

    // Dynamic screen shake
    if (shakeIntensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * shakeIntensity * 0.45;
      const shakeY = (Math.random() - 0.5) * shakeIntensity * 0.45;
      camera.position.x += shakeX;
      camera.position.y += shakeY;
    }

    // Aim camera slightly down the corridor so incoming lanes are clearly visible
    const targetLookX = camera.position.x * 0.5;
    const targetLookY = camera.position.y * 0.2 - 0.35;
    const targetLookZ = -38;

    lookTarget.current.x = THREE.MathUtils.damp(lookTarget.current.x, targetLookX, 14, safeDelta);
    lookTarget.current.y = THREE.MathUtils.damp(lookTarget.current.y, targetLookY, 14, safeDelta);
    lookTarget.current.z = targetLookZ;

    camera.lookAt(lookTarget.current);
  });

  return null;
}
