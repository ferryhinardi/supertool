# Test Coverage - Quick Reference Card

## 🚨 Current Status

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    COVERAGE: 25.37%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passing        | ████████████████                       | 25%
❌ Failing        | ██████████████████████████████████     | 75%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Threshold: 27%    | Need: +1.63%
Target: 75%       | Gap:  +49.63%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 📊 Coverage by Category

```
┌─────────────────┬───────┬────────┬──────────┬──────────┐
│ Category        │ Total │ Tested │ Untested │ Coverage │
├─────────────────┼───────┼────────┼──────────┼──────────┤
│ API Routes      │   27  │    2   │    25    │   7.4%  │ 🔴
│ Tool Pages      │   98  │   95   │     3    │  96.9%  │ ✅
│ Components      │   56  │   22   │    34    │  39.2%  │ 🟡
│ Libraries       │   35  │    4   │    31    │  11.4%  │ 🔴
│ Hooks           │    7  │    4   │     3    │  57.1%  │ 🟢
├─────────────────┼───────┼────────┼──────────┼──────────┤
│ TOTAL           │  424  │   79   │   345    │  18.6%  │
└─────────────────┴───────┴────────┴──────────┴──────────┘
```

## 🎯 Priority Matrix

```
High Impact + High Urgency (DO FIRST)
┌──────────────────────────────────────┐
│ 🔴 API Routes        (25 files)     │
│ 🔴 Libraries/Services (31 files)    │
│ 🔴 Authentication     (6 files)     │
└──────────────────────────────────────┘

High Impact + Medium Urgency (DO NEXT)
┌──────────────────────────────────────┐
│ 🟡 Components        (34 files)      │
│ 🟡 Tool Services     (14 files)      │
└──────────────────────────────────────┘

Medium Impact + Low Urgency (DO LATER)
┌──────────────────────────────────────┐
│ 🟢 Complex Features  (54 files)      │
│ 🟢 Hooks             (3 files)       │
└──────────────────────────────────────┘
```

## 📈 Path to 75%

```
Week 1-2: APIs & Services        25% ████░░░░░░ → 45% █████████░
Week 3:   Libraries & Utils      45% █████████░ → 55% ███████████
Week 4-5: Components             55% ███████████ → 70% ██████████████
Week 6-7: Tool Pages             70% ██████████████ → 75% ███████████████ ✅
```

## ⚡ Quick Wins (Start Here!)

### Day 1: Types & Utils (4-6 hours) → +3%
```bash
✓ lib/auth/auth-types.ts
✓ lib/tools/qr/qr-types.ts
✓ lib/tools/split-bill/split-bill-types.ts
✓ lib/utils/privacy.ts
✓ lib/tools/stopwatch/stopwatch-utils.ts
```

### Day 2: Config Files (2-4 hours) → +2%
```bash
✓ lib/data/donation-tiers.ts
✓ lib/services/ads-config.ts
✓ app/manifest.ts
✓ app/robots.ts
✓ app/sitemap.ts
```

**Result: 25% → 30% in 2 days!** ✅

## 🔴 Critical Path (Week 1-2)

### Week 1: AI & Core APIs (10 files/day) → +8%
```
Day 1: AI Caption, Code Converter, Command Explainer
Day 2: AI Cover Letter, JSON Analyzer, PDF Summarizer
Day 3: AI Prompt Explainer, Snippet, Text Rewriter
Day 4: Core APIs (Analytics, Exchange, Feedback)
Day 5: Media APIs (Screenshot, Upload, Subtitle)
```

### Week 2: Services & Auth (5 files/day) → +7%
```
Day 1: Auth Services (store, client, server)
Day 2: Core Services (analytics, email, polar)
Day 3: Media Services (ffmpeg, compressor)
Day 4: Split Bill Service (7 files)
Day 5: Other Tool Services (QR, Currency)
```

**Result: 30% → 45% in 2 weeks** ✅

## 📋 Daily Workflow

```
1. Morning:  Run tests, check coverage baseline
2. Write:    Add tests for 3-5 files
3. Verify:   Run coverage, check increase
4. Commit:   Push with descriptive message
5. Track:    Update progress document
```

## 🧪 Test Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test app/api/example/__tests__/route.test.ts

# Run tests in watch mode
pnpm test -- --watch

# Run tests in CI mode
CI=true pnpm test run
```

## 📁 Documentation Files

```
docs/
├── TEST_COVERAGE_SUMMARY.md     ← Overview & insights
├── TEST_COVERAGE_PLAN.md        ← Detailed analysis
├── TEST_COVERAGE_TASKS.md       ← Week-by-week tasks
└── QUICK_REFERENCE.md           ← This file!
```

## 🎓 Test Templates

### API Route Test
```typescript
import { POST } from '../route'

describe('POST /api/example', () => {
  it('should return 200', async () => {
    const req = new Request('http://localhost/api/example', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' })
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
```

### Component Test
```typescript
import { render, screen } from '@testing-library/react'

describe('Component', () => {
  it('should render', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Service Test
```typescript
describe('Service', () => {
  it('should process data', () => {
    const result = service.process(input)
    expect(result).toEqual(expected)
  })
})
```

## 🚦 Coverage Thresholds

```
Current:    25.37%  ❌ Below threshold
Minimum:    27.00%  ⚠️  CI requirement
Good:       50.00%  🟡 Acceptable
Target:     75.00%  ✅ Goal
Excellent:  85.00%  🌟 Stretch goal
```

## 📊 Progress Tracking

Update daily:

```
┌──────┬─────────┬──────────┬──────────┐
│ Date │ Files   │ Coverage │ Status   │
├──────┼─────────┼──────────┼──────────┤
│ W1D1 │  12     │   30%    │ ✅       │
│ W1D2 │   5     │   33%    │          │
│ W1D3 │   5     │   36%    │          │
│ ...  │  ...    │   ...    │   ...    │
└──────┴─────────┴──────────┴──────────┘
```

## 🎯 Success Criteria

- [ ] Coverage ≥ 75%
- [ ] All API routes tested
- [ ] All services tested
- [ ] Critical components tested
- [ ] CI/CD passing
- [ ] No blocking issues

## 🔗 Quick Links

- GitHub Actions: `.github/workflows/coverage.yml`
- Vitest Config: `vitest.config.mts`
- Test Utilities: `test-utils/`
- Coverage Report: `coverage/index.html`

## 💡 Tips

1. **Start small**: Quick wins build momentum
2. **Mock external**: Keep tests fast
3. **Test behavior**: Not implementation
4. **Keep simple**: Easy to maintain
5. **Review often**: Catch issues early

## 🆘 Troubleshooting

```bash
# Tests failing?
pnpm install           # Reinstall dependencies
rm -rf coverage/       # Clear coverage cache
pnpm test -- --clearCache

# Coverage not updating?
pnpm test -- --coverage --no-cache

# Need help?
Check existing tests in:
- app/tools/finance/
- app/tools/security/
- components/ui/__tests__/
```

---

**Generated**: 2026-01-03  
**Next Action**: Start Quick Wins (Day 1)  
**Timeline**: 7 weeks to 75% coverage  
**Status**: 🚀 Ready to begin!
