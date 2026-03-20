import { Play, Pause, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import type { Message } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/lib/audio-context";
import { speakerProfileLabel, speakerProfileColor, toneLabel, toneColor } from "@/lib/verbatim-utils";

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

interface AudioPlayerProps {
    message: Message;
    projectId: string;
    className?: string;
    index?: number;
}

export function AudioPlayer({ message, projectId, className = "", index }: AudioPlayerProps) {
    const { currentMessage, isPlaying, playMessage, audioLoading, progress, currentTime, duration, seek } = useAudio();
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverProgress, setHoverProgress] = useState<number | null>(null);

    const isCurrent = currentMessage?.id === message.id;
    const isThisPlaying = isCurrent && isPlaying;
    const isThisLoading = isCurrent && audioLoading;

    const getProgressFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressBarRef.current;
        if (!bar) return null;
        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        return ratio * 100;
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const p = getProgressFromEvent(e);
        if (p !== null) seek(p);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const p = getProgressFromEvent(e);
        setHoverProgress(p);
        if (isDragging && p !== null) seek(p);
    };

    const getCleanFilename = (filename: string) => {
        return filename.replace(/\.[^/.]+$/, "").replace(/testimonial_|verbatim_|témoignage_/gi, "");
    };


    return (
        <div
            onClick={() => playMessage(message, projectId)}
            className={cn(
                "group flex items-center gap-4 px-3 py-4 hover:bg-muted/40 transition-all cursor-pointer rounded-xl border border-transparent",
                isCurrent ? "bg-muted/60 border-border/50" : "hover:border-border/20",
                className
            )}
        >
            {/* Play Indicator */}
            <div className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-muted/20 group-hover:bg-primary/10 transition-colors">
                {isThisLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : isThisPlaying ? (
                    <Pause className="h-4 w-4 fill-primary text-primary" />
                ) : (
                    <Play className={cn(
                        "h-4 w-4 fill-current transition-all",
                        isCurrent ? "text-primary fill-primary" : "text-muted-foreground/40 group-hover:text-primary group-hover:fill-primary"
                    )} />
                )}
            </div>

            {/* Info Stack - Reworked for clarity and vertical separation */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <h4 className={cn(
                        "text-[13px] font-semibold tracking-tight truncate",
                        isCurrent ? "text-primary" : "text-foreground/90"
                    )}>
                        Témoignage n° {getCleanFilename(message.filename)}
                    </h4>
                </div>

                {/* Speaker Info & Tone (Primary line under title) */}
                <div className="flex items-center gap-2 mt-0.5">
                    {message.speakerProfile && (
                        <Badge variant="outline" className={cn("text-[9px] font-semibold px-2 py-0 border-none", speakerProfileColor[message.speakerProfile])}>
                            {speakerProfileLabel[message.speakerProfile]}
                        </Badge>
                    )}
                    <Badge variant="outline" className={cn("text-[9px] font-semibold px-2 py-0 border-none", toneColor[message.tone])}>
                        {toneLabel[message.tone]}
                        <div className={cn("ml-1.5 w-1 h-1 rounded-full",
                            message.tone === 'POSITIVE' ? "bg-green-600" :
                                message.tone === 'NEGATIVE' ? "bg-red-600" : "bg-muted-foreground/40"
                        )} />
                    </Badge>
                </div>

                {/* Content Preview (Secondary line under speaker, multiline support with clamp) */}
                <p className="text-[11px] text-muted-foreground/50 italic font-serif leading-relaxed line-clamp-1 mt-1">
                    "{message.quote || message.transcriptTxt}"
                </p>

                {/* Progress bar when playing */}
                {isCurrent && (
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 flex items-center group/bar">
                            <div
                                ref={progressBarRef}
                                className="relative flex-1 h-1 bg-muted/60 rounded-full cursor-pointer group-hover/bar:h-1 transition-all duration-150"
                                onClick={handleProgressClick}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => setHoverProgress(null)}
                                onMouseDown={(e) => { e.stopPropagation(); setIsDragging(true); }}
                                onMouseUp={() => setIsDragging(false)}
                            >
                                {/* Filled track */}
                                <div
                                    className="absolute inset-y-0 left-0 bg-foreground rounded-full group-hover/bar:bg-primary transition-colors duration-150"
                                    style={{
                                        width: `${hoverProgress !== null ? hoverProgress : progress}%`,
                                        transition: isDragging ? 'none' : 'width 80ms linear',
                                    }}
                                />
                                {/* Thumb — appears on hover */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity duration-150 pointer-events-none"
                                    style={{ left: `calc(${hoverProgress !== null ? hoverProgress : progress}% - 6px)` }}
                                />
                            </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
                            {formatDuration(currentTime)} / {formatDuration(duration || 0)}
                        </span>
                    </div>
                )}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Duration badge (hidden when playing, replaced by progress) */}
                {!isCurrent && message.duration && (
                    <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                        {formatDuration(message.duration)}
                    </span>
                )}
                <Sheet>
                    <SheetTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/20 hover:text-foreground hover:bg-transparent">
                            <FileText className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="bg-background border-l border-border p-0 w-full md:max-w-md">
                        <div className="p-8 pb-4 h-full flex flex-col">
                            <SheetHeader className="mb-8">
                                <SheetTitle className="text-2xl font-semibold tracking-tight">Transcription</SheetTitle>
                                <SheetDescription className="text-sm font-medium">
                                    {message.filename}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                                <p className="text-base font-medium leading-relaxed text-foreground/80">
                                    {message.transcriptTxt}
                                </p>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
