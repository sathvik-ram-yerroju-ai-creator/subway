import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { LANE_WIDTH, LANE_HEIGHT } from './SurferShip';

const SPAWN_DISTANCE = -140;
const DESPAWN_Z = 12;

const LANES_X = [-1, 0, 1];
const LANES_Y = [-1, 0, 1];

export function Obstacles({ shipRef, onCrash, onDeflect }) {
  const gameState = useGameStore((state) => state.gameState);
  const speed = useGameStore((state) => state.speed);
  const endGame = useGameStore((state) => state.endGame);
  const hasShield = useGameStore((state) => state.hasShield);
  const deflectHazard = useGameStore((state) => state.deflectHazard);

  const obstaclesRef = useRef([]);
  const groupRef = useRef();

  useEffect(() => {
    if (gameState === 'START' || gameState === 'PLAYING') {
      obstaclesRef.current = [];
      if (gameState === 'PLAYING') {
        spawnWave(-50);
        spawnWave(-85);
        spawnWave(-120);
      }
    }
  }, [gameState]);

  const spawnWave = (zPos) => {
    const count = Math.random() < 0.4 ? 1 : Math.random() < 0.8 ? 2 : 3;
    const usedPositions = new Set();

    for (let i = 0; i < count; i++) {
      let laneX, laneY, key;
      let tries = 0;
      do {
        laneX = LANES_X[Math.floor(Math.random() * LANES_X.length)];
        laneY = LANES_Y[Math.floor(Math.random() * LANES_Y.length)];
        key = `${laneX},${laneY}`;
        tries++;
      } while (usedPositions.has(key) && tries < 10);

      usedPositions.add(key);

      const type = Math.random() < 0.6 ? 'SPIKED_MINE' : 'HAZARD_BARRIER';

      obstaclesRef.current.push({
        id: Math.random(),
        laneX,
        laneY,
        x: laneX * LANE_WIDTH,
        y: laneY * LANE_HEIGHT - 0.1,
        z: zPos,
        type,
        rotSpeedX: (Math.random() - 0.5) * 2.8,
        rotSpeedY: (Math.random() - 0.5) * 2.8,
        rotSpeedZ: (Math.random() - 0.5) * 2.8,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        rotZ: Math.random() * Math.PI,
        size: type === 'HAZARD_BARRIER' ? [LANE_WIDTH * 0.92, 1.35, 0.8] : [1.3, 1.3, 1.3]
      });
    }
  };

  useFrame((state, delta) => {
    if (gameState !== 'PLAYING') return;

    const safeDelta = Math.min(delta, 0.05);
    const shipPos = shipRef?.current || { x: 0, y: 0, z: 0 };
    const moveDist = speed * safeDelta;
    const currentList = obstaclesRef.current;

    for (let i = currentList.length - 1; i >= 0; i--) {
      const obs = currentList[i];
      obs.z += moveDist;
      obs.rotX += obs.rotSpeedX * safeDelta;
      obs.rotY += obs.rotSpeedY * safeDelta;
      obs.rotZ += obs.rotSpeedZ * safeDelta;

      // Real-time bounding box overlap check
      const dx = Math.abs(obs.x - shipPos.x);
      const dy = Math.abs(obs.y - shipPos.y);
      const dz = Math.abs(obs.z - 0);

      const halfSizeX = (obs.size[0] / 2) + 0.65;
      const halfSizeY = (obs.size[1] / 2) + 0.45;
      const halfSizeZ = (obs.size[2] / 2) + 0.8;

      if (dx < halfSizeX && dy < halfSizeY && dz < halfSizeZ) {
        // Active shield deflection
        if (hasShield) {
          deflectHazard();
          if (onDeflect) {
            onDeflect({ x: obs.x, y: obs.y, z: obs.z });
          }
          currentList.splice(i, 1);
          continue;
        }

        // Fatal crash
        if (onCrash) {
          onCrash({ x: obs.x, y: obs.y, z: obs.z });
        }
        endGame();
        return;
      }

      // Despawn past camera
      if (obs.z > DESPAWN_Z) {
        currentList.splice(i, 1);
      }
    }

    // Spawn waves continuously ahead
    const mostDistantZ = currentList.reduce((min, o) => Math.min(min, o.z), 0);
    if (mostDistantZ > SPAWN_DISTANCE + 28) {
      spawnWave(SPAWN_DISTANCE);
    }
  });

  return (
    <group ref={groupRef}>
      <ObstacleMeshRenderer obstaclesRef={obstaclesRef} />
    </group>
  );
}

function ObstacleMeshRenderer({ obstaclesRef }) {
  const meshGroupRef = useRef();
  const pool = useMemo(() => Array.from({ length: 40 }), []);

  useFrame(() => {
    if (!meshGroupRef.current) return;
    const children = meshGroupRef.current.children;
    const obstacles = obstaclesRef.current;

    for (let i = obstacles.length; i < children.length; i++) {
      children[i].visible = false;
    }

    for (let i = 0; i < obstacles.length; i++) {
      if (i >= children.length) break;
      const obs = obstacles[i];
      const child = children[i];

      child.visible = true;
      child.position.set(obs.x, obs.y, obs.z);
      child.rotation.set(obs.rotX, obs.rotY, obs.rotZ);

      // Toggle barrier vs mine graphics
      const isBarrier = obs.type === 'HAZARD_BARRIER';
      const mineGroup = child.children[0];
      const barrierGroup = child.children[1];

      if (mineGroup) mineGroup.visible = !isBarrier;
      if (barrierGroup) barrierGroup.visible = isBarrier;
    }
  });

  return (
    <group ref={meshGroupRef}>
      {pool.map((_, i) => (
        <group key={i} visible={false}>
          {/* 1. Spiked Red/Orange Debris Mine (Sharp Jagged Protrusions) */}
          <group>
            {/* Core Spiked Body */}
            <mesh castShadow>
              <icosahedronGeometry args={[0.55, 0]} />
              <meshStandardMaterial
                color="#200004"
                emissive="#ff0033"
                emissiveIntensity={2.5}
                roughness={0.2}
                metalness={0.9}
                flatShading
              />
            </mesh>

            {/* Sharp Protruding Red Hazard Spikes in 6 directions */}
            {/* +X Spike */}
            <mesh position={[0.62, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.18, 0.6, 6]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={3.0} />
            </mesh>
            {/* -X Spike */}
            <mesh position={[-0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.18, 0.6, 6]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={3.0} />
            </mesh>
            {/* +Y Spike */}
            <mesh position={[0, 0.62, 0]}>
              <coneGeometry args={[0.18, 0.6, 6]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={3.0} />
            </mesh>
            {/* -Y Spike */}
            <mesh position={[0, -0.62, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.18, 0.6, 6]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={3.0} />
            </mesh>
            {/* +Z Spike */}
            <mesh position={[0, 0, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.18, 0.6, 6]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={3.0} />
            </mesh>
            {/* -Z Spike */}
            <mesh position={[0, 0, -0.62]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.18, 0.6, 6]} />
              <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={3.0} />
            </mesh>

            {/* Glowing Red Warning Halo Wireframe */}
            <mesh>
              <dodecahedronGeometry args={[0.78, 0]} />
              <meshBasicMaterial color="#ff0044" wireframe />
            </mesh>

            {/* Red Pulsing Light */}
            <pointLight color="#ff0033" intensity={2.5} distance={4.5} />
          </group>

          {/* 2. Red Laser Warning Barrier (Horizontal Barrier with Hazard Stripes) */}
          <group visible={false}>
            {/* Central Laser Beam */}
            <mesh>
              <boxGeometry args={[2.8, 0.35, 0.35]} />
              <meshStandardMaterial
                color="#ff0022"
                emissive="#ff0033"
                emissiveIntensity={3.2}
                roughness={0.1}
              />
            </mesh>
            {/* Left Post */}
            <mesh position={[-1.4, 0, 0]}>
              <boxGeometry args={[0.3, 1.2, 0.6]} />
              <meshStandardMaterial color="#1a0005" emissive="#ff3300" emissiveIntensity={1.5} />
            </mesh>
            {/* Right Post */}
            <mesh position={[1.4, 0, 0]}>
              <boxGeometry args={[0.3, 1.2, 0.6]} />
              <meshStandardMaterial color="#1a0005" emissive="#ff3300" emissiveIntensity={1.5} />
            </mesh>
            <pointLight color="#ff0022" intensity={3.0} distance={5} />
          </group>
        </group>
      ))}
    </group>
  );
}
