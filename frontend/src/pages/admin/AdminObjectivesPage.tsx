import { useState } from "react";
import { useParams } from "react-router-dom";
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from "@/hooks/use-objectives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, GripVertical, Save, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export default function AdminObjectivesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: objectives, isLoading } = useObjectives(projectId!);
  const createObjective = useCreateObjective(projectId!);
  const updateObjective = useUpdateObjective(projectId!);
  const deleteObjective = useDeleteObjective(projectId!);
  
  const [newObjective, setNewObjective] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleAdd = async () => {
    if (!newObjective.trim()) return;
    try {
      await createObjective.mutateAsync({ content: newObjective, position: objectives?.length || 0 });
      setNewObjective("");
      toast.success("Objectif ajouté");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateObjective.mutateAsync({ id, data: { content: editingContent } });
      setEditingId(null);
      toast.success("Objectif mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteObjective.mutateAsync(id);
      toast.success("Objectif supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
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
        title="Objectifs du projet"
        description="Gérer les objectifs de l'étude"
        icon={<Target className="h-6 w-6" />}
      />

      <Card className="premium-card mb-6">
        <CardHeader>
          <CardTitle>Ajouter un objectif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nouvel objectif..."
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={createObjective.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-2">
        {objectives?.map((objective, index) => (
          <Card key={objective.id} className="premium-card !rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <span className="text-sm font-medium text-muted-foreground w-8">
                  {index + 1}.
                </span>
                
                {editingId === objective.id ? (
                  <>
                    <Input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(objective.id)}
                      disabled={updateObjective.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className="flex-1 cursor-pointer hover:text-primary"
                      onClick={() => {
                        setEditingId(objective.id);
                        setEditingContent(objective.content);
                      }}
                    >
                      {objective.content}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(objective.id)}
                      disabled={deleteObjective.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
