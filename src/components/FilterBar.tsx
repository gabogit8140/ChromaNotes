import { getTagColor, cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

interface FilterBarProps {
    availableTags: string[];
    filterTags: string[];
    onToggleTag: (tag: string) => void;
    onClear: () => void;
}

export function FilterBar({ availableTags, filterTags, onToggleTag, onClear }: FilterBarProps) {
    if (availableTags.length === 0) return null;

    return (
        <div className="sticky top-24 z-40 flex flex-wrap items-center gap-2 mb-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
            <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium mr-2">
                <Filter className="w-4 h-4" />
                Filter by:
            </div>
            {availableTags.map(tag => (
                <button
                    key={tag}
                    onClick={() => onToggleTag(tag)}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                        filterTags.includes(tag)
                            ? "shadow-md ring-2 ring-offset-1 " + getTagColor(tag)
                            : "opacity-70 hover:opacity-100 " + getTagColor(tag)
                    )}
                >
                    {tag}
                </button>
            ))}
            {filterTags.length > 0 && (
                <button
                    onClick={onClear}
                    className="ml-auto text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-2 py-1"
                >
                    <X className="w-3 h-3" />
                    Clear
                </button>
            )}
        </div>
    );
}
