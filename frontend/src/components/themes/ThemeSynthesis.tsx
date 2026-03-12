import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Tags, Lightbulb, Heart } from "lucide-react";
import { useState, useRef } from "react";
import type { Theme, Message, EmotionalLoad } from "@/lib/types";
import { AudioPlayer } from "@/components/AudioPlayer";

interface ThemeSynthesisProps {
  theme: Theme;
  projectId: string;
}

export function ThemeSynthesis({ theme, projectId }: ThemeSynthesisProps) {
  // Mots-clés associés au thème (depuis la DB)
  const keywords = theme.keywords?.map(k => k.keyword) || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      {/* Title & Selected theme */}
      <div className="flex flex-col space-y-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-black/[0.03] border border-black/[0.05] shadow-inner">
             <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: theme.color }} />
          </div>
          <div className="space-y-1 relative">
            <h3 className="label-uppercase text-primary/80">
              Thématique Focus
            </h3>
            <p className="text-3xl font-black text-foreground tracking-tighter leading-none relative z-10">
              {theme.name}
            </p>
          </div>
        </div>

        {/* Mots-clés inline under title */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="outline"
                className="text-[10px] font-black py-1.5 px-4 border-black/[0.05] bg-white text-foreground/60 uppercase tracking-widest rounded-full shadow-sm hover:shadow-md hover:border-black/10 transition-all duration-300"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8 px-1">
        {/* Dominant Emotion */}
        {theme.emotionLabel && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <h4 className="label-uppercase text-rose-500">Émotion dominante</h4>
            </div>
            <div className="px-4 py-2 bg-rose-500/5 border border-rose-500/10 rounded-full w-fit">
              <span className="text-sm font-black text-rose-500 uppercase tracking-widest">{theme.emotionLabel}</span>
            </div>
          </div>
        )}

        {/* Synthesis Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tags className="w-3.5 h-3.5 text-primary" />
            <h4 className="label-uppercase text-primary">Synthèse Analyste</h4>
          </div>
          <Card className="adl-card p-6 sm:p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
            <p className="text-lg font-medium leading-[1.7] text-foreground/85 font-body">
              {theme.analysis || "Aucune synthèse disponible pour ce thème."}
            </p>
          </Card>
        </div>

        {/* Strategic Teaching */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <h4 className="label-uppercase text-amber-500">Enseignement stratégique</h4>
          </div>
          <div className="p-6 bg-amber-500/[0.03] border border-amber-500/10 rounded-[1.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Lightbulb className="w-12 h-12" />
            </div>
            <p className="text-base font-bold leading-relaxed text-foreground/80 italic relative z-10">
              {theme.strategicTeaching || "Cet enseignement souligne l'opportunité d'agir sur ce levier thématique pour renforcer l'adhésion."}
            </p>
          </div>
        </div>

        {/* Verbatim Totem */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="label-uppercase">Le Verbatim Totem</h4>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">Référence</Badge>
          </div>
          {theme.totemMessage ? (
            <div className="w-full">
              <AudioPlayer 
                message={{
                  ...theme.totemMessage,
                  projectId: theme.projectId,
                  quote: theme.verbatimTotem,
                  emotionalLoad: 'LOW' as EmotionalLoad,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  transcriptTxt: theme.totemMessage.transcriptTxt || theme.verbatimTotem,
                  messageThemes: [{ theme }]
                } as Message}
                projectId={projectId}
                className="w-full"
              />
            </div>
          ) : (
            <div className="adl-card-flat min-h-[140px] flex items-center justify-center rounded-[1.5rem]">
              <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Aucun totem défini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
