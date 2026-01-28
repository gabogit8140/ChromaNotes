"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // We need to create this util or remove cn

interface DropzoneProps {
    onFileAccepted: (file: File) => void;
}

export function Dropzone({ onFileAccepted }: DropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragActive(false);

            const file = e.dataTransfer.files[0];
            if (file && file.type === "application/pdf") {
                setIsLoading(true);
                // Simulate a small delay for effect or processing
                setTimeout(() => {
                    onFileAccepted(file);
                    setIsLoading(false);
                }, 500);
            }
        },
        [onFileAccepted]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                setIsLoading(true);
                setTimeout(() => {
                    onFileAccepted(file);
                    setIsLoading(false);
                }, 500);
            }
        },
        [onFileAccepted]
    );

    return (
        <div
            className={cn(
                "relative group cursor-pointer flex flex-col items-center justify-center w-full max-w-xl p-10 border-2 border-dashed rounded-3xl transition-all duration-300 ease-in-out",
                isDragActive
                    ? "border-indigo-500 bg-indigo-50/10 scale-102"
                    : "border-gray-200 dark:border-gray-800 hover:border-indigo-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleInputChange}
            />

            <div className="flex flex-col items-center gap-4 text-center">
                <div className={cn(
                    "p-4 rounded-full transition-colors duration-300",
                    isDragActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                )}>
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                </div>

                <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                        {isLoading ? "Processing..." : "Upload your PDF"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Drag & drop or click to browse
                    </p>
                </div>
            </div>

            {/* Decorative background blur */}
            <div className="absolute -z-10 inset-0  bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
}

// Simple utility to avoid external dependency for now if lib/utils doesn't exist
// Actually I'll implement proper cn in lib/utils next.
