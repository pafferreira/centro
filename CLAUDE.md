# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Centro — community center management app (GFA Nossa Casa). React 19 + Vite + TypeScript SPA with Supabase backend and Gemini AI integration. Deployed on Vercel.

## Commands

```bash
npm run dev            # Vite dev server
npm run build          # Production build
npm run preview        # Preview production build locally
npm run release        # Guided release (bumps version, creates git tag)
npm run version:check  # Check version sync across files
```

## Architecture

Views-based SPA with no React Router — navigation is managed through context/state.

- `views/` — Full-page view components (one per major feature: Assistidos, Passes, Rooms, Workers, Dashboard, etc.)
- `components/` — Shared UI components (`shared/`, `Icons.tsx`)
- `context/` — React context for global state
- `hooks/` — Custom hooks
- `services/` — External service clients:
  - `supabaseClient.ts` — Supabase JS client
  - `geminiService.ts` — Google Gemini AI integration (`@google/genai`)
  - `assemblyService.ts` — Assembly/speech service
- `utils/` — Release scripts and version utilities (`.cjs` files)
- `database/` — SQL schema and seed files
- `supabase/` — Supabase project config and migrations
- `schema.sql`, `seed.sql`, `supabase_update.sql` — DB management scripts

**Drag-and-drop**: `@dnd-kit` (core + sortable) with mobile support via `mobile-drag-drop` and `@use-gesture/react`.

**Styling**: No Tailwind — uses plain CSS/CSS modules. `App.css`, `index.css` are the main style files.

**Versioning**: Version is tracked via `metadata.json`. The release script (`utils/release.cjs`) syncs `package.json` and `metadata.json`.

## Skills (AGENTS.md)

This project uses skill files in `antigravity-skills/skills/`:

- `estilo_paf` — Primary skill. Apply to all UI/UX, layout, styling, and design tasks.
- `design_profissional` — Professional design deliverables.
- `ui-ux-designer` — Interface design and design systems.
- `ui-visual-validator` — Visual validation against design system.
- `sql-pro` — Apply to all database, SQL, schema, and Supabase tasks.

**Design System**: Check `design-system/centro/pages/[page-name].md` first for page-specific rules; fall back to `design-system/centro/MASTER-BR.md`.
