import { useState } from "react";
import { useParams } from "react-router-dom";
import { useStrategicActions, useCreateStrategicAction, useUpdateStrategicAction, useDeleteStrategicAction } from "@/hooks/use-strategic-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Save, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import type { Priority } from "@/lib/types";

export default function AdminStrategicActionsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: actions, isLoading } = useStrategicActions(projectId!);
  const createAction = useCreateStrategicAction(projectId!);
  const updateAction = useUpdateStrategicAction(projectId!);
  const deleteAction = useDeleteStrategicAction(projectId!);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newAction, setNewAction] = useState({
    title: "",
    description: "",
    priority: "MOYENNE" as Priority,
    timeline: "",
    resources: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState({
    title: "",
    description: "",
    priority: "MOYENNE" as Priority,
    timeline: "",
    resources: "",
  });

  const handleAdd = async () => {
    if (!newAction.title.trim()) return;
    try {
      await createAction.mutateAsync({
        ...newAction,
        position: actions?.length || 0,
      });
      setNewAction({ title: "", description: "", priority: "MOYENNE", timeline: "", resources: "" });
      setIsCreating(false);
      toast.success("Action stratégique ajoutée");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateAction.mutateAsync({ id, data: editingAction });
      setEditingId(null);
      toast.success("Action stratégique mise à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAction.mutateAsync(id);
      toast.success("Action stratégique supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const startEditing = (action: typeof actions extends (infer T)[] ? T : never) => {
    setEditingId(action.id);
    setEditingAction({
      title: action.title,
      description: action.description,
      priority: action.priority,
      timeline: action.timeline,
      resources: action.resources,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Actions stratégiques"
        description="Gérer les actions stratégiques du projet"
        icon={<Lightbulb className="h-6 w-6" />}
      />

      <Button onClick={() => setIsCreating(true)} className="mb-6" disabled={isCreating}>
        <Plus className="h-4 w-4 mr-2" />
        Nouvelle action
      </Button>

      {isCreating && (
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Nouvelle action stratégique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Titre"
              value={newAction.title}
              onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newAction.description}
              onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
            />
            <Select
              value={newAction.priority}
              onValueChange={(v) => setNewAction({ ...newAction, priority: v as Priority })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HAUTE">Haute</SelectItem>
                <SelectItem value="MOYENNE">Moyenne</SelectItem>
                <SelectItem value="BASSE">Basse</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Timeline (ex: 3-6 mois)"
              value={newAction.timeline}
              onChange={(e) => setNewAction({ ...newAction, timeline: e.target.value })}
            />
            <Input
              placeholder="Ressources nécessaires"
              value={newAction.resources}
              onChange={(e) => setNewAction({ ...newAction, resources: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={createAction.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {actions?.map((action) => (
          <Card key={action.id} className="shadow-card">
            <CardContent className="p-4">
              {editingId === action.id ? (
                <div className="space-y-4">
                  <Input
                    value={editingAction.title}
                    onChange={(e) => setEditingAction({ ...editingAction, title: e.target.value })}
                  />
                  <Textarea
                    value={editingAction.description}
                    onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                  />
                  <Select
                    value={editingAction.priority}
                    onValueChange={(v) => setEditingAction({ ...editingAction, priority: v as Priority })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HAUTE">Haute</SelectItem>
                      <SelectItem value="MOYENNE">Moyenne</SelectItem>
                      <SelectItem value="BASSE">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Timeline"
                    value={editingAction.timeline}
                    onChange={(e) => setEditingAction({ ...editingAction, timeline: e.target.value })}
                  />
                  <Input
                    placeholder="Ressources"
                    value={editingAction.resources}
                    onChange={(e) => setEditingAction({ ...editingAction, resources: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(action.id)} disabled={updateAction.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Priorité: {action.priority}</span>
                      {action.timeline && <span>• {action.timeline}</span>}
                      {action.resources && <span>• {action.resources}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEditing(action)}>
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(action.id)}
                      disabled={deleteAction.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
