# System Architecture & Call Graphs

This document highlights the architecture of the application, focusing specifically on the data flow and how components interact with the newly decoupled Translation logic.

## 1. Translation System Call Graph
The following Mermaid diagram illustrates how a component (like `App.jsx` or `SkillCard.jsx`) retrieves text. It shows the decoupling of logic and IO/Configuration.

```mermaid
graph TD
  subgraph UI Components
    App[App.jsx]
    Menu[MenuDrawer.jsx]
    Skill[SkillCard.jsx]
  end

  subgraph i18n Utilities
    Utility[getTranslation<br>src/utils/i18n.js]
  end

  subgraph Data Layer
    Translations[TRANSLATIONS Object<br>src/constants/translations.js]
    LocalStorage[(Browser localStorage<br>Language State)]
  end

  App -->|Reads lang state| LocalStorage
  App -->|Key, Lang| Utility
  Menu -->|Key, Lang| Utility
  Skill -->|Dynamic Themed Key, Lang| Utility

  Utility -->|Queries| Translations
  Translations -->|Returns String or Fallback| Utility
  Utility -->|Returns Formatted String| App
  Utility -->|Returns Formatted String| Menu
  Utility -->|Returns Formatted String| Skill
```

## 2. Component Hierarchy (Refactored scope)
By abstracting the translations, the UI components no longer contain heavy textual data, making the React tree much lighter.

```mermaid
graph TD
  Root[App Component]
  Root --> Settings[SettingsDrawer]
  Root --> MenuTree[MenuDrawer]
  Root --> MainRender[Skill Grid]
  
  MainRender --> Card[SkillCard]
  Card --> DisplayParams[mobDisplayUtils]
  
  Settings --> LanguageSwitch[LanguageSwitcher]
```

## 3. Separation of Concerns (Logic vs I/O)
- **Logic**: Component behavior, React State, Drag-and-drop mechanics.
- **I/O & Data**: Saved persistently in `localStorage`, and raw configurations map to `gameData.jsx` and `translations.js`.
- By removing hardcoded English/French text from components, we effectively decoupled presentation logic from raw static data output.