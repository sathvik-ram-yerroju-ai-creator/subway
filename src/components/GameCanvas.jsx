import React, { useRef, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { SurferShip } from './SurferShip';
import { TunnelTrack } from './TunnelTrack';
import { Obstacles } from './Obstacles';
import { Collectibles } from './Collectibles';
import { SpaceBackground } from './SpaceBackground';
import { SpeedLines } from './SpeedLines';
import { ParticleEffects } from './ParticleEffects';
import { CameraRig } from './CameraRig';

// Robust Error Boundary to prevent React unmounting or blackouts
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Three.js Canvas Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          backgroundColor: '#020208',
          color: '#00f0ff',
          fontFamily: 'monospace',
          zIndex: 99
        }}>
          <h2>GRAPHICS ENGINE RECOVERY</h2>
          <p style={{ color: '#ff2255' }}>{this.state.error?.message || 'Rendering context reset'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              background: '#00f0ff',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            REINITIALIZE CANVAS
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function GameLoopController() {
  const updateGameTick = useGameStore((state) => state.updateGameTick);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    updateGameTick(safeDelta);
  });

  return null;
}

export function GameCanvas() {
  const shipPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const particlesRef = useRef(null);

  const handleCrash = (pos) => {
    if (particlesRef.current) {
      particlesRef.current.emitExplosion(pos);
    }
  };

  const handleDeflect = (pos) => {
    if (particlesRef.current) {
      particlesRef.current.emitBurst(pos, '#ffe600', 45);
      particlesRef.current.emitBurst(pos, '#ff007f', 30);
    }
  };

  const handleCollect = (pos, type) => {
    if (particlesRef.current) {
      const color = type === 'SHIELD' ? '#ffe600' : '#00ffff';
      particlesRef.current.emitBurst(pos, color, 30);
    }
  };

  return (
    <div
      className="canvas-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 2, 7], fov: 68 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false
          }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor('#020208');
            scene.fog = new THREE.FogExp2('#020208', 0.012);
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('WebGL Context Lost - Handling gracefully');
            }, false);
          }}
        >
          <GameLoopController />
          <CameraRig shipRef={shipPositionRef} />
          <SpaceBackground />
          <SpeedLines />
          <TunnelTrack />
          <SurferShip shipRef={shipPositionRef} />
          <Obstacles
            shipRef={shipPositionRef}
            onCrash={handleCrash}
            onDeflect={handleDeflect}
          />
          <Collectibles
            shipRef={shipPositionRef}
            onCollect={handleCollect}
          />
          <ParticleEffects ref={particlesRef} shipRef={shipPositionRef} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
