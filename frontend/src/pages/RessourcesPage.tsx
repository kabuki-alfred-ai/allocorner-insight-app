import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Database, FolderDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useResources } from "@/hooks/use-resources";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function RessourcesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: resourcesData, isLoading } = useResources(projectId!);
  
  const downloadResources = resourcesData?.map(r => ({
    title: r.title,
    description: r.description,
    type: r.type,
    size: r.size,
    icon: r.type === 'PDF' ? FileText : r.type === 'CSV' ? Database : FileText,
    color: r.type === 'PDF' ? 'text-red-500' : r.type === 'CSV' ? 'text-green-500' : 'text-blue-500'
  })) || [];

  return (
    <>
      <title>Ressources & Documentation | Allo Corner Insight</title>
      <meta name="description" content="Accédez aux ressources complètes : rapports, datasets. Documentation méthodologique de l'étude." />
      <link rel="canonical" href="/ressources" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Ressources & Documentation",
          "description": "Centre de ressources documentaires de l'étude Allo Corner",
          "author": { "@type": "Organization", "name": "Allo Corner" },
          "datePublished": new Date().toISOString().split('T')[0],
          "mainEntity": {
            "@type": "DataCatalog",
            "name": "Ressources",
            "description": "Collection de données et documents d'analyse"
          }
        })}
      </script>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
        <PageHeader 
          title="Ressources"
          icon={<FolderDown className="h-6 w-6" />}
        />

        <div className="space-y-10">

        {/* Ressources téléchargeables */}
        <Card>
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
      </div>
      </>
        )}
    </div>
    </>
  );
}
