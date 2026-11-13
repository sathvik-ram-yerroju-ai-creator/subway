import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Rocket, Trophy, Sparkles, Volume2, VolumeX, ArrowLeftRight, ArrowUpDown, Smartphone, Keyboard } from 'lucide-react';

export function StartScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const startGame = useGameStore((state) => state.startGame);
  const highScore = useGameStore((state) => state.highScore);
  const isMuted = useGameStore((state) => state.isMuted);
  const toggleMute = useGameStore((state) => state.toggleMute);

  if (gameState !== 'START') return null;

  return (
    <div className="overlay-screen start-screen">
      <div className="cyber-modal">
        {/* Top Sound Control */}
        <div className="modal-header-actions">
          <button
            onClick={toggleMute}
            className="sound-toggle-btn"
            title={isMuted ? 'Audio Muted' : 'Audio Enabled'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span>{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>
        </div>

        {/* Title & Tagline */}
        <div className="title-container">
          <div className="pre-title">DEEP SPACE STATION 0-G</div>
          <h1 className="game-title">
            ZERO-G <span className="title-highlight">SURFER</span>
          </h1>
          <div className="game-subtitle">CYBERPUNK HIGH-VELOCITY FLIGHT SIMULATOR</div>
        </div>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="high-score-banner">
            <Trophy size={18} className="trophy-icon" />
            <span>RECORD SCORE: <strong>{highScore.toLocaleString()}</strong></span>
          </div>
        )}

        {/* Instructions & 3x3 Grid Matrix Diagram */}
        <div className="instructions-card">
          <h3 className="section-title">FLIGHT PROTOCOLS & CONTROLS</h3>

          <div className="controls-columns">
            <div className="control-col">
              <div className="control-icon-header">
                <Keyboard size={18} />
                <span>DESKTOP CONTROLS</span>
              </div>
              <ul className="control-list">
                <li>
                  <span className="key-tag">A</span> <span className="key-tag">D</span> or <span className="key-tag">←</span> <span className="key-tag">→</span>
                  <span className="desc">Shift 3 Horizontal Lanes</span>
                </li>
                <li>
                  <span className="key-tag">W</span> <span className="key-tag">S</span> or <span className="key-tag">↑</span> <span className="key-tag">↓</span>
                  <span className="desc">Shift 3 Vertical Heights</span>
                </li>
                <li>
                  <span className="key-tag">SPACE</span>
                  <span className="desc">Launch / Restart Mission</span>
                </li>
              </ul>
            </div>

            <div className="control-col">
              <div className="control-icon-header">
                <Smartphone size={18} />
                <span>TOUCH / MOBILE</span>
              </div>
              <ul className="control-list">
                <li>
                  <span className="action-pill">SWIPE 4-WAYS</span>
                  <span className="desc">Smooth instant lane changes</span>
                </li>
                <li>
                  <span className="action-pill">D-PAD</span>
                  <span className="desc">On-screen directional arrows</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="objectives-strip">
            <div className="obj-item">
              <span className="obj-icon red-pulse">■</span>
              <span>Evade Red Hazard Barriers & Debris</span>
            </div>
            <div className="obj-item">
              <Sparkles size={16} className="text-cyan animate-spin-slow" />
              <span>Gather Cyan Crystals for 5x Multiplier</span>
            </div>
          </div>
        </div>

        {/* Big Neon Launch Mission Button */}
        <button
          onClick={startGame}
          className="launch-button glow-effect"
        >
          <Rocket size={22} className="btn-icon" />
          <span>LAUNCH MISSION</span>
          <div className="btn-corners" />
        </button>

        <div className="footer-hint">PRESS [SPACE] OR CLICK LAUNCH TO INITIATE</div>
      </div>
    </div>
  );
}

