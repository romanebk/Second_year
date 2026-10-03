# ADR 002: Decoupling I/O from UI Logic (Storage & Audio)

*  **Status:** Accepted
*  **Decider:** Team Codewash
*  **Date:** 2026-03-22

## Context
The main `App.jsx` component was performing direct synchronous `localStorage` calls and managing `new Audio()` instances. This "vibe-coded" approach led to performance issues, race conditions, and made the logic extremely difficult to unit test.

## Decision
We extracted all persistence and side-effect logic:
1. **Persistence**: Moved to `utils/storageUtils.js`. Components call `saveGameState()` instead of `localStorage.setItem()`.
2. **Audio**: Moved to `hooks/useAudio.js` for state-aware BGM management and `utils/soundManager.js` for SFX.

## Consequences
*  **Pros:** `App.jsx` complexity reduced; pure logic is now unit-testable; predictable state flow.
*  **Cons:** Increased number of files in the project structure.
*  **Future:** Makes it easy to swap `localStorage` for a remote API/database in the future.