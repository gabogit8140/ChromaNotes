import { Dropzone } from "@/components/Dropzone";
import { Database } from "lucide-react";

interface EmptyStateProps {
    onFileAccepted: (file: File) => void;
}

export function EmptyState({ onFileAccepted }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    Turn PDF highlights into <span className="text-indigo-600">active knowledge.</span>
                </h2>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Upload your highlighted research papers. We extract the colorful insights and organize them directly into your Notion workspace.
                </p>
            </div>

            <Dropzone onFileAccepted={onFileAccepted} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center opacity-60">
                <div className="space-y-2">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mx-auto flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
                        PH
                    </div>
                    <h3 className="font-semibold">Parses Highlights</h3>
                </div>
                <div className="space-y-2">
                    <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl mx-auto flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                        TG
                    </div>
                    <h3 className="font-semibold">Auto-tagging</h3>
                </div>
                <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mx-auto flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <Database className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold">Notion Sync</h3>
                </div>
            </div>
        </div>
    );
}
