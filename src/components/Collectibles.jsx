import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { LANE_WIDTH, LANE_HEIGHT } from './SurferShip';

const SPAWN_DISTANCE = -140;
const DESPAWN_Z = 12;
const LANES_X = [-1, 0, 1];
const LANES_Y = [-1, 0, 1];

export function Collectibles({ shipRef, onCollect }) {
  const itemsRef = useRef([]);
  const groupRef = useRef();

  const gameState = useGameStore((state) => state.gameState);
  const speed = useGameStore((state) => state.speed);
  const collectCrystal = useGameStore((state) => state.collectCrystal);
  const activateShield = useGameStore((state) => state.activateShield);

  useEffect(() => {
    if (gameState === 'START' || gameState === 'PLAYING') {
      itemsRef.current = [];
      if (gameState === 'PLAYING') {
        spawnCluster(-35);
        spawnCluster(-70);
        spawnCluster(-105);
      }
    }
  }, [gameState]);

  const spawnCluster = (zPos) => {
    // 25% chance of spawning a Shield Power-Up, otherwise brilliant coin/crystal streak
    const isShield = Math.random() < 0.22;

    if (isShield) {
      const laneX = LANES_X[Math.floor(Math.random() * LANES_X.length)];
      const laneY = LANES_Y[Math.floor(Math.random() * LANES_Y.length)];
      itemsRef.current.push({
        id: Math.random(),
        type: 'SHIELD',
        laneX,
        laneY,
        x: laneX * LANE_WIDTH,
        y: laneY * LANE_HEIGHT - 0.1,
        z: zPos,
        collected: false
      });
    } else {
      const laneX = LANES_X[Math.floor(Math.random() * LANES_X.length)];
      const laneY = LANES_Y[Math.floor(Math.random() * LANES_Y.length)];
      const count = Math.random() < 0.5 ? 2 : 3;

      for (let i = 0; i < count; i++) {
        itemsRef.current.push({
          id: Math.random(),
          type: 'CRYSTAL',
          laneX,
          laneY,
          x: laneX * LANE_WIDTH,
          y: laneY * LANE_HEIGHT - 0.1,
          z: zPos - i * 6.5,
          collected: false
        });
      }
    }
  };

  useFrame((state, delta) => {
    if (gameState !== 'PLAYING') return;

    const safeDelta = Math.min(delta, 0.05);
    const shipPos = shipRef?.current || { x: 0, y: 0, z: 0 };
    const moveDist = speed * safeDelta;
    const currentList = itemsRef.current;

    for (let i = currentList.length - 1; i >= 0; i--) {
      const item = currentList[i];
      item.z += moveDist;

      // Pickup radius check
      if (!item.collected) {
        const dx = Math.abs(item.x - shipPos.x);
        const dy = Math.abs(item.y - shipPos.y);
        const dz = Math.abs(item.z - 0);

        if (dx < 1.35 && dy < 1.15 && dz < 1.35) {
          item.collected = true;
          if (item.type === 'SHIELD') {
            activateShield(10);
            if (onCollect) {
              onCollect({ x: item.x, y: item.y, z: item.z }, 'SHIELD');
            }
          } else {
            collectCrystal(100);
            if (onCollect) {
              onCollect({ x: item.x, y: item.y, z: item.z }, 'CRYSTAL');
            }
          }
          currentList.splice(i, 1);
          continue;
        }
      }

      // Despawn past camera
      if (item.z > DESPAWN_Z) {
        currentList.splice(i, 1);
      }
    }

    // Spawn new clusters ahead
    const mostDistantZ = currentList.reduce((min, c) => Math.min(min, c.z), 0);
    if (mostDistantZ > SPAWN_DISTANCE + 25) {
      spawnCluster(SPAWN_DISTANCE);
    }
  });

  return (
    <group ref={groupRef}>
      <CollectibleMeshRenderer itemsRef={itemsRef} />
    </group>
  );
}

function CollectibleMeshRenderer({ itemsRef }) {
  const meshGroupRef = useRef();
  const pool = useMemo(() => Array.from({ length: 35 }), []);

  useFrame((state) => {
    if (!meshGroupRef.current) return;
    const children = meshGroupRef.current.children;
    const items = itemsRef.current;
    const time = state.clock.getElapsedTime();

    for (let i = items.length; i < children.length; i++) {
      children[i].visible = false;
    }

    for (let i = 0; i < items.length; i++) {
      if (i >= children.length) break;
      const it = items[i];
      const child = children[i];

      child.visible = !it.collected;
      const bob = Math.sin(time * 5.5 + it.z * 0.15) * 0.12;
      child.position.set(it.x, it.y + bob, it.z);

      const isShield = it.type === 'SHIELD';
      const crystalMesh = child.children[0];
      const shieldMesh = child.children[1];

      if (crystalMesh) crystalMesh.visible = !isShield;
      if (shieldMesh) shieldMesh.visible = isShield;

      // Spin crystal & rings continuously
      child.rotation.y = time * 3.8 + it.id * 10;
      child.rotation.x = Math.sin(time * 2.5) * 0.25;
    }
  });

  return (
    <group ref={meshGroupRef}>
      {pool.map((_, i) => (
        <group key={i} visible={false}>
          {/* 1. Bright Cyan/Gold Rotating Diamond Crystal & Coin Rings */}
          <group>
            {/* Brilliant Diamond Gem Core */}
            <mesh>
              <octahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial
                color="#00f0ff"
                emissive="#00f0ff"
                emissiveIntensity={3.2}
                roughness={0.05}
                metalness={0.9}
              />
            </mesh>

            {/* Inner Shimmering Star Point */}
            <mesh>
              <dodecahedronGeometry args={[0.25, 0]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Rotating 24K Gold Orbital Ring 1 */}
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.78, 0.045, 8, 32]} />
              <meshStandardMaterial
                color="#ffe600"
                emissive="#ffbe0b"
                emissiveIntensity={2.0}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>

            {/* Rotating 24K Gold Orbital Ring 2 */}
            <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
              <torusGeometry args={[0.85, 0.035, 8, 32]} />
              <meshStandardMaterial
                color="#ffe600"
                emissive="#ffbe0b"
                emissiveIntensity={1.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>

            {/* Cyan/Gold Radiance Light */}
            <pointLight color="#00f0ff" intensity={2.0} distance={4} />
          </group>

          {/* 2. Shield Power-Up Graphic (Golden Protective Orb with Revolving Halos) */}
          <group visible={false}>
            <mesh>
              <sphereGeometry args={[0.52, 16, 16]} />
              <meshStandardMaterial
                color="#ffe600"
                emissive="#ffbe0b"
                emissiveIntensity={2.8}
                roughness={0.1}
                metalness={0.8}
              />
            </mesh>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[0.88, 0.05, 8, 24]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
            <mesh rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
              <torusGeometry args={[0.75, 0.05, 8, 24]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
            <pointLight color="#ffe600" intensity={2.4} distance={4.5} />
          </group>
        </group>
      ))}
    </group>
  );
}
