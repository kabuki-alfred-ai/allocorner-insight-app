import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, X, TrendingUp, ArrowLeft, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { getTrends, upsertTrends } from "@/lib/api/trends";
import { UpsertTrendsDto } from "@/lib/types";

// ---------------------------------------------------------------------------
// DynamicStringList - Reusable component for dynamic string arrays
// ---------------------------------------------------------------------------

function DynamicStringList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  function handleAdd() {
    onChange([...values, ""]);
  }

  function handleRemove(index: number) {
    const next = values.filter((_, i) => i !== index);
    onChange(next);
  }

  function handleChange(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{label}</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAdd}
          className="h-8 rounded-lg text-[10px] uppercase font-bold tracking-widest border-primary/10 text-primary hover:bg-primary/5"
        >
          <Plus className="mr-1 h-3 w-3" />
          Ajouter
        </Button>
      </div>

      {values.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucun element. Cliquez sur "Ajouter" pour commencer.
        </p>
      )}

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Element ${index + 1}`}
              className="bg-muted/30 border-input"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TrendItem {
  title: string;
  content: string;
}

function DynamicTrendList({
  label,
  values,
  onChange,
}: {
  label: string;
  values: (string | TrendItem)[];
  onChange: (v: (string | TrendItem)[]) => void;
}) {
  function handleAdd() {
    onChange([...values, { title: "", content: "" }]);
  }

  function handleRemove(index: number) {
    const next = values.filter((_, i) => i !== index);
    onChange(next);
  }

  function handleChange(index: number, field: keyof TrendItem, value: string) {
    const next = [...values];
    const current = typeof next[index] === 'string' ? { title: next[index] as string, content: "" } : next[index] as TrendItem;
    next[index] = { ...current, [field]: value };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{label}</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAdd}
          className="h-8 rounded-lg text-[10px] uppercase font-bold tracking-widest border-primary/10 text-primary hover:bg-primary/5"
        >
          <Plus className="mr-1 h-3 w-3" />
          Ajouter
        </Button>
      </div>

      {values.length === 0 && (
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-2 ml-1">
          Aucun element.
        </p>
      )}

      <div className="space-y-4">
        {values.map((value, index) => {
          const item = typeof value === 'string' ? { title: value, content: "" } : value;
          return (
            <div key={index} className="flex gap-4 items-start bg-black/[0.02] p-4 rounded-2xl border border-black/[0.03]">
              <div className="flex-1 space-y-3">
                <Input
                  value={item.title}
                  onChange={(e) => handleChange(index, 'title', e.target.value)}
                  placeholder="Titre"
                  className="bg-muted/30 border-input font-bold"
                />
                <Textarea
                  value={item.content}
                  onChange={(e) => handleChange(index, 'content', e.target.value)}
                  placeholder="Description..."
                  className="bg-muted/30 border-input text-xs min-h-[60px]"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const trendsSchema = z.object({
  mainTrends: z.array(z.any()).default([]),
  strengths: z.array(z.any()).default([]),
  recurringWords: z.array(z.string()).default([]),
  weakSignal: z.string().default(""),
  weakSignalDetail: z.string().default(""),
});

type TrendsFormValues = z.infer<typeof trendsSchema>;

// Helper to normalize items
function normalizeTrendItems(items: any[] | undefined): (string | TrendItem)[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => {
    if (typeof item === 'string') return item;
    return {
      title: item.title || "",
      content: item.content || ""
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminTrendsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ---- Query ----
  const { data: trends, isLoading } = useQuery({
    queryKey: ["trends", projectId],
    queryFn: () => getTrends(projectId!),
    enabled: !!projectId,
  });

  // ---- Form ----
  const form = useForm<TrendsFormValues>({
    resolver: zodResolver(trendsSchema),
    defaultValues: {
      mainTrends: [],
      strengths: [],
      recurringWords: [],
      weakSignal: "",
      weakSignalDetail: "",
    },
  });

  // Pre-fill when data arrives
  useEffect(() => {
    if (trends) {
      form.reset({
        mainTrends: normalizeTrendItems(trends.mainTrends),
        strengths: normalizeTrendItems(trends.strengths),
        recurringWords: trends.recurringWords || [],
        weakSignal: trends.weakSignal || "",
        weakSignalDetail: trends.weakSignalDetail || "",
      });
    }
  }, [trends]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Mutation ----
  const upsertMutation = useMutation({
    mutationFn: (data: TrendsFormValues) => {
      const payload: UpsertTrendsDto = {
        mainTrends: data.mainTrends ?? [],
        strengths: data.strengths ?? [],
        recurringWords: data.recurringWords ?? [],
        weakSignal: data.weakSignal ?? "",
        weakSignalDetail: data.weakSignalDetail ?? "",
      };
      return upsertTrends(projectId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trends", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Tendances enregistrées avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement des tendances");
    },
  });

  // ---- Watch array values for controlled DynamicStringList ----
  const mainTrends = form.watch("mainTrends");
  const strengths = form.watch("strengths");
  const recurringWords = form.watch("recurringWords");

  // ---- Render ----
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Tendances & Synthèse"
        description="Analysez les dynamiques globales et les signaux émergents"
        icon={<TrendingUp className="h-6 w-6" />}
        actions={
          <Button 
            variant="outline"
            onClick={() => navigate(`/projects/${projectId}/admin`)}
            className="font-bold text-[10px] uppercase tracking-widest rounded-xl h-11 px-6 border-primary/10 text-primary hover:bg-primary/5"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        }
      />

      <div className="mt-12">

      <Card>
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-extrabold font-heading flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Synthèse globale
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
            Complétez les différentes sections ci-dessous
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => upsertMutation.mutate(v))}
              className="space-y-8"
            >
              {/* Dynamic list: Tendances principales */}
              <DynamicTrendList
                label="Tendances principales"
                values={mainTrends}
                onChange={(v) => form.setValue("mainTrends", v, { shouldDirty: true })}
              />

              <Separator />

              {/* Dynamic list: Points forts */}
              <DynamicTrendList
                label="Points forts"
                values={strengths}
                onChange={(v) => form.setValue("strengths", v, { shouldDirty: true })}
              />

              <Separator />

              {/* Dynamic list: Mots recurrents */}
              <DynamicStringList
                label="Mots recurrents"
                values={recurringWords}
                onChange={(v) => form.setValue("recurringWords", v, { shouldDirty: true })}
              />

              <Separator />

              {/* Signal faible */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="weakSignal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signal faible</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Identifiez le signal faible..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weakSignalDetail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detail du signal faible</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Decrivez en detail le signal faible detecte..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={upsertMutation.isPending}
                className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 mt-12"
              >
                {upsertMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer la synthèse
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  </div>
);
}

export default AdminTrendsPage;
