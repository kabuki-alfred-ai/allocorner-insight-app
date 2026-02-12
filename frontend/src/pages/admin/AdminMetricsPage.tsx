import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, BarChart3, Heart, ArrowLeft, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { upsertMetrics, upsertPlutchik } from "@/lib/api/projects";
import { useProject } from "@/hooks/use-projects";
import { UpsertMetricsDto, UpsertPlutchikDto } from "@/lib/types";

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const metricsSchema = z.object({
  messagesCount: z.coerce.number().int().min(0).default(0),
  avgDurationSec: z.coerce.number().min(0).default(0),
  totalDurationSec: z.coerce.number().min(0).default(0),
  participationRate: z.coerce.number().min(0).max(1).default(0),
  ircScore: z.coerce.number().min(0).max(100).default(0),
  tonalityAvg: z.coerce.number().default(0),
  highEmotionShare: z.coerce.number().min(0).max(1).default(0),
  ircInterpretation: z.string().default(""),
  emotionalClimate: z.string().default(""),
});

const plutchikSchema = z.object({
  joy: z.coerce.number().min(0).max(1).default(0),
  trust: z.coerce.number().min(0).max(1).default(0),
  sadness: z.coerce.number().min(0).max(1).default(0),
  anticipation: z.coerce.number().min(0).max(1).default(0),
  anger: z.coerce.number().min(0).max(1).default(0),
  surprise: z.coerce.number().min(0).max(1).default(0),
  fear: z.coerce.number().min(0).max(1).default(0),
  cocktailSummary: z.string().default(""),
});

type MetricsFormValues = z.infer<typeof metricsSchema>;
type PlutchikFormValues = z.infer<typeof plutchikSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminMetricsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useProject(projectId || "");

  // ---- Metrics form ----
  const metricsForm = useForm<MetricsFormValues>({
    resolver: zodResolver(metricsSchema),
    defaultValues: {
      messagesCount: 0,
      avgDurationSec: 0,
      totalDurationSec: 0,
      participationRate: 0,
      ircScore: 0,
      tonalityAvg: 0,
      highEmotionShare: 0,
      ircInterpretation: "",
      emotionalClimate: "",
    },
  });

  // ---- Plutchik form ----
  const plutchikForm = useForm<PlutchikFormValues>({
    resolver: zodResolver(plutchikSchema),
    defaultValues: {
      joy: 0,
      trust: 0,
      sadness: 0,
      anticipation: 0,
      anger: 0,
      surprise: 0,
      fear: 0,
      cocktailSummary: "",
    },
  });

  // Pre-fill forms when project data arrives
  useEffect(() => {
    if (project?.metrics) {
      const m = project.metrics;
      metricsForm.reset({
        messagesCount: m.messagesCount,
        avgDurationSec: m.avgDurationSec,
        totalDurationSec: m.totalDurationSec,
        participationRate: m.participationRate,
        ircScore: m.ircScore,
        tonalityAvg: m.tonalityAvg,
        highEmotionShare: m.highEmotionShare,
        ircInterpretation: m.ircInterpretation,
        emotionalClimate: m.emotionalClimate,
      });
    }
    if (project?.plutchik) {
      const p = project.plutchik;
      plutchikForm.reset({
        joy: p.joy,
        trust: p.trust,
        sadness: p.sadness,
        anticipation: p.anticipation,
        anger: p.anger,
        surprise: p.surprise,
        fear: p.fear,
        cocktailSummary: p.cocktailSummary,
      });
    }
  }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Mutations ----
  const metricsMutation = useMutation({
    mutationFn: (data: MetricsFormValues) => {
      const payload: UpsertMetricsDto = {
        messagesCount: data.messagesCount ?? 0,
        avgDurationSec: data.avgDurationSec ?? 0,
        totalDurationSec: data.totalDurationSec ?? 0,
        participationRate: data.participationRate ?? 0,
        ircScore: data.ircScore ?? 0,
        tonalityAvg: data.tonalityAvg ?? 0,
        highEmotionShare: data.highEmotionShare ?? 0,
        ircInterpretation: data.ircInterpretation ?? "",
        emotionalClimate: data.emotionalClimate ?? "",
      };
      return upsertMetrics(projectId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Métriques IRC enregistrées avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement des métriques IRC");
    },
  });

  const plutchikMutation = useMutation({
    mutationFn: (data: PlutchikFormValues) => {
      const payload: UpsertPlutchikDto = {
        joy: data.joy ?? 0,
        trust: data.trust ?? 0,
        sadness: data.sadness ?? 0,
        anticipation: data.anticipation ?? 0,
        anger: data.anger ?? 0,
        surprise: data.surprise ?? 0,
        fear: data.fear ?? 0,
        cocktailSummary: data.cocktailSummary ?? "",
      };
      return upsertPlutchik(projectId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Roue de Plutchik enregistrée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la roue de Plutchik");
    },
  });

  // ---- Render ----
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Métriques & Émotions"
        description="Configuration des indicateurs IRC et de la roue de Plutchik"
        icon={<BarChart3 className="h-6 w-6" />}
        actions={
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/admin`)}
            className="font-bold text-[10px] uppercase tracking-widest rounded-xl h-11 px-6 border-primary/10 text-primary hover:bg-primary/5"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        }
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ---- Section 1: Metriques IRC ---- */}
        <Card>
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-lg font-extrabold font-heading flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Indicateurs IRC
            </CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
              Performance de la campagne
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Form {...metricsForm}>
              <form
                onSubmit={metricsForm.handleSubmit((v) =>
                  metricsMutation.mutate(v)
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={metricsForm.control}
                    name="messagesCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de messages</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metricsForm.control}
                    name="avgDurationSec"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duree moyenne (sec)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metricsForm.control}
                    name="totalDurationSec"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duree totale (sec)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metricsForm.control}
                    name="participationRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux de participation</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metricsForm.control}
                    name="ircScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score IRC</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={metricsForm.control}
                    name="tonalityAvg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tonalite moyenne</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={metricsForm.control}
                  name="highEmotionShare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part forte emotion</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricsForm.control}
                  name="ircInterpretation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interpretation IRC</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Interpretation des resultats IRC..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricsForm.control}
                  name="emotionalClimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Climat emotionnel</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description du climat emotionnel..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={metricsMutation.isPending}
                  className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 mt-6"
                >
                  {metricsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer les métriques
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ---- Section 2: Roue de Plutchik ---- */}
        <Card>
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-lg font-extrabold font-heading flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Roue de Plutchik
            </CardTitle>
            <CardDescription className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
              Scores émotionnels (echelle 0-1)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <Form {...plutchikForm}>
              <form
                onSubmit={plutchikForm.handleSubmit((v) =>
                  plutchikMutation.mutate(v)
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={plutchikForm.control}
                    name="joy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Joie</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={plutchikForm.control}
                    name="trust"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Confiance</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={plutchikForm.control}
                    name="sadness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Tristesse</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={plutchikForm.control}
                    name="anticipation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Anticipation</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={plutchikForm.control}
                    name="anger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Colere</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={plutchikForm.control}
                    name="surprise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Surprise</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={1}
                            step="0.01"
                            className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={plutchikForm.control}
                  name="fear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Peur</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step="0.01"
                          className="h-11 rounded-xl bg-background/50 border-white/5 font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={plutchikForm.control}
                  name="cocktailSummary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Résumé du cocktail émotionnel</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Synthese du cocktail emotionnel..."
                          className="min-h-[100px] rounded-xl bg-background/50 border-white/5 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 mt-6"
                  disabled={plutchikMutation.isPending}
                >
                  {plutchikMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer les émotions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminMetricsPage;
