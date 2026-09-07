# SuperTool

![Coverage](https://codecov.io/gh/ferryhinardi/supertool/branch/main/graph/badge.svg)

SuperTool is a browser-based toolkit of 110+ utilities for developers, designers and
productivity work: JSON and CSV converters, image/video processing, PDF tools, password and hash
generators, calculators, timers and more. Almost everything runs client-side, with no account
required.

- **Live app:** the tools live under `/tools/<category>/<slug>` (for example `/tools/data/json-beautify`)
- **Documentation hub:** [`docs/README.md`](./docs/README.md)
- **Contributing:** [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- **Agent quick reference:** [`AGENTS.md`](./AGENTS.md)

## Tool categories

| Category | Route prefix | Examples |
| --- | --- | --- |
| Data | `/tools/data` | JSON Beautifier, JSON ↔ CSV, CSV/Excel converter, JSON Schema, UUID, Date Formatter |
| Design | `/tools/design` | Color Contrast Checker, Gradient Generator, Favicon Generator, Screenshot Diff, SVG Optimizer |
| Development | `/tools/development` | API Tester, Regex Tester, JWT Debugger, Cron Builder, GraphQL Playground, Webhook Tester |
| Finance | `/tools/finance` | Split Bill, Currency Converter, Loan, Tip and Percentage calculators |
| Media | `/tools/media` | Image Optimizer, Video Converter, Background Remover, OCR, Meme Generator |
| Productivity | `/tools/productivity` | Markdown Editor, PDF Tools, Resume Builder, Pomodoro, Unit Converter, URL Shortener |
| Security | `/tools/security` | Password Generator, Hash Generator, AES Encryption, Steganography, SSL Checker |

The registry in [`lib/data/tools.ts`](./lib/data/tools.ts) is the single source of truth for
tool metadata (name, category, route, status); the sidebar, homepage and sitemap all read from it.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) App Router, React 19 with the React Compiler |
| Styling | [Panda CSS](https://panda-css.com/) (`css()` + recipes), [Ark UI](https://ark-ui.com/) headless components |
| State / URL | React hooks, [nuqs](https://nuqs.dev/) for URL state, zustand for a few global stores |
| Backend | Next.js route handlers in `app/api/`, [Supabase](https://supabase.com/) (auth, Postgres), Polar payments, Resend email |
| Testing | [Vitest](https://vitest.dev/) (jsdom by default, Playwright browser mode on demand), Playwright for e2e/a11y |
| Quality | [Biome](https://biomejs.dev/) for formatting and linting, ESLint for React Hooks/Next.js rules, TypeScript strict mode, Husky + lint-staged |
| Tooling | pnpm 10, Node.js 24 |

## Getting started

Prerequisites: Node.js 24 (see `.nvmrc`) and pnpm 10 (`corepack enable` picks up the version in
`package.json`).

```bash
git clone https://github.com/ferryhinardi/supertool.git
cd supertool
pnpm install                 # also runs `panda codegen`
cp .env.example .env.local   # fill in the services you need (Supabase, OpenAI, Polar, ...)
pnpm dev                     # http://localhost:3000
```

Most tools work without any environment variables. Server-backed features (auth, URL
shortener, AI tools, payments, email) need the keys documented in
[`docs/guides/ENV_VARS.md`](./docs/guides/ENV_VARS.md).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run Panda codegen and start the dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | Biome format + lint with auto-fix |
| `pnpm lint:check` | Biome check only (what CI runs) |
| `pnpm lint:eslint` | ESLint (React Hooks, React Compiler and Next.js rules) |
| `pnpm exec tsc --noEmit` | Type check |
| `pnpm test` | Vitest in watch mode (`CI=true pnpm test run` for a single pass) |
| `pnpm test:ui` / `pnpm test:browser` | Vitest UI / force Playwright browser mode |
| `pnpm test:e2e` | Playwright suites in `tests/` (a11y, mobile touch targets) |
| `pnpm mcp:validate` | Validate the MCP server configuration in `.mcp/` |
| `pnpm seo:audit` / `pnpm perf:baseline` | Refresh the SEO backlog / Lighthouse baseline |

First-time test setup: `pnpm exec playwright install chromium`.

## Repository layout

```
supertool/
├── app/                    Next.js App Router
│   ├── api/                Route handlers (AI tools, payments, webhooks, shortener, ...)
│   ├── auth/               Auth callback pages
│   ├── s/                  Short-link redirects
│   ├── support/            Donation / support pages
│   └── tools/<category>/   One folder per tool: page.tsx, layout.tsx (SEO), __tests__/
├── components/
│   ├── ui/                 Base components (Button, Card, Dialog, Tabs, ...) on Ark UI + Panda
│   ├── features/           Feature modules: ads, currency, media, monetization, support, tools
│   ├── layout/             Header and Sidebar
│   ├── copilot/            Copilot chat UI
│   └── providers/          React context providers
├── hooks/                  Reusable hooks (common/, tools/, github/)
├── lib/
│   ├── data/               Tool registry, metadata, structured data, donation tiers
│   ├── services/           Analytics, ads, email, Polar, GitHub, copilot, ratings
│   ├── tools/              Pure logic for individual tools (unit-tested)
│   ├── auth/               Supabase clients and auth store
│   ├── seo/, media/, utils/, types/
│   └── analytics.ts, feature-flags.ts
├── supabase/               Database migrations and SQL scripts
├── tests/                  Playwright suites (a11y/, mobile/) and manual test pages
├── scripts/                Maintenance scripts (MCP validation, SEO audit, Lighthouse, Polar checks)
├── docs/                   Documentation hub — see docs/README.md
├── panda.config.ts         Design tokens, recipes and static CSS
├── biome.json              Formatter and linter configuration
└── vitest.config.mts       Test runner (jsdom + on-demand Playwright browser mode)
```

Generated folders (`styled-system/`, `.next/`, `coverage/`) are git-ignored.

## Development workflow

1. Create a branch (`feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`).
2. Add a tool with the scaffolder skill in `.agents/skills/new-tool-scaffolder/` or by copying an
   existing `app/tools/<category>/<slug>/` folder, then register it in `lib/data/tools.ts`.
3. Style tool pages with Panda CSS `css()` — see
   [`docs/guides/PANDA_CSS_GUIDE.md`](./docs/guides/PANDA_CSS_GUIDE.md) and the canonical example in
   `app/tools/productivity/unit-converter/page.tsx`.
4. Run `pnpm lint`, `pnpm exec tsc --noEmit` and the relevant tests before opening a PR. Commits
   follow [Conventional Commits](https://www.conventionalcommits.org/) and are checked in CI.

CI (`.github/workflows/ci.yml`) runs Biome, type checking, the Vitest suite in eight shards and a
production build; `coverage.yml` uploads coverage to Codecov.

## License

[MIT](./LICENSE) — Ferry Hinardi ([@ferryhinardi](https://github.com/ferryhinardi))
