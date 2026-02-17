import { useParams } from "react-router-dom";
import { MetricCard } from "@/components/MetricCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-projects";
import { useMessages } from "@/hooks/use-messages";
import { useThemes } from "@/hooks/use-themes";
import { useMessagesStats } from "@/hooks/use-messages-stats";
import { PageHeader } from "@/components/PageHeader";
import {
  Users,
  Clock,
  MessageSquare,
  TrendingUp,
  Heart,
  Download,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: projectLoading } = useProject(projectId || "");
  const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId || "");
  const { data: themesData, isLoading: themesLoading } = useThemes(projectId || "");
  const { data: statsData, isLoading: statsLoading } = useMessagesStats(projectId || "");

  if (projectLoading || messagesLoading || themesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const themes = themesData || [];
  const totalThemeCount = themes.reduce((sum, t) => sum + t.count, 0);

  const participationData = [
    { name: "Participants", value: (project.metrics?.participationRate ?? 0) * 100, color: "hsl(var(--primary))" },
    { name: "Potentiel restant", value: (1 - (project.metrics?.participationRate ?? 0)) * 100, color: "hsl(var(--muted))" }
  ];

  const durationDistribution = statsData?.durationDistribution || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
      <PageHeader 
        title="Dashboard"
        badge={project.dates}
        icon={<LayoutDashboard className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
             <Button variant="outline" size="premium" className="border-black/5 bg-white shadow-sm hover:bg-muted/50 transition-all">
              <Download className="h-3.5 w-3.5 mr-2 opacity-40" />
              PDF
            </Button>
            <Button variant="default" size="premium" className="shadow-sm px-6 bg-black text-white hover:bg-black/90 transition-all">
              Exporter
            </Button>
          </div>
        }
      />

      <div className="space-y-12">

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Messages"
            value={project.metrics?.messagesCount ?? 0}
            subtitle="Volume total recueilli"
            icon={<MessageSquare className="h-4 w-4" />}
            trend="up"
          />
          <MetricCard
            title="Durée Moyenne"
            value={`${project.metrics?.avgDurationSec ?? 0}s`}
            subtitle="Engagement par verbatim"
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard
            title="Engagement"
            value={`${Math.round((project.metrics?.participationRate ?? 0) * 100)}%`}
            subtitle={`Base: ${project.participantsEstimated} pers.`}
            icon={<Users className="h-4 w-4" />}
            trend="up"
          />
          <MetricCard
            title="IRC Score"
            value={project.metrics?.ircScore ?? 0}
            subtitle="Impact & Climat Client"
            icon={<TrendingUp className="h-4 w-4" />}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Analysis Column (Themes & Duration) */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Theme Distribution */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-0.5">Analyse</h3>
                  <p className="text-sm font-bold text-foreground tracking-tight">Répartition des thématiques</p>
                </div>
                <div className="space-y-6 px-2">
                  {themes.length > 0 ? (
                    themes.map((theme) => {
                      const percentage = totalThemeCount > 0 ? Math.round((theme.count / totalThemeCount) * 100) : 0;
                      return (
                        <div key={theme.id} className="space-y-2 group">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-foreground/80 uppercase tracking-wide group-hover:text-primary transition-colors">
                                {theme.name}
                              </span>
                              {theme.analysis && <span className="text-[9px] font-bold text-muted-foreground/60 italic line-clamp-1">{theme.analysis}</span>}
                            </div>
                            <span className="text-[10px] font-black text-primary">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-black/[0.03] rounded-full h-1 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                backgroundColor: theme.color || "hsl(var(--primary))",
                                width: `${percentage}%`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Aucune donnée thématique disponible</p>
                  )}
                </div>
              </div>

              {/* Duration Chart */}
              <div className="space-y-6">
                <div className="px-2">
                  <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-0.5">Chronologie</h3>
                  <p className="text-sm font-bold text-foreground tracking-tight">Durée des témoignages</p>
                </div>
                <div className="h-[220px] w-full mt-4">
                  {durationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={durationDistribution}
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="range"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 9, fontWeight: 'black' }}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 4, 4]}
                          barSize={32}
                          opacity={0.8}
                        />
                        <RechartsTooltip
                          cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '10px' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-muted-foreground italic">Aucune donnée de durée disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emotional & Tonality Row */}
            <div className="pt-8 border-t border-black/[0.03]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-primary/[0.02] border border-primary/5 rounded-[2rem] p-8 flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-black/5">
                    <Heart className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Charge Émotionnelle</h4>
                    <div className="text-3xl font-black text-foreground">
                      {Math.round((project.metrics?.highEmotionShare ?? 0) * 100)}%
                    </div>
                    <p className="text-[10px] font-bold text-primary italic uppercase tracking-widest">
                      {(project.metrics?.highEmotionShare ?? 0) > 0.6
                        ? "Impact affectif fort"
                        : (project.metrics?.highEmotionShare ?? 0) > 0.3
                          ? "Impact affectif modéré"
                          : "Impact affectif faible"}
                    </p>
                  </div>
                </div>
                <div className="bg-black/[0.02] border border-black/[0.03] rounded-[2rem] p-8 flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-foreground border border-black/5">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Tonalité Globale</h4>
                    <div className="text-3xl font-black text-foreground">
                      {(project.metrics?.tonalityAvg ?? 0).toFixed(1)}/5
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 italic uppercase tracking-widest">
                      {(project.metrics?.tonalityAvg ?? 0) >= 4
                        ? "Sentiment majoritairement positif"
                        : (project.metrics?.tonalityAvg ?? 0) >= 3
                          ? "Sentiment neutre"
                          : "Sentiment négatif"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Engagement Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="px-2">
              <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-0.5">Engagement</h3>
              <p className="text-sm font-bold text-foreground">Taux de participation</p>
            </div>
            <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] border-black/[0.03] shadow-sm rounded-[2rem] bg-card/50 backdrop-blur-sm">
              <div className="relative w-full flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-10px]">
                  <span className="text-5xl font-black tracking-tighter text-foreground">
                    {Math.round((project.metrics?.participationRate ?? 0) * 100)}%
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-1">Engagement</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={95}
                      outerRadius={115}
                      paddingAngle={4}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {participationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={index === 0 ? 1 : 0.05}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
                  <span className="text-muted-foreground/60">0%</span>
                  <span className="text-primary">Objectif 100%</span>
                </div>
                <Progress value={(project.metrics?.participationRate ?? 0) * 100} className="h-2 bg-black/[0.03]" />
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Verbatims */}
        <div className="space-y-6 pt-8 border-t border-black/[0.03]">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Derniers verbatims</h3>
              <p className="text-xl font-black text-foreground tracking-tight">Matière brute</p>
            </div>
            <Button 
              variant="ghost" 
              size="premium"
              className="text-primary hover:bg-primary/5 transition-all rounded-full px-6"
              onClick={() => navigate(`/projects/${projectId}/verbatims`)}
            >
              Parcourir la bibliothèque
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messagesData?.data?.slice(0, 3).map((message) => (
              <AudioPlayer key={message.id} message={message} projectId={projectId!} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
