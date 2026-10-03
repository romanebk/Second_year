# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-23

### Added
- Comprehensive test suite using **Vitest**.
- **GitHub Actions** CI pipeline for automated Linting and Testing.
- Centralized i18n system with **French** support.
- Custom hook `useAudio` for sound management.
- `storageUtils.js` for decoupled persistence.
- Documentation: `ARCHITECTURE.md`, `DIAGNOSIS.md`, `CONTRIBUTING.md`, `RUNBOOK.md`.
- Architecture Decision Records (ADRs).

### Changed
- Refactored `App.jsx` to remove hardcoded strings and inline I/O.
- Standardized translations for themed skills (Minecraft/Pokemon).

### Fixed
- Fixed critical `MISSING_EXPORT` error that caused blank screens.
- Resolved 12 historical ESLint warnings/errors.
- Fixed inconsistent skill levels between profiles.

## [1.0.0] - 2026-03-12
### Added
- Initial legacy project received (Vibe-coded version).