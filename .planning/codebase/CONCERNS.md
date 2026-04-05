# Codebase Concerns

**Analysis Date:** 2026-04-05

## Tech Debt

**Hardcoded ElevenLabs Agent ID:**
- Issue: The ElevenLabs agent ID is hardcoded as a string literal constant directly in the component file, not sourced from an environment variable.
- Files: `src/components/VoiceAgent.tsx` (line 9: `const AGENT_ID = "agent_6501kndhqed3ep5sxrgmv32xyqh7";`)
- Impact: Changing the agent (e.g. for staging vs production environments) requires a code change and redeploy. The agent ID is also committed to git history, making it trivially public.
- Fix approach: Move to `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` environment variable. Read via `process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID` and throw at startup if missing.

**Hardcoded TOPICS array in page component:**
- Issue: The list of supported topics is a static array defined at module scope in the page file with no admin interface or config source.
- Files: `src/app/page.tsx` (lines 14–21)
- Impact: Adding or removing topics requires a code change, preventing non-developer updates. Topics are also not localised despite the app serving Bahasa Melayu speakers.
- Fix approach: Move to a config file (e.g. `src/config/topics.ts`) or fetch from a CMS/API endpoint.

**Hardcoded colour values in Canvas rendering:**
- Issue: RGB colour literals for the accent colour (`rgba(14, 165, 233, ...)`, `rgba(3, 105, 161, ...)`, `rgba(15, 23, 42, ...)`) are duplicated across the canvas draw function, disconnected from the CSS custom properties defined in `globals.css`.
- Files: `src/components/VoiceOrb.tsx` (lines 61, 106–116), `src/components/WaveformVisualizer.tsx` (line 16 default param `"#0EA5E9"`)
- Impact: Changing the brand colour requires updating both CSS variables and canvas code separately. The two can drift.
- Fix approach: Read CSS custom properties at runtime via `getComputedStyle(document.documentElement).getPropertyValue('--accent-light')` and use those values in canvas draws.

**Font variable name mismatch:**
- Issue: `layout.tsx` loads `Inter` and assigns it to CSS variable `--font-geist-sans`, while `globals.css` maps `--font-sans` to `var(--font-geist-sans)` and also references `--font-geist-mono` which is never assigned.
- Files: `src/app/layout.tsx` (line 6–8), `src/app/globals.css` (lines 33–34)
- Impact: `--font-geist-mono` resolves to nothing. Any element using `font-mono` will fall back to the browser default monospace font silently.
- Fix approach: Either load a Geist font package or rename the variable to accurately reflect Inter is in use and remove the unused `--font-geist-mono` reference.

**Empty `next.config.ts`:**
- Issue: The Next.js config file contains no meaningful options — it is a boilerplate stub.
- Files: `next.config.ts`
- Impact: No security headers (CSP, X-Frame-Options, HSTS), no output configuration, no image domain rules. Particularly relevant given the app is a public-facing civic service.
- Fix approach: Add `headers()` with at minimum `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.

**`handleStop` has no error handling:**
- Issue: `conversation.endSession()` is awaited with no try/catch block. Any rejection will cause an unhandled promise rejection.
- Files: `src/components/VoiceAgent.tsx` (lines 59–62)
- Impact: Network interruptions or SDK errors during disconnect will produce uncaught promise rejections that surface as browser console errors, and `orbState` may remain stale.
- Fix approach: Wrap in try/catch matching the pattern used in `handleStart`.

**`sendUserMessage` called without checking return or errors:**
- Issue: `conversation.sendUserMessage(text)` is called with no error handling. The return value is discarded.
- Files: `src/components/VoiceAgent.tsx` (line 67)
- Impact: If the SDK rejects (e.g. connection dropped between check and send), the error is silently swallowed and the user receives no feedback.
- Fix approach: Wrap in try/catch and surface an error state to the UI.

## Known Bugs

**Canvas size mismatch between CSS and internal buffer on mobile:**
- Symptoms: The canvas element in VoiceOrb is sized at `w-[180px] h-[180px]` on mobile via Tailwind classes, but the internal canvas buffer is always set to `280 * dpr` pixels.
- Files: `src/components/VoiceOrb.tsx` (lines 25–29, 149)
- Trigger: Viewing on any viewport narrower than `lg` breakpoint.
- Impact: The canvas buffer is larger than the rendered element, meaning resolution is higher than needed but also the canvas never re-sizes if the browser window resizes (no `ResizeObserver`). `WaveformVisualizer` does handle resize correctly via `getBoundingClientRect`.

**`WaveformVisualizer` `ctx.scale` called repeatedly on resize:**
- Symptoms: The `resize()` function calls `ctx.scale(dpr, dpr)` without resetting the canvas transform first. If the component resizes multiple times (window resize events trigger `useEffect` re-run because `isActive`/`getVolume` are dependencies), the scale accumulates.
- Files: `src/components/WaveformVisualizer.tsx` (lines 27–32)
- Trigger: Window resize while component is mounted.
- Workaround: None currently present.

**`useConversation` event callbacks use type assertions to work around missing SDK types:**
- Symptoms: `message` and `mode` payloads are cast using `as { source?: string; message?: string }` and `as { mode?: string }` because the ElevenLabs SDK does not export typed callback signatures.
- Files: `src/components/VoiceAgent.tsx` (lines 31, 41)
- Impact: If the SDK changes its payload shape, TypeScript will not catch it at compile time — the casts will silently succeed and the app will break at runtime.

## Security Considerations

**No HTTP security headers:**
- Risk: The app is served with no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, or `Strict-Transport-Security` headers. The app could be embedded in an iframe for clickjacking, or injected scripts could load arbitrary resources.
- Files: `next.config.ts`
- Current mitigation: None.
- Recommendations: Add a `headers()` export in `next.config.ts` setting at minimum CSP, X-Frame-Options, and X-Content-Type-Options.

**Agent ID committed to version control:**
- Risk: The ElevenLabs agent ID `agent_6501kndhqed3ep5sxrgmv32xyqh7` is committed in plaintext. While not a secret key, it allows anyone with repo access to directly invoke the same ElevenLabs agent, potentially exhausting usage quotas or abusing the civic service.
- Files: `src/components/VoiceAgent.tsx` (line 9)
- Current mitigation: The repository is private (assumed), but the commit history persists even if the file is updated.
- Recommendations: Rotate to an environment variable; consider adding ElevenLabs origin restrictions on the agent dashboard.

**No rate limiting or session limits:**
- Risk: Any visitor can initiate unlimited voice sessions with no throttling. ElevenLabs API costs accrue per character/minute of conversation. A single user or bot could cause significant unexpected billing.
- Files: `src/components/VoiceAgent.tsx` (lines 49–57)
- Current mitigation: None.
- Recommendations: Implement a backend proxy that issues short-lived signed tokens for each session, enabling rate limiting per IP or session.

**Microphone access requested with no user-visible permission explanation:**
- Risk: The browser microphone permission prompt appears with no prior explanation to the user of why it is needed or what happens to the audio. This may cause users to deny permission, breaking the agent.
- Files: `src/components/VoiceAgent.tsx` (lines 49–57) — permission is triggered implicitly by the SDK on `startSession`.
- Current mitigation: A hint text exists (`"Speak in Bahasa Melayu or English"`) but it appears after connection, not before.
- Recommendations: Show a permission explanation modal before calling `startSession`.

## Performance Bottlenecks

**Unbounded `requestAnimationFrame` loops in two components:**
- Problem: Both `VoiceOrb` and `WaveformVisualizer` run `requestAnimationFrame` continuously at 60fps regardless of whether visible or in an active state. The orb runs even when `state === "idle"` and the waveform animates even when `isActive === false`.
- Files: `src/components/VoiceOrb.tsx` (lines 131–135), `src/components/WaveformVisualizer.tsx` (lines 74–78)
- Cause: No visibility check (`IntersectionObserver` or `document.hidden`) and no idle-frame throttling.
- Improvement path: Use `document.addEventListener('visibilitychange', ...)` to pause loops when tab is backgrounded. Throttle idle animation to 10fps.

**Growing messages array with no cap:**
- Problem: Conversation messages accumulate in `useState` with no maximum length enforced. Long sessions will grow the array and re-render the entire message list on every new message.
- Files: `src/components/VoiceAgent.tsx` (lines 14, 19–25)
- Cause: Messages are prepended-to (actually appended) without trimming old entries.
- Improvement path: Cap at a reasonable limit (e.g. 200 messages) and/or virtualise the list with a library like `react-virtual`.

## Fragile Areas

**`getInputVolume` / `getOutputVolume` runtime guards:**
- Files: `src/components/VoiceAgent.tsx` (lines 71–81)
- Why fragile: The existence of these methods on the conversation object is checked at call time with `typeof ... === "function"` guards, indicating the SDK does not guarantee their presence. If the SDK removes or renames them across a version bump, the orb and waveform silently flatline with no error.
- Safe modification: Pin `@elevenlabs/react` to an exact version (remove the `^` prefix in `package.json`) until the SDK API is stable.
- Test coverage: None — no tests exist in this codebase.

**`ConversationProvider` wrapping strategy:**
- Files: `src/components/VoiceAgent.tsx` (lines 229–234)
- Why fragile: `ConversationProvider` is used as a local wrapper inside the `VoiceAgent` component export. If a second `VoiceAgent` instance were ever rendered (e.g. embedded in a different page), two independent provider contexts would exist with no coordination.
- Safe modification: Lift `ConversationProvider` to layout level if multi-page use is planned.

## Scaling Limits

**Single ElevenLabs agent, no fallback:**
- Current capacity: One hardcoded agent ID handles all concurrent sessions.
- Limit: ElevenLabs concurrent session limits apply globally to the agent. High traffic (e.g. a public launch event) will hit concurrent connection caps.
- Scaling path: Implement a backend session manager that can distribute across multiple agent IDs or queue requests.

## Dependencies at Risk

**`@elevenlabs/react` at `^1.0.2` with unstable typed API:**
- Risk: The SDK is at v1.0.x — early major version. Callback payload types are incomplete enough that the codebase must use manual type assertions. Minor version bumps under semver `^` could break payload shapes silently.
- Impact: `onMessage` and `onModeChange` callbacks in `src/components/VoiceAgent.tsx` would fail to parse data correctly.
- Migration plan: Pin to exact version (`"@elevenlabs/react": "1.0.2"`) and upgrade deliberately when the SDK exports stable types.

**`next: 16.2.2` (future/pre-release version):**
- Risk: As of the analysis date (2026-04-05), Next.js 16.2.2 is beyond the current documented stable releases known at training time. `AGENTS.md` explicitly warns that this version has breaking changes from training data. APIs, conventions, and config options may differ significantly.
- Impact: Any future development relying on Next.js documentation from before the version release risks using deprecated or removed APIs.
- Migration plan: Consult `node_modules/next/dist/docs/` directly before any Next.js-level changes. Pin exact version and read changelog before upgrades.

## Missing Critical Features

**No error boundary:**
- Problem: No React `ErrorBoundary` component wraps any part of the tree. Any unhandled render error in `VoiceOrb`, `WaveformVisualizer`, or `ConversationPanel` will crash the entire page to a blank white screen.
- Blocks: Recovery from canvas API failures, SDK errors that propagate to render, or unexpected null states.

**No loading or error state for the dynamic import:**
- Problem: The `dynamic()` import in `src/app/page.tsx` only provides a spinner for the loading state. There is no `error` fallback. If the `VoiceAgent` chunk fails to load (network issue), the spinner remains indefinitely.
- Files: `src/app/page.tsx` (lines 5–12)

**No accessibility support for the voice interface:**
- Problem: The orb canvas element has no `role`, `aria-label`, or any ARIA attributes. The status label (`"Listening"`, `"Speaking"`) is visually present but not announced to screen readers. The app is entirely inaccessible to users relying on assistive technology.
- Files: `src/components/VoiceOrb.tsx` (lines 138–153), `src/components/VoiceAgent.tsx` (lines 102–115)

**No language selection UI despite bilingual claim:**
- Problem: The hint text states "Speak in Bahasa Melayu or English" but there is no language toggle. The ElevenLabs agent must be pre-configured to handle both. If the agent language detection fails, there is no UI affordance to explicitly switch.
- Files: `src/app/page.tsx` (line 169 hint text in VoiceAgent)

## Test Coverage Gaps

**Zero test coverage across entire codebase:**
- What's not tested: All components (`VoiceAgent`, `VoiceOrb`, `WaveformVisualizer`, `ConversationPanel`), all state transitions, all error paths, all canvas drawing logic.
- Files: No `*.test.*` or `*.spec.*` files exist anywhere in the repository.
- Risk: Any refactor or SDK upgrade could break core functionality with no safety net. The animation loop cleanup (cancelling `requestAnimationFrame` on unmount) is particularly easy to regress.
- Priority: High — this is a public-facing civic service.

---

*Concerns audit: 2026-04-05*
