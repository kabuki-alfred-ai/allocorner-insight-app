import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, PlayerRef } from '@remotion/player';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useProject } from '@/hooks/use-projects';
import { useThemes } from '@/hooks/use-themes';
import { useMessages } from '@/hooks/use-messages';
import { getAudioUrl } from '@/lib/api/storage';

import { MainComposition, WrappedData, TOTAL_DURATION, FPS } from '@/components/Wrapped/MainComposition';
import type { Theme, Message } from '@/lib/types';

export default function WrappedPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<PlayerRef>(null);

  // Fetch all necessary data
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: themesData, isLoading: themesLoading } = useThemes(projectId);
  const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId);

  const [compositionProps, setCompositionProps] = useState<WrappedData | null>(null);
  const [preparingData, setPreparingData] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);

  const isLoading = projectLoading || themesLoading || messagesLoading || preparingData;

  useEffect(() => {
    async function prepareData() {
      if (!project || !projectId || projectLoading || themesLoading || messagesLoading) return;

      const messagesCount = project?.metrics?.messagesCount || 0;
      const durationSeconds = project?.metrics?.totalDurationSec || 0;
      const ircScore = project?.metrics?.ircScore || 0;
      const participationRate = project?.metrics?.participationRate || 0;

      const themes = Array.isArray(themesData) ? themesData.map((t: Theme) => ({
        theme: t.name || 'Inconnu',
        count: t.count || 0,
        percentage: t.count ? t.count : 0
      })) : [];

      let topVerbatims = [{ text: "Une expérience incroyable et transformatrice.", authorRank: "Participant", emotion: "POSITIF", audioUrl: undefined as string | undefined }];
      
      if (messagesData?.data && messagesData.data.length > 0) {
        const msgs = messagesData.data;
        const bestMsgs = msgs.filter((m: Message) => m.tone === 'POSITIVE');
        const selectedMsgs = bestMsgs.length >= 3 ? bestMsgs.slice(0, 3) : msgs.slice(0, 3);
        
        // Fetch audio URLs for the selected messages
        topVerbatims = await Promise.all(selectedMsgs.map(async (msg) => {
          let audioUrl: string | undefined;
          let durationInFrames = FPS * 7; // Default 7 seconds if no audio

          try {
             const res = await getAudioUrl(projectId, msg.id);
             audioUrl = res.url;
             
             // Fetch real duration by loading audio metadata
             const realAudioDuration = await new Promise<number>((resolve) => {
               const audio = new window.Audio(audioUrl);
               audio.addEventListener('loadedmetadata', () => {
                 resolve(audio.duration);
               });
               audio.addEventListener('error', () => {
                 resolve(msg.duration || 7);
               });
             });
             
             // Convert seconds to frames, add 1.5 seconds (45 frames) for text animation padding
             durationInFrames = Math.ceil(realAudioDuration * FPS) + (FPS * 1.5);

          } catch (e) {
             console.warn("Could not fetch audio for message", msg.id);
             durationInFrames = Math.ceil((msg.duration || 7) * FPS) + (FPS * 1.5);
          }
          
          return {
            text: msg.transcriptTxt || msg.quote || "Pas de texte transcrit.",
            authorRank: msg.speaker || "Participant",
            emotion: msg.tone || "NEUTRE",
            audioUrl,
            durationInFrames
          };
        }));
      }

      setCompositionProps({
        clientName: project.clientName || 'Client',
        projectName: project.title || 'Projet',
        messagesCount,
        durationSeconds,
        ircScore,
        participationRate,
        themes,
        topVerbatims,
      });

      setPreparingData(false);
    }

    prepareData();
  }, [project, themesData, messagesData, projectId, projectLoading, themesLoading, messagesLoading]);

  // Handle redirect on end + progress tracking
  useEffect(() => {
    const { current } = playerRef;
    if (!current) {
      return;
    }

    const onEnded = () => {
      navigate(`/projects/${projectId}`);
    };

    const onFrameUpdate = (e: any) => {
      const f = e?.detail?.frame ?? e?.frame ?? 0;
      setCurrentFrame(f);
    };

    current.addEventListener('ended', onEnded);
    current.addEventListener('frameupdate', onFrameUpdate);

    return () => {
      current.removeEventListener('ended', onEnded);
      current.removeEventListener('frameupdate', onFrameUpdate);
    };
  }, [projectId, navigate, compositionProps]);

  if (isLoading || !compositionProps) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
        <p className="text-xl font-bold tracking-widest uppercase text-muted-foreground animate-pulse">
          Génération de votre expérience...
        </p>
      </div>
    );
  }

  // Calculate dynamic total duration based on actual verbatim audio lengths
  const INTRO_DURATION = FPS * 10;  // Premium: cinematic entrance with typewriter
  const STATS_DURATION = FPS * 12;  // Premium: 4 stats × 3s each
  const THEMES_DURATION = FPS * 15; // Premium: dramatic reveals with reading time
  const OUTRO_DURATION = FPS * 6;   // Premium: memorable conclusion
  const verbatimTotalFrames = compositionProps.topVerbatims.reduce((acc, v) => acc + (v.durationInFrames || (FPS*7)), 0);
  const dynamicTotalDuration = INTRO_DURATION + STATS_DURATION + THEMES_DURATION + verbatimTotalFrames + OUTRO_DURATION;
  const progressPercentage = (currentFrame / dynamicTotalDuration) * 100;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden flex flex-col items-center justify-center">
      {/* Progress Bar Container */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-[70]">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 z-[60] text-white hover:bg-white/10 rounded-full h-12 w-12"
        onClick={() => navigate(-1)}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Remotion Player */}
      <div className="w-full h-full max-w-6xl mx-auto aspect-video relative bg-black shadow-2xl overflow-hidden rounded-none md:rounded-3xl border-0 md:border border-white/10 md:my-8 pointer-events-none">
        <Player
          ref={playerRef}
          component={MainComposition as unknown as React.FC<Record<string, unknown>>}
          inputProps={compositionProps}
          durationInFrames={dynamicTotalDuration}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={FPS}
          style={{
            width: '100%',
            height: '100%',
          }}
          autoPlay
        />
      </div>
    </div>
  );
}
