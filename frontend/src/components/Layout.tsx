import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useParams } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { MobileHeader } from "@/components/MobileHeader";

export function Layout() {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: project } = useProject(projectId || "");

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full relative">
                <AppSidebar />
                <SidebarInset className="bg-muted/30 w-full flex flex-col min-h-screen">
                    <MobileHeader projectTitle={project?.title} />
                    <main className="max-w-7xl mx-auto w-full p-6 md:p-10 pt-20 md:pt-10 flex-1 overflow-x-hidden">
                        <Outlet />
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

export default Layout;
