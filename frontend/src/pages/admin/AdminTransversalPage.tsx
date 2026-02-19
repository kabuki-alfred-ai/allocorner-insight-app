import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Network, ArrowLeft, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  getTransversalAnalyses,
  createTransversalAnalysis,
  updateTransversalAnalysis,
  deleteTransversalAnalysis,
} from "@/lib/api/transversal";

import type { TransversalAnalysis } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncate(text: string, max = 150): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormValues {
  axis: string;
  category: string;
  content: string;
}

const emptyForm: FormValues = {
  axis: "",
  category: "",
  content: "",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminTransversalPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TransversalAnalysis | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);

  // -- Query -----------------------------------------------------------------

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["transversal", projectId],
    queryFn: () => getTransversalAnalyses(projectId!),
    enabled: !!projectId,
  });

  // -- Mutations -------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createTransversalAnalysis(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transversal", projectId] });
      toast.success("Analyse transversale creee");
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormValues> }) =>
      updateTransversalAnalysis(projectId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transversal", projectId] });
      toast.success("Analyse transversale mise a jour");
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransversalAnalysis(projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transversal", projectId] });
      toast.success("Analyse transversale supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // -- Dialog helpers --------------------------------------------------------

  function openCreateDialog() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(analysis: TransversalAnalysis) {
    setEditing(analysis);
    setForm({
      axis: analysis.axis,
      category: analysis.category,
      content: analysis.content,
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
    if (!form.axis.trim()) {
      toast.error("L'axe d'analyse est requis");
      return;
    }
    if (!form.category.trim()) {
      toast.error("La categorie est requise");
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // -- Render ----------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Analyses Transversales"
        description="Analyses systémiques et sociologiques croisées"
        icon={<Network className="h-6 w-6" />}
        actions={
          <Button
            variant="default"
            size="premium"
            onClick={openCreateDialog}
            className="shadow-md shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Analyse
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
      {!isLoading && analyses.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-input bg-muted/5 text-center px-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-6">
            <Network className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-black font-heading uppercase tracking-widest text-foreground/80 mb-2">Aucune analyse transversale</h3>
          <p className="text-xs font-bold text-muted-foreground/60 max-w-[280px] leading-relaxed mb-8">
            Ajoutez des analyses systémiques et sociologiques croisées pour enrichir le rapport.
          </p>
          <Button 
            onClick={openCreateDialog}
            size="premium"
            className="premium-gradient border-none shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer la première analyse
          </Button>
        </div>
      )}

      {/* List */}
      {!isLoading && analyses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyses.map((a) => (
            <Card key={a.id} className="premium-card group h-full">
              <CardContent className="p-8 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-black py-0.5 px-3 border-none bg-primary/10 text-primary rounded-lg uppercase tracking-widest">
                      {a.axis}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-black py-0.5 px-3 rounded-lg uppercase tracking-widest bg-muted/50 text-muted-foreground/80">
                      {a.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary"
                      onClick={() => openEditDialog(a)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteMutation.mutate(a.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {a.content && (
                  <div className="relative pl-6">
                    <span className="absolute left-0 top-0 w-1.5 h-full bg-primary/5 rounded-full" />
                    <p className="text-sm font-bold text-muted-foreground/70 leading-relaxed italic">
                       {truncate(a.content, 200)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl border-none bg-card/95 backdrop-blur-xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="p-10">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black font-heading">
                {editing
                  ? "Modifier l'analyse"
                  : "Nouvelle analyse transversale"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
                {editing
                  ? "Ajustez les paramètres de votre analyse croisée."
                  : "Définissez un nouvel axe d'analyse systémique."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ta-axis" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Axe d'analyse *</Label>
                  <Input
                    id="ta-axis"
                    value={form.axis}
                    onChange={(e) => setForm({ ...form, axis: e.target.value })}
                    placeholder="Ex : SOCIOLOGIE"
                    className="bg-muted/30 border-input font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ta-category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Catégorie *</Label>
                  <Input
                    id="ta-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Ex : Non-dits"
                    className="bg-muted/30 border-input font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ta-content" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Contenu détaillé</Label>
                <Textarea
                  id="ta-content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Décrivez votre analyse transversale..."
                  className="min-h-[160px] bg-muted/30 border-input font-medium leading-relaxed italic"
                  rows={4}
                />
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
                  {editing ? "Enregistrer les modifications" : "Créer l'analyse"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminTransversalPage;
