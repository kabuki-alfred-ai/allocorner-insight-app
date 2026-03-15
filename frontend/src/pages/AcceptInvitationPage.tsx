import { useEffect, useState } from"react";
import { useNavigate, useParams, Link } from"react-router-dom";
import { useForm } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { z } from"zod";
import { Loader2, AlertCircle } from"lucide-react";
import { toast } from"sonner";

import {
 validateInvitation,
 acceptInvitation,
} from"@/lib/api/invitations";
import type { Invitation } from"@/lib/types";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Badge } from"@/components/ui/badge";
import {
 Card,
 CardContent,
 CardHeader,
} from"@/components/ui/card";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from"@/components/ui/form";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const acceptSchema = z
 .object({
 name: z.string().min(1,"Nom requis"),
 email: z.string().email("Email invalide"),
 password: z
 .string()
 .min(8,"Le mot de passe doit contenir au moins 8 caracteres"),
 confirmPassword: z.string().min(1,"Veuillez confirmer le mot de passe"),
 })
 .refine((data) => data.password === data.confirmPassword, {
 message:"Les mots de passe ne correspondent pas",
 path: ["confirmPassword"],
 });

type AcceptFormValues = z.infer<typeof acceptSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function AcceptInvitationPage() {
 const { token } = useParams<{ token: string }>();
 const navigate = useNavigate();

 const [invitation, setInvitation] = useState<Invitation | null>(null);
 const [validating, setValidating] = useState(true);
 const [validationError, setValidationError] = useState<string | null>(null);

 const form = useForm<AcceptFormValues>({
 resolver: zodResolver(acceptSchema),
 defaultValues: {
 name:"",
 email:"",
 password:"",
 confirmPassword:"",
 },
 });

 // Validate token on mount
 useEffect(() => {
 if (!token) {
 setValidationError("Lien d'invitation invalide.");
 setValidating(false);
 return;
 }

 validateInvitation(token)
 .then((data) => {
 setInvitation(data);
 // Pre-fill email from the invitation
 form.setValue("email", data.email);
 })
 .catch((error: unknown) => {
 const axiosError = error as {
 response?: { status?: number; data?: { message?: string } };
 };
 if (axiosError?.response?.status === 410) {
 setValidationError("Cette invitation a expire.");
 } else if (axiosError?.response?.status === 404) {
 setValidationError("Invitation introuvable.");
 } else {
 setValidationError(
 axiosError?.response?.data?.message ||"Impossible de valider cette invitation.",
 );
 }
 })
 .finally(() => {
 setValidating(false);
 });
 }, [token, form]);

 const onSubmit = async (values: AcceptFormValues) => {
 if (!token) return;

 try {
 await acceptInvitation(token, {
 email: values.email,
 password: values.password,
 name: values.name,
 });
 toast.success("Compte cree avec succes ! Vous pouvez maintenant vous connecter.");
 navigate("/login", { replace: true });
 } catch (error: unknown) {
 const axiosError = error as {
 response?: { data?: { message?: string } };
 };
 const message =
 axiosError?.response?.data?.message ||"Une erreur est survenue. Veuillez reessayer.";
 toast.error(message);
 }
 };

 // Loading state while validating token
 if (validating) {
 return (
 <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 font-sans selection:bg-primary/20 relative overflow-hidden dark text-white">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full opacity-30 pointer-events-none" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-20 pointer-events-none" />
 <div className="flex flex-col items-center gap-6 relative z-10">
 <Loader2 className="h-10 w-10 animate-spin text-primary" />
 <p className="text-xs font-semibold text-primary/80">
 Validation en cours...
 </p>
 </div>
 </div>
 );
 }

 // Error state -- invalid or expired token
 if (validationError) {
 return (
 <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 font-sans selection:bg-primary/20 relative overflow-hidden dark text-white">
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-destructive/20 blur-[150px] rounded-full opacity-30 pointer-events-none" />
 
 {/* Main Card Wrapper */}
 <Card className="w-full max-w-[420px] bg-black border-destructive/20 shadow-2xl relative z-10 rounded-2xl overflow-hidden p-2 sm:p-4">
 <CardHeader className="text-center space-y-8 pt-10 pb-4">
 <div className="flex flex-col items-center gap-8">
 <div className="h-16 w-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-inner relative">
 <AlertCircle className="h-8 w-8 text-destructive relative z-10" />
 </div>
 
 <div className="space-y-3 px-2">
 <div className="flex flex-col items-center">
 <p className="text-[10px] font-medium tracking-[0.3em] text-destructive mb-2 opacity-90">
 Erreur
 </p>
 <h1 className="text-3xl font-semibold font-heading text-white tracking-tight">
 Invitation invalide
 </h1>
 </div>
 <p className="text-sm font-medium text-white/50 max-w-[280px] mx-auto leading-relaxed">
 {validationError}
 </p>
 </div>
 </div>
 </CardHeader>
 <CardContent className="flex justify-center pb-10">
 <Link
 to="/login"
 className="text-xs text-white/50 hover:text-white transition-colors font-medium mt-4"
 >
 Retour à la connexion
 </Link>
 </CardContent>
 </Card>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4 font-sans selection:bg-primary/20 relative overflow-hidden dark text-white">
 {/* Background radial effects */}
 <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full opacity-30 pointer-events-none" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-20 pointer-events-none" />

 {/* Background Audio Wave (Dynamic) */}
 <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
 <div className="absolute inset-x-0 bottom-0 flex items-end justify-around h-[120%] px-2 gap-2 md:gap-4">
 {[...Array(50)].map((_, i) => (
 <div
 key={i}
 className="w-full bg-primary rounded-t-full transition-all duration-300 animate-waveform"
 style={{
 height:`${Math.random() * 70 + 10}%`,
 animationDelay:`${i * 0.05}s`,
 animationDuration:`${0.8 + Math.random() * 0.5}s`,
 opacity: 0.2 + (i / 50) * 0.4
 }}
 />
 ))}
 </div>
 </div>
 
 {/* Top subtle gradient */}
 <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent z-0 pointer-events-none" />

 {/* Main Card Wrapper for Gradient Border */}
 <Card className="w-full max-w-[420px] bg-black border-white/10 shadow-2xl relative z-10 rounded-2xl overflow-hidden p-2 sm:p-4 mt-8 mb-8">
 <CardHeader className="text-center space-y-8 pt-10 pb-4">
 <div className="flex flex-col items-center gap-8">
 <div className="p-6 bg-black rounded-2xl border border-white/5 relative">
 <img
 src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png"
 alt="Allo Corner Logo"
 className="h-8 w-auto object-contain relative z-10 brightness-110"
 />
 </div>

 <div className="space-y-3 px-2">
 <div className="flex flex-col items-center">
 <p className="text-[10px] font-medium tracking-[0.3em] text-primary mb-2 opacity-90">
 Invitation
 </p>
 <h1 className="text-3xl font-semibold font-heading text-white tracking-tight">
 Créer un compte
 </h1>
 </div>
 {invitation && (
 <p className="text-sm font-medium text-white/50 max-w-[280px] mx-auto leading-relaxed">
 Projet : <span className="text-white/90">{invitation.projectId}</span>
 </p>
 )}
 </div>
 </div>
 </CardHeader>

 <CardContent className="pt-4 px-4 sm:px-8 pb-10">
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
 <FormField
 control={form.control}
 name="email"
 render={({ field }) => (
 <FormItem className="space-y-2">
 <FormLabel className="text-[10px] font-semibold text-muted-foreground/70 ml-1">
 Email
 </FormLabel>
 <FormControl>
 <Input
 type="email"
 disabled
 autoComplete="email"
 className="bg-muted/30 border-input font-medium"
 {...field}
 />
 </FormControl>
 <FormMessage className="text-xs text-destructive font-medium" />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem className="space-y-2">
 <FormLabel className="text-[10px] font-semibold text-muted-foreground/70 ml-1">
 Nom complet
 </FormLabel>
 <FormControl>
 <Input
 type="text"
 placeholder="Votre nom complet"
 autoComplete="name"
 className="bg-muted/30 border-input font-medium"
 {...field}
 />
 </FormControl>
 <FormMessage className="text-xs text-destructive font-medium" />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="password"
 render={({ field }) => (
 <FormItem className="space-y-2">
 <FormLabel className="text-[10px] font-semibold text-muted-foreground/70 ml-1">
 Mot de passe
 </FormLabel>
 <FormControl>
 <Input
 type="password"
 placeholder="Minimum 8 caractères"
 autoComplete="new-password"
 className="bg-muted/30 border-input font-medium"
 {...field}
 />
 </FormControl>
 <FormMessage className="text-xs text-destructive font-medium" />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="confirmPassword"
 render={({ field }) => (
 <FormItem className="space-y-2">
 <FormLabel className="text-[10px] font-semibold text-muted-foreground/70 ml-1">
 Confirmer
 </FormLabel>
 <FormControl>
 <Input
 type="password"
 placeholder="Confirmez le mot de passe"
 autoComplete="new-password"
 className="bg-muted/30 border-input font-medium"
 {...field}
 />
 </FormControl>
 <FormMessage className="text-xs text-destructive font-medium" />
 </FormItem>
 )}
 />

 <Button
 type="submit"
 variant="default" className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-semibold text-xs mt-8"
 disabled={form.formState.isSubmitting}
 >
 {form.formState.isSubmitting ? (
 <div className="flex items-center justify-center gap-2">
 <Loader2 className="h-4 w-4 animate-spin" />
 <span>Création en cours...</span>
 </div>
 ) : ("Créer mon compte"
 )}
 </Button>
 </form>
 </Form>

 <div className="mt-8 pt-4 text-center">
 <Link
 to="/login"
 className="text-[10px] font-semibold text-muted-foreground/50 hover:text-primary transition-colors"
 >
 Déjà un compte ? Se connecter
 </Link>
 </div>
 </CardContent>
 </Card>
 
 {/* Footer minimal */}
 <div className="absolute bottom-4 text-center w-full z-10 pointer-events-none pb-4">
 <p className="text-[10px] font-semibold text-white/20">
 Propulsé par Allo Corner
 </p>
 </div>
 </div>
 );
}

export default AcceptInvitationPage;
