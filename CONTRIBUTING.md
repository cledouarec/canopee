# Contributing to Canopée

Contributions are welcome! Please feel free to submit a Pull Request.

## Table of Contents

<details>
<summary>Expand contents</summary>

- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Building](#building)
  - [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
  - [Commit Convention](#commit-convention)
- [Code of Conduct](#code-of-conduct)

</details>

## Development

### Prerequisites

- Node.js 18+
- pnpm

Install dependencies:

```bash
pnpm install
```

### Building

```bash
# Start the development server
pnpm dev

# Production build (type-check + bundle)
pnpm build

# Preview the production build
pnpm preview

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type-check only
pnpm typecheck

# End-to-end tests (Playwright, headless Chromium)
pnpm e2e
```

### Project Structure

```
src/
├── model/           # Domain entities (types, IDs)
├── serialization/   # .orga.json schema, parsing, migrations
├── scenarios/       # Scenario resolution and diffing
├── frameworks/      # Default taxonomy templates (Team Topologies,
│                    #   by-craft, by-stream, Spotify, custom)
├── store/           # Zustand store, localStorage persistence, undo/redo
├── layout/          # elk layout adapters (free, top-bottom, left-right, bands)
├── viz/             # Graph model, React Flow canvas, SVG charts
├── metrics/         # Org-design indicators (pure)
├── export/          # SVG / PNG render export
├── ui/              # App shell, panels, theme system
├── App.tsx          # Root React component
└── main.tsx         # Application entry point

e2e/                 # Playwright end-to-end flows
index.html           # Vite HTML entry
vite.config.ts       # Vite configuration
playwright.config.ts # Playwright configuration
tsconfig*.json       # TypeScript configuration
```

Unit and component tests live next to the code they cover as `*.test.ts` /
`*.test.tsx` files and run with [Vitest](https://vitest.dev/);
end-to-end flows live in `e2e/` and run with
[Playwright](https://playwright.dev/).

## How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) format
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure `pnpm build` and `pnpm test` pass before opening a Pull Request.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

| Prefix | Description |
|--------|-------------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `refactor:` | Code refactoring |
| `test:` | Test additions |
| `build:` | Build system and dependencies |
| `style:` | Code style and formatting |
| `ci:` | CI/CD configuration changes |

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating in this project.
