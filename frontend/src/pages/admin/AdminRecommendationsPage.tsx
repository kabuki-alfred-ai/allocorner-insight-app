import { useState } from"react";
import { useParams } from"react-router-dom";
import { Plus, Pencil, Trash2, Loader2, Zap, Clock, Users } from"lucide-react";
import { PageHeader } from"@/components/PageHeader";
import { cn } from"@/lib/utils";
import { toast } from"sonner";

import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Textarea } from"@/components/ui/textarea";
import { Badge } from"@/components/ui/badge";
import { Card, CardContent } from"@/components/ui/card";
import { Skeleton } from"@/components/ui/skeleton";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogDescription,
} from"@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";

import { useStrategicActions, useCreateStrategicAction, useUpdateStrategicAction, useDeleteStrategicAction } from"@/hooks/use-strategic-actions";
import type { Priority } from"@/lib/types";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
 { value:"HAUTE", label:"Haute" },
 { value:"MOYENNE", label:"Moyenne" },
 { value:"BASSE", label:"Basse" },
];

function priorityBadge(priority: Priority) {
 const map: Record<Priority, string> = {
  HAUTE:"text-chart-negative bg-chart-negative/5",
  MOYENNE:"text-chart-neutral bg-chart-neutral/5",
  BASSE:"text-chart-positive bg-chart-positive/5",
 };
 return (
  <Badge variant="outline" className={cn("text-[8px] font-semibold px-2 py-0.5 rounded-full border-none", map[priority])}>
   {priority}
  </Badge>
 );
}

const emptyActionForm = { title: "", description: "", priority: "MOYENNE" as Priority, timeline: "", resources: "", position: 0 };

export function AdminRecommendationsPage() {
 const { projectId } = useParams<{ projectId: string }>();

 const { data: actions = [], isLoading: actionsLoading } = useStrategicActions(projectId!);
 const [actionDialogOpen, setActionDialogOpen] = useState(false);
 const [editingAction, setEditingAction] = useState<any | null>(null);
 const [actionForm, setActionForm] = useState(emptyActionForm);

 const createActionMutation = useCreateStrategicAction(projectId!);
 const updateActionMutation = useUpdateStrategicAction(projectId!);
 const deleteActionMutation = useDeleteStrategicAction(projectId!);

 const sortedActions = [...actions].sort((a, b) => a.position - b.position);

 function openCreateAction() {
  setEditingAction(null);
  setActionForm({ ...emptyActionForm, position: actions.length });
  setActionDialogOpen(true);
 }

 function openEditAction(a: any) {
  setEditingAction(a);
  setActionForm({ title: a.title, description: a.description ?? "", priority: a.priority, timeline: a.timeline ?? "", resources: a.resources ?? "", position: a.position });
  setActionDialogOpen(true);
 }

 function closeActionDialog() {
  setActionDialogOpen(false);
  setEditingAction(null);
  setActionForm(emptyActionForm);
 }

 function handleActionSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!actionForm.title.trim()) { toast.error("Le titre est requis"); return; }
  if (editingAction) {
   updateActionMutation.mutate({ id: editingAction.id, data: actionForm }, {
    onSuccess: () => { toast.success("Action mise à jour"); closeActionDialog(); },
    onError: () => toast.error("Erreur lors de la mise à jour"),
   });
  } else {
   createActionMutation.mutate(actionForm, {
    onSuccess: () => { toast.success("Action créée"); closeActionDialog(); },
    onError: () => toast.error("Erreur lors de la création"),
   });
  }
 }

 const isActionMutating = createActionMutation.isPending || updateActionMutation.isPending;

 return (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
   <PageHeader
    title="Actions stratégiques"
    description="Plan d'exécution issu de l'analyse"
    icon={<Zap className="h-6 w-6" />}
    actions={
     <Button variant="default" size="default" onClick={openCreateAction} className="shadow-md shadow-primary/20 rounded-xl">
      <Plus className="mr-2 h-4 w-4" />
      Nouvelle action
     </Button>
    }
   />

   <div className="mt-8 space-y-4">
    {actionsLoading && (
     <div className="space-y-3">
      {[1, 2].map(i => (
       <Card key={i}><CardContent className="p-4"><Skeleton className="h-5 w-2/3 mb-2" /><Skeleton className="h-4 w-1/3" /></CardContent></Card>
      ))}
     </div>
    )}

    {!actionsLoading && sortedActions.length === 0 && (
     <div className="py-24 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-input bg-muted/5 text-center px-6">
      <div className="w-14 h-14 rounded-3xl bg-primary/5 flex items-center justify-center mb-5">
       <Zap className="h-7 w-7 text-primary/40" />
      </div>
      <h3 className="text-base font-semibold text-foreground/80 mb-2">Aucune action stratégique</h3>
      <p className="text-xs font-medium text-muted-foreground/60 max-w-[260px] leading-relaxed mb-6">
       Définissez les actions concrètes à mettre en œuvre.
      </p>
      <Button onClick={openCreateAction} size="default" className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
       <Plus className="mr-2 h-4 w-4" />Ajouter la première
      </Button>
     </div>
    )}

    {!actionsLoading && sortedActions.length > 0 && (
     <div className="grid grid-cols-1 gap-3">
      {sortedActions.map((action, index) => (
       <Card key={action.id} className="p-4 group relative overflow-hidden flex items-center justify-between gap-4">
        <div className={cn("absolute top-0 left-0 w-1 h-full opacity-60",
         action.priority === "HAUTE" ? "bg-chart-negative" : action.priority === "MOYENNE" ? "bg-chart-neutral" : "bg-chart-positive"
        )} />
        <div className="flex items-center gap-4 flex-1 min-w-0">
         <div className="w-8 h-8 rounded-xl bg-black/[0.03] flex items-center justify-center text-foreground font-semibold text-xs shrink-0 group-hover:bg-primary/10 transition-colors">
          {index + 1}
         </div>
         <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
           <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">{action.title}</h3>
           {priorityBadge(action.priority)}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
           {action.timeline && <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60"><Clock className="h-2.5 w-2.5" />{action.timeline}</span>}
           {action.resources && <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/60"><Users className="h-2.5 w-2.5" />{action.resources}</span>}
          </div>
          {action.description && (
           <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed truncate max-w-2xl mt-0.5 italic">{action.description}</p>
          )}
         </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-foreground/40 hover:text-foreground hover:bg-black/[0.04]" onClick={() => openEditAction(action)}>
          <Pencil className="h-3.5 w-3.5" />
         </Button>
         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive/40 hover:text-destructive hover:bg-destructive/5"
          onClick={() => deleteActionMutation.mutate(action.id, { onSuccess: () => toast.success("Action supprimée"), onError: () => toast.error("Erreur") })}
          disabled={deleteActionMutation.isPending}>
          <Trash2 className="h-3.5 w-3.5" />
         </Button>
        </div>
       </Card>
      ))}
     </div>
    )}

    <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
     <DialogContent className="sm:max-w-xl border-none bg-card/95 backdrop-blur-xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
      <div className="p-10">
       <DialogHeader className="mb-8">
        <DialogTitle className="text-2xl font-semibold font-heading">
         {editingAction ? "Modifier l'action" : "Nouvelle action stratégique"}
        </DialogTitle>
        <DialogDescription className="text-xs font-medium text-primary mt-1">
         {editingAction ? "Ajustez les détails de cette action." : "Définissez une nouvelle action à mettre en œuvre."}
        </DialogDescription>
       </DialogHeader>
       <form onSubmit={handleActionSubmit} className="space-y-5">
        <div className="space-y-2">
         <Label className="text-[10px] font-semibold text-muted-foreground/70 ml-1">Titre *</Label>
         <Input value={actionForm.title} onChange={e => setActionForm({ ...actionForm, title: e.target.value })} placeholder="Ex : Lancer la gamme Monsieur le Président" className="bg-muted/30 border-input font-medium" required />
        </div>
        <div className="space-y-2">
         <Label className="text-[10px] font-semibold text-muted-foreground/70 ml-1">Description</Label>
         <Textarea value={actionForm.description} onChange={e => setActionForm({ ...actionForm, description: e.target.value })} placeholder="Décrivez l'action et ses résultats attendus..." className="min-h-[100px] bg-muted/30 border-input font-medium leading-relaxed italic" rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label className="text-[10px] font-semibold text-muted-foreground/70 ml-1">Priorité</Label>
          <Select value={actionForm.priority} onValueChange={v => setActionForm({ ...actionForm, priority: v as Priority })}>
           <SelectTrigger className="bg-muted/30 border-input font-medium"><SelectValue /></SelectTrigger>
           <SelectContent className="border-input bg-card/95 backdrop-blur-xl rounded-xl">
            {PRIORITY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="rounded-lg">{opt.label}</SelectItem>)}
           </SelectContent>
          </Select>
         </div>
         <div className="space-y-2">
          <Label className="text-[10px] font-semibold text-muted-foreground/70 ml-1">Timeline</Label>
          <Input value={actionForm.timeline} onChange={e => setActionForm({ ...actionForm, timeline: e.target.value })} placeholder="Ex : 3-6 mois" className="bg-muted/30 border-input font-medium" />
         </div>
        </div>
        <div className="space-y-2">
         <Label className="text-[10px] font-semibold text-muted-foreground/70 ml-1">Ressources nécessaires</Label>
         <Input value={actionForm.resources} onChange={e => setActionForm({ ...actionForm, resources: e.target.value })} placeholder="Ex : R&D, Marketing, Production" className="bg-muted/30 border-input font-medium" />
        </div>
        <DialogFooter className="mt-8 gap-3">
         <Button type="button" variant="outline" onClick={closeActionDialog} disabled={isActionMutating} className="h-12 rounded-xl border-input font-medium text-[10px] px-8">Annuler</Button>
         <Button type="submit" disabled={isActionMutating} className="h-12 rounded-xl shadow-lg shadow-primary/20 bg-primary text-primary-foreground border-none font-semibold text-xs px-10">
          {isActionMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingAction ? "Enregistrer" : "Créer l'action"}
         </Button>
        </DialogFooter>
       </form>
      </div>
     </DialogContent>
    </Dialog>
   </div>
  </div>
 );
}

export default AdminRecommendationsPage;
