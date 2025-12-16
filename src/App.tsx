import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Verbatims from "./pages/Verbatims";
import Contexte from "./pages/Contexte";
import Themes from "./pages/Themes";
import ChiffresPage from "./pages/ChiffresPage";
import TendancesPage from "./pages/TendancesPage";
import EmotionsPage from "./pages/EmotionsPage";
import RecommandationsPage from "./pages/RecommandationsPage";
import RessourcesPage from "./pages/RessourcesPage";
import ImportPage from "./pages/ImportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ImportPage />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="contexte" element={<Contexte />} />
            <Route path="chiffres" element={<ChiffresPage />} />
            <Route path="verbatims" element={<Verbatims />} />
            <Route path="themes" element={<Themes />} />
            <Route path="tendances" element={<TendancesPage />} />
            <Route path="emotions" element={<EmotionsPage />} />
            <Route path="recommandations" element={<RecommandationsPage />} />
            <Route path="ressources" element={<RessourcesPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
