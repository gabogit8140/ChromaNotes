import { useState, useEffect } from "react";
import { Loader2, Search, Check, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

import { notionClient } from "@/lib/notion-client";

interface NotionPageSelectorProps {
    token: string;
    value: string;
    onChange: (pageId: string, pageTitle?: string) => void;
}

interface SearchResult {
    id: string;
    title: string;
    icon: string | null;
    url: string;
}

export function NotionPageSelector({ token, value, onChange }: NotionPageSelectorProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && token && isOpen) {
                performSearch(query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, token, isOpen]);



    // ... inside component ...

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const results = await notionClient.searchPages(token, searchQuery);
            setResults(results);
        } catch (err: any) {
            setError("Failed to search pages");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste Page ID or Search..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm"
                    onFocus={() => setIsOpen(true)}
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Search Input inside dropdown for refinement */}
                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search page name..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm focus:outline-none"
                            />
                            {isLoading && <Loader2 className="absolute right-2 top-2 w-3 h-3 animate-spin text-zinc-400" />}
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-1">
                        {results.length === 0 && !isLoading && query && (
                            <div className="p-3 text-center text-xs text-zinc-500">No pages found</div>
                        )}

                        {results.map(page => (
                            <button
                                key={page.id}
                                onClick={() => {
                                    onChange(page.id, page.title);
                                    setIsOpen(false);
                                    setQuery("");
                                }}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                                    value === page.id && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                )}
                            >
                                <span className="text-lg">{page.icon || "📄"}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{page.title}</div>
                                    <div className="text-[10px] text-zinc-400 truncate font-mono">{page.id}</div>
                                </div>
                                {value === page.id && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-500 hover:text-zinc-900 border-t border-zinc-100 dark:border-zinc-800"
                    >
                        Close Search
                    </button>
                </div>
            )}
        </div>
    );
}
