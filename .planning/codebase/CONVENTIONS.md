# Coding Conventions

**Analysis Date:** 2026-04-05

## Naming Patterns

**Files:**
- React components: PascalCase filename matching the exported component name (e.g., `VoiceAgent.tsx`, `ConversationPanel.tsx`, `VoiceOrb.tsx`, `WaveformVisualizer.tsx`)
- Next.js app routes: lowercase with Next.js conventions (`src/app/page.tsx`, `src/app/layout.tsx`)
- Config files: camelCase or kebab-case per tool convention (`eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`)

**Functions:**
- Event handlers: `handle` prefix + action noun (e.g., `handleStart`, `handleStop`, `handleTextSend`)
- Callbacks returning values: descriptive verb phrase (e.g., `getInputVolume`, `getOutputVolume`, `addMessage`)
- Internal component functions: camelCase (e.g., `draw`, `resize`)
- Internal "impl" components: PascalCase with `Inner` suffix (e.g., `VoiceAgentInner`)

**Variables:**
- State variables: camelCase noun describing the value (e.g., `messages`, `orbState`, `textInput`, `isConnected`)
- Refs: camelCase with `Ref` suffix (e.g., `canvasRef`, `animFrameRef`, `animRef`, `scrollRef`, `messageIdRef`)
- Constants: SCREAMING_SNAKE_CASE for module-level config (e.g., `AGENT_ID`, `TOPICS`)
- Loop variables: `i`, `r` for standard loop counters

**Types:**
- Union string literal types: PascalCase type alias (e.g., `OrbState`, `AgentState`)
- Props interfaces: PascalCase with `Props` suffix (e.g., `VoiceOrbProps`, `WaveformVisualizerProps`, `ConversationPanelProps`)
- Exported data interfaces: PascalCase noun (e.g., `Message`)
- Union values: lowercase string literals (`"idle" | "connecting" | "listening" | "speaking"`)

## Code Style

**Formatting:**
- Prettier (implicit via eslint-config-next) — 2-space indentation throughout
- Double quotes for JSX attributes and string literals
- Trailing commas in multi-line structures
- Semicolons present

**Linting:**
- ESLint 9 with flat config: `eslint.config.mjs`
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- No custom rule overrides beyond default ignores (`.next/`, `out/`, `build/`)

**TypeScript:**
- `strict: true` in `tsconfig.json` — no implicit `any`
- Explicit type casting used when SDK types are too loose: `const msg = message as { source?: string; message?: string }`
- Non-null assertion (`!`) used for guaranteed refs: `canvas.getContext("2d")!`
- Optional function parameters typed with `?` (e.g., `getInputVolume?: () => number`)
- Default parameter values in function signature (e.g., `barCount = 40`, `color = "#0EA5E9"`)

## Import Organization

**Order:**
1. React core hooks (`useState`, `useCallback`, `useRef`, `useEffect`)
2. Third-party library imports (`@elevenlabs/react`, `next/dynamic`, `next/font/google`)
3. Internal component imports using `@/` path alias (e.g., `@/components/VoiceAgent`)
4. Relative component imports within the same directory (e.g., `./VoiceOrb`, `./ConversationPanel`)
5. Type-only imports via named export on the same import line

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Used for cross-directory imports (e.g., `import VoiceAgent from "@/components/VoiceAgent"`)
- Relative paths (`./`) used for same-directory sibling imports

## Error Handling

**Patterns:**
- `try/catch` blocks on all async event handlers that initiate sessions (e.g., `handleStart` in `src/components/VoiceAgent.tsx`)
- Errors logged to `console.error` with a descriptive prefix string before the error value
- UI state reset to a safe fallback on error (e.g., `setOrbState("idle")` in catch blocks)
- SDK callback errors handled via `onError` hook provided to `useConversation`
- No error boundaries or custom error UI components — errors silently reset state

## Logging

**Framework:** Native `console.error` only

**Patterns:**
- Used exclusively for SDK/async errors, not informational logging
- Format: descriptive string followed by the error value — `console.error("Voice agent error:", error)`
- No `console.log` or `console.warn` present in source

## Comments

**When to Comment:**
- Inline JSX section labels as HTML comments to delineate layout regions (e.g., `{/* Header */}`, `{/* Left: Orb + Controls */}`, `{/* Orb */}`)
- Canvas drawing logic annotated with brief noun labels (e.g., `// Outer glow rings`, `// Main orb with distortion`, `// Inner bright core`)
- No function-level JSDoc/TSDoc present anywhere

**JSDoc/TSDoc:**
- Not used — types and interfaces document intent via TypeScript types directly

## Function Design

**Size:** Functions kept short and single-purpose; canvas `draw` function is the longest at ~80 lines due to imperative rendering logic

**Parameters:**
- Props destructured at the function signature level
- Optional props given defaults either in the signature (primitives) or via conditional checks in the body
- Callbacks passed as props use function type signatures with no parameter names (e.g., `() => number`)

**Return Values:**
- Components return JSX directly — no intermediate variables
- Hooks return void or use state setters
- Utility callbacks (`getInputVolume`, `getOutputVolume`) return `0` as a safe default

## Module Design

**Exports:**
- One default export per file — always the primary component
- Named exports used for shared types only: `export interface Message` in `src/components/ConversationPanel.tsx`
- No barrel `index.ts` files

**Client Directives:**
- All interactive components declare `"use client"` at the top of the file
- Server components (layout, page) have no directive — rely on Next.js defaults
- `dynamic()` import with `ssr: false` used in `src/app/page.tsx` to lazy-load `VoiceAgent` and prevent SSR hydration issues with browser APIs

**Provider Pattern:**
- `ConversationProvider` from `@elevenlabs/react` wraps the inner component
- Inner implementation extracted as `VoiceAgentInner` — receives props, uses hooks
- Public export `VoiceAgent` is the provider wrapper with default props

---

*Convention analysis: 2026-04-05*
