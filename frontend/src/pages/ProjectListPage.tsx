import { useEffect } from"react";
import { useNavigate, useLocation } from"react-router-dom";
import {
 LogOut,
 Plus,
 Calendar,
 MessageSquare,
 ArrowRight,
 Settings,
 FolderOpen,
 Briefcase,
 MoreVertical
} from"lucide-react";

import { PageHeader } from"@/components/PageHeader";

import { useAuth } from"@/lib/auth-context";
import { useProjects } from"@/hooks/use-projects";
import { Button } from"@/components/ui/button";
import { Skeleton } from"@/components/ui/skeleton";
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from"@/components/ui/card";
import { Separator } from"@/components/ui/separator";
import type { Project } from"@/lib/types";
import { apiClient } from"@/lib/api";

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
 <Card 
 onClick={() => navigate(`/projects/${project.id}`)}
 className="cursor-pointer transition-colors hover:bg-muted/50 flex flex-col h-full"
 >
 <CardHeader className="flex flex-row items-center gap-4">
 {project.logoKey ? (
 <div className="w-12 h-12 rounded-md bg-muted p-2 flex-shrink-0 flex items-center justify-center">
 <img
 src={`${apiClient.defaults.baseURL}/storage/logo/${project.logoKey}`}
 alt={project.clientName}
 className="w-full h-full object-contain"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = 'none';
 }}
 />
 </div>
 ) : (
 <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
 <Briefcase className="h-5 w-5 text-muted-foreground" />
 </div>
 )}
 <div className="flex-1 min-w-0">
 <CardDescription className="truncate">{project.clientName}</CardDescription>
 <CardTitle className="text-xl truncate">{project.title}</CardTitle>
 </div>
 </CardHeader>
 
 <CardContent className="flex-1">
 <div className="flex flex-col gap-2 text-sm text-muted-foreground">
 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4" />
 <span>{project.dates ||"En cours"}</span>
 </div>
 <div className="flex items-center gap-2">
 <MessageSquare className="h-4 w-4" />
 <span>
 {messagesCount !== undefined && messagesCount !== null
 ?`${messagesCount} témoignages`
 :"0 témoignage"}
 </span>
 </div>
 </div>
 </CardContent>
 
 <CardFooter className="flex items-center gap-2">
 <Button
 variant="secondary"
 className="w-full"
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/projects/${project.id}`);
 }}
 >
 Ouvrir
 </Button>
 {isSuperAdmin && (
 <Button
 variant="ghost"
 size="icon"
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/projects/${project.id}/admin`);
 }}
 title="Administrer"
 >
 <Settings className="h-4 w-4" />
 </Button>
 )}
 </CardFooter>
 </Card>
 );
}

// ──────────────────────────────────────────────
// Skeleton cards for loading state
// ──────────────────────────────────────────────

function ProjectCardSkeleton() {
 return (
 <Card className="flex flex-col h-full">
 <CardHeader className="flex flex-row gap-4 mb-4">
 <Skeleton className="h-12 w-12 rounded-md" />
 <div className="space-y-2 flex-1 pt-1">
 <Skeleton className="h-4 w-20" />
 <Skeleton className="h-6 w-3/4" />
 </div>
 </CardHeader>
 <CardContent className="flex-1 space-y-3">
 <Skeleton className="h-4 w-32" />
 <Skeleton className="h-4 w-24" />
 </CardContent>
 <CardFooter>
 <Skeleton className="h-10 w-full rounded-md" />
 </CardFooter>
 </Card>
 );
}

// ──────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────

function EmptyState() {
 return (
 <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/20">
 <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
 <FolderOpen className="h-8 w-8 text-muted-foreground" />
 </div>
 <h3 className="text-xl font-semibold text-foreground tracking-tight">
 Aucun projet
 </h3>
 <p className="text-sm text-muted-foreground mt-2 max-w-sm">
 Vous n'avez pas encore de collecte audio en cours.
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
 
 const isSuperAdmin = user?.role ==="SUPERADMIN";
 
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
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <PageHeader 
 title="Projets"
 actions={
 <Button
 variant="default"
 onClick={() => navigate("/projects/new/admin")}
 >
 <Plus className="h-4 w-4 mr-2" />
 Nouveau projet
 </Button>
 }
 />

 <div className="mt-8">
 {isLoading ? (
 <div className="space-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} className="h-24 w-full rounded-lg" />
 ))}
 </div>
 ) : !isError && projects && projects.length === 0 ? (
 <EmptyState />
 ) : (
 <div className="flex flex-col gap-4">
 {projects?.map((project) => {
 const messagesCount = (project as Project & { _count?: { messages: number } })._count?.messages;
 return (
 <Card
 key={project.id}
 onClick={() => navigate(`/projects/${project.id}`)}
 className="cursor-pointer transition-colors hover:bg-muted/50 flex items-center flex-row p-4"
 >
 <div className="w-12 h-12 rounded-md bg-muted p-2 flex-shrink-0 flex items-center justify-center">
 {project.logoKey ? (
 <img
 src={`${apiClient.defaults.baseURL}/storage/logo/${project.logoKey}`}
 alt={project.clientName}
 className="w-full h-full object-contain"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = 'none';
 }}
 />
 ) : (
 <Briefcase className="h-5 w-5 text-muted-foreground" />
 )}
 </div>
 
 <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4 ml-4">
 <div className="flex flex-col min-w-0">
 <CardTitle className="text-base truncate">{project.title}</CardTitle>
 <CardDescription className="truncate">{project.clientName}</CardDescription>
 </div>

 <div className="flex items-center gap-6 text-sm text-muted-foreground">
 <div className="hidden md:flex items-center gap-2 w-32">
 <Calendar className="h-4 w-4" />
 <span>{project.dates ||"En cours"}</span>
 </div>
 <div className="flex items-center gap-2 w-32">
 <MessageSquare className="h-4 w-4" />
 <span>{messagesCount !== undefined && messagesCount !== null ? messagesCount : 0} témoig.</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 ml-4 flex-shrink-0">
 {isSuperAdmin && (
 <Button
 variant="ghost"
 size="icon"
 onClick={(e) => {
 e.stopPropagation();
 navigate(`/projects/${project.id}/admin`);
 }}
 title="Administrer"
 >
 <Settings className="h-4 w-4" />
 </Button>
 )}
 <Button variant="ghost" size="icon">
 <ArrowRight className="h-4 w-4" />
 </Button>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 </div>
 );
 }

 // When in layout (not standalone), show simplified version
 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <PageHeader 
 title="Projets"
 actions={
 isSuperAdmin && (
 <Button
 variant="default"
 onClick={() => navigate("/projects/new/admin")}
 >
 <Plus className="h-4 w-4 mr-2" />
 Nouveau projet
 </Button>
 )
 }
 />

 <div className="mt-8">
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
 </div>
 );
}

export default ProjectListPage;
