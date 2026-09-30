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

**Versioning**: a versão fica em `package.json` (e `package-lock.json`, que precisa estar igual — `npm run version:check`). O fluxo padrão de release é o `release.py` do repositório `pafferreira/dev-tools` (seção abaixo); `metadata.json` não guarda versão.

## Skills (AGENTS.md)

This project uses skill files in `antigravity-skills/skills/`:

- `estilo_paf` — Primary skill. Apply to all UI/UX, layout, styling, and design tasks.
- `design_profissional` — Professional design deliverables.
- `ui-ux-designer` — Interface design and design systems.
- `ui-visual-validator` — Visual validation against design system.
- `sql-pro` — Apply to all database, SQL, schema, and Supabase tasks.

**Design System**: Check `design-system/centro/pages/[page-name].md` first for page-specific rules; fall back to `design-system/centro/MASTER-BR.md`.

## Release e versionamento
O controle de versão usa o `release.py` do repositório **`pafferreira/dev-tools`** (compartilhado por todos os projetos). A configuração deste projeto está em `release.config.json` (versão em `package.json` com `package-lock.json` sincronizado automaticamente; checagem antes do release: `npm run build`; `disable_hooks` evita o `utils/post-commit.cmd`, que reescreve a versão a partir da tag antes de a tag nova existir).

- **Windows:** de dentro da pasta do projeto (`\DEV\centro`): `python ..\dev-tools\release.py patch "texto curto"`.
- **Sessão na nuvem:** anexar `pafferreira/dev-tools` (`add_repo`), clonar e rodar `python /home/user/dev-tools/release.py patch "texto curto" --project <pasta do projeto>`.
- `--dry-run` mostra a versão sem alterar nada. Rodar na branch principal, com a árvore limpa, depois do merge (o script faz push direto na branch atual, sem PR).
- No ambiente de nuvem o push da **tag** costuma falhar (403): o release continua válido e a tag pode ser enviada depois (`git push origin vX.Y.Z`).
- **Fluxos antigos** (`Commit_PAF.cmd`, `npm run release`): continuam no repositório, mas não devem ser usados junto com o `release.py` na mesma alteração. O `Commit_PAF` também commita os arquivos em stage; o `release.py` só roda com a árvore limpa.

### Gatilho "commit"
Quando o usuário pedir somente **"commit"**: (1) commitar o trabalho pendente (o release aborta com a árvore suja); (2) rodar um release **patch** com um texto curto resumindo as alterações, sem pedir confirmação extra; (3) se as mudanças forem maiores (funcionalidade nova, mudança de fluxo ou de contrato, migração de banco), **propor minor ou major e confirmar** antes. Regra de bolso: correção/ajuste → patch; funcionalidade nova → minor; quebra de compatibilidade → major.
