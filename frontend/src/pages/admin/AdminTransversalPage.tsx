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
              Nouvelle Analyse
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
      {!isLoading && analyses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune analyse transversale pour le moment.
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!isLoading && analyses.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {analyses.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-6 flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-black py-0 h-5 border-primary/20 bg-primary/5 text-primary rounded-lg uppercase tracking-widest">
                      {a.axis}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-black py-0 h-5 rounded-lg uppercase tracking-widest bg-muted/50 text-muted-foreground/80">
                      {a.category}
                    </Badge>
                  </div>
                  {a.content && (
                    <p className="text-xs font-bold text-muted-foreground/60 leading-relaxed line-clamp-2">
                       {truncate(a.content)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                    onClick={() => openEditDialog(a)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => deleteMutation.mutate(a.id)}
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

    </div>
      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? "Modifier l'analyse transversale"
                : "Nouvelle analyse transversale"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifiez les champs ci-dessous puis enregistrez."
                : "Remplissez les champs pour creer une analyse transversale."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Axis */}
            <div className="space-y-2">
              <Label htmlFor="ta-axis">Axe d'analyse *</Label>
              <Input
                id="ta-axis"
                value={form.axis}
                onChange={(e) => setForm({ ...form, axis: e.target.value })}
                placeholder="Ex : SOCIOLOGIE, NON-DITS, SYSTEMIQUE"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="ta-category">Categorie *</Label>
              <Input
                id="ta-category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Categorie de l'analyse"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="ta-content">Contenu de l'analyse</Label>
              <Textarea
                id="ta-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Contenu detaille de l'analyse transversale"
                rows={4}
              />
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
  );
}

export default AdminTransversalPage;
