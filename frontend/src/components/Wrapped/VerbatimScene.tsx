import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing, Sequence, Audio, random } from 'remotion';
import { Quote } from 'lucide-react';

export interface VerbatimData {
  text: string;
  authorRank?: string;
  emotion?: string;
  audioUrl?: string;
  durationInFrames?: number;
}

export const VerbatimScene: React.FC<{ verbatims: VerbatimData[], defaultSceneLength: number }> = ({ verbatims, defaultSceneLength }) => {
  let accumulatedFrames = 0;

  return (
    <>
      <div className="absolute inset-0 bg-black" />
      {verbatims.map((v, i) => {
        const duration = v.durationInFrames || defaultSceneLength;
        const startFrame = accumulatedFrames;
        accumulatedFrames += duration;

        return (
          <Sequence key={i} from={startFrame} durationInFrames={duration}>
            <SingleVerbatim 
              text={v.text} 
              authorRank={v.authorRank} 
              emotion={v.emotion} 
              audioUrl={v.audioUrl} 
              durationInFrames={duration}
              verbatimIndex={i}
              totalVerbatims={verbatims.length}
            />
          </Sequence>
        );
      })}
    </>
  );
};

const SingleVerbatim: React.FC<VerbatimData & { verbatimIndex?: number; totalVerbatims?: number }> = ({ 
  text, authorRank, emotion, audioUrl, durationInFrames = 210, verbatimIndex = 0, totalVerbatims = 1 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === Word-by-word reveal ===
  const words = text.split(' ');
  const wordStagger = 2; // frames between each word
  const wordStartFrame = 15;

  // === Entrance animations ===
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  
  // Quote icon — spring with subtle continuous rotation
  const iconScale = spring({ frame, fps, config: { damping: 10, mass: 0.5 } });
  const iconRotation = interpolate(frame, [0, durationInFrames], [0, 8], { extrapolateRight: 'clamp' });

  // Author badge — spring from bottom
  const authorSpring = spring({ frame: frame - wordStartFrame - words.length * wordStagger - 5, fps, config: { damping: 12 } });
  const authorY = interpolate(authorSpring, [0, 1], [30, 0]);
  const authorOpacity = interpolate(authorSpring, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  // Counter badge (e.g., "1/3")
  const counterOpacity = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: 'clamp' });

  // === Fade-out (crossfade) — last 20 frames ===
  const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });

  // === Dynamic font class ===
  const getFontSizeClass = (length: number) => {
    if (length < 80) return 'text-4xl md:text-5xl lg:text-6xl';
    if (length < 150) return 'text-3xl md:text-4xl lg:text-5xl';
    if (length < 250) return 'text-2xl md:text-3xl lg:text-4xl';
    if (length < 350) return 'text-xl md:text-2xl lg:text-3xl';
    return 'text-lg md:text-xl lg:text-2xl';
  };

  return (
    <div style={{ opacity: fadeOut }} className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 h-full w-full relative overflow-hidden">
      
      {/* Background Audio Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none overflow-hidden opacity-25 z-0">
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-around h-full px-6 gap-1.5">
          {[...Array(50)].map((_, i) => {
            const seed = `bar-${i}-${text.substring(0, 10)}`;
            const baseHeight = random(seed) * 50 + 15;
            // Bars react to playback progress
            const progressFactor = frame / durationInFrames;
            const centerDistance = Math.abs(i / 50 - progressFactor);
            const boost = Math.max(0, 1 - centerDistance * 4) * 30;

            return (
              <div
                key={i}
                className="w-full bg-primary rounded-t-full animate-waveform"
                style={{
                  height: `${baseHeight + boost}%`,
                  animationDelay: `${i * 0.04}s`,
                  animationDuration: `${0.6 + random(`${seed}-dur`) * 0.4}s`,
                  opacity: 0.15 + (i / 50) * 0.35 + (boost / 100),
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
        <div 
          className="w-[200%] h-[60%] rounded-full mix-blend-screen"
          style={{ 
            background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.2) 0%, transparent 60%)',
            transform: `rotate(-10deg) scale(${1 + Math.sin(frame / 35) * 0.08})`,
          }}
        />
      </div>

      {/* Counter badge (1/3) */}
      {totalVerbatims > 1 && (
        <div 
          className="absolute top-8 right-8 md:top-12 md:right-12 z-20"
          style={{ opacity: counterOpacity }}
        >
          <div className="bg-white/[0.06] border border-white/[0.1] rounded-full px-5 py-2 backdrop-blur-sm">
            <span className="text-sm font-black text-primary tracking-widest">
              {verbatimIndex + 1}/{totalVerbatims}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full z-10 flex flex-col items-center text-center" style={{ opacity: fadeIn }}>
        
        {/* Quote Icon */}
        <div 
          style={{ transform: `scale(${iconScale}) rotate(${iconRotation}deg)` }} 
          className="mb-10"
        >
          <Quote className="h-14 w-14 md:h-20 md:w-20 text-primary opacity-70" />
        </div>

        {/* Word-by-word text reveal */}
        <div className="w-full px-4 md:px-8">
          <p className={`${getFontSizeClass(text.length)} font-black text-white leading-snug tracking-tight`}>
            <span className="text-primary italic">"</span>
            {words.map((word, wi) => {
              const wordFrame = wordStartFrame + wi * wordStagger;
              const wordOpacity = interpolate(frame, [wordFrame, wordFrame + 8], [0, 1], { 
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp' 
              });
              const wordY = interpolate(frame, [wordFrame, wordFrame + 8], [12, 0], { 
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad) 
              });

              return (
                <span
                  key={wi}
                  style={{
                    opacity: wordOpacity,
                    transform: `translateY(${wordY}px)`,
                    display: 'inline-block',
                    marginRight: '0.3em',
                  }}
                  className="italic"
                >
                  {word}
                </span>
              );
            })}
            <span className="text-primary italic">"</span>
          </p>
        </div>

        {/* Author badge — spring from bottom */}
        <div 
          style={{ opacity: authorOpacity, transform: `translateY(${authorY}px)` }}
          className="mt-12 bg-white/[0.04] border border-white/[0.08] px-8 py-4 rounded-full backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span className="text-lg md:text-xl font-bold text-white/80 uppercase tracking-wider">
              {authorRank || "Participant"}
            </span>
            {emotion && (
              <>
                <span className="hidden md:block w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-sm md:text-base font-black uppercase tracking-widest text-primary/70">
                  {emotion}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {audioUrl && <Audio src={audioUrl} />}
    </div>
  );
};
