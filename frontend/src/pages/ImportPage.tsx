import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileArchive, FileText, Image, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface UploadState {
  file: File | null;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
}

interface FileUploadZoneProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accept: string;
  required: boolean;
  state: UploadState;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

const FileUploadZone = ({
  title,
  description,
  icon,
  accept,
  required,
  state,
  onFileSelect,
  onRemove,
}: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const getStatusColor = () => {
    switch (state.status) {
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-950/20";
      case "error":
        return "border-destructive bg-destructive/10";
      case "uploading":
        return "border-primary bg-primary/5";
      default:
        return isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50";
    }
  };

  return (
    <Card className={`transition-all duration-200 ${getStatusColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {title}
                {required && <span className="text-destructive text-sm">*</span>}
              </CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          {state.status === "success" && (
            <div className="flex items-center gap-1 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Validé</span>
            </div>
          )}
          {state.status === "error" && (
            <div className="flex items-center gap-1 text-destructive">
              <X className="h-4 w-4" />
              <span className="text-sm font-medium">Erreur</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {state.file ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3 min-w-0">
              {state.status === "uploading" ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : state.status === "success" ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-sm font-medium truncate">{state.file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(state.file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">
              Glissez-déposez ou cliquez pour sélectionner
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Formats acceptés : {accept.replace(/\./g, "").toUpperCase()}
            </span>
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        )}
        {state.error && (
          <p className="text-sm text-destructive mt-2">{state.error}</p>
        )}
      </CardContent>
    </Card>
  );
};

const ImportPage = () => {
  const navigate = useNavigate();
  const [zipState, setZipState] = useState<UploadState>({
    file: null,
    status: "idle",
  });
  const [pdfState, setPdfState] = useState<UploadState>({
    file: null,
    status: "idle",
  });
  const [logoState, setLogoState] = useState<UploadState>({
    file: null,
    status: "idle",
  });

  const validateFile = (file: File, type: "zip" | "pdf" | "logo"): string | null => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (file.size > maxSize) {
      return "Le fichier est trop volumineux (max 100MB)";
    }

    switch (type) {
      case "zip":
        if (!file.name.endsWith(".zip")) {
          return "Le fichier doit être au format ZIP";
        }
        break;
      case "pdf":
        if (!file.name.endsWith(".pdf")) {
          return "Le fichier doit être au format PDF";
        }
        break;
      case "logo": {
        const validExtensions = [".png", ".jpg", ".jpeg"];
        if (!validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
          return "Le fichier doit être au format PNG, JPG ou JPEG";
        }
        break;
      }
    }
    return null;
  };

  const handleFileSelect = (
    file: File,
    type: "zip" | "pdf" | "logo",
    setState: React.Dispatch<React.SetStateAction<UploadState>>
  ) => {
    const error = validateFile(file, type);
    if (error) {
      setState({ file: null, status: "error", error });
      toast.error(error);
      return;
    }

    setState({ file, status: "uploading" });
    
    // Simulate upload process
    setTimeout(() => {
      setState({ file, status: "success" });
      toast.success(`${file.name} importé avec succès`);
    }, 1000);
  };

  const handleRemove = (setState: React.Dispatch<React.SetStateAction<UploadState>>) => {
    setState({ file: null, status: "idle" });
  };

  const canSubmit = zipState.status === "success" && pdfState.status === "success";

  const handleVisualize = () => {
    if (!canSubmit) return;
    
    // Store file references for the visualization page
    // In a real app, you would upload these to a server and get URLs back
    toast.success("Chargement du reporting...");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Import du Reporting Allo Corner
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Importez les fichiers nécessaires pour visualiser votre rapport d'analyse.
            Les champs marqués d'un * sont obligatoires.
          </p>
        </div>

        <div className="space-y-6">
          <FileUploadZone
            title="Dossier ZIP des ressources"
            description="Fichiers audio (.mp3, .wav, .m4a) et transcriptions (.txt)"
            icon={<FileArchive className="h-5 w-5" />}
            accept=".zip"
            required={true}
            state={zipState}
            onFileSelect={(file) => handleFileSelect(file, "zip", setZipState)}
            onRemove={() => handleRemove(setZipState)}
          />

          <FileUploadZone
            title="PDF du Reporting"
            description="Rapport d'analyse final avec synthèse, graphiques et indicateurs"
            icon={<FileText className="h-5 w-5" />}
            accept=".pdf"
            required={true}
            state={pdfState}
            onFileSelect={(file) => handleFileSelect(file, "pdf", setPdfState)}
            onRemove={() => handleRemove(setPdfState)}
          />

          <FileUploadZone
            title="Logo client"
            description="Logo pour personnaliser l'en-tête du reporting"
            icon={<Image className="h-5 w-5" />}
            accept=".png,.jpg,.jpeg"
            required={false}
            state={logoState}
            onFileSelect={(file) => handleFileSelect(file, "logo", setLogoState)}
            onRemove={() => handleRemove(setLogoState)}
          />
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            size="lg"
            disabled={!canSubmit}
            onClick={handleVisualize}
            className="px-8"
          >
            Visualiser le reporting
          </Button>
        </div>

        {!canSubmit && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Veuillez importer le fichier ZIP et le PDF pour continuer
          </p>
        )}
      </div>
    </div>
  );
};

export default ImportPage;
