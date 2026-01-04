# Test Coverage Tasks - Prioritized Action Items

**Target**: Increase coverage from 25.37% to 75%  
**Estimated Duration**: 10-12 weeks

---

## 🚀 Quick Wins (Week 1 - Day 1-2) - Target: 30%

### Day 1: Type Files & Simple Utilities (+3%)
- [ ] Test `lib/auth/auth-types.ts` (import test)
- [ ] Test `lib/tools/qr/qr-types.ts` (import test)
- [ ] Test `lib/tools/split-bill/split-bill-types.ts` (import test)
- [ ] Test `app/tools/productivity/resume-builder/types.ts` (import test)
- [ ] Test `app/tools/productivity/cover-letter-builder/types.ts` (import test)
- [ ] Test `lib/utils/privacy.ts` (simple functions)
- [ ] Test `lib/tools/stopwatch/stopwatch-utils.ts` (utilities)

### Day 2: Configuration & Metadata (+2%)
- [ ] Test `lib/data/donation-tiers.ts` (data export)
- [ ] Test `lib/services/ads-config.ts` (config)
- [ ] Test `app/manifest.ts` (Next.js manifest)
- [ ] Test `app/robots.ts` (robots.txt generation)
- [ ] Test `app/sitemap.ts` (sitemap generation)

**Checkpoint**: Coverage should be ~30% ✅

---

## 🔴 Phase 1: Critical APIs & Services (Week 1-2) - Target: 45%

### Week 1, Day 3-4: AI API Routes (+5%)
Test all AI service endpoints with mocked OpenAI:

- [ ] `app/api/ai-caption/route.ts`
- [ ] `app/api/ai-code-converter/route.ts`
- [ ] `app/api/ai-command-explainer/route.ts`
- [ ] `app/api/ai-cover-letter/route.ts`
- [ ] `app/api/ai-json-analyze/route.ts`
- [ ] `app/api/ai-pdf-summarize/route.ts`
- [ ] `app/api/ai-prompt-explainer/route.ts`
- [ ] `app/api/ai-snippet/route.ts`
- [ ] `app/api/ai-text-rewriter/route.ts`
- [ ] `app/api/grammar-check/route.ts`

**Test Pattern**:
```typescript
describe('POST /api/ai-caption', () => {
  it('returns 200 with valid image')
  it('returns 400 with invalid input')
  it('returns 401 without auth')
  it('handles OpenAI errors')
})
```

### Week 1, Day 5: Core API Routes (+3%)
- [ ] `app/api/analytics/[code]/route.ts`
- [ ] `app/api/exchange-rates/route.ts`
- [ ] `app/api/feedback/route.ts`
- [ ] `app/api/shorten/route.ts`
- [ ] `app/api/urls/route.ts`

### Week 2, Day 1-2: Media & Security APIs (+4%)
- [ ] `app/api/screenshot/route.ts`
- [ ] `app/api/pdf-protect/route.ts`
- [ ] `app/api/pdf-unlock/route.ts`
- [ ] `app/api/video-subtitle/route.ts`
- [ ] `app/api/upload-chunk/route.ts`
- [ ] `app/api/text-summarizer/route.ts`

### Week 2, Day 3-4: Webhook & Auth Routes (+3%)
- [ ] `app/api/webhooks/[id]/route.ts`
- [ ] `app/api/webhooks/create/route.ts`
- [ ] `app/api/webhooks/polar/route.ts`
- [ ] `app/auth/callback/route.ts`
- [ ] `app/auth/error/page.tsx`

**Checkpoint**: Coverage should be ~45% ✅

---

## 📚 Phase 2: Services & Libraries (Week 3) - Target: 55%

### Week 3, Day 1: Authentication Services (+2%)
- [ ] `lib/auth/auth-store.ts`
- [ ] `lib/auth/supabaseClient.ts`
- [ ] `lib/auth/supabaseServer.ts`

### Week 3, Day 2: Core Services (+3%)
- [ ] `lib/services/analytics.ts`
- [ ] `lib/services/email.ts`
- [ ] `lib/services/polar.ts`
- [ ] `lib/services/rating-service.ts`

### Week 3, Day 3: Media Services (+2%)
- [ ] `lib/media/ffmpeg-loader.ts`
- [ ] `lib/media/video-compressor.ts`
- [ ] `lib/chunked-upload.ts`

### Week 3, Day 4: Split Bill Service (+2%)
- [ ] `lib/tools/split-bill/receipt-parser.ts`
- [ ] `lib/tools/split-bill/split-bill-a11y.ts`
- [ ] `lib/tools/split-bill/split-bill-export-legacy.ts`
- [ ] `lib/tools/split-bill/split-bill-export.tsx`
- [ ] `lib/tools/split-bill/split-bill-shortcuts.ts`
- [ ] `lib/tools/split-bill/split-bill-storage.ts`

### Week 3, Day 5: Other Tool Services (+1%)
- [ ] `lib/tools/qr/qr-export-service.ts`
- [ ] `lib/tools/qr/qr-history-service.ts`
- [ ] `lib/tools/qr/qr-scanner-service.ts`
- [ ] `lib/tools/currency/currency-converter.ts`
- [ ] `lib/tools/currency/currency.ts`

**Checkpoint**: Coverage should be ~55% ✅

---

## ⚛️ Phase 3: React Components (Week 4-5) - Target: 70%

### Week 4, Day 1: Layout Components (+2%)
- [ ] `components/layout/Header.tsx`
- [ ] `components/layout/Sidebar.tsx`
- [ ] `app/layout.tsx` (improve existing tests)

### Week 4, Day 2-3: Auth Components (+3%)
- [ ] `components/auth/AuthModal.tsx`
- [ ] `components/auth/ForgotPasswordForm.tsx`
- [ ] `components/auth/GitHubButton.tsx`
- [ ] `components/auth/GoogleButton.tsx`
- [ ] `components/auth/LoginForm.tsx`
- [ ] `components/auth/SignupForm.tsx`

### Week 4, Day 4-5: Feature Components - Media & SEO (+3%)
- [ ] `components/features/media/FFmpegProvider.tsx`
- [ ] `components/features/media/ItemPreviewModal.tsx`
- [ ] `components/features/media/PDFEditor.tsx`
- [ ] `components/features/media/ReceiptScanner.tsx`
- [ ] `components/features/seo/FAQSection.tsx`
- [ ] `components/features/seo/HowItWorks.tsx`

### Week 5, Day 1-2: Feature Components - Shared & Tools (+4%)
- [ ] `components/features/shared/FeedbackDialog.tsx`
- [ ] `components/features/shared/ShortcutsHelp.tsx`
- [ ] `components/features/shared/TemplatesSelector.tsx`
- [ ] `components/features/shared/TreatMeDialog.tsx`
- [ ] `components/features/tools/ToolDragList.tsx`
- [ ] `components/features/tools/ToolEmptyState.tsx`
- [ ] `components/features/tools/ToolKeyboardShortcuts.tsx`
- [ ] `components/features/tools/ToolMobilePicker.tsx`
- [ ] `components/features/tools/ToolOperationGrid.tsx`
- [ ] `components/features/tools/ToolProcessingModal.tsx`

### Week 5, Day 3: Support & Currency Components (+1%)
- [ ] `components/features/support/DonationForm.tsx`
- [ ] `components/features/support/RecentSupporters.tsx`
- [ ] `components/features/currency/CurrencyConverter.tsx`

### Week 5, Day 4-5: UI Components (+2%)
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/export-button.tsx`
- [ ] `components/ui/faq-accordion.tsx`
- [ ] `components/ui/keyboard-shortcuts-dialog.tsx`
- [ ] `components/ui/related-tools.tsx`
- [ ] `components/ui/social-share.tsx`
- [ ] `components/ui/swipeable-item.tsx`
- [ ] `components/ui/tool-rating.tsx`
- [ ] `components/ui/tool-search.tsx`

**Checkpoint**: Coverage should be ~70% ✅

---

## 🛠️ Phase 4: Tool Pages (Week 6-8) - Target: 75%

### Week 6: Development Tools (+2%)
- [ ] `app/tools/development/ai-code-converter/page.tsx`
- [ ] `app/tools/development/cron-builder/page.tsx`
- [ ] `app/tools/development/file-inspector/page.tsx`
- [ ] `app/tools/development/graphql-playground/page.tsx`
- [ ] `app/tools/development/jwt-debugger/page.tsx`
- [ ] `app/tools/development/regex-tester/page.tsx`
- [ ] `app/tools/development/sql-formatter/page.tsx`
- [ ] `app/tools/development/webhook-tester/page.tsx`

### Week 6: Design Tools (+1%)
- [ ] `app/tools/design/device-mockup/page.tsx`
- [ ] `app/tools/design/icon-search/page.tsx`
- [ ] `app/tools/design/placeholder-generator/page.tsx`
- [ ] `app/tools/design/screenshot-diff/page.tsx`
- [ ] `app/tools/design/signature-generator/page.tsx`

### Week 7: Media Tools (+1%)
- [ ] `app/tools/media/image-format-converter/page.tsx`
- [ ] `app/tools/media/image-to-text/page.tsx`
- [ ] `app/tools/media/meme-generator/page.tsx`
- [ ] `app/tools/media/qr-code-scanner/page.tsx`
- [ ] `app/tools/media/svg-to-png/page.tsx`

### Week 7: Productivity Tools - Part 1 (+1%)
- [ ] `app/tools/productivity/character-map/page.tsx`
- [ ] `app/tools/productivity/lorem-ipsum/page.tsx`
- [ ] `app/tools/productivity/privacy-policy-generator/page.tsx`
- [ ] `app/tools/productivity/stopwatch-timer/page.tsx`
- [ ] `app/tools/productivity/word-counter/page.tsx`

### Week 8: Data & Finance Tools (+0.5%)
- [ ] `app/tools/data/csv-excel/page.tsx`
- [ ] `app/tools/finance/split-bill/history/page.tsx`

**Checkpoint**: Coverage should be ~75% ✅ (Target Reached!)

---

## 🎯 Optional: Phase 5 - Complex Features (Week 9-10) - Target: 85%+

These are optional if you want to exceed 75% coverage:

### Resume Builder Components (Week 9)
- [ ] `app/tools/productivity/resume-builder/page.tsx`
- [ ] All form components (7 files)
- [ ] All template components (10 files)
- [ ] Utility files (5 files)

### Cover Letter Builder Components (Week 9)
- [ ] `app/tools/productivity/cover-letter-builder/page.tsx`
- [ ] All form components (3 files)
- [ ] All template components (7 files)
- [ ] Utility files (3 files)

### PDF Tools Suite (Week 10)
- [ ] Main components (11 files)
- [ ] Sub-components (13 files)
- [ ] Hooks (4 files)
- [ ] Utilities (2 files)

---

## 📊 Progress Tracking

| Week | Phase | Target Coverage | Files to Test | Est. Hours |
|------|-------|-----------------|---------------|------------|
| 1 (Days 1-2) | Quick Wins | 30% | 12 | 8h |
| 1 (Days 3-5) | Phase 1 Part 1 | 38% | 15 | 16h |
| 2 | Phase 1 Part 2 | 45% | 10 | 16h |
| 3 | Phase 2 | 55% | 25 | 20h |
| 4 | Phase 3 Part 1 | 62% | 15 | 20h |
| 5 | Phase 3 Part 2 | 70% | 20 | 20h |
| 6 | Phase 4 Part 1 | 74% | 13 | 16h |
| 7 | Phase 4 Part 2 | 75% ✅ | 10 | 12h |
| **Total** | | **75%** | **120** | **128h** |

---

## 🧪 Test Templates

### API Route Test Template
```typescript
// app/api/example/__tests__/route.test.ts
import { POST } from '../route'

describe('POST /api/example', () => {
  it('should return 200 with valid input', async () => {
    const request = new Request('http://localhost:3000/api/example', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' })
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('should return 400 with invalid input', async () => {
    const request = new Request('http://localhost:3000/api/example', {
      method: 'POST',
      body: JSON.stringify({})
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

### Component Test Template
```typescript
// components/example/__tests__/Example.test.tsx
import { render, screen } from '@testing-library/react'
import { Example } from '../Example'

describe('Example Component', () => {
  it('should render correctly', () => {
    render(<Example />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Tool Page Test Template
```typescript
// app/tools/category/tool-name/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react'
import Page from '../page'

describe('Tool: Tool Name', () => {
  it('should render tool interface', () => {
    render(<Page />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('should process user input', async () => {
    render(<Page />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'test')
    await userEvent.click(screen.getByText('Process'))
    expect(screen.getByText(/result/i)).toBeInTheDocument()
  })
})
```

---

## 🔧 Testing Setup

### Install Additional Test Utilities
```bash
pnpm add -D @testing-library/user-event msw
```

### Create Shared Test Utilities
```bash
mkdir -p test-utils
touch test-utils/setup.ts
touch test-utils/mocks.ts
touch test-utils/fixtures.ts
touch test-utils/helpers.ts
```

### Update Coverage Thresholds Incrementally
Edit `vitest.config.mts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  exclude: [
    'node_modules/**',
    'test-utils/**',
    '**/*.test.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/types.ts'
  ],
  thresholds: {
    lines: 27,      // Update incrementally: 27 → 30 → 40 → 50 → 60 → 70 → 75
    functions: 25,
    branches: 25,
    statements: 27
  }
}
```

---

## 📈 Weekly Milestones

- **Week 1**: 30% → 38% (APIs started)
- **Week 2**: 38% → 45% (APIs complete)
- **Week 3**: 45% → 55% (Services complete)
- **Week 4**: 55% → 62% (Components started)
- **Week 5**: 62% → 70% (Components complete)
- **Week 6**: 70% → 74% (Tools started)
- **Week 7**: 74% → **75%** ✅ (Target reached!)

---

## 🚦 Daily Checklist

For each development day:

- [ ] Run `pnpm test` before starting
- [ ] Write tests for 3-5 files
- [ ] Run `pnpm test -- --coverage` after
- [ ] Verify coverage increased by ~0.5-1%
- [ ] Commit tests with clear messages
- [ ] Update this document with progress

---

## 📝 Notes

- **Prioritize quality over quantity** - Better to have 75% well-tested code than 90% poorly tested
- **Write maintainable tests** - Tests should be easy to understand and update
- **Test behavior, not implementation** - Focus on what the code does, not how
- **Mock external dependencies** - OpenAI, Supabase, FFmpeg, etc.
- **Use test utilities** - Don't repeat yourself, create shared helpers

---

**Last Updated**: 2026-01-03  
**Status**: 📋 Ready for Implementation  
**Next Action**: Start with Quick Wins (Day 1-2)
