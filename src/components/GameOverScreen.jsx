import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Sparkles, Navigation, Gauge } from 'lucide-react';

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const distance = useGameStore((state) => state.distance);
  const crystals = useGameStore((state) => state.crystals);
  const speed = useGameStore((state) => state.speed);
  const isNewRecord = useGameStore((state) => state.isNewRecord);
  const restartGame = useGameStore((state) => state.restartGame);

  useEffect(() => {
    if (gameState === 'GAME_OVER' && isNewRecord) {
      // Fire victory confetti fireworks!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff007f', '#ffe600', '#ffffff']
        });
      } catch (e) {}
    }
  }, [gameState, isNewRecord]);

  if (gameState !== 'GAME_OVER') return null;

  return (
    <div className="overlay-screen game-over-screen">
      <div className="cyber-modal game-over-modal animate-glitch-in">
        <div className="status-tag status-danger">SIGNAL LOST // HULL CRUSHED</div>

        <h1 className="game-over-title">MISSION TERMINATED</h1>

        {isNewRecord && (
          <div className="new-record-pill animate-bounce">
            <Trophy size={18} />
            <span>NEW HIGH SCORE RECORD!</span>
          </div>
        )}

        {/* Primary Score Counter */}
        <div className="final-score-box">
          <div className="final-score-label">FINAL MISSION SCORE</div>
          <div className="final-score-value neon-cyan">{score.toLocaleString()}</div>
        </div>

        {/* Breakdown Grid */}
        <div className="stats-breakdown-grid">
          <div className="stat-card">
            <div className="stat-card-title">
              <Trophy size={15} className="text-gold" />
              <span>RECORD</span>
            </div>
            <div className="stat-card-value text-gold">{highScore.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <Navigation size={15} className="text-magenta" />
              <span>DISTANCE</span>
            </div>
            <div className="stat-card-value text-magenta">{Math.floor(distance)} m</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <Sparkles size={15} className="text-cyan" />
              <span>CRYSTALS</span>
            </div>
            <div className="stat-card-value text-cyan">{crystals}</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-title">
              <Gauge size={15} className="text-yellow" />
              <span>TOP VELOCITY</span>
            </div>
            <div className="stat-card-value text-yellow">{Math.floor(speed * 12)} km/h</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={restartGame}
          className="restart-button glow-effect"
        >
          <RotateCcw size={22} className="btn-icon animate-spin-reverse" />
          <span>REBOOT & RESTART</span>
          <div className="btn-corners" />
        </button>

        <div className="footer-hint">PRESS [SPACE] OR CLICK REBOOT TO RE-ENGAGE</div>
      </div>
    </div>
  );
}

