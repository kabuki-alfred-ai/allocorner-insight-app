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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
      />

      <div className="mt-12">
        <Card className="premium-card overflow-hidden">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="general" className="w-full">
                  <div className="px-4 md:px-6 lg:px-10 pt-4 md:pt-6 border-b border-black/5 bg-muted/10 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent h-auto p-0 gap-6 md:gap-8 flex-nowrap min-w-max">
                      <TabsTrigger 
                        value="general" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 md:py-4 label-uppercase data-[state=active]:text-primary transition-all whitespace-nowrap"
                      >
                        Informations Générales
                      </TabsTrigger>
                      {!isCreating && (
                        <>
                          <TabsTrigger 
                            value="identity" 
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary transition-all whitespace-nowrap"
                          >
                            Identité Visuelle
                          </TabsTrigger>
                          <TabsTrigger 
                            value="objectives" 
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary transition-all whitespace-nowrap"
                          >
                            Objectifs stratégiques
                          </TabsTrigger>
                        </>
                      )}
                    </TabsList>
                  </div>

                  <TabsContent value="general" className="m-0 focus-visible:ring-0">
                    <div className="p-4 md:p-6 lg:p-10 space-y-8 md:space-y-12">
                      {/* informations de base */}
                      <div>
                        <h3 className="label-uppercase mb-6 flex items-center gap-2 !text-primary">
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

                      <Separator className="bg-black/5" />

                      {/* Contexte & Méthodologie */}
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                <FormItem className="max-w-[240px]">
                                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Participants estimés</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="bg-muted/30 border-input h-12 font-bold"
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
                    </div>
                  </TabsContent>

                  <TabsContent value="identity" className="m-0 focus-visible:ring-0">
                    <div className="p-4 md:p-6 lg:p-10">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 md:mb-8 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Identité Visuelle
                      </h3>
                      
                      <div className="max-w-xl mx-auto p-6 md:p-12 rounded-[2.5rem] bg-muted/10 border border-black/5 flex flex-col items-center gap-6 md:gap-8">
                        <div className="relative group">
                          <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3rem] border-2 border-dashed border-black/10 flex items-center justify-center bg-muted/20 overflow-hidden transition-all group-hover:border-primary/30 shadow-inner">
                            {uploadLogoMutation.isPending ? (
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Upload...</p>
                              </div>
                            ) : logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Aperçu logo"
                                className="w-full h-full object-contain p-8 bg-white"
                              />
                            ) : (
                              <Upload className="h-12 w-12 text-muted-foreground/20" />
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute -bottom-2 -right-2 rounded-2xl shadow-xl hover:scale-110 h-14 w-14 bg-white text-black border-none gloss-effect"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadLogoMutation.isPending || isCreating}
                          >
                            <Upload className="h-6 w-6" />
                          </Button>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                            Logo du Client
                          </p>
                          <p className="text-xs font-bold text-muted-foreground/50 max-w-[240px] leading-relaxed">
                            Le logo apparaîtra sur tous les rapports et le dashboard principal.
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
                  </TabsContent>

                  <TabsContent value="objectives" className="m-0 focus-visible:ring-0">
                    <div className="p-4 md:p-6 lg:p-10">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 md:mb-8 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Objectifs stratégiques
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 flex-col-reverse lg:flex-row">
                        <div className="lg:col-span-3 space-y-4">
                           {objectivesLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-4">
                              {objectives?.map((obj) => (
                                <div
                                  key={obj.id}
                                  className="flex items-start gap-4 md:gap-5 p-4 md:p-6 rounded-2xl bg-muted/20 border border-black/5 group transition-all hover:bg-muted/30 hover:shadow-sm"
                                >
                                  <div className="mt-1 h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <TargetIcon className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="flex-1 text-sm font-bold text-foreground/80 leading-relaxed">{obj.content}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteObjective.mutate(obj.id)}
                                    disabled={deleteObjective.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {objectives?.length === 0 && (
                                <div className="py-16 md:py-20 text-center rounded-[2rem] border-2 border-dashed border-black/5 bg-muted/5">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Aucun objectif défini au projet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-2 space-y-4">
                          <div className="p-8 rounded-[2rem] bg-primary/[0.03] border border-primary/10 space-y-6 sticky top-24">
                             <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary">Ajouter un objectif</p>
                               <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Soyez précis et concis</p>
                             </div>
                             <div className="space-y-4">
                                <Textarea
                                  placeholder="Ex : Identifier les leviers de croissance..."
                                  className="min-h-[120px] bg-white/50 border-input font-bold text-xs p-4 leading-relaxed"
                                  value={newObjective}
                                  onChange={(e) => setNewObjective(e.target.value)}
                                />
                                <Button
                                  type="button"
                                  size="premium"
                                  className="w-full shadow-lg shadow-primary/20 premium-gradient border-none rounded-xl h-12"
                                  onClick={() => {
                                    if (newObjective.trim()) {
                                      createObjective.mutate({ content: newObjective.trim() });
                                      setNewObjective("");
                                    }
                                  }}
                                  disabled={createObjective.isPending || !newObjective.trim()}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Ajouter l'objectif
                                </Button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* ── Footer / Submit ── */}
                <div className="px-4 md:px-6 lg:px-10 py-6 md:py-8 bg-muted/30 border-t border-black/5 flex flex-col-reverse sm:flex-row justify-between sm:justify-end items-center gap-4 sm:gap-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 italic text-center sm:text-left w-full sm:w-auto">
                    Tous les champs marqués d'une * sont requis
                  </p>
                  <Button 
                    type="submit" 
                    size="premium"
                    disabled={isSubmitting}
                    className="shadow-xl shadow-primary/20 w-full sm:w-auto px-12 h-12 bg-black text-white hover:bg-black/90 font-black rounded-xl border-none"
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
