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
          <div className="space-y-20">
            {axes.map((axis, axisIdx) => (
              <section key={axis} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${axisIdx * 100}ms` }}>
                {/* Axis header - Refined label styling */}
                <div className="px-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase">Axe Transversal {axisIdx + 1}</span>
                    <div className="h-px flex-1 bg-black/[0.04]" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
                    {axis}
                  </h2>
                </div>

                {/* Cards for this axis */}
                <div className={cn(
                  "grid gap-6",
                  grouped[axis].length === 1 ? "grid-cols-1 lg:grid-cols-1" : 
                  grouped[axis].length === 2 ? "grid-cols-1 md:grid-cols-2" : 
                  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                  {grouped[axis].map((a, idx) => (
                    <Card 
                      key={a.id}
                      className={cn(
                        "group transition-all duration-500 relative flex flex-col h-full border-black/[0.02] bg-white overflow-hidden",
                        grouped[axis].length === 1 ? "p-8 md:p-10" : "p-6"
                      )}
                    >
                      {/* Decorative background element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] blur-[40px] rounded-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
                      
                      <CardContent className="relative z-10 p-0 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                           <Badge
                            variant="outline"
                            className="bg-black/[0.03] border-none text-[9px] font-bold tracking-[0.1em] px-3 py-1 rounded-lg text-primary/80"
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
                            <p className={cn(
                              "font-medium leading-relaxed text-muted-foreground/90 font-body transition-colors group-hover:text-foreground",
                              grouped[axis].length === 1 ? "text-lg italic font-serif" : "text-sm"
                            )}>
                              {a.content}
                            </p>
                          </div>
                        )}
                        
                        {/* Interactive footer line */}
                        <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <div className="h-1 w-8 bg-primary/40 rounded-full" />
                        </div>
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
