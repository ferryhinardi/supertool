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
  - JSON Beautifier [Reference: docs/01_JSON_BEAUTIFIER.md]
  - Split Bill Calculator [Reference: docs/02_SPLIT_BILL_CALCULATOR.md]
  - QR Code Generator [Reference: docs/03_QR_CODE_GENERATOR.md]
  - Password Generator [Reference: docs/04_PASSWORD_GENERATOR.md]
  - Code Diff Viewer [Reference: docs/05_CODE_DIFF_VIEWER.md]
  - Markdown Editor [Reference: docs/06_MARKDOWN_EDITOR.md]
  - URL Shortener [Reference: docs/07_URL_SHORTENER.md]
  - Text Transformer [Reference: docs/08_TEXT_TRANSFORMER.md]
  - Image Optimizer [Reference: docs/09_IMAGE_OPTIMIZER.md]
  - Video Converter [Reference: docs/10_VIDEO_CONVERTER.md]
  - Cloud File Upload [Reference: docs/11_CLOUD_FILE_UPLOAD.md]
  - Base64 Encoder [Reference: docs/12_BASE64_ENCODER.md]
  - Hash Generator [Reference: docs/13_HASH_GENERATOR.md]
  - JSON to CSV [Reference: docs/14_JSON_TO_CSV.md]
  - Unit Converter [Reference: docs/15_UNIT_CONVERTER.md]
  - Website Screenshot [Reference: docs/16_WEBSITE_SCREENSHOT.md]
  - PDF Tools Suite [Reference: docs/17_PDF_TOOLS_SUITE.md]
  - Daily Task Summary [Reference: docs/18_DAILY_TASK_SUMMARY.md]
  - BMI Health Calculator [Reference: docs/19_BMI_HEALTH_CALCULATOR.md]
  - Pomodoro Timer [Reference: docs/20_POMODORO_TIMER.md]
  - Encryption Tool [Reference: docs/21_ENCRYPTION_TOOL.md]
  - IP Address Lookup [Reference: docs/23_IP_ADDRESS_LOOKUP.md]
  - Currency Converter [Reference: docs/24_CURRENCY_CONVERTER.md]
  - Tally Counter [Reference: docs/25_TALLY_COUNTER.md]
  - API Request Tester [Reference: docs/26_API_REQUEST_TESTER.md]
  - JSON to Markdown Table [Reference: docs/27_JSON_TO_MARKDOWN_TABLE.md]
  - Browser Fingerprint [Reference: docs/28_BROWSER_FINGERPRINT.md]
  - Color Contrast Checker [Reference: docs/29_COLOR_CONTRAST_CHECKER.md]
  - JSON Schema Generator [Reference: docs/30_JSON_SCHEMA_GENERATOR.md]
  - Password Strength Analyzer [Reference: docs/31_PASSWORD_STRENGTH_ANALYZER.md]
  - Date Formatter Parser [Reference: docs/32_DATE_FORMATTER_PARSER.md]
  - Cron Expression Builder [Reference: docs/33_CRON_EXPRESSION_BUILDER.md]
  - Favicon Generator [Reference: docs/34_FAVICON_GENERATOR.md]
  - Color Picker & Palette Generator [Reference: docs/35_COLOR_PICKER_PALETTE_GENERATOR.md]
  - Daily Note Generator [Reference: docs/36_DAILY_NOTE_GENERATOR.md]
  - Network Speed Test [Reference: docs/37_NETWORK_SPEED_TEST.md]
  - Image Metadata Viewer [Reference: docs/38_IMAGE_METADATA_VIEWER.md]
  - AI Snippet Generator [Reference: docs/39_AI_SNIPPET_GENERATOR.md]
  - AI JSON Analyzer [Reference: docs/40_AI_JSON_ANALYZER.md]
  - AI Command Explainer [Reference: docs/41_AI_COMMAND_EXPLAINER.md]
  - Text Steganography [Reference: docs/42_TEXT_STEGANOGRAPHY.md]
  - Timezone Converter [Reference: docs/43_TIMEZONE_CONVERTER.md]
  - YAML JSON Converter [Reference: docs/44_YAML_JSON_CONVERTER.md]
  - File Inspector [Reference: docs/45_FILE_INSPECTOR.md]
  - JWT Debugger [Reference: docs/46_JWT_DEBUGGER.md]
  - Photo Editor [Reference: docs/47_PHOTO_EDITOR.md]
  - GraphQL Playground [Reference: docs/49_GRAPHQL_PLAYGROUND.md]
  - Webhook Tester [Reference: docs/50_WEBHOOK_TESTER.md]
  - Resume Builder [Reference: docs/51_RESUME_BUILDER.md]
  - Regex Tester [Reference: docs/52_REGEX_TESTER.md]
  - Cover Letter Builder [Reference: docs/53_COVER_LETTER_BUILDER.md]
  - Privacy Policy Generator [Reference: docs/54_PRIVACY_POLICY_GENERATOR.md]
  - SQL Formatter [Reference: docs/55_SQL_FORMATTER.md]
  - AI Code Converter [Reference: docs/56_AI_CODE_CONVERTER.md]
  - Lorem Ipsum Generator [Reference: docs/57_LOREM_IPSUM_GENERATOR.md]
  - Word Counter Pro [Reference: docs/58_WORD_COUNTER_PRO.md]
  - Character Map [Reference: docs/59_CHARACTER_MAP.md]
  - Image Optimizer & Converter [Reference: docs/60_IMAGE_OPTIMIZER_CONVERTER.md]
  - Video Converter & Compressor [Reference: docs/61_VIDEO_CONVERTER_COMPRESSOR.md]
  - Image to PDF Converter [Reference: docs/62_IMAGE_TO_PDF_CONVERTER.md]
  - Meme Generator [Reference: docs/63_MEME_GENERATOR.md]
  - Video Subtitle Combiner [Reference: docs/64_VIDEO_SUBTITLE_COMBINER.md]
  - AI Image Caption Generator [Reference: docs/65_AI_IMAGE_CAPTION_GENERATOR.md]
  - Icon Search & Download Hub [Reference: docs/66_ICON_SEARCH_AND_DOWNLOAD_HUB.md]
  - Device Mockup Generator [Reference: docs/67_DEVICE_MOCKUP_GENERATOR.md]
  - Digital Signature Generator [Reference: docs/68_DIGITAL_SIGNATURE_GENERATOR.md]
  - Gradient Generator [Reference: docs/69_GRADIENT_GENERATOR.md]
  - CSV Excel Converter [Reference: docs/70_CSV_EXCEL_CONVERTER.md]
  - CSV Merger [Reference: docs/71_CSV_MERGER.md]
  - UUID Generator [Reference: docs/72_UUID_GENERATOR.md]
  - Placeholder Generator [Reference: docs/73_PLACEHOLDER_GENERATOR.md]
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
