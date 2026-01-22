# Changelog

## v2.0.0 - Ink-based CLI (Unreleased)

### ✨ New Features

- **Beautiful Interactive CLI**: Rebuilt the entire CLI using [Ink](https://github.com/vadimdemedes/ink) for a modern, React-based terminal UI
- **Custom Checkbox Selection**: Implemented a custom multi-select component with:
  - ↑↓ arrow keys to navigate
  - Space to toggle selection
  - Enter to confirm
  - Visual indicators for selected items and cursor position

### 🐛 Bug Fixes

- **Fixed checkbox interaction**: Skills can now be properly checked/unchecked
- **Fixed GitHub downloads**: Skills are now correctly downloaded from the registry

### 🔧 Changes

- Replaced `@inquirer/prompts` with Ink for better UX
- Replaced `chalk` with Ink's built-in styling
- Added custom `MultiSelectCheckbox` component for skill selection

### 📦 Dependencies

- Added: `ink`, `react`, `ink-spinner`, `ink-select-input`, `ink-text-input`
- Removed: `@inquirer/prompts`, `chalk`, `ink-multi-select`

## v1.0.0 - Initial Release

- Basic CLI functionality
- Package.json parsing
- Skills registry integration
- Skills installation to `.cursor/skills/` or `.claude/`
