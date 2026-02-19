import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTrends } from "@/hooks/use-trends";
import { useThemes } from "@/hooks/use-themes";
import { useProject } from "@/hooks/use-projects";
import { useParams } from "react-router-dom";
import { TrendingUp, AlertTriangle, Zap, Eye, Target, Loader2, LineChart } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function TendancesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId!);
  const { data: trendsData, isLoading: trendsLoading } = useTrends(projectId!);
  const { data: themesData, isLoading: themesLoading } = useThemes(projectId!);

  const recurringWords = trendsData?.recurringWords || [];
  const mainTrends = trendsData?.mainTrends || [];
  const strengths = trendsData?.strengths || [];
  const weakSignal = trendsData?.weakSignal || '';
  const weakSignalDetail = trendsData?.weakSignalDetail || '';

  const wordFrequencyData = recurringWords.map((word, index) => ({
    word: typeof word === 'string' ? word : String(word),
    frequency: Math.round((100 - index * 12) / 10) * 10,
    color: themesData?.[index % (themesData.length || 1)]?.color || "#8B5CF6"
  }));

  if (trendsLoading || themesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <title>Synthèse & Tendances | Allo Corner Insight</title>
      <meta name="description" content="Analyse des grandes tendances émergentes et signaux faibles." />
      <link rel="canonical" href="/tendances" />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AnalysisNewsArticle",
          "headline": "Synthèse & Tendances",
          "description": "Identification des tendances principales et signaux émergents",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "datePublished": new Date().toISOString().split('T')[0],
          "keywords": Array.isArray(recurringWords) ? recurringWords.join(", ") : ""
        })}
      </script>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PageHeader 
        title="Synthèse & Tendances"
        description={project?.title}
        icon={<LineChart className="h-5 w-5" />}
      />

      <div className="space-y-12">

        {/* Tendances principales */}
        <div className="space-y-4">
          <div className="px-2">
            <h3 className="label-uppercase">Tendances principales</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mainTrends.slice(0, 3).map((trend, index) => {
              const trendTitle = typeof trend === 'string' ? trend : trend.title;
              const trendContent = typeof trend === 'string' ? '' : trend.content;
              return (
                <Card key={index} className="premium-card p-8 hover:scale-[1.02] transition-all duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="label-uppercase !text-primary/60">Axe {index + 1}</span>
                      <TrendingUp className="h-3.5 w-3.5 text-primary/40" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black font-heading tracking-tight text-foreground">{trendTitle}</h4>
                      {trendContent && (
                        <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                          {trendContent}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                        <span>Intensité</span>
                        <span>{85 - index * 15}%</span>
                      </div>
                      <div className="w-full bg-black/[0.03] rounded-full h-1">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${85 - index * 15}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Points forts */}
          <div className="space-y-6">
            <div className="px-2">
              <h3 className="label-uppercase">Points forts</h3>
            </div>
            <div className="space-y-4 px-2">
              {strengths.map((strength, index) => {
                const strengthTitle = typeof strength === 'string' ? strength : strength.title;
                const strengthContent = typeof strength === 'string' ? '' : strength.content;
                return (
                  <div key={index} className="space-y-1 group">
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0 group-hover:bg-primary transition-colors" />
                      <span className="text-sm font-semibold text-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">
                        {strengthTitle}
                      </span>
                    </div>
                    {strengthContent && (
                      <p className="pl-[22px] text-xs text-muted-foreground/70 leading-relaxed group-hover:text-muted-foreground transition-colors">
                        {strengthContent}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mx-2 p-6 rounded-2xl bg-black/[0.01] border border-black/[0.03] shadow-sm">
               <p className="text-xs font-medium text-muted-foreground/70 leading-relaxed italic">
                La campagne révèle une richesse d'expression remarquable, reflétant un engagement citoyen profond.
              </p>
            </div>
          </div>

          {/* Signal faible */}
          <div className="space-y-6">
            <div className="px-2">
              <h3 className="label-uppercase">Signal faible</h3>
            </div>
            <Card className="premium-card bg-black text-white p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Détection d'éveil</span>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xl font-black font-heading tracking-tight">{weakSignal}</h4>
                  <p className="text-xs font-medium leading-relaxed text-white/70">
                    {weakSignalDetail || "Une préoccupation émergente concernant la distance avec les centres de décision."}
                  </p>
                </div>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">Implications</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[8px] font-black bg-white/5 border-white/10 text-white rounded-lg px-2">LOCALITÉ</Badge>
                    <Badge variant="outline" className="text-[8px] font-black bg-white/5 border-white/10 text-white rounded-lg px-2">PROXIMITÉ</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Analyse Sémantique */}
        <div className="space-y-6 pt-12 border-t border-black/5">
          <div className="px-2">
            <h3 className="label-uppercase">Analyse Sémantique</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 px-2">
              {wordFrequencyData.slice(0, 5).map((item, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground/80 uppercase tracking-widest group-hover:text-foreground transition-colors">
                      {item.word}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground/50">{item.frequency}%</span>
                  </div>
                  <div className="w-full bg-black/[0.03] rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        backgroundColor: item.color,
                        width: `${item.frequency}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 rounded-[2.5rem] bg-black/[0.01] border border-black/[0.03] flex flex-col justify-center items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-black/[0.03]">
                <LineChart className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-foreground/60 italic px-4">
                "Le champ lexical révèle une préoccupation majeure pour l'identité territoriale et la transmission."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
