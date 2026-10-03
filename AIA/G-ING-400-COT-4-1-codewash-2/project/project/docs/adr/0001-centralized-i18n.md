# ADR 001: Centralized Internationalization (i18n) System

*  **Status:** Accepted
*  **Decider:** Team Codewash
*  **Date:** 2026-03-21

## Context
The legacy codebase had all UI strings hardcoded in English across various components (App.jsx, SkillCard.jsx, etc.). This made it impossible to support multiple languages without massive code duplication and rendered the application unmaintainable.

## Decision
We decided to implement a centralized i18n system using a mapping object (`translations.js`) and a utility function (`getTranslation`).
1. All static strings are extracted into `constants/translations.js`.
2. Dynamic keys are generated for themed skills (e.g., `skill_name_reading_pokemon`).
3. Components retrieve text only via `getTranslation(key, language)`.

## Consequences
*  **Pros:** Trivially easy to add new languages; single source of truth; reduced technical debt.
*  **Cons:** Small overhead for developers to add keys before using them in UI.
*  **Future:** The system is ready for any number of languages without further architectural changes.