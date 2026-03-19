import { Badge } from "@/components/ui/badge";
import { Heart, Lightbulb, Tags, Quote } from "lucide-react";
import type { Theme, Message, EmotionalLoad } from "@/lib/types";
import { AudioPlayer } from "@/components/AudioPlayer";

interface ThemeSynthesisProps {
    theme: Theme;
    projectId: string;
}

export function ThemeSynthesis({ theme, projectId }: ThemeSynthesisProps) {
    const keywords = theme.keywords?.map(k => k.keyword) || [];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20 px-2">
            {/* Header section - Clean & Typography focused */}
            <div className="space-y-1 pt-0">
                <h2 className="text-xl font-semibold text-foreground tracking-tight leading-tight">
                    {theme.name}
                </h2>
                {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {keywords.map((keyword) => (
                            <span key={keyword} className="text-[10px] font-medium text-muted-foreground/40 italic">
                                #{keyword}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Sections */}
            <div className="space-y-10">
                {/* Synthesis */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground/40">
                        <Tags className="w-3.5 h-3.5" />
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider">Synthèse de l'analyse</h4>
                    </div>
                    <div className="border-l-2 border-primary/20 pl-6 py-1">
                        <p className="text-lg font-medium leading-relaxed text-foreground/90 font-serif italic text-balance">
                            {theme.analysis || "Aucune synthèse disponible pour ce thème."}
                        </p>
                    </div>
                </section>

                {/* Strategic Teaching */}
                {theme.strategicTeaching && (
                <section className="space-y-3">
                    <p className="text-sm font-medium leading-relaxed text-muted-foreground bg-muted/20 p-5 rounded-xl border border-border/50">
                        {theme.strategicTeaching}
                    </p>
                </section>
                )}

                {/* Emotion & Totem */}
                <div className="grid grid-cols-1 gap-10">
                    {theme.emotionLabel && (
                        <section className="space-y-3">

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold px-3 py-1 bg-rose-500/5 text-rose-500 rounded-full border border-rose-500/10">
                                    {theme.emotionLabel}
                                </span>
                                <span className="text-xs text-muted-foreground/40 font-medium">Emotion dominante identifiée</span>
                            </div>
                        </section>
                    )}

                    {/* Verbatim Totem - Highly prominent */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-primary/50">
                            <div className="h-px flex-1 bg-primary/10" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap px-4">Verbatim Totem</span>
                            <div className="h-px flex-1 bg-primary/10" />
                        </div>

                        {theme.totemMessage ? (
                            <div className="relative p-8 rounded-[2rem] bg-primary/[0.03] border border-primary/10 overflow-hidden group transition-all hover:bg-primary/[0.05]">
                                {/* Background Quote Icon Decoration */}
                                <Quote className="absolute -top-4 -right-4 h-32 w-32 text-primary/5 rotate-12 transition-transform group-hover:scale-110 duration-700" />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                    <Quote className="h-8 w-8 text-primary/40 mb-2" />

                                    <p className="text-xl md:text-2xl font-semibold italic text-foreground leading-tight tracking-tight max-w-xl">
                                        "{theme.verbatimTotem || theme.totemMessage.transcriptTxt}"
                                    </p>

                                    <div className="w-full max-w-md pt-4">
                                        <AudioPlayer
                                            message={{
                                                ...theme.totemMessage,
                                                projectId: theme.projectId,
                                                quote: theme.verbatimTotem,
                                                emotionalLoad: "LOW" as EmotionalLoad,
                                                createdAt: new Date().toISOString(),
                                                updatedAt: new Date().toISOString(),
                                                transcriptTxt: theme.totemMessage.transcriptTxt || theme.verbatimTotem,
                                                messageThemes: [{ theme }]
                                            } as Message}
                                            projectId={projectId}
                                            className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border-white/20 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-dashed border-border/50 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-muted/5">
                                <Quote className="h-8 w-8 text-muted-foreground/10 mb-4" />
                                <p className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-widest">Aucun totem défini pour ce thème</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
