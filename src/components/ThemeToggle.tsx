"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className={cn("w-9 h-9", className)} />; // Placeholder to avoid layout shift
    }

    return (
        <div className={cn("flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700", className)}>
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "p-1.5 rounded-full transition-all",
                    theme === "light"
                        ? "bg-white text-yellow-500 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
                title="Light Mode"
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "p-1.5 rounded-full transition-all",
                    theme === "system"
                        ? "bg-white dark:bg-zinc-700 text-indigo-500 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
                title="System Preference"
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-1.5 rounded-full transition-all",
                    theme === "dark"
                        ? "bg-zinc-700 text-blue-400 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
                title="Dark Mode"
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
}
