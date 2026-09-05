# Change Log

All notable changes to the SuperTool project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Format Guidelines

### Version Format: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes (incompatible API changes, major feature rewrites)
- **MINOR**: New features (backwards-compatible functionality additions)
- **PATCH**: Bug fixes (backwards-compatible bug fixes)

### Categories

Each version entry should organize changes under these categories:

- **Added**: New features, tools, or functionality
- **Changed**: Changes in existing functionality or improvements
- **Fixed**: Bug fixes and error corrections
- **Removed**: Deprecated or removed features
- **Security**: Security vulnerability fixes
- **Performance**: Performance improvements and optimizations

### How to Update This Changelog

**When to add an entry**:
- ✅ After adding a new tool or feature
- ✅ After fixing a bug or issue
- ✅ After making performance improvements
- ✅ After security updates
- ✅ After removing deprecated features
- ✅ After making breaking changes

**Entry format**:
```markdown
### [Version] - YYYY-MM-DD

#### Added
- Description of what was added [Reference: docs/XX_TOOL_NAME.md]

#### Fixed
- Description of what was fixed (issue #123)
```

**Best Practices**:
- Keep descriptions clear and concise
- Link to related documentation when applicable
- Reference issue/PR numbers when available
- Group related changes together
- Always add new entries at the top (most recent first)
- Use past tense ("Added", "Fixed", not "Add", "Fix")

---

## [Unreleased]

### Changed
- Polished `/support` for conversion with a stronger value-prop hero, FAQ JSON-LD, support-focused metadata, privacy-safe `support_cta_clicked` analytics on DonationForm and TreatMeDialog CTAs, and explicit 44px-safe CTA sizing on primary support surfaces.
- Added a minimal `resume-builder` AI summary flow behind the Supabase-backed premium gate, returning 402 paywall envelopes before OpenAI work, recording authenticated usage after successful suggestions, surfacing remaining free AI uses in the UI, and replacing sensitive analytics field-presence flags with sanitized summary-safe payloads.
- Wrapped `cover-letter-builder` with the Supabase-backed premium gate, returning 402 paywall envelopes before OpenAI work, recording authenticated usage after successful generations, surfacing remaining free AI uses in the UI, and sanitizing forwarded AI analytics payloads so resume/job content never reaches `trackToolEvent`.
- Wrapped `ai-json-analyzer` with the Supabase-backed premium gate, returning 402 paywall envelopes before OpenAI work, recording successful authenticated usage after analysis, surfacing remaining free analyses in the UI, and validating touched-file coverage at `100%` lines for `route.ts` and `97.1%` lines for `page.tsx` while avoiding analytics on JSON contents or JSON payload size.
- Wrapped `ai-code-converter` with the Supabase-backed premium gate, returning 402 paywall envelopes before OpenAI work, recording authenticated usage after successful conversions, surfacing remaining free conversions in the UI, and validating touched-file coverage at `100%` lines for both `route.ts` and `page.tsx` while avoiding analytics on code contents or code-derived payload size.
- Wrapped `ai-image-caption` with the Supabase-backed premium gate, returning 402 paywall envelopes before vision work, recording authenticated usage after successful generations, surfacing remaining free captions in the UI without displaying uploaded filenames, and validating touched-file coverage at `100%` lines for `route.ts` and `98.05%` lines for `page.tsx`.
- Wrapped `ai-text-rewriter` with the Supabase-backed premium gate, returning 402 paywall envelopes before OpenAI work, recording authenticated usage after successful rewrites, surfacing remaining free quota in the UI, and capturing focused route/page evidence with `route.ts` at `100%` lines and `page.tsx` at `97.4%` lines.
- Added a reusable Panda/Ark `PaywallModal` for quota-exceeded and anonymous-blocked flows, routed its primary CTA to `/support`, added typed paywall analytics events, and verified 44px minimum action targets with focused component tests and Task 18 evidence artifacts.
- Added a Supabase-backed premium gate helper in `lib/services/premium-gate.ts` with quota checks against `active_subscriptions`, `usage_records`, and the `check_rate_limit` RPC, plus targeted service tests covering subscription, quota, anonymous, and fail-closed paths at `98.33%` line coverage.
- Added a Playwright mobile touch-target audit for the top 20 tools, generated `.sisyphus/evidence/touch-targets-2026-04.json` plus `docs/planning/TOUCH_TARGETS_BACKLOG.md`, and recorded `2594` sub-44px violations at the required `375x667` mobile viewport for later remediation.
- Completed the truthful Task 15 coverage push by adding bounded `PDFEditor` and `ReceiptScanner` media tests, removing unreachable `ReceiptScanner` helper code, and raising scoped line coverage to `98.03%` for `lib/`, `96.69%` for `components/features/`, and `97.33%` for `components/features/media`.

### Fixed
- Kept the new mobile Playwright audit on the correct runner boundary by excluding `tests/mobile/**` from Vitest discovery while still allowing `pnpm exec playwright test tests/mobile` to pass.
- Fixed stale Copilot session-sidebar tests to target the real `<button>` control and excluded Playwright-only `tests/a11y/**` specs from Vitest discovery so `CI=true pnpm test run` completes on the intended runner boundary.

### Changed
- Refreshed `.sisyphus/plans/supertool-improvement.md` on 2026-04-23 with verified 115 tool pages, an explicit 0%-executed refresh note, and a new Google AdSense monetization subphase for tool-page-only, consent-gated ads with premium ad suppression.

### Added
- Scoped the Wave 2 lint baseline to real source files by excluding generated `graphify-out` artifacts and disabling Biome's generic `noConsole` rule, which was over-reporting legitimate `console.error` and `console.warn` paths across the app.
- Resolved the highest-confidence Wave 2 TODO/FIXME debt by replacing committed template and migration placeholders with neutral guidance and re-enabling skipped clipboard and RecentTools tests whose local mocks now work reliably.
- Removed the remaining `as any` usage from `app/` test scaffolding by replacing canvas, FileReader, file-input, and split-bill unknown-status mocks with typed alternatives.
- Removed the remaining `as any` usage from `lib/` by typing the stopwatch Web Audio fallback explicitly and replacing the chunked-upload test `FormData` cast with a typed mock plus fallback coverage.
- Added Biome regression protection for console usage via `lint/suspicious/noConsole`, documenting the generic console guard now enforced for future changes.
- Removed noisy production `console.log` calls from upload, conversion, billing, subtitle-processing, PDF tooling, speed-test, resume export, Copilot local-file selection, and email flows while preserving genuine error logging paths.
- Kept the protected Polar webhook route unchanged during console-log triage while removing the remaining safe noisy runtime `console.log` calls from other production paths and dev diagnostics.
- Restored Codecov-backed coverage reporting on constrained `main` pushes, replaced the static README coverage badge with a live Codecov badge, and removed the obsolete workflow step that tried to rewrite `README.md` after coverage runs.
- Added `docs/guides/ENV_VARS.md` and synced the example environment files with the current runtime env-var inventory, including feature-flag conventions and missing server-only placeholders.
- Added a revenue model decision record in `docs/architecture/REVENUE_MODEL.md` documenting the hybrid Google AdSense plus premium approach, placement guardrails, and execution scope for future monetization work.
- Added a minimal environment-backed feature flag primitive via `isFeatureEnabled(name)` with conventions documented in `docs/guides/FEATURE_FLAGS.md` and test coverage for enabled, disabled, and missing environment variables.

### Added
- Comprehensive changelog system with semantic versioning structure
- Changelog maintenance instructions in `.github/copilot-instructions.md` (step 16 in "Adding New Tools Checklist")
- Changelog maintenance instructions in `opencode-instructions.md` (integrated into "Working with Codebases" workflow)
- Format guidelines for version numbering, categories, and entry structure
- Best practices for when and how to update the changelog
- Cross-references to related documentation in changelog entries
- Archive section for historical change tracking

---

## [1.0.0] - 2025-01-05

### Added
- **Project Foundation**
  - Next.js 15 App Router with React 19 architecture
  - Panda CSS styling system with dark glassmorphic theme
  - Vitest browser-mode testing infrastructure with ≥95% coverage requirement
  - TypeScript strict mode configuration
  - Biome for formatting and linting
  - Husky pre-commit hooks for code quality

- **Core Features**
  - User authentication system with Supabase
  - Analytics tracking with privacy-first approach (no PII)
  - Responsive mobile-first design system
  - Dark mode optimized UI components
  - Error handling and validation utilities

- **Developer Tools (70+ Tools)**
  - JSON Beautifier [Reference: docs/tools/data/01_JSON_BEAUTIFIER.md]
  - Split Bill Calculator [Reference: docs/tools/finance/02_SPLIT_BILL_CALCULATOR.md]
  - QR Code Generator [Reference: docs/03_QR_CODE_GENERATOR.md]
  - Password Generator [Reference: docs/tools/security/04_PASSWORD_GENERATOR.md]
  - Code Diff Viewer [Reference: docs/tools/development/05_CODE_DIFF_VIEWER.md]
  - Markdown Editor [Reference: docs/tools/productivity/06_MARKDOWN_EDITOR.md]
  - URL Shortener [Reference: docs/tools/productivity/07_URL_SHORTENER.md]
  - Text Transformer [Reference: docs/tools/productivity/08_TEXT_TRANSFORMER.md]
  - Image Optimizer [Reference: docs/tools/media/09_IMAGE_OPTIMIZER.md]
  - Video Converter [Reference: docs/10_VIDEO_CONVERTER.md]
  - Cloud File Upload [Reference: docs/tools/productivity/11_CLOUD_FILE_UPLOAD.md]
  - Base64 Encoder [Reference: docs/tools/security/12_BASE64_ENCODER.md]
  - Hash Generator [Reference: docs/tools/security/13_HASH_GENERATOR.md]
  - JSON to CSV [Reference: docs/tools/data/14_JSON_TO_CSV.md]
  - Unit Converter [Reference: docs/tools/productivity/15_UNIT_CONVERTER.md]
  - Website Screenshot [Reference: docs/tools/development/16_WEBSITE_SCREENSHOT.md]
  - PDF Tools Suite [Reference: docs/tools/productivity/17_PDF_TOOLS_SUITE.md]
  - Daily Task Summary [Reference: docs/tools/productivity/18_DAILY_TASK_SUMMARY.md]
  - BMI Health Calculator [Reference: docs/tools/productivity/19_BMI_HEALTH_CALCULATOR.md]
  - Pomodoro Timer [Reference: docs/tools/productivity/20_POMODORO_TIMER.md]
  - Encryption Tool [Reference: docs/tools/security/21_ENCRYPTION_TOOL.md]
  - IP Address Lookup [Reference: docs/tools/development/23_IP_ADDRESS_LOOKUP.md]
  - Currency Converter [Reference: docs/tools/finance/24_CURRENCY_CONVERTER.md]
  - Tally Counter [Reference: docs/tools/productivity/25_TALLY_COUNTER.md]
  - API Request Tester [Reference: docs/26_API_REQUEST_TESTER.md]
  - JSON to Markdown Table [Reference: docs/tools/data/27_JSON_TO_MARKDOWN_TABLE.md]
  - Browser Fingerprint [Reference: docs/tools/development/28_BROWSER_FINGERPRINT.md]
  - Color Contrast Checker [Reference: docs/tools/design/29_COLOR_CONTRAST_CHECKER.md]
  - JSON Schema Generator [Reference: docs/tools/data/30_JSON_SCHEMA_GENERATOR.md]
  - Password Strength Analyzer [Reference: docs/tools/security/31_PASSWORD_STRENGTH_ANALYZER.md]
  - Date Formatter Parser [Reference: docs/32_DATE_FORMATTER_PARSER.md]
  - Cron Expression Builder [Reference: docs/tools/development/33_CRON_EXPRESSION_BUILDER.md]
  - Favicon Generator [Reference: docs/tools/design/34_FAVICON_GENERATOR.md]
  - Color Picker & Palette Generator [Reference: docs/tools/design/35_COLOR_PICKER_PALETTE_GENERATOR.md]
  - Daily Note Generator [Reference: docs/tools/productivity/36_DAILY_NOTE_GENERATOR.md]
  - Network Speed Test [Reference: docs/tools/development/37_NETWORK_SPEED_TEST.md]
  - Image Metadata Viewer [Reference: docs/tools/design/38_IMAGE_METADATA_VIEWER.md]
  - AI Snippet Generator [Reference: docs/tools/development/39_AI_SNIPPET_GENERATOR.md]
  - AI JSON Analyzer [Reference: docs/tools/development/40_AI_JSON_ANALYZER.md]
  - AI Command Explainer [Reference: docs/tools/development/41_AI_COMMAND_EXPLAINER.md]
  - Text Steganography [Reference: docs/tools/security/42_TEXT_STEGANOGRAPHY.md]
  - Timezone Converter [Reference: docs/tools/productivity/43_TIMEZONE_CONVERTER.md]
  - YAML JSON Converter [Reference: docs/tools/development/44_YAML_JSON_CONVERTER.md]
  - File Inspector [Reference: docs/tools/development/45_FILE_INSPECTOR.md]
  - JWT Debugger [Reference: docs/tools/development/46_JWT_DEBUGGER.md]
  - Photo Editor [Reference: docs/tools/design/47_PHOTO_EDITOR.md]
  - GraphQL Playground [Reference: docs/tools/development/49_GRAPHQL_PLAYGROUND.md]
  - Webhook Tester [Reference: docs/tools/development/50_WEBHOOK_TESTER.md]
  - Resume Builder [Reference: docs/tools/productivity/51_RESUME_BUILDER.md]
  - Regex Tester [Reference: docs/tools/development/52_REGEX_TESTER.md]
  - Cover Letter Builder [Reference: docs/tools/productivity/53_COVER_LETTER_BUILDER.md]
  - Privacy Policy Generator [Reference: docs/tools/productivity/54_PRIVACY_POLICY_GENERATOR.md]
  - SQL Formatter [Reference: docs/tools/development/55_SQL_FORMATTER.md]
  - AI Code Converter [Reference: docs/tools/development/56_AI_CODE_CONVERTER.md]
  - Lorem Ipsum Generator [Reference: docs/tools/productivity/57_LOREM_IPSUM_GENERATOR.md]
  - Word Counter Pro [Reference: docs/tools/productivity/58_WORD_COUNTER_PRO.md]
  - Character Map [Reference: docs/tools/productivity/59_CHARACTER_MAP.md]
  - Image Optimizer & Converter [Reference: docs/tools/media/60_IMAGE_OPTIMIZER_CONVERTER.md]
  - Video Converter & Compressor [Reference: docs/tools/media/61_VIDEO_CONVERTER_COMPRESSOR.md]
  - Image to PDF Converter [Reference: docs/tools/media/62_IMAGE_TO_PDF_CONVERTER.md]
  - Meme Generator [Reference: docs/tools/media/63_MEME_GENERATOR.md]
  - Video Subtitle Combiner [Reference: docs/tools/media/64_VIDEO_SUBTITLE_COMBINER.md]
  - AI Image Caption Generator [Reference: docs/tools/media/65_AI_IMAGE_CAPTION_GENERATOR.md]
  - Icon Search & Download Hub [Reference: docs/tools/design/66_ICON_SEARCH_AND_DOWNLOAD_HUB.md]
  - Device Mockup Generator [Reference: docs/tools/design/67_DEVICE_MOCKUP_GENERATOR.md]
  - Digital Signature Generator [Reference: docs/tools/design/68_DIGITAL_SIGNATURE_GENERATOR.md]
  - Gradient Generator [Reference: docs/tools/design/69_GRADIENT_GENERATOR.md]
  - CSV Excel Converter [Reference: docs/tools/data/70_CSV_EXCEL_CONVERTER.md]
  - CSV Merger [Reference: docs/tools/data/71_CSV_MERGER.md]
  - UUID Generator [Reference: docs/tools/data/72_UUID_GENERATOR.md]
  - Placeholder Generator [Reference: docs/tools/design/73_PLACEHOLDER_GENERATOR.md]
  - *(70+ total tools - see docs/ directory for complete list)*

- **Documentation**
  - Comprehensive tool documentation (75+ markdown files)
  - Architecture documentation in docs/architecture/
  - Feature documentation in docs/features/
  - Setup guides in docs/setup/
  - Migration guides and contributing guidelines

- **Testing Infrastructure**
  - Vitest browser-mode testing with Playwright
  - Component testing utilities in test-utils/
  - ≥95% test coverage requirement enforced
  - CI pipeline with automated testing

- **Developer Experience**
  - GitHub Copilot instructions (.github/copilot-instructions.md)
  - OpenCode AI agent instructions (opencode-instructions.md)
  - Pre-commit hooks for code quality
  - Automated linting and formatting
  - CI status checks before merge

### Performance
- Client-side media processing (no server uploads for privacy)
- Optimized bundle splitting with Next.js App Router
- Lazy loading for heavy components
- Image optimization with Next.js Image component

### Security
- No PII tracking in analytics
- Client-side encryption options for sensitive tools
- Secure authentication with Supabase
- CSP headers and security best practices

---

## Archive

Previous versions and historical changes can be found in the git history.

---

## Maintenance Notes

### For Project Maintainers

1. **Always update this changelog** when merging PRs that include:
   - New features or tools
   - Bug fixes
   - Performance improvements
   - Breaking changes
   - Security patches

2. **Version bumping strategy**:
   - Bump MAJOR version for breaking changes
   - Bump MINOR version for new features/tools
   - Bump PATCH version for bug fixes only

3. **Release process**:
   - Update `[Unreleased]` section during development
   - On release, rename `[Unreleased]` to `[Version] - Date`
   - Create new empty `[Unreleased]` section at top
   - Tag the release in git with version number

4. **Cross-reference documentation**:
   - Link to relevant tool documentation files
   - Reference GitHub issues/PRs when applicable
   - Update related docs when changing this file

### For Contributors

Please update this changelog as part of your PR:
1. Add your changes under the `[Unreleased]` section
2. Use the appropriate category (Added, Changed, Fixed, etc.)
3. Provide clear, concise descriptions
4. Link to related documentation if applicable
5. Follow the format guidelines above

---

**Last Updated**: 2025-01-05
**Maintained By**: SuperTool Core Team
