import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing, random } from 'remotion';

// === Floating Particles with organic movement ===
const Particles: React.FC<{ count?: number }> = ({ count = 30 }) => {
  const frame = useCurrentFrame();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {new Array(count).fill(null).map((_, i) => {
        const seed = `p-${i}`;
        const x = random(seed) * 100;
        const baseSpeed = 0.1 + random(`${seed}-sp`) * 0.3;
        const size = 2 + random(`${seed}-sz`) * 6;
        const startY = random(`${seed}-off`) * 130;
        const y = ((startY + frame * baseSpeed) % 140) - 20;
        const driftX = Math.sin(frame / (25 + random(`${seed}-d`) * 35) + random(`${seed}-ph`) * 6) * 12;
        const driftY = Math.cos(frame / (30 + random(`${seed}-dy`) * 20)) * 5;
        const pulseOpacity = 0.15 + Math.sin(frame / (15 + random(`${seed}-po`) * 20)) * 0.1;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x + driftX * 0.3}%`,
              bottom: `${y + driftY}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: `hsl(${15 + random(`${seed}-hue`) * 15}, 90%, ${55 + random(`${seed}-l`) * 25}%)`,
              opacity: pulseOpacity + random(`${seed}-op`) * 0.2,
              filter: `blur(${random(`${seed}-bl`) * 1.5}px)`,
              boxShadow: size > 4 ? `0 0 ${size * 3}px rgba(249,115,22,0.25)` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

// === Concentric expanding rings ===
const ExpandingRings: React.FC = () => {
  const frame = useCurrentFrame();
  const ringCount = 3;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]">
      {new Array(ringCount).fill(null).map((_, i) => {
        const delay = i * 25;
        const localFrame = Math.max(0, frame - 30 - delay);
        const size = interpolate(localFrame, [0, 80], [0, 1200 + i * 400], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
        const opacity = interpolate(localFrame, [0, 15, 80], [0, 0.25, 0], { extrapolateRight: 'clamp' });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: '1px solid rgba(249,115,22,0.3)',
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

export const IntroScene: React.FC<{ clientName: string; projectName: string }> = ({
  clientName,
  projectName,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // === GLOBAL: Multi-layered parallax background ===
  const auraOpacity = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: 'clamp' });
  const auraPulse = 1 + Math.sin(frame / 20) * 0.06;

  // Layer 1: Deep warm glow — center
  const glow1Scale = interpolate(frame, [0, 90], [0.4, 1.3], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  // Layer 2: Cold accent — top right, slower
  const glow2X = interpolate(frame, [0, durationInFrames], [60, 70], { extrapolateRight: 'clamp' });
  const glow2Y = interpolate(frame, [0, durationInFrames], [20, 35], { extrapolateRight: 'clamp' });
  // Layer 3: Bottom warm — bottom left
  const glow3Y = 70 + Math.sin(frame / 40) * 5;

  // === PHASE 1 (0-60f): Everything fades in, rings expand ===

  // === PHASE 2 (25-80f): Client name — typewriter with glow cursor ===
  const clientLetters = clientName.split('');
  const typewriterStart = 25;
  const charsPerFrame = 0.3; // Fast enough to finish in time
  const visibleChars = Math.floor(Math.max(0, (frame - typewriterStart) * charsPerFrame));
  const typewriterDone = visibleChars >= clientLetters.length;
  const clientFadeIn = interpolate(frame, [typewriterStart, typewriterStart + 10], [0, 1], { extrapolateRight: 'clamp' });

  // === PHASE 3 (70-140f): Decorative line expands + project name slam ===
  const lineProgress = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });

  const projectDelay = 80;
  const projectScale = spring({
    frame: frame - projectDelay,
    fps,
    config: { damping: 7, stiffness: 120, mass: 0.9 },
  });
  const projectOpacity = interpolate(frame, [projectDelay - 5, projectDelay + 15], [0, 1], { extrapolateRight: 'clamp' });
  const projectBlur = interpolate(frame, [projectDelay, projectDelay + 25], [25, 0], { extrapolateRight: 'clamp' });

  // Gradient position on project name shifts over time
  const gradientAngle = interpolate(frame, [projectDelay, durationInFrames], [135, 200], { extrapolateRight: 'clamp' });

  // === PHASE 4 (160-220f): Subtitle fades in ===
  const subtitleOpacity = interpolate(frame, [160, 195], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleY = interpolate(frame, [160, 195], [25, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const subtitleLetterSpacing = interpolate(frame, [160, 210], [0.8, 0.45], { extrapolateRight: 'clamp' });

  // === FADE OUT (last 25 frames) ===
  const fadeOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });
  const scaleOut = interpolate(frame, [durationInFrames - 25, durationInFrames], [1, 1.05], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{ opacity: fadeOut, transform: `scale(${scaleOut})` }}
      className="flex-1 bg-black flex flex-col items-center justify-center text-center text-white h-full w-full relative overflow-hidden"
    >
      {/* === BACKGROUND LAYERS === */}

      {/* Layer 1: Center warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: auraOpacity * 0.5 }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${glow1Scale * auraPulse})`,
            width: '140%',
            height: '140%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at center, rgba(249,115,22,0.18) 0%, rgba(249,80,0,0.06) 35%, transparent 60%)',
          }}
        />
      </div>

      {/* Layer 2: Accent drift — top right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: auraOpacity * 0.3 }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${glow2X}%`,
            top: `${glow2Y}%`,
            transform: 'translate(-50%, -50%)',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Layer 3: Bottom warm pool */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: auraOpacity * 0.25 }}
      >
        <div
          style={{
            position: 'absolute',
            left: '30%',
            top: `${glow3Y}%`,
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 60%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Film grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] mix-blend-overlay"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          transform: `translate(${Math.sin(frame * 0.7) * 2}px, ${Math.cos(frame * 0.5) * 2}px)`,
        }}
      />

      {/* Particles */}
      <Particles count={30} />

      {/* Expanding Rings */}
      <ExpandingRings />

      {/* === CONTENT === */}
      <div className="z-10 w-full flex flex-col items-center px-8">

        {/* Client Name — Typewriter with glowing cursor */}
        <div style={{ opacity: clientFadeIn }} className="mb-5 h-16 flex items-center justify-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase" style={{ letterSpacing: '0.5em' }}>
            {clientLetters.map((letter, i) => {
              const charVisible = i < visibleChars;
              const isLatest = i === visibleChars - 1 && !typewriterDone;
              return (
                <span
                  key={i}
                  style={{
                    opacity: charVisible ? 1 : 0,
                    color: isLatest ? '#fff' : 'hsl(18, 90%, 65%)',
                    textShadow: isLatest ? '0 0 20px rgba(255,255,255,0.6)' : '0 0 15px rgba(249,115,22,0.3)',
                    transition: 'color 0.3s, text-shadow 0.3s',
                  }}
                >
                  {letter}
                </span>
              );
            })}
            {/* Pulsing cursor */}
            {!typewriterDone && (
              <span
                className="inline-block w-[3px] h-[0.9em] ml-1 align-middle rounded-full"
                style={{
                  backgroundColor: 'hsl(18, 90%, 65%)',
                  opacity: Math.sin(frame / 2.5) > 0 ? 0.9 : 0.2,
                  boxShadow: '0 0 8px rgba(249,115,22,0.6)',
                }}
              />
            )}
          </h2>
        </div>

        {/* Decorative line — expands from center */}
        <div className="relative h-[2px] mb-10 overflow-hidden" style={{ width: 180 }}>
          <div
            className="absolute top-0 left-1/2 h-full bg-gradient-to-r from-transparent via-primary/70 to-transparent"
            style={{
              width: `${lineProgress * 100}%`,
              transform: 'translateX(-50%)',
              boxShadow: lineProgress > 0.5 ? '0 0 12px rgba(249,115,22,0.3)' : 'none',
            }}
          />
        </div>

        {/* Project Name — Cinematic slam with animated gradient */}
        <div
          style={{
            opacity: projectOpacity,
            transform: `scale(${projectScale})`,
            filter: `blur(${projectBlur}px)`,
          }}
          className="mb-6 relative"
        >
          {/* Ghost shadow behind the text for depth */}
          <h1
            className="text-7xl md:text-[7.5rem] lg:text-[9.5rem] font-black tracking-[-0.04em] leading-[0.85] absolute inset-0"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(249,115,22,0.08)',
              transform: 'scale(1.02) translateY(3px)',
              filter: 'blur(3px)',
            }}
            aria-hidden
          >
            {projectName}
          </h1>
          {/* Main text */}
          <h1
            className="text-7xl md:text-[7.5rem] lg:text-[9.5rem] font-black tracking-[-0.04em] leading-[0.85] relative"
            style={{
              backgroundImage: `linear-gradient(${gradientAngle}deg, #ffffff 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.5) 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {projectName}
          </h1>
        </div>

        {/* Subtitle — tracking animation */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
          className="mt-10"
        >
          <p
            className="text-xl md:text-2xl text-white/35 font-bold uppercase"
            style={{ letterSpacing: `${subtitleLetterSpacing}em` }}
          >
            Le projet en revue
          </p>
        </div>
      </div>
    </div>
  );
};
