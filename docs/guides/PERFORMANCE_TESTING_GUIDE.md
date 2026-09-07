# Performance Testing Guide

## Quick Test Checklist

After deploying the optimizations, run these tests to verify improvements:

### 1. Lighthouse Test (Chrome DevTools)
```bash
# Desktop Mode
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Desktop" mode
4. Run "Performance" audit
5. Check metrics:
   ✅ FCP < 1.0s (was 3.2s)
   ✅ LCP < 2.5s (was 4.8s)
   ✅ TBT < 200ms (was 660ms)
   ✅ Speed Index < 3.0s (was 6.3s)
   ✅ CLS = 0
```

### 2. Network Panel Check
Open DevTools → Network tab:

**Expected Results:**
- ✅ Early preconnect to GTM, GA, AdSense domains
- ✅ Font files load with `font-display: swap`
- ✅ Analytics/AdSense scripts load after page interactive (`lazyOnload`)
- ✅ RecentTools component loads separately (lazy chunk)
- ✅ Dialog components lazy loaded on interaction

**What to Look For:**
```
Priority: High
  - HTML document
  - Inter font files
  - Main CSS bundle
  - Critical JavaScript

Priority: Low
  - Google Analytics
  - AdSense scripts
  - Ad content
  - Dialog components
```

### 3. Coverage Analysis
DevTools → Coverage tab:

**Before Running:**
- Press Record
- Reload page
- Wait for page to be fully interactive

**Expected Results:**
- Main bundle unused code < 40% (was ~85%)
- No large chunks with >80% unused code
- Lazy-loaded chunks appear only when needed

### 4. Performance Timeline
DevTools → Performance tab:

**What to Check:**
1. **Long Tasks:** Should have fewer blocking tasks >50ms
2. **Main Thread:** More idle time after initial paint
3. **Layout Shifts:** CLS should remain 0
4. **Paint Timing:**
   - First Paint < 1s
   - First Contentful Paint < 1s
   - Largest Contentful Paint < 2.5s

### 5. Real User Testing

**Manual Checks:**
- [ ] Page loads quickly on first visit
- [ ] Search interaction is smooth (no lag when typing)
- [ ] Category expand/collapse is instant
- [ ] Hover animations work correctly
- [ ] No visible layout shifts
- [ ] Dialogs open smoothly
- [ ] Recent tools section appears without blocking

### 6. WebPageTest (Advanced)

```bash
# Run from WebPageTest.org
Location: Frankfurt, Germany (closest to target users)
Browser: Chrome Desktop
Connection: Cable (5/1 Mbps)
```

**Target Metrics:**
- Start Render < 1.5s
- Speed Index < 2.5s
- Document Complete < 3.0s
- Fully Loaded < 4.0s

## Performance Budget

Set these as thresholds in CI/CD:

```json
{
  "metrics": {
    "first-contentful-paint": 1000,
    "largest-contentful-paint": 2500,
    "total-blocking-time": 200,
    "cumulative-layout-shift": 0.1,
    "speed-index": 3000
  },
  "budgets": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "font",
      "budget": 100
    },
    {
      "resourceType": "image",
      "budget": 200
    },
    {
      "resourceType": "third-party",
      "budget": 150
    }
  ]
}
```

## Quick Commands

```bash
# Build for production
npm run build

# Analyze bundle
npm run build && ls -lh .next/static/chunks/ | sort -k5 -hr | head -20

# Local Lighthouse test
npx lighthouse http://localhost:3000 --view --preset=desktop

# Production test
npx lighthouse https://supertool.id --view --preset=desktop

# Check bundle composition (if webpack-bundle-analyzer installed)
npm run analyze
```

## Expected Improvements

| Metric | Before | Target | Actual |
|--------|--------|--------|--------|
| FCP | 3.2s | <1.0s | _Test_ |
| LCP | 4.8s | <2.5s | _Test_ |
| TBT | 660ms | <200ms | _Test_ |
| Speed Index | 6.3s | <3.0s | _Test_ |
| CLS | 0 | 0 | _Test_ |

## Troubleshooting

### If TBT is still high (>200ms):
1. Check for synchronous rendering in React components
2. Look for long-running JavaScript in Coverage tab
3. Verify lazy loading is working (check Network tab)
4. Check for third-party scripts blocking main thread

### If LCP is still slow (>2.5s):
1. Verify preconnect hints are applied (Network tab)
2. Check if images are optimized
3. Ensure critical CSS is inline
4. Look for render-blocking resources

### If bundle size is large:
1. Run webpack-bundle-analyzer
2. Check for duplicate dependencies
3. Verify tree-shaking is working
4. Look for unused polyfills

## Monitoring (Post-Deploy)

Set up continuous monitoring:
- Vercel Speed Insights (already installed)
- Vercel Analytics (already installed)
- Google Search Console Core Web Vitals
- Real User Monitoring (RUM) if available

## Success Criteria

✅ All Core Web Vitals pass "Good" threshold
✅ Lighthouse Performance Score > 90
✅ No regressions in functionality
✅ Smooth user experience on 4G connection
✅ Fast initial page load (<3s)
