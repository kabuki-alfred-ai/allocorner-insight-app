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
import { useObjectives } from "@/hooks/use-objectives";
import { useAuth } from "@/lib/auth-context";
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
  Info,
  CheckCircle2,
  Lightbulb,
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
  const { user } = useAuth();
  const { data: project, isLoading: projectLoading } = useProject(projectId || "");
  const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId || "");
  const { data: themesData, isLoading: themesLoading } = useThemes(projectId || "");
  const { data: statsData, isLoading: statsLoading } = useMessagesStats(projectId || "");
  const { data: objectivesData, isLoading: objectivesLoading } = useObjectives(projectId || "");

  if (projectLoading || messagesLoading || themesLoading || statsLoading || objectivesLoading) {
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
    { name: "Taux de participation", value: (project.metrics?.participationRate ?? 0) * 100, color: "hsl(var(--primary))" },
    { name: "Potentiel restant", value: (1 - (project.metrics?.participationRate ?? 0)) * 100, color: "hsl(var(--muted))" }
  ];

  const durationDistribution = statsData?.durationDistribution || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-16">
      <PageHeader 
        title="Tableau de Bord"
        description={project.title}
        badge={project.dates}
        icon={<LayoutDashboard className="h-5 w-5" />}
      />

      {/* Welcome Card */}
      <div className="verbatim-card-dark p-8 md:p-12 relative overflow-hidden group mb-12 shadow-2xl flex flex-col items-start text-left mt-2">
        {/* Background Audio Wave (Dynamic) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-around h-[120%] px-2 gap-1 md:gap-2">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-primary rounded-t-full transition-all duration-300 animate-waveform"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${0.8 + Math.random() * 0.5}s`,
                  opacity: 0.2 + (i / 40) * 0.4
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col space-y-4 max-w-2xl px-2">
          <p className="text-primary/70 font-black tracking-[0.3em] uppercase text-[10px]">Espace d'analyse</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Bonjour, {user?.name ? user.name.split(' ')[0] : 'Analyste'}
          </h2>
          <p className="text-white/60 font-medium text-balance text-lg leading-relaxed mt-2 font-body">
            L'analyse concernant <span className="text-white font-bold">{project.title}</span> est prête. Explorez les indicateurs clés et plongez au cœur des retours pour identifier les signaux majeurs.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6">
            <Button
              size="lg"
              className="bg-primary text-black hover:bg-white rounded-2xl font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,100,0,0.3)] transition-all h-14 px-8 text-sm"
              onClick={() => navigate(`/projects/${projectId}/wrapped`)}
            >
              Lancer le Wrapped
            </Button>
            <p className="text-white/50 text-sm font-medium italic pr-8 sm:pr-0">
              Revivez les moments clés de votre projet.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Context & Objectives Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-2 pb-4">
          <div className="lg:col-span-12">
             <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-8 bg-primary/20" />
                <h3 className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Contexte & Objectifs</h3>
             </div>
          </div>
          
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-6">
              <p className="text-2xl font-bold leading-[1.4] text-foreground/90 tracking-tight">
                {project.context}
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-black/[0.02] border border-black/[0.03] space-y-8 group hover:bg-black/[0.03] transition-all duration-500">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Méthodologie</h3>
                <p className="text-2xl font-black font-heading tracking-tight italic text-primary/80 leading-tight">
                  "{project.methodology}"
                </p>
              </div>
              <div className="pt-8 border-t border-black/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 text-muted-foreground/40">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Responsable d'étude</p>
                    <p className="text-sm font-bold text-foreground/80">{project.analyst}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="px-2">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40 mb-6">Objectifs clés</p>
              <ul className="space-y-6">
                {(objectivesData || []).map((obj, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="h-5 w-5 rounded-full border border-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/40 transition-colors duration-500">
                      <CheckCircle2 className="h-3 w-3 text-primary/20 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    <span className="text-sm font-semibold leading-relaxed text-foreground/50 group-hover:text-foreground/80 transition-colors duration-500">
                      {obj.content}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 rounded-[2rem] bg-primary/[0.02] border border-primary/5 flex items-start gap-4 hover:bg-primary/[0.04] transition-colors duration-500">
              <Lightbulb className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Échantillonnage</p>
                <p className="text-[11px] font-black text-primary/60 leading-relaxed uppercase tracking-widest">
                  Analyse basée sur {project.metrics?.messagesCount ?? 0} témoignages audio.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          <MetricCard
            title="Messages"
            value={project.metrics?.messagesCount ?? 0}
            subtitle="Volume total"
            icon={<MessageSquare className="h-4 w-4" />}
            trend="up"
          />
          <MetricCard
            title="Durée Moyenne"
            value={`${project.metrics?.avgDurationSec ?? 0}s`}
            subtitle="Engagement brut"
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard
            title="Taux de participation"
            value={`${Math.round((project.metrics?.participationRate ?? 0) * 100)}%`}
            subtitle={`Base: ${project.participantsEstimated}`}
            icon={<Users className="h-4 w-4" />}
            trend="up"
          />
          <MetricCard
            title="IRC Score"
            value={project.metrics?.ircScore ?? 0}
            subtitle="Climat Client"
            icon={<TrendingUp className="h-4 w-4" />}
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
          {/* Analysis Column (Themes & Duration) */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Duration Chart */}
              <div className="space-y-8">
                <div className="px-4">
                  <h3 className="label-uppercase mb-1.5">Chronologie</h3>
                  <p className="text-xl font-black text-foreground tracking-tight">Durée des verbatims</p>
                </div>
                <div className="h-[200px] w-full mt-4 pr-4">
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
                          tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 10, fontWeight: '800' }}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          radius={[6, 6, 6, 6]}
                          barSize={32}
                          className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        />
                        <RechartsTooltip
                          cursor={{ fill: 'rgba(0,0,0,0.015)' }}
                          contentStyle={{ 
                            borderRadius: '1.5rem', 
                            border: 'none', 
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'none', 
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '12px 16px'
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-muted-foreground italic uppercase tracking-widest opacity-40">Aucune donnée</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Theme Distribution */}
              <div className="space-y-8">
                <div className="px-4">
                  <h3 className="label-uppercase mb-1.5">Analyse</h3>
                  <p className="text-xl font-black text-foreground tracking-tight">Répartition thématique</p>
                </div>
                <div className="space-y-7 px-4">
                  {themes.length > 0 ? (
                    themes.map((theme) => {
                      const percentage = totalThemeCount > 0 ? Math.round((theme.count / totalThemeCount) * 100) : 0;
                      return (
                        <div key={theme.id} className="space-y-2.5 group cursor-default">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-foreground/70 uppercase tracking-widest group-hover:text-primary transition-colors">
                                {theme.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-black text-primary/80">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-black/[0.04] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.05)]"
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
                    <p className="text-xs text-muted-foreground italic">Aucune donnée disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Engagement Card */}
          <div className="lg:col-span-4 space-y-8">
            <div className="px-4">
              <h3 className="label-uppercase mb-1">Taux de participation</h3>
              <p className="text-xl font-black text-foreground tracking-tight">Taux de participation</p>
            </div>
            <div className="adl-card p-8 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="relative w-full flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-10px] z-10">
                  <span className="text-5xl font-black tracking-tighter text-foreground">
                    {Math.round((project.metrics?.participationRate ?? 0) * 100)}%
                  </span>
                  <span className="label-uppercase mt-1">Réalisé</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={85}
                      outerRadius={105}
                      paddingAngle={0}
                      dataKey="value"
                      strokeWidth={0}
                      startAngle={90}
                      endAngle={450}
                    >
                      {participationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={index === 0 ? 1 : 0.04}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-8 space-y-4 px-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                  <span>0%</span>
                  <span className="text-primary italic">Objectif 100%</span>
                </div>
                <Progress value={(project.metrics?.participationRate ?? 0) * 100} className="h-1.5 bg-black/[0.04]" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Verbatims */}
        <div className="space-y-8 pt-12 border-t border-black/[0.04]">
          <div className="flex items-center justify-between px-4">
            <div className="space-y-1">
              <h3 className="label-uppercase">Derniers témoignages</h3>
              <p className="text-2xl font-black text-foreground tracking-tight">Matière brute</p>
            </div>
            <Button 
              variant="ghost" 
              size="premium"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all rounded-full px-7 h-10 border border-primary/10"
              onClick={() => navigate(`/projects/${projectId}/verbatims`)}
            >
              Voir la bibliothèque
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {messagesData?.data?.slice(0, 3).map((message) => (
              <AudioPlayer key={message.id} message={message} projectId={projectId!} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
