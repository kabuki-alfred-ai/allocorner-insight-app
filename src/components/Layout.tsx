import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-analytics">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card/80 backdrop-blur-sm flex items-center px-6 shadow-card">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-white">AC</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Allo Corner Insight Board</h1>
                <p className="text-sm text-muted-foreground">Archives de la Charente - JEP 2024</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}