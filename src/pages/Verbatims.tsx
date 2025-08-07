import { useState } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { messages, themes } from "@/lib/data";
import { Search, Filter, Download } from "lucide-react";

export default function Verbatims() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
  const [selectedLoad, setSelectedLoad] = useState<string>("all");

  // Get unique emotions from all messages
  const allEmotions = Array.from(
    new Set(messages.flatMap(m => m.emotions))
  );

  // Filter messages based on current filters
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.transcript_txt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.quote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = selectedTheme === "all" || message.themes.includes(selectedTheme);
    const matchesEmotion = selectedEmotion === "all" || message.emotions.includes(selectedEmotion);
    const matchesLoad = selectedLoad === "all" || message.emotional_load === selectedLoad;
    
    return matchesSearch && matchesTheme && matchesEmotion && matchesLoad;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTheme("all");
    setSelectedEmotion("all");
    setSelectedLoad("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Verbatims</h1>
          <p className="text-muted-foreground">
            Écoute et analyse des messages vocaux collectés
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter la sélection
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Selects */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les thèmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les thèmes</SelectItem>
                {themes.map(theme => (
                  <SelectItem key={theme.name} value={theme.name}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les émotions" />
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

            <Select value={selectedLoad} onValueChange={setSelectedLoad}>
              <SelectTrigger>
                <SelectValue placeholder="Charge émotionnelle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les charges</SelectItem>
                <SelectItem value="high">Charge forte</SelectItem>
                <SelectItem value="medium">Charge moyenne</SelectItem>
                <SelectItem value="low">Charge faible</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </div>

          {/* Active filters display */}
          {(selectedTheme !== "all" || selectedEmotion !== "all" || selectedLoad !== "all" || searchTerm) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Recherche: "{searchTerm}"
                </Badge>
              )}
              {selectedTheme !== "all" && (
                <Badge variant="secondary">
                  Thème: {selectedTheme}
                </Badge>
              )}
              {selectedEmotion !== "all" && (
                <Badge variant="secondary">
                  Émotion: {selectedEmotion}
                </Badge>
              )}
              {selectedLoad !== "all" && (
                <Badge variant="secondary">
                  Charge: {selectedLoad}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} trouvé{filteredMessages.length > 1 ? 's' : ''}
          </h2>
        </div>

        {filteredMessages.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">Aucun message ne correspond aux critères sélectionnés.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Effacer les filtres
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <AudioPlayer key={message.filename} message={message} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}