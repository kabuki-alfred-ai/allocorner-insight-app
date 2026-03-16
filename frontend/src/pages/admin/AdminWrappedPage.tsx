import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Player, PlayerRef } from "@remotion/player";
import { Loader2, Download, Eye, EyeOff, Clapperboard, Palette, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useProject } from "@/hooks/use-projects";
import { useThemes } from "@/hooks/use-themes";
import { useMessages } from "@/hooks/use-messages";
import { getAudioUrl } from "@/lib/api/storage";
import { updateProject } from "@/lib/api/projects";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MainComposition, WrappedData, FPS, WrappedTheme, DEFAULT_WRAPPED_THEME } from "@/components/Wrapped/MainComposition";
import type { Theme, Message } from "@/lib/types";
import { speakerProfileLabel, toneLabel } from "@/lib/verbatim-utils";

export default function AdminWrappedPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const playerRef = useRef<PlayerRef>(null);

  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: themesData, isLoading: themesLoading } = useThemes(projectId!);
  const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId!);

  const [wrappedProps, setWrappedProps] = useState<Omit<WrappedData, 'theme'> | null>(null);
  const [wrappedLoading, setWrappedLoading] = useState(true);
  const [wrappedDuration, setWrappedDuration] = useState(FPS * 60);
  const [isRecording, setIsRecording] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Theme editor state — initialized from DB on load
  const [themeEdits, setThemeEdits] = useState<WrappedTheme>(DEFAULT_WRAPPED_THEME);
  const [themeInitialized, setThemeInitialized] = useState(false);

  const isLoading = projectLoading || themesLoading || messagesLoading;

  // Initialize theme from project once loaded
  useEffect(() => {
    if (project && !themeInitialized) {
      setThemeEdits({
        primaryColor: project.wrappedTheme?.primaryColor ?? DEFAULT_WRAPPED_THEME.primaryColor,
        bgColor: project.wrappedTheme?.bgColor ?? DEFAULT_WRAPPED_THEME.bgColor,
        textColor: project.wrappedTheme?.textColor ?? DEFAULT_WRAPPED_THEME.textColor,
      });
      setThemeInitialized(true);
    }
  }, [project, themeInitialized]);

  // Prepare wrapped data
  useEffect(() => {
    async function prepareData() {
      if (!project || !projectId || isLoading) return;

      const messagesCount = project?.metrics?.messagesCount || 0;
      const durationSeconds = project?.metrics?.totalDurationSec || 0;
      const ircScore = project?.metrics?.ircScore || 0;
      const participationRate = project?.metrics?.participationRate || 0;

      const themes = Array.isArray(themesData)
        ? themesData.map((t: Theme) => ({ theme: t.name || "Inconnu", count: t.count || 0, percentage: t.count || 0 }))
        : [];

      let topVerbatims = [{ text: "Une expérience incroyable.", authorRank: "Participant", emotion: "POSITIF", audioUrl: undefined as string | undefined }];

      if (messagesData?.data && messagesData.data.length > 0) {
        const msgs = messagesData.data;
        const bestMsgs = msgs.filter((m: Message) => m.tone === "POSITIVE");
        const selectedMsgs = bestMsgs.length >= 3 ? bestMsgs.slice(0, 3) : msgs.slice(0, 3);

        topVerbatims = await Promise.all(
          selectedMsgs.map(async (msg: Message) => {
            let audioUrl: string | undefined;
            let durationInFrames = FPS * 7;
            try {
              const res = await getAudioUrl(projectId, msg.id);
              audioUrl = res.url;
              const realDuration = await new Promise<number>((resolve) => {
                const audio = new window.Audio(audioUrl);
                audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
                audio.addEventListener("error", () => resolve(msg.duration || 7));
              });
              durationInFrames = Math.ceil(realDuration * FPS) + FPS * 1.5;
            } catch {
              durationInFrames = Math.ceil((msg.duration || 7) * FPS) + FPS * 1.5;
            }
            return {
              text: msg.transcriptTxt || msg.quote || "Pas de transcription.",
              authorRank: msg.speakerProfile ? speakerProfileLabel[msg.speakerProfile] : "Participant",
              emotion: toneLabel[msg.tone] || "NEUTRE",
              audioUrl,
              durationInFrames,
            };
          })
        );
      }

      const INTRO = FPS * 10;
      const STATS = FPS * 12;
      const THEMES = FPS * 15;
      const OUTRO = FPS * 6;
      const verbatimFrames = topVerbatims.reduce((acc, v) => acc + (v.durationInFrames || FPS * 7), 0);
      setWrappedDuration(INTRO + STATS + THEMES + verbatimFrames + OUTRO);

      setWrappedProps({ clientName: project.clientName || "Client", projectName: project.title || "Projet", messagesCount, durationSeconds, ircScore, participationRate, themes, topVerbatims });
      setWrappedLoading(false);
    }

    prepareData();
  }, [project, themesData, messagesData, projectId, isLoading]);

  const handleTogglePublished = async () => {
    if (!project) return;
    setIsToggling(true);
    try {
      await updateProject(projectId!, { wrappedPublished: !project.wrappedPublished });
      await queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success(project.wrappedPublished ? "Wrapped dépublié" : "Wrapped publié pour les utilisateurs");
    } catch {
      toast.error("Impossible de modifier le statut");
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveTheme = async () => {
    setIsSavingTheme(true);
    try {
      await updateProject(projectId!, { wrappedTheme: themeEdits });
      await queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Thème sauvegardé");
    } catch {
      toast.error("Impossible de sauvegarder le thème");
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleResetTheme = () => {
    setThemeEdits(DEFAULT_WRAPPED_THEME);
  };

  const handleDownload = async () => {
    if (!playerRef.current) return;
    const playerEl = playerRef.current;

    // Remotion Player renders HTML/CSS (not canvas). Use screen capture API if available.
    try {
      setIsRecording(true);
      toast.info("Capture d'écran système en cours... Ne quittez pas la page.");

      // Try to capture the player element via getDisplayMedia (screen recording)
      const playerContainer = (playerEl as unknown as { container?: HTMLElement }).container
        ?? document.querySelector(".remotion-player") as HTMLElement | null;

      if (!playerContainer) {
        toast.error("Utilisez un outil de capture d'écran pour enregistrer le Wrapped.");
        setIsRecording(false);
        return;
      }

      // @ts-expect-error - getDisplayMedia with preferCurrentTab is a newer API
      const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: FPS },
        audio: false,
        preferCurrentTab: true,
      }).catch(() => null);

      if (!stream) {
        toast.info("Pour enregistrer la vidéo, utilisez l'outil de capture d'écran de Windows (Win+G ou OBS).");
        setIsRecording(false);
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wrapped-${project?.clientName || "projet"}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setIsRecording(false);
        toast.success("Téléchargement terminé !");
      };

      recorder.start();
      playerEl.play();

      const durationMs = (wrappedDuration / FPS) * 1000;
      setTimeout(() => recorder.stop(), durationMs + 500);
    } catch {
      toast.info("Pour enregistrer la vidéo, utilisez l'outil de capture d'écran de Windows (Win+G ou OBS).");
      setIsRecording(false);
    }
  };

  const themeChanged =
    themeEdits.primaryColor !== (project?.wrappedTheme?.primaryColor ?? DEFAULT_WRAPPED_THEME.primaryColor) ||
    themeEdits.bgColor !== (project?.wrappedTheme?.bgColor ?? DEFAULT_WRAPPED_THEME.bgColor) ||
    themeEdits.textColor !== (project?.wrappedTheme?.textColor ?? DEFAULT_WRAPPED_THEME.textColor);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <PageHeader
        title="Wrapped"
        description={project?.title}
        icon={<Clapperboard className="h-5 w-5" />}
      />

      {/* Publication status */}
      <div className="mx-2 mb-4 flex items-center justify-between p-4 rounded-2xl border border-black/5 bg-card/50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${project?.wrappedPublished ? "bg-green-500" : "bg-muted-foreground/30"}`} />
          <div>
            <p className="text-sm font-semibold">
              {project?.wrappedPublished ? "Publié" : "Non publié"}
            </p>
            <p className="text-[11px] text-muted-foreground/60">
              {project?.wrappedPublished
                ? "Les utilisateurs peuvent accéder au Wrapped depuis les Ressources."
                : "Le Wrapped est masqué pour les utilisateurs."}
            </p>
          </div>
        </div>
        <Button
          variant={project?.wrappedPublished ? "outline" : "default"}
          size="sm"
          onClick={handleTogglePublished}
          disabled={isToggling || projectLoading}
          className="h-8 px-4 rounded-xl font-semibold text-[11px]"
        >
          {isToggling ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : project?.wrappedPublished ? (
            <EyeOff className="h-3 w-3 mr-1.5" />
          ) : (
            <Eye className="h-3 w-3 mr-1.5" />
          )}
          {project?.wrappedPublished ? "Dépublier" : "Publier"}
        </Button>
      </div>

      {/* Theme editor */}
      <div className="mx-2 mb-4 p-4 rounded-2xl border border-black/5 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground/60" />
            <p className="text-sm font-semibold">Thème visuel</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetTheme}
              className="h-7 px-2.5 rounded-lg text-[10px] font-semibold text-muted-foreground/60 hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTheme}
              disabled={isSavingTheme || !themeChanged}
              className="h-7 px-3 rounded-lg text-[10px] font-semibold"
            >
              {isSavingTheme ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Primary color */}
          <ColorSwatch
            label="Couleur principale"
            sublabel="Accents, glows, icônes"
            value={themeEdits.primaryColor}
            onChange={(v) => setThemeEdits(t => ({ ...t, primaryColor: v }))}
          />
          {/* Background color */}
          <ColorSwatch
            label="Couleur de fond"
            sublabel="Arrière-plan des scènes"
            value={themeEdits.bgColor}
            onChange={(v) => setThemeEdits(t => ({ ...t, bgColor: v }))}
          />
          {/* Text color */}
          <ColorSwatch
            label="Couleur du texte"
            sublabel="Titres, citations, labels"
            value={themeEdits.textColor}
            onChange={(v) => setThemeEdits(t => ({ ...t, textColor: v }))}
          />
        </div>

        {/* Color presets */}
        <div className="mt-4 pt-4 border-t border-black/5">
          <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2.5">Présets</p>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setThemeEdits({ primaryColor: preset.primaryColor, bgColor: preset.bgColor, textColor: preset.textColor })}
                title={preset.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/5 bg-white/50 hover:border-primary/20 transition-all text-[10px] font-semibold"
              >
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.primaryColor }} />
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.bgColor }} />
                <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: preset.textColor }} />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Player preview */}
      <div className="mx-2">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Prévisualisation</p>
            <h2 className="text-lg font-semibold tracking-tight">Aperçu en direct</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={wrappedLoading || isRecording}
            className="h-8 px-3 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-semibold text-[9px]"
          >
            {isRecording ? (
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-3 w-3 mr-1.5" />
            )}
            {isRecording ? "Enregistrement..." : "Télécharger"}
          </Button>
        </div>

        <Card className="border-black/[0.03] shadow-sm rounded-3xl overflow-hidden" style={{ backgroundColor: themeEdits.bgColor }}>
          {wrappedLoading || !wrappedProps ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground/50 animate-pulse">Chargement du wrapped...</p>
            </div>
          ) : (
            <div className="relative w-full aspect-video">
              <Player
                ref={playerRef}
                component={MainComposition as unknown as React.FC<Record<string, unknown>>}
                inputProps={{ ...wrappedProps, theme: themeEdits }}
                durationInFrames={wrappedDuration}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={FPS}
                style={{ width: "100%", height: "100%" }}
                controls
                clickToPlay
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ColorSwatch({ label, sublabel, value, onChange }: { label: string; sublabel: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
          <div
            className="w-10 h-10 rounded-xl border-2 border-black/10 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: value }}
          />
        </label>
        <div>
          <p className="text-sm font-mono font-semibold">{value}</p>
          <p className="text-[10px] text-muted-foreground/50">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}

const THEME_PRESETS = [
  { name: "Orange (défaut)", primaryColor: "#f97316", bgColor: "#000000", textColor: "#ffffff" },
  { name: "Bleu nuit",       primaryColor: "#3b82f6", bgColor: "#0a0f1a", textColor: "#ffffff" },
  { name: "Violet",          primaryColor: "#a855f7", bgColor: "#0d0a1a", textColor: "#ffffff" },
  { name: "Rose",            primaryColor: "#ec4899", bgColor: "#0f0a10", textColor: "#ffffff" },
  { name: "Vert émeraude",   primaryColor: "#10b981", bgColor: "#071210", textColor: "#ffffff" },
  { name: "Fond blanc",      primaryColor: "#f97316", bgColor: "#ffffff", textColor: "#111111" },
  { name: "Papier",          primaryColor: "#d97706", bgColor: "#faf7f0", textColor: "#1c1c1c" },
];
