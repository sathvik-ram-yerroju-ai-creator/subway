import { create } from 'zustand';
import { sound } from '../utils/audio';

const STORAGE_KEY_HIGH = 'zerog_surfer_highscore';
const STORAGE_KEY_MUTED = 'zerog_surfer_muted';

const getInitialHighScore = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEY_HIGH);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
};

const getInitialMuted = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
  } catch (e) {
    return false;
  }
};

export const BASE_SPEED = 42;
export const MAX_SPEED = 115;

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'START', // 'START' | 'PLAYING' | 'GAME_OVER'
  score: 0,
  crystals: 0,
  highScore: getInitialHighScore(),
  distance: 0,
  speed: BASE_SPEED,
  multiplier: 1,
  comboCount: 0,
  isNewRecord: false,

  // Shield power-up state
  hasShield: false,
  shieldTimer: 0,
  maxShieldDuration: 10,

  // Position grid: 3x3 grid (-1, 0, 1)
  laneX: 0, // -1: Left, 0: Center, 1: Right
  laneY: 0, // -1: Bottom, 0: Middle, 1: Top
  lastMoveDir: { x: 0, y: 0, time: 0 },

  // Screen shake & flash feedback
  shakeIntensity: 0,
  flashType: null, // 'CYAN' | 'GOLD' | 'RED' | 'MAGENTA' | null

  // Audio mute
  isMuted: getInitialMuted(),

  // Actions
  initAudio: () => {
    sound.init();
    sound.setMuted(get().isMuted);
  },

  toggleMute: () => {
    sound.playButtonClick();
    const nextMuted = !get().isMuted;
    set({ isMuted: nextMuted });
    sound.setMuted(nextMuted);
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, String(nextMuted));
    } catch (e) {}
  },

  triggerFlash: (type) => {
    set({ flashType: type });
    setTimeout(() => {
      if (get().flashType === type) {
        set({ flashType: null });
      }
    }, 280);
  },

  startGame: () => {
    sound.playButtonClick();
    get().initAudio();
    sound.startEngine();
    sound.startBGM();

    set({
      gameState: 'PLAYING',
      score: 0,
      crystals: 0,
      distance: 0,
      speed: BASE_SPEED,
      multiplier: 1,
      comboCount: 0,
      laneX: 0,
      laneY: 0,
      hasShield: false,
      shieldTimer: 0,
      lastMoveDir: { x: 0, y: 0, time: 0 },
      isNewRecord: false,
      shakeIntensity: 0,
      flashType: 'CYAN'
    });
  },

  endGame: () => {
    if (get().gameState !== 'PLAYING') return;

    sound.playCrash();
    sound.stopAll();

    const { score, highScore } = get();
    const isNewRecord = score > highScore;
    const newHigh = Math.max(score, highScore);

    if (isNewRecord) {
      try {
        localStorage.setItem(STORAGE_KEY_HIGH, String(newHigh));
      } catch (e) {}
    }

    set({
      gameState: 'GAME_OVER',
      highScore: newHigh,
      isNewRecord,
      shakeIntensity: 1.5,
      flashType: 'RED'
    });
  },

  restartGame: () => {
    sound.playButtonClick();
    get().startGame();
  },

  moveHorizontal: (dir) => {
    if (get().gameState !== 'PLAYING') return;
    const current = get().laneX;
    const next = Math.max(-1, Math.min(1, current + dir));
    if (next !== current) {
      sound.playLaneSwitch();
      set({
        laneX: next,
        lastMoveDir: { x: dir, y: 0, time: Date.now() }
      });
    }
  },

  moveVertical: (dir) => {
    if (get().gameState !== 'PLAYING') return;
    const current = get().laneY;
    const next = Math.max(-1, Math.min(1, current + dir));
    if (next !== current) {
      sound.playLaneSwitch();
      set({
        laneY: next,
        lastMoveDir: { x: 0, y: dir, time: Date.now() }
      });
    }
  },

  setLaneCoordinates: (x, y) => {
    if (get().gameState !== 'PLAYING') return;
    const curX = get().laneX;
    const curY = get().laneY;
    const nextX = Math.max(-1, Math.min(1, x));
    const nextY = Math.max(-1, Math.min(1, y));

    if (nextX !== curX || nextY !== curY) {
      sound.playLaneSwitch();
      set({
        laneX: nextX,
        laneY: nextY,
        lastMoveDir: { x: nextX - curX, y: nextY - curY, time: Date.now() }
      });
    }
  },

  collectCrystal: (pointValue = 100) => {
    if (get().gameState !== 'PLAYING') return;
    const { comboCount } = get();
    const newCombo = comboCount + 1;
    const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 3));

    sound.playCoin(newCombo);
    get().triggerFlash('CYAN');

    set((state) => ({
      crystals: state.crystals + 1,
      comboCount: newCombo,
      multiplier: newMultiplier,
      score: state.score + pointValue * newMultiplier,
      shakeIntensity: 0.15
    }));
  },

  activateShield: (duration = 10) => {
    if (get().gameState !== 'PLAYING') return;
    sound.playShieldUp();
    get().triggerFlash('GOLD');

    set({
      hasShield: true,
      shieldTimer: duration,
      shakeIntensity: 0.25
    });
  },

  deflectHazard: () => {
    sound.playShieldDeflect();
    get().triggerFlash('MAGENTA');

    set({
      hasShield: false,
      shieldTimer: 0,
      shakeIntensity: 0.8
    });
  },

  updateGameTick: (delta) => {
    const { gameState, speed, distance, score, multiplier, shakeIntensity, hasShield, shieldTimer } = get();
    if (gameState !== 'PLAYING') return;

    // Frame-rate independent gradual speed increase
    const newSpeed = Math.min(MAX_SPEED, speed + delta * 1.25);
    const speedRatio = (newSpeed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
    sound.updateEnginePitch(speedRatio);

    const distDelta = newSpeed * delta;
    const scoreDelta = Math.floor(distDelta * 1.5 * multiplier);

    // Shield countdown
    let nextHasShield = hasShield;
    let nextShieldTimer = shieldTimer;
    if (hasShield) {
      nextShieldTimer = Math.max(0, shieldTimer - delta);
      if (nextShieldTimer <= 0) {
        nextHasShield = false;
      }
    }

    set({
      speed: newSpeed,
      distance: distance + distDelta,
      score: score + scoreDelta,
      shakeIntensity: Math.max(0, shakeIntensity - delta * 2.5),
      hasShield: nextHasShield,
      shieldTimer: nextShieldTimer
    });
  }
}));
