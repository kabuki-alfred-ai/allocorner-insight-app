import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from 'remotion';

export interface ThemeStat {
 theme: string;
 count: number;
 percentage: number;
}

// Minimalist accent colors - subtle and elegant
const THEME_COLORS = [
 { text: 'text-white', line: '#ffffff' },
 { text: 'text-white/80', line: 'rgba(255,255,255,0.8)' },
 { text: 'text-white/60', line: 'rgba(255,255,255,0.6)' },
 { text: 'text-white/40', line: 'rgba(255,255,255,0.4)' },
 { text: 'text-white/20', line: 'rgba(255,255,255,0.2)' },
];

// Scattered positions — [x%, y%, rotation°, scale]
const SCATTERED_POSITIONS: [number, number, number, number][] = [
 [50, 45, 0, 1],
 [25, 25, 0, 0.75],
 [75, 25, 0, 0.7],
 [25, 65, 0, 0.65],
 [75, 65, 0, 0.6],
];

export const ThemesScene: React.FC<{ themes: ThemeStat[] }> = ({ themes }) => {
 const frame = useCurrentFrame();
 const { fps, durationInFrames } = useVideoConfig();

 const topThemes = [...themes].sort((a, b) => b.count - a.count).slice(0, 5);
 const maxCount = topThemes.length > 0 ? topThemes[0].count : 1;

 // === Title — clean fade in ===
 const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
 const titleY = interpolate(frame, [0, 20], [15, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) });
 const titleFade = interpolate(frame, [80, 100], [1, 0], { extrapolateRight: 'clamp' });

 // === Fade out ===
 const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });

 return (
 <div style={{ opacity: fadeOut }} className="flex-1 bg-black flex flex-col items-center justify-center text-white h-full w-full relative overflow-hidden">

 {/* Title */}
 <div
 className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
 style={{
 opacity: titleOpacity * titleFade,
 transform:`translateY(${titleY}px)`,
 }}
 >
 <span className="text-sm md:text-base font-medium tracking-[0.2em] text-white/50 block mb-4">
 Thématiques Clés
 </span>
 <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-2xl leading-tight text-center px-8">
 Ce qui a marqué les esprits.
 </h2>
 </div>

 {/* Scattered Themes */}
 {topThemes.map((theme, index) => {
 const pos = SCATTERED_POSITIONS[index] || SCATTERED_POSITIONS[0];
 const [baseX, baseY, baseRotation, baseScale] = pos;
 const isTop = index === 0;
 const delayFrames = 90 + index * 20;
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

 {/* === MINIMALIST NETWORK GRAPH === */}
 <svg className="absolute inset-0 w-full h-full z-[8] pointer-events-none">
 {topThemes.map((_, i) =>
 topThemes.slice(i + 1).map((_, jOffset) => {
 const j = i + 1 + jOffset;
 const from = SCATTERED_POSITIONS[i];
 const to = SCATTERED_POSITIONS[j];
 if (!from || !to) return null;

 const pairDelay = 100 + (i + j) * 10;
 const lineOpacity = interpolate(frame, [pairDelay, pairDelay + 20], [0, 0.15], { extrapolateRight: 'clamp' });
 
 // Subtle dash draw
 const lineLength = Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2));
 const dashOffset = interpolate(frame, [pairDelay, pairDelay + 40], [lineLength * 4, 0], { extrapolateRight: 'clamp' });

 return (
 <line
 key={`net-${i}-${j}`}
 x1={`${from[0]}%`} y1={`${from[1]}%`}
 x2={`${to[0]}%`} y2={`${to[1]}%`}
 stroke="#ffffff"
 strokeWidth="1"
 strokeDasharray="4 8"
 strokeDashoffset={dashOffset}
 opacity={lineOpacity}
 strokeLinecap="round"
 />
 );
 })
 )}
 </svg>

 {topThemes.length === 0 && (
 <p className="text-white/40 text-xl text-center mt-12 z-10 font-medium">Aucun thème détecté</p>
 )}
 </div>
 );
};

// === Theme Text — clean fade and scale ===
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
 color: { text: string; line: string };
}> = ({ theme, count, maxCount, rank, isTop, baseX, baseY, baseRotation, baseScale, delayFrames, durationInFrames, color }) => {
 const frame = useCurrentFrame();
 const { fps } = useVideoConfig();

 const localFrame = Math.max(0, frame - delayFrames);

 // === Clean entrance ===
 const enterScale = spring({
 frame: localFrame,
 fps,
 config: { damping: 14, stiffness: 100, mass: 1 },
 });

 const currentScale = interpolate(enterScale, [0, 1], [0.8, baseScale]);
 
 // === Minimal float ===
 const floatY = Math.cos(frame / (60 + rank * 10)) * 0.3;

 // === Counter ===
 const counterProgress = spring({
 frame: localFrame - 5,
 fps,
 config: { damping: 20, stiffness: 90 },
 });
 const animatedCount = Math.round(interpolate(counterProgress, [0, 1], [0, count]));

 // === Opacity ===
 const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) });

 return (
 <div
 className="absolute z-[12] flex flex-col items-center"
 style={{
 left:`${baseX}%`,
 top:`${baseY + floatY}%`,
 transform:`translate(-50%, -50%) scale(${currentScale})`,
 opacity,
 }}
 >
 <div className={`px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center shadow-2xl`}>
 {/* Theme name */}
 <h3
 className={`font-semibold tracking-tight leading-tight text-center ${color.text} ${
 isTop ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
 }`}
 >
 {theme}
 </h3>

 {/* Counter */}
 <div className="flex items-center gap-2 mt-2">
 <span className={`font-medium ${color.text} ${isTop ? 'text-2xl' : 'text-xl'}`}>
 {animatedCount}
 </span>
 <span className={`font-medium ${
 isTop ? 'text-sm text-white/50' : 'text-xs text-white/40'
 }`}>
 messages
 </span>
 </div>
 </div>
 </div>
 );
};
