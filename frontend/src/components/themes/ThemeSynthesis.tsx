import { Badge } from "@/components/ui/badge";
import { Heart, Lightbulb, Tags } from "lucide-react";
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
 <div className="space-y-4">
 <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.color }} /></div>
 <h2 className="text-2xl font-semibold text-foreground tracking-tight leading-none">
 {theme.name}
 </h2>
 {keywords.length > 0 && (
 <div className="flex flex-wrap gap-1.5 pt-2">
 {keywords.map((keyword) => (
 <span key={keyword} className="text-[10px] font-medium text-muted-foreground/60">
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
 <h4 className="text-[10px] font-semibold uppercase tracking-wider">Synthèse de l\\analyse</h4>
 </div>
 <div className="border-l-2 border-primary/20 pl-6 py-1">
 <p className="text-lg font-medium leading-relaxed text-foreground/90 font-serif italic text-balance">
 {theme.analysis || "Aucune synthèse disponible pour ce thème."}
 </p>
 </div>
 </section>

 {/* Strategic Teaching */}
 <section className="space-y-3">
 
 <p className="text-sm font-medium leading-relaxed text-muted-foreground bg-muted/20 p-5 rounded-xl border border-border/50">
 {theme.strategicTeaching || "Cet enseignement souligne lopportunité dagir sur ce levier thématique pour renforcer ladhésion."}
 </p>
 </section>

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

 <section className="space-y-3">
 
 {theme.totemMessage ? (
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
 className="w-full bg-transparent border-none p-0 hover:bg-transparent"
 />
 ) : (
 <div className="border border-dashed border-border/50 rounded-xl p-6 flex flex-col items-center justify-center">
 <p className="text-[10px] font-semibold text-muted-foreground/30">Aucun totem défini</p>
 </div>
 )}
 </section>
 </div>
 </div>
 </div>
 );
}
