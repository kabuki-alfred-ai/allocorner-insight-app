import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Plus,
  ArrowLeft,
  LayoutGrid,
  Settings,
  Target as TargetIcon,
  GripVertical,
  Trash2
} from "lucide-react";

import { createProject, updateProject, uploadLogo } from "@/lib/api/projects";
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

      // Set logo preview if exists
      if (project.logoKey) {
        setLogoPreview(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/storage/logo/${project.logoKey}`
        );
      }
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

  // ── Logo upload mutation ──

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => uploadLogo(projectId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Logo uploadé avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'upload : ${error.message}`);
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

    // Check if we're in edit mode (projectId exists and is not "new")
    if (projectId && projectId !== "new") {
      // Upload immediately
      uploadLogoMutation.mutate(file);
    }

    // Set preview
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

      <div className="mt-12">
        <Card className="overflow-hidden border-white/5 shadow-sm bg-card backdrop-blur-sm rounded-[2.5rem]">
          <CardHeader className="px-10 py-8 border-b border-white/5 bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold font-heading tracking-tight">Configuration du Projet</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                  Paramètres, identité visuelle et objectifs
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* ── Section 1: Informations Générales ── */}
                <div className="p-10 space-y-10">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                       Informations de base
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Nom du client *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex : Acme Corp" className="bg-muted/30 border-input font-bold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Titre du projet *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex : Etude satisfaction Q1 2025" className="bg-muted/30 border-input font-bold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Dates</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex : Janvier - Mars 2025" className="bg-muted/30 border-input font-bold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="analyst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Analyste</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de l'analyste" className="bg-muted/30 border-input font-bold" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-8">
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                           Contexte & Méthodologie
                        </h3>
                        <div className="space-y-8">
                          <FormField
                            control={form.control}
                            name="context"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Contexte de l'étude</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Décrivez le contexte..." 
                                    className="min-h-[120px] bg-muted/30 border-input font-medium leading-relaxed italic" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="methodology"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Méthodologie utilisée</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Décrivez la méthodologie..." 
                                    className="min-h-[100px] bg-muted/30 border-input font-medium leading-relaxed" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="participantsEstimated"
                            render={({ field }) => (
                              <FormItem className="max-w-[200px]">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Participants estimés</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    className="bg-muted/30 border-input font-bold"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                           Identité Visuelle
                        </h3>
                        <div className="p-8 rounded-3xl bg-muted/10 border border-white/5 flex flex-col items-center gap-6">
                           <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center bg-muted/20 overflow-hidden transition-all group-hover:border-primary/30">
                              {uploadLogoMutation.isPending ? (
                                <div className="flex flex-col items-center gap-3">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Upload...</p>
                                </div>
                              ) : logoPreview ? (
                                <img
                                  src={logoPreview}
                                  alt="Aperçu logo"
                                  className="w-full h-full object-contain p-6 bg-white"
                                />
                              ) : (
                                <Upload className="h-10 w-10 text-muted-foreground/20" />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute -bottom-2 -right-2 rounded-2xl shadow-xl hover:scale-110 h-12 w-12 bg-white text-black border-none"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadLogoMutation.isPending || isCreating}
                            >
                              <Upload className="h-5 w-5" />
                            </Button>
                          </div>
                          
                          <div className="text-center space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Logo Client
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground/40 italic">
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
                      </div>
                    </div>
                  </div>

                  {!isCreating && projectId && (
                    <>
                      <Separator className="bg-white/5" />
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                           Objectifs du projet
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                          <div className="md:col-span-2 space-y-4">
                             {objectivesLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin opacity-20" />
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {objectives?.map((obj) => (
                                  <div
                                    key={obj.id}
                                    className="flex items-start gap-4 p-5 rounded-2xl bg-muted/20 border border-white/5 group transition-all hover:bg-muted/30"
                                  >
                                    <div className="mt-1 h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                      <TargetIcon className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="flex-1 text-sm font-bold text-foreground/80 leading-relaxed">{obj.content}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      type="button"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                      onClick={() => deleteObjective.mutate(obj.id)}
                                      disabled={deleteObjective.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                {objectives?.length === 0 && (
                                  <div className="py-12 text-center rounded-3xl border border-dashed border-white/5 bg-muted/10">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Aucun objectif défini</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="p-6 rounded-3xl bg-primary/[0.02] border border-primary/5 space-y-4">
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Ajouter un objectif</p>
                               <div className="flex flex-col gap-3">
                                  <Textarea
                                    placeholder="Écrivez l'objectif ici..."
                                    className="bg-white/50 border-input font-bold text-xs"
                                    value={newObjective}
                                    onChange={(e) => setNewObjective(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    className="w-full shadow-lg shadow-primary/10"
                                    onClick={() => {
                                      if (newObjective.trim()) {
                                        createObjective.mutate({ content: newObjective.trim() });
                                        setNewObjective("");
                                      }
                                    }}
                                    disabled={createObjective.isPending || !newObjective.trim()}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                  </Button>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Footer / Submit ── */}
                <div className="px-10 py-8 bg-muted/30 border-t border-white/5 flex justify-end items-center gap-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
                    Tous les champs marqués d'une * sont requis
                  </p>
                  <Button 
                    type="submit" 
                    size="premium"
                    disabled={isSubmitting}
                    className="shadow-xl shadow-primary/20 px-12 h-12 bg-black text-white hover:bg-black/90 font-black rounded-xl border-none"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isCreating ? "Initialiser le projet" : "Enregistrer les modifications"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminProjectPage;
