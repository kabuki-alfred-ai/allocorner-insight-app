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
import { Search, Filter, Download, Loader2, AudioLines } from "lucide-react";
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

  // Get unique emotions from all messages
  const allEmotions = Array.from(
    new Set(allMessages.flatMap(m => m.messageEmotions?.map(me => me.emotionName) || []))
  );

  // Filter messages based on current filters
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
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-24">
      <PageHeader 
        title="Verbatims"
        description={project?.title}
        badge={`${filteredMessages.length} messages`}
        icon={<AudioLines className="h-5 w-5" />}
      />

      <div className="space-y-16">

        {/* Filters - Seamless premium row */}
        <div className="adl-card p-4 flex flex-col lg:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
            <Input
              placeholder="Rechercher par mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 border-none bg-black/[0.04] focus-visible:ring-1 focus-visible:ring-primary/10 text-sm font-bold placeholder:text-foreground/20 rounded-full transition-all"
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="h-14 w-full md:w-[220px] border-none bg-black/[0.04] hover:bg-black/[0.06] transition-all rounded-full text-[10px] font-black uppercase tracking-[0.2em] px-8">
                <SelectValue placeholder="Thème" />
              </SelectTrigger>
              <SelectContent className="rounded-[1.5rem] border-none bg-white/90 backdrop-blur-2xl">
                <SelectItem value="all" className="label-uppercase !text-primary/50">Tous les thèmes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme.id} value={theme.name} className="text-[11px] font-black uppercase tracking-widest py-3">
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger className="h-14 w-full md:w-[220px] border-none bg-black/[0.04] hover:bg-black/[0.06] transition-all rounded-full text-[10px] font-black uppercase tracking-[0.2em] px-8">
                <SelectValue placeholder="Émotion" />
              </SelectTrigger>
              <SelectContent className="rounded-[1.5rem] border-none bg-white/90 backdrop-blur-2xl">
                <SelectItem value="all" className="label-uppercase !text-primary/50">Toutes les émotions</SelectItem>
                {allEmotions.map(emotion => (
                  <SelectItem key={emotion} value={emotion} className="text-[11px] font-black uppercase tracking-widest py-3">
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedTheme !== "all" || selectedEmotion !== "all" || searchTerm) && (
              <Button 
                variant="ghost" 
                size="premium"
                onClick={clearFilters}
                className="h-14 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          <div className="px-6 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="label-uppercase">Bibliothèque</h3>
              <p className="text-2xl font-black text-foreground tracking-tighter">
                {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} identifié{filteredMessages.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="adl-card-flat py-32 flex flex-col items-center justify-center mx-2">
              <div className="p-6 bg-gradient-soft rounded-[2rem] mb-6">
                <AudioLines className="h-8 w-8 text-primary/20" />
              </div>
              <p className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Aucun message trouvé pour ces critères</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-2">
              {filteredMessages.map((message) => (
                <AudioPlayer key={message.id} message={message} projectId={projectId!} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
