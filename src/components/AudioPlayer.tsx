import { useState, useRef } from "react";
import { Play, Pause, Volume2, FileText } from "lucide-react";
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
import { Message } from "@/lib/data";

interface AudioPlayerProps {
  message: Message;
  className?: string;
}

export function AudioPlayer({ message, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Note: In a real implementation, you would control the actual audio element
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joie': 'bg-theme-humour/20 text-theme-humour border-theme-humour/30',
      'confiance': 'bg-theme-fierte/20 text-theme-fierte border-theme-fierte/30',
      'tristesse': 'bg-theme-centralisation/20 text-theme-centralisation border-theme-centralisation/30',
      'peur': 'bg-theme-identite/20 text-theme-identite border-theme-identite/30',
      'anticipation': 'bg-theme-transmission/20 text-theme-transmission border-theme-transmission/30',
    };
    return colors[emotion] || 'bg-muted/20 text-muted-foreground border-muted/30';
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'high': return 'bg-theme-centralisation/20 text-theme-centralisation border-theme-centralisation/30';
      case 'medium': return 'bg-theme-transmission/20 text-theme-transmission border-theme-transmission/30';
      case 'low': return 'bg-theme-humour/20 text-theme-humour border-theme-humour/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <div className={`p-4 rounded-lg border bg-card shadow-card ${className}`}>
      {/* Audio Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-foreground mb-1">{message.filename}</h4>
          <p className="text-sm text-muted-foreground italic">"{message.quote}"</p>
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
                Transcription complète du message vocal
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <p className="text-sm leading-relaxed">{message.transcript_txt}</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-3 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
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

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {message.themes.map((theme) => (
            <Badge 
              key={theme} 
              variant="outline" 
              className="text-xs bg-primary/10 text-primary border-primary/30"
            >
              {theme}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {message.emotions.map((emotion) => (
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
            className={`text-xs ${getLoadColor(message.emotional_load)}`}
          >
            charge {message.emotional_load}
          </Badge>
        </div>
      </div>

      {/* Hidden audio element for future functionality */}
      <audio ref={audioRef} src={message.audio_url} />
    </div>
  );
}