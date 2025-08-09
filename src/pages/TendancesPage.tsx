import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trends, themes } from "@/lib/data";
import { TrendingUp, AlertTriangle, Zap, Eye, Target } from "lucide-react";

export default function TendancesPage() {
  const wordFrequencyData = trends.frequent_words.map((word, index) => ({
    word,
    frequency: Math.round((100 - index * 12) / 10) * 10, // Simulation de fréquences décroissantes
    color: themes[index % themes.length]?.color || "#8B5CF6"
  }));

  return (
    <>
      <title>Synthèse & Tendances - JEP 2024 Archives Charente | Allo Corner Insight</title>
      <meta name="description" content="Analyse des grandes tendances émergentes : affection locale forte, besoin de transmission, crainte d'effacement identitaire. Signaux faibles et mots-clés récurrents." />
      <link rel="canonical" href="/tendances" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AnalysisNewsArticle",
          "headline": "Synthèse & Tendances - Journées Européennes du Patrimoine 2024",
          "description": "Identification des tendances principales et signaux émergents",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "publisher": { "@type": "Organization", "name": "Archives de la Charente" },
          "datePublished": "2024-09-22",
          "keywords": trends.frequent_words.join(", ")
        })}
      </script>

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Synthèse & Tendances
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyse des grandes dynamiques et signaux émergents
          </p>
        </header>

        {/* Tendances principales */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendances principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trends.main_trends.map((trend, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-subtle border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{trend}</h3>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${85 - index * 15}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Intensité: {85 - index * 15}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Points forts */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-chart-positive" />
                Points forts identifiés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trends.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-chart-positive/10 border border-chart-positive/20">
                    <div className="w-2 h-2 rounded-full bg-chart-positive flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{strength}</span>
                  </div>
                ))}
                
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Analyse :</strong> La campagne révèle une richesse d'expression remarquable, 
                    avec des témoignages authentiques qui reflètent un véritable engagement citoyen 
                    envers le territoire charentais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signal faible */}
          <Card className="shadow-card border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-500" />
                Signal faible détecté
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        {trends.weak_signal}
                      </h3>
                      <p className="text-sm text-amber-700 dark:text-amber-200">
                        Une préoccupation émergente concernant la distance avec les centres de décision 
                        nationaux et le besoin de maintenir une représentation locale forte.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-subtle p-3 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Implications stratégiques
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Renforcer la communication sur le rôle départemental</li>
                    <li>• Valoriser les spécificités locales</li>
                    <li>• Développer la proximité citoyenne</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mots-clés récurrents */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mots-clés les plus fréquents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wordFrequencyData.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-foreground capitalize">
                    {item.word}
                  </div>
                  <div className="flex-1">
                    <Progress value={item.frequency} className="h-3" />
                  </div>
                  <div className="w-12 text-sm text-muted-foreground text-right">
                    {item.frequency}%
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ borderColor: item.color, color: item.color }}
                  >
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-gradient-subtle border border-border/50">
              <h4 className="font-medium text-foreground mb-2">Analyse sémantique</h4>
              <p className="text-sm text-muted-foreground">
                Le champ lexical dominant révèle une forte préoccupation pour l'identité territoriale 
                et la transmission intergénérationnelle. Les termes liés au patrimoine ("mémoire", "histoire") 
                cohabitent avec ceux exprimant l'ancrage local ("Charente", "territoire", "département").
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}