import { useParams } from"react-router-dom";
import { MetricCard } from"@/components/MetricCard";
import { Card, CardContent } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import { useProject } from"@/hooks/use-projects";
import { useMessages } from"@/hooks/use-messages";
import { useThemes } from"@/hooks/use-themes";
import { useMessagesStats } from"@/hooks/use-messages-stats";
import { useObjectives } from"@/hooks/use-objectives";
import { useFeaturedVerbatims } from"@/hooks/use-featured-verbatims";
import { useAuth } from"@/lib/auth-context";
import { useAudio } from"@/lib/audio-context";
import { cn } from"@/lib/utils";
import { speakerProfileLabel, speakerProfileColor, toneLabel, toneColor } from"@/lib/verbatim-utils";
import { PageHeader } from"@/components/PageHeader";
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
 Play,
 Pause,
} from"lucide-react";
import { 
 BarChart, 
 Bar, 
 XAxis, 
 Tooltip as RechartsTooltip, 
 PieChart, 
 Pie, 
 Cell, 
 ResponsiveContainer 
} from"recharts";
import { Progress } from"@/components/ui/progress";
import { useNavigate } from"react-router-dom";

export default function Dashboard() {
 const { projectId } = useParams<{ projectId: string }>();
 const navigate = useNavigate();
 const { user } = useAuth();
 const { data: project, isLoading: projectLoading } = useProject(projectId ||"");
 const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId ||"");
 const { data: themesData, isLoading: themesLoading } = useThemes(projectId ||"");
 const { data: statsData, isLoading: statsLoading } = useMessagesStats(projectId ||"");
 const { data: objectivesData, isLoading: objectivesLoading } = useObjectives(projectId ||"");
 const { data: featuredVerbatims = [] } = useFeaturedVerbatims(projectId ||"");
 const { currentMessage, isPlaying, playMessage, audioLoading } = useAudio();

 const COER_META: Record<string, { label: string; description: string }> = {
  CONTRASTE:     { label:"Contraste",        description:"Opposition ou paradoxe révélateur" },
  ORIGINALITE:   { label:"Originalité",      description:"Angle inattendu ou usage détourné" },
  EMOTION:       { label:"Émotion",          description:"Charge émotionnelle forte ou intime" },
  REPRESENTATIVITE:{ label:"Représentativité", description:"Témoignage archétypal de la cible" },
  TOTEM:         { label:"Totem",            description:"Verbatim emblématique du projet" },
 };

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
 { name:"Taux de participation", value: (project.metrics?.participationRate ?? 0) * 100, color:"hsl(var(--primary))" },
 { name:"Potentiel restant", value: (1 - (project.metrics?.participationRate ?? 0)) * 100, color:"hsl(var(--muted))" }
 ];

 const durationDistribution = statsData?.durationDistribution || [];

 return (
 <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-10">
 <PageHeader 
 title="Tableau de Bord"
 description={project.title}
 badge={project.dates}
 icon={<LayoutDashboard className="h-5 w-5" />}
 />

 {/* Welcome Card */}
 <Card className="p-6 md:p-6 relative overflow-hidden group mb-4 flex flex-col items-start text-left mt-2">
 {/* Background Audio Wave (Dynamic) */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
 <div className="absolute inset-x-0 bottom-0 flex items-end justify-around h-[120%] px-2 gap-1 md:gap-2">
 {[...Array(40)].map((_, i) => (
 <div
 key={i}
 className="w-full bg-primary rounded-t-full transition-all duration-300 animate-waveform"
 style={{
 height:`${Math.random() * 60 + 20}%`,
 animationDelay:`${i * 0.05}s`,
 animationDuration:`${0.8 + Math.random() * 0.5}s`,
 opacity: 0.2 + (i / 40) * 0.4
 }}
 />
 ))}
 </div>
 </div>

 <div className="relative z-10 flex flex-col space-y-4 max-w-2xl px-2">
 <p className="text-primary font-semibold tracking-[0.3em] text-[10px]">Espace d'analyse</p>
 <h2 className="text-3xl md:text-4xl font-semibold text-card-foreground tracking-tighter">
 Bonjour, {user?.name ? user.name.split(' ')[0] : 'Analyste'}
 </h2>
 <p className="text-muted-foreground font-medium text-balance text-base leading-snug mt-2 font-body">
 L'analyse concernant <span className="text-foreground font-medium">{project.title}</span> est prête. Explorez les indicateurs clés et plongez au cœur des retours pour identifier les signaux majeurs.
 </p>

 {project.wrappedPublished && (
 <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 pt-4">
 <Button
 variant="default"
 size="lg"
 className="font-semibold transition-all px-8 text-sm shadow-xl shadow-primary/20 rounded-xl"
 onClick={() => navigate(`/projects/${projectId}/wrapped`)}
 >
 Lancer le Wrapped
 </Button>
 <p className="text-muted-foreground text-sm font-medium italic pr-8 sm:pr-0">
 Revivez les moments clés de votre projet.
 </p>
 </div>
 )}
 </div>
 </Card>

 <div className="space-y-8">
 {/* Context & Objectives Section */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2 pb-4">
 <div className="lg:col-span-12">
 
 </div>
 
 <div className="lg:col-span-8 flex flex-col">
 {/* COER header */}
 <div className="px-4 mb-4">
  <p className="text-lg font-semibold text-foreground tracking-tight">Verbatims marquants</p>
 </div>

 {featuredVerbatims.length > 0 ? (
  featuredVerbatims.map((v) => {
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
     {/* Play button */}
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

     {/* Info */}
     <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2">
       <h4 className={cn(
        "text-[13px] font-semibold tracking-tight",
        isCurrent ? "text-primary" : "text-foreground/90"
       )}>
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
         <div className={cn("ml-1.5 w-1 h-1 rounded-full",
          msg.tone === 'POSITIVE' ? "bg-green-600" :
          msg.tone === 'NEGATIVE' ? "bg-red-600" : "bg-muted-foreground/40"
         )} />
        </Badge>
       </div>
      )}
      <p className="text-[11px] text-muted-foreground/50 italic font-serif leading-relaxed line-clamp-1 mt-1">
       "{v.citation}"
      </p>
     </div>
    </div>
   );
  })
 ) : (
  <p className="text-xs italic text-muted-foreground/30 px-3">Aucun verbatim marquant défini.</p>
 )}
 </div>

 <div className="lg:col-span-4 flex flex-col">
  <div className="px-4 mb-4">
   <p className="text-lg font-semibold text-foreground tracking-tight">Objectifs stratégiques</p>
  </div>
 <div className="px-2 flex-1">
 
 <ul className="space-y-6">
 {(objectivesData || []).map((obj, i) => (
 <li key={i} className="flex gap-4 group">
 <div className="h-5 w-5 rounded-full border border-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/40 transition-colors duration-500">
 <CheckCircle2 className="h-3 w-3 text-primary/20 group-hover:text-primary transition-colors duration-500" />
 </div>
 <span className="text-sm font-semibold leading-relaxed text-foreground/80 group-hover:text-foreground/80 transition-colors duration-500">
 {obj.content}
 </span>
 </li>
 ))}
 </ul>
 </div>
 
 <div className="p-6 rounded-2xl bg-primary/[0.02] border border-primary/5 flex items-start gap-4 hover:bg-primary/[0.04] transition-colors duration-500 mt-auto">
 <Lightbulb className="h-4 w-4 text-primary/95 shrink-0 mt-0.5" />
 <div className="space-y-1">
 
 <p className="text-[11px] font-semibold text-primary/90 leading-relaxed">
 Analyse basée sur {project.metrics?.messagesCount ?? 0} témoignages audio.
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Primary Metrics Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 px-2">
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

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
 {/* Analysis Column (Themes & Duration) */}
 <div className="lg:col-span-8 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Duration Chart */}
 <div className="space-y-8">
 <div className="px-4">
 
 <p className="text-lg font-semibold text-foreground tracking-tight">Durée des verbatims</p>
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
 <p className="text-xs text-muted-foreground italic opacity-70">Aucune donnée</p>
 </div>
 )}
 </div>
 </div>

 {/* Theme Distribution */}
 <div className="space-y-8">
 <div className="px-4">
 
 <p className="text-lg font-semibold text-foreground tracking-tight">Répartition thématique</p>
 </div>
 <div className="space-y-7 px-4">
 {themes.length > 0 ? (
 themes.map((theme) => {
 const percentage = totalThemeCount > 0 ? Math.round((theme.count / totalThemeCount) * 100) : 0;
 return (
 <div key={theme.id} className="space-y-2.5 group cursor-default">
 <div className="flex items-center justify-between">
 <div className="flex flex-col">
 <span className="text-[11px] font-semibold text-foreground/70 group-hover:text-primary transition-colors">
 {theme.name}
 </span>
 </div>
 <span className="text-[11px] font-semibold text-primary/80">
 {percentage}%
 </span>
 </div>
 <div className="w-full bg-black/[0.04] rounded-full h-1.5 overflow-hidden">
 <div
 className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.05)]"
 style={{
 backgroundColor: theme.color ||"hsl(var(--primary))",
 width:`${percentage}%`
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
 
 <p className="text-lg font-semibold text-foreground tracking-tight">Taux de participation</p>
 </div>
 <Card className="p-6 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
 <div className="relative w-full flex items-center justify-center">
 <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-10px] z-10">
 <span className="text-4xl font-semibold tracking-tighter text-foreground">
 {Math.round((project.metrics?.participationRate ?? 0) * 100)}%
 </span>
 <span className="text-xs font-semibold text-muted-foreground mt-1">Réalisé</span>
 </div>
 <ResponsiveContainer width="100%" height={180}>
 <PieChart>
 <Pie
 data={participationData}
 cx="50%"
 cy="50%"
 innerRadius={65}
 outerRadius={80}
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
 <div className="w-full mt-4 space-y-4 px-2">
 <div className="flex items-center justify-between text-[10px] font-semibold opacity-70">
 <span>0%</span>
 <span className="text-primary italic">Objectif 100%</span>
 </div>
 <Progress value={(project.metrics?.participationRate ?? 0) * 100} className="h-1.5 bg-black/[0.04]" />
 </div>
 </Card>
 </div>
 </div>

 </div>
 </div>
 );
}
