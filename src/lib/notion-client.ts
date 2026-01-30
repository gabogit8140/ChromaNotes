export const NOTION_API_BASE = "https://api.notion.com/v1";
export const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

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

export function generateHighlightBlocks(highlights: any[]) {
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

async function notionFetch(token: string, endpoint: string, options: RequestInit = {}) {
    const url = `${PROXY_URL}${NOTION_API_BASE}${endpoint}`;

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Handle Proxy Activation Requirement specifically for 403
    if (response.status === 403) {
        const text = await response.text();
        if (text.includes("cors-anywhere")) {
            throw new Error("CORS Proxy Check Required. Please visit https://cors-anywhere.herokuapp.com/corsdemo to verify your browser.");
        }
        // If it's a different 403, try to parse it as JSON or throw generic
        try {
            const errorJson = JSON.parse(text);
            throw new Error(errorJson.message || errorJson.error || "Notion API Forbidden");
        } catch (e: any) {
            if (e.message && e.message.includes("CORS Proxy Check")) throw e;
            throw new Error("Notion API Forbidden: " + text);
        }
    }

    // For other non-OK statuses
    if (!response.ok) {
        const data = await response.json().catch(() => ({ message: "Unknown Error" }));
        throw new Error(data.message || data.error || "Notion API Error");
    }

    // Happy path
    const data = await response.json();
    return data;
}

export const notionClient = {
    searchPages: async (token: string, query: string) => {
        const body = {
            query,
            filter: {
                value: 'page',
                property: 'object'
            },
            sort: {
                direction: 'descending',
                timestamp: 'last_edited_time'
            },
            page_size: 20
        };

        const data = await notionFetch(token, "/search", {
            method: "POST",
            body: JSON.stringify(body)
        });

        return data.results.map((page: any) => ({
            id: page.id,
            title: page.properties.title?.title[0]?.plain_text || page.properties.Name?.title[0]?.plain_text || "Untitled",
            icon: page.icon?.emoji || null,
            url: page.url
        }));
    },

    createPage: async (token: string, parentId: string, title: string) => {
        const body = {
            parent: { page_id: parentId },
            properties: {
                title: [{ text: { content: title || "PDF Notes Export" } }],
            },
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
        };

        const data = await notionFetch(token, "/pages", {
            method: "POST",
            body: JSON.stringify(body)
        });

        return {
            pageId: data.id,
            url: data.url
        };
    },

    appendChildren: async (token: string, blockId: string, blocks: any[]) => {
        const body = {
            children: blocks
        };

        await notionFetch(token, `/blocks/${blockId}/children`, {
            method: "PATCH",
            body: JSON.stringify(body)
        });
    }
};
