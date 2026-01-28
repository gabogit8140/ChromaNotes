import { Highlight } from "@/lib/pdf-parsing";
import { cn, getTagColor } from "@/lib/utils";
import { Copy, BookOpen } from "lucide-react";
import { useState } from "react";

interface HighlightCardProps {
    highlight: Highlight;
    isSelected?: boolean;
    onToggle?: (id: string) => void;
    onTagAdd?: (id: string, tag: string) => void;
    onDelete?: (id: string) => void;
    onCommentChange?: (id: string, comment: string) => void;
}

const colorMap: Record<string, string> = {
    // Basic mapping for common highlight colors if we want beautiful names/badges
    "rgb(255, 255, 0)": "Yellow", // Yellow
    "rgb(255, 0, 0)": "Red",
    "rgb(0, 255, 0)": "Green",
    "rgb(0, 0, 255)": "Blue",
    "rgb(255, 0, 255)": "Magenta",
};

export function HighlightCard({ highlight, isSelected, onToggle, onTagAdd, onDelete, onCommentChange }: HighlightCardProps) {
    const [newTag, setNewTag] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        commitTag();
    };

    const commitTag = () => {
        if (newTag.trim() && onTagAdd) {
            onTagAdd(highlight.id, newTag.trim());
            setNewTag("");
        }
        setIsAddingTag(false);
    };

    const [comment, setComment] = useState(highlight.comment || "");

    const handleCommentBlur = () => {
        if (onCommentChange && comment !== highlight.comment) {
            onCommentChange(highlight.id, comment);
        }
    };

    return (
        <div
            className={cn(
                "group relative p-6 bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300",
                isSelected ? "border-indigo-500 ring-1 ring-indigo-500" : "border-zinc-200 dark:border-zinc-800"
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    {onToggle && (
                        <div className="mr-2 flex items-center">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggle(highlight.id)}
                                className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                        </div>
                    )}
                    <span
                        className="w-3 h-3 rounded-full border border-zinc-200 dark:border-zinc-700"
                        style={{ backgroundColor: highlight.color }}
                    />
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Page {highlight.page}
                    </span>
                </div>
                <button
                    onClick={() => navigator.clipboard.writeText(highlight.text)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy text"
                >
                    <Copy className="w-4 h-4" />
                </button>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(highlight.id); }}
                        className="p-1.5 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete highlight"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                )}
            </div>

            {highlight.image && (
                <div className="mb-4 rounded-lg overflow-y-auto border border-zinc-100 dark:border-zinc-800 max-h-[150px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                    <img
                        src={highlight.image}
                        alt="Highlight extract"
                        className="w-auto max-w-full h-auto object-contain bg-white mx-auto shadow-sm"
                    />
                </div>
            )}

            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-serif mb-4">
                "{highlight.text}"
            </p>

            {onCommentChange && (
                <div className="mb-4 bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                    <label className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                        Personal Note
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onBlur={handleCommentBlur}
                        placeholder="Add your thoughts..."
                        className="w-full text-base bg-white dark:bg-zinc-950 border border-yellow-200 dark:border-yellow-900/50 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-600 focus:border-transparent px-3 py-2 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 resize-none min-h-[3em] shadow-sm"
                        style={{ fieldSizing: "content" } as any}
                    />
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                {highlight.tags?.map(tag => (
                    <span key={tag} className={cn("px-2 py-0.5 text-xs rounded-full font-medium border", getTagColor(tag))}>
                        #{tag}
                    </span>
                ))}

                {onTagAdd && (
                    isAddingTag ? (
                        <form onSubmit={handleAddTag} className="flex items-center gap-1">
                            <input
                                type="text"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder="tag..."
                                className="w-20 px-2 py-0.5 text-xs bg-zinc-50 dark:bg-zinc-800 border-none rounded-md focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                                onBlur={commitTag}
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors font-medium border border-dashed border-zinc-300 dark:border-zinc-700"
                        >
                            + Tag
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
