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

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <PageHeader 
          title="Recommandations"
          description={project?.title}
          icon={<ListChecks className="h-6 w-6" />}
        />

        <div className="space-y-12">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-xl font-black text-foreground tracking-tight">Plan d'actions prioritaires</p>
            </div>
            <div className="h-px flex-1 bg-black/[0.03] mx-8 hidden md:block" />
            <Badge variant="outline" className="border-primary/20 text-primary/60 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
              {recommendations.length} Actions
            </Badge>
          </div>

          {/* Priority Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 mb-8">
            <div className="premium-card p-6 flex flex-col justify-center gap-1 min-h-[100px]">
              <span className="label-uppercase !text-muted-foreground/40">Total</span>
              <span className="text-3xl font-black text-foreground">{stats.total}</span>
            </div>
            <div className="premium-card p-6 flex flex-col justify-center gap-1 min-h-[100px]">
              <span className="label-uppercase !text-chart-negative/60">Haute Priorité</span>
              <span className="text-3xl font-black text-chart-negative">{stats.high}</span>
            </div>
            <div className="premium-card p-6 flex flex-col justify-center gap-1 min-h-[100px]">
              <span className="label-uppercase !text-chart-neutral/60">Moyenne</span>
              <span className="text-3xl font-black text-chart-neutral">{stats.medium}</span>
            </div>
            <div className="premium-card p-6 flex flex-col justify-center gap-1 min-h-[100px]">
              <span className="label-uppercase !text-chart-positive/60">Faible</span>
              <span className="text-3xl font-black text-chart-positive">{stats.low}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="premium-card group transition-all duration-500 hover:scale-[1.01]">
                <CardHeader className="pt-8 pb-4 px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit text-[9px] px-2.5 py-0.5 font-black uppercase tracking-widest rounded-lg border-none flex items-center gap-1.5", 
                          getPriorityColor(rec.priority)
                        )}
                      >
                        {getPriorityIcon(rec.priority)}
                        {getPriorityLabel(rec.priority)}
                      </Badge>
                      <CardTitle className="text-2xl font-black tracking-tight leading-tight text-foreground transition-colors duration-300">
                        {rec.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-8 px-8">
                  <div className="space-y-4">
                    <div className="h-px w-12 bg-black/[0.05]" />
                    <p className="text-sm font-bold leading-relaxed text-muted-foreground/70 italic line-clamp-3">
                      "{rec.objective}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
