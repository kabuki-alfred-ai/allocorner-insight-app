import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, FileText, Image, BarChart3, Headphones, Database, Code, Book, Video } from "lucide-react";

export default function RessourcesPage() {
  const downloadResources = [
    {
      title: "Rapport complet d'analyse",
      description: "Document PDF synthétisant l'ensemble des résultats et recommandations",
      type: "PDF",
      size: "2.4 MB",
      icon: FileText,
      color: "text-red-500"
    },
    {
      title: "Dataset des messages",
      description: "Fichier CSV avec métadonnées, transcriptions et classifications thématiques",
      type: "CSV",
      size: "456 KB", 
      icon: Database,
      color: "text-green-500"
    },
    {
      title: "Visualisations graphiques",
      description: "Package d'images haute résolution des graphiques et infographies",
      type: "ZIP",
      size: "8.2 MB",
      icon: Image,
      color: "text-blue-500"
    },
    {
      title: "Extraits audio sélectionnés",
      description: "15 messages représentatifs avec autorisation de diffusion",
      type: "ZIP",
      size: "12.8 MB",
      icon: Headphones,
      color: "text-purple-500"
    }
  ];

  const externalResources = [
    {
      title: "Méthodologie Allo Corner",
      description: "Documentation complète de l'approche et des outils utilisés",
      url: "https://allo-corner.com/methodologie",
      category: "Méthodologie"
    },
    {
      title: "Modèle Plutchik",
      description: "Référence académique sur la roue des émotions de Robert Plutchik",
      url: "https://fr.wikipedia.org/wiki/Roue_des_%C3%A9motions_de_Plutchik",
      category: "Recherche"
    },
    {
      title: "Archives départementales de la Charente",
      description: "Site officiel de l'institution organisatrice",
      url: "https://charente-archives.fr",
      category: "Institution"
    },
    {
      title: "Journées Européennes du Patrimoine",
      description: "Programme national de l'événement",
      url: "https://journeesdupatrimoine.culture.gouv.fr",
      category: "Événement"
    }
  ];

  const technicalSpecs = [
    {
      category: "Collecte audio",
      details: [
        "Format : MP3, qualité 128 kbps",
        "Durée moyenne : 54.5 secondes",
        "Dispositif : Borne interactive tactile",
        "Période : 21-22 septembre 2024"
      ]
    },
    {
      category: "Transcription",
      details: [
        "Méthode : IA + vérification humaine",
        "Taux de précision : 94.2%",
        "Langue : Français (dialecte charentais inclus)",
        "Anonymisation automatique"
      ]
    },
    {
      category: "Analyse thématique",
      details: [
        "Classification semi-automatique",
        "5 thèmes principaux identifiés",
        "Validation par double codage",
        "Coefficient de fiabilité : 0.89"
      ]
    },
    {
      category: "Analyse émotionnelle",
      details: [
        "Modèle Plutchik (6 émotions)",
        "Score IRC propriétaire",
        "Classification charge émotionnelle",
        "Validation par expert psychologue"
      ]
    }
  ];

  return (
    <>
      <title>Ressources & Documentation - JEP 2024 Archives Charente | Allo Corner Insight</title>
      <meta name="description" content="Accédez aux ressources complètes : rapport PDF, dataset CSV, visualisations, extraits audio. Documentation méthodologique et spécifications techniques de l'étude." />
      <link rel="canonical" href="/ressources" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Ressources & Documentation JEP 2024",
          "description": "Centre de ressources documentaires de l'étude Allo Corner",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "publisher": { "@type": "Organization", "name": "Archives de la Charente" },
          "datePublished": "2024-09-22",
          "mainEntity": {
            "@type": "DataCatalog",
            "name": "Ressources JEP 2024",
            "description": "Collection de données et documents d'analyse"
          }
        })}
      </script>

      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Ressources
          </h1>
          <p className="text-muted-foreground mt-2">
            Documentation complète et ressources téléchargeables
          </p>
        </header>

        {/* Ressources téléchargeables */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Ressources téléchargeables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {downloadResources.map((resource, index) => (
                <div key={index} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${resource.color}`}>
                      <resource.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{resource.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {resource.size}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liens externes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Liens et références externes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {externalResources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">
                        {resource.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Accéder
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spécifications techniques */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Spécifications techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {technicalSpecs.map((spec, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {spec.category}
                  </h3>
                  <ul className="space-y-2">
                    {spec.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                  {index < technicalSpecs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Note légale */}
        <Card className="shadow-card border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Book className="h-5 w-5" />
              Notes légales et usage
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Confidentialité :</strong> Tous les messages ont été anonymisés. 
              Aucune donnée personnelle identifiante n'est conservée ou diffusée.
            </p>
            <p>
              <strong>Droits d'usage :</strong> Les ressources sont mises à disposition 
              sous licence Creative Commons BY-NC-SA 4.0 pour usage non commercial.
            </p>
            <p>
              <strong>Citation :</strong> Pour toute utilisation, merci de citer : 
              "Étude Allo Corner - JEP 2024, Archives départementales de la Charente"
            </p>
            <p>
              <strong>Contact :</strong> Pour toute question sur les données ou la méthodologie, 
              contactez l'équipe Allo Corner via le formulaire de contact du site institutionnel.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}