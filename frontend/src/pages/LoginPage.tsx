import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const destination = user.role === "SUPERADMIN" ? "/admin" : "/projects";
      navigate(destination, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      toast.success("Connexion reussie !");
      // Redirection logic is handled by the useEffect watching isAuthenticated
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Identifiants incorrects. Veuillez reessayer.";

      // Attempt to extract a more specific message from axios error
      const axiosError = error as { response?: { data?: { message?: string } } };
      const serverMessage = axiosError?.response?.data?.message;

      toast.error(serverMessage || message);
    }
  };

  // Auto-fill super admin credentials (local dev only)
  const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const fillSuperAdminCredentials = () => {
    form.setValue("email", "admin@allocorner.com");
    form.setValue("password", "admin123");
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
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4 font-sans selection:bg-primary/20 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-30" />
      
      <Card className="w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-2xl relative z-10 overflow-hidden rounded-[2.5rem]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <CardHeader className="text-center space-y-8 pt-14 pb-4">
          <div className="flex flex-col items-center gap-10">
            {/* Logo Container - ExplicitDark to show white logo text */}
            <div className="p-8 bg-black rounded-[2rem] border border-white/10 shadow-inner group relative">
              <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all rounded-full" />
              <img 
                src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png" 
                alt="Allo Corner Logo" 
                className="h-10 w-auto object-contain relative z-10 brightness-125"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-3 leading-none opacity-80">
                  Livre d'or Vocal
                </p>
                <h1 className="text-4xl font-extrabold font-heading text-white tracking-tight">
                  Insight Board
                </h1>
              </div>
              <p className="text-xs font-medium text-white/40 max-w-[260px] mx-auto leading-relaxed">
                Connectez-vous pour accéder à l'analyse de vos collectes audio
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 px-10 pb-14">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                      Identifiant Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nom@exemple.com"
                        className="bg-white/5 border-white/20 focus:bg-white/10 focus:border-primary/50 transition-all text-white placeholder:text-white/20 px-5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400 font-bold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                      Mot de passe
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-white/5 border-white/20 focus:bg-white/10 focus:border-primary/50 transition-all text-white placeholder:text-white/20 px-5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] text-red-400 font-bold" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end -mt-3">
                <Link to="/forgot-password" className="text-[10px] text-white/30 hover:text-primary transition-colors font-bold uppercase tracking-widest">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-6"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Accès en cours...</span>
                  </div>
                ) : (
                  "Entrer dans le Board"
                )}
              </Button>

              {isLocalDev && (
                <button
                  type="button"
                  onClick={fillSuperAdminCredentials}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-colors rounded-xl border border-dashed border-white/10 hover:border-primary/30 hover:bg-primary/5"
                >
                  <Wand2 className="h-3 w-3" />
                  Dev: Super Admin
                </button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
