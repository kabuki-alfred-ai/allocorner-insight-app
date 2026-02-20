import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing, random } from 'remotion';

export interface ThemeStat {
  theme: string;
  count: number;
  percentage: number;
}

// Accent colors per theme — each theme gets its own vibe
const THEME_COLORS = [
  { text: 'from-primary via-orange-400 to-yellow-300', glow: 'rgba(249,115,22,', hsl: '18,90%,65%' },     // #1 orange fire
  { text: 'from-blue-400 via-cyan-400 to-blue-300', glow: 'rgba(59,130,246,', hsl: '215,90%,60%' },       // #2 electric blue
  { text: 'from-emerald-400 via-green-400 to-teal-300', glow: 'rgba(16,185,129,', hsl: '150,70%,50%' },   // #3 neon green
  { text: 'from-purple-400 via-violet-400 to-fuchsia-300', glow: 'rgba(168,85,247,', hsl: '270,70%,65%' },// #4 ultra violet
  { text: 'from-rose-400 via-pink-400 to-red-300', glow: 'rgba(244,63,94,', hsl: '350,80%,60%' },         // #5 hot pink
];

// Scattered positions — [x%, y%, rotation°, scale]
const SCATTERED_POSITIONS: [number, number, number, number][] = [
  [50, 40, 0, 1],
  [28, 22, -6, 0.75],
  [73, 24, 4, 0.7],
  [30, 64, -3, 0.65],
  [70, 66, 5, 0.6],
];

export const ThemesScene: React.FC<{ themes: ThemeStat[] }> = ({ themes }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const topThemes = [...themes].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = topThemes.length > 0 ? topThemes[0].count : 1;

  // === Title — blur-in then dissolve ===
  const titleOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const titleBlur = interpolate(frame, [0, 25], [15, 0], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
  const titleFade = interpolate(frame, [80, 110], [1, 0], { extrapolateRight: 'clamp' });

  // === Background flash on each theme entrance ===
  const getFlashOpacity = (themeIndex: number) => {
    const themeDelay = 100 + themeIndex * 30;
    return interpolate(frame, [themeDelay, themeDelay + 5, themeDelay + 20], [0, 0.15, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };

  // === Fade out ===
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity: fadeOut }} className="flex-1 bg-black flex flex-col items-center justify-center text-white h-full w-full relative overflow-hidden">

      {/* Background flashes for each theme appearance */}
      {topThemes.map((_, i) => {
        const color = THEME_COLORS[i] || THEME_COLORS[0];
        const flashOpacity = getFlashOpacity(i);
        if (flashOpacity <= 0) return null;
        return (
          <div
            key={`flash-${i}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${SCATTERED_POSITIONS[i]?.[0] || 50}% ${SCATTERED_POSITIONS[i]?.[1] || 50}%, ${color.glow}0.4) 0%, transparent 50%)`,
              opacity: flashOpacity,
            }}
          />
        );
      })}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 40%)',
            opacity: interpolate(frame, [80, 120], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        />
      </div>

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none z-[5] mix-blend-overlay"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Title */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: titleOpacity * titleFade,
          transform: `translateY(${titleY}px)`,
          filter: `blur(${titleBlur}px)`,
        }}
      >
        <span className="text-lg md:text-xl font-black uppercase tracking-[0.5em] text-primary/70 block mb-5">
          Thématiques Clés
        </span>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter max-w-4xl leading-[0.95] text-center px-8">
          Ce qui a marqué les{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-primary">
            esprits
          </span>.
        </h2>
      </div>

      {/* Scattered Themes */}
      {topThemes.map((theme, index) => {
        const pos = SCATTERED_POSITIONS[index] || SCATTERED_POSITIONS[0];
        const [baseX, baseY, baseRotation, baseScale] = pos;
        const isTop = index === 0;
        const delayFrames = 100 + index * 30;
        const color = THEME_COLORS[index] || THEME_COLORS[0];

        return (
          <ThemeText
            key={index}
            theme={theme.theme}
            count={theme.count}
            maxCount={maxCount}
            rank={index + 1}
            isTop={isTop}
            baseX={baseX}
            baseY={baseY}
            baseRotation={baseRotation}
            baseScale={baseScale}
            delayFrames={delayFrames}
            durationInFrames={durationInFrames}
            color={color}
          />
        );
      })}

      {/* === NETWORK GRAPH === */}
      <svg className="absolute inset-0 w-full h-full z-[8] pointer-events-none">
        <defs>
          {/* Glow filters per color */}
          {THEME_COLORS.map((c, idx) => (
            <filter key={`glow-${idx}`} id={`glow-${idx}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          ))}
        </defs>

        {/* Lines between ALL pairs */}
        {topThemes.map((_, i) =>
          topThemes.slice(i + 1).map((_, jOffset) => {
            const j = i + 1 + jOffset;
            const from = SCATTERED_POSITIONS[i];
            const to = SCATTERED_POSITIONS[j];
            if (!from || !to) return null;

            const pairDelay = 110 + (i + j) * 12;
            const lineOpacity = interpolate(frame, [pairDelay, pairDelay + 30], [0, 1], { extrapolateRight: 'clamp' });
            const lineColor = THEME_COLORS[Math.min(i, j)] || THEME_COLORS[0];
            const isCentralConnection = i === 0;
            const thickness = isCentralConnection ? 2 : 1;

            // Line draw-in
            const lineLength = Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2));
            const dashOffset = interpolate(frame, [pairDelay, pairDelay + 40], [lineLength * 4, 0], { extrapolateRight: 'clamp' });

            // Multiple traveling dots (2-3 per line)
            const dotCount = isCentralConnection ? 3 : 2;
            const dots = new Array(dotCount).fill(null).map((_, di) => {
              const speed = 0.006 + di * 0.003;
              const offset = di * (1 / dotCount);
              const progress = ((frame - pairDelay) * speed + offset) % 1;
              const dx = from[0] + (to[0] - from[0]) * progress;
              const dy = from[1] + (to[1] - from[1]) * progress;
              const dOpacity = lineOpacity > 0.05 ? 0.4 + di * 0.15 : 0;
              const dSize = isCentralConnection ? 3 + di : 2 + di * 0.5;
              return { dx, dy, dOpacity, dSize, di };
            });

            return (
              <g key={`net-${i}-${j}`}>
                {/* Glow halo line (behind) */}
                <line
                  x1={`${from[0]}%`} y1={`${from[1]}%`}
                  x2={`${to[0]}%`} y2={`${to[1]}%`}
                  stroke={`hsl(${lineColor.hsl})`}
                  strokeWidth={thickness + 4}
                  opacity={lineOpacity * 0.04}
                  strokeLinecap="round"
                />
                {/* Main line */}
                <line
                  x1={`${from[0]}%`} y1={`${from[1]}%`}
                  x2={`${to[0]}%`} y2={`${to[1]}%`}
                  stroke={`hsl(${lineColor.hsl})`}
                  strokeWidth={thickness}
                  strokeDasharray="2 6"
                  strokeDashoffset={dashOffset}
                  opacity={lineOpacity * 0.15}
                  strokeLinecap="round"
                />
                {/* Traveling dots */}
                {dots.map(({ dx, dy, dOpacity, dSize, di }) => (
                  <circle
                    key={`dot-${di}`}
                    cx={`${dx}%`} cy={`${dy}%`}
                    r={dSize}
                    fill={`hsl(${lineColor.hsl})`}
                    opacity={dOpacity}
                    filter={`url(#glow-${Math.min(i, j)})`}
                  />
                ))}
              </g>
            );
          })
        )}

        {/* Node dots + orbiting satellites + pulse rings */}
        {topThemes.map((_, i) => {
          const pos = SCATTERED_POSITIONS[i];
          if (!pos) return null;
          const nodeDelay = 100 + i * 30;
          const nodeOpacity = interpolate(frame, [nodeDelay, nodeDelay + 15], [0, 1], { extrapolateRight: 'clamp' });
          const nodeColor = THEME_COLORS[i] || THEME_COLORS[0];
          const isCenter = i === 0;

          // Pulse rings (expanding circles) — 2 rings staggered
          const pulseRings = [0, 40].map((pd, pi) => {
            const pulseFrame = (frame - nodeDelay - pd) % 80;
            const pulseR = interpolate(pulseFrame, [0, 80], [isCenter ? 6 : 4, isCenter ? 50 : 35], { extrapolateRight: 'clamp' });
            const pulseOpacity = interpolate(pulseFrame, [0, 20, 80], [0, 0.25, 0], { extrapolateRight: 'clamp' });
            return { pulseR, pulseOpacity: pulseOpacity * nodeOpacity, pi };
          });

          // Orbiting satellite dots — 2 small dots orbit the node
          const satellites = [0, 1].map((si) => {
            const orbitR = isCenter ? 22 : 15;
            const speed = 0.02 + si * 0.01;
            const angle = frame * speed + si * Math.PI;
            const sx = pos[0] + Math.cos(angle) * (orbitR / 10); // % units
            const sy = pos[1] + Math.sin(angle) * (orbitR / 10);
            return { sx, sy, si };
          });

          return (
            <g key={`node-${i}`}>
              {/* Pulse rings */}
              {pulseRings.map(({ pulseR, pulseOpacity, pi }) => (
                <circle
                  key={`pulse-${pi}`}
                  cx={`${pos[0]}%`} cy={`${pos[1]}%`}
                  r={pulseR}
                  fill="none"
                  stroke={`hsl(${nodeColor.hsl})`}
                  strokeWidth="1"
                  opacity={pulseOpacity}
                />
              ))}

              {/* Outer glow ring */}
              <circle
                cx={`${pos[0]}%`} cy={`${pos[1]}%`}
                r={isCenter ? 20 : 14}
                fill="none"
                stroke={`hsl(${nodeColor.hsl})`}
                strokeWidth="1.5"
                opacity={nodeOpacity * 0.2}
              />
              {/* Inner dot */}
              <circle
                cx={`${pos[0]}%`} cy={`${pos[1]}%`}
                r={isCenter ? 6 : 4}
                fill={`hsl(${nodeColor.hsl})`}
                opacity={nodeOpacity * 0.6}
                filter={`url(#glow-${i})`}
              />

              {/* Orbiting satellites */}
              {satellites.map(({ sx, sy, si }) => (
                <circle
                  key={`sat-${si}`}
                  cx={`${sx}%`} cy={`${sy}%`}
                  r={isCenter ? 2.5 : 1.5}
                  fill={`hsl(${nodeColor.hsl})`}
                  opacity={nodeOpacity * 0.4}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {topThemes.length === 0 && (
        <p className="text-white/40 italic text-2xl text-center mt-12 z-10">Aucun thème dominant détecté.</p>
      )}
    </div>
  );
};

// === Theme Text — explosive entrance from center ===
const ThemeText: React.FC<{
  theme: string;
  count: number;
  maxCount: number;
  rank: number;
  isTop: boolean;
  baseX: number;
  baseY: number;
  baseRotation: number;
  baseScale: number;
  delayFrames: number;
  durationInFrames: number;
  color: { text: string; glow: string; hsl: string };
}> = ({ theme, count, maxCount, rank, isTop, baseX, baseY, baseRotation, baseScale, delayFrames, durationInFrames, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = Math.max(0, frame - delayFrames);

  // === EXPLOSIVE entrance: start from CENTER (50,50), fly out to position ===
  const explodeProgress = spring({
    frame: localFrame,
    fps,
    config: {
      damping: isTop ? 12 : 14,
      stiffness: isTop ? 100 : 80,
      mass: 0.7,
    },
  });

  // Position interpolates from center to final position
  const currentX = interpolate(explodeProgress, [0, 1], [50, baseX]);
  const currentY = interpolate(explodeProgress, [0, 1], [50, baseY]);

  // Scale: starts BIG then settles
  const enterScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 150, mass: 0.5 },
  });
  const overshootScale = isTop
    ? interpolate(localFrame, [0, 8, 18], [0.3, 1.2, 1], { extrapolateRight: 'clamp' })
    : interpolate(localFrame, [0, 8, 18], [0.2, 1.15, 1], { extrapolateRight: 'clamp' });

  const enterBlur = interpolate(localFrame, [0, 15], [10, 0], { extrapolateRight: 'clamp' });
  const enterRotation = interpolate(localFrame, [0, 20], [baseRotation + (isTop ? 0 : 20 * (rank % 2 === 0 ? 1 : -1)), baseRotation], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // === Very subtle float ===
  const floatX = Math.sin(frame / (60 + rank * 10)) * 0.8;
  const floatY = Math.cos(frame / (55 + rank * 12)) * 0.5;

  // === Counter ===
  const counterProgress = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 40, stiffness: 150 },
  });
  const animatedCount = Math.round(interpolate(counterProgress, [0, 1], [0, count]));

  // === Dominant theme pulse ===
  const dominantPulse = isTop ? 1 + Math.sin(frame / 12) * 0.015 : 1;

  // === Opacity ===
  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      className="absolute z-[12] flex flex-col items-center"
      style={{
        left: `${currentX + floatX}%`,
        top: `${currentY + floatY}%`,
        transform: `translate(-50%, -50%) scale(${overshootScale * baseScale * dominantPulse}) rotate(${enterRotation}deg)`,
        filter: `blur(${enterBlur}px)`,
        opacity,
      }}
    >
      {/* Theme name — gradient colored text */}
      <h3
        className={`font-black tracking-tight leading-none text-center whitespace-nowrap ${
          isTop
            ? `text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-r ${color.text}`
            : `text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r ${color.text}`
        }`}
        style={{
          textShadow: `0 0 ${isTop ? 50 : 30}px ${color.glow}0.2)`,
          // Can't use textShadow with bg-clip-text, so we use a pseudo approach via filter
          filter: isTop ? `drop-shadow(0 0 20px ${color.glow}0.3))` : `drop-shadow(0 0 10px ${color.glow}0.2))`,
        }}
      >
        {theme}
      </h3>

      {/* Counter — colored */}
      <div className="flex items-baseline gap-3 mt-3">
        <span
          className={`font-black ${
            isTop ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
          }`}
          style={{ color: `hsl(${color.hsl})` }}
        >
          {animatedCount}
        </span>
        <span className={`font-bold uppercase tracking-widest ${
          isTop ? 'text-base text-white/35' : 'text-sm text-white/25'
        }`}>
          messages
        </span>
      </div>
    </div>
  );
};
