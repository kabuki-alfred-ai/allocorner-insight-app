import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useProject } from "@/hooks/use-projects";
import { useMessages } from "@/hooks/use-messages";
import { useMessagesStats } from "@/hooks/use-messages-stats";
import { useIrcBreakdown } from "@/hooks/use-irc-breakdown";
import { useFeaturedVerbatims } from "@/hooks/use-featured-verbatims";
import { useAudio } from "@/lib/audio-context";
import { useParams } from "react-router-dom";
import { Heart, Brain, Smile, Frown, Star, AlertCircle, Loader2, Sparkles, Play, Pause } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { speakerProfileLabel, speakerProfileColor, toneLabel, toneColor } from "@/lib/verbatim-utils";
import type { ProjectPlutchik } from "@/lib/types";

const PLUTCHIK_EMOTION_KEYS: (keyof Pick<ProjectPlutchik, 'joy' | 'trust' | 'sadness' | 'anticipation' | 'anger' | 'surprise' | 'fear'>)[] = [
    'joy', 'trust', 'sadness', 'anticipation', 'anger', 'surprise', 'fear'
];

export default function EmotionsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: project, isLoading: projectLoading } = useProject(projectId!);
    const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId!);
    const { data: statsData, isLoading: statsLoading } = useMessagesStats(projectId!);
    const { data: ircBreakdownData, isLoading: ircLoading } = useIrcBreakdown(projectId!);
    const { data: featuredVerbatims = [] } = useFeaturedVerbatims(projectId!);
    const { currentMessage, isPlaying, playMessage, audioLoading } = useAudio();

    const COER_META: Record<string, { label: string; description: string }> = {
        CONTRASTE:        { label: "Contraste",          description: "Opposition ou paradoxe révélateur" },
        ORIGINALITE:      { label: "Originalité",        description: "Angle inattendu ou usage détourné" },
        EMOTION:          { label: "Émotion",            description: "Charge émotionnelle forte ou intime" },
        REPRESENTATIVITE: { label: "Représentativité",   description: "Témoignage archétypal de la cible" },
        TOTEM:            { label: "Totem",              description: "Verbatim emblématique du projet" },
    };

    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

    const plutchik = project?.plutchik;
    const metrics = project?.metrics;

    const EMOTION_TRANSLATIONS: { [key: string]: string } = {
        joy: 'Joie',
        trust: 'Confiance',
        sadness: 'Tristesse',
        anticipation: 'Anticipation',
        anger: 'Colère',
        surprise: 'Surprise',
        fear: 'Peur'
    };

    // Données Plutchik transformées
    const plutchikData = plutchik
        ? PLUTCHIK_EMOTION_KEYS.map((emotion) => ({
            emotion: EMOTION_TRANSLATIONS[emotion] || emotion,
            value: Math.round(plutchik[emotion] * 100),
            color: getEmotionColor(emotion)
        }))
        : [];

    // Score IRC décomposé depuis la DB
    const ircBreakdown = ircBreakdownData ? [
        { criterion: 'Intensité émotionnelle', score: Math.round(ircBreakdownData.intensity), weight: 30 },
        { criterion: 'Richesse thématique', score: Math.round(ircBreakdownData.thematicRichness), weight: 25 },
        { criterion: 'Cohérence narrative', score: Math.round(ircBreakdownData.narrativeCoherence), weight: 25 },
        { criterion: 'Originalité', score: Math.round(ircBreakdownData.originality), weight: 20 }
    ] : [];

    function getEmotionColor(emotion: string): string {
        const colors: { [key: string]: string } = {
            joy: '#FFC629',
            trust: '#39B36A',
            sadness: '#8B5CF6',
            anticipation: '#2F66F5',
            anger: '#E35454',
            surprise: '#FF6B9D',
            fear: '#94A3B8'
        };
        return colors[emotion] || '#8B5CF6';
    }

    function getEmotionIcon(emotion: string) {
        const icons: { [key: string]: typeof Heart } = {
            joy: Smile,
            trust: Heart,
            sadness: Frown,
            anticipation: Star,
            anger: AlertCircle,
            surprise: Brain,
            fear: AlertCircle
        };
        const Icon = icons[emotion.toLowerCase()] || Heart;
        return <Icon className="h-4 w-4" />;
    }

    const representativeMessages = (messagesData?.data || []).slice(0, 3);

    if (projectLoading || messagesLoading || statsLoading || ircLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <title>Analyse IRC & Plutchik | Allo Corner Insight</title>
            <meta name="description" content="Analyse émotionnelle approfondie selon les modèles IRC et Plutchik." />
            <link rel="canonical" href="/emotions" />

            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org", "@type": "AnalysisNewsArticle", "headline": "Analyse IRC & Plutchik", "description": "Analyse émotionnelle des témoignages selon les modèles IRC et Plutchik", "author": { "@type": "Organization", "name": "Allo Corner" }, "datePublished": new Date().toISOString().split('T')[0], "about": {
                        "@type": "Thing", "name": "Analyse émotionnelle Plutchik", "description": "Cartographie des émotions selon le modèle de Robert Plutchik"
                    }
                })}
            </script>

            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-12">
                <PageHeader
                    title="IRC & Plutchik"
                    description={project?.title}
                    icon={<Sparkles className="h-5 w-5" />}
                />

                <div className="space-y-6">
                    {/* Section 1: Score IRC Global & Détail */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary/20" />

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                            {/* Score IRC global */}
                            <div className="space-y-6">
                                <div className="px-6">

                                    <p className="text-xl font-semibold text-foreground tracking-tight">Score Global</p>
                                </div>
                                <Card className="p-6 flex flex-col items-center text-center space-y-6 relative group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                    <div className="relative">
                                        <div className="text-6xl font-semibold text-foreground tracking-tighter transition-all duration-700 group-hover:scale-105">
                                            {metrics?.ircScore ?? '—'}
                                        </div>
                                        <span className="absolute -top-1 -right-8 text-xs font-semibold text-muted-foreground/85 tracking-[0.25em]">/100</span>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-base font-semibold text-foreground tracking-[0.15em] tracking-tight">Impact de Résonance Citoyenne</p>
                                        <p className="text-sm font-medium text-muted-foreground/85 max-w-[280px] mx-auto leading-relaxed">Engagement citoyen significatif et forte résonance territoriale identifiée.</p>
                                    </div>
                                    <div className="w-full max-w-[200px] bg-black/[0.04] rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${metrics?.ircScore ?? 0}%` }}
                                        />
                                    </div>
                                </Card>
                            </div>

                            {/* Décomposition IRC */}
                            <div className="space-y-6">
                                <div className="px-6">

                                    <p className="text-xl font-semibold text-foreground tracking-tight">Métrique décomposée</p>
                                </div>
                                <div className="space-y-7 px-4">
                                    {ircBreakdown.map((item, index) => (
                                        <div key={index} className="space-y-3 group cursor-default">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-semibold text-foreground/85 tracking-[0.2em] group-hover:text-primary transition-colors">{item.criterion}</span>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[11px] font-semibold text-muted-foreground/70">{item.score}/100</span>
                                                    <span className="text-[9px] font-semibold bg-black/[0.04] px-3 py-1 rounded-full text-primary/90">{item.weight}%</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-black/[0.04] rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${item.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Modèle Plutchik */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary/20" />

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                            {/* Roue des émotions */}
                            <div className="space-y-6">
                                <div className="px-6">

                                    <p className="text-xl font-semibold text-foreground tracking-tight">Émotions Dominantes</p>
                                </div>
                                <Card className="p-6 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-black/[0.01] to-transparent pointer-events-none" />
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={plutchikData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={2}
                                                dataKey="value"
                                                strokeWidth={0}
                                                onMouseEnter={(data) => setSelectedEmotion(data.emotion)}
                                                onMouseLeave={() => setSelectedEmotion(null)}
                                            >
                                                {plutchikData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        opacity={selectedEmotion === entry.emotion ? 1 : 0.4}
                                                        className="transition-all duration-700 cursor-pointer"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-4 rounded-[1.5rem] shadow-md border border-black/5">
                                                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">{payload[0].payload.emotion}</p>
                                                                <p className="text-2xl font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].value}%</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>

                            {/* Détail émotions */}
                            <div className="space-y-6">
                                <div className="px-6">

                                    <p className="text-xl font-semibold text-foreground tracking-tight">Nuancier émotionnel</p>
                                </div>
                                <div className="space-y-1 px-2">
                                    {plutchikData
                                        .sort((a, b) => b.value - a.value)
                                        .map((emotion, index) => (
                                            <div
                                                key={index}
                                                className={`group relative py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer border border-transparent ${selectedEmotion === emotion.emotion
                                                    ? 'bg-white shadow-md border-black/[0.03] scale-[1.02]'
                                                    : 'hover:bg-black/[0.02]'
                                                    }`}
                                                onClick={() => setSelectedEmotion(
                                                    selectedEmotion === emotion.emotion ? null : emotion.emotion
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: emotion.color }} />
                                                        <span className="text-[11px] font-semibold text-foreground/85 transition-colors group-hover:text-foreground">
                                                            {emotion.emotion}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-xs font-semibold" style={{ color: emotion.color }}>
                                                            {emotion.value}%
                                                        </span>
                                                        <span className="text-[9px] font-medium text-muted-foreground/85 italic">#{index + 1}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Tonalité & Verbatims */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary/20" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                            {/* Distribution tonalité */}
                            <div className="space-y-6">
                                <div className="px-6">
                                    <p className="text-xl font-semibold text-foreground tracking-tight">Tonalité Globale</p>
                                </div>
                                <Card className="p-6">
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie
                                                data={statsData?.tonalityDistribution || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={0}
                                                outerRadius={100}
                                                dataKey="count"
                                                strokeWidth={0}
                                                paddingAngle={0}
                                            >
                                                {(statsData?.tonalityDistribution || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} className="hover:opacity-100 transition-opacity cursor-default" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div className="bg-white p-4 rounded-[1.5rem] shadow-md border border-black/5 text-center">
                                                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">{payload[0].payload.tone}</p>
                                                                <p className="text-2xl font-semibold" style={{ color: payload[0].payload.color }}>{payload[0].payload.percentage}%</p>
                                                                <p className="text-[10px] font-medium text-muted-foreground/85 mt-1">{payload[0].value} témoignages</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-8 mt-8">
                                        {(statsData?.tonalityDistribution || []).map((d) => (
                                            <div key={d.tone} className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: d.color }} />
                                                <span className="text-[10px] font-semibold text-muted-foreground/70 tracking-[0.25em]">{d.tone}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            {/* Modèle C.O.E.R */}
                            <div className="space-y-6">
                                <div className="px-6">
                                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/50 mb-1">Modèle C.O.E.R</p>
                                    <p className="text-xl font-semibold text-foreground tracking-tight">Verbatims Marquants</p>
                                </div>
                                <div className="flex flex-col px-2">
                                    {featuredVerbatims.length > 0 ? featuredVerbatims.map((v) => {
                                        const msg = v.message ?? null;
                                        const meta = COER_META[v.category];
                                        const isCurrent = msg && currentMessage?.id === msg.id;
                                        const isThisPlaying = isCurrent && isPlaying;
                                        const isThisLoading = isCurrent && audioLoading;
                                        return (
                                            <div
                                                key={v.id}
                                                onClick={() => msg && playMessage(msg, projectId!)}
                                                className={cn(
                                                    "group flex items-center gap-4 px-3 py-4 rounded-xl border border-transparent transition-all",
                                                    msg ? "cursor-pointer hover:bg-muted/40 hover:border-border/20" : "cursor-default",
                                                    isCurrent ? "bg-muted/60 border-border/50" : ""
                                                )}
                                            >
                                                <div className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full bg-muted/20 group-hover:bg-primary/10 transition-colors">
                                                    {isThisLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    ) : isThisPlaying ? (
                                                        <Pause className="h-4 w-4 fill-primary text-primary" />
                                                    ) : (
                                                        <Play className={cn(
                                                            "h-4 w-4 fill-current transition-all",
                                                            isCurrent ? "text-primary fill-primary" : msg ? "text-muted-foreground/40 group-hover:text-primary group-hover:fill-primary" : "text-muted-foreground/20"
                                                        )} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                    <div className="flex items-baseline gap-2">
                                                        <h4 className={cn("text-[13px] font-semibold tracking-tight", isCurrent ? "text-primary" : "text-foreground/90")}>
                                                            {meta?.label || v.category}
                                                        </h4>
                                                        <span className="text-[10px] text-muted-foreground/40 truncate">{meta?.description}</span>
                                                    </div>
                                                    {msg && (
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {msg.speakerProfile && (
                                                                <Badge variant="outline" className={cn("text-[9px] font-semibold px-2 py-0 border-none", speakerProfileColor[msg.speakerProfile])}>
                                                                    {speakerProfileLabel[msg.speakerProfile]}
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className={cn("text-[9px] font-semibold px-2 py-0 border-none", toneColor[msg.tone])}>
                                                                {toneLabel[msg.tone]}
                                                                <div className={cn("ml-1.5 w-1 h-1 rounded-full", msg.tone === 'POSITIVE' ? "bg-green-600" : msg.tone === 'NEGATIVE' ? "bg-red-600" : "bg-muted-foreground/40")} />
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <p className="text-[11px] text-muted-foreground/50 italic font-serif leading-relaxed line-clamp-1 mt-1">
                                                        "{v.citation}"
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-xs italic text-muted-foreground/30 px-3">Aucun verbatim marquant défini.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
