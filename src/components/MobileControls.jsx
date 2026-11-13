import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function MobileControls() {
  const gameState = useGameStore((state) => state.gameState);
  const moveHorizontal = useGameStore((state) => state.moveHorizontal);
  const moveVertical = useGameStore((state) => state.moveVertical);

  if (gameState !== 'PLAYING') return null;

  return (
    <div className="mobile-dpad-container">
      {/* 4-way direction cross */}
      <div className="dpad-cross">
        <button
          className="dpad-btn dpad-up"
          onPointerDown={(e) => {
            e.preventDefault();
            moveVertical(1);
          }}
          aria-label="Shift Up"
        >
          <ChevronUp size={28} />
        </button>

        <div className="dpad-horizontal-row">
          <button
            className="dpad-btn dpad-left"
            onPointerDown={(e) => {
              e.preventDefault();
              moveHorizontal(-1);
            }}
            aria-label="Shift Left"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="dpad-center-hub" />

          <button
            className="dpad-btn dpad-right"
            onPointerDown={(e) => {
              e.preventDefault();
              moveHorizontal(1);
            }}
            aria-label="Shift Right"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <button
          className="dpad-btn dpad-down"
          onPointerDown={(e) => {
            e.preventDefault();
            moveVertical(-1);
          }}
          aria-label="Shift Down"
        >
          <ChevronDown size={28} />
        </button>
      </div>
    </div>
  );
}

