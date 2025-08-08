import { useEffect } from "react";
import { eventData } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Contexte() {
  useEffect(() => {
    const title = `Contexte — ${eventData.client}`;
    const description = `Contexte et objectifs de l'événement ${eventData.title} (${eventData.dates}) organisé par ${eventData.client}.`; // <= 160 chars

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
        name: eventData.client,
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
  }, []);

  const stats = [
    { label: "Participants (estim.)", value: eventData.participants_estimated.toString() },
    { label: "Messages", value: eventData.metrics.messages_count.toString() },
    { label: "Durée totale", value: `${Math.round(eventData.metrics.total_duration_sec / 60)} min` },
    { label: "Taux de participation (estim.)", value: `${Math.round(eventData.metrics.participation_rate_estimated * 100)}%` },
  ];

  const objectifs = [
    "Sonder les représentations liées au Département de la Charente",
    "Recueillir la parole citoyenne durant les JEP 2024",
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contexte</h1>
        <p className="text-muted-foreground">
          {eventData.client} — {eventData.title} · {eventData.dates}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Contexte de la collecte</CardTitle>
              <CardDescription>Cadre et intention de la démarche</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-foreground/90">
                {eventData.context}
              </p>
            </CardContent>
          </Card>
        </article>

        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Événement</CardTitle>
              <CardDescription>Données clés</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between border-b last:border-b-0 pb-2 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{s.label}</dt>
                    <dd className="text-sm font-medium text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Objectifs</CardTitle>
            <CardDescription>Ce que nous cherchions à comprendre</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
              {objectifs.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
