import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export function ControlsHandler() {
  const moveHorizontal = useGameStore((state) => state.moveHorizontal);
  const moveVertical = useGameStore((state) => state.moveVertical);
  const gameState = useGameStore((state) => state.gameState);
  const startGame = useGameStore((state) => state.startGame);
  const restartGame = useGameStore((state) => state.restartGame);
  const toggleMute = useGameStore((state) => state.toggleMute);

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent browser scrolling on arrow keys or space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.repeat) return; // Disallow accidental key repeat flood

      const key = e.key.toLowerCase();

      // Start / Restart shortcuts
      if (key === ' ' || key === 'enter') {
        if (gameState === 'START') {
          startGame();
          return;
        } else if (gameState === 'GAME_OVER') {
          restartGame();
          return;
        }
      }

      // Mute toggle
      if (key === 'm') {
        toggleMute();
        return;
      }

      // In-game controls
      if (gameState !== 'PLAYING') return;

      if (key === 'arrowleft' || key === 'a') {
        moveHorizontal(-1);
      } else if (key === 'arrowright' || key === 'd') {
        moveHorizontal(1);
      } else if (key === 'arrowup' || key === 'w') {
        moveVertical(1); // Up
      } else if (key === 'arrowdown' || key === 's') {
        moveVertical(-1); // Down
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, moveHorizontal, moveVertical, startGame, restartGame, toggleMute]);

  // Touch Swipe Gesture Handling
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 0) return;
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const dx = touchEnd.x - touchStartRef.current.x;
      const dy = touchEnd.y - touchStartRef.current.y;
      const dt = touchEnd.time - touchStartRef.current.time;

      const minSwipeDistance = 25; // pixels
      const maxSwipeTime = 600; // ms

      if (dt <= maxSwipeTime) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX > minSwipeDistance || absY > minSwipeDistance) {
          if (absX > absY) {
            // Horizontal swipe
            if (dx > 0) {
              moveHorizontal(1); // Swipe Right
            } else {
              moveHorizontal(-1); // Swipe Left
            }
          } else {
            // Vertical swipe
            if (dy < 0) {
              moveVertical(1); // Swipe Up (drag finger upwards)
            } else {
              moveVertical(-1); // Swipe Down (drag finger downwards)
            }
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [moveHorizontal, moveVertical]);

  return null;
}

