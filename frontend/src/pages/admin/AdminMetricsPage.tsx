import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sliders, Loader2, BarChart3, Heart, Save, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
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
import { useIrcBreakdown, useUpsertIrcBreakdown } from "@/hooks/use-irc-breakdown";
import { useMessages } from "@/hooks/use-messages";

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
});

const ircBreakdownSchema = z.object({
    intensity: z.coerce.number().min(0).max(100),
    thematicRichness: z.coerce.number().min(0).max(100),
    narrativeCoherence: z.coerce.number().min(0).max(100),
    originality: z.coerce.number().min(0).max(100),
});

type IrcBreakdownFormValues = z.infer<typeof ircBreakdownSchema>;

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
    const { data: ircBreakdown } = useIrcBreakdown(projectId!);
    const upsertIrcBreakdownMutation = useUpsertIrcBreakdown(projectId!);

    const { data: messagesPage } = useMessages(projectId || "", { limit: 1000, page: 1 });
    const computedCount = messagesPage?.total ?? 0;
    const computedTotal = messagesPage?.data?.reduce((sum, m) => sum + (m.duration ?? 0), 0) ?? 0;
    const computedAvg = computedCount > 0 ? Math.round(computedTotal / computedCount) : 0;

    const syncFromMessages = () => {
        metricsForm.setValue("messagesCount", computedCount, { shouldDirty: true });
        metricsForm.setValue("totalDurationSec", Math.round(computedTotal), { shouldDirty: true });
        metricsForm.setValue("avgDurationSec", computedAvg, { shouldDirty: true });
    };

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
        },
    });

    // ---- IRC Breakdown form ----
    const ircBreakdownForm = useForm<IrcBreakdownFormValues>({
        resolver: zodResolver(ircBreakdownSchema),
        defaultValues: { intensity: 0, thematicRichness: 0, narrativeCoherence: 0, originality: 0 },
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

    // Auto-sync from messages when metrics are not yet set
    useEffect(() => {
        if (computedCount > 0 && !project?.metrics?.messagesCount) {
            metricsForm.setValue("messagesCount", computedCount, { shouldDirty: true });
            metricsForm.setValue("totalDurationSec", Math.round(computedTotal), { shouldDirty: true });
            metricsForm.setValue("avgDurationSec", computedAvg, { shouldDirty: true });
        }
    }, [computedCount]); // eslint-disable-line react-hooks/exhaustive-deps

    // Pre-fill forms when project data arrives
    useEffect(() => {
        if (project?.metrics) {
            const m = project.metrics;
            metricsForm.reset({
                messagesCount: m.messagesCount || computedCount,
                avgDurationSec: m.avgDurationSec || computedAvg,
                totalDurationSec: m.totalDurationSec || Math.round(computedTotal),
                participationRate: m.participationRate,
                ircScore: m.ircScore,
                tonalityAvg: m.tonalityAvg,
                highEmotionShare: m.highEmotionShare,
                ircInterpretation: m.ircInterpretation,
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

    useEffect(() => {
        if (ircBreakdown && !ircBreakdownForm.formState.isDirty) {
            ircBreakdownForm.reset({
                intensity: ircBreakdown.intensity,
                thematicRichness: ircBreakdown.thematicRichness,
                narrativeCoherence: ircBreakdown.narrativeCoherence,
                originality: ircBreakdown.originality,
            });
        }
    }, [ircBreakdown]); // eslint-disable-line react-hooks/exhaustive-deps

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
            />

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* ---- Section 1: Metriques IRC ---- */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-lg font-semibold font-heading flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Indicateurs IRC
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground/40 mt-1">
                            Performance globale de la campagne
                        </CardDescription>
                        {computedCount > 0 && (
                            <button
                                type="button"
                                onClick={syncFromMessages}
                                className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Recalculer depuis les verbatims ({computedCount} messages)
                            </button>
                        )}
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <Form {...metricsForm}>
                            <form
                                onSubmit={metricsForm.handleSubmit((v) =>
                                    metricsMutation.mutate(v)
                                )}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={metricsForm.control}
                                        name="messagesCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Messages</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={0} className="h-11 rounded-xl bg-background/50 border-border/50 font-mono" {...field} />
                                                </FormControl>
                                                {computedCount > 0 && <p className="text-[10px] text-muted-foreground/60">Calculé : {computedCount}</p>}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={metricsForm.control}
                                        name="tonalityAvg"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tonalité</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" className="h-11 rounded-xl bg-background/50 border-border/50 font-mono" {...field} />
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
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Moyenne (sec)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.1"
                                                        className="h-11 rounded-xl bg-background/50 border-border/50 font-mono"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                {computedAvg > 0 && <p className="text-[10px] text-muted-foreground/60">Calculé : {computedAvg}s</p>}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={metricsForm.control}
                                        name="totalDurationSec"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total (sec)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.1"
                                                        className="h-11 rounded-xl bg-background/50 border-border/50 font-mono"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                {computedTotal > 0 && <p className="text-[10px] text-muted-foreground/60">Calculé : {Math.round(computedTotal)}s</p>}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={metricsForm.control}
                                    name="participationRate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Taux de participation</FormLabel>
                                                <span className="text-xs font-mono font-bold text-primary">{Math.round(field.value * 100)}%</span>
                                            </div>
                                            <FormControl>
                                                <div className="flex gap-4 items-center">
                                                    <Slider
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={[field.value]}
                                                        onValueChange={(val) => field.onChange(val[0])}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={1}
                                                        step="0.01"
                                                        className="w-20 h-9 rounded-lg bg-background/50 border-border/50 font-mono text-center"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={metricsForm.control}
                                    name="ircScore"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-heading">Score IRC Global</FormLabel>
                                                <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{field.value}</span>
                                            </div>
                                            <FormControl>
                                                <div className="flex gap-4 items-center">
                                                    <Slider
                                                        min={0}
                                                        max={100}
                                                        step={0.1}
                                                        value={[field.value]}
                                                        onValueChange={(val) => field.onChange(val[0])}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step="0.1"
                                                        className="w-20 h-9 rounded-lg bg-background/50 border-border/50 font-mono text-center"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={metricsForm.control}
                                    name="highEmotionShare"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Part forte émotion</FormLabel>
                                                <span className="text-xs font-mono font-bold text-primary">{Math.round(field.value * 100)}%</span>
                                            </div>
                                            <FormControl>
                                                <div className="flex gap-4 items-center">
                                                    <Slider
                                                        min={0}
                                                        max={1}
                                                        step={0.01}
                                                        value={[field.value]}
                                                        onValueChange={(val) => field.onChange(val[0])}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={1}
                                                        step="0.01"
                                                        className="w-20 h-9 rounded-lg bg-background/50 border-border/50 font-mono text-center"
                                                        {...field}
                                                    />
                                                </div>
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
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Interprétation IRC</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Interprétation des résultats IRC..."
                                                    className="min-h-[100px] rounded-xl bg-background/50 border-border/50 resize-none p-4"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={metricsMutation.isPending || !metricsForm.formState.isDirty}
                                    className={cn(
                                        "w-full h-12 rounded-xl font-semibold text-xs transition-all duration-300 shadow-lg mt-6",
                                        metricsForm.formState.isDirty 
                                            ? "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5" 
                                            : "bg-muted text-muted-foreground shadow-none hover:bg-muted"
                                    )}
                                >
                                    {metricsMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Enregistrer les métriques
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* ---- Section 2: Roue de Plutchik ---- */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-lg font-semibold font-heading flex items-center gap-2">
                            <Heart className="h-5 w-5 text-primary" />
                            Roue de Plutchik
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground/40 mt-1">
                            Scores émotionnels (échelle 0-1)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <Form {...plutchikForm}>
                            <form
                                onSubmit={plutchikForm.handleSubmit((v) =>
                                    plutchikMutation.mutate(v)
                                )}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {[
                                        { id: 'joy', label: 'Joie' },
                                        { id: 'trust', label: 'Confiance' },
                                        { id: 'fear', label: 'Peur' },
                                        { id: 'surprise', label: 'Surprise' },
                                        { id: 'sadness', label: 'Tristesse' },
                                        { id: 'anticipation', label: 'Anticipation' },
                                        { id: 'anger', label: 'Colère' }
                                    ].map((emotion) => (
                                        <FormField
                                            key={emotion.id}
                                            control={plutchikForm.control}
                                            name={emotion.id as any}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{emotion.label}</FormLabel>
                                                        <span className="text-xs font-mono font-bold text-primary">{Math.round(field.value * 100)}%</span>
                                                    </div>
                                                    <FormControl>
                                                        <div className="flex gap-4 items-center">
                                                            <Slider
                                                                min={0}
                                                                max={1}
                                                                step={0.01}
                                                                value={[field.value]}
                                                                onValueChange={(val) => field.onChange(val[0])}
                                                                className="flex-1"
                                                            />
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={1}
                                                                step="0.01"
                                                                className="w-20 h-9 px-2 rounded-lg bg-background/50 border-border/50 font-mono text-center text-xs"
                                                                {...field}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>

                                <FormField
                                    control={plutchikForm.control}
                                    name="cocktailSummary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Résumé du cocktail émotionnel</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Synthèse du cocktail émotionnel..."
                                                    className="min-h-[120px] rounded-xl bg-background/50 border-border/50 resize-none p-4"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={plutchikMutation.isPending || !plutchikForm.formState.isDirty}
                                    className={cn(
                                        "w-full h-12 rounded-xl font-semibold text-xs transition-all duration-300 shadow-lg mt-6",
                                        plutchikForm.formState.isDirty 
                                            ? "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5" 
                                            : "bg-muted text-muted-foreground shadow-none hover:bg-muted"
                                    )}
                                >
                                    {plutchikMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Enregistrer les émotions
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* ---- Section 3: Décomposition IRC ---- */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <CardTitle className="text-lg font-semibold font-heading flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-primary" />
                            Décomposition IRC
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-muted-foreground/40 mt-1">
                            Critères de décomposition (0-100)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <Form {...ircBreakdownForm}>
                            <form
                                onSubmit={ircBreakdownForm.handleSubmit((v) =>
                                    upsertIrcBreakdownMutation.mutate({
                                        intensity: v.intensity ?? 0,
                                        thematicRichness: v.thematicRichness ?? 0,
                                        narrativeCoherence: v.narrativeCoherence ?? 0,
                                        originality: v.originality ?? 0
                                    }, {
                                        onSuccess: (saved) => ircBreakdownForm.reset({
                                            intensity: saved.intensity,
                                            thematicRichness: saved.thematicRichness,
                                            narrativeCoherence: saved.narrativeCoherence,
                                            originality: saved.originality,
                                        })
                                    })
                                )}
                                className="space-y-8"
                            >
                                {[
                                    { id: 'intensity', label: 'Intensité émotionnelle' },
                                    { id: 'thematicRichness', label: 'Richesse thématique' },
                                    { id: 'narrativeCoherence', label: 'Cohérence narrative' },
                                    { id: 'originality', label: 'Originalité' }
                                ].map((item) => (
                                    <FormField
                                        key={item.id}
                                        control={ircBreakdownForm.control}
                                        name={item.id as any}
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <FormLabel className="text-[11px] font-bold text-foreground tracking-tight">{item.label}</FormLabel>
                                                    </div>
                                                    <span className="text-sm font-mono font-bold text-primary">{field.value}</span>
                                                </div>
                                                <FormControl>
                                                    <div className="flex gap-4 items-center">
                                                        <Slider
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            value={[field.value]}
                                                            onValueChange={(val) => field.onChange(val[0])}
                                                            className="flex-1"
                                                        />
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            className="w-16 h-9 rounded-lg bg-background/50 border-border/50 font-mono text-center"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">Note</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Ces scores influencent directement la visualisation radar dans le dashboard client.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={upsertIrcBreakdownMutation.isPending || !ircBreakdownForm.formState.isDirty}
                                    className={cn(
                                        "w-full h-12 rounded-xl font-semibold text-xs transition-all duration-300 shadow-lg mt-6",
                                        ircBreakdownForm.formState.isDirty 
                                            ? "bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5" 
                                            : "bg-muted text-muted-foreground shadow-none hover:bg-muted"
                                    )}
                                >
                                    {upsertIrcBreakdownMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Enregistrer la décomposition
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
