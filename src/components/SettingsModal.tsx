import { useState } from "react";
import { Database, Plus, Trash2, Check, X, Moon, Laptop, Sun, Settings, HelpCircle, ChevronDown, ExternalLink, Pencil } from "lucide-react";
import { NotionPageSelector } from "@/components/NotionPageSelector";
import { useNotionSettings } from "@/hooks/useNotionSettings";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { profiles, addProfile, removeProfile, updateProfile, addPageToProfile, removePageFromProfile } = useNotionSettings();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<"general" | "notion">("notion");

    // New profile state
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newToken, setNewToken] = useState("");
    const [newPageId, setNewPageId] = useState("");
    const [newPageTitle, setNewPageTitle] = useState("");
    const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

    const handleAddProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName && newToken && (editingProfileId || newPageId)) {
            if (editingProfileId) {
                // When editing, we now just update name/token. Pages are handled separately in the UI below or we could update active page here?
                // Actually, for simplicity, let's just update name/token here.
                updateProfile(editingProfileId, {
                    name: newName,
                    token: newToken,
                });

                // If a new page was selected during edit (and not just present), add it?
                // The inputs are cleared, so assume user might want to add *another* page.
                if (newPageId && newPageId !== "unused") {
                    // Logic handled by specific add button now?
                    // Let's stick to: "Save Profile" saves the core info. 
                    // Adding pages is immediate or part of this?
                    // Let's make "Add Page" a separate action in edit mode to be clear.
                    // But for "New Profile", we need initial page.
                }
            } else {
                addProfile(newName, newToken, { id: newPageId, title: newPageTitle || newPageId });
            }
            resetForm();
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingProfileId(null);
        setNewName("");
        setNewToken("");
        setNewPageId("");
        setNewPageTitle("");
    };

    const handleEditClick = (profile: any) => {
        setEditingProfileId(profile.id);
        setNewName(profile.name);
        setNewToken(profile.token);
        setNewName(profile.name);
        setNewToken(profile.token);
        setNewPageId(""); // Clear page input for adding NEW pages
        setNewPageTitle("");
        setIsAdding(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
                <div className="flex h-[600px]">
                    {/* Sidebar */}
                    <div className="w-48 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                        <h2 className="font-bold text-lg px-2 mb-4 dark:text-white">Settings</h2>
                        <button
                            onClick={() => setActiveTab("notion")}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                                activeTab === "notion" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <Database className="w-4 h-4" />
                            Notion Config
                        </button>
                        <button
                            onClick={() => setActiveTab("general")}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                                activeTab === "general" ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <Settings className="w-4 h-4" />
                            General
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {activeTab === "notion" ? "Notion Profiles" : "General Settings"}
                            </h3>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        {activeTab === "general" && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Appearance</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setTheme("light")}
                                            className={cn(
                                                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                                theme === "light" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                            )}
                                        >
                                            <Sun className="w-6 h-6 text-yellow-500" />
                                            <span className="text-sm font-medium">Light</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme("dark")}
                                            className={cn(
                                                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                                theme === "dark" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                            )}
                                        >
                                            <Moon className="w-6 h-6 text-blue-500" />
                                            <span className="text-sm font-medium">Dark</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme("system")}
                                            className={cn(
                                                "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                                theme === "system" ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                                            )}
                                        >
                                            <Laptop className="w-6 h-6 text-zinc-500" />
                                            <span className="text-sm font-medium">System</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notion" && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {profiles.map(profile => (
                                        <div key={profile.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 group">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{profile.name}</h4>
                                                    <p className="text-xs text-zinc-500 font-medium mt-1">
                                                        {profile.pages.length} Pages Configured
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditClick(profile)}
                                                        className="text-zinc-400 hover:text-indigo-500 p-1"
                                                        title="Edit Profile"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeProfile(profile.id)}
                                                        className="text-zinc-400 hover:text-red-500 p-1"
                                                        title="Delete Profile"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {!isAdding ? (
                                        <button
                                            onClick={() => setIsAdding(true)}
                                            className="w-full py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add New Profile
                                        </button>
                                    ) : (
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-4 animate-in fade-in slide-in-from-top-2">

                                            {/* Setup Guide */}
                                            <details className="group">
                                                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 list-none mb-2 select-none">
                                                    <HelpCircle className="w-4 h-4" />
                                                    How to get these keys?
                                                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                                </summary>
                                                <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/30 text-xs text-zinc-600 dark:text-zinc-400 space-y-2 pb-2">
                                                    <p>1. Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" className="text-zinc-900 dark:text-zinc-200 underline inline-flex items-center gap-1">Notion Integrations <ExternalLink className="w-3 h-3" /></a>.</p>
                                                    <p>2. Create a new integration & copy the "Internal Integration Secret".</p>
                                                    <p>3. Go to your target Page in Notion.</p>
                                                    <p>4. Click <code>...</code> &gt; <code>Connections</code> &gt; <code>Add connections</code> &gt; Select your integration.</p>
                                                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md">
                                                        Important: Search only works if the integration is connected to the page!
                                                    </div>
                                                </div>
                                            </details>

                                            <form onSubmit={handleAddProfile} className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Profile Name</label>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newName}
                                                        onChange={e => setNewName(e.target.value)}
                                                        placeholder="e.g. Personal Workspace"
                                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Integration Token</label>
                                                    <input
                                                        type="password"
                                                        value={newToken}
                                                        onChange={e => setNewToken(e.target.value)}
                                                        placeholder="secret_..."
                                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Target Page</label>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <NotionPageSelector
                                                                token={newToken}
                                                                value={newPageId}
                                                                onChange={(id, title) => {
                                                                    setNewPageId(id);
                                                                    if (title) setNewPageTitle(title);

                                                                    if (editingProfileId && id && title) {
                                                                        addPageToProfile(editingProfileId, { id, title });
                                                                        setNewPageId("");
                                                                        setNewPageTitle("");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        {editingProfileId && (
                                                            <button
                                                                type="button"
                                                                disabled={!newPageId}
                                                                onClick={() => {
                                                                    if (newPageId) {
                                                                        addPageToProfile(editingProfileId, { id: newPageId, title: newPageTitle || newPageId });
                                                                        setNewPageId("");
                                                                        setNewPageTitle("");
                                                                    }
                                                                }}
                                                                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Manually Add Page ID"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 mt-1">
                                                        {editingProfileId ? "Search and select a page to add it." : "Select the first page for this profile."}
                                                    </p>

                                                    {/* List of pages when editing */}
                                                    {editingProfileId && (
                                                        <div className="mt-2 space-y-1">
                                                            {profiles.find(p => p.id === editingProfileId)?.pages.map(page => (
                                                                <div key={page.id} className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                                                                    <span className="truncate flex-1">{page.title}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePageFromProfile(editingProfileId, page.id)}
                                                                        className="text-zinc-400 hover:text-red-500 ml-2"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        type="submit"
                                                        disabled={!newName || !newToken || (!editingProfileId && !newPageId)}
                                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Save Profile
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={resetForm}
                                                        className="px-4 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-2 rounded-lg text-sm font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
