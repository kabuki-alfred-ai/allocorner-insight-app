import { useState } from "react";
import { useAddThemeKeyword, useRemoveThemeKeyword } from "@/hooks/use-theme-keywords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "@/lib/types";

interface ThemeKeywordsEditorProps {
  theme: Theme;
  projectId: string;
}

export function ThemeKeywordsEditor({ theme, projectId }: ThemeKeywordsEditorProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const addKeyword = useAddThemeKeyword(projectId);
  const removeKeyword = useRemoveThemeKeyword(projectId);

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;
    try {
      await addKeyword.mutateAsync({ themeId: theme.id, keyword: newKeyword.trim() });
      setNewKeyword("");
      toast.success("Mot-clé ajouté");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleRemove = async (keywordId: string) => {
    try {
      await removeKeyword.mutateAsync({ themeId: theme.id, keywordId });
      toast.success("Mot-clé supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nouveau mot-clé..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Button 
          onClick={handleAdd} 
          disabled={addKeyword.isPending || !newKeyword.trim()}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {theme.keywords?.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Aucun mot-clé associé
          </p>
        )}
        {theme.keywords?.map((keyword) => (
          <Badge
            key={keyword.id}
            variant="secondary"
            className="px-3 py-1 text-xs font-medium"
          >
            {keyword.keyword}
            <button
              onClick={() => handleRemove(keyword.id)}
              className="ml-2 hover:text-destructive"
              disabled={removeKeyword.isPending}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
