import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Network, Loader2, Zap, Target, BookOpen, Compass, Info, TrendingUp, BarChart3, Star, Layers } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/use-projects";
import { getTransversalAnalyses } from "@/lib/api/transversal";
import type { TransversalAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function TransversalPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId!);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["transversal", projectId],
    queryFn: () => getTransversalAnalyses(projectId!),
    enabled: !!projectId,
  });

  // Group by axis
  const grouped = analyses.reduce<Record<string, TransversalAnalysis[]>>((acc, a) => {
    if (!acc[a.axis]) acc[a.axis] = [];
    acc[a.axis].push(a);
    return acc;
  }, {});

  const axes = Object.keys(grouped);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('impact') || cat.includes('consequence')) return <Zap className="h-4 w-4" />;
    if (cat.includes('objectif') || cat.includes('strateg')) return <Target className="h-4 w-4" />;
    if (cat.includes('enjeu') || cat.includes('priorit')) return <TrendingUp className="h-4 w-4" />;
    if (cat.includes('verbatim') || cat.includes('quote')) return <BookOpen className="h-4 w-4" />;
    if (cat.includes('recommend') || cat.includes('conseil')) return <Star className="h-4 w-4" />;
    return <Compass className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">Analyse transversale en cours...</p>
      </div>
    );
  }

  return (
    <>
      <title>Analyse Transversal | Allo Corner Insight</title>
      <meta name="description" content="Analyse croisée des différents axes thématiques de l'étude." />

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24 px-4 md:px-2">
        <PageHeader
          title="Analyse transversal"
          description={project?.title}
          badge={`${analyses.length} analyse${analyses.length > 1 ? "s" : ""}`}
          icon={<Network className="h-5 w-5" />}
        />

        {axes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] border border-dashed border-black/[0.05] bg-black/[0.01]">
            <Layers className="h-10 w-10 text-muted-foreground/10 mb-4" />
            <p className="text-xs font-semibold text-muted-foreground/30 uppercase tracking-widest">
              Aucune analyse transversale disponible
            </p>
          </div>
        ) : (
          <div className={cn(
            "grid gap-12 items-start",
            axes.length === 1 ? "grid-cols-1 max-w-4xl mx-auto" : 
            axes.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {axes.map((axis, axisIdx) => (
              <section key={axis} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${axisIdx * 100}ms` }}>
                {/* Axis header - Refined label styling */}
                <div className="px-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase whitespace-nowrap">Axe {axisIdx + 1}</span>
                    <div className="h-px flex-1 bg-black/[0.04]" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground/90 line-clamp-2 min-h-[3.5rem]">
                    {axis}
                  </h2>
                </div>

                {/* Cards for this axis - Forced single column within the axis column */}
                <div className="grid grid-cols-1 gap-4">
                  {grouped[axis].map((a, idx) => (
                    <Card 
                      key={a.id}
                      className="group transition-all duration-500 relative flex flex-col h-full border-black/[0.02] bg-white overflow-hidden p-6 hover:shadow-lg"
                    >
                      {/* Decorative background element */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.02] blur-[30px] rounded-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-150" />
                      
                      <CardContent className="relative z-10 p-0 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                           <Badge
                            variant="outline"
                            className="bg-black/[0.03] border-none text-[9px] font-bold tracking-[0.1em] px-2.5 py-1 rounded-lg text-primary/80"
                          >
                            <span className="mr-2 opacity-60">{getCategoryIcon(a.category)}</span>
                            {a.category.toUpperCase()}
                          </Badge>
                          <div className="text-[10px] font-mono font-bold text-black/10">
                            #{String(idx + 1).padStart(2, '0')}
                          </div>
                        </div>

                        {a.content && (
                          <div className="space-y-4">
                            <p className="font-medium leading-relaxed text-muted-foreground/90 font-body transition-colors group-hover:text-foreground text-[13px]">
                              {a.content}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
