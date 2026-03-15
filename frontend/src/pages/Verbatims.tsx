import { useState } from "react";
import { useParams } from "react-router-dom";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { useMessages } from "@/hooks/use-messages";
import { useThemes } from "@/hooks/use-themes";
import { useProject } from "@/hooks/use-projects";
import type { Message } from "@/lib/types";
import { Search, Loader2, AudioLines, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function Verbatims() {
 const { projectId } = useParams<{ projectId: string }>();
 const { data: project } = useProject(projectId!);
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedTheme, setSelectedTheme] = useState<string>("all");
 const [selectedEmotion, setSelectedEmotion] = useState<string>("all");

 const { data: themesData } = useThemes(projectId!);
 const { data: messagesResponse, isLoading } = useMessages(projectId!, { limit: 1000 });

 const allMessages: Message[] = messagesResponse?.data || [];
 const themes = themesData || [];

 const allEmotions = Array.from(
 new Set(allMessages.flatMap(m => m.messageEmotions?.map(me => me.emotionName) || []))
 );

 const filteredMessages = allMessages.filter(message => {
 const matchesSearch = message.transcriptTxt.toLowerCase().includes(searchTerm.toLowerCase()) ||
 message.quote.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesTheme = selectedTheme === "all" || message.messageThemes?.some(mt => mt.theme.name === selectedTheme);
 const matchesEmotion = selectedEmotion === "all" || message.messageEmotions?.some(me => me.emotionName === selectedEmotion);

 return matchesSearch && matchesTheme && matchesEmotion;
 });

 const clearFilters = () => {
 setSearchTerm("");
 setSelectedTheme("all");
 setSelectedEmotion("all");
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-24">
 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
 </div>
 );
 }

 return (
 <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24 px-4 md:px-0">
 <PageHeader 
 title="Verbatims"
 description={project?.title}
 badge={`${filteredMessages.length} messages`}
 icon={<AudioLines className="h-5 w-5" />}
 />

 <div className="space-y-10">
 {/* Minimal filters - No border, no background until hover */}
 <div className="flex flex-col lg:flex-row gap-4 items-center">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Rechercher un témoignage..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9 h-10 bg-muted/50 border-transparent hover:bg-muted focus:bg-background focus:border-input transition-all font-sans text-sm text-foreground"
 />
 </div>
 
 <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full lg:w-auto">
 <Select value={selectedTheme} onValueChange={setSelectedTheme}>
 <SelectTrigger className="w-full md:w-[180px] h-10 bg-muted/50 border-transparent hover:bg-muted transition-all font-sans text-sm text-foreground">
 <SelectValue placeholder="Thème" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Tous les thèmes</SelectItem>
 {themes.map(theme => (
 <SelectItem key={theme.id} value={theme.name}>
 {theme.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
 <SelectTrigger className="w-full md:w-[180px] h-10 bg-muted/50 border-transparent hover:bg-muted transition-all font-sans text-sm text-foreground">
 <SelectValue placeholder="Émotion" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Toutes les émotions</SelectItem>
 {allEmotions.map(emotion => (
 <SelectItem key={emotion} value={emotion}>
 {emotion}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 {(selectedTheme !== "all" || selectedEmotion !== "all" || searchTerm) && (
 <Button 
 variant="ghost" 
 size="sm"
 onClick={clearFilters}
 className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50"
 >
 Réinitialiser
 </Button>
 )}
 </div>
 </div>

 {/* Results */}
 <div className="space-y-4">
 <div className="px-2 flex items-center justify-between">
 <div className="space-y-0.5">
 <h3 className="text-xs font-medium text-muted-foreground font-medium">Bibliothèque</h3>
 <p className="text-xl font-semibold text-foreground tracking-tight">
 {filteredMessages.length} résultat{filteredMessages.length > 1 ? "s" : ""}
 </p>
 </div>
 </div>

 {filteredMessages.length === 0 ? (
 <div className="bg-muted/20 border border-transparent rounded-xl p-12 flex flex-col items-center justify-center text-center">
 <AudioLines className="h-8 w-8 text-muted-foreground/20 mb-3" />
 <p className="text-sm font-medium text-muted-foreground/50">Aucun message trouvé</p>
 </div>
 ) : (
 <div className="flex flex-col">
 {/* Spotify-like Header Row */}
 <div className="hidden md:flex items-center gap-4 px-4 py-2 border-b border-border/50 mb-2">
 <div className="w-8 shrink-0 flex justify-center text-xs font-medium text-muted-foreground/70">#</div>
 <div className="flex-1 text-xs font-medium text-muted-foreground/70 font-medium">Titre / Speaker</div>
 <div className="w-[140px] hidden lg:block shrink-0 text-xs font-medium text-muted-foreground/70 font-medium">Intensité</div>
 <div className="w-10 shrink-0"></div>
 </div>
 
 <div className="flex flex-col">
 {filteredMessages.map((message, index) => (
 <AudioPlayer 
 key={message.id} 
 message={message} 
 projectId={projectId!} 
 index={index}
 />
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
