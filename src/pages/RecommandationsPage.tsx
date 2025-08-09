import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recommendations } from "@/lib/data";
import { Lightbulb, Target, Calendar, Users, Monitor, Share2, Star, Clock, TrendingUp } from "lucide-react";

export default function RecommandationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(recommendations.map(r => r.category))];
  
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-chart-positive border-chart-positive';
      case 2: return 'text-chart-neutral border-chart-neutral';
      case 3: return 'text-chart-negative border-chart-negative';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Facile';
      case 2: return 'Modéré';
      case 3: return 'Complexe';
      default: return 'Non défini';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Communication': Share2,
      'Numérique': Monitor,
      'Médiation': Users,
      'Participation': Target
    };
    const Icon = icons[category] || Lightbulb;
    return <Icon className="h-4 w-4" />;
  };

  const filteredRecommendations = selectedCategory 
    ? recommendations.filter(r => r.category === selectedCategory)
    : recommendations;

  // Recommandations stratégiques supplémentaires
  const strategicActions = [
    {
      title: "Créer une archive numérique permanente",
      description: "Développer une plateforme web dédiée pour conserver et valoriser ces témoignages",
      priority: "Haute",
      timeline: "3-6 mois",
      resources: "Développement web, design UX"
    },
    {
      title: "Organiser des temps d'écoute collectifs",
      description: "Proposer des sessions publiques d'écoute et d'échange autour des messages",
      priority: "Moyenne",
      timeline: "1-3 mois",
      resources: "Animation, logistique événementielle"
    },
    {
      title: "Développer une méthodologie reproductible",
      description: "Formaliser le processus Allo Corner pour d'autres collectivités",
      priority: "Moyenne",
      timeline: "6-12 mois",
      resources: "Recherche, documentation"
    }
  ];

  return (
    <>
      <title>Recommandations stratégiques - JEP 2024 Archives Charente | Allo Corner Insight</title>
      <meta name="description" content="4 recommandations actionables : valoriser l'attachement territorial, créer un espace de transmission, intégrer les extraits dans une exposition, inclure les publics éloignés." />
      <link rel="canonical" href="/recommandations" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ActionPlan",
          "name": "Recommandations stratégiques JEP 2024",
          "description": "Plan d'actions basé sur l'analyse des témoignages citoyens",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "dateCreated": "2024-09-22",
          "actionOption": recommendations.map(rec => ({
            "@type": "Action",
            "name": rec.title,
            "description": rec.objective,
            "category": rec.category
          }))
        })}
      </script>

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Recommandations
          </h1>
          <p className="text-muted-foreground mt-2">
            Actions stratégiques basées sur l'analyse des témoignages
          </p>
        </header>

        <Tabs defaultValue="operationnelles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="operationnelles">Actions opérationnelles</TabsTrigger>
            <TabsTrigger value="strategiques">Vision stratégique</TabsTrigger>
          </TabsList>

          <TabsContent value="operationnelles" className="space-y-6">
            {/* Filtres par catégorie */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Filtrer par catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Toutes ({recommendations.length})
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="flex items-center gap-2"
                    >
                      {getCategoryIcon(category)}
                      {category} ({recommendations.filter(r => r.category === category).length})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Liste des recommandations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRecommendations.map((rec, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">
                        {rec.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {[...Array(rec.difficulty)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${getDifficultyColor(rec.difficulty).split(' ')[0]}`} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {rec.objective}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(rec.category)}
                          {rec.category}
                        </Badge>
                        
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(rec.difficulty)}
                        >
                          {getDifficultyLabel(rec.difficulty)}
                        </Badge>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <h4 className="font-medium text-sm text-foreground mb-2">Actions suggérées :</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rec.category === 'Communication' && (
                            <>
                              <li>• Créer une campagne valorisant les extraits les plus marquants</li>
                              <li>• Développer des contenus visuels avec les citations</li>
                            </>
                          )}
                          {rec.category === 'Numérique' && (
                            <>
                              <li>• Concevoir une interface de consultation intuitive</li>
                              <li>• Intégrer des fonctionnalités de partage et commentaires</li>
                            </>
                          )}
                          {rec.category === 'Médiation' && (
                            <>
                              <li>• Sélectionner 10-15 extraits représentatifs</li>
                              <li>• Créer des supports d'interprétation contextuels</li>
                            </>
                          )}
                          {rec.category === 'Participation' && (
                            <>
                              <li>• Organiser des sessions dans différents quartiers</li>
                              <li>• Adapter la communication aux publics cibles</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="strategiques" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {strategicActions.map((action, index) => (
                <Card key={index} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        {action.title}
                      </CardTitle>
                      <Badge 
                        variant={action.priority === 'Haute' ? 'destructive' : 'secondary'}
                      >
                        Priorité {action.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        {action.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Timeline :</strong> {action.timeline}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <strong>Ressources :</strong> {action.resources}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Synthèse stratégique */}
            <Card className="shadow-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Synthèse stratégique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-foreground">
                    L'analyse des 163 témoignages révèle un potentiel d'engagement citoyen exceptionnel. 
                    Les recommandations s'articulent autour de trois axes majeurs :
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Valorisation</h4>
                      <p className="text-sm text-muted-foreground">
                        Exploiter la richesse émotionnelle des témoignages pour renforcer l'attachement territorial
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Conservation</h4>
                      <p className="text-sm text-muted-foreground">
                        Pérenniser cette mémoire collective dans des supports durables et accessibles
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Extension</h4>
                      <p className="text-sm text-muted-foreground">
                        Élargir la démarche à d'autres publics et territoires pour amplifier l'impact
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}