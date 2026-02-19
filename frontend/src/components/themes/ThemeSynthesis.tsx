import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Tags } from "lucide-react";
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Title & Selected theme */}
      <div className="flex items-center gap-6 px-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: theme.color }}
        />
        <div className="space-y-1">
          <h3 className="label-uppercase">Thématique sélectionnée</h3>
          <p className="text-4xl font-black text-foreground tracking-tighter leading-none">{theme.name}</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Synthesis Section */}
        <div className="space-y-4">
          <div className="px-2">
            <h4 className="label-uppercase">Synthèse de l'analyse</h4>
          </div>
          <Card className="premium-card p-10">
            <p className="text-xl font-medium leading-[1.6] text-foreground/90">
              {theme.analysis || "Ce thème révèle un fort attachement des participants à leur patrimoine local. Les témoignages expriment une fierté territoriale marquée et un sentiment d'appartenance profond qui transcende les générations."}
            </p>
          </Card>
        </div>

        {/* Verbatim Totem */}
        {theme.totemMessage && (
          <div className="space-y-4">
            <div className="px-2 flex items-center justify-between">
              <h4 className="label-uppercase">Verbatim Totem</h4>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">Référence</Badge>
            </div>
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
            />
          </div>
        )}

        {/* Mots-clés */}
        <div className="space-y-4">
          <div className="px-2">
            <h4 className="label-uppercase">Univers Sémantique</h4>
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="outline"
                className="text-[10px] font-black py-1 px-4 border-black/[0.03] bg-black/[0.02] text-foreground/60 uppercase tracking-widest rounded-full hover:bg-primary/5 hover:text-primary transition-all duration-300"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
