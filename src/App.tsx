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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="contexte" element={<Contexte />} />
            <Route path="chiffres" element={<div className="p-8 text-center text-muted-foreground">Page Chiffres clés - En développement</div>} />
            <Route path="verbatims" element={<Verbatims />} />
            <Route path="themes" element={<Themes />} />
            <Route path="tendances" element={<div className="p-8 text-center text-muted-foreground">Page Synthèse & tendances - En développement</div>} />
            <Route path="emotions" element={<div className="p-8 text-center text-muted-foreground">Page IRC & Plutchik - En développement</div>} />
            <Route path="recommandations" element={<div className="p-8 text-center text-muted-foreground">Page Recommandations - En développement</div>} />
            <Route path="ressources" element={<div className="p-8 text-center text-muted-foreground">Page Ressources - En développement</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
