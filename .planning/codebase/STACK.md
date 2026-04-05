# Technology Stack

**Analysis Date:** 2026-04-05

## Languages

**Primary:**
- TypeScript 5.x (strict mode) - All source files in `src/`
- CSS - `src/app/globals.css` (custom properties + Tailwind v4 utilities)

**Secondary:**
- JavaScript (config files) - `eslint.config.mjs`, `postcss.config.mjs`

## Runtime

**Environment:**
- Node.js (20.x, inferred from `@types/node: ^20`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.2 - App Router, React Server Components, SSR/SSG
  - Config: `next.config.ts`
  - Entry: `src/app/layout.tsx`, `src/app/page.tsx`

**UI:**
- React 19.2.4 - Component rendering
- React DOM 19.2.4 - DOM bindings

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS via `@tailwindcss/postcss` plugin
  - Config: `postcss.config.mjs`
  - Theme: CSS custom properties defined in `src/app/globals.css`
  - No separate `tailwind.config.*` file — uses v4 inline `@theme` block

**Build/Dev:**
- ESLint 9.x - Linting via flat config format
  - Config: `eslint.config.mjs`
  - Extends: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

## Key Dependencies

**Critical:**
- `@elevenlabs/react` ^1.0.2 - ElevenLabs Conversational AI SDK; provides `ConversationProvider`, `useConversation` hook. Used in `src/components/VoiceAgent.tsx`. This is the core integration powering voice sessions.

**Font:**
- `next/font/google` (Inter) - Loaded in `src/app/layout.tsx` with weights 300–700; no external font CDN request at runtime

**Dynamic Import:**
- `next/dynamic` used in `src/app/page.tsx` to lazy-load `VoiceAgent` with `ssr: false` (browser-only, requires Web Audio/MediaDevices APIs)

## Configuration

**Environment:**
- No `.env.example` detected in repository
- Agent ID is hardcoded in `src/components/VoiceAgent.tsx` as `AGENT_ID = "agent_6501kndhqed3ep5sxrgmv32xyqh7"`
- No runtime env vars currently consumed via `process.env`

**Build:**
- `tsconfig.json` - strict TypeScript, target ES2017, path alias `@/*` → `src/*`, bundler module resolution
- `next.config.ts` - empty config (no custom rewrites, headers, or image domains configured)
- `postcss.config.mjs` - only `@tailwindcss/postcss` plugin

**TypeScript:**
- Strict mode enabled (`"strict": true`)
- `noEmit: true` (Next.js handles emit)
- Path alias: `@/*` maps to `./src/*`

## Platform Requirements

**Development:**
- Node.js 20+
- npm
- Browser with MediaDevices/Web Audio API support (required for voice features; VoiceAgent loaded client-side only)

**Production:**
- Any Node.js-compatible hosting (Vercel-ready — default Next.js deployment target implied by `vercel.svg` in `public/`)
- Static assets in `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

---

*Stack analysis: 2026-04-05*
