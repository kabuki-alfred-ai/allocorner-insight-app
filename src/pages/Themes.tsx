import { useEffect, useState, useMemo } from "react";
import { eventData, themes, Theme } from "@/lib/data";
import { ThemeSelector } from "@/components/themes/ThemeSelector";
import { ThemeSynthesis } from "@/components/themes/ThemeSynthesis";
import { MessageList } from "@/components/themes/MessageList";

export default function Themes() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // SEO
  useEffect(() => {
    const title = `Analyse thématique — ${eventData.client}`;
    const description = `Exploration interactive des thématiques: visualisations, synthèses et messages audio pour ${eventData.title}.`;

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
      itemListElement: themes
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
  }, []);

  // Initialize with most frequent theme
  useEffect(() => {
    if (!selectedTheme && themes.length > 0) {
      const sortedThemes = [...themes].sort((a, b) => b.count - a.count);
      setSelectedTheme(sortedThemes[0]);
    }
  }, [selectedTheme]);

  const total = useMemo(() => themes.reduce((s, t) => s + t.count, 0), []);

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Analyse thématique</h1>
        <p className="text-muted-foreground">Exploration interactive des thèmes et messages</p>
      </header>

      {/* 3-column layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column - Theme selector */}
        <aside className="lg:col-span-3">
          <div className="sticky top-6">
            <ThemeSelector
              themes={themes}
              selectedTheme={selectedTheme}
              onThemeSelect={setSelectedTheme}
              total={total}
            />
          </div>
        </aside>

        {/* Center column - Theme synthesis */}
        <section className="lg:col-span-5">
          <div className="sticky top-6">
            {selectedTheme && <ThemeSynthesis theme={selectedTheme} />}
          </div>
        </section>

        {/* Right column - Messages list */}
        <section className="lg:col-span-4">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            {selectedTheme && <MessageList theme={selectedTheme} />}
          </div>
        </section>
      </div>
    </main>
  );
}
