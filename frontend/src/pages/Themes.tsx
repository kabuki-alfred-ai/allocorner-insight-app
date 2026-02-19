import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Theme, Message } from "@/lib/types";
import { useProject } from "@/hooks/use-projects";
import { useThemes } from "@/hooks/use-themes";
import { useMessages } from "@/hooks/use-messages";
import { ThemeSelector } from "@/components/themes/ThemeSelector";
import { ThemeSynthesis } from "@/components/themes/ThemeSynthesis";
import { MessageList } from "@/components/themes/MessageList";
import { Loader2, Tags } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function Themes() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId!);
  const { data: themesData, isLoading: themesLoading } = useThemes(projectId!);
  const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId!, { limit: 1000 });

  const themesList = themesData || [];
  const allMessages: Message[] = messagesData?.data || [];

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // SEO
  useEffect(() => {
    const clientName = project?.clientName || "";
    const projectTitle = project?.title || "";
    const title = `Analyse th\u00e9matique${clientName ? ` \u2014 ${clientName}` : ""}`;
    const description = `Exploration interactive des th\u00e9matiques: visualisations, synth\u00e8ses et messages audio${projectTitle ? ` pour ${projectTitle}` : ""}.`;

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

    // JSON-LD ItemList of themes
    const ld = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      description,
      itemListElement: [...themesList]
        .sort((a, b) => b.count - a.count)
        .map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          additionalProperty: [{ "@type": "PropertyValue", name: "count", value: t.count }],
        })),
    };
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.text = JSON.stringify(ld);
    document.head.appendChild(ldScript);

    return () => {
      if (ldScript && document.head.contains(ldScript)) document.head.removeChild(ldScript);
      if (metaDesc && !metaDesc.getAttribute("data-global")) {}
      if (canonical && !canonical.getAttribute("data-global")) {}
    };
  }, [project, themesList]);

  // Initialize with most frequent theme
  useEffect(() => {
    if (!selectedTheme && themesList.length > 0) {
      const sortedThemes = [...themesList].sort((a, b) => b.count - a.count);
      setSelectedTheme(sortedThemes[0]);
    }
  }, [selectedTheme, themesList]);

  const total = useMemo(() => themesList.reduce((s, t) => s + t.count, 0), [themesList]);

  if (themesLoading || messagesLoading) {
    return (
      <main className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-1000 pb-20">
      <PageHeader 
        title="Analyse Thématique"
        description={project?.title}
        badge={`${themesList.length} thèmes`}
        icon={<Tags className="h-5 w-5" />}
      />

      <div className="space-y-12">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Left column - Theme selector */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <ThemeSelector
                themes={themesList}
                selectedTheme={selectedTheme}
                onThemeSelect={setSelectedTheme}
                total={total}
              />
            </div>
          </aside>

          {/* Center column - Theme synthesis */}
          <section className="lg:col-span-5">
            <div className="sticky top-24">
              {selectedTheme && <ThemeSynthesis theme={selectedTheme} projectId={projectId!} />}
            </div>
          </section>

          {/* Right column - Messages list */}
          <section className="lg:col-span-4">
            <div className="sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-4">
              {selectedTheme && (
                <MessageList
                  theme={selectedTheme}
                  onThemeSelect={setSelectedTheme}
                  messages={allMessages}
                  allThemes={themesList}
                  projectId={projectId!}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
