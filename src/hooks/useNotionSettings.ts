import { useState, useEffect } from 'react';

export interface NotionPage {
    id: string;
    title: string;
}

export interface NotionProfile {
    id: string;
    name: string;
    token: string;
    pages: NotionPage[];
}

const STORAGE_KEY = 'chromanotes-settings';

interface SettingsState {
    profiles: NotionProfile[];
    activeProfileId: string | null;
    activePageId: string | null;
}

export function useNotionSettings() {
    const [profiles, setProfiles] = useState<NotionProfile[]>([]);
    const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Schema Migration: Convert flat pageId/pageTitle to pages array
                const migratedProfiles = (parsed.profiles || []).map((p: any) => {
                    if (!p.pages && p.pageId) {
                        return {
                            ...p,
                            pages: [{ id: p.pageId, title: p.pageTitle || p.pageId }],
                            pageId: undefined, // Cleanup
                            pageTitle: undefined
                        };
                    }
                    return p;
                });

                setProfiles(migratedProfiles);
                setActiveProfileId(parsed.activeProfileId || null);
                setActivePageId(parsed.activePageId || null);
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (!isLoaded) return;
        const state: SettingsState = {
            profiles,
            activeProfileId,
            activePageId
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [profiles, activeProfileId, activePageId, isLoaded]);

    const addProfile = (name: string, token: string, firstPage: NotionPage) => {
        const newProfile: NotionProfile = {
            id: crypto.randomUUID(),
            name: name || 'Untitled',
            token,
            pages: [firstPage]
        };
        setProfiles(prev => [...prev, newProfile]);
        if (profiles.length === 0) {
            setActiveProfileId(newProfile.id);
            setActivePageId(firstPage.id);
        }
    };

    const updateProfile = (id: string, updates: Partial<NotionProfile>) => {
        setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const addPageToProfile = (profileId: string, page: NotionPage) => {
        setProfiles(prev => prev.map(p => {
            if (p.id === profileId) {
                // Avoid duplicates
                if (p.pages.some(existing => existing.id === page.id)) return p;
                return { ...p, pages: [...p.pages, page] };
            }
            return p;
        }));
    };

    const removePageFromProfile = (profileId: string, pageId: string) => {
        setProfiles(prev => prev.map(p => {
            if (p.id === profileId) {
                return { ...p, pages: p.pages.filter(page => page.id !== pageId) };
            }
            return p;
        }));
        if (activePageId === pageId) {
            setActivePageId(null);
        }
    };

    const removeProfile = (id: string) => {
        setProfiles(prev => prev.filter(p => p.id !== id));
        if (activeProfileId === id) {
            setActiveProfileId(null);
            setActivePageId(null);
        }
    };

    const activeProfile = profiles.find(p => p.id === activeProfileId) || null;
    const activePage = activeProfile?.pages.find(p => p.id === activePageId) || activeProfile?.pages[0] || null;

    return {
        profiles,
        activeProfile,
        activePage,
        setActiveProfileId,
        setActivePageId,
        addProfile,
        updateProfile,
        removeProfile,
        addPageToProfile,
        removePageFromProfile,
        isLoaded
    };
}

export type NotionSettings = ReturnType<typeof useNotionSettings>;
