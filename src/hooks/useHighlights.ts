import { useState, useMemo } from "react";
import { Highlight, ParsedPDF } from "@/lib/pdf-parsing";

export function useHighlights() {
    const [data, setData] = useState<ParsedPDF | null>(null);
    const [selectedHighlights, setSelectedHighlights] = useState<Set<string>>(new Set());
    const [filterTags, setFilterTags] = useState<string[]>([]);

    // Computed
    const availableTags = useMemo(() => {
        return Array.from(new Set(data?.highlights.flatMap(h => h.tags || []) || [])).sort();
    }, [data]);

    const filteredHighlights = useMemo(() => {
        return data?.highlights.filter(h => {
            if (filterTags.length === 0) return true;
            return filterTags.some(tag => (h.tags || []).includes(tag));
        }) || [];
    }, [data, filterTags]);

    // Actions
    const toggleFilterTag = (tag: string) => {
        setFilterTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const toggleHighlight = (id: string) => {
        const newSet = new Set(selectedHighlights);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedHighlights(newSet);
    };

    const addTag = (id: string, tag: string) => {
        if (!data) return;
        const newHighlights = data.highlights.map(h => {
            if (h.id === id) {
                const tags = h.tags || [];
                if (!tags.includes(tag)) {
                    return { ...h, tags: [...tags, tag] };
                }
            }
            return h;
        });
        setData({ ...data, highlights: newHighlights });
    };

    const addComment = (id: string, comment: string) => {
        if (!data) return;
        const newHighlights = data.highlights.map(h =>
            h.id === id ? { ...h, comment } : h
        );
        setData({ ...data, highlights: newHighlights });
    };

    const deleteHighlight = (id: string) => {
        if (!data) return;
        if (selectedHighlights.has(id)) {
            const newSet = new Set(selectedHighlights);
            newSet.delete(id);
            setSelectedHighlights(newSet);
        }
        const newHighlights = data.highlights.filter(h => h.id !== id);
        setData({ ...data, highlights: newHighlights });
    };

    const mergeHighlights = () => {
        if (!data || selectedHighlights.size < 2) return;

        // Get selected items
        const selectedItems = filteredHighlights.filter(h => selectedHighlights.has(h.id));

        if (selectedItems.length < 2) return;

        // Create new merged item
        const firstItem = selectedItems[0];
        const mergedText = selectedItems.map(h => h.text).join("\n\n");
        const mergedComments = selectedItems.filter(h => h.comment).map(h => h.comment).join("\n---\n");
        const mergedTags = Array.from(new Set(selectedItems.flatMap(h => h.tags || [])));

        const mergedItem: Highlight = {
            ...firstItem,
            id: Math.random().toString(),
            text: mergedText,
            comment: mergedComments,
            tags: mergedTags
        };

        const resultHighlights: Highlight[] = [];
        let inserted = false;

        for (const h of data.highlights) {
            if (selectedHighlights.has(h.id)) {
                if (!inserted) {
                    resultHighlights.push(mergedItem);
                    inserted = true;
                }
                // Skip (remove)
            } else {
                resultHighlights.push(h);
            }
        }

        setData({ ...data, highlights: resultHighlights });
        setSelectedHighlights(new Set()); // Clear selection
    };

    const reset = () => {
        setData(null);
        setFilterTags([]);
        setSelectedHighlights(new Set());
    };

    return {
        data,
        setData,
        selectedHighlights,
        filterTags,
        setFilterTags, // Expose setter just in case
        availableTags,
        filteredHighlights,
        toggleHighlight,
        toggleFilterTag,
        addTag,
        addComment,
        deleteHighlight,
        mergeHighlights,
        reset
    };
}
