"use client";

import { useState } from "react";
import { HighlightCard } from "@/components/HighlightCard";
import { SettingsModal } from "@/components/SettingsModal";
import { useNotionSettings } from "@/hooks/useNotionSettings";
import { Loader2, AlertCircle } from "lucide-react";

// Modular imports
import { useHighlights } from "@/hooks/useHighlights";
import { usePDFParser } from "@/hooks/usePDFParser";
import { useNotionExport } from "@/hooks/useNotionExport";

import { AppHeader } from "@/components/AppHeader";
import { FilterBar } from "@/components/FilterBar";
import { EmptyState } from "@/components/EmptyState";

export default function Home() {
  // 1. Core Data & Highlights
  const {
    data,
    setData,
    selectedHighlights,
    filterTags,
    availableTags,
    filteredHighlights,
    toggleHighlight,
    toggleFilterTag,
    addTag,
    addComment,
    deleteHighlight,
    mergeHighlights,
    reset: resetHighlights,
    setFilterTags
  } = useHighlights();

  // 2. Settings
  const notionSettings = useNotionSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 3. Parsing Logic
  const { isParsing, error: parsingError, handleFile, resetError } = usePDFParser({ setData });

  // 4. Export Logic
  const {
    isExporting,
    exportProgress,
    exportUrl,
    handleExport,
    resetExport
  } = useNotionExport({
    activeProfile: notionSettings.activeProfile,
    activePage: notionSettings.activePage,
    data,
    filteredHighlights,
    setIsSettingsOpen
  });

  const reset = () => {
    resetHighlights();
    resetError();
    resetExport();
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] selection:bg-indigo-500/30">

      <AppHeader
        data={data}
        onReset={reset}
        notionSettings={notionSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExport={handleExport}
        isExporting={isExporting}
        exportProgress={exportProgress}
        exportUrl={exportUrl}
        filteredCount={filteredHighlights.length}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Floating Merge Action */}
      {selectedHighlights.size > 1 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <button
            onClick={mergeHighlights}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-full shadow-xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
          >
            Merge {selectedHighlights.size} Abstracts
          </button>
        </div>
      )}

      {/* Main Content - Aligned max-w-4xl */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {!data && !isParsing && (
          <EmptyState onFileAccepted={handleFile} />
        )}

        {isParsing && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-zinc-500 font-medium">Reading your document...</p>
          </div>
        )}

        {parsingError && (
          <div className="max-w-lg mx-auto p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5" />
            <p>{parsingError}</p>
            <button onClick={reset} className="ml-auto font-semibold hover:underline">Try again</button>
          </div>
        )}

        {data && (
          <div className="animate-in fade-in duration-500">

            <FilterBar
              availableTags={availableTags}
              filterTags={filterTags}
              onToggleTag={toggleFilterTag}
              onClear={() => setFilterTags([])}
            />

            <div className="grid grid-cols-1 gap-6">
              {filteredHighlights.map((highlight) => (
                <HighlightCard
                  key={highlight.id}
                  highlight={highlight}
                  isSelected={selectedHighlights.has(highlight.id)}
                  onToggle={toggleHighlight}
                  onTagAdd={addTag}
                  onDelete={deleteHighlight}
                  onCommentChange={addComment}
                />
              ))}

              {data.highlights.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                  <p className="text-zinc-400">No highlights found in this PDF.</p>
                  <p className="text-xs text-zinc-300 mt-2">Ensure you used the Highlight tool, not Underline or Drawing.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main >
  );
}
