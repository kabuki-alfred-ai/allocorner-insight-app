import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecommendations } from "@/hooks/use-recommendations";
import { useParams } from "react-router-dom";
import { Target, Loader2, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RecommandationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: recsData, isLoading } = useRecommendations(projectId!);

  const priorityOrder: Record<string, number> = {
    'HAUTE': 0,
    'MOYENNE': 1,
    'BASSE': 2,
  };

  const recommendations = [...(recsData || [])].sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'HAUTE': return 'text-chart-negative border-chart-negative bg-chart-negative/5 shadow-[0_0_15px_rgba(255,0,0,0.1)]';
      case 'MOYENNE': return 'text-chart-neutral border-chart-neutral bg-chart-neutral/5';
      case 'BASSE': return 'text-chart-positive border-chart-positive bg-chart-positive/5';
      default: return 'text-muted-foreground border-muted';
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

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
        <PageHeader 
          title="Recommandations"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="group relative overflow-hidden border-black/[0.03] shadow-sm hover:shadow-card transition-all duration-500 rounded-[2rem] bg-card/50 backdrop-blur-sm">
                <div className={`absolute top-0 left-0 w-full h-1.5 opacity-40 ${
                  rec.priority === 'HAUTE' ? 'bg-chart-negative' : 
                  rec.priority === 'MOYENNE' ? 'bg-chart-neutral' : 
                  'bg-chart-positive'
                }`} />
                
                <CardHeader className="pt-10 pb-4 px-8">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-xl font-extrabold tracking-tight leading-[1.3] text-foreground/90 group-hover:text-primary transition-colors duration-300">
                      {rec.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex-shrink-0 text-[9px] px-3 py-1 font-black uppercase tracking-widest rounded-lg border-none", 
                        getPriorityColor(rec.priority)
                      )}
                    >
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-10 px-8">
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground/80 italic border-l-2 border-primary/10 pl-6 py-1">
                    "{rec.objective}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
