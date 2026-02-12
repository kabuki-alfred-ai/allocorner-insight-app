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
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Title & Selected theme */}
      <div className="flex items-center gap-4 px-2">
        <div
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: theme.color }}
        />
        <div className="space-y-0.5">
          <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Thématique sélectionnée</h3>
          <p className="text-2xl font-black text-foreground tracking-tighter">{theme.name}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Synthesis Section */}
        <div className="space-y-4">
          <div className="px-2">
            <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Synthèse de l'analyse</h4>
          </div>
          <Card className="p-8">
            <p className="text-lg font-medium leading-[1.6] text-foreground">
              {theme.analysis || "Ce thème révèle un fort attachement des participants à leur patrimoine local. Les témoignages expriment une fierté territoriale marquée et un sentiment d'appartenance profond qui transcende les générations."}
            </p>
          </Card>
        </div>

        {/* Verbatim Totem */}
        {theme.totemMessage && (
          <div className="space-y-4">
            <div className="px-2">
              <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Verbatim Totem</h4>
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
            <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Mots-clés associés</h4>
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="outline"
                className="text-[10px] font-black py-0.5 px-3 border-black/[0.1] bg-white text-foreground/60 uppercase tracking-widest rounded-lg hover:text-primary hover:border-primary/20 transition-all duration-300"
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
