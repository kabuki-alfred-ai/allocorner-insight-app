import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing, random } from 'remotion';

// Exploding particles that radiate from center
const ExplodingParticles: React.FC<{ count?: number }> = ({ count = 35 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {new Array(count).fill(null).map((_, i) => {
        const seed = `outro-particle-${i}`;
        // Angle of the particle from center
        const angle = random(seed) * Math.PI * 2;
        const speed = 1.5 + random(`${seed}-speed`) * 3;
        const size = 3 + random(`${seed}-size`) * 6;
        const delay = random(`${seed}-delay`) * 20;
        
        const localFrame = Math.max(0, frame - 15 - delay);
        const distance = localFrame * speed;
        
        // Position from center
        const x = 50 + Math.cos(angle) * distance * 0.8;
        const y = 50 + Math.sin(angle) * distance * 0.5;
        
        // Fade out as particle travels
        const particleOpacity = interpolate(localFrame, [0, 10, 60], [0, 0.7, 0], { 
          extrapolateRight: 'clamp', extrapolateLeft: 'clamp' 
        });

        if (particleOpacity <= 0) return null;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: `hsl(${18 + random(`${seed}-hue`) * 20}, 90%, ${55 + random(`${seed}-light`) * 25}%)`,
              opacity: particleOpacity,
              filter: `blur(${random(`${seed}-blur`) * 1}px)`,
              boxShadow: `0 0 ${size * 2}px rgba(249,115,22,0.4)`,
            }}
          />
        );
      })}
    </div>
  );
};

export const OutroScene: React.FC<{ clientName: string }> = ({ clientName }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // === Phase 1: Icon appears (0-30f) ===
  const iconSpring = spring({ frame: frame - 10, fps, config: { damping: 8, mass: 0.5 } });
  const iconGlow = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  // === Phase 2: Thank you text (25-60f) ===
  const textSpring = spring({ frame: frame - 25, fps, config: { damping: 14, mass: 0.7 } });
  const textOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
  const textBlur = interpolate(frame, [25, 45], [12, 0], { extrapolateRight: 'clamp' });

  // === Phase 3: Subtitle (50-80f) ===
  const subtitleOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [55, 75], [20, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  // === Phase 4: Branding / CTA (70-100f) ===
  const brandOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' });

  // === Background aura ===
  const auraOpacity = interpolate(frame, [0, 30], [0, 0.35], { extrapolateRight: 'clamp' });
  const auraScale = interpolate(frame, [0, durationInFrames], [0.8, 1.6], { extrapolateRight: 'clamp' });

  // === Final convergence fade-out (last 25 frames) ===
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });
  const convergeScale = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0.95], { extrapolateRight: 'clamp' });

  return (
    <div 
      style={{ opacity: fadeOut, transform: `scale(${convergeScale})` }} 
      className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center text-white h-full w-full relative overflow-hidden"
    >
      {/* Exploding Particles */}
      <ExplodingParticles count={35} />

      {/* Background Aura */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: auraOpacity }}
      >
        <div
          style={{
            width: '180%',
            height: '180%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.05) 35%, transparent 60%)',
            transform: `scale(${auraScale})`,
          }}
        />
      </div>

      <div className="z-10 flex flex-col items-center">
        
        {/* Animated Check Icon */}
        <div 
          className="mb-10"
          style={{ 
            transform: `scale(${iconSpring})`,
          }}
        >
          <div 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)',
              border: '2px solid rgba(249,115,22,0.2)',
              boxShadow: `0 0 ${40 + iconGlow * 30}px rgba(249,115,22,${0.1 + iconGlow * 0.2})`,
            }}
          >
            {/* Custom animated checkmark using SVG */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M12 24L20 32L36 16"
                stroke="hsl(18, 90%, 65%)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60"
                strokeDashoffset={interpolate(frame, [15, 45], [60, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) })}
              />
            </svg>
          </div>
        </div>

        {/* Thank You Text */}
        <div 
          style={{ 
            opacity: textOpacity, 
            transform: `scale(${textSpring})`,
            filter: `blur(${textBlur}px)`,
          }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-3 leading-[0.9]">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
              Merci, 
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
              {clientName}.
            </span>
          </h2>
        </div>

        {/* Subtitle */}
        <div style={{ opacity: subtitleOpacity, transform: `translateY(${subtitleY}px)` }} className="mt-6">
          <p className="text-xl md:text-2xl text-white/40 font-bold tracking-[0.3em] uppercase">
            L'écoute continue.
          </p>
        </div>

        {/* Branding */}
        <div style={{ opacity: brandOpacity }} className="mt-16">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-black text-white/20 uppercase tracking-[0.5em]">
              AlloCorner Insight
            </span>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
