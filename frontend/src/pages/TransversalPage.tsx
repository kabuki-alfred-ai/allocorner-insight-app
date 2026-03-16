import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Network, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/hooks/use-projects";
import { getTransversalAnalyses } from "@/lib/api/transversal";
import type { TransversalAnalysis } from "@/lib/types";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4 md:px-0">
      <PageHeader
        title="Analyses Transversales"
        description={project?.title}
        badge={`${analyses.length} analyse${analyses.length > 1 ? "s" : ""}`}
        icon={<Network className="h-5 w-5" />}
      />

      {axes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-border/50 bg-muted/10">
          <Network className="h-8 w-8 text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground/50">
            Aucune analyse disponible
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {axes.map((axis) => (
            <section key={axis}>
              {/* Axis header */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                  {axis}
                </h2>
              </div>

              {/* Cards for this axis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grouped[axis].map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl border border-black/[0.04] bg-card/60 hover:border-primary/15 transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold border-none bg-primary/8 text-primary rounded-lg px-2.5 py-0.5"
                      >
                        {a.category}
                      </Badge>
                    </div>
                    {a.content && (
                      <p className="text-sm font-medium text-muted-foreground/75 leading-relaxed">
                        {a.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
