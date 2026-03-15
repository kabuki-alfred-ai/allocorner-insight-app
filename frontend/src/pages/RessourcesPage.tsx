import { useState } from"react";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import { Download, FileText, Database, FolderDown } from"lucide-react";
import { PageHeader } from"@/components/PageHeader";
import { useResources } from"@/hooks/use-resources";
import { useProject } from"@/hooks/use-projects";
import { useParams } from"react-router-dom";
import { Loader2 } from"lucide-react";
import { downloadResource } from"@/lib/api/resources";
import { toast } from"sonner";

export default function RessourcesPage() {
 const { projectId } = useParams<{ projectId: string }>();
 const { data: project } = useProject(projectId!);
 const { data: resourcesData, isLoading } = useResources(projectId!);
 const [downloadingId, setDownloadingId] = useState<string | null>(null);

 const handleDownload = async (resourceId: string, title: string, type: string) => {
 setDownloadingId(resourceId);
 try {
 const blob = await downloadResource(projectId!, resourceId);
 const ext = type === 'CSV' ? 'csv' : type === 'PDF' ? 'pdf' : type.toLowerCase();
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download =`${title}.${ext}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 } catch {
 toast.error("Impossible de générer la ressource");
 } finally {
 setDownloadingId(null);
 }
 };

 const downloadResources = resourcesData?.map(r => ({
 id: r.id,
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
 {JSON.stringify({"@context":"https://schema.org","@type":"WebPage","name":"Ressources & Documentation","description":"Centre de ressources documentaires de l'étude Allo Corner","author": {"@type":"Organization","name":"Allo Corner" },"datePublished": new Date().toISOString().split('T')[0],"mainEntity": {"@type":"DataCatalog","name":"Ressources","description":"Collection de données et documents d'analyse"
 }
 })}
 </script>

 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
 {isLoading ? (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 </div>
 ) : (
 <>
 <PageHeader 
 title="Ressources"
 description={project?.title}
 icon={<FolderDown className="h-5 w-5" />}
 />

 <Card className="border-black/[0.03] shadow-sm rounded-3xl bg-card/50 backdrop-blur-sm overflow-hidden mx-2">
 <CardContent className="p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {downloadResources.map((resource) => (
 <div key={resource.id} className="p-4 rounded-2xl border border-black/5 hover:border-primary/20 transition-all duration-300 group bg-white/50">
 <div className="flex items-start gap-4">
 <div className={`p-3 rounded-xl bg-muted/50 ${resource.color} group-hover:scale-110 transition-transform duration-500`}>
 <resource.icon className="h-5 w-5" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors text-sm">
 {resource.title}
 </h3>
 <p className="text-[11px] font-medium text-muted-foreground/70 mb-2 line-clamp-2">
 {resource.description}
 </p>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Badge variant="outline" className="border-none bg-black/[0.03] text-[8px] font-semibold px-2 py-0.5 rounded-md">
 {resource.type}
 </Badge>
 <span className="text-[9px] font-semibold text-muted-foreground/85">
 {resource.size}
 </span>
 </div>
 <Button
 size="sm"
 variant="outline"
 disabled={downloadingId === resource.id}
 onClick={() => handleDownload(resource.id, resource.title, resource.type)}
 className="h-8 px-3 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-semibold text-[9px] disabled:opacity-70"
 >
 {downloadingId === resource.id ? (
 <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
 ) : (
 <Download className="h-3 w-3 mr-1.5" />
 )}
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
 </>
 )}
 </div>
 </>
 );
}
