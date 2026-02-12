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

  // Données Plutchik transformées
  const plutchikData = plutchik
    ? PLUTCHIK_EMOTION_KEYS.map((emotion) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
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

    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
      <PageHeader 
        title="IRC & Plutchik"
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="space-y-12">
        <Tabs defaultValue="irc" className="space-y-8">
          <TabsList className="bg-black/[0.03] p-1 rounded-xl h-11">
            <TabsTrigger value="irc" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Score IRC</TabsTrigger>
            <TabsTrigger value="plutchik" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Modèle Plutchik</TabsTrigger>
            <TabsTrigger value="charge" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">Charge Émotionnelle</TabsTrigger>
          </TabsList>

          <TabsContent value="irc" className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Score IRC global */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Score Global</h3>
                </div>
                <Card className="p-10 flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="text-7xl font-black text-foreground tracking-tighter">
                      {metrics?.ircScore ?? '—'}
                    </div>
                    <span className="absolute -top-2 -right-6 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">/100</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-foreground uppercase tracking-wide">Impact de Résonance Citoyenne</p>
                    <p className="text-xs text-muted-foreground/70 max-w-[200px]">Engagement citoyen significatif et forte résonance territoriale.</p>
                  </div>
                  <div className="w-full bg-black/[0.03] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metrics?.ircScore ?? 0}%` }}
                    />
                  </div>
                </Card>
              </div>

              {/* Décomposition IRC */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Décomposition</h3>
                </div>
                <div className="space-y-6 px-2">
                  {ircBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2 group">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground/80 uppercase tracking-widest group-hover:text-foreground transition-colors">{item.criterion}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-muted-foreground/50">{item.score}/100</span>
                          <span className="text-[9px] font-black bg-black/[0.05] px-2 py-0.5 rounded text-muted-foreground/60">{item.weight}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-black/[0.03] rounded-full h-1 overflow-hidden">
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

            {/* Graphique IRC section */}
            <div className="space-y-6">
              <div className="px-2">
                <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Visualisation des scores</h3>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-black/[0.01] border border-black/[0.03] h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ircBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="criterion" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(0,0,0,0.5)', textAnchor: 'middle' }}
                      height={50}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(0,0,0,0.4)' }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-2xl shadow-elevated border border-black/5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.criterion}</p>
                              <p className="text-xl font-black text-primary">{payload[0].value}<span className="text-[10px] ml-1">/ 100</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" fill="#000" radius={[10, 10, 10, 10]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plutchik" className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Roue des émotions */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Modèle Circulaire</h3>
                </div>
                <Card className="p-8 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={plutchikData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={130}
                        paddingAngle={4}
                        dataKey="value"
                        onMouseEnter={(data) => setSelectedEmotion(data.emotion)}
                        onMouseLeave={() => setSelectedEmotion(null)}
                      >
                        {plutchikData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            opacity={selectedEmotion === entry.emotion ? 1 : 0.6}
                            className="transition-all duration-500"
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-2xl shadow-elevated border border-black/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.emotion}</p>
                                <p className="text-xl font-black" style={{ color: payload[0].payload.color }}>{payload[0].value}%</p>
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
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Répartition Détaillée</h3>
                </div>
                <div className="space-y-2 px-2">
                  {plutchikData
                    .sort((a, b) => b.value - a.value)
                    .map((emotion, index) => (
                      <div
                        key={index}
                        className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
                          selectedEmotion === emotion.emotion
                            ? 'bg-black/[0.02] shadow-sm scale-[1.01]'
                            : 'hover:bg-black/[0.01]'
                        }`}
                        onClick={() => setSelectedEmotion(
                          selectedEmotion === emotion.emotion ? null : emotion.emotion
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: emotion.color }} />
                            <span className="text-xs font-bold text-foreground/80 uppercase tracking-widest transition-colors group-hover:text-foreground">
                              {emotion.emotion}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-foreground" style={{ color: emotion.color }}>
                              {emotion.value}%
                            </span>
                            <span className="text-[9px] font-black text-muted-foreground/50">#{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charge" className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Distribution charge émotionnelle */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Intensité des témoignages</h3>
                </div>
                <Card className="p-8">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={emotionalLoadData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={110}
                        dataKey="count"
                        paddingAngle={2}
                      >
                        {emotionalLoadData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-2xl shadow-elevated border border-black/5 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.load}</p>
                                <p className="text-xl font-black" style={{ color: payload[0].payload.color }}>{payload[0].payload.percentage}%</p>
                                <p className="text-[10px] font-bold text-muted-foreground/60">{payload[0].value} messages</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-4">
                    {emotionalLoadData.map((d) => (
                      <div key={d.load} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{d.load}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Exemples par charge */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Exemples marquants</h3>
                </div>
                <div className="space-y-4 px-2">
                  {representativeMessages.map((message) => (
                    <AudioPlayer key={message.id} message={message} projectId={projectId!} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
