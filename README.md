# YapTier

**Rank everything. Yap about anything.**

YapTier is an open-source, ad-free tier list maker. Build tier lists with your own images, open icons, and custom text items — all running locally in your browser. No accounts, no tracking, no ads.

![YapTier tier board editor](docs/screenshots/editor.png)

## Features

- **Drag and drop** items between tiers and reorder within tiers (mouse, touch, and keyboard)
- **Upload images** from your device (PNG, JPG, WebP; 5 MB max per file)
- **Search and add icons** from OpenMoji, Fluent Emoji, and Iconify collections, with license and attribution shown per result
- **Custom text items** with automatic proportional sizing
- **Customize tier names and colors**
- **Auto-save** to IndexedDB with localStorage fallback; session restored on refresh
- **Manual Save / Load**, **New List**, and **Clear Board** with confirmation for destructive actions
- **Undo / Redo** (Ctrl+Z / Ctrl+Shift+Z) for moves, removals, additions, and tier edits
- **PNG export** of the board at 2× scale, excluding editor UI
- **JSON export / import** for portable tier lists, with validation of imported files
- **Web Share API** for PNG export where supported, plus copy-to-clipboard
- **How to Use** guide, dismissible announcement banner, and professional footer
- Dark theme, responsive layouts for desktop, tablet, and mobile

## Screenshots

Screenshots below are captured from a local production build (`npm run build && npm run preview`).

- `docs/screenshots/editor.png` — Tier board editor with the collection bar, five tier rows, and the action toolbar.
- `docs/screenshots/find-icons.png` — Icon search dialog with source filtering, category chips, and per-result license info.
- `docs/screenshots/export.png` — Exported PNG rendering tiers, colors, images, and text items without editor controls.

Generate them by running the app locally and capturing each view.

## Installation

```bash
# Clone the repository (replace with your own fork URL)
git clone https://github.com/your-org/yaptier.git
cd yaptier

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview

# Run the test suite
npm test

# Typecheck
npm run typecheck
```

### Configuration

YapTier runs entirely client-side and requires no environment variables to work. Optional footer links are configured through environment variables:

```bash
cp .env.example .env
# Edit .env with your own GitHub repository URL and feedback email
```

| Variable | Description | Example |
|---|---|---|
| `VITE_GITHUB_REPO_URL` | GitHub repository link shown in the footer | `https://github.com/your-org/yaptier` |
| `VITE_FEEDBACK_EMAIL` | Feedback email (`mailto:` link) shown in the footer | `feedback@example.com` |

Never commit `.env`. It is gitignored.

## Project structure

```
src/
  App.tsx             — Application shell and wiring
  main.tsx            — React entry point
  index.css           — Dark theme and component styles
  types.ts            — Core type definitions
  lib/board.ts        — Tier board state and movement logic
  lib/storage/db.ts   — IndexedDB persistence with localStorage fallback
  lib/export/png.ts   — Canvas PNG export
  lib/export/json.ts  — JSON export and validated import
  lib/images.ts       — Image validation
  lib/format.ts       — Text and byte formatting helpers
  lib/ids.ts          — ID generation
  lib/dndCollisions.ts— Drag-and-drop collision detection
  lib/providers/      — Icon search providers (Iconify)
  hooks/useTierEditor.ts — Board state, history, auto-save
  hooks/useIconSearch.ts — Debounced icon search
  hooks/useDebouncedValue.ts
  components/         — UI components (dialogs, tiles, glyphs, etc.)
seo/
  pages.ts            — SEO page content and manifest
  generate.ts         — Static pages, sitemap, robots and structured data
public/
  seo.css             — Styles for generated static pages
  site.webmanifest    — Web app manifest
```

## Icon and image attribution

Icons are fetched from public collections through the Iconify API (`https://api.iconify.design`):

- OpenMoji — https://openmoji.org (license varies per collection)
- Microsoft Fluent Emoji — https://github.com/microsoft/fluentui-emoji
- Iconify — https://iconify.design (collection licenses vary)

Each icon result in YapTier shows its collection name, author (when available), and license. Check each collection's license before publishing tier lists that include its icons. YapTier includes no icon files itself; icons are loaded remotely at search time.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues, proposing features, and submitting pull requests.

YapTier is [MIT licensed](LICENSE). Open-source, ad-free, and free to use.

## Deployment

YapTier is a static site. Build it with `npm run build` and serve the `dist/` directory with any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, nginx, etc.). The build also generates static category and guide pages, `sitemap.xml`, `robots.txt` and a custom `404.html`. `vercel.json` enables clean URLs and production headers on Vercel. A `Dockerfile` and nginx configuration with security headers and a health check are included for container deployments.

See the production build output with:

```bash
npm run build
npm run preview
```

## Security

YapTier stores tier lists in browser storage (IndexedDB/localStorage) only. No data is sent to a server unless you use the Web Share API on your own device. Imported JSON files are validated before loading, and SVG rendering from untrusted sources is not supported.
