# Testing Patterns

**Analysis Date:** 2026-04-05

## Test Framework

**Runner:** None — no test framework is installed or configured.

**Assertion Library:** None.

**Run Commands:**
```bash
# No test commands defined in package.json scripts
# Available scripts: dev, build, start, lint
```

## Test File Organization

**Location:** No test files exist in the repository.

**Naming:** Not applicable — no test files present.

**Structure:**
```
src/
  app/
    layout.tsx      # No co-located tests
    page.tsx        # No co-located tests
  components/
    VoiceAgent.tsx          # No co-located tests
    ConversationPanel.tsx   # No co-located tests
    VoiceOrb.tsx            # No co-located tests
    WaveformVisualizer.tsx  # No co-located tests
```

## Test Structure

**Suite Organization:** Not established — no tests exist.

**Patterns:** None observed.

## Mocking

**Framework:** Not applicable — no test infrastructure present.

**What to Mock (recommendations for when tests are added):**
- `@elevenlabs/react` — `useConversation` and `ConversationProvider` should be mocked to avoid real WebSocket/audio connections in tests
- `window.devicePixelRatio` — browser-only property used in `VoiceOrb.tsx` and `WaveformVisualizer.tsx`
- `HTMLCanvasElement.getContext` — canvas rendering APIs are not available in jsdom
- `requestAnimationFrame` / `cancelAnimationFrame` — animation loop APIs need mocking in Node test environments

**What NOT to Mock:**
- Pure state logic inside `VoiceAgentInner` (message accumulation, orb state transitions) — test these directly

## Fixtures and Factories

**Test Data:** Not established.

**Location:** No fixtures directory exists.

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

**View Coverage:** Not available.

## Test Types

**Unit Tests:** Not present. High-value candidates:
- `addMessage` callback in `src/components/VoiceAgent.tsx` — pure state mutation logic
- `Message` interface shape and timestamp formatting in `src/components/ConversationPanel.tsx`
- `OrbState` transition logic driven by `onConnect`, `onDisconnect`, `onModeChange` callbacks

**Integration Tests:** Not present. High-value candidate:
- `VoiceAgent` component — verifying the provider wraps inner component and props flow correctly

**E2E Tests:** Not present and no Playwright/Cypress config detected.

## Common Patterns

**Async Testing:** Not established. When added, `handleStart` and `handleStop` in `src/components/VoiceAgent.tsx` are async and will require `waitFor` or `act` wrappers.

**Error Testing:** Not established. The `onError` callback path in `useConversation` and the `try/catch` in `handleStart` are the primary error paths to cover.

## Recommended Setup (when tests are introduced)

To add testing to this project:

1. Install testing dependencies:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest
```

2. Add `jest.config.ts` with jsdom environment and `@/*` path alias resolution matching `tsconfig.json`.

3. Add a `test` script to `package.json`:
```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

4. Mock canvas APIs globally in `jest.setup.ts`:
```typescript
HTMLCanvasElement.prototype.getContext = jest.fn();
global.requestAnimationFrame = jest.fn((cb) => { cb(0); return 0; });
global.cancelAnimationFrame = jest.fn();
```

---

*Testing analysis: 2026-04-05*
