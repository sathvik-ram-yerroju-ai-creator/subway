# Zero-G Surfer 🚀🌌

A complete, high-octane 3D endless runner web game built with **React**, **React Three Fiber (@react-three/drei)**, **Three.js**, **Zustand**, and **Vanilla JavaScript / CSS3**.

---

## 🎮 Game Overview
You pilot an agile futuristic hover-surfer through the zero-gravity conduits of an orbital space station. Dodge red hazard barriers and space debris across a full **3x3 spatial grid** (3 horizontal lanes × 3 vertical heights), gather glowing **Energy Crystals** for score multiplier streaks, acquire temporary **Shield Power-Ups** for obstacle invulnerability, and push your velocity to the limit!

---

## 🕹️ Controls

### Keyboard (Desktop)
| Action | Primary Keys | Secondary Keys |
| :--- | :--- | :--- |
| **Shift Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> | <kbd>←</kbd> / <kbd>→</kbd> |
| **Shift Up / Down** | <kbd>W</kbd> / <kbd>S</kbd> | <kbd>↑</kbd> / <kbd>↓</kbd> |
| **Launch / Restart** | <kbd>Space</kbd> | <kbd>Enter</kbd> |
| **Mute / Unmute Audio** | <kbd>M</kbd> | Top-right HUD button |

### Touch & Mobile
- **Swipe Gestures:** Swipe Left, Right, Up, or Down anywhere on screen for instant zero-g lane shifting.
- **On-Screen D-Pad:** Dedicated futuristic touchscreen arrow controls in the bottom-right corner.

---

## ✨ Features & Architecture

### 1. State Management (`src/store/useGameStore.js`)
- **Finite Game States:** `'START'`, `'PLAYING'`, `'GAME_OVER'`.
- **Dynamic Speed Curve:** Scales smoothly from base velocity (42 m/s) up to hyperdrive speeds (115 m/s) over time.
- **Shield System:** Dynamic shield duration tracking with invulnerability and kinetic hazard deflection.
- **3x3 Grid Tracker:** Real-time coordinates `laneX` `(-1, 0, 1)` and `laneY` `(-1, 0, 1)`.
- **Persistent High Scores:** Stored automatically in browser `localStorage`.
- **Combo & Multiplier:** Crystal streaks trigger up to **5x multipliers**.

### 2. React Three Fiber 3D Scene (`src/components/`)
- **`SurferShip.jsx`**: Aerodynamic cyber craft with cockpit canopy, swept wings with neon cyan blade accents, anti-gravity hoverboard emitter, twin thrusters with dynamic plasma exhaust flames, and active spherical energy shield. Implements smooth `THREE.MathUtils.lerp` interpolation with dynamic banking roll (`rotation.z`), pitch (`rotation.x`), and yaw.
- **`TunnelTrack.jsx`**: Modular infinite cyberpunk corridor with repeating octagonal rib arches, dual scrolling cyber grid floors/ceilings, and neon power conduits.
- **`Obstacles.jsx`**: Red hazard cubes, glowing wireframe cages, and rotating debris clusters that spawn in safe, solvable 3x3 configurations ahead of the player. Features real-time 3D bounding-box collision detection with shield deflection.
- **`Collectibles.jsx`**: Rotating glowing octahedron crystals and spherical shield power-ups with orbital rings.
- **`SpaceBackground.jsx`**: Deep space atmosphere powered by `@react-three/drei`'s `Stars`, celestial nebula rings, and dual cyan/magenta point lighting.
- **`SpeedLines.jsx`**: Dynamic warp speed streaks that stretch and accelerate as the ship gains velocity.
- **`ParticleEffects.jsx`**: Multi-tiered particle system powering continuous engine wake trails behind the dual thrusters, crystal glitter bursts, shield deflection flares, and explosive crash fragments.
- **`CameraRig.jsx`**: Third-person chase camera with responsive spring lag and impact screen shake.
- **`GameCanvas.jsx`**: WebGL canvas lifecycle wrapper with graphics error boundaries and context loss protection.

### 3. Procedural Web Audio Engine (`src/utils/audio.js`)
- Synthesized in real-time using the native HTML5 **Web Audio API** — zero external asset downloads or CDN dependencies:
  - **Thrusters**: Frequency-modulated pitch sweeps when switching lanes.
  - **Crystals**: Shimmering bell harmonic arpeggios that scale with your combo level.
  - **Shield Up**: Resonant rising chord when collecting the shield power-up.
  - **Shield Deflect**: Heavy energy barrier deflection shockwave upon absorbing an obstacle.
  - **Explosion**: Sub-bass rumble and bandpassed noise shockwave on crash.
  - **Engine**: Continuous low-frequency drone that pitches up as velocity increases.
  - **Synthwave Music**: Cyberpunk arpeggiated bassline and lead melody.

### 4. Cyberpunk HUD & Overlays (`src/components/`)
- **`HUD.jsx`**: Live score, shield duration timer, speed gauge (km/h), multiplier, crystal counter, and an interactive **3x3 Sector Radar** showing active position.
- **`ScreenFlash.jsx`**: Dynamic radial screen flashes for item pickups (cyan), shield activation (gold), barrier deflection (magenta), and fatal crash impacts (red).
- **`StartScreen.jsx`**: Cyberpunk modal with control briefing and animated "LAUNCH MISSION" neon button.
- **`GameOverScreen.jsx`**: Mission debrief, stats breakdown, and celebratory confetti fireworks on new records!

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Or run production preview server
npm run build
npm run preview
```
Open **`http://localhost:3000`** in your browser.
