import { Card } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { useStrategicActions } from"@/hooks/use-strategic-actions";
import { useProject } from"@/hooks/use-projects";
import { useParams } from"react-router-dom";
import { Loader2, ListChecks, Clock3, CheckCircle2, AlertCircle, Clock, Users } from"lucide-react";
import { PageHeader } from"@/components/PageHeader";
import { cn } from"@/lib/utils";

export default function RecommandationsPage() {
 const { projectId } = useParams<{ projectId: string }>();
 const { data: project } = useProject(projectId!);
 const { data: actionsData, isLoading } = useStrategicActions(projectId!);
 const actions = [...(actionsData || [])].sort((a, b) => a.position - b.position);

 if (isLoading) {
  return (
   <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
     <Loader2 className="h-10 w-10 animate-spin text-primary/90" />
     <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/70">Chargement...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-12">
   <PageHeader
    title="Actions stratégiques"
    description={project?.title}
    icon={<ListChecks className="h-5 w-5" />}
   />

   {actions.length === 0 ? (
    <div className="flex items-center justify-center min-h-[300px]">
     <p className="text-sm text-muted-foreground/50 italic">Aucune action stratégique définie.</p>
    </div>
   ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-2 mt-6">
     {actions.map((action, idx) => (
      <Card key={action.id} className="p-5 group transition-all duration-500 relative flex flex-col hover:-translate-y-1 hover:shadow-xl border border-black/[0.02] bg-white">
       <div className={cn(
        "absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full opacity-10 -mr-20 -mt-20 transition-all duration-700 group-hover:opacity-20",
        action.priority === 'HAUTE' ? 'bg-chart-negative' : action.priority === 'MOYENNE' ? 'bg-chart-neutral' : 'bg-chart-positive'
       )} />
       <div className="relative z-10 flex flex-col h-full gap-3">
        <div className="flex items-start justify-between">
         <Badge variant="outline" className={cn(
          "w-fit text-[9px] px-3.5 py-1.5 font-semibold tracking-[0.2em] rounded-full border-none shadow-sm",
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
   )}
  </div>
 );
}
