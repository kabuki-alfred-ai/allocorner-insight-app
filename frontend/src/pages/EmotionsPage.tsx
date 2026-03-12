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
import { useParams } from "react-router-dom";
import { Heart, Brain, Smile, Frown, Star, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AudioPlayer } from "@/components/AudioPlayer";
import type { ProjectPlutchik, Message } from "@/lib/types";

const PLUTCHIK_EMOTION_KEYS: (keyof Pick<ProjectPlutchik, 'joy' | 'trust' | 'sadness' | 'anticipation' | 'anger' | 'surprise' | 'fear'>)[] = [
  'joy', 'trust', 'sadness', 'anticipation', 'anger', 'surprise', 'fear'
];

export default function EmotionsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading } = useProject(projectId!);
  const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId!);
  const { data: statsData, isLoading: statsLoading } = useMessagesStats(projectId!);
  const { data: ircBreakdownData, isLoading: ircLoading } = useIrcBreakdown(projectId!);

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

  // Distribution charge émotionnelle (données réelles)
  const emotionalLoadData = statsData?.emotionalLoadDistribution || [];

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
          "@context": "https://schema.org",
          "@type": "AnalysisNewsArticle",
          "headline": "Analyse IRC & Plutchik",
          "description": "Analyse émotionnelle des témoignages selon les modèles IRC et Plutchik",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "datePublished": new Date().toISOString().split('T')[0],
          "about": {
            "@type": "Thing",
            "name": "Analyse émotionnelle Plutchik",
            "description": "Cartographie des émotions selon le modèle de Robert Plutchik"
          }
        })}
      </script>

    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      <PageHeader 
        title="IRC & Plutchik"
        description={project?.title}
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="space-y-24">
        {/* Section 1: Score IRC Global & Détail */}
        <section className="space-y-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/20" />
            <h3 className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Indicateur de Résonance Citoyenne</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-2">
            {/* Score IRC global */}
            <div className="space-y-8">
              <div className="px-6">
                <h3 className="label-uppercase mb-1.5">Impact Citoyen</h3>
                <p className="text-2xl font-black text-foreground tracking-tighter">Score Global</p>
              </div>
              <div className="adl-card p-12 flex flex-col items-center text-center space-y-8 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="relative">
                  <div className="text-8xl font-black text-foreground tracking-tighter transition-all duration-700 group-hover:scale-105">
                    {metrics?.ircScore ?? '—'}
                  </div>
                  <span className="absolute -top-1 -right-8 text-xs font-black text-muted-foreground/30 uppercase tracking-[0.25em]">/100</span>
                </div>
                <div className="space-y-3">
                  <p className="text-base font-black text-foreground uppercase tracking-[0.15em] tracking-tight">Impact de Résonance Citoyenne</p>
                  <p className="text-sm font-medium text-muted-foreground/60 max-w-[280px] mx-auto leading-relaxed">Engagement citoyen significatif et forte résonance territoriale identifiée.</p>
                </div>
                <div className="w-full max-w-[200px] bg-black/[0.04] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${metrics?.ircScore ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Décomposition IRC */}
            <div className="space-y-8">
              <div className="px-6">
                <h3 className="label-uppercase mb-1.5">Détail des piliers</h3>
                <p className="text-2xl font-black text-foreground tracking-tighter">Métrique décomposée</p>
              </div>
              <div className="space-y-7 px-4">
                {ircBreakdown.map((item, index) => (
                  <div key={index} className="space-y-3 group cursor-default">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{item.criterion}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-muted-foreground/40">{item.score}/100</span>
                        <span className="text-[9px] font-black bg-black/[0.04] px-3 py-1 rounded-full text-primary/60 tracking-widest">{item.weight}%</span>
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
        <section className="space-y-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/20" />
            <h3 className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Cartographie Émotionnelle (Plutchik)</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-2">
            {/* Roue des émotions */}
            <div className="space-y-8">
              <div className="px-6">
                <h3 className="label-uppercase mb-1.5">Psychologie</h3>
                <p className="text-2xl font-black text-foreground tracking-tighter">Émotions Dominantes</p>
              </div>
              <div className="adl-card p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-black/[0.01] to-transparent pointer-events-none" />
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie
                      data={plutchikData}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={140}
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
                            <div className="bg-white p-4 rounded-[1.5rem] shadow-elevated border border-black/5">
                              <p className="label-uppercase mb-1.5">{payload[0].payload.emotion}</p>
                              <p className="text-2xl font-black" style={{ color: payload[0].payload.color }}>{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Détail émotions */}
            <div className="space-y-8">
              <div className="px-6">
                <h3 className="label-uppercase mb-1.5">Répartition</h3>
                <p className="text-2xl font-black text-foreground tracking-tighter">Nuancier émotionnel</p>
              </div>
              <div className="space-y-3 px-2">
                {plutchikData
                  .sort((a, b) => b.value - a.value)
                  .map((emotion, index) => (
                    <div
                      key={index}
                      className={`group relative p-5 rounded-[1.5rem] transition-all duration-500 cursor-pointer border border-transparent ${
                        selectedEmotion === emotion.emotion
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
                          <span className="text-[11px] font-black text-foreground/50 uppercase tracking-[0.2em] transition-colors group-hover:text-foreground">
                            {emotion.emotion}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-lg font-black tracking-tight" style={{ color: emotion.color }}>
                            {emotion.value}%
                          </span>
                          <span className="text-[10px] font-black text-muted-foreground/20 italic tracking-widest">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Charge Émotionnelle & Verbatims */}
        <section className="space-y-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/20" />
            <h3 className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Analyse de l'Intensité</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-2">
            {/* Distribution charge émotionnelle */}
            <div className="space-y-8">
              <div className="px-6">
                <h3 className="label-uppercase mb-1.5">Analyse d'intensité</h3>
                <p className="text-2xl font-black text-foreground tracking-tighter">Charge Émotionnelle</p>
              </div>
              <div className="adl-card p-12">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={emotionalLoadData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={130}
                      dataKey="count"
                      strokeWidth={0}
                      paddingAngle={0}
                    >
                      {emotionalLoadData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.7} className="hover:opacity-100 transition-opacity cursor-default" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-[1.5rem] shadow-elevated border border-black/5 text-center">
                              <p className="label-uppercase mb-1.5">{payload[0].payload.load}</p>
                              <p className="text-2xl font-black" style={{ color: payload[0].payload.color }}>{payload[0].payload.percentage}%</p>
                              <p className="text-[10px] font-bold text-muted-foreground/30 mt-1 uppercase tracking-widest">{payload[0].value} témoignages</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-8 mt-8">
                  {emotionalLoadData.map((d) => (
                    <div key={d.load} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: d.color }} />
                      <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">{d.load}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exemples par charge */}
            <div className="space-y-8">
              <div className="px-6">
                <h3 className="label-uppercase mb-1.5">Témoignages clés</h3>
                <p className="text-2xl font-black text-foreground tracking-tighter">Matière marquante</p>
              </div>
              <div className="space-y-6 px-2">
                {representativeMessages.map((message) => (
                  <AudioPlayer key={message.id} message={message} projectId={projectId!} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
