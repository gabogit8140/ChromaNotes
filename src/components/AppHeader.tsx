import { CheckCircle, ChevronDown, Database, Loader2, Settings, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParsedPDF } from "@/lib/pdf-parsing";
import { NotionSettings } from "@/hooks/useNotionSettings";

interface AppHeaderProps {
    data: ParsedPDF | null;
    onReset: () => void;
    notionSettings: NotionSettings;
    onOpenSettings: () => void;
    onExport: () => void;
    isExporting: boolean;
    exportProgress: number;
    exportUrl: string | null;
    filteredCount: number;
}

export function AppHeader({
    data,
    onReset,
    notionSettings,
    onOpenSettings,
    onExport,
    isExporting,
    exportProgress,
    exportUrl,
    filteredCount
}: AppHeaderProps) {
    const { activeProfile, activePage, profiles, setActiveProfileId, setActivePageId } = notionSettings;

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-zinc-200 dark:border-zinc-800 transition-all">
            {/* MATCHING WIDTH: max-w-4xl to align with cards */}
            <div className="max-w-4xl mx-auto px-6 h-24 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
                    <img src="/logo.png" alt="ChromaNotes Logo" className="w-10 h-10 rounded-xl" />
                    <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white hidden sm:block">
                        ChromaNotes
                    </h1>
                </div>

                {data && (
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={onReset}
                            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            title="New File"
                        >
                            <span className="hidden sm:inline">New File</span>
                            <FilePlus className="w-5 h-5 sm:hidden" />
                        </button>

                        <div className="flex flex-col items-end">
                            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1 hidden sm:block">Target Page</div>
                            {profiles.length > 0 && (
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600">
                                        <Database className="w-3 h-3 text-indigo-500" />
                                        <span className="max-w-[150px] truncate">{activePage?.title || "Select Page"}</span>
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden hidden group-hover:block z-50 p-1 max-h-80 overflow-y-auto">
                                        {profiles.map(p => (
                                            <div key={p.id} className="mb-1">
                                                <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{p.name}</div>
                                                {p.pages.map(page => (
                                                    <button
                                                        key={page.id}
                                                        onClick={() => {
                                                            setActiveProfileId(p.id);
                                                            setActivePageId(page.id);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between group/item pl-4",
                                                            activePage?.id === page.id && activeProfile?.id === p.id
                                                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
                                                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                        )}
                                                    >
                                                        <span className="truncate">{page.title}</span>
                                                        {activePage?.id === page.id && activeProfile?.id === p.id && <CheckCircle className="w-3 h-3" />}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                                        <button
                                            onClick={onOpenSettings}
                                            className="w-full text-left px-3 py-2 text-xs rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                                        >
                                            <Settings className="w-3 h-3" />
                                            Manage Profiles
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!exportUrl ? (
                            <div className="flex flex-col items-end gap-1">
                                {!isExporting && activePage && (
                                    <span className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                                        Exporting <strong className="text-zinc-700 dark:text-zinc-300">{filteredCount}</strong> highlights to <strong className="text-indigo-600 dark:text-indigo-400">{activePage?.title || "Notion"}</strong>
                                    </span>
                                )}

                                {isExporting ? (
                                    <div className="w-48 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300 ease-out"
                                            style={{ width: `${exportProgress}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 z-10 mix-blend-difference">
                                            {exportProgress < 100 ? `Exporting... ${exportProgress}%` : "Finishing..."}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={onExport}
                                        disabled={!activePage}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20",
                                            !activePage
                                                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                                                : "bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-4 h-4 invert brightness-0 grayscale opacity-80" alt="Notion" />
                                        <span className="hidden sm:inline">Export to Notion</span>
                                        <span className="sm:hidden">Export</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <a
                                href={exportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 transition-colors animate-in fade-in"
                            >
                                <CheckCircle className="w-4 h-4" />
                                View
                            </a>
                        )}
                    </div>
                )}

                <button
                    onClick={onOpenSettings}
                    className="ml-4 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
