import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { IntroScene } from './IntroScene';
import { StatsScene } from './StatsScene';
import { ThemesScene, ThemeStat } from './ThemesScene';
import { VerbatimScene, VerbatimData } from './VerbatimScene';
import { OutroScene } from './OutroScene';

export interface WrappedData {
  clientName: string;
  projectName: string;
  messagesCount: number;
  durationSeconds: number;
  ircScore: number;
  participationRate: number;
  themes: ThemeStat[];
  topVerbatims: VerbatimData[];
}

export const FPS = 30;

// Scene durations (premium pacing)
const INTRO_DURATION = FPS * 10;    // 10s — cinematic entrance with typewriter
const STATS_DURATION = FPS * 12;   // 12s — 4 stats × 3s each
const THEMES_DURATION = FPS * 15;  // 15s — dramatic theme reveals with reading time
const VERBATIM_SCENE_LENGTH = FPS * 7; // fallback per verbatim
const MAX_VERBATIMS = 3;
const VERBATIM_TOTAL_DURATION = VERBATIM_SCENE_LENGTH * MAX_VERBATIMS;
const OUTRO_DURATION = FPS * 6;    // 6s — memorable conclusion

export const TOTAL_DURATION = INTRO_DURATION + STATS_DURATION + THEMES_DURATION + VERBATIM_TOTAL_DURATION + OUTRO_DURATION;

export const MainComposition: React.FC<WrappedData> = (props) => {
  const verbatimsToProcess = props.topVerbatims.slice(0, MAX_VERBATIMS);
  const actualVerbatimDuration = verbatimsToProcess.reduce((acc, v) => acc + (v.durationInFrames || VERBATIM_SCENE_LENGTH), 0);

  return (
    <AbsoluteFill className="bg-black">
      <Sequence durationInFrames={INTRO_DURATION}>
        <IntroScene clientName={props.clientName} projectName={props.projectName} />
      </Sequence>

      <Sequence from={INTRO_DURATION} durationInFrames={STATS_DURATION}>
        <StatsScene 
          messagesCount={props.messagesCount} 
          durationSeconds={props.durationSeconds} 
          ircScore={props.ircScore}
          participationRate={props.participationRate}
        />
      </Sequence>

      <Sequence from={INTRO_DURATION + STATS_DURATION} durationInFrames={THEMES_DURATION}>
        <ThemesScene themes={props.themes} />
      </Sequence>

      <Sequence from={INTRO_DURATION + STATS_DURATION + THEMES_DURATION} durationInFrames={actualVerbatimDuration}>
        <VerbatimScene verbatims={verbatimsToProcess} defaultSceneLength={VERBATIM_SCENE_LENGTH} />
      </Sequence>

      <Sequence from={INTRO_DURATION + STATS_DURATION + THEMES_DURATION + actualVerbatimDuration} durationInFrames={OUTRO_DURATION}>
        <OutroScene clientName={props.clientName} />
      </Sequence>
    </AbsoluteFill>
  );
};
