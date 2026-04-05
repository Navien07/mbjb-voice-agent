# Architecture

**Analysis Date:** 2026-04-05

## Pattern Overview

**Overall:** Single-page client-side application with an external real-time voice AI service

**Key Characteristics:**
- No backend — all AI processing is delegated to the ElevenLabs Conversational AI platform
- All interactive logic runs in the browser via React client components (`"use client"`)
- SSR is explicitly disabled for the voice agent via `next/dynamic` with `ssr: false`
- State lives entirely in `VoiceAgent`; child components are purely presentational or canvas-based

## Layers

**Page Layer:**
- Purpose: Defines the application shell, branding, and static topic data
- Location: `src/app/page.tsx`
- Contains: Layout structure (header, main, footer), topic constants, dynamic import of VoiceAgent
- Depends on: `src/components/VoiceAgent.tsx` (loaded dynamically)
- Used by: Next.js App Router as the root route (`/`)

**Root Layout Layer:**
- Purpose: Global HTML shell, font loading, metadata
- Location: `src/app/layout.tsx`
- Contains: `<html>` / `<body>` wrapper, Inter font config, Next.js Metadata export
- Depends on: `src/app/globals.css`
- Used by: All pages in the app

**Orchestrator Component:**
- Purpose: Voice session lifecycle management and state coordination
- Location: `src/components/VoiceAgent.tsx`
- Contains: ElevenLabs session logic, message accumulation, orb state machine, text input handling
- Depends on: `@elevenlabs/react` (ConversationProvider, useConversation), `VoiceOrb`, `WaveformVisualizer`, `ConversationPanel`
- Used by: `src/app/page.tsx`

**Visual Components Layer:**
- Purpose: Stateless or animation-only UI components that receive props from VoiceAgent
- Location: `src/components/`
- Contains:
  - `VoiceOrb.tsx` — Canvas-based animated orb reflecting agent state and real-time volume
  - `WaveformVisualizer.tsx` — Canvas-based bar waveform driven by live volume
  - `ConversationPanel.tsx` — Scrollable transcript of user/agent messages

**Styling Layer:**
- Purpose: Design tokens and global CSS animation keyframes
- Location: `src/app/globals.css`
- Contains: CSS custom properties for the dark theme color palette, Tailwind v4 `@theme inline` mapping, canvas animation keyframes (`orb-idle`, `orb-listening`, `orb-speaking`, `pulse-ring`)
- Depends on: Tailwind CSS v4

## Data Flow

**Voice Conversation Flow:**

1. User clicks "Start Conversation" in `VoiceAgent`
2. `conversation.startSession({ agentId })` connects to ElevenLabs WebSocket
3. `onConnect` callback fires — `orbState` transitions to `"listening"`
4. ElevenLabs streams audio; `onModeChange` toggles `orbState` between `"listening"` and `"speaking"`
5. `onMessage` callback fires with transcript chunks — messages array is updated via `addMessage`
6. `ConversationPanel` re-renders with new messages; auto-scrolls to bottom
7. `VoiceOrb` and `WaveformVisualizer` poll `getInputVolume()` / `getOutputVolume()` on every animation frame
8. User clicks "End Conversation" — `conversation.endSession()` called, `orbState` resets to `"idle"`

**Text Message Flow:**

1. User types in the text input inside `VoiceAgent`
2. On Enter or Send click: `conversation.sendUserMessage(text)` sends to ElevenLabs
3. ElevenLabs response arrives via `onMessage` callback — same path as voice

**State Management:**
- All state is local React (`useState`) inside `VoiceAgentInner`
- `messages: Message[]` — accumulated transcript
- `orbState: "idle" | "connecting" | "listening" | "speaking"` — drives visual state of orb and status label
- `textInput: string` — controlled text field value
- No global store; no Context beyond `ConversationProvider` from ElevenLabs SDK

## Key Abstractions

**OrbState:**
- Purpose: Represents the agent's current activity mode
- Type: `"idle" | "connecting" | "listening" | "speaking"` (defined in `VoiceAgent.tsx`)
- Drives: status label text, orb gradient, ring animation, waveform bar height

**Message:**
- Purpose: A single transcript entry
- Definition: `src/components/ConversationPanel.tsx` exports the `Message` interface
- Shape: `{ id: string; role: "user" | "agent"; text: string; timestamp: Date }`

**ConversationProvider:**
- Purpose: ElevenLabs context provider wrapping the inner voice component
- Source: `@elevenlabs/react`
- Pattern: Provider wraps `VoiceAgentInner`; inner component calls `useConversation()` hook

## Entry Points

**Root Route (`/`):**
- Location: `src/app/page.tsx`
- Triggers: Next.js App Router file-system routing
- Responsibilities: Renders full-page layout, passes `TOPICS` array to `VoiceAgent`

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Wraps every page automatically by Next.js convention
- Responsibilities: Sets `<html lang>`, applies Inter font, exports SEO metadata

## Error Handling

**Strategy:** Inline try/catch in session handlers; errors are logged to console and state resets

**Patterns:**
- `handleStart` wraps `conversation.startSession()` in try/catch — sets `orbState` back to `"idle"` on failure
- `useConversation` `onError` callback also resets `orbState` to `"idle"`
- No user-visible error UI or toast notifications — failures are silent to the user

## Cross-Cutting Concerns

**Logging:** `console.error` only — used for voice agent connection failures and session start failures
**Validation:** None — text input is trimmed but not length-limited or sanitized beyond that
**Authentication:** None — agent ID is hardcoded as a constant (`AGENT_ID`) in `VoiceAgent.tsx`; ElevenLabs handles auth on the service side

---

*Architecture analysis: 2026-04-05*
