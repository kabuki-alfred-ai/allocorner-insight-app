import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { eventData, themes, messages, trends } from "@/lib/data";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";

export default function Themes() {
  // SEO
  useEffect(() => {
    const title = `Analyse thématique — ${eventData.client}`;
    const description = `Analyse thématique des verbatims: répartition, top thèmes et verbatims représentatifs pour ${eventData.title}.`;

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

  const total = useMemo(() => themes.reduce((s, t) => s + t.count, 0), []);
  const chartData = useMemo(() => themes.map(t => ({
    name: t.name,
    shortName: t.name.length > 26 ? `${t.name.slice(0, 24)}…` : t.name,
    count: t.count,
    color: t.color,
  })), []);

  const sortedThemes = useMemo(() => [...themes].sort((a, b) => b.count - a.count), []);
  const top3 = sortedThemes.slice(0, 3);

  const reps = top3.map((t) => ({
    theme: t,
    message: messages.find(m => m.themes.includes(t.name))
  }));

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Analyse thématique</h1>
        <p className="text-muted-foreground">Répartition des thèmes et verbatims représentatifs</p>
      </header>

      {/* Distribution + Ranking */}
      <section className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Répartition thématique</CardTitle>
              <CardDescription>Nombre de messages par thème</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortName" interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value: number) => [`${value} messages`, "Messages"]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </article>

        <aside>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top thèmes</CardTitle>
              <CardDescription>Classement par volume</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thème</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Part</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedThemes.map((t) => (
                    <TableRow key={t.name}>
                      <TableCell className="max-w-[220px] truncate">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                          <span title={t.name}>{t.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{t.count}</TableCell>
                      <TableCell className="text-right">{Math.round((t.count / total) * 100)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </aside>
      </section>

      {/* Representative quotes */}
      <section>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Verbatims représentatifs</CardTitle>
            <CardDescription>Extraits pour les thèmes dominants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {reps.map(({ theme, message }) => (
                <div key={theme.name} className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.color }} />
                      <span className="font-medium">{theme.name}</span>
                    </div>
                    <Badge variant="secondary">{theme.count} msgs</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {message?.quote ?? "Aucun extrait disponible"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Frequent words */}
      <section>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Mots fréquents</CardTitle>
            <CardDescription>Indices récurrents dans les verbatims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trends.frequent_words.map((w: string) => (
                <Badge key={w} variant="outline">{w}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
