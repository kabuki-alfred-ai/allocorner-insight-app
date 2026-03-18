import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Layout() {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: project } = useProject(projectId || "");
    const { user } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-muted/30 w-full min-h-screen">
                <main className="max-w-7xl mx-auto w-full p-6 md:p-10 flex-1">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
