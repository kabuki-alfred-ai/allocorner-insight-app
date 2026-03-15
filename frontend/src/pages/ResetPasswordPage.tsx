import { useForm } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import { z } from"zod";
import { Link, useNavigate, useSearchParams } from"react-router-dom";
import { Loader2 } from"lucide-react";
import { toast } from"sonner";

import { resetPassword } from"@/lib/api/auth";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from"@/components/ui/form";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from"@/components/ui/card";

const schema = z
 .object({
 newPassword: z.string().min(8,"8 caractères minimum"),
 confirmPassword: z.string().min(8,"8 caractères minimum"),
 })
 .refine((data) => data.newPassword === data.confirmPassword, {
 message:"Les mots de passe ne correspondent pas",
 path: ["confirmPassword"],
 });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const token = searchParams.get("token");

 const form = useForm<FormValues>({
 resolver: zodResolver(schema),
 defaultValues: { newPassword:"", confirmPassword:"" },
 });

 const onSubmit = async (values: FormValues) => {
 if (!token) return;
 try {
 await resetPassword({ token, newPassword: values.newPassword, confirmPassword: values.confirmPassword });
 toast.success("Mot de passe réinitialisé avec succès !");
 navigate("/login");
 } catch (error: unknown) {
 const axiosError = error as { response?: { data?: { message?: string } } };
 const message = axiosError?.response?.data?.message ??"Token invalide ou expiré.";
 toast.error(message);
 }
 };

 return (
 <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
 <Card className="w-full max-w-md">
 <CardHeader className="space-y-4 items-center text-center pb-8">
 <img
 src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png"
 alt="Allo Corner Logo"
 className="h-8 w-auto object-contain mb-4"
 />
 <CardTitle className="text-2xl">Réinitialisation du mot de passe</CardTitle>
 <CardDescription>
 Choisissez un nouveau mot de passe pour votre compte
 </CardDescription>
 </CardHeader>
 
 <CardContent>
 {!token ? (
 <div className="text-center space-y-6">
 <p className="text-sm text-destructive font-medium">
 Lien invalide. Aucun token de réinitialisation trouvé.
 </p>
 <Button asChild variant="link" className="mt-4">
 <Link to="/login">Retour à la connexion</Link>
 </Button>
 </div>
 ) : (
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <FormField
 control={form.control}
 name="newPassword"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Nouveau mot de passe</FormLabel>
 <FormControl>
 <Input
 type="password"
 placeholder="••••••••"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="confirmPassword"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Confirmer le mot de passe</FormLabel>
 <FormControl>
 <Input
 type="password"
 placeholder="••••••••"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <Button
 type="submit"
 className="w-full"
 disabled={form.formState.isSubmitting}
 >
 {form.formState.isSubmitting ? (
 <div className="flex items-center gap-2">
 <Loader2 className="h-4 w-4 animate-spin" />
 <span>Réinitialisation...</span>
 </div>
 ) : ("Valider"
 )}
 </Button>

 <div className="flex justify-center mt-6">
 <Button asChild variant="link" className="text-muted-foreground">
 <Link to="/login">Retour à la connexion</Link>
 </Button>
 </div>
 </form>
 </Form>
 )}
 </CardContent>
 </Card>
 
 {/* Footer */}
 <div className="absolute bottom-8 text-center w-full pointer-events-none">
 <p className="text-xs text-muted-foreground/50">
 Propulsé par Allo Corner
 </p>
 </div>
 </div>
 );
}

export default ResetPasswordPage;
