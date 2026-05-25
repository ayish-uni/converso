import React, { useEffect, useState } from 'react';

export function LivingBackground({ culturalTheme = 'english', chatMode = 'classic' }) {
  const [particlePositions, setParticlePositions] = useState([]);

  useEffect(() => {
    const particles = Array.from({ length: 15 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
    setParticlePositions(particles);
  }, []);

  const renderPattern = () => {
    switch (culturalTheme) {
      case 'japanese':
        return (
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="sakura-pattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="50" cy="25" r="3" fill="currentColor" opacity="0.5" />
                <circle cx="35" cy="50" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="65" cy="50" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="25" cy="75" r="1.5" fill="currentColor" opacity="0.2" />
                <circle cx="75" cy="75" r="1.5" fill="currentColor" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#sakura-pattern)" />
          </svg>
        );

      case 'arabic':
        return (
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="mashrabiya-pattern"
                x="0"
                y="0"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <rect x="10" y="10" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <line x1="10" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="0.5" />
                <line x1="30" y1="10" x2="30" y2="50" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#mashrabiya-pattern)" />
          </svg>
        );

      case 'spanish':
        return (
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="flamenco-pattern"
                x="0"
                y="0"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <polygon points="40,10 50,35 75,35 55,50 65,75 40,60 15,75 25,50 5,35 30,35" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#flamenco-pattern)" />
          </svg>
        );

      case 'chinese':
        return (
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="tai-chi-pattern"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="50" cy="30" r="15" fill="currentColor" opacity="0.5" />
                <circle cx="50" cy="70" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#tai-chi-pattern)" />
          </svg>
        );

      default:
        return (
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#grid-pattern)" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 'var(--z-atmosphere)' }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 text-white">
        {renderPattern()}
      </div>

      {/* Floating particles (language-specific) */}
      <div className="absolute inset-0">
        {particlePositions.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          style={{
            top: '-50%',
            right: '-25%',
            animation: 'glow-pulse 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"
          style={{
            bottom: '-25%',
            left: '-10%',
            animation: 'glow-pulse 6s ease-in-out infinite 2s',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { transform: translateY(-30px) translateX(10px); opacity: 0.5; }
        }
        @keyframes glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
