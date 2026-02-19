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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PageHeader 
        title="Verbatims"
        description={project?.title}
        badge={`${filteredMessages.length} messages`}
        icon={<AudioLines className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="premium" className="border-black/5 bg-white shadow-sm hover:bg-muted/50 transition-all">
            <Download className="h-3.5 w-3.5 mr-2 opacity-60" />
            Exporter
          </Button>
        }
      />

      <div className="space-y-12">

        {/* Filters - Seamless premium row */}
        <div className="premium-card p-3 flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-foreground/30" />
            <Input
              placeholder="Rechercher par mot-clé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 border-none bg-black/[0.03] focus-visible:ring-1 focus-visible:ring-primary/10 text-sm font-bold placeholder:text-foreground/30 rounded-[1.25rem] transition-all"
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="h-11 w-full md:w-[180px] border-none bg-black/[0.03] hover:bg-black/[0.05] transition-all rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] px-5">
                <SelectValue placeholder="Thème" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/5 shadow-elevated">
                <SelectItem value="all" className="label-uppercase !text-muted-foreground/40">Tous les thèmes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme.id} value={theme.name} className="text-xs font-bold">
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger className="h-11 w-full md:w-[180px] border-none bg-black/[0.03] hover:bg-black/[0.05] transition-all rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] px-5">
                <SelectValue placeholder="Émotion" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/5 shadow-elevated">
                <SelectItem value="all" className="label-uppercase !text-muted-foreground/40">Toutes les émotions</SelectItem>
                {allEmotions.map(emotion => (
                  <SelectItem key={emotion} value={emotion} className="text-xs font-bold">
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
                className="h-11 px-6 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="px-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Résultats</h3>
              <p className="text-sm font-bold text-foreground">
                {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} trouvé{filteredMessages.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-black/[0.01] rounded-[2.5rem] border border-dashed border-black/10">
              <AudioLines className="h-10 w-10 text-black/10 mb-4" />
              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Aucun message trouvé</p>
            </div>
          ) : (
            <div className="grid gap-4">
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
