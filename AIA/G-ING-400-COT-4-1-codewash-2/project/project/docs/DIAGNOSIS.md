# CodeWash RPG: Diagnosis & Mapping

## 1. Initial State (Legacy Issues Identified)
Before the refactoring efforts, the following critical issues were identified regarding the internationalization (i18n) and hardcoded data in the codebase:

- **Hardcoded Strings**: All UI labels, achievement messages, and system prompts were hardcoded directly in `App.jsx` and other components (e.g., `SettingsDrawer.jsx`, `SkillCard.jsx`).
- **Logic Intertwined with Configuration (I/O)**: The logic for determining "themed" skill names (like changing "Reading" to "Spellcasting" for the Pokémon theme) used complex ternary operators directly embedded within component render cycles.
- **Lack of Scalability**: Adding a new language would have required duplicating components or injecting massive `if/else` statements globally, making the application extremely fragile.
- **State Persistence**: The user's language preference was strictly session-bound or non-existent originally, lacking persistence between app reloads.

## 2. Refactoring Strategy (Incremental Refactoring)
To address these technical debts, we planned an incremental refactoring strategy:

1. **Extraction (Separation of Concerns)**: Extracting all text from React components into a centralized JSON-like structure (`src/constants/translations.js`).
2. **Dynamic Resolution**: Creating a utility function (`src/utils/i18n.js`) to decouple the UI from the raw string data, introducing a fallback mechanism.
3. **Themed Keys Refactoring**: Replacing inline themed ternaries with dynamic key resolution (e.g., `skill_name_reading_pokemon`), allowing configuration via pure data instead of conditional code blocks.
4. **State Persistence**: Connecting the language state to the browser's `localStorage` to ensure continuity.

## 3. Risk Matrix (Pre-Refactoring Audit)

| Issue | Severity | Complexity | Risk level |
| :--- | :--- | :--- | :--- |
| Hardcoded UI Strings | High | Low | Medium |
| Decoupling Logic from BGM | Medium | Medium | Medium |
| Legacy "Pokemon/Minecraft" Ternaries | High | High | CRITICAL |
| Synchronous LocalStorage in UI | Medium | Low | Low |

## 4. Phased Attack Plan
- **Phase 1 (Urgent):** Centralize Translations & i18n utility (Solves 80% of UI noise).
- **Phase 2 (Architectural):** Decouple `localStorage` into `storageUtils.js`.
- **Phase 3 (Refinement):** Extract hooks (`useAudio`) to clean `App.jsx`.

## 5. Residual Technical Debt Map
- **Sound Effect Management:** Some UI sounds still use ad-hoc logic; could be centralized in a global `SoundManager`.
- **Mini-game Icons:** The sprites for mini-games are hardcoded in CSS styles; they should be moved to a theme-aware configuration file.
- **Unit Test Coverage:** While core utils are at 100%, some peripheral UI components (`SettingsDrawer`) lack deep lifecycle testing.

## 6. Impact
This mapping and diagnosis allowed us to confidently modify the legacy code while honoring the "Scout Rule" (leave the code cleaner than you found it), greatly improving the maintainability and readability of `App.jsx` and `SkillCard.jsx`.