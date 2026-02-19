import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, FileText, Loader2, Quote, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Message } from "@/lib/types";
import { getAudioUrl } from "@/lib/api/storage";

interface AudioPlayerProps {
  message: Message;
  projectId: string;
  className?: string;
}

export function AudioPlayer({ message, projectId, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const themes = message.messageThemes?.map(mt => mt.theme.name) || [];
  const emotions = message.messageEmotions?.map(me => me.emotionName) || [];

  useEffect(() => {
    if (!projectId || !message.id) return;

    let cancelled = false;
    setAudioLoading(true);

    getAudioUrl(projectId, message.id)
      .then(({ url }) => {
        if (!cancelled) {
          setAudioSrc(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAudioSrc(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAudioLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, message.id]);

  // Gérer les événements de l'élément audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioSrc]);

  // Appliquer le volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    
    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setProgress(value[0]);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joie': 'bg-theme-humour/40 text-white border-theme-humour/60 shadow-[0_0_15px_rgba(255,182,0,0.2)]',
      'confiance': 'bg-theme-fierte/40 text-white border-theme-fierte/60 shadow-[0_0_15px_rgba(0,184,156,0.2)]',
      'tristesse': 'bg-theme-centralisation/40 text-white border-theme-centralisation/60 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      'peur': 'bg-theme-identite/40 text-white border-theme-identite/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      'anticipation': 'bg-theme-transmission/40 text-white border-theme-transmission/60 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
    };
    return colors[emotion] || 'bg-white/10 text-white/80 border-white/20';
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-white/10 text-white/40 border-white/10';
    }
  };

  const getLoadLabel = (load: string) => {
    switch (load) {
      case 'HIGH': return 'haute';
      case 'MEDIUM': return 'moyenne';
      case 'LOW': return 'basse';
      default: return load.toLowerCase();
    }
  };

  return (
    <div className={cn("verbatim-card-dark p-0 h-full group flex flex-col relative active:scale-[0.995]", className)}>
      {/* Background Audio Wave (Dynamic) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-around h-full px-4 gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-full bg-primary rounded-t-full transition-all duration-300",
                isPlaying ? "animate-waveform" : "h-1"
              )}
              style={{
                height: isPlaying ? `${Math.random() * 60 + 10}%` : '4px',
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.5 + Math.random()}s`,
                opacity: 0.3 + (i / 20) * 0.5
              }}
            />
          ))}
        </div>
      </div>

      {/* Background Decorative Element - Subtle glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.05] rounded-bl-full -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/[0.08] transition-all duration-1000 blur-2xl opacity-20" />
      
      {/* Top Section: Speaker & Quote (More compact) */}
      <div className="p-6 pb-4 flex-1 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-xl bg-primary/[0.08] border border-primary/[0.1] flex items-center justify-center text-[10px] font-black text-primary uppercase tracking-widest transition-all duration-500 group-hover:bg-primary group-hover:text-white">
               {message.speaker ? message.speaker.charAt(0) : <AudioLines className="h-3.5 w-3.5 opacity-60" />}
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 leading-none mb-1 group-hover:text-white transition-colors">
                 {message.speaker || "Anonyme"}
               </span>
               <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">{message.filename}</span>
             </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/[0.1] transition-all -mt-1 -mr-1">
                <FileText className="h-3.5 w-3.5 text-primary opacity-60 group-hover:opacity-100 transition-all group-hover:text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-[2rem] border-none bg-black/95 backdrop-blur-3xl p-0 overflow-hidden shadow-2xl">
              <div className="h-full flex flex-col text-white">
                <div className="p-8 pb-4 bg-gradient-to-b from-primary/[0.05] to-transparent">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-black tracking-tighter text-white mb-1">Transcription</SheetTitle>
                    <SheetDescription className="text-[9px] font-black uppercase tracking-[0.3em] !text-white/60">
                       Réf: {message.filename}
                    </SheetDescription>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                  <p className="text-sm font-medium leading-[1.8] text-white/80 font-body antialiased">
                    {message.transcriptTxt}
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative">
          <Quote className="absolute -left-6 -top-4 h-10 w-10 text-primary/20 rotate-180 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <p className="text-[14px] font-bold leading-relaxed text-white tracking-tight font-body text-balance relative z-10">
            <span className="text-primary italic font-black mr-1">"</span>
            {message.quote || (message.transcriptTxt && message.transcriptTxt.length > 100 ? message.transcriptTxt.substring(0, 100) + '...' : message.transcriptTxt)}
            <span className="text-primary italic font-black ml-1">"</span>
          </p>
        </div>
      </div>

      {/* Middle Section: Player Controls (Slimmer) */}
      <div className="px-6 pb-6 relative z-10">
        <div className="bg-primary/[0.02] rounded-2xl p-4 border border-primary/[0.03] group-hover:bg-primary/[0.04] transition-all duration-700">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className={cn(
                "h-10 w-10 rounded-xl shadow-xl transition-all duration-500 active:scale-90 flex-shrink-0 group/play relative z-20",
                isPlaying 
                  ? "bg-primary text-white scale-105" 
                  : "bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-white"
              )}
              disabled={!audioSrc || audioLoading}
            >
              {audioLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </Button>

            <div className="flex-1 min-w-0 space-y-2 relative z-20">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full h-1"
              />
              <div className="flex justify-between items-center px-0.5">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">{formatTime(currentTime)}</span>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section: Analytics (More integrated) */}
      <div className="bg-black/20 border-t border-primary/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto relative z-10">
        <div className="flex flex-wrap gap-1.5 overflow-visible">
          {message.messageThemes?.map(({ theme }) => (
            <div
              key={theme.id}
              className="px-2 py-0.5 rounded-md bg-primary/[0.08] border border-primary/[0.1] flex items-center gap-1.5 shrink-0"
            >
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
              <span className="text-[8px] font-bold text-white/70 uppercase tracking-wider">{theme.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex -space-x-1">
            {emotions.slice(0, 2).map((emotion) => (
              <div
                key={emotion}
                className={cn(
                  "h-5 px-2 flex items-center justify-center rounded-full text-[7px] font-black uppercase tracking-widest border border-white/10 shadow-lg",
                  getEmotionColor(emotion)
                )}
              >
                {emotion}
              </div>
            ))}
          </div>
          <div
            className={cn(
              "h-5 px-2 rounded-full flex items-center text-[7px] font-black uppercase tracking-widest border border-primary/20 bg-primary/10 text-white/70", 
              getLoadColor(message.emotionalLoad)
            )}
          >
            {getLoadLabel(message.emotionalLoad)}
          </div>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      {audioSrc && (
        <audio 
          ref={audioRef} 
          src={audioSrc} 
          preload="metadata"
        />
      )}
    </div>
  );
}
