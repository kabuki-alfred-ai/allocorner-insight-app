import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { Theme, Message } from "@/lib/types";
import { useProject } from "@/hooks/use-projects";
import { useThemes } from "@/hooks/use-themes";
import { useMessages } from "@/hooks/use-messages";
import { ThemeSelector } from "@/components/themes/ThemeSelector";
import { ThemeSynthesis } from "@/components/themes/ThemeSynthesis";
import { MessageList } from "@/components/themes/MessageList";
import { Loader2, Tags, ChevronDown, LayoutGrid, MessageSquareQuote } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Themes() {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: project } = useProject(projectId!);
    const { data: themesData, isLoading: themesLoading } = useThemes(projectId!);
    const { data: messagesData, isLoading: messagesLoading } = useMessages(projectId!, { limit: 1000 });

    const themesList = themesData || [];
    const allMessages: Message[] = messagesData?.data || [];

    const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

    // SEO
    useEffect(() => {
        const clientName = project?.clientName || "";
        const projectTitle = project?.title || "";
        const title = `Analyse thématique${clientName ? ` — ${clientName}` : ""}`;
        const description = `Exploration interactive des thématiques: visualisations, synthèses et messages audio${projectTitle ? ` pour ${projectTitle}` : ""}.`;

        document.title = title;

        const setMeta = (name: string, content: string) => {
            let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("name", name);
                document.head.appendChild(tag);
            }
            tag.setAttribute("content", content);
            return tag;
        };

        const setCanonical = (href: string) => {
            let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement("link");
                link.setAttribute("rel", "canonical");
                document.head.appendChild(link);
            }
            link.setAttribute("href", href);
            return link;
        };

        const metaDesc = setMeta("description", description);
        const canonical = setCanonical(window.location.href);

        const ld = {
            "@context": "https://schema.org", "@type": "ItemList",
            name: title,
            description,
            itemListElement: [...themesList]
                .sort((a, b) => b.count - a.count)
                .map((t, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: t.name,
                    additionalProperty: [{ "@type": "PropertyValue", name: "count", value: t.count }],
                })),
        };
        const ldScript = document.createElement("script");
        ldScript.type = "application/ld+json";
        ldScript.text = JSON.stringify(ld);
        document.head.appendChild(ldScript);

        return () => {
            if (ldScript && document.head.contains(ldScript)) document.head.removeChild(ldScript);
            if (metaDesc && !metaDesc.getAttribute("data-global")) { void 0; }
            if (canonical && !canonical.getAttribute("data-global")) { void 0; }
        };
    }, [project, themesList]);

    // Initialize with most frequent theme
    useEffect(() => {
        if (!selectedTheme && themesList.length > 0) {
            const sortedThemes = [...themesList].sort((a, b) => b.count - a.count);
            setSelectedTheme(sortedThemes[0]);
        }
    }, [selectedTheme, themesList]);

    const total = useMemo(() => themesList.reduce((s, t) => s + t.count, 0), [themesList]);

    const [activeTab, setActiveTab] = useState<'synthesis' | 'verbatims'>('synthesis');

    if (themesLoading || messagesLoading) {
        return (
            <main className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </main>
        );
    }

    return (
        <div className="pb-20">
            <PageHeader
                title="Analyse Thématique"
                description={project?.title}
                badge={`${themesList.length} thèmes`}
                icon={<Tags className="h-5 w-5" />}
            />

            {/* Mobile Sticky Theme Selector */}
            <div className="sticky top-14 left-0 right-0 z-40 lg:hidden -mx-4 px-4 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] transition-all py-1.5 flex items-center justify-between gap-4">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className="flex-1 justify-between gap-3 h-10 px-4 bg-black/[0.03] border-none rounded-2xl group hover:bg-black/[0.05] transition-all"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div 
                                    className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: selectedTheme?.color }} 
                                />
                                <span className="text-[11px] font-bold text-foreground/80 truncate uppercase tracking-wider">
                                    {selectedTheme?.name || "Choisir un thème"}
                                </span>
                            </div>
                            <ChevronDown className="h-3 w-3 text-muted-foreground/50 group-data-[state=open]:rotate-180 transition-transform" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-h-[60vh] border-none bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl p-2 z-[70] overflow-y-auto overflow-x-hidden no-scrollbar">
                        {[...themesList].sort((a,b) => b.count - a.count).map((theme) => (
                            <DropdownMenuItem 
                                key={theme.id}
                                className={cn(
                                    "flex items-center justify-between gap-4 p-3 rounded-xl transition-all cursor-pointer font-medium text-xs",
                                    selectedTheme?.id === theme.id ? "bg-primary/10 text-primary font-bold" : "hover:bg-black/[0.03]"
                                )}
                                onClick={() => setSelectedTheme(theme)}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                     <div 
                                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                                        style={{ backgroundColor: theme.color }} 
                                    />
                                    <span className="truncate">{theme.name}</span>
                                </div>
                                <span className="opacity-30 text-[10px] uppercase font-bold tabular-nums tracking-widest">{theme.count}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-8 lg:mt-12 overflow-visible">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
                    {/* Column 1 - Theme selector - Sticky sidebar (Desktop Only) */}
                    <aside className="hidden lg:flex lg:col-span-3 sticky top-6 self-start h-[calc(100vh-6rem)] flex-col z-20">
                        <ThemeSelector
                            themes={themesList}
                            selectedTheme={selectedTheme}
                            onThemeSelect={setSelectedTheme}
                            total={total}
                        />
                    </aside>

                    {/* Column 2 & 3 - Responsive Layout */}
                    <div className="lg:col-span-9">
                        <div className="w-full">
                            {/* Tabs Trigger for Mobile */}
                            <div className="lg:hidden w-full h-11 bg-black/[0.03] p-1.5 rounded-2xl mb-6 grid grid-cols-2">
                                <button 
                                    onClick={() => setActiveTab('synthesis')}
                                    className={cn(
                                        "rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                        activeTab === 'synthesis' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground/60"
                                    )}
                                >
                                    <LayoutGrid className="h-3 w-3" />
                                    Analyse
                                </button>
                                <button 
                                    onClick={() => setActiveTab('verbatims')}
                                    className={cn(
                                        "rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                        activeTab === 'verbatims' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground/60"
                                    )}
                                >
                                    <MessageSquareQuote className="h-3 w-3" />
                                    Verbatims
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-9 gap-12 lg:gap-8 items-start">
                                {/* Theme Details */}
                                <div className={cn(
                                    "lg:col-span-5 focus-visible:outline-none",
                                    activeTab === 'synthesis' ? "block" : "hidden lg:block"
                                )}>
                                    {selectedTheme && (
                                        <ThemeSynthesis theme={selectedTheme} projectId={projectId!} />
                                    )}
                                </div>

                                {/* Associated messages */}
                                <div className={cn(
                                    "lg:col-span-4 lg:block focus-visible:outline-none",
                                    activeTab === 'verbatims' ? "block" : "hidden lg:block"
                                )}>
                                    <section className="lg:border-l lg:border-border/50 lg:pl-8 lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:z-20">
                                        {selectedTheme && (
                                            <MessageList
                                                theme={selectedTheme}
                                                onThemeSelect={setSelectedTheme}
                                                messages={allMessages}
                                                allThemes={themesList}
                                                projectId={projectId!}
                                            />
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

