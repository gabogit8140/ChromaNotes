# ChromaNotes

A PWA to extract highlights from PDFs and export them to Notion.

## Features
- **PDF Upload**: Parse PDF files locally in the browser.
- **Highlight Extraction**: Extract highlighted text and associate it with colors.
- **Notion Export**: Send your notes directly to a Notion page.
- **PWA**: Installable, works offline (for viewing).

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

## Notion Setup
1. Create a Notion Integration at [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Get the **Internal Integration Token**.
3. Share your target Notion Page with the integration (Three dots -> Connect to -> [Your Integration]).
4. Copy the **Page ID** from the URL.
5. Enter these credentials in the ChromaNotes app settings (they are stored locally).

## Deployment
This app can be deployed to Vercel or Firebase Hosting.

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init: `firebase init hosting`
   - Public directory: `.next/server/app` (if SSR) or `out` (if static).
   - Actually for Next.js SSR on Firebase, use `firebase-frameworks` or `next export` if static.
   - For this PWA + API, verify Firebase Cloud Functions support for Next.js.
