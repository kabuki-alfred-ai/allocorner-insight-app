import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Plus,
  MessageSquare,
  Palette,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Quote,
  Layers,
  Mail,
  ArrowLeft,
  LayoutGrid,
  Settings,
  Target as TargetIcon,
  SplitSquareHorizontal,
  FolderOpen,
  GripVertical,
  Trash2
} from "lucide-react";

import { createProject, updateProject } from "@/lib/api/projects";
import { useProject } from "@/hooks/use-projects";
import { useObjectives, useCreateObjective, useDeleteObjective } from "@/hooks/use-objectives";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import type { CreateProjectDto, UpdateProjectDto } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ──────────────────────────────────────────────
// Schema
// ──────────────────────────────────────────────

const projectFormSchema = z.object({
  clientName: z.string().min(1, "Le nom du client est requis"),
  title: z.string().min(1, "Le titre est requis"),
  dates: z.string().optional().default(""),
  context: z.string().optional().default(""),
  analyst: z.string().optional().default(""),
  methodology: z.string().optional().default(""),
  participantsEstimated: z.coerce.number().int().min(0).optional().default(0),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// ──────────────────────────────────────────────
// Sub-page navigation links (edit mode only)
// ──────────────────────────────────────────────

const ADMIN_SUB_PAGES = [
  { to: "messages", label: "Messages", icon: MessageSquare },
  { to: "themes", label: "Themes", icon: Palette },
  { to: "metriques", label: "Metriques", icon: BarChart3 },
  { to: "irc-breakdown", label: "Decomposition IRC", icon: SplitSquareHorizontal },
  { to: "tendances", label: "Tendances", icon: TrendingUp },
  { to: "recommandations", label: "Recommandations", icon: Lightbulb },
  { to: "strategic-actions", label: "Actions strategiques", icon: Lightbulb },
  { to: "verbatims", label: "Verbatims marquants", icon: Quote },
  { to: "transversal", label: "Analyses transversales", icon: Layers },
  { to: "objectives", label: "Objectifs", icon: TargetIcon },
  { to: "resources", label: "Ressources", icon: FolderOpen },
  { to: "invitations", label: "Invitations", icon: Mail },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function AdminProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const isCreating = projectId === "new";
  const { data: project, isLoading: isProjectLoading } = useProject(
    isCreating ? "" : projectId || ""
  );

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      clientName: "",
      title: "",
      dates: "",
      context: "",
      analyst: "",
      methodology: "",
      participantsEstimated: 0,
    },
  });

  // Pre-fill form when project data arrives (edit mode)
  useEffect(() => {
    if (project && !isCreating) {
      form.reset({
        clientName: project.clientName || "",
        title: project.title || "",
        dates: project.dates || "",
        context: project.context || "",
        analyst: project.analyst || "",
        methodology: project.methodology || "",
        participantsEstimated: project.participantsEstimated || 0,
      });
    }
  }, [project, isCreating, form]);

  // ── Create mutation ──

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => {
      const payload: CreateProjectDto = {
        title: data.title,
        clientName: data.clientName,
        dates: data.dates || "",
        context: data.context || "",
        analyst: data.analyst || "",
        methodology: data.methodology || "",
        participantsEstimated: data.participantsEstimated || 0,
      };
      return createProject(payload);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet cree avec succes");
      navigate(`/projects/${newProject.id}/admin`, { replace: true });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la creation : ${error.message}`);
    },
  });

  // ── Update mutation ──

  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormValues) => {
      const payload: UpdateProjectDto = {
        title: data.title,
        clientName: data.clientName,
        dates: data.dates || "",
        context: data.context || "",
        analyst: data.analyst || "",
        methodology: data.methodology || "",
        participantsEstimated: data.participantsEstimated || 0,
      };
      return updateProject(projectId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Projet mis a jour avec succes");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise a jour : ${error.message}`);
    },
  });

  // ── Logo handling ──

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporte. Utilisez PNG, JPG ou WEBP.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Submit ──

  const onSubmit = (data: ProjectFormValues) => {
    if (isCreating) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Objectives
  const { data: objectives, isLoading: objectivesLoading } = useObjectives(projectId || "");
  const [newObjective, setNewObjective] = useState("");
  const createObjective = useCreateObjective(projectId || "");
  const deleteObjective = useDeleteObjective(projectId || "");

  // ── Loading state ──

  if (!isCreating && isProjectLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title={isCreating ? "Créer un projet" : `Configuration : ${project?.title}`}
        description={isCreating ? "Initialisation d'une nouvelle collecte audio" : "Paramètres et administration du projet"}
        icon={<Settings className="h-6 w-6" />}
        actions={
          !isCreating && (
            <Button
              variant="outline"
              size="action"
              onClick={() => navigate(`/projects/${projectId}`)}
              className="border-primary/10 text-primary hover:bg-primary/5"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Voir le Board
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-lg font-extrabold font-heading">Informations générales</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-80">
                Détails principaux de la collecte
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* clientName */}
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du client *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex : Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du projet *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex : Etude satisfaction Q1 2025"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* dates */}
              <FormField
                control={form.control}
                name="dates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dates</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex : Janvier - Mars 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* context */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contexte</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Decrivez le contexte de l'etude..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* analyst */}
              <FormField
                control={form.control}
                name="analyst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analyste</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'analyste" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* methodology */}
              <FormField
                control={form.control}
                name="methodology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodologie</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Decrivez la methodologie..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* participantsEstimated */}
              <FormField
                control={form.control}
                name="participantsEstimated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participants estimes</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

                  {/* Submit */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      size="action"
                      disabled={isSubmitting}
                      className="shadow-lg shadow-primary/20 px-10"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {isCreating ? "Créer le projet" : "Enregistrer les modifications"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Logo upload card */}
          <Card>
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-lg font-extrabold font-heading">Identité Visuelle</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-0">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/30 overflow-hidden transition-all group-hover:border-primary/30">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Aperçu logo"
                        className="w-full h-full object-contain p-4 bg-white"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-xl shadow-lg hover:scale-110 h-10 w-10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                    Logo Client
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 mt-1">
                    PNG, JPG ou WEBP (Max 2Mo)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          {!isCreating && projectId && (
            <Card>
              <CardHeader className="px-8 py-6">
                <CardTitle className="text-lg font-extrabold font-heading flex items-center gap-2">
                  <TargetIcon className="h-5 w-5" />
                  Objectifs du projet
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 pt-0">
                <div className="space-y-4">
                  {/* Add new objective */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nouvel objectif..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newObjective.trim()) {
                          createObjective.mutate({ content: newObjective.trim() });
                          setNewObjective("");
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (newObjective.trim()) {
                          createObjective.mutate({ content: newObjective.trim() });
                          setNewObjective("");
                        }
                      }}
                      disabled={createObjective.isPending || !newObjective.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Objectives list */}
                  <div className="space-y-2">
                    {objectivesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : objectives?.length === 0 ? (
                      <p className="text-sm text-muted-foreground/70 text-center py-4">
                        Aucun objectif défini
                      </p>
                    ) : (
                      objectives?.map((obj, index) => (
                        <div
                          key={obj.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 group"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground/60 mt-0.5" />
                          <span className="flex-1 text-sm">{obj.content}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => deleteObjective.mutate(obj.id)}
                            disabled={deleteObjective.isPending}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation links to sub-pages (edit mode only) */}
          {!isCreating && projectId && (
            <Card>
              <CardHeader className="px-8 py-6">
                <CardTitle className="text-lg font-extrabold font-heading">Sections</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="grid grid-cols-1 gap-2">
                  {ADMIN_SUB_PAGES.map((page) => (
                    <Link
                      key={page.to}
                      to={`/projects/${projectId}/admin/${page.to}`}
                      className="group flex items-center gap-4 rounded-2xl p-4 text-sm font-extrabold text-muted-foreground/80 transition-all hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                    >
                      <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <page.icon className="h-4 w-4" />
                      </div>
                      <span className="uppercase tracking-widest text-[10px]">{page.label}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProjectPage;
