import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useProject } from "@/hooks/use-projects";
import { useParams } from "react-router-dom";
import { Target, Loader2, ListChecks, ArrowRight, Zap, Clock3, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RecommandationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId!);
  const { data: recsData, isLoading } = useRecommendations(projectId!);

  const priorityOrder: Record<string, number> = {
    'HAUTE': 0,
    'MOYENNE': 1,
    'BASSE': 2,
  };

  const recommendations = [...(recsData || [])].sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const stats = {
    total: recommendations.length,
    high: recommendations.filter(r => r.priority === 'HAUTE').length,
    medium: recommendations.filter(r => r.priority === 'MOYENNE').length,
    low: recommendations.filter(r => r.priority === 'BASSE').length,
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'HAUTE': return 'text-chart-negative bg-chart-negative/5';
      case 'MOYENNE': return 'text-chart-neutral bg-chart-neutral/5';
      case 'BASSE': return 'text-chart-positive bg-chart-positive/5';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'HAUTE': return <AlertCircle className="h-4 w-4" />;
      case 'MOYENNE': return <Clock3 className="h-4 w-4" />;
      case 'BASSE': return <CheckCircle2 className="h-4 w-4" />;
      default: return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'HAUTE': return 'Haute';
      case 'MOYENNE': return 'Moyenne';
      case 'BASSE': return 'Basse';
      default: return 'Non défini';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Analyse stratégique en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Recommandations stratégiques | Allo Corner Insight</title>
      <meta name="description" content="Recommandations actionables basées sur l'analyse des témoignages." />
      <link rel="canonical" href="/recommandations" />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ActionPlan",
          "name": "Recommandations stratégiques",
          "description": "Plan d'actions basé sur l'analyse des témoignages",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "dateCreated": new Date().toISOString().split('T')[0],
          "actionOption": recommendations.map(rec => ({
            "@type": "Action",
            "name": rec.title,
            "description": rec.objective
          }))
        })}
      </script>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
        <PageHeader 
          title="Recommandations"
          description={project?.title}
          icon={<ListChecks className="h-5 w-5" />}
        />

        {/* Strategy Intro Card */}
        <div className="verbatim-card-dark p-8 md:p-12 relative overflow-hidden group mb-12 shadow-2xl flex flex-col items-start text-left mt-2 mx-2">
          {/* Background Decor */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] opacity-30 mix-blend-screen transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[120px] opacity-20 mix-blend-screen transition-transform duration-1000 group-hover:scale-110" />
          </div>

          <div className="relative z-10 flex flex-col space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                <Target className="h-4 w-4 text-white/80" />
              </div>
              <p className="text-primary/80 font-black tracking-[0.3em] uppercase text-[10px]">Vision Actionnable</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
              Recommandations Stratégiques
            </h2>
            <p className="text-white/70 font-medium text-balance text-lg md:text-xl leading-relaxed font-body">
              Sur la base de l'analyse des signaux remontés par les collaborateurs, voici le plan d'action hiérarchisé pour adresser les enjeux prioritaires et maximiser l'impact.
            </p>
          </div>
        </div>

        <div className="space-y-16">
          <div className="px-4">
            <h3 className="label-uppercase mb-1.5">Aperçu</h3>
            <p className="text-xl font-black text-foreground tracking-tight">Répartition par priorité</p>
          </div>

          {/* Priority Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
            <div className="adl-card p-6 flex flex-col justify-between gap-6 min-h-[140px] group cursor-default bg-white">
              <div className="flex items-center justify-between">
                <span className="label-uppercase !text-muted-foreground/40">Total Leviers</span>
                <div className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center">
                  <ListChecks className="h-3.5 w-3.5 text-foreground/40" />
                </div>
              </div>
              <div>
                <span className="text-5xl font-black text-foreground tracking-tighter group-hover:scale-110 transition-transform origin-left inline-block">{stats.total}</span>
              </div>
            </div>
            
            <div className="adl-card p-6 flex flex-col justify-between gap-6 min-h-[140px] group cursor-default relative overflow-hidden bg-white">
              <div className="absolute inset-0 bg-chart-negative/5 group-hover:bg-chart-negative/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <span className="label-uppercase !text-chart-negative/60">Haute Priorité</span>
                <div className="w-8 h-8 rounded-full bg-chart-negative/10 flex items-center justify-center text-chart-negative">
                  <AlertCircle className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-5xl font-black text-chart-negative tracking-tighter group-hover:scale-110 transition-transform origin-left inline-block">{stats.high}</span>
              </div>
            </div>

            <div className="adl-card p-6 flex flex-col justify-between gap-6 min-h-[140px] group cursor-default relative overflow-hidden bg-white">
              <div className="absolute inset-0 bg-chart-neutral/5 group-hover:bg-chart-neutral/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <span className="label-uppercase !text-chart-neutral/70">Moyenne</span>
                <div className="w-8 h-8 rounded-full bg-chart-neutral/10 flex items-center justify-center text-chart-neutral">
                  <Clock3 className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-5xl font-black text-chart-neutral tracking-tighter group-hover:scale-110 transition-transform origin-left inline-block">{stats.medium}</span>
              </div>
            </div>

            <div className="adl-card p-6 flex flex-col justify-between gap-6 min-h-[140px] group cursor-default relative overflow-hidden bg-white">
              <div className="absolute inset-0 bg-chart-positive/5 group-hover:bg-chart-positive/10 transition-colors" />
              <div className="flex items-center justify-between relative z-10">
                <span className="label-uppercase !text-chart-positive/60">Basse / Quick-win</span>
                <div className="w-8 h-8 rounded-full bg-chart-positive/10 flex items-center justify-center text-chart-positive">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-5xl font-black text-chart-positive tracking-tighter group-hover:scale-110 transition-transform origin-left inline-block">{stats.low}</span>
              </div>
            </div>
          </div>

          <div className="px-4 pt-6">
            <h3 className="label-uppercase mb-1.5">Roadmap</h3>
            <p className="text-xl font-black text-foreground tracking-tight">Détail des actions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
            {recommendations.map((rec, idx) => (
              <div key={rec.id} className="adl-card p-8 group transition-all duration-500 relative flex flex-col h-full hover:-translate-y-1 hover:shadow-xl border border-black/[0.02] bg-white">
                <div className={cn(
                  "absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full opacity-10 -mr-20 -mt-20 transition-all duration-700 group-hover:opacity-20",
                  rec.priority === 'HAUTE' ? 'bg-chart-negative' : rec.priority === 'MOYENNE' ? 'bg-chart-neutral' : 'bg-chart-positive'
                )} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit text-[9px] px-3.5 py-1.5 font-black uppercase tracking-[0.2em] rounded-full border-none shadow-sm", 
                        getPriorityColor(rec.priority)
                      )}
                    >
                      <span className="mr-1.5">{getPriorityIcon(rec.priority)}</span>
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                    <div className="w-10 h-10 rounded-full bg-black/[0.02] border border-black/[0.04] flex items-center justify-center text-[11px] font-black text-foreground/30 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="space-y-5 flex-1">
                    <h4 className="text-2xl font-black tracking-tight leading-[1.1] text-foreground/90 transition-colors duration-500 group-hover:text-primary pr-4">
                      {rec.title}
                    </h4>
                    <div className="h-px w-12 bg-black/[0.06] group-hover:w-24 group-hover:bg-primary/20 transition-all duration-500" />
                    <p className="text-[15px] font-medium leading-[1.6] text-muted-foreground/80 font-body text-balance">
                      {rec.objective}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
