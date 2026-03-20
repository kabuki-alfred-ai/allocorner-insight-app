import { useState } from"react";
import { useParams } from"react-router-dom";
import { useQuery, useMutation, useQueryClient } from"@tanstack/react-query";
import { Send, XCircle, Loader2, Mail, Link2, Check, ArrowLeft, Settings, Users } from"lucide-react";
import { PageHeader } from"@/components/PageHeader";
import { cn } from"@/lib/utils";
import { useNavigate } from"react-router-dom";
import { toast } from"sonner";

import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Badge } from"@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card";
import { Skeleton } from"@/components/ui/skeleton";
import { Separator } from"@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog";

import {
 createInvitation,
 getInvitations,
 revokeInvitation,
} from"@/lib/api/invitations";

import type { Invitation, InvitationStatus } from"@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
 InvitationStatus,
 { label: string; className: string }
> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-500/10 text-amber-600 border-none px-3 py-0.5 rounded-full text-[9px] font-bold",
  },
  ACCEPTED: {
    label: "Acceptée",
    className: "bg-green-500/10 text-green-600 border-none px-3 py-0.5 rounded-full text-[9px] font-bold",
  },
  EXPIRED: {
    label: "Expirée",
    className: "bg-muted text-muted-foreground/60 border-none px-3 py-0.5 rounded-full text-[9px] font-bold",
  },
  REVOKED: {
    label: "Révôquée",
    className: "bg-red-500/10 text-red-600 border-none px-3 py-0.5 rounded-full text-[9px] font-bold",
  },
};

function statusBadge(status: InvitationStatus) {
 const config = STATUS_CONFIG[status];
 return (
 <Badge variant="outline" className={config.className}>
 {config.label}
 </Badge>
 );
}

function formatDate(dateStr: string): string {
 return new Date(dateStr).toLocaleDateString("fr-FR", {
 day:"2-digit",
 month:"2-digit",
 year:"numeric",
 hour:"2-digit",
 minute:"2-digit",
 });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminInvitationsPage() {
 const { projectId } = useParams<{ projectId: string }>();
 const navigate = useNavigate();
 const queryClient = useQueryClient();

 const [email, setEmail] = useState("");
 const [createdInvitation, setCreatedInvitation] = useState<Invitation | null>(null);
 const [copied, setCopied] = useState(false);

 // -- Query -----------------------------------------------------------------

 const { data: invitations = [], isLoading } = useQuery({
 queryKey: ["invitations", projectId],
 queryFn: () => getInvitations(projectId!),
 enabled: !!projectId,
 });

 // -- Mutations -------------------------------------------------------------

 const createMutation = useMutation({
 mutationFn: (emailValue: string) =>
 createInvitation(projectId!, { email: emailValue }),
 onSuccess: (data) => {
 queryClient.invalidateQueries({ queryKey: ["invitations", projectId] });
 toast.success("Invitation envoyee");
 setEmail("");
 setCreatedInvitation(data);
 },
 onError: () => toast.error("Erreur lors de l'envoi de l'invitation"),
 });

 const revokeMutation = useMutation({
 mutationFn: (id: string) => revokeInvitation(projectId!, id),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["invitations", projectId] });
 toast.success("Invitation revoquee");
 },
 onError: () => toast.error("Erreur lors de la revocation"),
 });

 // -- Handlers --------------------------------------------------------------

 function handleInvite(e: React.FormEvent) {
 e.preventDefault();
 const trimmed = email.trim();
 if (!trimmed) {
 toast.error("L'adresse e-mail est requise");
 return;
 }
 createMutation.mutate(trimmed);
 }

 function getInvitationLink(token: string): string {
 const baseUrl = window.location.origin;
 return`${baseUrl}/accept-invitation/${token}`;
 }

 async function copyToClipboard(text: string) {
 try {
 await navigator.clipboard.writeText(text);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 toast.success("Lien copie dans le presse-papiers");
 } catch {
 toast.error("Impossible de copier le lien");
 }
 }

 // -- Render ----------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Collaborateurs"
        description="Gérez les invitations et les accès des membres du projet"
        icon={<Users className="h-6 w-6" />}
      />

      <div className="mt-12 space-y-12">
        {/* Invite form */}
        <Card>
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-lg font-semibold font-heading flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Inviter un membre
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleInvite} className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="invite-email" className="text-[10px] font-semibold text-muted-foreground/60 ml-1">Adresse e-mail</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborateur@exemple.fr"
                  className="h-12 rounded-xl bg-background/50 border-white/5"
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="default"
                disabled={createMutation.isPending}
                className="h-12 rounded-xl px-8 shadow-lg shadow-primary/20 font-semibold"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer l'invitation
              </Button>
            </form>
            <p className="text-[10px] font-medium text-muted-foreground/40 mt-4 ml-1">
              Une invitation par email sera envoyée. Validité: 7 jours.
            </p>
          </CardContent>
        </Card>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && invitations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucune invitation pour le moment.
            </CardContent>
          </Card>
        )}

        {/* Invitations list */}
        {!isLoading && invitations.length > 0 && (
          <Card className="overflow-hidden border-white/5 bg-black/[0.01]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="text-[10px] font-semibold text-muted-foreground/60 px-6">Email</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground/60">Statut</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground/60">Expiration</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground/60">Lien</TableHead>
                  <TableHead className="text-[10px] font-semibold text-muted-foreground/60 text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv) => (
                  <TableRow key={inv.id} className="group border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{inv.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {statusBadge(inv.status)}
                    </TableCell>
                    <TableCell className="text-[11px] font-medium text-muted-foreground/80">
                      {formatDate(inv.expiresAt)}
                    </TableCell>
                    <TableCell>
                      {inv.status === "PENDING" ? (
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <code className="text-[10px] bg-background/50 px-2 py-1 rounded border border-white/5 font-mono truncate">
                            {getInvitationLink(inv.token)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg shrink-0 text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                            onClick={() => copyToClipboard(getInvitationLink(inv.token))}
                          >
                            {copied ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Link2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/30">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      {inv.status === "PENDING" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeMutation.mutate(inv.id)}
                          disabled={revokeMutation.isPending}
                          className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
                        >
                          {revokeMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={!!createdInvitation} onOpenChange={() => setCreatedInvitation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Invitation envoyée
            </DialogTitle>
            <DialogDescription>
              L'invitation a été envoyée par email à {createdInvitation?.email}.
              Vous pouvez aussi partager ce lien directement :
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded break-all min-w-0">
                {createdInvitation && getInvitationLink(createdInvitation.token)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => createdInvitation && copyToClipboard(getInvitationLink(createdInvitation.token))}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ce lien expire le {createdInvitation && formatDate(createdInvitation.expiresAt)}.
            </p>
            <Button 
              variant="default" 
              onClick={() => setCreatedInvitation(null)} 
              className="w-full h-11 rounded-xl font-semibold"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminInvitationsPage;
