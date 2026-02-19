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

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      <PageHeader 
        title="Synthèse & Tendances"
        description={project?.title}
        icon={<LineChart className="h-5 w-5" />}
      />

      <div className="space-y-20">
        {/* Tendances principales */}
        <div className="space-y-8">
          <div className="px-4">
            <h3 className="label-uppercase mb-1.5">Grandes Orientations</h3>
            <p className="text-2xl font-black text-foreground tracking-tighter">Tendances principales</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
            {mainTrends.slice(0, 3).map((trend, index) => {
              const trendTitle = typeof trend === 'string' ? trend : trend.title;
              const trendContent = typeof trend === 'string' ? '' : trend.content;
              return (
                <div key={index} className="adl-card p-10 group cursor-default">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="label-uppercase !text-primary/70">Axe {index + 1}</span>
                      <div className="p-2 bg-primary/[0.03] rounded-xl group-hover:bg-primary/5 transition-colors">
                        <TrendingUp className="h-4 w-4 text-primary/40" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xl font-black tracking-tight text-foreground leading-tight">{trendTitle}</h4>
                      {trendContent && (
                        <p className="text-[13px] font-medium text-muted-foreground/80 leading-relaxed font-body">
                          {trendContent}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between items-center label-uppercase opacity-60">
                        <span>Intensité</span>
                        <span className="text-primary font-black">{85 - index * 15}%</span>
                      </div>
                      <div className="w-full bg-black/[0.04] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${85 - index * 15}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 px-2">
          {/* Points forts */}
          <div className="lg:col-span-7 space-y-10">
            <div className="px-2">
              <h3 className="label-uppercase mb-1.5">Diagnostic</h3>
              <p className="text-2xl font-black text-foreground tracking-tighter">Points forts</p>
            </div>
            <div className="space-y-6 px-2">
              {strengths.map((strength, index) => {
                const strengthTitle = typeof strength === 'string' ? strength : strength.title;
                const strengthContent = typeof strength === 'string' ? '' : strength.content;
                return (
                  <div key={index} className="space-y-1.5 group">
                    <div className="flex gap-5">
                      <div className="w-2 h-2 rounded-full bg-primary/30 mt-2 shrink-0 group-hover:scale-125 group-hover:bg-primary transition-all duration-500" />
                      <span className="text-base font-bold text-foreground/80 tracking-tight leading-snug group-hover:text-foreground transition-colors">
                        {strengthTitle}
                      </span>
                    </div>
                    {strengthContent && (
                      <p className="pl-[28px] text-[13px] font-medium text-muted-foreground/60 leading-relaxed group-hover:text-muted-foreground/80 transition-colors">
                        {strengthContent}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="adl-card-flat p-8 ml-2 bg-gradient-soft">
               <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic text-balance">
                "La campagne révèle une richesse d'expression remarquable, reflétant un engagement citoyen profond et une volonté de co-construire l'avenir du territoire."
              </p>
            </div>
          </div>

          {/* Signal faible */}
          <div className="lg:col-span-5 space-y-10">
            <div className="px-2">
              <h3 className="label-uppercase mb-1.5">Intelligence</h3>
              <p className="text-2xl font-black text-foreground tracking-tighter">Signal faible</p>
            </div>
            <div className="adl-card p-10 relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #0a0a0c 0%, #1a1a1f 100%)', color: 'white' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 blur-[60px] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000" />
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl group-hover:bg-white/15 transition-all duration-500">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <span className="label-uppercase !text-white/40 !tracking-[0.4em]">Détection d'éveil</span>
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black tracking-tight leading-tight">{weakSignal}</h4>
                  <p className="text-sm font-medium leading-relaxed text-white/60">
                    {weakSignalDetail || "Une préoccupation émergente concernant la distance avec les centres de décision."}
                  </p>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <p className="label-uppercase !text-primary !mb-4">Implications stratégiques</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px] font-black bg-white/5 border-white/10 text-white rounded-xl px-4 py-1 uppercase tracking-widest">LOCALITÉ</Badge>
                    <Badge variant="outline" className="text-[10px] font-black bg-white/5 border-white/10 text-white rounded-xl px-4 py-1 uppercase tracking-widest">PROXIMITÉ</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyse Sémantique */}
        <div className="space-y-10 pt-16 border-t border-black/[0.04] px-2">
          <div className="px-2">
            <h3 className="label-uppercase mb-1.5">Univers Lexical</h3>
            <p className="text-2xl font-black text-foreground tracking-tighter">Analyse Sémantique</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 px-4">
              {wordFrequencyData.slice(0, 5).map((item, index) => (
                <div key={index} className="space-y-3 group cursor-default">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground/60 uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">
                      {item.word}
                    </span>
                    <span className="text-[11px] font-black text-primary/80">{item.frequency}%</span>
                  </div>
                  <div className="w-full bg-black/[0.04] rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.02)]"
                      style={{
                        backgroundColor: item.color,
                        width: `${item.frequency}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="adl-card-flat p-12 flex flex-col justify-center items-center text-center space-y-6">
              <div className="p-4 bg-white rounded-[1.5rem] shadow-sm border border-black/[0.03]">
                <LineChart className="h-6 w-6 text-primary" />
              </div>
              <p className="text-base font-medium leading-relaxed text-foreground/70 italic px-6 text-balance">
                "Le champ lexical révèle une préoccupation majeure pour l'identité territoriale et la transmission intergénérationnelle."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
