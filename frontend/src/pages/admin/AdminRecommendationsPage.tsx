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
    HAUTE: "bg-red-500/10 text-red-500 border-none",
    MOYENNE: "bg-amber-500/10 text-amber-500 border-none",
    BASSE: "bg-emerald-500/10 text-emerald-500 border-none",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest", map[priority])}>
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
          <Button
            variant="default"
            size="premium"
            onClick={openCreateDialog}
            className="shadow-md shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Recommandation
          </Button>
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
        <div className="py-24 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-input bg-muted/5 text-center px-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
            <Lightbulb className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-black font-heading uppercase tracking-widest text-foreground/80 mb-2">Aucune recommandation</h3>
          <p className="text-xs font-bold text-muted-foreground/60 max-w-[280px] leading-relaxed mb-8">
            Commencez par ajouter une stratégie ou une action corrective issue de votre analyse.
          </p>
          <Button 
            onClick={openCreateDialog}
            size="premium"
            className="premium-gradient border-none shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter la première
          </Button>
        </div>
      )}

      {/* List */}
      {!isLoading && sorted.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {sorted.map((rec, index) => (
            <Card key={rec.id} className="group overflow-hidden premium-border bg-card/50 backdrop-blur-sm rounded-[2rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className={cn(
                "absolute top-0 left-0 w-1.5 h-full",
                rec.priority === "HAUTE" ? "bg-red-500" :
                rec.priority === "MOYENNE" ? "bg-amber-500" :
                "bg-emerald-500"
              )} />
              <CardContent className="p-8 flex items-start justify-between gap-8">
                <div className="flex items-start gap-8 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-muted/30 flex items-center justify-center text-foreground font-black text-lg shrink-0 border border-input shadow-inner group-hover:scale-110 transition-all duration-500">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3 pt-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-black font-heading text-foreground tracking-tight">{rec.title}</h3>
                      {priorityBadge(rec.priority)}
                    </div>
                    {rec.objective && (
                      <div className="relative">
                        <span className="absolute -left-4 top-0 w-1 h-full bg-primary/10 rounded-full" />
                        <p className="text-sm font-bold text-muted-foreground/70 leading-relaxed italic">
                          {rec.objective}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-11 w-11 rounded-xl bg-white text-black shadow-lg hover:scale-110 transition-all duration-300"
                    onClick={() => openEditDialog(rec)}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                    onClick={() => deleteMutation.mutate(rec.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl border-none bg-card/95 backdrop-blur-xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="p-10">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black font-heading">
                {editing ? "Modifier la recommandation" : "Nouvelle recommandation"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                {editing
                  ? "Ajustez les détails de votre recommandation."
                  : "Définissez une nouvelle action stratégique."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rec-title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Titre de l'action *</Label>
                <Input
                  id="rec-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex : Optimisation du tunnel de vente"
                  className="bg-muted/30 border-input font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rec-objective" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Objectif détaillé</Label>
                <Textarea
                  id="rec-objective"
                  value={form.objective}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                  placeholder="Décrivez l'objectif et les résultats attendus..."
                  className="min-h-[120px] bg-muted/30 border-input font-medium leading-relaxed italic"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Niveau de priorité</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm({ ...form, priority: v as Priority })
                  }
                >
                  <SelectTrigger className="bg-muted/30 border-input font-bold">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent className="border-input bg-card/95 backdrop-blur-xl rounded-xl">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-10 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  disabled={isMutating}
                  className="h-12 rounded-xl border-input font-bold text-[10px] uppercase tracking-widest px-8"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isMutating}
                  className="h-12 rounded-xl shadow-lg shadow-primary/20 premium-gradient border-none font-black text-xs uppercase tracking-widest px-10 gloss-effect"
                >
                  {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editing ? "Enregistrer les modifications" : "Créer la recommandation"}
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
