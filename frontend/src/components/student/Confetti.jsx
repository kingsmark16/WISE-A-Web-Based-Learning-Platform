import React, { useEffect, useState } from 'react';

/**
 * Confetti Animation Component
 * Creates a celebratory confetti effect when quiz is submitted
 */
const Confetti = ({ active, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate confetti particles with tech-themed colors
    const techColors = [
      '#00d9ff', // Bright cyan
      '#0891b2', // Cyan-600
      '#06b6d4', // Cyan-500
      '#0ea5e9', // Sky blue
      '#3b82f6', // Blue-500
      '#1e40af', // Blue-800
      '#1e3a8a', // Blue-950
      '#10b981', // Emerald
      '#06d6a0', // Teal
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#ec4899', // Pink (futuristic)
      '#f43f5e', // Rose (neon)
      '#14b8a6', // Teal accent
      '#f97316', // Orange (tech accent)
      '#22d3ee', // Cyan-300
    ];

    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 0.5,
      animationDuration: 2.5 + Math.random() * 2,
      backgroundColor: techColors[Math.floor(Math.random() * techColors.length)],
      width: 6 + Math.random() * 8,
      height: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      opacity: 0.7 + Math.random() * 0.3,
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    }));

    setParticles(newParticles);

    // Clear particles after animation
    const timeout = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-xl sm:rounded-2xl">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.animationDelay}s`,
            animationDuration: `${particle.animationDuration}s`,
          }}
        >
          <div
            className={`animate-confetti-spin ${particle.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
            style={{
              backgroundColor: particle.backgroundColor,
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              transform: `rotate(${particle.rotation}deg)`,
              opacity: particle.opacity,
              animationDuration: `${particle.animationDuration * 0.5}s`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      ))}
      
      {/* Success message overlay with tech celebration */}
      <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 pointer-events-auto bg-gradient-to-br from-slate-950 via-cyan-950/80 to-blue-950/80 backdrop-blur-md">
        <div className="text-center max-w-md mx-4 px-8 py-10 relative">
          {/* Tech grid background */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 400">
              <g stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1">
                <line x1="0" y1="40" x2="400" y2="40" />
                <line x1="0" y1="80" x2="400" y2="80" />
                <line x1="0" y1="120" x2="400" y2="120" />
                <line x1="0" y1="160" x2="400" y2="160" />
                <line x1="0" y1="200" x2="400" y2="200" />
                <line x1="0" y1="240" x2="400" y2="240" />
                <line x1="0" y1="280" x2="400" y2="280" />
                <line x1="0" y1="320" x2="400" y2="320" />
                <line x1="0" y1="360" x2="400" y2="360" />
                <line x1="40" y1="0" x2="40" y2="400" />
                <line x1="80" y1="0" x2="80" y2="400" />
                <line x1="120" y1="0" x2="120" y2="400" />
                <line x1="160" y1="0" x2="160" y2="400" />
                <line x1="200" y1="0" x2="200" y2="400" />
                <line x1="240" y1="0" x2="240" y2="400" />
                <line x1="280" y1="0" x2="280" y2="400" />
                <line x1="320" y1="0" x2="320" y2="400" />
                <line x1="360" y1="0" x2="360" y2="400" />
              </g>
            </svg>
          </div>

          {/* Main success icon - Tech style */}
          <div className="relative mb-6">
            {/* Outer glow rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-cyan-500/30 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-500/50 rounded-full animate-pulse"></div>
            
            {/* Main icon container */}
            <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce border-2 border-cyan-300/50">
              {/* Inner tech frame */}
              <div className="absolute inset-2 border border-cyan-200/40 rounded-xl"></div>
              
              {/* Checkmark with tech style */}
              <svg
                className="w-16 h-16 text-white drop-shadow-lg relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Corner tech accents */}
            <div className="absolute -top-4 -right-4 w-6 h-6 border-2 border-cyan-400 rounded-lg animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 border-2 border-blue-400 rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute -top-2 -left-6 text-cyan-400 text-2xl font-bold animate-pulse" style={{ animationDelay: '0.1s' }}>&lt;</div>
            <div className="absolute -top-2 -right-6 text-blue-400 text-2xl font-bold animate-pulse" style={{ animationDelay: '0.2s' }}>&gt;</div>
          </div>
          
          {/* Tech text with glow */}
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-2 animate-in slide-in-from-bottom-2 duration-700 tracking-wider" style={{ animationDelay: '0.2s' }}>
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg font-mono">
                SUCCESS
              </span>
            </h3>
            
            <div className="mb-4">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-lg mb-3 animate-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: '0.3s' }}>
                <p className="text-lg font-bold text-cyan-300 font-mono">STATUS: COMPLETED</p>
              </div>
            </div>
            
            <p className="text-base text-blue-200 font-medium animate-in slide-in-from-bottom-2 duration-700 font-mono" style={{ animationDelay: '0.4s' }}>
              Processing submission...
            </p>
          </div>
          
          {/* Tech loading indicator - Scanner effect */}
          <div className="mt-8 animate-in fade-in duration-700" style={{ animationDelay: '0.6s' }}>
            <div className="relative h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/50">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse rounded-full" style={{
                animation: 'slide-progress 2s ease-in-out infinite'
              }}></div>
            </div>
            <p className="text-xs text-cyan-400 mt-3 font-mono">ANALYZING_ANSWERS...</p>
          </div>

          {/* Tech stats display */}
          <div className="mt-6 space-y-2 text-xs text-cyan-300 font-mono animate-in fade-in duration-700" style={{ animationDelay: '0.8s' }}>
            <div className="flex justify-between px-3 py-1 bg-cyan-950/40 rounded border border-cyan-500/30">
              <span>Submission ID:</span>
              <span className="text-blue-300">{Math.random().toString(36).substring(7)}</span>
            </div>
            <div className="flex justify-between px-3 py-1 bg-cyan-950/40 rounded border border-cyan-500/30">
              <span>Grade Status:</span>
              <span className="text-blue-300 animate-pulse">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confetti;
