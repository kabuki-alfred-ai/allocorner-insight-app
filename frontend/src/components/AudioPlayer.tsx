import { Play, Pause, FileText, Loader2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAudio } from "@/lib/audio-context";

interface AudioPlayerProps {
  message: Message;
  projectId: string;
  className?: string;
}

export function AudioPlayer({ message, projectId, className = "" }: AudioPlayerProps) {
  const { currentMessage, isPlaying, playMessage, audioLoading } = useAudio();
  
  const isCurrent = currentMessage?.id === message.id;
  const isThisPlaying = isCurrent && isPlaying;
  const isThisLoading = isCurrent && audioLoading;

  const emotions = message.messageEmotions?.map(me => me.emotionName) || [];

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'joie': 'bg-theme-humour/10 text-theme-humour border-theme-humour/20',
      'confiance': 'bg-theme-fierte/10 text-theme-fierte border-theme-fierte/20',
      'tristesse': 'bg-theme-centralisation/10 text-theme-centralisation border-theme-centralisation/20',
      'peur': 'bg-theme-identite/10 text-theme-identite border-theme-identite/20',
      'anticipation': 'bg-theme-transmission/10 text-theme-transmission border-theme-transmission/20',
    };
    return colors[emotion] || 'bg-black/5 text-foreground/40 border-black/10';
  };

  const getLoadColor = (load: string) => {
    switch (load) {
      case 'HIGH': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'MEDIUM': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'LOW': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-black/5 text-foreground/30 border-black/10';
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
    <div className={cn("verbatim-card-light p-0 group flex flex-col relative active:scale-[0.995]", className)}>
      {/* Top Section: Speaker & Quote (Minimalist) */}
      <div className="p-4 pb-2 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
             <div className={cn(
               "h-7 w-7 rounded-lg bg-black/[0.03] border border-black/[0.05] flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-500",
               isCurrent ? "bg-primary text-white border-primary" : "text-foreground/40 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
             )}>
               {message.speaker ? message.speaker.charAt(0) : <AudioLines className="h-3 w-3 opacity-60" />}
             </div>
             <div className="flex flex-col">
               <span className={cn(
                 "text-[9px] font-black uppercase tracking-widest leading-none transition-colors",
                 isCurrent ? "text-primary" : "text-foreground/60 group-hover:text-foreground"
               )}>
                 {message.speaker || "Anonyme"}
               </span>
               <span className="text-[7px] font-bold text-foreground/30 uppercase tracking-tighter truncate max-w-[120px]">{message.filename}</span>
             </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-black/[0.03] transition-all">
                <FileText className="h-3 w-3 text-foreground/30 group-hover:text-primary transition-all" />
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-[2rem] border-none bg-white p-0 overflow-hidden shadow-2xl">
              <div className="h-full flex flex-col">
                <div className="p-8 pb-4">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-black tracking-tighter text-foreground mb-1">Transcription</SheetTitle>
                    <SheetDescription className="label-uppercase">
                       Réf: {message.filename}
                    </SheetDescription>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
                  <p className="text-sm font-medium leading-[1.8] text-foreground/80 font-body">
                    {message.transcriptTxt}
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative">
          <p className="text-[13px] font-bold leading-snug text-foreground/90 tracking-tight font-body text-balance relative z-10">
            {message.quote || (message.transcriptTxt && message.transcriptTxt.length > 80 ? message.transcriptTxt.substring(0, 80) + '...' : message.transcriptTxt)}
          </p>
        </div>
      </div>

      {/* Play Trigger Footer */}
      <div className="px-4 pb-4 mt-auto">
        <Button
          variant="secondary"
          onClick={() => playMessage(message, projectId)}
          className={cn(
            "w-full h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 gap-2",
            isThisPlaying ? "bg-primary text-white" : "bg-black/[0.02] hover:bg-primary/10 text-primary"
          )}
        >
          {isThisLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isThisPlaying ? (
            <><Pause className="h-3 w-3 fill-current" /> Pause</>
          ) : (
            <><Play className="h-3 w-3 fill-current ml-0.5" /> Écouter</>
          )}
        </Button>
      </div>

      {/* Footer Section: Analytics (Simplified) */}
      <div className="bg-black/[0.01] border-t border-black/[0.02] p-2.5 px-4 flex items-center justify-between relative z-10 min-h-[40px]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {message.messageThemes?.slice(0, 1).map(({ theme }) => (
            <div
              key={theme.id}
              className="px-2 py-0.5 rounded-md bg-black/[0.03] flex items-center gap-1.5 shrink-0"
            >
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color }} />
              <span className="text-[7px] font-black text-foreground/40 uppercase tracking-wider">{theme.name}</span>
            </div>
          ))}
          {emotions.length > 0 && (
             <div className="flex -space-x-1 ml-1">
               {emotions.slice(0, 1).map((emotion) => (
                 <div
                   key={emotion}
                   className={cn(
                     "h-4 px-1.5 flex items-center justify-center rounded-full text-[6px] font-black uppercase border shrink-0",
                     getEmotionColor(emotion)
                   )}
                 >
                   {emotion}
                 </div>
               ))}
             </div>
          )}
        </div>
        
        <div className={cn(
          "h-4 px-1.5 rounded-full flex items-center text-[6px] font-black uppercase tracking-widest border shrink-0", 
          getLoadColor(message.emotionalLoad)
        )}>
          {getLoadLabel(message.emotionalLoad)}
        </div>
      </div>
    </div>
  );
}
