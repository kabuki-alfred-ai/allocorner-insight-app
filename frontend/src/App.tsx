import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import ProjectListPage from "./pages/ProjectListPage";
import Dashboard from "./pages/Dashboard";
import Verbatims from "./pages/Verbatims";
import Contexte from "./pages/Contexte";
import Themes from "./pages/Themes";

import TendancesPage from "./pages/TendancesPage";
import EmotionsPage from "./pages/EmotionsPage";
import RecommandationsPage from "./pages/RecommandationsPage";
import RessourcesPage from "./pages/RessourcesPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProjectPage from "./pages/admin/AdminProjectPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminThemesPage from "./pages/admin/AdminThemesPage";
import AdminMetricsPage from "./pages/admin/AdminMetricsPage";
import AdminTrendsPage from "./pages/admin/AdminTrendsPage";
import AdminRecommendationsPage from "./pages/admin/AdminRecommendationsPage";
import AdminTransversalPage from "./pages/admin/AdminTransversalPage";
import AdminInvitationsPage from "./pages/admin/AdminInvitationsPage";
import AdminObjectivesPage from "./pages/admin/AdminObjectivesPage";
import AdminIrcBreakdownPage from "./pages/admin/AdminIrcBreakdownPage";
import AdminStrategicActionsPage from "./pages/admin/AdminStrategicActionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* Dashboard client (read-only) */}
              <Route path="/projects" element={<Layout />}>
                <Route index element={<ProjectListPage />} />
              </Route>
              <Route path="/projects/:projectId" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="contexte" element={<Contexte />} />

                <Route path="verbatims" element={<Verbatims />} />
                <Route path="themes" element={<Themes />} />
                <Route path="tendances" element={<TendancesPage />} />
                <Route path="emotions" element={<EmotionsPage />} />
                <Route path="recommandations" element={<RecommandationsPage />} />
                <Route path="ressources" element={<RessourcesPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute requiredRole="SUPERADMIN" />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<ProjectListPage />} />
                </Route>
                <Route path="/projects/:projectId/admin" element={<AdminLayout />}>
                  <Route index element={<AdminProjectPage />} />
                  <Route path="messages" element={<AdminMessagesPage />} />
                  <Route path="themes" element={<AdminThemesPage />} />
                  <Route path="metriques" element={<AdminMetricsPage />} />
                  <Route path="tendances" element={<AdminTrendsPage />} />
                  <Route path="recommandations" element={<AdminRecommendationsPage />} />
                  <Route path="transversal" element={<AdminTransversalPage />} />
                  <Route path="invitations" element={<AdminInvitationsPage />} />
                  <Route path="objectives" element={<AdminObjectivesPage />} />
                  <Route path="irc-breakdown" element={<AdminIrcBreakdownPage />} />
                  <Route path="strategic-actions" element={<AdminStrategicActionsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const RootRedirect = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "SUPERADMIN" ? "/admin" : "/projects"} replace />;
};

export default App;
