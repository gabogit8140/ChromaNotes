import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

// Helper to map tag names to Notion colors
function getNotionColor(tag: string): string {
    const t = tag.toLowerCase();
    if (t.includes('red') || t.includes('important')) return 'red';
    if (t.includes('pink')) return 'pink';
    if (t.includes('purple') || t.includes('idea')) return 'purple';
    if (t.includes('blue')) return 'blue';
    if (t.includes('green') || t.includes('action')) return 'green';
    if (t.includes('yellow')) return 'yellow';
    if (t.includes('orange')) return 'orange';
    return 'gray';
}

function generateHighlightBlocks(highlights: any[]) {
    const blocks: any[] = [];
    highlights.forEach((h: any) => {
        // 1. Highlight Text (Quote Block)
        blocks.push({
            object: 'block',
            type: 'quote',
            quote: {
                rich_text: [{
                    type: 'text',
                    text: { content: h.text },
                    annotations: { italic: true }
                }],
                color: "default"
            }
        });

        // 2. Personal Note (Callout Block - Yellow)
        if (h.comment && h.comment.trim()) {
            blocks.push({
                object: 'block',
                type: 'callout',
                callout: {
                    rich_text: [{
                        type: 'text',
                        text: { content: h.comment }
                    }],
                    icon: { type: 'emoji', emoji: '📝' },
                    color: 'yellow_background'
                }
            });
        }

        // 3. Tags (Colored Text Paragraph)
        if (h.tags && h.tags.length > 0) {
            const tagRichText = h.tags.flatMap((tag: string, index: number) => {
                const color = getNotionColor(tag);
                return [
                    {
                        type: 'text',
                        text: { content: `#${tag}` },
                        annotations: { color: color }
                    },
                    index < h.tags.length - 1 ? { type: 'text', text: { content: "  " } } : null
                ].filter(Boolean);
            });

            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: tagRichText
                }
            });
        }

        // 4. Divider
        blocks.push({
            object: 'block',
            type: 'divider',
            divider: {}
        });
    });
    return blocks;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action } = body;

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 400 });
        }

        const notion = new Client({ auth: token });

        if (action === 'create') {
            const { pageId, title } = body;
            const response = await notion.pages.create({
                parent: { page_id: pageId } as any,
                properties: {
                    title: [{ text: { content: title || "PDF Notes Export" } }],
                } as any,
                icon: { type: "emoji", emoji: "📑" },
                children: [
                    {
                        object: 'block',
                        type: 'heading_1',
                        heading_1: {
                            rich_text: [{ type: 'text', text: { content: title || "PDF Highlights" } }]
                        }
                    }
                ]
            });
            return NextResponse.json({ success: true, pageId: response.id, url: (response as any).url });
        }

        if (action === 'append_page') {
            const { blockId, pageNumber, highlights } = body;

            const blocks = [];

            // Add Page Header
            if (pageNumber) {
                blocks.push({
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: `Page ${pageNumber}` } }]
                    }
                });
            }

            // Add Highlights
            blocks.push(...generateHighlightBlocks(highlights));

            await notion.blocks.children.append({
                block_id: blockId,
                children: blocks
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Notion Error:", error);
        return NextResponse.json({ error: error.message || "Failed to export" }, { status: 500 });
    }
}
