import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ControlsHandler } from './components/ControlsHandler';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { MobileControls } from './components/MobileControls';
import { ScreenFlash } from './components/ScreenFlash';

export default function App() {
  return (
    <div className="game-wrapper">
      <ControlsHandler />
      <GameCanvas />
      <HUD />
      <StartScreen />
      <GameOverScreen />
      <MobileControls />
      <ScreenFlash />
    </div>
  );
}
