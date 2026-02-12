import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Quote, ArrowLeft, Settings } from "lucide-react";
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
  getFeaturedVerbatims,
  createFeaturedVerbatim,
  deleteFeaturedVerbatim,
} from "@/lib/api/featured-verbatims";

import type {
  FeaturedVerbatim,
  VerbatimCategory,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORIES: { value: VerbatimCategory; label: string }[] = [
  { value: "CONTRASTE", label: "Contraste" },
  { value: "ORIGINALITE", label: "Originalite" },
  { value: "EMOTION", label: "Emotion" },
  { value: "REPRESENTATIVITE", label: "Representativite" },
  { value: "TOTEM", label: "Totem" },
];

const CATEGORY_COLORS: Record<VerbatimCategory, string> = {
  CONTRASTE: "bg-purple-100 text-purple-800 border-purple-300",
  ORIGINALITE: "bg-blue-100 text-blue-800 border-blue-300",
  EMOTION: "bg-pink-100 text-pink-800 border-pink-300",
  REPRESENTATIVITE: "bg-teal-100 text-teal-800 border-teal-300",
  TOTEM: "bg-orange-100 text-orange-800 border-orange-300",
};

function categoryBadge(category: VerbatimCategory) {
  return (
    <Badge variant="outline" className={CATEGORY_COLORS[category]}>
      {category}
    </Badge>
  );
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormValues {
  category: VerbatimCategory;
  citation: string;
  implication: string;
  messageId: string | null;
}

const emptyForm: FormValues = {
  category: "CONTRASTE",
  citation: "",
  implication: "",
  messageId: null,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminFeaturedPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(emptyForm);

  // -- Query -----------------------------------------------------------------

  const { data: verbatims = [], isLoading } = useQuery({
    queryKey: ["featured-verbatims", projectId],
    queryFn: () => getFeaturedVerbatims(projectId!),
    enabled: !!projectId,
  });

  // -- Mutations -------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      createFeaturedVerbatim(projectId!, {
        category: data.category,
        citation: data.citation,
        implication: data.implication,
        messageId: data.messageId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-verbatims", projectId] });
      toast.success("Verbatim marquant ajoute");
      closeDialog();
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFeaturedVerbatim(projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-verbatims", projectId] });
      toast.success("Verbatim marquant supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // -- Dialog helpers --------------------------------------------------------

  function openCreateDialog() {
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.citation.trim()) {
      toast.error("La citation est requise");
      return;
    }
    createMutation.mutate(form);
  }

  // -- Group by category -----------------------------------------------------

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: verbatims.filter((v) => v.category === cat.value),
  })).filter((g) => g.items.length > 0);

  // -- Render ----------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Verbatims Marquants"
        description="Sélection des témoignages les plus impactants par catégorie"
        icon={<Quote className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-3">
             <Button 
              variant="outline"
              size="action"
              onClick={() => navigate(`/projects/${projectId}/admin`)}
              className="border-primary/10 text-primary hover:bg-primary/5"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button 
              variant="default" 
              size="action"
              onClick={openCreateDialog}
              className="shadow-lg shadow-primary/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Verbatim
            </Button>
          </div>
        }
      />

      <div className="mt-12 space-y-12">

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
      {!isLoading && verbatims.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucun verbatim marquant pour le moment.
          </CardContent>
        </Card>
      )}

      {/* Grouped list */}
      {!isLoading &&
        grouped.map((group) => (
          <div key={group.value} className="space-y-8">
            <h2 className="text-xl font-extrabold font-heading flex items-center gap-4">
              <Badge 
                variant="outline" 
                className={cn(
                  "px-4 py-1.5 rounded-xl border-none font-black text-[10px] uppercase tracking-[0.15em]",
                  CATEGORY_COLORS[group.value]
                )}
              >
                {group.label}
              </Badge>
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">
                {group.items.length} verbatims
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {group.items.map((v) => (
                <Card key={v.id}>
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex-1">
                      <p className="text-base font-bold text-foreground/90 leading-relaxed italic relative">
                        <span className="text-4xl text-primary/20 absolute -top-4 -left-2 font-serif">“</span>
                        {v.citation}
                        <span className="text-4xl text-primary/20 absolute -bottom-8 right-0 font-serif">”</span>
                      </p>
                      {v.implication && (
                        <div className="mt-8 p-5 rounded-2xl bg-muted/20 border border-white/5">
                          <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                             <span className="w-1 h-1 rounded-full bg-primary" />
                             Analyse & Insights
                          </div>
                          <p className="text-xs font-bold text-muted-foreground/70 leading-relaxed">
                            {v.implication}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                       <Badge variant="outline" className="text-[9px] font-black py-0 h-5 border-primary/10 bg-primary/5 text-primary rounded-lg uppercase tracking-widest">
                        {v.messageId ? `ID: ${v.messageId.slice(0, 8)}` : "Source manuelle"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => deleteMutation.mutate(v.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      
      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau verbatim marquant</DialogTitle>
            <DialogDescription>
              Ajoutez un verbatim marquant au projet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Categorie *</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as VerbatimCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Citation */}
            <div className="space-y-2">
              <Label htmlFor="fv-citation">Citation *</Label>
              <Textarea
                id="fv-citation"
                value={form.citation}
                onChange={(e) => setForm({ ...form, citation: e.target.value })}
                placeholder="Citation du verbatim"
                rows={3}
                required
              />
            </div>

            {/* Implication */}
            <div className="space-y-2">
              <Label htmlFor="fv-implication">Implication / analyse</Label>
              <Textarea
                id="fv-implication"
                value={form.implication}
                onChange={(e) =>
                  setForm({ ...form, implication: e.target.value })
                }
                placeholder="Implication ou analyse de ce verbatim"
                rows={2}
              />
            </div>

            {/* Message ID */}
            <div className="space-y-2">
              <Label htmlFor="fv-messageId">ID du message source</Label>
              <Input
                id="fv-messageId"
                value={form.messageId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    messageId: e.target.value || null,
                  })
                }
                placeholder="Optionnel"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Creer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}

export default AdminFeaturedPage;
