import React from 'react';
import { useGameStore } from '../store/useGameStore';

export function ScreenFlash() {
  const flashType = useGameStore((state) => state.flashType);

  if (!flashType) return null;

  return (
    <div
      className={`screen-flash-overlay flash-${flashType.toLowerCase()}`}
      aria-hidden="true"
    />
  );
}

