# External Integrations

**Analysis Date:** 2026-04-05

## APIs & External Services

**Voice AI:**
- ElevenLabs Conversational AI - Real-time voice agent sessions (speech-to-text, LLM reasoning, text-to-speech)
  - SDK/Client: `@elevenlabs/react` ^1.0.2
  - Auth: Agent ID hardcoded as `AGENT_ID = "agent_6501kndhqed3ep5sxrgmv32xyqh7"` in `src/components/VoiceAgent.tsx`
  - Connection: WebSocket-based session via `conversation.startSession({ agentId })`
  - Events consumed: `onConnect`, `onDisconnect`, `onMessage`, `onError`, `onModeChange`
  - Volume metering: `conversation.getInputVolume()`, `conversation.getOutputVolume()` used by `src/components/VoiceOrb.tsx` and `src/components/WaveformVisualizer.tsx`
  - Text input: `conversation.sendUserMessage(text)` supported alongside voice

**Font CDN:**
- Google Fonts (via Next.js font optimization) - Inter font family loaded in `src/app/layout.tsx`
  - Handled at build time by `next/font/google`; no runtime CDN dependency

## Data Storage

**Databases:**
- None - No database client detected. All state is ephemeral (React `useState` in `src/components/VoiceAgent.tsx`).

**File Storage:**
- Local filesystem only - Static assets served from `public/`

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- None - No authentication layer detected. The app is fully public-facing.
- ElevenLabs agent access is controlled by the hardcoded `agentId` string, not user-level auth.

## Monitoring & Observability

**Error Tracking:**
- None - Errors are logged to `console.error` only (see `src/components/VoiceAgent.tsx` `onError` handler and `handleStart`/`handleStop` catch blocks).

**Logs:**
- Browser console only (`console.error` for voice agent errors)

## CI/CD & Deployment

**Hosting:**
- Vercel implied (`vercel.svg` present in `public/`; standard Next.js deployment)
- No `vercel.json` or `.upsun/` config detected

**CI Pipeline:**
- None detected (no `.github/workflows/` directory)

## Environment Configuration

**Required env vars:**
- None currently consumed at runtime via `process.env`
- Agent ID is hardcoded: move to `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` if multi-environment support is needed

**Secrets location:**
- No `.env` or `.env.example` present in repository

## Browser APIs Required

**MediaDevices (microphone access):**
- Required for voice input; handled internally by `@elevenlabs/react` SDK
- `VoiceAgent` component is loaded with `ssr: false` in `src/app/page.tsx` to prevent server-side rendering errors

**Canvas API:**
- Used directly in `src/components/VoiceOrb.tsx` via `useRef<HTMLCanvasElement>` and `requestAnimationFrame` for real-time orb animation

**Web Audio API:**
- Used indirectly via ElevenLabs SDK for volume metering (`getInputVolume`, `getOutputVolume`)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None - All communication is WebSocket-based via the ElevenLabs SDK session, not HTTP webhooks

---

*Integration audit: 2026-04-05*
