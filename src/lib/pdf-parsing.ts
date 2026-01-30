import type { TextItem } from "pdfjs-dist/types/src/display/api";

// Removed top-level import and worker initialization to prevent build-time errors
// import * as pdfjsLib from "pdfjs-dist";

// Helper to initialize worker
const initPDF = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    }
    return pdfjsLib;
};

export interface Highlight {
    id: string;
    text: string;
    color: string; // RGB array or hex
    page: number;
    type: string; // 'Highlight'
    image?: string; // Base64 image data
    tags?: string[];

    comment?: string;
    rect?: number[]; // [x1, y1, x2, y2]
}

export interface ParsedPDF {
    title: string;
    highlights: Highlight[];
}

function parseColor(colorArray: number[] | null): string {
    if (!colorArray) return "#FFEB3B"; // Default yellow
    // PDF colors are 0-1 RGB
    const r = Math.round(colorArray[0] * 255);
    const g = Math.round(colorArray[1] * 255);
    const b = Math.round(colorArray[2] * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

// Color mapping logic
const COLOR_MAP: Record<string, string> = {
    "#FFEB3B": "Yellow", // Yellow
    "#FF4081": "Red", // Pink/Red
    "#4CAF50": "Green", // Green
    "#2196F3": "Blue", // Blue
    "#9C27B0": "Purple", // Purple
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s, l];
}

function getColorTag(r: number, g: number, b: number): string {
    const [h, s, l] = rgbToHsl(r, g, b);

    // Filter out very white/grey (low saturation or very high lightness)
    // if (s < 0.1 || l > 0.95) return "Gray"; 

    // Hue ranges (approximate)
    // Red: 0-15, 345-360
    // Orange: 15-45
    // Yellow: 45-75
    // Green: 75-160
    // Blue: 160-260
    // Purple: 260-345

    if (h >= 345 || h <= 15) return "Red";
    if (h > 15 && h <= 45) return "Orange";
    if (h > 45 && h <= 85) return "Yellow"; // Extended slightly for greenish-yellows
    if (h > 85 && h <= 160) return "Green";
    if (h > 160 && h <= 260) return "Blue";
    if (h > 260 && h < 345) return "Purple";

    return "Yellow"; // Fallback
}

// Simple overlap check
function isContained(itemRect: number[], highlightRect: number[]): boolean {
    const [ix, iy, iw, ih] = itemRect; // x, y, width, height (pdf-js returns these in transform usually or we calculate)
    // Actually TextItem has .transform [scaleX, skewY, skewX, scaleY, tx, ty]
    // We need to use the viewport to get rects if possible, or just raw coords if compatible.

    // Simplified: check if item center is within highlight rect
    // Highlight rect (pdf spec): [llx, lly, urx, ury] (Lower-Left X, Lower-Left Y, Upper-Right X, Upper-Right Y)
    const [hLx, hLy, hRx, hRy] = highlightRect;

    // Item is usually a point/line. 
    // Let's assume we pass in x, y, w, h calculated from transform meta
    const itemCx = ix + iw / 2;
    const itemCy = iy + ih / 2;

    return (
        itemCx >= hLx &&
        itemCx <= hRx &&
        itemCy >= hLy &&
        itemCy <= hRy
    );
}

export async function parsePDF(file: File): Promise<ParsedPDF> {
    // Dynamic import to avoid build-time worker issues
    const pdfjsLib = await initPDF();

    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const highlights: Highlight[] = [];

    const metadata = await pdf.getMetadata();
    const title = (metadata.info as any)?.Title || file.name;

    // Create a temporary canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const annotations = await page.getAnnotations();
        const textContent = await page.getTextContent();

        // Filter highlights
        const highlightAnnos = annotations.filter(a => a.subtype === 'Highlight');
        if (highlightAnnos.length === 0) continue;

        // Render page to canvas to extract images
        // We use a scale of 2 for better quality, or 1.5
        const scale = 2;
        const viewport = page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;
        }

        // For text matching, we need a common coordinate system.
        // pdf.js textContent items have `transform` [scaleX, skewY, skewX, scaleY, tx, ty]
        // tx, ty are coordinates in PDF space.
        // Annotations `rect` is also in PDF space [x1, y1, x2, y2].

        for (const anno of highlightAnnos) {
            if (!anno.rect) continue;

            let extractedText = "";

            // We capture all text items that overlap with the highlight rect.
            const overlappingItems = textContent.items.filter((item: any) => {
                if (!item.str || !item.transform) return false;

                const tx = item.transform[4];
                const ty = item.transform[5];
                const itemHeight = item.height || 10;
                const itemWidth = item.width || (item.str.length * 5); // Rough approx

                const [r1, r2, r3, r4] = anno.rect;
                const minX = Math.min(r1, r3);
                const maxX = Math.max(r1, r3);
                const minY = Math.min(r2, r4);
                const maxY = Math.max(r2, r4);

                // Check for intersection
                // Item rect: [tx, ty - itemHeight, tx + itemWidth, ty]
                const itemMinX = tx;
                const itemMaxX = tx + itemWidth;

                // For Y, we broaden range
                const itemMinY = ty - itemHeight;
                const itemMaxY = ty + itemHeight;

                // Intersection check
                const xOverlap = Math.max(0, Math.min(maxX, itemMaxX) - Math.max(minX, itemMinX));
                const yOverlap = Math.max(0, Math.min(maxY, itemMaxY) - Math.max(minY, itemMinY));

                return xOverlap > 0 && yOverlap > 0;
            });

            extractedText = overlappingItems
                .map((item: any) => item.str)
                .join(" ");

            // Extract image
            let image: string | undefined;
            if (context) {
                // anno.rect is [x1, y1, x2, y2] in PDF coordinates (0,0 is bottom-left usually)
                // Viewport converts to canvas coordinates (0,0 is top-left)
                const rect = viewport.convertToViewportRectangle(anno.rect);
                // content rect: [x1, y1, x2, y2]
                // We need x, y, width, height for getImageData
                const minX = Math.min(rect[0], rect[2]);
                const maxX = Math.max(rect[0], rect[2]);
                const minY = Math.min(rect[1], rect[3]);
                const maxY = Math.max(rect[1], rect[3]);

                const width = maxX - minX;
                const height = maxY - minY;

                // Add some padding
                const padding = 10;
                const exX = Math.max(0, minX - padding);
                const exY = Math.max(0, minY - padding);
                const exW = Math.min(canvas.width - exX, width + padding * 2);
                const exH = Math.min(canvas.height - exY, height + padding * 2);

                if (exW > 0 && exH > 0) {
                    const imageData = context.getImageData(exX, exY, exW, exH);
                    const snippetCanvas = document.createElement('canvas');
                    snippetCanvas.width = exW;
                    snippetCanvas.height = exH;
                    const snippetCtx = snippetCanvas.getContext('2d');
                    if (snippetCtx) {
                        snippetCtx.putImageData(imageData, 0, 0);
                        image = snippetCanvas.toDataURL('image/png');
                    }
                }
            }

            if (extractedText.trim() || image) {
                // Calculate tag from color
                let tags: string[] = [];
                if (anno.color) {
                    const r = Math.round(anno.color[0] * 255);
                    const g = Math.round(anno.color[1] * 255);
                    const b = Math.round(anno.color[2] * 255);
                    tags.push(getColorTag(r, g, b));
                }

                highlights.push({
                    id: anno.id || Math.random().toString(),
                    text: extractedText,
                    color: parseColor(anno.color),
                    page: i,
                    type: 'Highlight',
                    image,
                    rect: anno.rect, // Store rect for sorting
                    tags: tags
                });
            }
        }
    }

    // Sort highlights: Page -> Top to Bottom (Y descending) -> Left to Right
    highlights.sort((a, b) => {
        if (a.page !== b.page) return a.page - b.page;

        // PDF Y coordinates usually grow upwards. So higher Y = higher on page = comes first.
        // We want descending Y.
        // rect is [x1, y1, x2, y2]
        const yA = a.rect ? Math.max(a.rect[1], a.rect[3]) : 0;
        const yB = b.rect ? Math.max(b.rect[1], b.rect[3]) : 0;

        // Threshold for "same line"
        if (Math.abs(yA - yB) > 10) {
            return yB - yA; // Descending Y
        }

        const xA = a.rect ? Math.min(a.rect[0], a.rect[2]) : 0;
        const xB = b.rect ? Math.min(b.rect[0], b.rect[2]) : 0;

        return xA - xB; // Ascending X
    });

    return { title, highlights };
}
