import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';

export function HUD() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const speed = useGameStore((state) => state.speed);
  const crystals = useGameStore((state) => state.crystals);
  const multiplier = useGameStore((state) => state.multiplier);
  const laneX = useGameStore((state) => state.laneX);
  const laneY = useGameStore((state) => state.laneY);
  const isMuted = useGameStore((state) => state.isMuted);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const hasShield = useGameStore((state) => state.hasShield);
  const shieldTimer = useGameStore((state) => state.shieldTimer);

  if (gameState !== 'PLAYING') return null;

  const speedKmh = Math.floor(speed * 12);
  const speedPercent = Math.min(100, Math.floor(((speed - 42) / (115 - 42)) * 100));

  return (
    <div className="hud-overlay">
      {/* Top Header Bar */}
      <div className="hud-top">
        {/* Score Display */}
        <div className="hud-panel hud-score">
          <div className="hud-label">SCORE</div>
          <div className="hud-value neon-cyan">{score.toLocaleString()}</div>
          {multiplier > 1 && (
            <div className="hud-multiplier neon-magenta animate-pulse">
              {multiplier}x MULTIPLIER
            </div>
          )}
        </div>

        {/* Center Mission Stats */}
        <div className="hud-panel hud-center-stats">
          <div className="hud-crystal-badge">
            <Sparkles size={16} className="text-cyan" />
            <span className="crystal-count">{crystals}</span>
            <span className="crystal-label">CRYSTALS</span>
          </div>

          {/* Active Shield Indicator */}
          {hasShield && (
            <div className="hud-shield-indicator animate-pulse">
              <Shield size={16} className="text-gold" />
              <div className="shield-info">
                <span className="shield-label">SHIELD ACTIVE</span>
                <span className="shield-seconds">{shieldTimer.toFixed(1)}s</span>
              </div>
            </div>
          )}

          <div className="hud-grid-radar" title="Current 3x3 Zero-G Sector">
            <div className="radar-title">SECTOR</div>
            <div className="radar-grid">
              {[-1, 0, 1].reverse().map((y) => (
                <div key={y} className="radar-row">
                  {[-1, 0, 1].map((x) => {
                    const isActive = laneX === x && laneY === y;
                    return (
                      <div
                        key={`${x},${y}`}
                        className={`radar-cell ${isActive ? 'active' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High Score & Audio Button */}
        <div className="hud-right-group">
          <div className="hud-panel hud-highscore">
            <div className="hud-label">HIGH SCORE</div>
            <div className="hud-value-sub neon-gold">{highScore.toLocaleString()}</div>
          </div>

          <button
            onClick={toggleMute}
            className="hud-icon-btn"
            title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry: Speedometer Gauge */}
      <div className="hud-bottom">
        <div className="speed-gauge-panel">
          <div className="speed-info">
            <span className="speed-label">VELOCITY</span>
            <span className="speed-digits neon-cyan">{speedKmh} <small>KM/H</small></span>
          </div>
          <div className="speed-track">
            <div
              className="speed-fill"
              style={{ width: `${Math.max(8, speedPercent)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
