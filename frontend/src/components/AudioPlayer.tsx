import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
      'joie': 'bg-theme-humour/25 text-theme-humour border-theme-humour/40',
      'confiance': 'bg-theme-fierte/25 text-theme-fierte border-theme-fierte/40',
      'tristesse': 'bg-theme-centralisation/25 text-theme-centralisation border-theme-centralisation/40',
      'peur': 'bg-theme-identite/25 text-theme-identite border-theme-identite/40',
      'anticipation': 'bg-theme-transmission/25 text-theme-transmission border-theme-transmission/40',
    };
    return colors[emotion] || 'bg-muted/20 text-muted-foreground border-muted/30';
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'HIGH': return 'bg-theme-centralisation/25 text-theme-centralisation border-theme-centralisation/40';
      case 'MEDIUM': return 'bg-theme-transmission/25 text-theme-transmission border-theme-transmission/40';
      case 'LOW': return 'bg-theme-humour/25 text-theme-humour border-theme-humour/40';
      default: return 'bg-muted/25 text-muted-foreground border-muted/40';
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
    <div className={`p-6 rounded-[2rem] bg-black/[0.03] transition-all duration-500 hover:bg-black/[0.05] ${className}`}>
      {/* Audio Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-foreground mb-1">{message.filename}</h4>
          <p className="text-sm text-muted-foreground/80 italic">
            "{message.quote || (message.transcriptTxt ? message.transcriptTxt.split(/[.!?]/)[0] + '...' : 'Pas d\'aperçu disponible')}"
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-2">
              <FileText className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Transcription - {message.filename}</SheetTitle>
              <SheetDescription>
                Transcription complete du message vocal
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <p className="text-sm leading-relaxed">{message.transcriptTxt}</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-3 mb-3">
        {audioLoading ? (
          <div className="h-8 w-8 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="h-8 w-8 p-0"
            disabled={!audioSrc}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}

        <div className="flex-1">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-1">
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="w-16"
          />
        </div>
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-muted-foreground mb-3">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {message.messageThemes?.map(({ theme }) => (
            <Badge
              key={theme.id}
              variant="outline"
              className="text-xs font-bold"
              style={{
                backgroundColor: `${theme.color}25`,
                color: theme.color,
                borderColor: `${theme.color}40`
              }}
            >
              {theme.name}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {emotions.map((emotion) => (
            <Badge
              key={emotion}
              variant="outline"
              className={`text-xs ${getEmotionColor(emotion)}`}
            >
              {emotion}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className={`text-xs ${getLoadColor(message.emotionalLoad)}`}
          >
            charge {getLoadLabel(message.emotionalLoad)}
          </Badge>
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
