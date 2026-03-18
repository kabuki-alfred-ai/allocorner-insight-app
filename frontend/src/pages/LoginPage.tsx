import { useEffect, useState } from"react";
import { Link, useNavigate } from"react-router-dom";
import { useForm } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { z } from"zod";
import { Loader2, Wand2 } from"lucide-react";
import { toast } from"sonner";

import { useAuth } from"@/lib/auth-context";
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

const loginSchema = z.object({
 email: z.string().email("Email invalide"),
 password: z.string().min(1,"Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function LoginPage() {
 const navigate = useNavigate();
 const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
 const [loginError, setLoginError] = useState<string | null>(null);

 const form = useForm<LoginFormValues>({
 resolver: zodResolver(loginSchema),
 defaultValues: {
 email:"",
 password:"",
 },
 });

 // Redirect if already authenticated
 useEffect(() => {
 if (!authLoading && isAuthenticated && user) {
 const destination = user.role ==="SUPERADMIN" ?"/admin" :"/projects";
 navigate(destination, { replace: true });
 }
 }, [authLoading, isAuthenticated, user, navigate]);

 const onSubmit = async (values: LoginFormValues) => {
 setLoginError(null);
 try {
 await login(values.email, values.password);
 toast.success("Connexion reussie !");
 // Redirection logic is handled by the useEffect watching isAuthenticated
 } catch (error: unknown) {
 const message =
 error instanceof Error
 ? error.message
 :"Identifiants incorrects. Veuillez réessayer.";

 // Attempt to extract a more specific message from axios error
 const axiosError = error as { response?: { data?: { message?: string } } };
 const serverMessage = axiosError?.response?.data?.message;

 setLoginError(serverMessage || message);
 }
 };

 // Auto-fill super admin credentials (local dev only)
 const isLocalDev = window.location.hostname ==="localhost" || window.location.hostname ==="127.0.0.1";
 const fillSuperAdminCredentials = () => {
 form.setValue("email","admin@allocorner.com");
 form.setValue("password","admin123");
 };

 // Don't render the form while checking authentication status
 if (authLoading) {
 return (
 <div className="min-h-screen bg-gradient-analytics flex items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 </div>
 );
 }

 // If already authenticated, show nothing while redirecting
 if (isAuthenticated) {
 return null;
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

 <Card className="w-full max-w-[420px] bg-black border-white/10 shadow-2xl relative z-10 rounded-2xl overflow-hidden p-2 sm:p-4">
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
 Livre d'or Vocal
 </p>
 <h1 className="text-3xl font-semibold font-heading text-white tracking-tight">
 Insight Board
 </h1>
 </div>
 <p className="text-sm font-medium text-white/50 max-w-[280px] mx-auto leading-relaxed">
 Connectez-vous pour accéder à l'analyse de vos collectes audio
 </p>
 </div>
 </div>
 </CardHeader>

 <CardContent className="pt-6 px-4 sm:px-8 pb-10">
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
 placeholder="nom@exemple.com"
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
 <FormItem className="space-y-3">
 <div className="flex items-center justify-between">
 <FormLabel className="text-[10px] font-semibold text-muted-foreground/70 ml-1">
 Mot de passe
 </FormLabel>
 <Link to="/forgot-password" className="text-[10px] font-semibold text-muted-foreground/50 hover:text-primary transition-colors">
 Oublié ?
 </Link>
 </div>
 <FormControl>
 <Input
 type="password"
 placeholder="••••••••"
 className="bg-muted/30 border-input font-medium"
 {...field}
 />
 </FormControl>
 <FormMessage className="text-xs text-destructive font-medium" />
 </FormItem>
 )}
 />

 {loginError && (
 <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs font-medium text-destructive">
 <span>{loginError}</span>
 </div>
 )}

 <Button
 type="submit"
 variant="default" className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-semibold text-xs mt-8"
 disabled={form.formState.isSubmitting}
 >
 {form.formState.isSubmitting ? (
 <div className="flex items-center justify-center gap-2">
 <Loader2 className="h-4 w-4 animate-spin" />
 <span>Accès en cours...</span>
 </div>
 ) : ("Se connecter"
 )}
 </Button>

 {isLocalDev && (
 <Button
 type="button"
 variant="outline"
 onClick={fillSuperAdminCredentials}
 className="w-full flex items-center justify-center gap-2 py-6 mt-4 text-xs font-medium text-white/50 hover:text-primary transition-colors rounded-xl border-dashed border-white/10 hover:border-primary/30 hover:bg-primary/10 bg-transparent"
 >
 <Wand2 className="h-3 w-3" />
 Dev: Connexion Admin
 </Button>
 )}
 </form>
 </Form>
 </CardContent>
 </Card>
 
 {/* Footer minimal */}
 <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
 <p className="text-[10px] font-semibold text-white/20">
 Propulsé par Allo Corner
 </p>
 </div>
 </div>
 );
}

export default LoginPage;
