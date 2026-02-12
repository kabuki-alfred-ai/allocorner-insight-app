import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { useObjectives } from "@/hooks/use-objectives";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Loader2, 
  Info, 
  Users, 
  MessageSquare, 
  Clock, 
  Activity, 
  Target, 
  CheckCircle2, 
  Lightbulb 
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { cn } from "@/lib/utils";

export default function Contexte() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading } = useProject(projectId || "");
  const { data: objectivesData, isLoading: objectivesLoading } = useObjectives(projectId || "");

  useEffect(() => {
    if (!project) return;

    const title = `Contexte — ${project.clientName}`;
    const description = `Contexte et objectifs de l'événement ${project.title} (${project.dates}) organisé par ${project.clientName}.`; // <= 160 chars

    document.title = title;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
      return tag;
    };

    const setCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
      return link;
    };

    const metaDesc = setMeta("description", description);
    const canonical = setCanonical(window.location.href);

    // Structured data (WebPage)
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: window.location.href,
      about: {
        "@type": "Organization",
        name: project.clientName,
      },
    };
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.text = JSON.stringify(ld);
    document.head.appendChild(ldScript);

    return () => {
      // Cleanup appended JSON-LD on unmount to avoid duplicates
      if (ldScript && document.head.contains(ldScript)) document.head.removeChild(ldScript);
      // Do not remove global meta/canonical if reused elsewhere
      if (metaDesc && !metaDesc.getAttribute("data-global")) {}
      if (canonical && !canonical.getAttribute("data-global")) {}
    };
  }, [project]);

  if (projectLoading || objectivesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Chargement...</p>
      </div>
    );
  }

  if (!project) return null;

  const stats = [
    { 
      title: "Participants", 
      value: project.participantsEstimated.toString(),
      subtitle: "Audience estimée de l'événement",
      icon: <Users className="h-4 w-4" />,
      className: "bg-theme-identite/5 border-theme-identite/10"
    },
    { 
      title: "Recueil Audio", 
      value: (project.metrics?.messagesCount ?? 0).toString(),
      subtitle: "Témoignages enregistrés",
      icon: <MessageSquare className="h-4 w-4" />,
      className: "bg-theme-fierte/5 border-theme-fierte/10",
      trend: "up" as const
    },
    { 
      title: "Matière Utile", 
      value: `${Math.round((project.metrics?.totalDurationSec ?? 0) / 60)} min`,
      subtitle: "Durée totale d'écoute",
      icon: <Clock className="h-4 w-4" />,
      className: "bg-theme-transmission/5 border-theme-transmission/10"
    },
    { 
      title: "Participation", 
      value: `${Math.round((project.metrics?.participationRate ?? 0) * 100)}%`,
      subtitle: "Taux de conversion audio",
      icon: <Activity className="h-4 w-4" />,
      className: "bg-theme-humour/5 border-theme-humour/10",
      trend: "up" as const
    },
  ];

  const objectives = objectivesData?.map(o => o.content) || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
      <PageHeader 
        title="Contexte"
        badge={project.dates}
        icon={<Info className="h-5 w-5" />}
      />

      <div className="space-y-12">
        {/* Key Metrics Row - Using MetricCard for consistency with home page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
          {stats.map((s) => (
            <MetricCard
              key={s.title}
              title={s.title}
              value={s.value}
              subtitle={s.subtitle}
              icon={s.icon}
              trend={s.trend}
              className={cn(
                "rounded-[2rem] border-black/[0.03] shadow-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-card", 
                s.className
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-primary/20" />
                  <h3 className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Le Projet</h3>
                </div>
                {project.logoKey && (
                  <div className="h-12 w-12 rounded-xl bg-white p-1.5 shadow-sm border border-black/5">
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
              </div>
              <p className="text-2xl font-bold leading-[1.4] text-foreground/90 tracking-tight">
                {project.context}
              </p>
            </section>

            <section className="p-12 rounded-[2.5rem] bg-black/[0.02] border border-black/[0.03] space-y-10 group hover:bg-black/[0.03] transition-all duration-500">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Méthodologie</h3>
                <p className="text-3xl font-black font-heading tracking-tight italic text-primary/80 leading-tight">
                  "{project.methodology}"
                </p>
              </div>
              <div className="pt-10 border-t border-black/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 text-muted-foreground/40">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Responsable d'étude</p>
                    <p className="text-sm font-bold text-foreground/80">{project.analyst}</p>
                  </div>
                </div>
                <div className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest italic group-hover:text-primary/40 transition-colors">
                  Analyse Experte
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <section className="space-y-8">
              <div className="px-2">
                <h3 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">Objectifs</h3>
              </div>
              <ul className="space-y-8 px-2">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex gap-5 group">
                    <div className="h-5 w-5 rounded-full border border-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/40 transition-colors duration-500">
                      <CheckCircle2 className="h-3 w-3 text-primary/20 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    <span className="text-sm font-semibold leading-relaxed text-foreground/50 group-hover:text-foreground/80 transition-colors duration-500">
                      {obj}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mx-2 p-8 rounded-[2rem] bg-primary/[0.02] border border-primary/5 flex items-start gap-4 hover:bg-primary/[0.04] transition-colors duration-500">
              <Lightbulb className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[9px] font-black text-primary/30 uppercase tracking-widest">Échantillonnage</p>
                <p className="text-[11px] font-black text-primary/60 leading-relaxed uppercase tracking-widest">
                  Analyse basée sur {project.metrics?.messagesCount ?? 0} témoignages audio exclusifs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
