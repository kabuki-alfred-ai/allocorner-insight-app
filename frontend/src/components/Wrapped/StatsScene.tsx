import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing, random } from 'remotion';
import { MessageSquare, Clock, Users, TrendingUp } from 'lucide-react';

interface StatConfig {
  value: number;
  format: (v: number) => string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  glowHsl: string; // e.g. '18, 90%, 65%'
  accentColor: string; // Tailwind-friendly
  ringTarget: number; // 0-1, how full the ring gets
}

// === Animated ring that fills up ===
const AnimatedRing: React.FC<{
  progress: number;
  size: number;
  color: string;
  glowColor: string;
}> = ({ progress, size, color, glowColor }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-90deg)',
        filter: `drop-shadow(0 0 12px ${glowColor})`,
      }}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      {/* Animated fill ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const StatsScene: React.FC<{
  messagesCount: number;
  durationSeconds: number;
  ircScore: number;
  participationRate: number;
}> = ({ messagesCount, durationSeconds, ircScore, participationRate }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const stats: StatConfig[] = [
    {
      value: messagesCount,
      format: (v) => Math.round(v).toLocaleString('fr-FR'),
      label: 'Témoignages',
      sublabel: 'récoltés au total',
      icon: <MessageSquare className="w-10 h-10" />,
      glowHsl: '18, 90%, 65%',
      accentColor: 'rgba(249,115,22,',
      ringTarget: Math.min(messagesCount / 100, 1),
    },
    {
      value: durationSeconds,
      format: (v) => formatDuration(v),
      label: "Temps d'écoute",
      sublabel: 'de parole analysée',
      icon: <Clock className="w-10 h-10" />,
      glowHsl: '215, 90%, 60%',
      accentColor: 'rgba(59,130,246,',
      ringTarget: Math.min(durationSeconds / 3600, 1),
    },
    {
      value: ircScore,
      format: (v) => `${v.toFixed(1)}/10`,
      label: 'Score Climat',
      sublabel: 'indice IRC global',
      icon: <TrendingUp className="w-10 h-10" />,
      glowHsl: '150, 70%, 50%',
      accentColor: 'rgba(16,185,129,',
      ringTarget: ircScore / 10,
    },
    {
      value: participationRate * 100,
      format: (v) => `${Math.round(v)}%`,
      label: 'Participation',
      sublabel: "taux d'engagement",
      icon: <Users className="w-10 h-10" />,
      glowHsl: '270, 70%, 65%',
      accentColor: 'rgba(168,85,247,',
      ringTarget: participationRate,
    },
  ];

  const framesPerStat = Math.floor(durationInFrames / stats.length);

  return (
    <div className="flex-1 bg-black flex items-center justify-center h-full w-full relative overflow-hidden">
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none z-[5] mix-blend-overlay"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          transform: `translate(${Math.sin(frame * 0.5) * 2}px, ${Math.cos(frame * 0.3) * 2}px)`,
        }}
      />

      {stats.map((stat, i) => {
        const startFrame = i * framesPerStat;
        const localFrame = frame - startFrame;

        if (localFrame < -10 || localFrame > framesPerStat + 10) return null;

        // === Entrance — zoom-in from scale 0.7 + blur ===
        const enterScale = spring({
          frame: localFrame,
          fps,
          config: { damping: 14, stiffness: 100, mass: 0.7 },
        });
        const enterOpacity = interpolate(localFrame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const enterBlur = interpolate(localFrame, [0, 18], [12, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // === Exit — zoom-out + fade ===
        const exitOpacity = interpolate(localFrame, [framesPerStat - 12, framesPerStat], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const exitScale = interpolate(localFrame, [framesPerStat - 12, framesPerStat], [1, 1.08], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const opacity = Math.min(enterOpacity, exitOpacity);
        const scale = enterScale * (localFrame > framesPerStat - 12 ? exitScale : 1);

        // === Counter — spring snap ===
        const counterProgress = spring({
          frame: localFrame - 8,
          fps,
          config: { damping: 50, stiffness: 180, mass: 0.5 },
        });
        const animatedValue = interpolate(counterProgress, [0, 1], [0, stat.value]);

        // === Ring fill ===
        const ringProgress = spring({
          frame: localFrame - 12,
          fps,
          config: { damping: 30, stiffness: 80 },
        });

        // === Icon — spring entrance with bounce ===
        const iconScale = spring({
          frame: localFrame - 3,
          fps,
          config: { damping: 8, mass: 0.4, stiffness: 200 },
        });

        // === Label — staggered slide in from left ===
        const labelOpacity = interpolate(localFrame, [22, 35], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const labelX = interpolate(localFrame, [22, 35], [-30, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        });
        const sublabelOpacity = interpolate(localFrame, [30, 42], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // === Background glow ===
        const glowOpacity = interpolate(localFrame, [0, 20, framesPerStat - 15, framesPerStat], [0, 0.4, 0.4, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const glowPulse = 1 + Math.sin(localFrame / 18) * 0.04;

        // === Decorative particles specific to this stat ===
        const statParticles = new Array(8).fill(null).map((_, pi) => {
          const seed = `stat-${i}-p-${pi}`;
          const angle = random(seed) * Math.PI * 2;
          const dist = 180 + random(`${seed}-d`) * 120;
          const px = 50 + Math.cos(angle + localFrame * 0.005) * (dist / 10);
          const py = 50 + Math.sin(angle + localFrame * 0.005) * (dist / 10);
          const pSize = 2 + random(`${seed}-s`) * 3;
          const pOpacity = interpolate(localFrame, [10, 25, framesPerStat - 10, framesPerStat], [0, 0.3, 0.3, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={pi}
              style={{
                position: 'absolute',
                left: `${px}%`,
                top: `${py}%`,
                width: pSize,
                height: pSize,
                borderRadius: '50%',
                backgroundColor: `hsl(${stat.glowHsl})`,
                opacity: pOpacity,
                filter: 'blur(1px)',
              }}
            />
          );
        });

        return (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-center text-white"
            style={{
              opacity,
              transform: `scale(${scale})`,
              filter: `blur(${enterBlur}px)`,
            }}
          >
            {/* Background glow per stat */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: glowOpacity }}
            >
              <div
                style={{
                  width: '150%',
                  height: '150%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at center, ${stat.accentColor}0.2) 0%, ${stat.accentColor}0.05) 30%, transparent 55%)`,
                  transform: `scale(${glowPulse})`,
                }}
              />
            </div>

            {/* Stat particles */}
            <div className="absolute inset-0 pointer-events-none">{statParticles}</div>

            {/* Icon with animated ring */}
            <div className="mb-10 relative" style={{ width: 120, height: 120 }}>
              {/* SVG Ring */}
              <AnimatedRing
                progress={ringProgress * stat.ringTarget}
                size={120}
                color={`hsl(${stat.glowHsl})`}
                glowColor={`${stat.accentColor}0.3)`}
              />
              {/* Icon center */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `scale(${iconScale})`,
                  color: `hsl(${stat.glowHsl})`,
                }}
              >
                {stat.icon}
              </div>
            </div>

            {/* Counter — massive number */}
            <div className="z-10 mb-5">
              <span
                className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none text-white"
                style={{
                  textShadow: `0 0 80px ${stat.accentColor}0.25), 0 2px 0 rgba(0,0,0,0.3)`,
                }}
              >
                {stat.format(animatedValue)}
              </span>
            </div>

            {/* Labels — staggered entrance */}
            <div className="z-10 flex flex-col items-center gap-2">
              <span
                className="text-2xl md:text-3xl font-black uppercase tracking-[0.3em] text-white/80"
                style={{ opacity: labelOpacity, transform: `translateX(${labelX}px)` }}
              >
                {stat.label}
              </span>
              <span
                className="text-lg md:text-xl font-medium text-white/30 tracking-widest uppercase"
                style={{ opacity: sublabelOpacity }}
              >
                {stat.sublabel}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
