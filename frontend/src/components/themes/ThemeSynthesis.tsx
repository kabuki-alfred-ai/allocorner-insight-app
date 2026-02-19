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
      <div className="flex flex-col space-y-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-black/[0.03] border border-black/[0.05] shadow-inner">
             <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: theme.color }} />
          </div>
          <div className="space-y-1 relative">
            <h3 className="label-uppercase text-primary/80">
              Thématique Focus
            </h3>
            <p className="text-3xl md:text-4xl font-black text-foreground tracking-tighter leading-none relative z-10">
              {theme.name}
            </p>
          </div>
        </div>

        {/* Mots-clés inline under title */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
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

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Synthesis Section */}
        <div className="xl:col-span-3 space-y-4 flex flex-col">
          <div className="px-2 flex items-center gap-2">
            <Tags className="w-3.5 h-3.5 text-primary" />
            <h4 className="label-uppercase text-primary">Synthèse Analyste</h4>
          </div>
          <Card className="adl-card p-8 sm:p-10 flex-1 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
            <p className="text-xl font-medium leading-[1.8] text-foreground/85 font-body text-balance">
              {theme.analysis || "Ce thème révèle un fort attachement des participants à leur patrimoine local. Les témoignages expriment une fierté territoriale marquée et un sentiment d'appartenance profond qui transcende les générations."}
            </p>
          </Card>
        </div>

        {/* Verbatim Totem */}
        <div className="xl:col-span-2 space-y-4 flex flex-col">
          <div className="px-2 flex items-center justify-between">
            <h4 className="label-uppercase">Le Verbatim Totem</h4>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">Référence</Badge>
          </div>
          {theme.totemMessage ? (
            <div className="flex-1">
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
                className="h-full"
              />
            </div>
          ) : (
            <div className="adl-card-flat flex-1 min-h-[200px] flex items-center justify-center">
              <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Aucun totem défini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
