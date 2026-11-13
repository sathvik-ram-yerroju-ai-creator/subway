import React, { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export const ParticleEffects = forwardRef(function ParticleEffects({ shipRef }, ref) {
  const pointsRef = useRef();
  const particlesRef = useRef([]);

  const speed = useGameStore((state) => state.speed);
  const gameState = useGameStore((state) => state.gameState);

  const MAX_PARTICLES = 400;

  // Pre-allocate typed arrays for positions and colors
  const { positions, colors, geometry } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const col = new Float32Array(MAX_PARTICLES * 3);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3 + 0] = 0;
      pos[i * 3 + 1] = -9999;
      pos[i * 3 + 2] = 0;

      col[i * 3 + 0] = 0;
      col[i * 3 + 1] = 0;
      col[i * 3 + 2] = 0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    return { positions: pos, colors: col, geometry: geo };
  }, []);

  // Expose burst triggers to parent
  useImperativeHandle(ref, () => ({
    emitBurst: (pos, colorHex = '#00ffff', count = 30) => {
      const color = new THREE.Color(colorHex);
      for (let i = 0; i < count; i++) {
        const list = particlesRef.current;
        if (list.length >= MAX_PARTICLES) list.shift();

        const angle = Math.random() * Math.PI * 2;
        const spd = 3.5 + Math.random() * 8.5;
        list.push({
          x: pos.x,
          y: pos.y,
          z: pos.z || 0,
          vx: Math.cos(angle) * spd + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(angle) * spd + (Math.random() - 0.5) * 1.5,
          vz: (Math.random() - 0.5) * 5,
          life: 1.0,
          decay: 1.6 + Math.random() * 1.6,
          color: [color.r, color.g, color.b]
        });
      }
    },
    emitExplosion: (pos) => {
      const hexList = ['#ff0033', '#ff3300', '#ffffff', '#ff0055', '#ffe600'];
      for (let i = 0; i < 80; i++) {
        const list = particlesRef.current;
        if (list.length >= MAX_PARTICLES) list.shift();

        const col = new THREE.Color(hexList[Math.floor(Math.random() * hexList.length)]);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const spd = 5 + Math.random() * 15;

        list.push({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          vx: spd * Math.sin(phi) * Math.cos(theta),
          vy: spd * Math.sin(phi) * Math.sin(theta),
          vz: spd * Math.cos(phi),
          life: 1.0,
          decay: 1.1 + Math.random() * 1.5,
          color: [col.r, col.g, col.b]
        });
      }
    }
  }));

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    const list = particlesRef.current;
    const shipPos = shipRef?.current || { x: 0, y: 0, z: 0 };

    // Continuous Glowing Particle Trail behind player ship engines
    if (gameState === 'PLAYING') {
      const trailCount = 2; // dual plasma thrusters
      for (let t = 0; t < trailCount; t++) {
        if (list.length < MAX_PARTICLES) {
          const isLeft = t === 0;
          const offsetX = isLeft ? -0.22 : 0.22;
          const col = isLeft ? [0, 0.94, 1] : [1, 0, 0.5]; // Cyan left, Magenta right

          list.push({
            x: shipPos.x + offsetX + (Math.random() - 0.5) * 0.1,
            y: shipPos.y + (Math.random() - 0.5) * 0.1,
            z: 0.95,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            vz: speed * 0.5 + 8,
            life: 1.0,
            decay: 2.2 + Math.random() * 1.0,
            color: col
          });
        }
      }
    }

    // Update active particles
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx * safeDelta;
      p.y += p.vy * safeDelta;
      p.z += p.vz * safeDelta;
      p.life -= p.decay * safeDelta;

      if (p.life <= 0) {
        list.splice(i, 1);
      }
    }

    // Safely write to geometry buffers
    if (pointsRef.current && pointsRef.current.geometry) {
      const geo = pointsRef.current.geometry;
      const posAttr = geo.attributes.position;
      const colAttr = geo.attributes.color;

      if (!posAttr || !colAttr) return;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (i < list.length) {
          const p = list[i];
          posAttr.setXYZ(i, p.x, p.y, p.z);
          colAttr.setXYZ(i, p.color[0] * p.life, p.color[1] * p.life, p.color[2] * p.life);
        } else {
          posAttr.setXYZ(i, 0, -9999, 0);
          colAttr.setXYZ(i, 0, 0, 0);
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.32}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
});
