import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Database, FolderDown, Maximize2, Play, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useResources } from "@/hooks/use-resources";
import { useProject } from "@/hooks/use-projects";
import { useThemes } from "@/hooks/use-themes";
import { useMessages } from "@/hooks/use-messages";
import { useParams, useNavigate } from "react-router-dom";
import { downloadResource } from "@/lib/api/resources";
import { getAudioUrl } from "@/lib/api/storage";
import { toast } from "sonner";
import { Player } from "@remotion/player";
import { MainComposition, WrappedData, FPS, DEFAULT_WRAPPED_THEME } from "@/components/Wrapped/MainComposition";
import type { Theme, Message } from "@/lib/types";
import { speakerProfileLabel, toneLabel } from "@/lib/verbatim-utils";

export default function RessourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(projectId!);
  const { data: resourcesData, isLoading } = useResources(projectId!);
  const { data: themesData } = useThemes(projectId!);
  const { data: messagesData } = useMessages(projectId!);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Wrapped player state
  const [wrappedProps, setWrappedProps] = useState<WrappedData | null>(null);
  const [wrappedLoading, setWrappedLoading] = useState(true);
  const [wrappedDuration, setWrappedDuration] = useState(FPS * 60);

  // Prepare wrapped data
  useEffect(() => {
    async function prepareData() {
      if (!project || !projectId) return;

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

      setWrappedProps({ clientName: project.clientName || "Client", projectName: project.title || "Projet", messagesCount, durationSeconds, ircScore, participationRate, themes, topVerbatims, theme: project.wrappedTheme ?? DEFAULT_WRAPPED_THEME });
      setWrappedLoading(false);
    }

    prepareData();
  }, [project, themesData, messagesData, projectId]);

  const handleDownloadResource = async (resourceId: string, title: string, type: string) => {
    setDownloadingId(resourceId);
    try {
      const blob = await downloadResource(projectId!, resourceId);
      // Guard: if the server returned an error JSON as a blob
      if (blob.type.includes("application/json")) {
        toast.error("Impossible de générer la ressource");
        return;
      }
      const ext = type === "CSV" ? "csv" : type === "PDF" ? "pdf" : type.toLowerCase();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Delay revocation to let the browser start the download (fixes Windows race condition)
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("Impossible de générer la ressource");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadWrapped = () => {
    navigate(`/projects/${projectId}/wrapped`);
    toast.info("Ouvrez en plein écran (F11) puis utilisez un outil de capture d'écran pour enregistrer la vidéo.");
  };

  const downloadResources = resourcesData?.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    size: r.size,
    icon: r.type === "PDF" ? FileText : r.type === "CSV" ? Database : FileText,
    color: r.type === "PDF" ? "text-red-500" : r.type === "CSV" ? "text-green-500" : "text-blue-500",
  })) || [];

  return (
    <>
      <title>Ressources & Documentation | Allo Corner Insight</title>
      <meta name="description" content="Accédez aux ressources complètes : rapports, datasets. Documentation méthodologique de l'étude." />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <PageHeader
              title="Ressources"
              description={project?.title}
              icon={<FolderDown className="h-5 w-5" />}
            />

            {/* ── Wrapped Player ── */}
            {project?.wrappedPublished && <div className="mb-8 mx-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">Expérience</p>
                  <h2 className="text-lg font-semibold tracking-tight">Wrapped</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadWrapped}
                    className="h-8 px-3 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-semibold text-[9px]"
                  >
                    <Download className="h-3 w-3 mr-1.5" />
                    Plein écran
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/projects/${projectId}/wrapped`)}
                    className="h-8 px-3 rounded-xl border-white/5 font-semibold text-[9px]"
                  >
                    <Maximize2 className="h-3 w-3 mr-1.5" />
                    Voir en plein écran
                  </Button>
                </div>
              </div>

              <Card className="border-black/[0.03] shadow-sm rounded-3xl overflow-hidden bg-black">
                {wrappedLoading || !wrappedProps ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground/50 animate-pulse">Chargement du wrapped...</p>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video">
                    <Player
                      component={MainComposition as unknown as React.FC<Record<string, unknown>>}
                      inputProps={wrappedProps}
                      durationInFrames={wrappedDuration}
                      compositionWidth={1920}
                      compositionHeight={1080}
                      fps={FPS}
                      style={{ width: "100%", height: "100%" }}
                      controls
                      clickToPlay
                    />
                    {/* Play overlay hint */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <Play className="h-6 w-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>}

            {/* ── Fichiers téléchargeables ── */}
            {downloadResources.length > 0 && (
              <Card className="border-black/[0.03] shadow-sm rounded-3xl bg-card/50 backdrop-blur-sm overflow-hidden mx-2">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {downloadResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="p-4 rounded-2xl border border-black/5 hover:border-primary/20 transition-all duration-300 group bg-white/50"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl bg-muted/50 ${resource.color} group-hover:scale-110 transition-transform duration-500`}>
                            <resource.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors text-sm">
                              {resource.title}
                            </h3>
                            <p className="text-[11px] font-medium text-muted-foreground/70 mb-2 line-clamp-2">
                              {resource.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-none bg-black/[0.03] text-[8px] font-semibold px-2 py-0.5 rounded-md">
                                  {resource.type}
                                </Badge>
                                <span className="text-[9px] font-semibold text-muted-foreground/85">{resource.size}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={downloadingId === resource.id}
                                onClick={() => handleDownloadResource(resource.id, resource.title, resource.type)}
                                className="h-8 px-3 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-semibold text-[9px] disabled:opacity-70"
                              >
                                {downloadingId === resource.id ? (
                                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3 mr-1.5" />
                                )}
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
