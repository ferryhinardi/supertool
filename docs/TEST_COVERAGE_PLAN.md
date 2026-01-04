# Test Coverage Improvement Plan

**Current Coverage**: 25.37%  
**Target Coverage**: 75%  
**Gap**: 49.63%

**Files Analysis**:
- Total source files: 424
- Files with tests: 79 (18.63%)
- Files without tests: 345 (81.37%)
- Total test files: 119

---

## Coverage Status by Category

### 🔴 Critical Priority (0% Coverage)
These files handle core business logic, APIs, and security-sensitive operations.

#### API Routes (25 files - 0% tested)

**AI Services** (10 files)
- [ ] `app/api/ai-caption/route.ts` - AI image caption generation
- [ ] `app/api/ai-code-converter/route.ts` - Code language conversion
- [ ] `app/api/ai-command-explainer/route.ts` - Command explanation
- [ ] `app/api/ai-cover-letter/route.ts` - Cover letter generation
- [ ] `app/api/ai-json-analyze/route.ts` - JSON analysis
- [ ] `app/api/ai-pdf-summarize/route.ts` - PDF summarization
- [ ] `app/api/ai-prompt-explainer/route.ts` - Prompt explanation
- [ ] `app/api/ai-snippet/route.ts` - Code snippet generation
- [ ] `app/api/ai-text-rewriter/route.ts` - Text rewriting
- [ ] `app/api/grammar-check/route.ts` - Grammar checking

**Core Services** (8 files)
- [ ] `app/api/analytics/[code]/route.ts` - Analytics tracking
- [ ] `app/api/exchange-rates/route.ts` - Currency exchange rates
- [ ] `app/api/feedback/route.ts` - User feedback submission
- [ ] `app/api/screenshot/route.ts` - Website screenshots
- [ ] `app/api/shorten/route.ts` - URL shortening
- [ ] `app/api/urls/route.ts` - URL management
- [ ] `app/api/upload-chunk/route.ts` - Chunked file uploads
- [ ] `app/api/text-summarizer/route.ts` - Text summarization

**Security & PDF** (4 files)
- [ ] `app/api/pdf-protect/route.ts` - PDF password protection
- [ ] `app/api/pdf-unlock/route.ts` - PDF password removal
- [ ] `app/api/video-subtitle/route.ts` - Video subtitle processing
- [ ] `app/api/webhooks/[id]/route.ts` - Webhook management
- [ ] `app/api/webhooks/create/route.ts` - Webhook creation
- [ ] `app/api/webhooks/polar/route.ts` - Polar payment webhooks

#### Authentication (2 files)
- [ ] `app/auth/callback/route.ts` - OAuth callback handler
- [ ] `app/auth/error/page.tsx` - Auth error page

#### Core Library Services (11 files)

**Authentication**
- [ ] `lib/auth/auth-store.ts` - Auth state management
- [ ] `lib/auth/auth-types.ts` - Auth type definitions
- [ ] `lib/auth/supabaseClient.ts` - Supabase client setup
- [ ] `lib/auth/supabaseServer.ts` - Server-side Supabase

**Services**
- [ ] `lib/services/analytics.ts` - Analytics tracking logic
- [ ] `lib/services/email.ts` - Email sending service
- [ ] `lib/services/polar.ts` - Polar payment integration
- [ ] `lib/services/rating-service.ts` - Tool rating service
- [ ] `lib/services/ads-config.ts` - Ad configuration

**Media**
- [ ] `lib/media/ffmpeg-loader.ts` - FFmpeg initialization
- [ ] `lib/media/video-compressor.ts` - Video compression logic

#### Tool Services (14 files)

**Split Bill Service**
- [ ] `lib/tools/split-bill/receipt-parser.ts` - Receipt OCR parsing
- [ ] `lib/tools/split-bill/split-bill-a11y.ts` - Accessibility helpers
- [ ] `lib/tools/split-bill/split-bill-export-legacy.ts` - Legacy export
- [ ] `lib/tools/split-bill/split-bill-export.tsx` - Export component
- [ ] `lib/tools/split-bill/split-bill-shortcuts.ts` - Keyboard shortcuts
- [ ] `lib/tools/split-bill/split-bill-storage.ts` - Storage management
- [ ] `lib/tools/split-bill/split-bill-types.ts` - Type definitions

**QR Code Service**
- [ ] `lib/tools/qr/qr-export-service.ts` - QR code export
- [ ] `lib/tools/qr/qr-history-service.ts` - QR code history
- [ ] `lib/tools/qr/qr-scanner-service.ts` - QR code scanning
- [ ] `lib/tools/qr/qr-types.ts` - QR type definitions

**Currency Service**
- [ ] `lib/tools/currency/currency-converter.ts` - Currency conversion logic
- [ ] `lib/tools/currency/currency.ts` - Currency utilities

**Other**
- [ ] `lib/tools/stopwatch/stopwatch-utils.ts` - Stopwatch utilities

---

### 🟡 High Priority (Partial Coverage)
These files have some tests but need more comprehensive coverage.

#### Utility Libraries (4 files)
- [ ] `lib/utils.ts` - General utility functions
- [ ] `lib/utils/privacy.ts` - Privacy-related utilities
- [ ] `lib/chunked-upload.ts` - Chunked upload logic
- [ ] `lib/seo/metadata.ts` - SEO metadata generation

#### Data Layer (5 files)
- [ ] `lib/data/donation-tiers.ts` - Donation tier configuration
- [ ] `lib/data/metadata.ts` - Tool metadata
- [ ] `lib/data/structured-data.ts` - Structured data for SEO
- [ ] `lib/data/tool-components-types.ts` - Tool component types
- [ ] `lib/data/tools.ts` - Tool definitions

---

### 🟢 Medium Priority (Component Testing)
These are React components that need UI/integration tests.

#### Layout Components (4 files)
- [ ] `components/layout/Header.tsx` - Main header
- [ ] `components/layout/Sidebar.tsx` - Navigation sidebar
- [ ] `app/layout.tsx` - Root layout
- [ ] `app/page.tsx` - Homepage (has partial tests)

#### Auth Components (6 files)
- [ ] `components/auth/AuthModal.tsx` - Auth modal dialog
- [ ] `components/auth/ForgotPasswordForm.tsx` - Password reset
- [ ] `components/auth/GitHubButton.tsx` - GitHub OAuth
- [ ] `components/auth/GoogleButton.tsx` - Google OAuth
- [ ] `components/auth/LoginForm.tsx` - Login form
- [ ] `components/auth/SignupForm.tsx` - Signup form

#### Feature Components (13 files)

**Ads**
- [ ] `components/features/ads/AdBanner.tsx` - ✅ Has tests
- [ ] `components/features/ads/AdContainer.tsx` - ✅ Has tests
- [ ] `components/features/ads/AffiliateSuggestion.tsx` - ✅ Has tests
- [ ] `components/features/ads/CarbonAd.tsx` - ✅ Has tests
- [ ] `components/features/ads/EthicalAd.tsx` - ✅ Has tests

**Media**
- [ ] `components/features/media/FFmpegProvider.tsx` - FFmpeg context
- [ ] `components/features/media/ItemPreviewModal.tsx` - Preview modal
- [ ] `components/features/media/PDFEditor.tsx` - PDF editor component
- [ ] `components/features/media/ReceiptScanner.tsx` - Receipt scanner

**Shared**
- [ ] `components/features/shared/FeedbackDialog.tsx` - Feedback form
- [ ] `components/features/shared/ShortcutsHelp.tsx` - Shortcuts help
- [ ] `components/features/shared/TemplatesSelector.tsx` - Template picker
- [ ] `components/features/shared/TreatMeDialog.tsx` - Donation dialog

**SEO**
- [ ] `components/features/seo/FAQSection.tsx` - FAQ component
- [ ] `components/features/seo/HowItWorks.tsx` - How it works section

**Support**
- [ ] `components/features/support/DonationForm.tsx` - Donation form
- [ ] `components/features/support/RecentSupporters.tsx` - Supporter list

**Tools**
- [ ] `components/features/tools/ToolDragList.tsx` - Draggable tool list
- [ ] `components/features/tools/ToolEmptyState.tsx` - Empty state
- [ ] `components/features/tools/ToolKeyboardShortcuts.tsx` - Shortcuts
- [ ] `components/features/tools/ToolMobilePicker.tsx` - Mobile picker
- [ ] `components/features/tools/ToolOperationGrid.tsx` - Operation grid
- [ ] `components/features/tools/ToolProcessingModal.tsx` - Processing modal

**Currency**
- [ ] `components/features/currency/CurrencyConverter.tsx` - Currency converter

#### Providers (2 files)
- [ ] `components/providers/AuthProvider.tsx` - Auth context
- [ ] `components/providers/ReactQueryProvider.tsx` - React Query setup

#### UI Components (11 files)
- [ ] `components/ui/dialog.tsx` - Dialog component
- [ ] `components/ui/export-button.tsx` - Export button
- [ ] `components/ui/faq-accordion.tsx` - FAQ accordion
- [ ] `components/ui/keyboard-shortcuts-dialog.tsx` - Shortcuts dialog
- [ ] `components/ui/related-tools.tsx` - Related tools
- [ ] `components/ui/social-share.tsx` - Social sharing
- [ ] `components/ui/swipeable-item.tsx` - Swipeable item
- [ ] `components/ui/tool-rating.tsx` - Tool rating
- [ ] `components/ui/tool-search.tsx` - Tool search

---

### 🟣 Tool Pages (180+ files - Most Untested)
Individual tool implementation pages. Many are similar and can use shared test patterns.

#### Data Tools (Partial Coverage)
**Tested:**
- ✅ `app/tools/data/csv-merger/page.tsx`
- ✅ `app/tools/data/date-formatter/page.tsx` + utils
- ✅ `app/tools/data/json-beautify/page.tsx`
- ✅ `app/tools/data/json-markdown-table/page.tsx`
- ✅ `app/tools/data/json-schema/page.tsx` + utils
- ✅ `app/tools/data/json-to-csv/page.tsx`
- ✅ `app/tools/data/uuid-generator/page.tsx`

**Untested:**
- [ ] `app/tools/data/csv-excel/page.tsx` - CSV ↔ Excel converter

#### Design Tools (Partial Coverage)
**Tested:**
- ✅ `app/tools/design/color-contrast/page.tsx`
- ✅ `app/tools/design/color-picker/page.tsx`
- ✅ `app/tools/design/favicon-generator/page.tsx` + utils
- ✅ `app/tools/design/gradient-generator/page.tsx`
- ✅ `app/tools/design/image-metadata/page.tsx`
- ✅ `app/tools/design/photo-editor/page.tsx`
- ✅ `app/tools/design/svg-optimizer/page.tsx`

**Untested:**
- [ ] `app/tools/design/device-mockup/page.tsx` - Device mockup generator
- [ ] `app/tools/design/icon-search/page.tsx` - Icon search hub
- [ ] `app/tools/design/placeholder-generator/page.tsx` - Placeholder generator
- [ ] `app/tools/design/screenshot-diff/page.tsx` - Screenshot diff tool
- [ ] `app/tools/design/signature-generator/page.tsx` - Digital signature

#### Development Tools (Partial Coverage)
**Tested:**
- ✅ `app/tools/development/ai-command-explainer/page.tsx`
- ✅ `app/tools/development/ai-json-analyzer/page.tsx`
- ✅ `app/tools/development/ai-prompt-explainer/page.tsx`
- ✅ `app/tools/development/ai-snippet-generator/page.tsx`
- ✅ `app/tools/development/api-tester/page.tsx`
- ✅ `app/tools/development/browser-fingerprint/page.tsx` + utils
- ✅ `app/tools/development/cron-expression/page.tsx` + utils
- ✅ `app/tools/development/diff/page.tsx`
- ✅ `app/tools/development/dockerfile-formatter/page.tsx`
- ✅ `app/tools/development/ip-lookup/page.tsx`
- ✅ `app/tools/development/jwt-decoder/page.tsx`
- ✅ `app/tools/development/prompt-formatter/page.tsx`
- ✅ `app/tools/development/speed-test/page.tsx`
- ✅ `app/tools/development/website-screenshot/page.tsx`
- ✅ `app/tools/development/yaml-json/page.tsx`

**Untested:**
- [ ] `app/tools/development/ai-code-converter/page.tsx` - AI code converter
- [ ] `app/tools/development/cron-builder/page.tsx` - Cron expression builder
- [ ] `app/tools/development/file-inspector/page.tsx` - File inspector
- [ ] `app/tools/development/graphql-playground/page.tsx` - GraphQL playground
- [ ] `app/tools/development/jwt-debugger/page.tsx` - JWT debugger
- [ ] `app/tools/development/regex-tester/page.tsx` - Regex tester
- [ ] `app/tools/development/sql-formatter/page.tsx` - SQL formatter
- [ ] `app/tools/development/webhook-tester/page.tsx` - Webhook tester

#### Finance Tools (Full Coverage ✅)
- ✅ `app/tools/finance/currency-converter/page.tsx`
- ✅ `app/tools/finance/loan-calculator/page.tsx`
- ✅ `app/tools/finance/percentage-calculator/page.tsx`
- ✅ `app/tools/finance/split-bill/page.tsx`
- ✅ `app/tools/finance/tip-calculator/page.tsx`

**Untested:**
- [ ] `app/tools/finance/split-bill/history/page.tsx` - Split bill history

#### Media Tools (Partial Coverage)
**Tested:**
- ✅ `app/tools/media/ai-image-caption/page.tsx`
- ✅ `app/tools/media/image-optimizer/page.tsx`
- ✅ `app/tools/media/image-to-pdf/page.tsx`
- ✅ `app/tools/media/video-converter/page.tsx`
- ✅ `app/tools/media/video-subtitle-combiner/page.tsx`

**Untested:**
- [ ] `app/tools/media/image-format-converter/page.tsx` - Image format converter
- [ ] `app/tools/media/image-to-text/page.tsx` - Image to text (OCR)
- [ ] `app/tools/media/meme-generator/page.tsx` - Meme generator
- [ ] `app/tools/media/qr-code-scanner/page.tsx` - QR code scanner
- [ ] `app/tools/media/svg-to-png/page.tsx` - SVG to PNG converter

#### Productivity Tools (Partial Coverage)
**Tested:**
- ✅ `app/tools/productivity/age-calculator/page.tsx`
- ✅ `app/tools/productivity/ai-text-rewriter/page.tsx`
- ✅ `app/tools/productivity/batch-rename/page.tsx`
- ✅ `app/tools/productivity/bmi-calculator/page.tsx`
- ✅ `app/tools/productivity/clipboard-formatter/page.tsx`
- ✅ `app/tools/productivity/clipboard-history/page.tsx`
- ✅ `app/tools/productivity/daily-note/page.tsx`
- ✅ `app/tools/productivity/daily-task-summary/page.tsx`
- ✅ `app/tools/productivity/grammar-checker/page.tsx`
- ✅ `app/tools/productivity/invoice-generator/page.tsx`
- ✅ `app/tools/productivity/keyword-density/page.tsx`
- ✅ `app/tools/productivity/markdown-editor/page.tsx`
- ✅ `app/tools/productivity/pdf-tools/page.tsx`
- ✅ `app/tools/productivity/pomodoro/page.tsx`
- ✅ `app/tools/productivity/qr-code/page.tsx`
- ✅ `app/tools/productivity/tally-counter/page.tsx`
- ✅ `app/tools/productivity/task-timer/page.tsx`
- ✅ `app/tools/productivity/text-similarity/page.tsx`
- ✅ `app/tools/productivity/text-summarizer/page.tsx`
- ✅ `app/tools/productivity/text-transformer/page.tsx`
- ✅ `app/tools/productivity/timezone-converter/page.tsx`
- ✅ `app/tools/productivity/unit-converter/page.tsx`
- ✅ `app/tools/productivity/upload/page.tsx`
- ✅ `app/tools/productivity/url-shortener/page.tsx`

**Untested:**
- [ ] `app/tools/productivity/character-map/page.tsx` - Character map
- [ ] `app/tools/productivity/cover-letter-builder/page.tsx` - Cover letter builder (+ 14 component files)
- [ ] `app/tools/productivity/lorem-ipsum/page.tsx` - Lorem ipsum generator
- [ ] `app/tools/productivity/privacy-policy-generator/page.tsx` - Privacy policy generator
- [ ] `app/tools/productivity/resume-builder/page.tsx` - Resume builder (+ 20 component files)
- [ ] `app/tools/productivity/stopwatch-timer/page.tsx` - Stopwatch & timer
- [ ] `app/tools/productivity/word-counter/page.tsx` - Word counter

#### Security Tools (Full Coverage ✅)
- ✅ `app/tools/security/base64/page.tsx`
- ✅ `app/tools/security/encryption-tool/page.tsx` + utils
- ✅ `app/tools/security/file-verifier/page.tsx`
- ✅ `app/tools/security/hash-generator/page.tsx`
- ✅ `app/tools/security/password-generator/page.tsx`
- ✅ `app/tools/security/password-strength/page.tsx` + utils
- ✅ `app/tools/security/ssl-checker/page.tsx`
- ✅ `app/tools/security/steganography/page.tsx`

---

### 📊 Resume & Cover Letter Builder Components (34 files - 0% coverage)

These are complex document builders with multiple templates and forms.

#### Resume Builder (20 files)
**Components:**
- [ ] `app/tools/productivity/resume-builder/components/EducationForm.tsx`
- [ ] `app/tools/productivity/resume-builder/components/ExperienceForm.tsx`
- [ ] `app/tools/productivity/resume-builder/components/PersonalInfoForm.tsx`
- [ ] `app/tools/productivity/resume-builder/components/ProjectsForm.tsx`
- [ ] `app/tools/productivity/resume-builder/components/ResumePreview.tsx`
- [ ] `app/tools/productivity/resume-builder/components/SkillsForm.tsx`
- [ ] `app/tools/productivity/resume-builder/components/TemplateThumbnail.tsx`

**Templates (10 templates):**
- [ ] `app/tools/productivity/resume-builder/components/templates/ClassicTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/CompactTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/CreativeTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/ElegantTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/ExecutiveTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/MinimalTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/ModernTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/ProfessionalTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/TechTemplate.tsx`
- [ ] `app/tools/productivity/resume-builder/components/templates/TwoColumnTemplate.tsx`

**Utilities:**
- [ ] `app/tools/productivity/resume-builder/lib/pdfExport.ts`
- [ ] `app/tools/productivity/resume-builder/samplePersonas.ts`
- [ ] `app/tools/productivity/resume-builder/templates.ts`
- [ ] `app/tools/productivity/resume-builder/types.ts`
- [ ] `app/tools/productivity/resume-builder/utils.ts`

#### Cover Letter Builder (14 files)
**Components:**
- [ ] `app/tools/productivity/cover-letter-builder/components/AISuggestions.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/CoverLetterForm.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/CoverLetterTips.tsx`

**Templates (7 templates):**
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/ClassicTemplate.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/CreativeTemplate.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/ExecutiveTemplate.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/MinimalTemplate.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/ModernTemplate.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/ProfessionalTemplate.tsx`
- [ ] `app/tools/productivity/cover-letter-builder/components/templates/TechTemplate.tsx`

**Utilities:**
- [ ] `app/tools/productivity/cover-letter-builder/lib/pdfExport.ts`
- [ ] `app/tools/productivity/cover-letter-builder/types.ts`
- [ ] `app/tools/productivity/cover-letter-builder/utils.ts`

---

### 📦 PDF Tools Suite Components (20 files - Partial coverage)

**Tested:**
- ✅ `app/tools/productivity/pdf-tools/components/WatermarkPreview.tsx`
- ✅ `app/tools/productivity/pdf-tools/components/WatermarkTemplates.tsx`
- ✅ `app/tools/productivity/pdf-tools/utils/qrCodeGenerator.ts`

**Main Components (11 files):**
- [ ] `app/tools/productivity/pdf-tools/PDFBatchProcessor.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFKeyboardShortcuts.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFMetadataEditor.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFPageEditFlow.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFPageThumbnails.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFPreview.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFReorderList.tsx`
- [ ] `app/tools/productivity/pdf-tools/PDFThumbnail.tsx`
- [ ] `app/tools/productivity/pdf-tools/CompressionPresets.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/BatchQueue.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/BatchToolbar.tsx`

**Sub-Components (13 files):**
- [ ] `app/tools/productivity/pdf-tools/components/ComparisonView.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/DesktopUploadButton.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/EmptyState.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/KeyboardShortcutsDialog.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/MobileOperationPicker.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/MobileUploadButton.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/OperationGrid.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/OperationProgress.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/PDFListReorder.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/PDFMetadataEditor.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/PDFThumbnail.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/PresetsDialog.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/ProcessingModal.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/ReorderablePDFList.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/SummarizationDialog.tsx`
- [ ] `app/tools/productivity/pdf-tools/components/SwipeablePDFCard.tsx`

**Hooks (4 files):**
- [ ] `app/tools/productivity/pdf-tools/hooks/useBatchQueue.ts`
- [ ] `app/tools/productivity/pdf-tools/hooks/useKeyboardShortcuts.ts`
- [ ] `app/tools/productivity/pdf-tools/hooks/useOperationHistory.ts`
- [ ] `app/tools/productivity/pdf-tools/hooks/useRecentOperations.ts`

**Utilities (2 files):**
- [ ] `app/tools/productivity/pdf-tools/utils/compressionAnalyzer.ts`
- [ ] `app/tools/productivity/pdf-tools/utils/pdfTextExtractor.ts`

---

### 🎯 Custom Hooks (3 files - Partial coverage)

**Tested:**
- ✅ `hooks/common/useDebounce.ts`

**Untested:**
- [ ] `hooks/common/useKeyboardShortcuts.ts` - Keyboard shortcuts hook
- [ ] `hooks/common/useSwipeGesture.ts` - Swipe gesture detection
- [ ] `hooks/tools/useCurrencyConverter.ts` - Currency converter hook

---

## Testing Strategy to Reach 75% Coverage

### Phase 1: Critical Infrastructure (Week 1-2) - +15%
**Focus**: API routes, services, and authentication

1. **API Route Tests** (10 files/day)
   - Test request/response handling
   - Test error cases (400, 401, 404, 500)
   - Test rate limiting
   - Mock external services (OpenAI, Supabase)

2. **Service Layer Tests** (5 files/day)
   - Analytics tracking
   - Email service
   - Payment integration
   - Auth flows

3. **Test Pattern**:
```typescript
describe('API: /api/example', () => {
  it('should return 200 with valid data')
  it('should return 400 with invalid input')
  it('should return 401 when unauthorized')
  it('should return 500 on server error')
})
```

### Phase 2: Shared Libraries & Utilities (Week 3) - +10%
**Focus**: Tool services, utilities, and data layer

1. **Tool Services** (Split bill, QR, Currency)
   - Unit tests for business logic
   - Integration tests for storage
   - Test data validation

2. **Utility Functions**
   - Test edge cases
   - Test error handling
   - Test performance-critical paths

### Phase 3: React Components (Week 4-5) - +15%
**Focus**: UI components and layout

1. **Component Test Pattern**:
```typescript
describe('Component: Button', () => {
  it('should render correctly')
  it('should handle click events')
  it('should be disabled when loading')
  it('should render different variants')
})
```

2. **Priority Order**:
   - Auth components (security-critical)
   - Layout components (used everywhere)
   - Feature components (business logic)
   - UI components (design system)

### Phase 4: Tool Pages (Week 6-8) - +20%
**Focus**: Individual tool implementations

1. **Tool Page Test Template** (reusable):
```typescript
describe('Tool: [Name]', () => {
  it('should render with default state')
  it('should handle user input')
  it('should process data correctly')
  it('should export results')
  it('should handle errors gracefully')
})
```

2. **Batch Testing Strategy**:
   - Group similar tools (e.g., all converters)
   - Create shared test utilities
   - Test 5-10 tools per day

### Phase 5: Complex Features (Week 9-10) - +15%
**Focus**: Resume/Cover letter builders, PDF tools

1. **Document Builders**:
   - Test form validation
   - Test template rendering
   - Test PDF export
   - Test data persistence

2. **PDF Tools Suite**:
   - Test file operations
   - Test batch processing
   - Test compression
   - Test metadata editing

---

## Test Infrastructure Improvements

### 1. Shared Test Utilities
Create common test helpers:

```typescript
// test-utils/tool-page-helpers.ts
export const renderToolPage = (component) => {...}
export const mockFileUpload = (file) => {...}
export const expectValidExport = (data) => {...}
```

### 2. Mock Services
```typescript
// test-utils/mocks.ts
export const mockSupabase = {...}
export const mockOpenAI = {...}
export const mockFFmpeg = {...}
```

### 3. Test Data Generators
```typescript
// test-utils/fixtures.ts
export const generateMockUser = () => {...}
export const generateMockBill = () => {...}
export const generateMockPDF = () => {...}
```

### 4. Coverage Thresholds
Update `vitest.config.mts`:
```typescript
coverage: {
  lines: 75,
  functions: 70,
  branches: 70,
  statements: 75
}
```

---

## Quick Wins (Can be done in 1-2 days) - +5%

These files are simple and can boost coverage quickly:

1. **Type-only files** (just import tests):
   - `lib/auth/auth-types.ts`
   - `lib/tools/qr/qr-types.ts`
   - `lib/tools/split-bill/split-bill-types.ts`

2. **Simple utilities**:
   - `lib/tools/stopwatch/stopwatch-utils.ts`
   - `lib/utils/privacy.ts`
   - `app/tools/data/date-formatter/utils.ts`

3. **Configuration files**:
   - `lib/data/donation-tiers.ts`
   - `lib/services/ads-config.ts`
   - `app/manifest.ts`

---

## Estimated Timeline

| Phase | Duration | Coverage Gain | Total Coverage |
|-------|----------|---------------|----------------|
| Quick Wins | 2 days | +5% | 30% |
| Phase 1: APIs | 2 weeks | +15% | 45% |
| Phase 2: Services | 1 week | +10% | 55% |
| Phase 3: Components | 2 weeks | +15% | 70% |
| Phase 4: Tool Pages | 3 weeks | +20% | 90% |
| Phase 5: Complex Features | 2 weeks | +15% | **75%** ✅ |

**Total Duration**: ~10-12 weeks (2.5-3 months)

---

## Next Steps

1. ✅ Review this plan
2. Start with Quick Wins to see immediate progress
3. Set up CI/CD to enforce coverage thresholds incrementally:
   - Week 1: 30%
   - Week 3: 40%
   - Week 5: 50%
   - Week 7: 60%
   - Week 9: 70%
   - Week 11: 75% ✅
4. Assign testing tasks to team members
5. Create test templates for common patterns
6. Set up coverage reporting dashboard

---

## Resources

- **Test Examples**: `app/tools/finance/` - All finance tools have complete tests
- **Component Tests**: `components/ui/__tests__/` - Good UI test examples
- **API Tests**: `app/api/ssl-check/__tests__/` - API test pattern
- **Service Tests**: `lib/__tests__/split-bill-service.test.ts` - Service test pattern

---

**Generated**: 2026-01-03  
**Current Coverage**: 25.37%  
**Target**: 75%  
**Status**: 🚧 Planning Complete - Ready for Implementation
