import { useEffect, useState, useRef, useCallback } from"react";
import { useParams, useNavigate } from"react-router-dom";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import { useForm } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { z } from"zod";
import { toast } from"sonner";
import {
 ArrowLeft,
 Upload,
 FileArchive,
 Loader2,
 Pencil,
 Trash2,
 ChevronLeft,
 ChevronRight,
 Settings,
 AudioLines,
 Play,
 Pause,
 Check,
 AlertCircle,
 Clock,
 RotateCw,
 FileAudio,
 Square,
 CheckSquare,
} from"lucide-react";

import {
 getMessages,
 createMessage,
 bulkUploadMessages,
 updateMessage,
 deleteMessage,
 bulkDeleteMessages,
 triggerProcessing,
 retryProcessing,
 processBulk,
 retryAllFailed,
} from"@/lib/api/messages";
import { useProject } from"@/hooks/use-projects";
import type { Message, Tone, ProcessingStatus, SpeakerProfile } from"@/lib/types";

import { cn } from"@/lib/utils";
import { PageHeader } from"@/components/PageHeader";

import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Badge } from"@/components/ui/badge";
import { Label } from"@/components/ui/label";
import { Separator } from"@/components/ui/separator";
import { Skeleton } from"@/components/ui/skeleton";
import { Progress } from"@/components/ui/progress";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from"@/components/ui/card";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import {
 Form,
 FormField,
} from"@/components/ui/form";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const PAGE_LIMIT = 50;

const TONE_OPTIONS: { value: Tone; label: string }[] = [
 { value:"POSITIVE", label:"Positive" },
 { value:"NEGATIVE", label:"Négative" },
 { value:"NEUTRAL", label:"Neutre" },
];


const speakerProfileLabel: Record<SpeakerProfile, string> = {
 CHILD: "Enfant",
 TEENAGER: "Adolescent(e)",
 TEENAGER_GIRL: "Adolescente",
 TEENAGER_BOY: "Adolescent",
 YOUNG_ADULT: "Jeune adulte",
 YOUNG_WOMAN: "Jeune femme",
 YOUNG_MAN: "Jeune homme",
 ADULT: "Adulte",
 ADULT_WOMAN: "Femme adulte",
 ADULT_MAN: "Homme adulte",
 SENIOR: "Senior",
 SENIOR_WOMAN: "Femme senior",
 SENIOR_MAN: "Homme senior",
 PROFESSIONAL: "Professionnel",
 PARENT: "Parent",
 STUDENT: "Étudiant(e)",
 OTHER: "Autre",
};

const speakerProfileColor: Record<SpeakerProfile, string> = {
 CHILD: "bg-yellow-400/10 text-yellow-600",
 TEENAGER: "bg-lime-400/10 text-lime-600",
 TEENAGER_GIRL: "bg-pink-500/10 text-pink-600",
 TEENAGER_BOY: "bg-sky-400/10 text-sky-600",
 YOUNG_ADULT: "bg-cyan-400/10 text-cyan-600",
 YOUNG_WOMAN: "bg-fuchsia-500/10 text-fuchsia-600",
 YOUNG_MAN: "bg-blue-400/10 text-blue-500",
 ADULT: "bg-slate-400/10 text-slate-600",
 ADULT_WOMAN: "bg-violet-500/10 text-violet-600",
 ADULT_MAN: "bg-blue-600/10 text-blue-700",
 SENIOR: "bg-amber-400/10 text-amber-700",
 SENIOR_WOMAN: "bg-rose-400/10 text-rose-600",
 SENIOR_MAN: "bg-indigo-500/10 text-indigo-700",
 PROFESSIONAL: "bg-emerald-500/10 text-emerald-700",
 PARENT: "bg-orange-400/10 text-orange-600",
 STUDENT: "bg-teal-400/10 text-teal-600",
 OTHER: "bg-muted text-muted-foreground/60",
};

const toneLabel: Record<Tone, string> = {
 POSITIVE: "Positif",
 NEGATIVE: "Négatif",
 NEUTRAL: "Neutre",
};

const toneColor: Record<Tone, string> = {
 POSITIVE: "bg-green-500/10 text-green-600",
 NEGATIVE: "bg-red-500/10 text-red-600",
 NEUTRAL: "bg-muted text-muted-foreground/60",
};

// ──────────────────────────────────────────────
// Edit form schema
// ──────────────────────────────────────────────

const SPEAKER_PROFILE_OPTIONS: { value: SpeakerProfile; label: string }[] = [
 { value: "CHILD", label: "Enfant" },
 { value: "TEENAGER", label: "Adolescent(e)" },
 { value: "TEENAGER_GIRL", label: "Adolescente" },
 { value: "TEENAGER_BOY", label: "Adolescent" },
 { value: "YOUNG_ADULT", label: "Jeune adulte" },
 { value: "YOUNG_WOMAN", label: "Jeune femme" },
 { value: "YOUNG_MAN", label: "Jeune homme" },
 { value: "ADULT", label: "Adulte" },
 { value: "ADULT_WOMAN", label: "Femme adulte" },
 { value: "ADULT_MAN", label: "Homme adulte" },
 { value: "SENIOR", label: "Senior" },
 { value: "SENIOR_WOMAN", label: "Femme senior" },
 { value: "SENIOR_MAN", label: "Homme senior" },
 { value: "PROFESSIONAL", label: "Professionnel(le)" },
 { value: "PARENT", label: "Parent" },
 { value: "STUDENT", label: "Étudiant(e)" },
 { value: "OTHER", label: "Autre" },
];

const editMessageSchema = z.object({
 speaker: z.string().optional().default(""),
 speakerProfile: z.enum([
   "CHILD","TEENAGER","TEENAGER_GIRL","TEENAGER_BOY",
   "YOUNG_ADULT","YOUNG_WOMAN","YOUNG_MAN",
   "ADULT","ADULT_WOMAN","ADULT_MAN",
   "SENIOR","SENIOR_WOMAN","SENIOR_MAN",
   "PROFESSIONAL","PARENT","STUDENT","OTHER",
 ] as const).optional(),
 transcriptTxt: z.string().optional().default(""),
 tone: z.enum(["POSITIVE","NEGATIVE","NEUTRAL"]).default("NEUTRAL"),
});

type EditMessageValues = z.infer<typeof editMessageSchema>;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function FeatureItem({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
 return (
 <div className="flex gap-4 group/item">
 <div className="w-10 h-10 rounded-xl bg-white border border-input flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-300 flex-shrink-0 shadow-sm">
 {icon}
 </div>
 <div>
 <p className="text-[10px] font-semibold text-foreground/80 mb-0.5">{label}</p>
 <p className="text-[9px] font-medium text-muted-foreground/50 leading-relaxed">{desc}</p>
 </div>
 </div>
 );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function AdminMessagesPage() {
 const { projectId } = useParams<{ projectId: string }>();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const { data: project } = useProject(projectId!);

 const [page, setPage] = useState(1);
 const [editingMessage, setEditingMessage] = useState<Message | null>(null);
 const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
 const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
 const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
 const audioRef = useRef<HTMLAudioElement | null>(null);

 // Upload refs
 const zipInputRef = useRef<HTMLInputElement>(null);

 // Bulk upload state
 const [zipFile, setZipFile] = useState<File | null>(null);

 const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
 const [uploadStatuses, setUploadStatuses] = useState<
 Record<string,"pending" |"uploading" |"success" |"error">
 >({});
 const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
 const [isDragging, setIsDragging] = useState(false);
 const multipleInputRef = useRef<HTMLInputElement>(null);

 // ── Fetch messages ──

 const messagesQuery = useQuery({
 queryKey: ["messages", projectId, page],
 queryFn: () => getMessages(projectId!, { page, limit: PAGE_LIMIT }),
 enabled: !!projectId,
 staleTime: 0, // Force refresh
 refetchInterval: (query) => {
 // Auto-refresh every 5 seconds if there are active jobs
 const hasActive = query.state.data?.data.some((m: Message) =>
 ["QUEUED","PROCESSING"].includes(m.processingStatus)
 );
 return hasActive ? 5000 : false;
 },
 });

 const messages = messagesQuery.data?.data || [];
 const totalPages = messagesQuery.data?.totalPages || 1;

 // Calculate status counts
 const pendingCount = messages.filter((m) => m.processingStatus ==="PENDING").length;
 const processingCount = messages.filter((m) =>
 ["QUEUED","PROCESSING"].includes(m.processingStatus)
 ).length;
 const failedCount = messages.filter((m) => m.processingStatus ==="FAILED").length;



 // ── Bulk upload mutation ──

 const bulkMutation = useMutation({
 mutationFn: (formData: FormData) => bulkUploadMessages(projectId!, formData),
 onSuccess: (result) => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
 toast.success(`${result.length} message(s) importe(s) avec succes`);
 setZipFile(null);
 if (zipInputRef.current) zipInputRef.current.value ="";
 },
 onError: (error: Error) => {
 toast.error(`Erreur lors de l'import en masse : ${error.message}`);
 },
 });

 // ── Update mutation ──

 const updateMutation = useMutation({
 mutationFn: ({ messageId, data }: { messageId: string; data: EditMessageValues }) =>
 updateMessage(projectId!, messageId, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
 toast.success("Message mis a jour");
 setEditingMessage(null);
 },
 onError: (error: Error) => {
 toast.error(`Erreur de mise a jour : ${error.message}`);
 },
 });

 // ── Delete mutation ──

 const deleteMutation = useMutation({
 mutationFn: (messageId: string) => deleteMessage(projectId!, messageId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
 toast.success("Message supprime");
 setDeletingMessage(null);
 },
 onError: (error: Error) => {
 toast.error(`Erreur de suppression : ${error.message}`);
 },
 });

 // ── Bulk delete mutation ──

 const bulkDeleteMutation = useMutation({
 mutationFn: (ids: string[]) => bulkDeleteMessages(projectId!, ids),
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
 toast.success(`${data.deleted} verbatim(s) supprimé(s)`);
 setSelectedIds(new Set());
 setShowBulkDeleteConfirm(false);
 },
 onError: (error: Error) => {
 toast.error(`Erreur de suppression : ${error.message}`);
 },
 });

 // ── Processing mutations ──

 const retryMutation = useMutation({
 mutationFn: (messageId: string) => retryProcessing(projectId!, messageId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 toast.success("Traitement relance");
 },
 onError: (error: Error) => {
 toast.error(`Erreur : ${error.message}`);
 },
 });

 const processBulkMutation = useMutation({
 mutationFn: () => processBulk(projectId!),
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 toast.success(data.message);
 },
 onError: (error: Error) => {
 toast.error(`Erreur : ${error.message}`);
 },
 });

 const retryAllFailedMutation = useMutation({
 mutationFn: () => retryAllFailed(projectId!),
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 toast.success(data.message);
 },
 onError: (error: Error) => {
 toast.error(`Erreur : ${error.message}`);
 },
 });

 // ── Handlers ──



 const handleBulkUpload = useCallback(() => {
 if (!zipFile) {
 toast.error("Veuillez selectionner un fichier ZIP");
 return;
 }

 const formData = new FormData();
 formData.append("zip", zipFile);

 bulkMutation.mutate(formData);
 }, [zipFile, bulkMutation]);



 const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) setZipFile(file);
 };

 // Handle drag and drop
 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(true);
 };

 const handleDragLeave = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 
 const files = Array.from(e.dataTransfer.files).filter(file => 
 file.type.includes('audio') || 
 ['.mp3', '.wav', '.m4a'].some(ext => file.name.toLowerCase().endsWith(ext))
 );

 if (files.length > 0) {
 setSelectedFiles(prev => [...prev, ...files]);
 const statuses = { ...uploadStatuses };
 files.forEach(file => { statuses[file.name] ="pending"; });
 setUploadStatuses(statuses);
 }
 };

 // Handle multiple files selection
 const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []);
 setSelectedFiles(prev => [...prev, ...files]);

 // Initialize statuses
 const statuses = { ...uploadStatuses };
 files.forEach((file) => {
 statuses[file.name] ="pending";
 });
 setUploadStatuses(statuses);
 };

 // Handle multiple files upload
 const handleUploadMultiple = async () => {
 const filesToUpload = selectedFiles.filter(f => uploadStatuses[f.name] ==="pending" || uploadStatuses[f.name] ==="error");
 if (filesToUpload.length === 0) return;

 const CONCURRENT_UPLOADS = 5;
 setUploadProgress({ completed: 0, total: filesToUpload.length });

 const uploadFile = async (file: File) => {
 try {
 setUploadStatuses((prev) => ({ ...prev, [file.name]:"uploading" }));

 const formData = new FormData();
 formData.append("audio", file);
 formData.append("filename", file.name);
 formData.append("speaker",""); 
 formData.append("transcriptTxt",""); 

 await createMessage(projectId!, formData);

 setUploadStatuses((prev) => ({ ...prev, [file.name]:"success" }));
 setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
 } catch (error) {
 console.error(`Erreur upload ${file.name}:`, error);
 setUploadStatuses((prev) => ({ ...prev, [file.name]:"error" }));
 setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
 }
 };

 for (let i = 0; i < filesToUpload.length; i += CONCURRENT_UPLOADS) {
 const batch = filesToUpload.slice(i, i + CONCURRENT_UPLOADS);
 await Promise.all(batch.map(uploadFile));
 }

 queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
 toast.success("Upload des fichiers terminé");
 
 // Clear only successful uploads
 setSelectedFiles(prev => prev.filter(f => uploadStatuses[f.name] !=="success"));
 if (multipleInputRef.current) multipleInputRef.current.value ="";
 };

 const removeFile = (index: number) => {
 const fileToRemove = selectedFiles[index];
 setSelectedFiles(prev => prev.filter((_, i) => i !== index));
 const newStatuses = { ...uploadStatuses };
 delete newStatuses[fileToRemove.name];
 setUploadStatuses(newStatuses);
 };

 const formatDuration = (seconds: number | null): string => {
 if (seconds === null || seconds === undefined) return"-";
 const mins = Math.floor(seconds / 60);
 const secs = Math.round(seconds % 60);
 return`${mins}:${secs.toString().padStart(2,"0")}`;
 };

 // Get audio URL for a message
 const getAudioUrl = (messageId: string) => {
 const token = localStorage.getItem("access_token");
 const baseUrl =`${import.meta.env.VITE_API_URL ||"http://localhost:3000/api"}/storage/audio/${projectId}/${messageId}/stream`;
 return token ?`${baseUrl}?token=${token}` : baseUrl;
 };

 // Handle play/pause audio
 const handlePlayAudio = (messageId: string) => {
 if (playingMessageId === messageId) {
 audioRef.current?.pause();
 setPlayingMessageId(null);
 } else {
 if (audioRef.current) {
 audioRef.current.pause();
 }
 const audio = new Audio(getAudioUrl(messageId));
 audioRef.current = audio;
 audio.play().catch(() => {
 toast.error("Erreur lors de la lecture de l'audio");
 });
 audio.onended = () => setPlayingMessageId(null);
 audio.onerror = () => {
 toast.error("Erreur lors du chargement de l'audio");
 setPlayingMessageId(null);
 };
 setPlayingMessageId(messageId);
 }
 };

 return (
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
 <PageHeader 
 title="Verbatims"
 description={project?.title}
 icon={<AudioLines className="h-6 w-6" />}
 />

 <div className="mt-8">
 <Card className="p-6">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
 <Upload className="h-5 w-5" />
 </div>
 <div>
 <p className="text-lg font-semibold tracking-tight">Import de fichiers</p>
 <p className="text-xs font-semibold text-muted-foreground mt-0.5">{selectedFiles.length} sélectionnés</p>
 </div>
 </div>
 {selectedFiles.length > 0 && (
 <Button
 onClick={handleUploadMultiple}
 disabled={uploadProgress.total > 0 && uploadProgress.completed < uploadProgress.total}
 variant="default"
 size="default"
 className="rounded-full px-8 shadow-lg shadow-primary/20"
 >
 {uploadProgress.total > 0 && uploadProgress.completed < uploadProgress.total ? (
 <>
 <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
 {uploadProgress.completed}/{uploadProgress.total}
 </>
 ) : (
 <>
 <Check className="h-3.5 w-3.5 mr-2" />
 Lancer l'import
 </>
 )}
 </Button>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div 
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 className={cn("relative flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer",
 isDragging 
 ?"border-primary bg-primary/[0.03]" 
 :"border-black/[0.05] hover:border-primary/40 hover:bg-black/[0.02]"
 )}
 onClick={() => multipleInputRef.current?.click()}
 >
 <input
 ref={multipleInputRef}
 type="file"
 accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg"
 multiple
 onChange={handleMultipleFilesSelect}
 className="hidden"
 />
 <Upload className="h-6 w-6 text-muted-foreground/40 mb-3" />
 <p className="text-[10px] font-semibold text-foreground/60">
 Glisser-déposer ou cliquer
 </p>
 </div>

 <div className="flex flex-col h-full">
 <div className="flex items-center justify-between mb-3 px-1">
 <span className="text-[8px] font-semibold tracking-[0.2em] text-muted-foreground/40">
 File d'attente
 </span>
 </div>

 <div className="flex-1 overflow-y-auto max-h-[160px] pr-2 space-y-2 custom-scrollbar">
 {selectedFiles.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-black/[0.05] rounded-[2rem] bg-black/[0.01]">
 <AudioLines className="h-5 w-5 text-muted-foreground/20 mb-3" />
 <p className="text-[9px] font-semibold text-muted-foreground/30">
 Aucun fichier en attente
 </p>
 </div>
 ) : (
 selectedFiles.map((file, index) => (
 <div key={`${file.name}-${index}`} className="group relative bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.05] p-3 rounded-2xl transition-all">
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-3 min-w-0">
 <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
 uploadStatuses[file.name] ==="success" ?"bg-green-500/10 text-green-600" :
 uploadStatuses[file.name] ==="error" ?"bg-red-500/10 text-red-600" :"bg-black/[0.03] text-muted-foreground"
 )}>
 {uploadStatuses[file.name] ==="uploading" ? (
 <Loader2 className="h-3.5 w-3.5 animate-spin" />
 ) : uploadStatuses[file.name] ==="success" ? (
 <Check className="h-3.5 w-3.5" />
 ) : (
 <FileAudio className="h-3.5 w-3.5" />
 )}
 </div>
 <div className="min-w-0">
 <p className="text-[11px] font-medium text-foreground truncate">{file.name}</p>
 <p className="text-[8px] font-semibold text-muted-foreground/40 mt-0.5">
 {(file.size / 1024 / 1024).toFixed(2)} MB
 </p>
 </div>
 </div>

 {uploadStatuses[file.name] ==="pending" && (
 <Button
 variant="ghost"
 size="icon"
 onClick={() => removeFile(index)}
 className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </Card>
 </div>

 <div className="mt-12">
 <div className="flex items-center justify-between mb-6 px-1">
 <div className="flex items-center gap-4">
 <h3 className="text-xs font-semibold text-muted-foreground">Bibliothèque</h3>
 <Badge variant="outline" className="text-primary border-none bg-primary/5 text-[9px] font-semibold px-3 rounded-full">
 {messagesQuery.data?.total || 0} Verbatims
 </Badge>
 {selectedIds.size > 0 && (
 <Badge variant="outline" className="border-none bg-red-500/10 text-red-600 text-[9px] font-semibold px-3 rounded-full">
 {selectedIds.size} sélectionné(s)
 </Badge>
 )}
 </div>
 <div className="flex gap-2">
 {selectedIds.size > 0 && (
 <Button
 onClick={() => setShowBulkDeleteConfirm(true)}
 variant="destructive"
 size="sm"
 className="rounded-full h-8 text-[9px] font-semibold px-4"
 >
 <Trash2 className="h-3 w-3 mr-1.5" />
 Supprimer ({selectedIds.size})
 </Button>
 )}
 {!messagesQuery.isLoading && messages.length > 0 && (
 <>
 <Button
 onClick={() => processBulkMutation.mutate()}
 disabled={pendingCount === 0 || processBulkMutation.isPending}
 variant="default"
 size="sm"
 className="rounded-full h-8 text-[9px] font-semibold px-4"
 >
 Analyser ({pendingCount})
 </Button>
 {failedCount > 0 && (
 <Button
 onClick={() => retryAllFailedMutation.mutate()}
 disabled={retryAllFailedMutation.isPending}
 variant="destructive"
 size="sm"
 className="rounded-full h-8 text-[9px] font-semibold px-4"
 >
 Réessayer ({failedCount})
 </Button>
 )}
 </>
 )}
 </div>
 </div>

 {messagesQuery.isLoading ? (
 <div className="space-y-2">
 {[1, 2, 3].map((i) => (
 <Skeleton key={i} className="h-12 w-full rounded-2xl" />
 ))}
 </div>
 ) : messages.length === 0 ? (
 <Card className="p-12 text-center">
 <p className="text-xs font-medium text-muted-foreground/40">
 Aucun verbatim trouvé
 </p>
 </Card>
 ) : (
 <>
 {messages.length > 0 && (
 <div className="flex items-center gap-2 px-4 mb-2">
 <button
 className="flex items-center gap-2 text-[9px] font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
 onClick={() => {
 if (selectedIds.size === messages.length) {
 setSelectedIds(new Set());
 } else {
 setSelectedIds(new Set(messages.map((m) => m.id)));
 }
 }}
 >
 {selectedIds.size === messages.length && messages.length > 0 ? (
 <CheckSquare className="h-3.5 w-3.5" />
 ) : (
 <Square className="h-3.5 w-3.5" />
 )}
 Tout sélectionner
 </button>
 </div>
 )}

 <div className="space-y-3">
 {messages.map((msg) => (
 <div
 key={msg.id}
 className={cn(
 "group relative flex items-center gap-4 px-4 py-3 transition-all cursor-pointer rounded-xl border",
 selectedIds.has(msg.id)
 ? "bg-red-50/50 border-red-200/60 dark:bg-red-950/20 dark:border-red-900/40"
 : playingMessageId === msg.id ? "bg-muted/60 border-border/50 shadow-sm" : "border-transparent hover:bg-muted/40 hover:border-border/20"
 )}
 onClick={() => handlePlayAudio(msg.id)}
 >
 {/* Checkbox */}
 <div
 className="shrink-0 flex items-center justify-center"
 onClick={(e) => {
 e.stopPropagation();
 setSelectedIds((prev) => {
 const next = new Set(prev);
 if (next.has(msg.id)) next.delete(msg.id);
 else next.add(msg.id);
 return next;
 });
 }}
 >
 {selectedIds.has(msg.id) ? (
 <CheckSquare className="h-4 w-4 text-red-500" />
 ) : (
 <Square className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/40" />
 )}
 </div>

 {/* Play Indicator */}
 <div className={cn(
 "w-10 h-10 flex items-center justify-center shrink-0 rounded-full transition-all duration-300",
 playingMessageId === msg.id
 ? "bg-primary/10 text-primary shadow-sm"
 : "bg-muted/20 text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary"
 )}>
 {playingMessageId === msg.id ? (
 <Pause className="h-4 w-4 fill-primary text-primary" />
 ) : (
 <Play className="h-4 w-4 fill-current group-hover:fill-primary translate-x-0.5" />
 )}
 </div>

 {/* Info Stack */}
 <div className="flex-1 min-w-0 flex flex-col gap-0.5">
 <div className="flex items-center gap-2">
 <h4 className={cn(
 "text-[13px] font-semibold tracking-tight truncate transition-colors",
 playingMessageId === msg.id ? "text-primary" : "text-foreground/90"
 )}>
 {msg.filename}
 </h4>
 <div className="flex items-center gap-2 ml-auto">
 <Badge variant="outline" className={cn("border-none text-[8px] font-semibold px-2 py-0.5 rounded-full",
 msg.processingStatus === 'COMPLETED' ? "bg-green-500/10 text-green-600" :
 msg.processingStatus === 'FAILED' ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground/60"
 )}>
 {msg.processingStatus === 'COMPLETED' ? 'Analysé' :
 msg.processingStatus === 'FAILED' ? 'Échec' : 
 msg.processingStatus === 'PROCESSING' ? 'Analyse...' : 'En attente'}
 </Badge>
 <span className="text-[10px] font-medium text-muted-foreground/40 truncate">
 {formatDuration(msg.duration)}
 </span>
 </div>
 </div>
 
 <div className="flex items-center gap-2 flex-wrap">
 {msg.processingStatus === 'COMPLETED' && msg.speakerProfile && (
 <Badge variant="outline" className={cn("border-none text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0", speakerProfileColor[msg.speakerProfile])}>
 {speakerProfileLabel[msg.speakerProfile]}
 </Badge>
 )}
 {msg.processingStatus === 'COMPLETED' && (
 <Badge variant="outline" className={cn("border-none text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0", toneColor[msg.tone])}>
 {toneLabel[msg.tone]}
 </Badge>
 )}
 <p className="text-[11px] text-muted-foreground/50 italic truncate flex-1">
 {msg.transcriptTxt ? `"${msg.transcriptTxt}"` : "Aucune transcription"}
 </p>
 </div>
 </div>

 {/* Actions */}
 <div 
 className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300"
 onClick={(e) => e.stopPropagation()}
 >
 {msg.processingStatus === 'FAILED' && (
 <Button
 variant="ghost"
 size="icon"
 className="w-8 h-8 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted"
 onClick={() => retryMutation.mutate(msg.id)}
 title="Réessayer"
 >
 <RotateCw className="h-3.5 w-3.5" />
 </Button>
 )}
 <Button
 variant="ghost"
 size="icon"
 className="w-8 h-8 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted"
 onClick={() => setEditingMessage(msg)}
 title="Modifier"
 >
 <Pencil className="h-3.5 w-3.5" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="w-8 h-8 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
 onClick={() => setDeletingMessage(msg)}
 title="Supprimer"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 </div>
 </div>
 ))}
 </div>

 {(messagesQuery.data?.totalPages || 1) > 1 && (
 <div className="flex items-center justify-between mt-6 px-1">
 <p className="text-[9px] font-semibold text-muted-foreground/30">
 Page <span className="text-primary">{page}</span> / {totalPages}
 </p>
 <div className="flex items-center gap-1">
 <Button
 variant="ghost"
 size="sm"
 disabled={page <= 1}
 onClick={() => {
 setPage((p) => Math.max(1, p - 1));
 setSelectedIds(new Set());
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }}
 className="h-8 rounded-lg text-[9px] font-semibold px-3"
 >
 <ChevronLeft className="h-3 w-3 mr-1" />
 Précédent
 </Button>
 <Button
 variant="ghost"
 size="sm"
 disabled={page >= (messagesQuery.data?.totalPages || 1)}
 onClick={() => {
 setPage((p) => Math.min(messagesQuery.data?.totalPages || 1, p + 1));
 setSelectedIds(new Set());
 window.scrollTo({ top: 0, behavior: 'smooth' });
 }}
 className="h-8 rounded-lg text-[9px] font-semibold px-3"
 >
 Suivant
 <ChevronRight className="h-3 w-3 ml-1" />
 </Button>
 </div>
 </div>
 )}
 </>
 )}
 </div>

 <Dialog
 open={!!deletingMessage}
 onOpenChange={(open) => {
 if (!open) setDeletingMessage(null);
 }}
 >
 <DialogContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-[2rem]">
 <DialogHeader>
 <DialogTitle className="font-semibold">Confirmer la suppression</DialogTitle>
 <DialogDescription className="text-xs font-medium text-muted-foreground/60">
 Êtes-vous sûr de vouloir supprimer <span className="text-primary">{deletingMessage?.filename}</span> ?
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="mt-6 gap-2">
 <Button
 variant="outline"
 onClick={() => setDeletingMessage(null)}
 disabled={deleteMutation.isPending}
 className="rounded-xl"
 >
 Annuler
 </Button>
 <Button
 variant="destructive"
 onClick={() => {
 if (deletingMessage) deleteMutation.mutate(deletingMessage.id);
 }}
 disabled={deleteMutation.isPending}
 className="rounded-xl"
 >
 {deleteMutation.isPending && (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 )}
 Supprimer
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <Dialog
 open={showBulkDeleteConfirm}
 onOpenChange={(open) => {
 if (!open) setShowBulkDeleteConfirm(false);
 }}
 >
 <DialogContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-[2rem]">
 <DialogHeader>
 <DialogTitle className="font-semibold">Supprimer la sélection</DialogTitle>
 <DialogDescription className="text-xs font-medium text-muted-foreground/60">
 Êtes-vous sûr de vouloir supprimer <span className="text-red-500 font-bold">{selectedIds.size}</span> verbatim(s) ? Cette action est irréversible.
 </DialogDescription>
 </DialogHeader>
 <DialogFooter className="mt-6 gap-2">
 <Button
 variant="outline"
 onClick={() => setShowBulkDeleteConfirm(false)}
 disabled={bulkDeleteMutation.isPending}
 className="rounded-xl"
 >
 Annuler
 </Button>
 <Button
 variant="destructive"
 onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
 disabled={bulkDeleteMutation.isPending}
 className="rounded-xl"
 >
 {bulkDeleteMutation.isPending && (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 )}
 Supprimer {selectedIds.size} verbatim(s)
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 <EditMessageDialog
 message={editingMessage}
 isOpen={!!editingMessage}
 onClose={() => setEditingMessage(null)}
 onSave={(data) => {
 if (editingMessage) {
 updateMutation.mutate({ messageId: editingMessage.id, data });
 }
 }}
 isPending={updateMutation.isPending}
 />
 </div>
 );
}

// ──────────────────────────────────────────────
// Edit Message Dialog (sub-component)
// ──────────────────────────────────────────────

interface EditMessageDialogProps {
 message: Message | null;
 isOpen: boolean;
 onClose: () => void;
 onSave: (data: EditMessageValues) => void;
 isPending: boolean;
}

function EditMessageDialog({
 message,
 isOpen,
 onClose,
 onSave,
 isPending,
}: EditMessageDialogProps) {
 const form = useForm<EditMessageValues>({
 resolver: zodResolver(editMessageSchema),
 defaultValues: {
 speaker:"",
 speakerProfile: undefined,
 transcriptTxt:"",
 tone:"NEUTRAL",
 },
 });

 // Reset form values when a different message is opened for editing
 useEffect(() => {
 if (message && isOpen) {
 form.reset({
 speaker: message.speaker ||"",
 speakerProfile: message.speakerProfile ?? undefined,
 transcriptTxt: message.transcriptTxt ||"",
 tone: message.tone ||"NEUTRAL",
 });
 }
 }, [message, isOpen, form]);

 const handleOpenChange = (open: boolean) => {
 if (!open) {
 form.reset({
 speaker:"",
 speakerProfile: undefined,
 transcriptTxt:"",
 tone:"NEUTRAL",
 });
 onClose();
 }
 };

 const handleSubmit = (data: EditMessageValues) => {
 onSave(data);
 };

 return (
 <Dialog open={isOpen} onOpenChange={handleOpenChange}>
 <DialogContent className="sm:max-w-xl border-white/5 bg-card/95 backdrop-blur-xl rounded-[2.5rem] p-0 overflow-hidden">
 <div className="p-10">
 <DialogHeader className="mb-8">
 <DialogTitle className="text-2xl font-semibold font-heading">Modifier le verbatim</DialogTitle>
 <DialogDescription className="text-xs font-medium text-primary mt-1">
 Ref: {message?.filename ||""}
 </DialogDescription>
 </DialogHeader>

 <Form {...form}>
 <form
 onSubmit={form.handleSubmit(handleSubmit)}
 className="space-y-4"
 >
 <FormField
 control={form.control}
 name="speakerProfile"
 render={({ field }) => (
 <div className="space-y-2">
 <Label className="text-[10px] font-semibold text-muted-foreground/60 ml-1">Intervenant</Label>
 <Select onValueChange={field.onChange} value={field.value ?? ""}>
 <SelectTrigger className="h-11 rounded-xl bg-background/50 border-white/5">
 <SelectValue placeholder="Profil détecté par l'IA" />
 </SelectTrigger>
 <SelectContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-xl">
 {SPEAKER_PROFILE_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}
 />

 <FormField
 control={form.control}
 name="transcriptTxt"
 render={({ field }) => (
 <div className="space-y-2">
 <Label className="text-[10px] font-semibold text-muted-foreground/60 ml-1">Transcription complète</Label>
 <Textarea
 placeholder="Texte intégral de la transcription"
 rows={5}
 className="rounded-xl bg-background/50 border-white/5 resize-none"
 {...field}
 />
 {form.formState.errors.transcriptTxt && (
 <p className="text-[10px] font-medium text-destructive mt-1 ml-1">{form.formState.errors.transcriptTxt.message}</p>
 )}
 </div>
 )}
 />


 <FormField
 control={form.control}
 name="tone"
 render={({ field }) => (
 <div className="space-y-2">
 <Label className="text-[10px] font-semibold text-muted-foreground/60 ml-1">Tonalité</Label>
 <Select
 onValueChange={field.onChange}
 value={field.value}
 >
 <SelectTrigger className="h-11 rounded-xl bg-background/50 border-white/5">
 <SelectValue placeholder="Sélectionnez une tonalité" />
 </SelectTrigger>
 <SelectContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-xl">
 {TONE_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {form.formState.errors.tone && (
 <p className="text-[10px] font-medium text-destructive mt-1 ml-1">{form.formState.errors.tone.message}</p>
 )}
 </div>
 )}
 />


 <DialogFooter className="mt-10 gap-3">
 <Button
 type="button"
 variant="outline"
 onClick={() => handleOpenChange(false)}
 disabled={isPending}
 className="h-12 rounded-xl border-white/10 font-medium text-[10px] px-8"
 >
 Annuler
 </Button>
 <Button 
 type="submit" 
 disabled={isPending}
 className="h-12 rounded-xl shadow-lg shadow-primary/20 font-semibold text-xs px-10"
 >
 {isPending && (
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 )}
 Enregistrer les modifications
 </Button>
 </DialogFooter>
 </form>
 </Form>
 </div>
 </DialogContent>
 </Dialog>
);
}

export default AdminMessagesPage;
