import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { eventData, messages } from "@/lib/data";
import { Heart, Brain, Smile, Frown, Star, AlertCircle } from "lucide-react";

export default function EmotionsPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Données Plutchik transformées
  const plutchikData = Object.entries(eventData.plutchik).map(([emotion, value]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    value: Math.round(value * 100),
    color: getEmotionColor(emotion)
  }));

  // Distribution charge émotionnelle
  const emotionalLoadData = [
    { load: 'Faible', count: 42, percentage: 25.8, color: '#39B36A' },
    { load: 'Modérée', count: 67, percentage: 41.1, color: '#FFC629' },
    { load: 'Forte', count: 54, percentage: 33.1, color: '#E35454' }
  ];

  // Score IRC décomposé
  const ircBreakdown = [
    { criterion: 'Intensité émotionnelle', score: 72, weight: 30 },
    { criterion: 'Richesse thématique', score: 68, weight: 25 },
    { criterion: 'Cohérence narrative', score: 61, weight: 25 },
    { criterion: 'Originalité', score: 58, weight: 20 }
  ];

  function getEmotionColor(emotion: string): string {
    const colors: { [key: string]: string } = {
      joy: '#FFC629',
      trust: '#39B36A', 
      sadness: '#8B5CF6',
      anticipation: '#2F66F5',
      anger: '#E35454',
      surprise: '#FF6B9D'
    };
    return colors[emotion] || '#8B5CF6';
  }

  function getEmotionIcon(emotion: string) {
    const icons: { [key: string]: any } = {
      joy: Smile,
      trust: Heart,
      sadness: Frown,
      anticipation: Star,
      anger: AlertCircle,
      surprise: Brain
    };
    const Icon = icons[emotion.toLowerCase()] || Heart;
    return <Icon className="h-4 w-4" />;
  }

  return (
    <>
      <title>Analyse IRC & Plutchik - JEP 2024 Archives Charente | Allo Corner Insight</title>
      <meta name="description" content="Analyse émotionnelle approfondie : score IRC 66, dominance joie (33%) et confiance (26%). Charge émotionnelle forte sur 33% des messages avec impact citoyen significatif." />
      <link rel="canonical" href="/emotions" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AnalysisNewsArticle",
          "headline": "Analyse IRC & Plutchik - Journées Européennes du Patrimoine 2024",
          "description": "Analyse émotionnelle des témoignages citoyens selon les modèles IRC et Plutchik",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "publisher": { "@type": "Organization", "name": "Archives de la Charente" },
          "datePublished": "2024-09-22",
          "about": {
            "@type": "Thing",
            "name": "Analyse émotionnelle Plutchik",
            "description": "Cartographie des émotions selon le modèle de Robert Plutchik"
          }
        })}
      </script>

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
            IRC & Plutchik
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyse émotionnelle approfondie des témoignages citoyens
          </p>
        </header>

        <Tabs defaultValue="irc" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="irc">Score IRC</TabsTrigger>
            <TabsTrigger value="plutchik">Modèle Plutchik</TabsTrigger>
            <TabsTrigger value="charge">Charge émotionnelle</TabsTrigger>
          </TabsList>

          <TabsContent value="irc" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score IRC global */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Score IRC Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {eventData.metrics.irc_score}
                      </div>
                      <Badge variant="secondary" className="absolute -top-2 -right-2">
                        /100
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Impact de Résonnance Citoyenne
                    </p>
                    <Progress value={eventData.metrics.irc_score} className="h-3" />
                    <div className="text-sm text-muted-foreground">
                      Score <span className="font-medium text-chart-positive">significatif</span> - 
                      Engagement citoyen fort
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Décomposition IRC */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Décomposition par critères</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ircBreakdown.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.criterion}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {item.score}/100
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.weight}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={item.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique IRC */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Répartition des scores IRC</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ircBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="criterion" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}/100`, 'Score']}
                      labelFormatter={(label) => `Critère: ${label}`}
                    />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plutchik" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Roue des émotions */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Roue des émotions Plutchik
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={plutchikData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        onMouseEnter={(data) => setSelectedEmotion(data.emotion)}
                        onMouseLeave={() => setSelectedEmotion(null)}
                      >
                        {plutchikData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={selectedEmotion === entry.emotion ? "#000" : "none"}
                            strokeWidth={selectedEmotion === entry.emotion ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Détail émotions */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Répartition détaillée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plutchikData
                      .sort((a, b) => b.value - a.value)
                      .map((emotion, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border transition-all cursor-pointer ${
                            selectedEmotion === emotion.emotion 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border bg-card hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedEmotion(
                            selectedEmotion === emotion.emotion ? null : emotion.emotion
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getEmotionIcon(emotion.emotion)}
                              <span className="font-medium">{emotion.emotion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold" style={{ color: emotion.color }}>
                                {emotion.value}%
                              </span>
                              <Badge variant="outline">#{index + 1}</Badge>
                            </div>
                          </div>
                          <Progress 
                            value={emotion.value} 
                            className="mt-2 h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charge" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution charge émotionnelle */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Charge émotionnelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={emotionalLoadData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        label={({ percentage }) => `${Math.round(percentage)}%`}
                      >
                        {emotionalLoadData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} messages (${props.payload.percentage}%)`, 
                          props.payload.load
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Exemples par charge */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Exemples représentatifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.slice(0, 3).map((message, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          message.emotional_load === 'high' 
                            ? 'border-l-chart-negative bg-red-50 dark:bg-red-950/10'
                            : message.emotional_load === 'medium'
                            ? 'border-l-chart-neutral bg-yellow-50 dark:bg-yellow-950/10'
                            : 'border-l-chart-positive bg-green-50 dark:bg-green-950/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge 
                            variant="outline"
                            className={
                              message.emotional_load === 'high' 
                                ? 'border-chart-negative text-chart-negative'
                                : message.emotional_load === 'medium'
                                ? 'border-chart-neutral text-chart-neutral'
                                : 'border-chart-positive text-chart-positive'
                            }
                          >
                            {message.emotional_load === 'high' ? 'Forte' : 
                             message.emotional_load === 'medium' ? 'Modérée' : 'Faible'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.filename}
                          </span>
                        </div>
                        <blockquote className="text-sm italic text-foreground">
                          "{message.quote}"
                        </blockquote>
                        <div className="flex gap-1 mt-2">
                          {message.emotions.map((emotion, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}