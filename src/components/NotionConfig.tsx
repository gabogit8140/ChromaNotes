"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Database } from "lucide-react";

interface NotionConfigProps {
    onConfigChange: (token: string, pageId: string) => void;
}

export function NotionConfig({ onConfigChange }: NotionConfigProps) {
    const [token, setToken] = useState("");
    const [pageId, setPageId] = useState("");
    const [showToken, setShowToken] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("notion_token");
        const storedPageId = localStorage.getItem("notion_page_id");
        if (storedToken) setToken(storedToken);
        if (storedPageId) setPageId(storedPageId);

        if (storedToken && storedPageId) {
            onConfigChange(storedToken, storedPageId);
        }
    }, [onConfigChange]);

    const handleSave = () => {
        localStorage.setItem("notion_token", token);
        localStorage.setItem("notion_page_id", pageId);
        onConfigChange(token, pageId);
    };

    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Notion Configuration
            </h3>

            <div className="space-y-3">
                <div className="relative">
                    <label className="text-xs font-medium text-zinc-500 ml-1 mb-1 block">Integration Token</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                        <input
                            type={showToken ? "text" : "password"}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            onBlur={handleSave}
                            placeholder="secret_..."
                            className="w-full pl-9 pr-10 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <button
                            className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                            onClick={() => setShowToken(!showToken)}
                        >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-zinc-500 ml-1 mb-1 block">Page / Database ID</label>
                    <input
                        type="text"
                        value={pageId}
                        onChange={(e) => setPageId(e.target.value)}
                        onBlur={handleSave}
                        placeholder="32 character ID"
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Credentials are stored locally in your browser.
            </p>
        </div>
    );
}
