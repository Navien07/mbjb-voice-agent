# Codebase Structure

**Analysis Date:** 2026-04-05

## Directory Layout

```
mbjb-voice-agent/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root HTML layout, font, metadata
│   │   ├── page.tsx          # Home page — app shell + VoiceAgent mount
│   │   ├── globals.css       # Design tokens, Tailwind theme, keyframes
│   │   └── favicon.ico       # App favicon
│   └── components/
│       ├── VoiceAgent.tsx    # Orchestrator: session, state, text input
│       ├── VoiceOrb.tsx      # Canvas-animated orb (state-aware)
│       ├── WaveformVisualizer.tsx  # Canvas bar waveform (volume-driven)
│       └── ConversationPanel.tsx   # Scrollable transcript display
├── public/
│   ├── next.svg
│   ├── vercel.svg
│   ├── globe.svg
│   ├── file.svg
│   └── window.svg
├── .planning/
│   └── codebase/             # GSD codebase analysis documents
├── .claude/                  # Claude Code project config
├── next.config.ts            # Next.js configuration (minimal, default)
├── tsconfig.json             # TypeScript strict mode config, @/* alias
├── postcss.config.mjs        # PostCSS config for Tailwind v4
├── eslint.config.mjs         # ESLint with eslint-config-next
├── package.json              # Dependencies and scripts
├── package-lock.json         # npm lockfile
├── CLAUDE.md                 # Claude Code project instructions
├── AGENTS.md                 # Agent/AI conventions reference
└── README.md                 # Project readme
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and global styles
- Contains: `layout.tsx` (root layout), `page.tsx` (home route), `globals.css`, `favicon.ico`
- Key files: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`

**`src/components/`:**
- Purpose: All React UI components used by the app
- Contains: Orchestrator component (`VoiceAgent`), three presentational/canvas components
- Key files: `src/components/VoiceAgent.tsx`, `src/components/ConversationPanel.tsx`

**`public/`:**
- Purpose: Static assets served at the root URL path
- Contains: Default Next.js SVG assets (currently unused by the app UI)
- Generated: No — committed as-is

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents for AI-assisted development
- Generated: Yes (by GSD map-codebase command)
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code project-level configuration
- Generated: No
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Root route — renders app shell and mounts `VoiceAgent`
- `src/app/layout.tsx`: Root layout — wraps all pages with HTML shell and font

**Configuration:**
- `next.config.ts`: Next.js config (currently default/empty)
- `tsconfig.json`: TypeScript config — strict mode on, path alias `@/*` → `./src/*`
- `postcss.config.mjs`: PostCSS / Tailwind v4 build pipeline
- `eslint.config.mjs`: ESLint rules via `eslint-config-next`

**Core Logic:**
- `src/components/VoiceAgent.tsx`: All voice session logic, state, ElevenLabs integration
- `src/components/ConversationPanel.tsx`: Message type definition (`Message` interface) and transcript UI

**Styling:**
- `src/app/globals.css`: All CSS custom properties (design tokens) and animation keyframes

## Naming Conventions

**Files:**
- React components: PascalCase `.tsx` — e.g., `VoiceAgent.tsx`, `VoiceOrb.tsx`
- App Router files: lowercase Next.js conventions — `page.tsx`, `layout.tsx`, `globals.css`
- Config files: lowercase with extension indicator — `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`

**Directories:**
- Feature grouping by Next.js convention: `app/` for routes, `components/` for shared UI
- All lowercase

**Components:**
- Named exports for type-only exports (`Message` interface from `ConversationPanel.tsx`)
- Default exports for all React components

## Where to Add New Code

**New Page/Route:**
- Create `src/app/[route-name]/page.tsx` following App Router file-system convention
- Add layout if needed: `src/app/[route-name]/layout.tsx`

**New UI Component:**
- Place in `src/components/[ComponentName].tsx`
- Use PascalCase filename matching the component's export name
- Add `"use client"` directive if the component uses hooks, browser APIs, or event handlers

**New Canvas Visualizer:**
- Follow the pattern in `src/components/VoiceOrb.tsx` or `src/components/WaveformVisualizer.tsx`
- Use `useRef<HTMLCanvasElement>` + `requestAnimationFrame` loop inside `useEffect`
- Always cancel animation frame on cleanup: `return () => cancelAnimationFrame(ref.current)`

**New Global Styles / Design Tokens:**
- Add CSS custom properties to the `:root` block in `src/app/globals.css`
- Register them in the `@theme inline` block so Tailwind utilities can reference them

**Utilities / Helpers:**
- No `utils/` or `lib/` directory exists yet
- Create `src/lib/` for pure utility functions if needed
- Create `src/hooks/` for reusable custom React hooks

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and dev server cache
- Generated: Yes
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-04-05*
