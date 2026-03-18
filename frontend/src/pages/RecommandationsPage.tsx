import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { useRecommendations } from"@/hooks/use-recommendations";
import { useStrategicActions } from"@/hooks/use-strategic-actions";
import { useProject } from"@/hooks/use-projects";
import { useParams } from"react-router-dom";
import { Target, Loader2, ListChecks, ArrowRight, Zap, Clock3, CheckCircle2, AlertCircle, Clock, Users } from"lucide-react";
import { PageHeader } from"@/components/PageHeader";
import type { Priority } from"@/lib/types";
import { cn } from"@/lib/utils";

export default function RecommandationsPage() {
 const { projectId } = useParams<{ projectId: string }>();
 const { data: project } = useProject(projectId!);
 const { data: recsData, isLoading } = useRecommendations(projectId!);
 const { data: actionsData } = useStrategicActions(projectId!);
 const actions = [...(actionsData || [])].sort((a, b) => a.position - b.position);

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
 <Loader2 className="h-10 w-10 animate-spin text-primary/90" />
 <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/70">Analyse stratégique en cours...</p>
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
 {JSON.stringify({"@context":"https://schema.org","@type":"ActionPlan","name":"Recommandations stratégiques","description":"Plan d'actions basé sur l'analyse des témoignages","author": {"@type":"Organization","name":"Allo Corner" },"dateCreated": new Date().toISOString().split('T')[0],"actionOption": recommendations.map(rec => ({"@type":"Action","name": rec.title,"description": rec.objective
 }))
 })}
 </script>

 <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-12">
 <PageHeader 
 title="Recommandations"
 description={project?.title}
 icon={<ListChecks className="h-5 w-5" />}
 />



 <div className="space-y-8">
 <div className="px-4">
 
 <p className="text-xl font-semibold text-foreground tracking-tight">Répartition par priorité</p>
 </div>

 {/* Priority Stats Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
 <Card className="p-4 flex flex-col justify-between gap-3 min-h-[100px] group cursor-default bg-white">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-muted-foreground !text-muted-foreground/70">Total Leviers</span>
 <div className="w-6 h-6 rounded-full bg-black/[0.03] flex items-center justify-center">
 <ListChecks className="h-3 w-3 text-foreground/70" />
 </div>
 </div>
 <div>
 <span className="text-3xl font-semibold text-foreground tracking-tight group-hover:scale-110 transition-transform origin-left inline-block">{stats.total}</span>
 </div>
 </Card>
 
 <Card className="p-4 flex flex-col justify-between gap-3 min-h-[100px] group cursor-default relative overflow-hidden bg-white">
 <div className="absolute inset-0 bg-chart-negative/5 group-hover:bg-chart-negative/10 transition-colors" />
 <div className="flex items-center justify-between relative z-10">
 <span className="text-xs font-semibold text-muted-foreground !text-chart-negative/60">Haute Priorité</span>
 <div className="w-6 h-6 rounded-full bg-chart-negative/10 flex items-center justify-center text-chart-negative">
 <AlertCircle className="h-3 w-3" />
 </div>
 </div>
 <div className="relative z-10">
 <span className="text-3xl font-semibold text-chart-negative tracking-tight group-hover:scale-110 transition-transform origin-left inline-block">{stats.high}</span>
 </div>
 </Card>

 <Card className="p-4 flex flex-col justify-between gap-3 min-h-[100px] group cursor-default relative overflow-hidden bg-white">
 <div className="absolute inset-0 bg-chart-neutral/5 group-hover:bg-chart-neutral/10 transition-colors" />
 <div className="flex items-center justify-between relative z-10">
 <span className="text-xs font-semibold text-muted-foreground !text-chart-neutral/70">Moyenne</span>
 <div className="w-6 h-6 rounded-full bg-chart-neutral/10 flex items-center justify-center text-chart-neutral">
 <Clock3 className="h-3 w-3" />
 </div>
 </div>
 <div className="relative z-10">
 <span className="text-3xl font-semibold text-chart-neutral tracking-tight group-hover:scale-110 transition-transform origin-left inline-block">{stats.medium}</span>
 </div>
 </Card>

 <Card className="p-4 flex flex-col justify-between gap-3 min-h-[100px] group cursor-default relative overflow-hidden bg-white">
 <div className="absolute inset-0 bg-chart-positive/5 group-hover:bg-chart-positive/10 transition-colors" />
 <div className="flex items-center justify-between relative z-10">
 <span className="text-xs font-semibold text-muted-foreground !text-chart-positive/60">Basse / Quick-win</span>
 <div className="w-6 h-6 rounded-full bg-chart-positive/10 flex items-center justify-center text-chart-positive">
 <CheckCircle2 className="h-3 w-3" />
 </div>
 </div>
 <div className="relative z-10">
 <span className="text-3xl font-semibold text-chart-positive tracking-tight group-hover:scale-110 transition-transform origin-left inline-block">{stats.low}</span>
 </div>
 </Card>
 </div>

 <div className="px-4 pt-2">
 
 <p className="text-xl font-semibold text-foreground tracking-tight">Détail des actions</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-2">
 {recommendations.map((rec, idx) => (
 <Card key={rec.id} className="p-5 group transition-all duration-500 relative flex flex-col h-full hover:-translate-y-1 hover:shadow-xl border border-black/[0.02] bg-white">
 <div className={cn("absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full opacity-10 -mr-20 -mt-20 transition-all duration-700 group-hover:opacity-20",
 rec.priority === 'HAUTE' ? 'bg-chart-negative' : rec.priority === 'MOYENNE' ? 'bg-chart-neutral' : 'bg-chart-positive'
 )} />

 <div className="relative z-10 flex flex-col h-full">
 <div className="flex items-start justify-between mb-4">
 <Badge
 variant="outline"
 className={cn("w-fit text-[9px] px-3.5 py-1.5 font-semibold tracking-[0.2em] rounded-full border-none shadow-sm", 
 getPriorityColor(rec.priority)
 )}
 >
 <span className="mr-1.5">{getPriorityIcon(rec.priority)}</span>
 {getPriorityLabel(rec.priority)}
 </Badge>
 <div className="w-10 h-10 rounded-full bg-black/[0.02] border border-black/[0.04] flex items-center justify-center text-[11px] font-semibold text-foreground/85 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-colors">
 {String(idx + 1).padStart(2, '0')}
 </div>
 </div>

 <div className="space-y-3 flex-1">
 <h4 className="text-lg font-semibold tracking-tight leading-[1.1] text-foreground/90 transition-colors duration-500 group-hover:text-primary pr-4">
 {rec.title}
 </h4>
 <div className="h-px w-12 bg-black/[0.06] group-hover:w-24 group-hover:bg-primary/20 transition-all duration-500" />
 <p className="text-sm font-medium leading-relaxed text-muted-foreground/80 font-body text-balance">
 {rec.objective}
 </p>
 </div>
 </div>
 </Card>
 ))}
 </div>
    {/* Actions stratégiques */}
    {actions.length > 0 && (
     <div className="space-y-6 pt-10 border-t border-black/[0.04] px-2">
      <div className="px-2">
       <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Plan d'exécution</h3>
       <p className="text-xl font-semibold text-foreground tracking-tight">Actions stratégiques</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-2">
       {actions.map((action, idx) => (
        <Card key={action.id} className="p-5 group transition-all duration-500 relative flex flex-col hover:-translate-y-1 hover:shadow-xl border border-black/[0.02] bg-white">
         <div className={cn("absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full opacity-10 -mr-20 -mt-20 transition-all duration-700 group-hover:opacity-20",
          action.priority === 'HAUTE' ? 'bg-chart-negative' : action.priority === 'MOYENNE' ? 'bg-chart-neutral' : 'bg-chart-positive'
         )} />
         <div className="relative z-10 flex flex-col h-full gap-3">
          <div className="flex items-start justify-between">
           <Badge variant="outline" className={cn("w-fit text-[9px] px-3.5 py-1.5 font-semibold tracking-[0.2em] rounded-full border-none shadow-sm",
            action.priority === 'HAUTE' ? 'text-chart-negative bg-chart-negative/5' : action.priority === 'MOYENNE' ? 'text-chart-neutral bg-chart-neutral/5' : 'text-chart-positive bg-chart-positive/5'
           )}>
            {action.priority === 'HAUTE' ? <AlertCircle className="h-3 w-3 mr-1.5 inline" /> : action.priority === 'MOYENNE' ? <Clock3 className="h-3 w-3 mr-1.5 inline" /> : <CheckCircle2 className="h-3 w-3 mr-1.5 inline" />}
            {action.priority === 'HAUTE' ? 'Haute' : action.priority === 'MOYENNE' ? 'Moyenne' : 'Basse'}
           </Badge>
           <div className="w-10 h-10 rounded-full bg-black/[0.02] border border-black/[0.04] flex items-center justify-center text-[11px] font-semibold text-foreground/85">
            {String(idx + 1).padStart(2, '0')}
           </div>
          </div>
          <div className="space-y-2 flex-1">
           <h4 className="text-lg font-semibold tracking-tight leading-[1.1] text-foreground/90 group-hover:text-primary transition-colors duration-500 pr-4">{action.title}</h4>
           <div className="h-px w-12 bg-black/[0.06] group-hover:w-24 group-hover:bg-primary/20 transition-all duration-500" />
           {action.description && <p className="text-sm font-medium leading-relaxed text-muted-foreground/80 font-body">{action.description}</p>}
          </div>
          {(action.timeline || action.resources) && (
           <div className="flex items-center gap-4 pt-2 border-t border-black/[0.04]">
            {action.timeline && <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60"><Clock className="h-3 w-3" />{action.timeline}</span>}
            {action.resources && <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60"><Users className="h-3 w-3" />{action.resources}</span>}
           </div>
          )}
         </div>
        </Card>
       ))}
      </div>
     </div>
    )}
 </div>
 </div>
 </>
 );
}
