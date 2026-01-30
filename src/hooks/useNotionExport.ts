import { useState } from 'react';
import { ParsedPDF, Highlight } from '@/lib/pdf-parsing';
import { NotionSettings } from '@/hooks/useNotionSettings';
import { notionClient, generateHighlightBlocks } from "@/lib/notion-client";

interface UseNotionExportProps {
    activeProfile: NotionSettings['activeProfile'];
    activePage: NotionSettings['activePage'];
    data: ParsedPDF | null;
    filteredHighlights: Highlight[];
    setIsSettingsOpen: (isOpen: boolean) => void;
}

export function useNotionExport({
    activeProfile,
    activePage,
    data,
    filteredHighlights,
    setIsSettingsOpen
}: UseNotionExportProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportUrl, setExportUrl] = useState<string | null>(null);



    // ... inside hook ...

    const handleExport = async () => {
        if (!activeProfile || !data) {
            setIsSettingsOpen(true);
            return;
        }
        const { token } = activeProfile;
        const pageId = activePage?.id;
        if (!token || !pageId) return;

        setIsExporting(true);
        setExportProgress(0);
        setExportUrl(null);
        let successUrl: string | null = null;

        try {
            // 1. Create Page
            const { pageId: newPageId, url } = await notionClient.createPage(token, pageId, data.title);
            successUrl = url;
            setExportUrl(successUrl);
            setExportProgress(5);

            // 2. Group by PDF Page
            const byPage: Record<number, typeof filteredHighlights> = {};
            filteredHighlights.forEach(h => {
                if (!byPage[h.page]) byPage[h.page] = [];
                byPage[h.page].push(h);
            });

            const pages = Object.keys(byPage).map(Number).sort((a, b) => a - b);

            const BATCH_SIZE = 5;
            let totalBatches = 0;
            pages.forEach(p => {
                totalBatches += Math.ceil(byPage[p].length / BATCH_SIZE);
            });

            let completedBatches = 0;

            // 3. Append Batches
            for (const pageNum of pages) {
                const pageHighlights = byPage[pageNum];

                for (let i = 0; i < pageHighlights.length; i += BATCH_SIZE) {
                    const chunk = pageHighlights.slice(i, i + BATCH_SIZE);
                    const isFirstChunk = i === 0;

                    const blocks = [];
                    // Add Page Header
                    if (isFirstChunk) {
                        blocks.push({
                            object: 'block',
                            type: 'heading_2',
                            heading_2: {
                                rich_text: [{ type: 'text', text: { content: `Page ${pageNum}` } }]
                            }
                        });
                    }

                    blocks.push(...generateHighlightBlocks(chunk));

                    await notionClient.appendChildren(token, newPageId, blocks);

                    completedBatches++;
                    const percent = 5 + Math.round((completedBatches / totalBatches) * 95);
                    setExportProgress(Math.min(percent, 99));
                }
            }

            setExportProgress(100);

        } catch (err: any) {
            alert("Export failed: " + err.message);
            setIsExporting(false);
            setExportUrl(null);
        } finally {
            if (successUrl) {
                setIsExporting(false);
            }
        }
    };

    const resetExport = () => {
        setExportUrl(null);
        setExportProgress(0);
        setIsExporting(false);
    };

    return {
        isExporting,
        exportProgress,
        exportUrl,
        handleExport,
        resetExport
    };
}
