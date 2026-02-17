import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Link2,
  Unlink,
  Search,
  Play,
  Pause,
  Volume2,
  ArrowLeft,
  Settings,
  Palette,
  Star
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  getThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  getAvailableMessagesForTheme,
  associateMessageToTheme,
  dissociateMessageFromTheme,
  associateMessagesBatch,
  setThemeTotemMessage,
} from "@/lib/api/themes";

import { getAudioUrl } from "@/lib/api/storage";
import { ThemeKeywordsEditor } from "@/components/admin/ThemeKeywordsEditor";
import type { Theme, MessageWithAssociation } from "@/lib/types";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const themeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadecimale invalide (ex: #2F66F5)")
    .default("#2F66F5"),
  temporality: z.string().default(""),
  emotionLabel: z.string().default(""),
  analysis: z.string().default(""),
  verbatimTotem: z.string().default(""),
  count: z.coerce.number().int().min(0).default(0),
});

type ThemeFormValues = z.infer<typeof themeSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminThemesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ---- State ----
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [deletingTheme, setDeletingTheme] = useState<Theme | null>(null);
  const [associatingTheme, setAssociatingTheme] = useState<Theme | null>(null);

  // ---- Query ----
  const {
    data: themes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["themes", projectId],
    queryFn: () => getThemes(projectId!),
    enabled: !!projectId,
  });

  // ---- Mutations ----
  const createMutation = useMutation({
    mutationFn: (data: ThemeFormValues) => createTheme(projectId!, {
      name: data.name,
      color: data.color || "#2F66F5",
      temporality: data.temporality || "",
      emotionLabel: data.emotionLabel || "",
      analysis: data.analysis || "",
      verbatimTotem: data.verbatimTotem || "",
      count: data.count || 0,
      totemMessageId: null,
      keywords: []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Theme cree avec succes");
      closeDialog();
    },
    onError: () => {
      toast.error("Erreur lors de la creation du theme");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ThemeFormValues) =>
      updateTheme(projectId!, editingTheme!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Theme mis a jour avec succes");
      closeDialog();
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du theme");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (themeId: string) => deleteTheme(projectId!, themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Theme supprime avec succes");
      setDeletingTheme(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du theme");
    },
  });

  // ---- Form ----
  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      name: "",
      color: "#2F66F5",
      temporality: "",
      emotionLabel: "",
      analysis: "",
      verbatimTotem: "",
      count: 0,
    },
  });

  // ---- Helpers ----
  function openCreateDialog() {
    setEditingTheme(null);
    form.reset({
      name: "",
      color: "#2F66F5",
      temporality: "",
      emotionLabel: "",
      analysis: "",
      verbatimTotem: "",
      count: 0,
    });
    setDialogOpen(true);
  }

  function openEditDialog(theme: Theme) {
    setEditingTheme(theme);
    form.reset({
      name: theme.name,
      color: theme.color,
      temporality: theme.temporality,
      emotionLabel: theme.emotionLabel,
      analysis: theme.analysis,
      verbatimTotem: theme.verbatimTotem,
      count: theme.count,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingTheme(null);
    form.reset();
  }

  function onSubmit(values: ThemeFormValues) {
    if (editingTheme) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ---- Render ----
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Thématiques"
        description="Structuration des enseignements et regroupement des verbatims"
        icon={<Palette className="h-6 w-6" />}
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
              Nouveau Thème
            </Button>
          </div>
        }
      />

      <div className="mt-12">

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Erreur lors du chargement des themes. Veuillez reessayer.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && themes.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Aucun theme pour ce projet. Cliquez sur "Ajouter un theme" pour
              commencer.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Themes table */}
      {!isLoading && themes.length > 0 && (
        <div className="rounded-[2rem] border border-white/5 overflow-hidden shadow-sm bg-card backdrop-blur-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-4 py-6 px-4"></TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Thème</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Analyse</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Détails</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-center">Témoignages</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-center">Totem</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.map((theme) => (
                  <TableRow key={theme.id} className="group hover:bg-primary/[0.02] transition-colors border-white/5">
                    <TableCell className="py-4 px-4 pr-0">
                      <div 
                        className="w-1.5 h-10 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <span className="text-sm font-extrabold font-heading group-hover:text-primary transition-colors">
                        {theme.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <p className="text-xs font-bold text-muted-foreground/60 leading-relaxed line-clamp-2 italic max-w-sm">
                        {theme.analysis ? `"${theme.analysis}"` : "-"}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        {theme.emotionLabel && (
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none text-[8px] font-black uppercase tracking-widest w-fit">
                            {theme.emotionLabel}
                          </Badge>
                        )}
                        {theme.temporality && (
                          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-none text-[8px] font-black uppercase tracking-widest w-fit">
                            {theme.temporality}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black tracking-widest font-heading">
                        {theme.count}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-center">
                      {theme.totemMessageId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest mx-auto">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Totem
                        </div>
                      ) : (
                        <span className="text-muted-foreground/20 italic text-[10px]">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                          onClick={() => openEditDialog(theme)}
                          title="Éditer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                          onClick={() => setAssociatingTheme(theme)}
                          title="Associer des Verbatims"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-9 h-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => setDeletingTheme(theme)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ---- Create / Edit Dialog ---- */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? "Modifier le theme" : "Ajouter un theme"}
            </DialogTitle>
            <DialogDescription>
              {editingTheme
                ? "Modifiez les informations du theme ci-dessous."
                : "Remplissez les informations pour creer un nouveau theme."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du theme" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input placeholder="#2F66F5" {...field} />
                      </FormControl>
                      <div
                        className="w-9 h-9 rounded-md border border-border flex-shrink-0"
                        style={{
                          backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(
                            field.value
                          )
                            ? field.value
                            : "#cccccc",
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temporality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporalite</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Passe, Present, Futur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emotionLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label emotion</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nostalgie, Fierte..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="analysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analyse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Analyse detaillee du theme..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verbatimTotem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verbatim totem</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Citation emblematique..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de messages</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mots-clés (visible uniquement en mode édition) */}
              {editingTheme && (
                <div className="space-y-2 pt-4 border-t">
                  <FormLabel>Mots-clés associés</FormLabel>
                  <ThemeKeywordsEditor theme={editingTheme} projectId={projectId!} />
                </div>
              )}

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
                  {isMutating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTheme ? "Enregistrer" : "Creer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Association Dialog ---- */}
      {associatingTheme && (
        <ThemeAssociationDialog
          theme={associatingTheme}
          projectId={projectId!}
          onClose={() => setAssociatingTheme(null)}
        />
      )}

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog
        open={!!deletingTheme}
        onOpenChange={(open) => !open && setDeletingTheme(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le theme</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer le theme "
              {deletingTheme?.name}" ? Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deletingTheme) {
                  deleteMutation.mutate(deletingTheme.id);
                }
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme Association Dialog Component
// ---------------------------------------------------------------------------

interface ThemeAssociationDialogProps {
  theme: Theme;
  projectId: string;
  onClose: () => void;
}

function ThemeAssociationDialog({
  theme,
  projectId,
  onClose,
}: ThemeAssociationDialogProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // ---- Query ----
  // Récupérer les données du thème en temps réel pour refléter les changements
  const { data: currentTheme } = useQuery({
    queryKey: ["themes", projectId],
    queryFn: () => getThemes(projectId),
    enabled: !!projectId,
    select: (themes) => themes.find((t) => t.id === theme.id) || theme,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["theme-messages", projectId, theme.id],
    queryFn: () => getAvailableMessagesForTheme(projectId, theme.id),
    enabled: !!projectId && !!theme.id,
  });

  // ---- Mutations ----
  const associateMutation = useMutation({
    mutationFn: (messageId: string) => {
      console.log('[Association] Associating message:', messageId, 'to theme:', theme.id);
      return associateMessageToTheme(projectId, theme.id, messageId);
    },
    onSuccess: async (data) => {
      console.log('[Association] Success:', data);
      await queryClient.refetchQueries({
        queryKey: ["theme-messages", projectId, theme.id],
      });
      await queryClient.refetchQueries({ queryKey: ["themes", projectId] });
      toast.success("Verbatim associe");
    },
    onError: (error) => {
      console.error('[Association] Error:', error);
      toast.error("Erreur lors de l'association");
    },
  });

  const dissociateMutation = useMutation({
    mutationFn: (messageId: string) => {
      console.log('[Dissociation] Dissociating message:', messageId, 'from theme:', theme.id);
      return dissociateMessageFromTheme(projectId, theme.id, messageId);
    },
    onSuccess: async (data) => {
      console.log('[Dissociation] Success:', data);
      await queryClient.refetchQueries({
        queryKey: ["theme-messages", projectId, theme.id],
      });
      await queryClient.refetchQueries({ queryKey: ["themes", projectId] });
      toast.success("Verbatim dissocie");
    },
    onError: (error) => {
      console.error('[Dissociation] Error:', error);
      toast.error("Erreur lors de la dissociation");
    },
  });

  const batchAssociateMutation = useMutation({
    mutationFn: (messageIds: string[]) =>
      associateMessagesBatch(projectId, theme.id, messageIds),
    onSuccess: async (result) => {
      await queryClient.refetchQueries({
        queryKey: ["theme-messages", projectId, theme.id],
      });
      await queryClient.refetchQueries({ queryKey: ["themes", projectId] });
      toast.success(`${result.associated} verbatims associes`);
    },
    onError: () => {
      toast.error("Erreur lors de l'association en batch");
    },
  });

  const setTotemMutation = useMutation({
    mutationFn: (messageId: string | null) => {
      console.log('[Totem] Setting totem message:', messageId, 'for theme:', theme.id);
      return setThemeTotemMessage(projectId, theme.id, messageId);
    },
    onSuccess: async (data) => {
      console.log('[Totem] Success:', data);
      await queryClient.refetchQueries({
        queryKey: ["theme-messages", projectId, theme.id],
      });
      await queryClient.refetchQueries({ queryKey: ["themes", projectId] });
      toast.success("Verbatim totem mis a jour");
    },
    onError: (error) => {
      console.error('[Totem] Error:', error);
      toast.error("Erreur lors de la mise a jour du verbatim totem");
    },
  });

  // ---- Filtering ----
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.filename.toLowerCase().includes(query) ||
        (msg.transcriptTxt && msg.transcriptTxt.toLowerCase().includes(query))
    );
  }, [messages, searchQuery]);

  const associatedCount = messages.filter((m) => m.isAssociated).length;
  const unassociatedCount = messages.length - associatedCount;

  // ---- Handlers ----
  const handleToggleAssociation = (message: MessageWithAssociation) => {
    console.log('[Toggle] Message:', message.id, 'isAssociated:', message.isAssociated);
    if (message.isAssociated) {
      dissociateMutation.mutate(message.id);
    } else {
      associateMutation.mutate(message.id);
    }
  };

  const handleAssociateAllFiltered = () => {
    const unassociatedIds = filteredMessages
      .filter((m) => !m.isAssociated)
      .map((m) => m.id);
    if (unassociatedIds.length > 0) {
      batchAssociateMutation.mutate(unassociatedIds);
    }
  };

  const handleDissociateAllFiltered = () => {
    const associatedIds = filteredMessages
      .filter((m) => m.isAssociated)
      .map((m) => m.id);
    // Dissocier un par un car pas d'endpoint batch pour la dissociation
    associatedIds.forEach((id) => dissociateMutation.mutate(id));
  };

  const handlePlayAudio = async (messageId: string) => {
    if (playingMessageId === messageId) {
      setPlayingMessageId(null);
      setAudioUrl(null);
      return;
    }
    try {
      const response = await getAudioUrl(projectId, messageId);
      setAudioUrl(response.url);
      setPlayingMessageId(messageId);
    } catch {
      toast.error("Erreur lors du chargement de l'audio");
    }
  };

  const isPending =
    associateMutation.isPending ||
    dissociateMutation.isPending ||
    batchAssociateMutation.isPending ||
    setTotemMutation.isPending;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: theme.color }}
            />
            Associer des verbatims a "{theme.name}"
          </DialogTitle>
          <DialogDescription>
            {associatedCount} associe(s) / {unassociatedCount} non associe(s) /{" "}
            {messages.length} total
          </DialogDescription>
          {currentTheme?.totemMessage && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                <Star className="h-4 w-4 fill-current" />
                Verbatim Totem
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {currentTheme.totemMessage.transcriptTxt || currentTheme.totemMessage.filename}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou transcription..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssociateAllFiltered}
            disabled={isPending}
          >
            <Link2 className="mr-1 h-4 w-4" />
            Tout associer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDissociateAllFiltered}
            disabled={isPending}
          >
            <Unlink className="mr-1 h-4 w-4" />
            Tout dissocier
          </Button>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Tous ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="associated">
              Associes ({associatedCount})
            </TabsTrigger>
            <TabsTrigger value="unassociated">
              Non associes ({unassociatedCount})
            </TabsTrigger>
          </TabsList>

          {["all", "associated", "unassociated"].map((tabValue) => (
            <TabsContent
              key={tabValue}
              value={tabValue}
              className="flex-1 min-h-0 mt-2"
            >
              <ScrollArea className="h-[50vh] border rounded-md">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Aucun verbatim trouve
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredMessages
                      .filter((msg) => {
                        if (tabValue === "associated") return msg.isAssociated;
                        if (tabValue === "unassociated")
                          return !msg.isAssociated;
                        return true;
                      })
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                            message.isAssociated ? "bg-primary/5" : ""
                          }`}
                        >
                          <Checkbox
                            checked={message.isAssociated}
                            onCheckedChange={() =>
                              handleToggleAssociation(message)
                            }
                            disabled={isPending}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">
                                {message.filename}
                              </span>
                              {message.isAssociated && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: `${theme.color}20`,
                                    color: theme.color,
                                    borderColor: theme.color,
                                  }}
                                >
                                  Associe
                                </Badge>
                              )}
                              {message.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(message.duration)}s
                                </Badge>
                              )}
                            </div>
                            {message.transcriptTxt ? (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {message.transcriptTxt}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                Aucune transcription
                              </p>
                            )}
                            {message.emotionalLoad && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Charge: {message.emotionalLoad}/100
                              </p>
                            )}
                            {playingMessageId === message.id && audioUrl && (
                              <div className="mt-2 flex items-center gap-2">
                                <audio
                                  src={audioUrl}
                                  autoPlay
                                  controls
                                  className="h-8 w-full"
                                  onEnded={() => setPlayingMessageId(null)}
                                />
                              </div>
                            )}
                          </div>
                          {message.isAssociated && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`flex-shrink-0 ${
                                currentTheme?.totemMessageId === message.id
                                  ? "text-yellow-500 hover:text-yellow-600"
                                  : "text-muted-foreground hover:text-yellow-500"
                              }`}
                              onClick={() =>
                                setTotemMutation.mutate(
                                  currentTheme?.totemMessageId === message.id
                                    ? null
                                    : message.id
                                )
                              }
                              disabled={setTotemMutation.isPending}
                              title={
                                currentTheme?.totemMessageId === message.id
                                  ? "Retirer le statut de verbatim totem"
                                  : "Definir comme verbatim totem"
                              }
                            >
                              <Star
                                className="h-4 w-4"
                                fill={
                                  currentTheme?.totemMessageId === message.id
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => handlePlayAudio(message.id)}
                          >
                            {playingMessageId === message.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdminThemesPage;
