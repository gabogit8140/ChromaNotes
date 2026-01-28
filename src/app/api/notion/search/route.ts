import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { token, query } = await req.json();

        if (!token) {
            return NextResponse.json({ error: "Missing Notion token" }, { status: 400 });
        }

        const notion = new Client({ auth: token });

        const response = await notion.search({
            query: query,
            filter: {
                value: "page",
                property: "object",
            },
            sort: {
                direction: "descending",
                timestamp: "last_edited_time",
            },
            page_size: 20,
        });

        const results = response.results.map((page: any) => {
            // Extract title safely
            let title = "Untitled";
            if (page.properties) {
                const titleProp = Object.values(page.properties).find((p: any) => p.type === 'title') as any;
                if (titleProp && titleProp.title && titleProp.title.length > 0) {
                    title = titleProp.title.map((t: any) => t.plain_text).join("");
                }
            }

            // Icon
            let icon = null;
            if (page.icon && page.icon.type === 'emoji') {
                icon = page.icon.emoji;
            }

            return {
                id: page.id,
                title,
                icon,
                url: page.url
            };
        });

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("Notion Search Error:", error);
        return NextResponse.json({ error: error.message || "Failed to search Notion" }, { status: 500 });
    }
}
