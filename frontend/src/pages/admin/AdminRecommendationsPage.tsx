import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Lightbulb, ArrowLeft, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} from "@/lib/api/recommendations";

import type {
  Recommendation,
  Priority,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "HAUTE", label: "Haute" },
  { value: "MOYENNE", label: "Moyenne" },
  { value: "BASSE", label: "Basse" },
];

function priorityBadge(priority: Priority) {
  const map: Record<Priority, string> = {
    HAUTE: "bg-red-100 text-red-800 border-red-300",
    MOYENNE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    BASSE: "bg-green-100 text-green-800 border-green-300",
  };
  return (
    <Badge variant="outline" className={map[priority]}>
      {priority}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormValues {
  title: string;
  objective: string;
  priority: Priority;
  position: number;
}

const emptyForm: FormValues = {
  title: "",
  objective: "",
  priority: "MOYENNE",
  position: 0,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminRecommendationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Recommendation | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);

  // -- Queries ---------------------------------------------------------------

  const {
    data: recommendations = [],
    isLoading,
  } = useQuery({
    queryKey: ["recommendations", projectId],
    queryFn: () => getRecommendations(projectId!),
    enabled: !!projectId,
  });

  // -- Mutations -------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createRecommendation(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", projectId] });
      toast.success("Recommandation creee");
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormValues> }) =>
      updateRecommendation(projectId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", projectId] });
      toast.success("Recommandation mise a jour");
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecommendation(projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", projectId] });
      toast.success("Recommandation supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // -- Dialog helpers --------------------------------------------------------

  function openCreateDialog() {
    setEditing(null);
    setForm({ ...emptyForm, position: recommendations.length });
    setDialogOpen(true);
  }

  function openEditDialog(rec: Recommendation) {
    setEditing(rec);
    setForm({
      title: rec.title,
      objective: rec.objective,
      priority: rec.priority,
      position: rec.position,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // -- Sorted list -----------------------------------------------------------

  const sorted = [...recommendations].sort((a, b) => a.position - b.position);

  // -- Render ----------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Recommandations"
        description="Stratégies et actions correctives issues de l'analyse"
        icon={<Lightbulb className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-3">
             <Button 
              variant="outline"
              onClick={() => navigate(`/projects/${projectId}/admin`)}
              className="font-bold text-[10px] uppercase tracking-widest rounded-xl h-11 px-6 border-primary/10 text-primary hover:bg-primary/5"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button 
              variant="default" 
              onClick={openCreateDialog}
              className="shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest px-8 rounded-xl h-11"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Recommandation
            </Button>
          </div>
        }
      />

      <div className="mt-12 space-y-6">

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sorted.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune recommandation pour le moment.
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!isLoading && sorted.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((rec, index) => (
            <Card key={rec.id} className="overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/10">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-bold text-foreground truncate">{rec.title}</h3>
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-black px-2 py-0 h-5 border-none rounded-lg uppercase tracking-widest",
                        rec.priority === "HAUTE" ? "bg-red-500/10 text-red-500" :
                        rec.priority === "MOYENNE" ? "bg-amber-500/10 text-amber-500" :
                        "bg-green-500/10 text-green-500"
                      )}>
                        {rec.priority}
                      </Badge>
                    </div>
                    {rec.objective && (
                      <p className="text-xs font-bold text-muted-foreground/60 leading-relaxed truncate">
                        {rec.objective}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => openEditDialog(rec)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => deleteMutation.mutate(rec.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier la recommandation" : "Nouvelle recommandation"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifiez les champs ci-dessous puis enregistrez."
                : "Remplissez les champs pour creer une recommandation."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="rec-title">Titre *</Label>
              <Input
                id="rec-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre de la recommandation"
                required
              />
            </div>

            {/* Objective */}
            <div className="space-y-2">
              <Label htmlFor="rec-objective">Objectif</Label>
              <Textarea
                id="rec-objective"
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                placeholder="Objectif de la recommandation"
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priorite</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm({ ...form, priority: v as Priority })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priorite" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isMutating}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Enregistrer" : "Creer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default AdminRecommendationsPage;
