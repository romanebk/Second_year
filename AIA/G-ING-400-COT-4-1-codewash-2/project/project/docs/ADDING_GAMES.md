# Adding New Mini-Games to CodeWash RPG

This guide explains the ecosystem architecture and the steps required to seamlessly integrate a brand new mini-game/skill into the application. The system is designed to be highly decoupled, so you only need to touch a few central configuration files.

## 1. Register the Skill in `gameData.jsx`

The `src/constants/gameData.jsx` file is the central nervous system of the RPG. To add a new game (e.g., `trivia`), you must update several constants:

- **`SKILL_DATA`**: Define the new skill object. 
  ```javascript
  trivia: {
      id: 'trivia',
      colorStyle: { background: 'linear-gradient(to bottom, #d946ef, #7e22ce)', boxShadow: '0 8px 0 #581c87', borderColor: '#e879f9' },
      icon: <BrainCircuit size={48} className="text-white" />,
      baseStats: { level: 1, xp: 0, highestRound: 0, stars: 0, ... }
  }
  ```
- **`THEME_CONFIG`**: For *every* theme, you must add the skill mapping (boss name and skill icon).
  ```javascript
  'minecraft': {
      ...
      skills: { ..., trivia: { name: 'skill_name_trivia_minecraft', boss: 'Elder Guardian' } }
  }
  ```
- **`DIFFICULTY_CONTENT`**: Define the 7 levels of difficulty parameters for the new skill.

## 2. Localization in `translations.js`

Add string keys to `src/constants/translations.js` for both French (`fr`) and English (`en`):
- `trivia_title`: The name of the skill.
- `skill_desc_trivia`: Description in the Settings/Stats menu.
- Theme-specific names: `skill_name_trivia_minecraft`, `skill_name_trivia_kpop`, etc.
- In-game UI text: Error states, prompts, or dynamic string replacements specific to your game.

## 3. Mini-Game UI & Logic in `SkillCard.jsx`

`src/components/skills/SkillCard.jsx` handles the display and interaction logic.
- Locate the main `switch (config.id)` or `if (config.id === ...)` block inside the render function.
- Add your UI layout for the new game.
- Use `handleSuccessHit(config.id, damage)` when the user succeeds to automatically trigger damage, XP gain, level ups, and animations.
- Use `setMismatchShake(true)` and `playFail()` on failure.

## 4. Persistence & Saves in `storageUtils.js`

Update the initial state shape so that new and existing profiles acquire the skill.
- In `storageUtils.js`, update `INITIAL_SKILLS`:
  ```javascript
  const INITIAL_SKILLS = {
      reading: { level: 1, xp: 0, currentBoss: null, currentMiniboss: null, ... },
      // ...
      trivia: { level: 1, xp: 0, currentBoss: null, currentMiniboss: null, earnedBadges: [] }
  };
  ```
- Ensure the `loadSkills(profileId)` function uses a deep merge (or destructured fallback) so that users updating their app don't lose their old save but gain the new skill initialization.

## 5. Fetch API or Utilities (Optional)

If your game relies on external data (like OpenTDB or an internal JSON manifest), place the fetch logic or generators in `src/utils/gameUtils.js` to keep the UI components clean.
