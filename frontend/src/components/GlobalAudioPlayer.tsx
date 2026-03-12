import { useAudio } from "@/lib/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, X, Volume2, Loader2, Music, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalAudioPlayer() {
  const { 
    currentMessage, 
    isPlaying, 
    togglePlay, 
    progress, 
    seek, 
    currentTime, 
    duration,
    audioLoading,
    playMessage,
    stopAudio,
    playNext,
    playPrevious,
    queue
  } = useAudio();

  if (!currentMessage) return null;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const hasPlaylist = queue.length > 1;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[min(94vw,700px)] animate-in slide-in-from-bottom-10 duration-700 ease-out">
      <div className="bg-white/90 backdrop-blur-3xl border border-black/5 rounded-[2rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-6 group">
        {/* State Icon */}
        <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/5 group-hover:bg-primary/10 transition-all">
          {audioLoading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <Music className={cn("h-6 w-6 text-primary", isPlaying && "animate-pulse")} />
          )}
        </div>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
             <div className="flex flex-col min-w-0 pr-4">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1">Lecture en cours</span>
               <div className="flex items-center gap-2">
                 <p className="text-base font-black text-foreground truncate">{currentMessage.speaker || "Anonyme"}</p>
                 <span className="text-[10px] font-bold text-black/20 uppercase tracking-tighter truncate max-w-[150px]">{currentMessage.filename}</span>
               </div>
             </div>
             
             <div className="flex items-center gap-1 shrink-0">
                {hasPlaylist && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    className="h-10 w-10 rounded-xl text-black/20 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <SkipBack className="h-4 w-4 fill-current" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="h-12 w-12 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary hover:scale-105 active:scale-95 transition-all mx-1"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </Button>

                {hasPlaylist && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    className="h-10 w-10 rounded-xl text-black/20 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <SkipForward className="h-4 w-4 fill-current" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={stopAudio}
                  className="h-8 w-8 rounded-full text-black/10 hover:text-black/30 hover:bg-black/5 ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-primary/60 tabular-nums w-8">{formatTime(currentTime)}</span>
            <Slider
              value={[progress]}
              onValueChange={(val) => seek(val[0])}
              max={100}
              step={0.1}
              className="flex-1"
            />
            <span className="text-[10px] font-black text-black/20 tabular-nums w-8">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
