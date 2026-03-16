import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { IntroScene } from './IntroScene';
import { StatsScene } from './StatsScene';
import { ThemesScene, ThemeStat } from './ThemesScene';
import { VerbatimScene, VerbatimData } from './VerbatimScene';
import { OutroScene } from './OutroScene';

export interface WrappedTheme {
  primaryColor: string; // hex e.g. '#f97316'
  bgColor: string;      // hex e.g. '#000000'
  textColor: string;    // hex e.g. '#ffffff'
}

export const DEFAULT_WRAPPED_THEME: WrappedTheme = {
  primaryColor: '#f97316',
  bgColor: '#000000',
  textColor: '#ffffff',
};

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export interface WrappedData {
  clientName: string;
  projectName: string;
  messagesCount: number;
  durationSeconds: number;
  ircScore: number;
  participationRate: number;
  themes: ThemeStat[];
  topVerbatims: VerbatimData[];
  theme?: WrappedTheme;
}

export const FPS = 30;

// Scene durations (premium pacing)
const INTRO_DURATION = FPS * 10; // 10s — cinematic entrance with typewriter
const STATS_DURATION = FPS * 12; // 12s — 4 stats × 3s each
const THEMES_DURATION = FPS * 15; // 15s — dramatic theme reveals with reading time
const VERBATIM_SCENE_LENGTH = FPS * 7; // fallback per verbatim
const MAX_VERBATIMS = 3;
const VERBATIM_TOTAL_DURATION = VERBATIM_SCENE_LENGTH * MAX_VERBATIMS;
const OUTRO_DURATION = FPS * 6; // 6s — memorable conclusion

export const TOTAL_DURATION = INTRO_DURATION + STATS_DURATION + THEMES_DURATION + VERBATIM_TOTAL_DURATION + OUTRO_DURATION;

export const MainComposition: React.FC<WrappedData> = (props) => {
  const resolvedTheme: WrappedTheme = {
    primaryColor: props.theme?.primaryColor ?? DEFAULT_WRAPPED_THEME.primaryColor,
    bgColor: props.theme?.bgColor ?? DEFAULT_WRAPPED_THEME.bgColor,
    textColor: props.theme?.textColor ?? DEFAULT_WRAPPED_THEME.textColor,
  };

  const verbatimsToProcess = props.topVerbatims.slice(0, MAX_VERBATIMS);
  const actualVerbatimDuration = verbatimsToProcess.reduce((acc, v) => acc + (v.durationInFrames || VERBATIM_SCENE_LENGTH), 0);

  return (
    <AbsoluteFill style={{ backgroundColor: resolvedTheme.bgColor }}>
      <Sequence durationInFrames={INTRO_DURATION}>
        <IntroScene clientName={props.clientName} projectName={props.projectName} theme={resolvedTheme} />
      </Sequence>

      <Sequence from={INTRO_DURATION} durationInFrames={STATS_DURATION}>
        <StatsScene
          messagesCount={props.messagesCount}
          durationSeconds={props.durationSeconds}
          ircScore={props.ircScore}
          participationRate={props.participationRate}
          theme={resolvedTheme}
        />
      </Sequence>

      <Sequence from={INTRO_DURATION + STATS_DURATION} durationInFrames={THEMES_DURATION}>
        <ThemesScene themes={props.themes} theme={resolvedTheme} />
      </Sequence>

      <Sequence from={INTRO_DURATION + STATS_DURATION + THEMES_DURATION} durationInFrames={actualVerbatimDuration}>
        <VerbatimScene verbatims={verbatimsToProcess} defaultSceneLength={VERBATIM_SCENE_LENGTH} theme={resolvedTheme} />
      </Sequence>

      <Sequence from={INTRO_DURATION + STATS_DURATION + THEMES_DURATION + actualVerbatimDuration} durationInFrames={OUTRO_DURATION}>
        <OutroScene clientName={props.clientName} theme={resolvedTheme} />
      </Sequence>
    </AbsoluteFill>
  );
};
