import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Plus,
  Calendar,
  MessageSquare,
  ArrowRight,
  Settings,
  FolderOpen,
  Briefcase,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";

import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/lib/types";

// ──────────────────────────────────────────────
// Project card
// ──────────────────────────────────────────────

interface ProjectCardProps {
  project: Project & { _count?: { messages: number } };
  isSuperAdmin: boolean;
}

function ProjectCard({ project, isSuperAdmin }: ProjectCardProps) {
  const navigate = useNavigate();
  const messagesCount = project._count?.messages;

  return (
    <Card className="shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group border-white/5 overflow-hidden rounded-[2rem] bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4 pt-8 px-8 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
        <div className="flex items-start gap-4 mb-2">
          {project.logoKey && (
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm flex-shrink-0">
              <img
                src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/storage/logo/${project.logoKey}`}
                alt={project.clientName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-primary/80 uppercase tracking-[0.3em] mb-1">
              {project.clientName}
            </p>
            <h3 className="text-2xl font-extrabold font-heading text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </div>
        </div>
      </CardHeader>
 
      <CardContent className="flex-1 pb-8 px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
            <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Calendar className="h-4 w-4 shrink-0" />
            </div>
            <span>{project.dates || "En cours"}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
            <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <MessageSquare className="h-4 w-4 shrink-0" />
            </div>
            <span>
              {messagesCount !== undefined && messagesCount !== null
                ? `${messagesCount} témoignages`
                : "Aucun message"}
            </span>
          </div>
        </div>
      </CardContent>
 
      <div className="px-8 py-6 bg-muted/20 border-t border-white/5 flex gap-3">
        <Button
          className="flex-1 shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest rounded-xl h-12 transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          Accéder au Board
        </Button>
        {isSuperAdmin && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-12 w-12 border-primary/10 text-primary hover:bg-primary/5 transition-all hover:border-primary/20"
            onClick={() => navigate(`/projects/${project.id}/admin`)}
            title="Administrer"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Skeleton cards for loading state
// ──────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <Card className="shadow-card flex flex-col">
      <CardHeader className="pb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="pt-4">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-muted/20 rounded-[2.5rem] border border-dashed border-muted-foreground/20">
      <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6">
        <FolderOpen className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-extrabold font-heading text-foreground tracking-tight">
        Aucun projet actif
      </h3>
      <p className="text-sm font-bold text-muted-foreground/80 mt-2 max-w-sm uppercase tracking-wider leading-relaxed">
        Vous n'avez pas encore de collectes audio. Commencez par en créer une nouvelle.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export function ProjectListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEmbedded = location.pathname.startsWith("/admin");
  const { user, logout } = useAuth();
  const { data: projects, isLoading, isError } = useProjects();
 
  const isSuperAdmin = user?.role === "SUPERADMIN";
 
  // Redirect SuperAdmins to /admin if they are on the standalone /projects page
  useEffect(() => {
    if (!isLoading && isSuperAdmin && !isEmbedded) {
      navigate("/admin", { replace: true });
    }
  }, [isLoading, isSuperAdmin, isEmbedded, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (isEmbedded) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <PageHeader 
          title="Gestion des Projets"
          icon={<Briefcase className="h-6 w-6" />}
          actions={
            <Button
              onClick={() => navigate("/projects/new/admin")}
              className="shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest px-8 rounded-xl h-11"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          }
        />

        <div className="mt-12">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : !isError && projects && projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="rounded-[2rem] border border-white/5 overflow-hidden shadow-sm bg-card backdrop-blur-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Client</TableHead>
                      <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Titre du Projet</TableHead>
                      <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-center">Dates</TableHead>
                      <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-center">Témoignages</TableHead>
                      <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects?.map((project) => {
                      const messagesCount = (project as any)._count?.messages;
                      return (
                        <TableRow key={project.id} className="group hover:bg-primary/[0.02] transition-colors border-white/5">
                          <TableCell className="py-4 px-8">
                            <div className="flex items-center gap-4">
                              {project.logoKey ? (
                                <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-sm flex-shrink-0">
                                  <img
                                    src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/storage/logo/${project.logoKey}`}
                                    alt={project.clientName}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                  <Briefcase className="h-5 w-5 text-muted-foreground/40" />
                                </div>
                              )}
                              <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest truncate max-w-[150px]">
                                {project.clientName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-8">
                            <span className="text-sm font-extrabold font-heading group-hover:text-primary transition-colors">
                              {project.title}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-8 text-center text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
                            {project.dates || "En cours"}
                          </TableCell>
                          <TableCell className="py-4 px-8 text-center">
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black tracking-widest font-heading">
                              {messagesCount !== undefined && messagesCount !== null ? messagesCount : 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-4 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest transition-all"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                Board
                              </Button>
                              <Button
                                size="icon"
                                variant="default"
                                className="h-9 w-9 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95"
                                onClick={() => navigate(`/projects/${project.id}/admin`)}
                                title="Administrer"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // When in layout (not standalone), show simplified version
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Description and actions */}
      <div className="mb-8">
        <p className="text-muted-foreground/80 text-sm mb-6">
          Sélectionnez un projet dans le menu latéral ou cliquez sur un projet ci-dessous pour accéder à son tableau de bord.
        </p>
        
        {isSuperAdmin && (
          <Button
            onClick={() => navigate("/projects/new/admin")}
            className="shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest px-8 rounded-xl h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
        )}
      </div>

      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">
            Erreur lors du chargement des projets.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Veuillez rafraichir la page ou réessayer plus tard.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}

        {!isLoading && !isError && projects && projects.length === 0 && (
          <EmptyState />
        )}

        {!isLoading &&
          !isError &&
          projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project as Project & { _count?: { messages: number } }}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
      </div>
    </div>
  );
}

export default ProjectListPage;
