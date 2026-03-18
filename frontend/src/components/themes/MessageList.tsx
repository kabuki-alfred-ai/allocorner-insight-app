import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AudioPlayer } from "@/components/AudioPlayer";
import type { Theme, Message } from "@/lib/types";
import { Search, Filter, Play } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import { cn } from "@/lib/utils";

interface MessageListProps {
    theme: Theme;
    onThemeSelect: (theme: Theme) => void;
    messages: Message[];
    allThemes: Theme[];
    projectId: string;
}

export function MessageList({ theme, onThemeSelect, messages, allThemes, projectId }: MessageListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showPositiveOnly, setShowPositiveOnly] = useState(false);
    const [showNegativeOnly, setShowNegativeOnly] = useState(false);
    const [showNeutralOnly, setShowNeutralOnly] = useState(false);

    const { playMessage, currentMessage, isPlaying } = useAudio();

    // Filter messages by theme
    const themeMessages = useMemo(() => {
        return messages.filter(message =>
            (message.messageThemes?.map(mt => mt.theme.name) || []).includes(theme.name)
        );
    }, [theme.name, messages]);

    // Apply filters
    const filteredMessages = useMemo(() => {
        let filtered = themeMessages;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(message =>
                message.transcriptTxt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                message.quote.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sentiment filters
        if (showPositiveOnly) {
            filtered = filtered.filter(message => message.tone === "POSITIVE");
        }
        if (showNegativeOnly) {
            filtered = filtered.filter(message => message.tone === "NEGATIVE");
        }
        if (showNeutralOnly) {
            filtered = filtered.filter(message => message.tone === "NEUTRAL");
        }

        return filtered;
    }, [themeMessages, searchTerm, showPositiveOnly, showNegativeOnly, showNeutralOnly]);

    const handlePlayAll = () => {
        if (filteredMessages.length > 0) {
            playMessage(filteredMessages[0], projectId, filteredMessages);
        }
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 h-full">
            <div className="flex items-center justify-between pt-0 shrink-0">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                        Témoignages
                    </h3>
                </div>

                {filteredMessages.length > 0 && (
                    <div className="flex flex-col items-end gap-1">
                        <Button
                            onClick={handlePlayAll}
                            className="rounded-full bg-primary text-primary-foreground text-xs font-medium h-8 px-4 gap-2 shadow-sm"
                        >
                            <Play className="h-3 w-3 fill-current" />
                            Tout écouter
                        </Button>
                        <p className="text-[10px] font-medium text-muted-foreground/40 italic px-2">
                            {filteredMessages.length} témoignage{filteredMessages.length > 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Header & Filters simplified */}
            <div className="flex flex-col gap-5 bg-muted/20 p-4 rounded-xl border border-border/50 shrink-0">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/40 w-4 h-4" />
                    <Input
                        placeholder="Rechercher dans ce thème..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 bg-background/50 border-transparent hover:border-input/50 focus:bg-background focus:border-primary/20 transition-all font-sans text-xs text-foreground"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setShowPositiveOnly(!showPositiveOnly);
                                if (!showPositiveOnly) { setShowNegativeOnly(false); setShowNeutralOnly(false); }
                            }}
                            className={cn(
                                "text-[11px] font-semibold transition-colors px-2 py-1 rounded-md",
                                showPositiveOnly ? "text-chart-positive bg-chart-positive/10" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Positifs
                        </button>
                        <button
                            onClick={() => {
                                setShowNegativeOnly(!showNegativeOnly);
                                if (!showNegativeOnly) { setShowPositiveOnly(false); setShowNeutralOnly(false); }
                            }}
                            className={cn(
                                "text-[11px] font-semibold transition-colors px-2 py-1 rounded-md",
                                showNegativeOnly ? "text-chart-negative bg-chart-negative/10" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Négatifs
                        </button>
                        <button
                            onClick={() => {
                                setShowNeutralOnly(!showNeutralOnly);
                                if (!showNeutralOnly) { setShowPositiveOnly(false); setShowNegativeOnly(false); }
                            }}
                            className={cn(
                                "text-[11px] font-semibold transition-colors px-2 py-1 rounded-md",
                                showNeutralOnly ? "text-foreground bg-foreground/5" : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            Neutres
                        </button>
                    </div>

                    {(searchTerm || showPositiveOnly || showNegativeOnly || showNeutralOnly) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchTerm("");
                                setShowPositiveOnly(false);
                                setShowNegativeOnly(false);
                                setShowNeutralOnly(false);
                            }}
                            className="h-7 px-2 text-[10px] font-bold text-primary hover:text-primary/80 hover:bg-primary/5 uppercase tracking-wider"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages List - Scrollable area */}
            <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-1">
                {filteredMessages.length === 0 ? (
                    <div className="bg-muted/20 border border-transparent rounded-xl p-6 py-12 text-center flex flex-col items-center justify-center mt-4">
                        <div className="mb-4 relative">
                            <Filter className="h-5 w-5 text-muted-foreground/30 relative z-10" />
                        </div>
                        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground/40">
                            Aucun résultat
                        </p>
                    </div>
                ) : (
                    filteredMessages.map((message, index) => (
                        <AudioPlayer
                            key={message.id}
                            message={message}
                            projectId={projectId}
                            index={index}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
