# SuperTool Documentation

This folder is the documentation hub for SuperTool. Start with the root
[README](../README.md) for a project overview and the [contributing guide](../CONTRIBUTING.md)
for the development workflow; the agent-oriented quick reference lives in
[AGENTS.md](../AGENTS.md).

## Layout

| Folder | What lives here |
| --- | --- |
| [`guides/`](./guides/) | Developer how-tos: testing, styling, formatting, MCP, feature flags, env vars |
| [`setup/`](./setup/) | Operations: CI/CD, Vercel, DNS, email deliverability, Polar payments, Supabase |
| [`tools/`](./tools/) | Per-tool documentation, grouped by the same categories as `app/tools/` |
| [`features/`](./features/) | Cross-cutting product features: ads, analytics, feedback, donations |
| [`architecture/`](./architecture/) | System design notes and business model |
| [`security/`](./security/) | Security fixes and incident reports |
| [`planning/`](./planning/) | Roadmaps, improvement plans and backlogs (a11y, SEO, touch targets) |
| [`archive/`](./archive/) | Historical session summaries, completion reports and finished migrations |
| [`CHANGE_LOG.md`](./CHANGE_LOG.md) | Project change log |

## Start here

### Working on the codebase

- [Testing with Vitest Browser Mode](./guides/TESTING.md) and the
  [testing quick start](./guides/TESTING_QUICKSTART.md)
- [Panda CSS + Ark UI integration guide](./guides/PANDA_CSS_GUIDE.md) — the styling system
- [Code formatting](./guides/CODE_FORMATTING.md) — Biome configuration and editor setup
- [Tool component library](./guides/TOOL_COMPONENTS.md) — shared building blocks for tool pages
- [Environment variables](./guides/ENV_VARS.md) and [feature flags](./guides/FEATURE_FLAGS.md)
- [nuqs integration](./guides/NUQS_INTEGRATION.md) — URL state for tool pages
- [Speculation Rules](./guides/SPECULATION_RULES.md) — prerendering/prefetching setup
- [MCP configuration](./guides/MCP_SETUP.md) — Model Context Protocol servers for AI tooling
- [Recent tools tracking](./guides/RECENT_TOOLS_TRACKING.md)
- [Performance testing](./guides/PERFORMANCE_TESTING_GUIDE.md)
- [WARP development guide](./guides/WARP.md) — long-form project walkthrough

### Deploying and operating

- [CI/CD setup](./setup/CI_CD_SETUP.md) and the
  [production deployment checklist](./setup/PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- Vercel: [deployment guide](./setup/VERCEL_DEPLOYMENT.md),
  [FFmpeg on Vercel](./setup/VERCEL_FFMPEG_SETUP.md)
- DNS: [quick start](./setup/DNS_QUICK_START.md), [full guide](./setup/DNS_SETUP_GUIDE.md),
  [Vercel DNS](./setup/DNS_VERCEL_SETUP.md), [GoDaddy](./setup/DOMAIN_SETUP_GODADDY.md),
  [checklist](./setup/DNS_CHECKLIST.md)
- Email: [deliverability guide](./setup/EMAIL_DELIVERABILITY_GUIDE.md),
  [production checklist](./setup/EMAIL_PRODUCTION_CHECKLIST.md),
  [donation thank-you emails](./setup/EMAIL_SETUP_DONATION.md)
- Payments (Polar): [setup checklist](./setup/POLAR_SETUP_CHECKLIST.md),
  [environment variables](./setup/POLAR_ENV_SETUP_GUIDE.md),
  [Vercel env setup](./setup/POLAR_VERCEL_ENV_SETUP.md),
  [testing guide](./setup/POLAR_PAYMENT_TESTING_GUIDE.md),
  [end-to-end test](./setup/POLAR_END_TO_END_TEST.md)
- Database: [Supabase migrations](./setup/SUPABASE_MIGRATION_GUIDE.md),
  [URL shortener setup](./setup/URL_SHORTENER_SETUP.md)

### Tool documentation

[`tools/README.md`](./tools/README.md) is the master index with per-tool status. Guides are
grouped by category, mirroring the routes under `app/tools/`:

| Category | Folder | Examples |
| --- | --- | --- |
| Data | [`tools/data/`](./tools/data/) | JSON Beautifier, JSON ↔ CSV, CSV/Excel, UUID, Date Formatter |
| Design | [`tools/design/`](./tools/design/) | Color Contrast, Gradient, Favicon, Screenshot Diff, SVG Optimizer |
| Development | [`tools/development/`](./tools/development/) | API Tester, Regex, JWT, Cron, GraphQL, Webhook Tester |
| Finance | [`tools/finance/`](./tools/finance/) | Split Bill, Currency, Loan, Tip, Percentage |
| Media | [`tools/media/`](./tools/media/) | Image Optimizer, Video Converter, OCR, Meme Generator |
| Productivity | [`tools/productivity/`](./tools/productivity/) | Markdown Editor, PDF Tools, Resume Builder, Pomodoro |
| Security | [`tools/security/`](./tools/security/) | Password Generator, Hash, Encryption, Steganography |

Numbered files (for example `01_JSON_BEAUTIFIER.md`) follow the original documentation
series; unnumbered files are later additions or Pro-feature companions.

### Product features

- [Ads integration](./features/ADS_INTEGRATION.md) and the
  [multi-network ads system](./features/MULTI_ADS_SYSTEM.md)
- [Analytics (GA4)](./features/ANALYTICS.md)
- [Feedback system](./features/FEEDBACK_SYSTEM.md)
- Donations: [tiers](./features/DONATION_TIERS_IMPLEMENTATION.md),
  [thank-you emails](./features/DONATION_EMAIL_IMPLEMENTATION.md)

### Architecture and business

- [Revenue model](./architecture/REVENUE_MODEL.md)
- [Payment gateway comparison](./architecture/PAYMENT_GATEWAY_COMPARISON.md)
- [Ark UI homepage redesign](./architecture/ARK_UI_HOMEPAGE_REDESIGN.md)

### Security

- [Security incident report](./security/SECURITY_INCIDENT_REPORT.md)
- [Security fixes (2025-12-31)](./security/SECURITY_FIXES_2025_12_31.md) and
  [summary](./security/SECURITY_FIXES_SUMMARY.md)

### Planning

Living backlogs that scripts write to:
[accessibility](./planning/A11Y_BACKLOG.md), [SEO](./planning/SEO_BACKLOG.md),
[touch targets](./planning/TOUCH_TARGETS_BACKLOG.md). Roadmaps and improvement plans are in
[`planning/`](./planning/).

## Conventions

- File names are `SCREAMING_SNAKE_CASE.md`. Tool guides keep their series number prefix.
- Put new tool docs in `tools/<category>/` using the same category as the route.
- Documents that describe finished work (session summaries, "complete" reports) go to
  `archive/` rather than being deleted, so history stays searchable.
- Link between documents with relative paths so links survive folder moves.
