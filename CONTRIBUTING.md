# Contributing to SuperTool

Thanks for your interest in contributing. This guide covers the development workflow; the
[documentation hub](./docs/README.md) has deeper guides for testing, styling and deployment.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Development workflow](#development-workflow)
- [Adding a new tool](#adding-a-new-tool)
- [Coding standards](#coding-standards)
- [Testing](#testing)
- [Commit guidelines](#commit-guidelines)
- [Pull request process](#pull-request-process)

## Code of conduct

Be respectful, inclusive and constructive in all interactions.

## Getting started

Prerequisites: Node.js 24 (`.nvmrc`) and pnpm 10 (`corepack enable` installs the version pinned in
`package.json`).

```bash
git clone https://github.com/YOUR_USERNAME/supertool.git
cd supertool
git remote add upstream https://github.com/ferryhinardi/supertool.git

pnpm install                          # runs panda codegen + husky via postinstall/prepare
cp .env.local.example .env.local      # only needed for server-backed features
pnpm exec playwright install chromium # first-time test setup
pnpm dev                              # http://localhost:3000
```

## Development workflow

Branch names follow `<type>/<scope>`:

- `feat/<scope>` — new features (`feat/markdown-editor`)
- `fix/<scope>` — bug fixes (`fix/json-parse-error`)
- `chore/<scope>` — maintenance (`chore/update-deps`)
- `docs/<scope>` — documentation

Keep your fork current with `git fetch upstream && git rebase upstream/main`.

## Adding a new tool

Tools live at `app/tools/<category>/<slug>/`, where `category` is one of `data`, `design`,
`development`, `finance`, `media`, `productivity` or `security`.

1. **Scaffold the folder** — copy an existing tool (the canonical example is
   `app/tools/productivity/unit-converter/`) or use the scaffolder skill in
   `.agents/skills/new-tool-scaffolder/`. A tool consists of:
   - `page.tsx` — the client component (`'use client'`)
   - `layout.tsx` — SEO metadata via `generateToolMetadata()` from `@/lib/data/metadata`
   - `__tests__/page.test.tsx` and, for non-trivial logic, `__tests__/logic.test.ts`
   - optional `utils.ts` for pure logic that is easy to unit test
2. **Register it** in `lib/data/tools.ts`. The sidebar, homepage, search and sitemap all read
   from this registry, so nothing else needs editing for navigation.
3. **Track usage** with `trackToolEvent()` from `@/lib/services/analytics` (never send PII).
4. **Document it** in `docs/tools/<category>/` and add a row to `docs/tools/README.md`.
5. Run `pnpm dev` and open `/tools/<category>/<slug>`.

## Coding standards

### TypeScript and React

- Strict TypeScript; avoid `any` — use proper types or `unknown` with narrowing.
- Functional components with hooks; mark client components with `'use client'`.
- The React Compiler is enabled: avoid mutating values during render and setting state inside
  `useMemo`. `pnpm lint:eslint` reports compiler diagnostics.

### Styling

- Use Panda CSS `css()` from `@/styled-system/css` and the recipes in `panda.recipes.ts`.
  Do not use Tailwind-style utility classes or inline `style` objects in tool pages.
- Mobile first: stack on small screens, grid on larger; keep interactive targets at least 44px.
- See [`docs/guides/PANDA_CSS_GUIDE.md`](./docs/guides/PANDA_CSS_GUIDE.md).

### Imports

Use the `@/` alias and group imports: React/Next → third-party → UI components → features →
utils/lib. Biome's `organizeImports` enforces the order on save/commit.

### Formatting and linting

Biome is the formatter and primary linter (2-space indent, single quotes, no semicolons,
100-character lines). It runs on staged files through Husky + lint-staged.

```bash
pnpm lint            # format + lint with auto-fix
pnpm lint:check      # what CI runs
pnpm lint:eslint     # React Hooks / React Compiler / Next.js rules
pnpm exec tsc --noEmit
```

### Performance

Note the expected impact of a change (bundle size, network calls, TTI). Prefer lazy loading for
heavy libraries (FFmpeg, PDF.js, Tesseract) and flag any bundle increase above ~20 KB gzip.

## Testing

Vitest runs in jsdom by default; add `// @vitest-environment browser` to a file that needs real
browser APIs (Playwright browser mode). Tests live in `__tests__/` folders next to the source.

```bash
pnpm test                                   # watch mode
CI=true pnpm test run                       # single pass
pnpm test -- app/tools/data/json-beautify   # one folder
pnpm test:e2e                               # Playwright a11y / mobile suites in tests/
```

See [`docs/guides/TESTING.md`](./docs/guides/TESTING.md) for patterns and mocking guidance.

## Commit guidelines

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are validated in
CI:

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

```
feat(json-beautify): add syntax highlighting
fix(upload): handle large file uploads
docs(readme): update installation steps
```

## Pull request process

1. Before opening the PR, make sure these pass locally:
   - `pnpm lint:check`
   - `pnpm exec tsc --noEmit`
   - the tests for the areas you touched (`CI=true pnpm test run <path>`)
   - `pnpm build`
2. Update documentation: the tool guide in `docs/tools/`, `docs/tools/README.md` and, for
   user-facing changes, `docs/CHANGE_LOG.md`.
3. Fill in the PR template, link related issues and attach screenshots or recordings for UI
   changes.
4. Address review feedback and re-request review when ready. PRs are squash-merged, so the PR
   title must itself be a valid conventional commit message.

## Need help?

- Read the [README](./README.md) and [docs](./docs/README.md)
- [Open an issue](https://github.com/ferryhinardi/supertool/issues/new/choose)
- Ask questions in your PR
