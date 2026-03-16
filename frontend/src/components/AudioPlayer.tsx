import { Play, Pause, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/lib/audio-context";
import { speakerProfileLabel, speakerProfileColor, toneLabel, toneColor } from "@/lib/verbatim-utils";

interface AudioPlayerProps {
    message: Message;
    projectId: string;
    className?: string;
    index?: number;
}

export function AudioPlayer({ message, projectId, className = "", index }: AudioPlayerProps) {
    const { currentMessage, isPlaying, playMessage, audioLoading } = useAudio();

    const isCurrent = currentMessage?.id === message.id;
    const isThisPlaying = isCurrent && isPlaying;
    const isThisLoading = isCurrent && audioLoading;

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
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center shrink-0">
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
