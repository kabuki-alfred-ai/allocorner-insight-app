import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { eventData } from "@/lib/data";
import { Users, Clock, Target, TrendingUp, Heart, MessageSquare } from "lucide-react";

export default function ChiffresPage() {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgressValue(eventData.metrics.participation_rate_estimated * 100), 500);
    return () => clearTimeout(timer);
  }, []);

  const participationData = [
    { name: "Participants", value: eventData.metrics.participation_rate_estimated * 100, color: "hsl(var(--primary))" },
    { name: "Potentiel restant", value: (1 - eventData.metrics.participation_rate_estimated) * 100, color: "hsl(var(--muted))" }
  ];

  const durationDistribution = [
    { range: "0-30s", count: 42, percentage: 25.8 },
    { range: "30-60s", count: 67, percentage: 41.1 },
    { range: "60-90s", count: 38, percentage: 23.3 },
    { range: "90s+", count: 16, percentage: 9.8 }
  ];

  return (
    <>
      <title>Chiffres clés - JEP 2024 Archives Charente | Allo Corner Insight</title>
      <meta name="description" content="Analyse quantitative des 163 messages recueillis lors des Journées Européennes du Patrimoine 2024. Taux de participation de 81.5%, durée moyenne 54.5s, score IRC 66." />
      <link rel="canonical" href="/chiffres" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AnalysisNewsArticle",
          "headline": "Chiffres clés - Journées Européennes du Patrimoine 2024",
          "description": "Analyse quantitative complète des messages citoyens recueillis",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "publisher": { "@type": "Organization", "name": "Archives de la Charente" },
          "datePublished": "2024-09-22",
          "mainEntity": {
            "@type": "Dataset",
            "name": "Messages JEP 2024 Charente",
            "description": "163 messages audio analysés"
          }
        })}
      </script>

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Chiffres clés
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyse quantitative des {eventData.metrics.messages_count} messages recueillis
          </p>
        </header>

        {/* Métriques principales */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Messages recueillis"
            value={eventData.metrics.messages_count}
            icon={<MessageSquare className="h-4 w-4" />}
            trend="up"
            subtitle="Objectif dépassé"
          />
          
          <MetricCard
            title="Durée moyenne"
            value={`${eventData.metrics.avg_duration_sec}s`}
            icon={<Clock className="h-4 w-4" />}
            trend="neutral"
            subtitle="Engagement optimal"
          />
          
          <MetricCard
            title="Taux de participation"
            value={`${Math.round(eventData.metrics.participation_rate_estimated * 100)}%`}
            icon={<Users className="h-4 w-4" />}
            trend="up"
            badge="Excellent"
          />
          
          <MetricCard
            title="Score IRC"
            value={eventData.metrics.irc_score}
            icon={<TrendingUp className="h-4 w-4" />}
            trend="up"
            subtitle="Impact citoyen fort"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition participation */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Répartition de la participation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round(eventData.metrics.participation_rate_estimated * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sur {eventData.participants_estimated} participants estimés
                  </p>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={participationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Math.round(value as number)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribution durées */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Distribution des durées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={durationDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'count' ? `${value} messages` : `${value}%`,
                      name === 'count' ? 'Nombre' : 'Pourcentage'
                    ]}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Métriques émotionnelles */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Métriques émotionnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-positive mb-2">
                  {Math.round(eventData.metrics.high_emotion_share * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Messages à forte charge émotionnelle</p>
                <Progress value={eventData.metrics.high_emotion_share * 100} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {eventData.metrics.tonality_avg}/5
                </div>
                <p className="text-sm text-muted-foreground">Tonalité moyenne</p>
                <div className="flex justify-center mt-2">
                  <Badge variant="secondary">Positive</Badge>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-neutral mb-2">
                  {Math.round(eventData.metrics.total_duration_sec / 60)}min
                </div>
                <p className="text-sm text-muted-foreground">Durée totale d'écoute</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Soit {Math.round(eventData.metrics.total_duration_sec / 3600 * 10) / 10}h de contenu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}