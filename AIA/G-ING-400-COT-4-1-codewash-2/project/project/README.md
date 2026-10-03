# CODEWASH — Team Handbook & Handover

Welcome to CODEWASH. The objective of this project is to take the "vibe-coded" RPG game provided by Epitech and deliver a clean, maintainable version without technical debt. This document serves as the primary handover point for new developers.

---

## Quick Start (Installation & Execution)

Depending on your environment, starting the project is fully scripted:

**Windows (PowerShell)**
```powershell
./start.ps1
```

**Linux / WSL**
```bash
./start.sh
```

---

## Architecture & Stack

The tech stack is built for performance and maintainability:
- **React 19 + Vite**: High-performance core application.
- **Electron 39**: Desktop environment wrapper.
- **Tailwind CSS / PostCSS**: Utility-first styling.
- **Lucide React**: Vector icons.

### Project Mapping (Important References)
Please consult the `docs` folder and root for deeper architectural insight:
1. [Diagnosis Report](docs/DIAGNOSIS.md) - Legacy debt audit & Risk Matrix.
2. [Architecture Decision Records (ADRs)](docs/adr/) - Justification for core technical choices.
3. [Architecture Maps](docs/ARCHITECTURE.md) - Mermaid call graphs of refactored flows.
4. [Contributing Guide](docs/CONTRIBUTING.md) - Onboarding, DOR, DOD, and PR templates.
5. [Changelog](CHANGELOG.md) - Professional versioning of features and fixes.
6. [Runbook](docs/RUNBOOK.md) - Operational guide (Start/Stop/Incidents).

---

## Managing Translations (i18n)

The application uses a custom, lightweight translation engine. We have eradicated hardcoded strings from all components.

**Detailed Workflow:** See the [Localization Walkthrough](file:///home/will/.gemini/antigravity/brain/5c0a6896-825b-4a5c-858c-54a2faaf2528/walkthrough.md) for a before/after comparison.

---

## Testing & Continuous Quality

We aim for high test coverage using **Vitest**.
```bash
npm test
# OR
npm run ci:local (Simulates full CI: Lint + Tests)
```
*Note: Our GitHub Actions pipeline is currently at quota, but remains functional for local simulation.*

---

## Performance & Maintenance

The game must boot quickly and run flawlessly. 
- **SLA**: 100% Availability (Offline-first).
- **Incident Response**: See [Runbook](docs/RUNBOOK.md).
- **Residual Debt**: Tracked in [DIAGNOSIS.md](docs/DIAGNOSIS.md#5-residual-technical-debt-map).