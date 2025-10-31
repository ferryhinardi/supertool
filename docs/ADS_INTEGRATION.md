# Ads Integration Guide

This document describes how ads are integrated into SuperTool with feature flag control.

## Overview

The ads system is built with a feature flag approach, allowing you to enable or disable ads across the entire application through environment variables. This provides flexibility for:

- Testing without ads during development
- Easy rollout to production
- Quick disabling if needed
- Different configurations across environments

## Feature Flag

Ads are controlled by the `NEXT_PUBLIC_ENABLE_ADS` environment variable:

```bash
# Enable ads
NEXT_PUBLIC_ENABLE_ADS=true

# Disable ads (default)
NEXT_PUBLIC_ENABLE_ADS=false
```

When disabled, the `AdBanner` component will not render anything, ensuring zero impact on the user experience.

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```bash
# Enable/disable ads across the application
NEXT_PUBLIC_ENABLE_ADS=true

# Google AdSense Publisher ID (if using Google AdSense)
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### Example Configuration

1. **Development** (`.env.development.local`):
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=false
   ```

2. **Staging** (`.env.staging.local`):
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-test-id
   ```

3. **Production** (`.env.production.local`):
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-your-real-id
   ```

## Components

### AdBanner Component

Location: `components/features/AdBanner.tsx`

The `AdBanner` component is a reusable component that:
- Checks the feature flag before rendering
- Loads Google AdSense ads (or can be adapted for other ad networks)
- Provides a placeholder when ads are enabled but not configured
- Supports different ad formats and positions

#### Props

```typescript
interface AdBannerProps {
  slot?: string           // Ad slot ID for ad network
  format?: string         // Ad format: 'auto', 'rectangle', 'vertical', 'horizontal'
  responsive?: boolean    // Whether ad should be responsive
  className?: string      // Custom styling
  position?: 'header' | 'sidebar' | 'footer' | 'content' // Position for analytics
}
```

#### Usage

```tsx
import { AdBanner } from '@/components/features/AdBanner'

// Basic usage
<AdBanner />

// With configuration
<AdBanner
  slot="homepage-top"
  position="content"
  format="horizontal"
  responsive
  className={css({ my: 8 })}
/>
```

### Helper Function

Check if ads are enabled programmatically:

```tsx
import { isAdsEnabled } from '@/components/features/AdBanner'

if (isAdsEnabled()) {
  // Ads are enabled
}
```

## Ad Placements

### Current Placements

1. **Homepage - Top** (`app/page.tsx`)
   - Between "Recent Tools" and "Tools by Category"
   - Slot: `homepage-top`
   - Format: horizontal
   - Position: content

2. **Homepage - Bottom** (`app/page.tsx`)
   - Before the "Quick Stats Footer"
   - Slot: `homepage-bottom`
   - Format: horizontal
   - Position: footer

### Adding New Ad Placements

To add ads to other pages:

1. Import the AdBanner component:
   ```tsx
   import { AdBanner } from '@/components/features/AdBanner'
   ```

2. Add the component where you want the ad:
   ```tsx
   <AdBanner
     slot="your-unique-slot-id"
     position="content"
     format="auto"
   />
   ```

3. Choose appropriate slot IDs that describe the location (e.g., `tool-page-sidebar`, `blog-article-bottom`)

## Ad Networks

### Google AdSense (Default)

The component is configured for Google AdSense by default. The script is loaded in `app/layout.tsx`:

```tsx
{isAdsEnabled && ADSENSE_ID && (
  <Script
    async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
    crossOrigin="anonymous"
    strategy="afterInteractive"
  />
)}
```

### Other Ad Networks

To use other ad networks (e.g., Media.net, Ezoic):

1. Modify the `AdBanner` component to support the new network
2. Add necessary environment variables
3. Update the script loading in `layout.tsx`
4. Update the ad rendering logic

Example for a custom ad network:

```tsx
// In AdBanner.tsx
export function AdBanner({ slot, customNetwork }: AdBannerProps) {
  if (customNetwork === 'your-network') {
    return (
      <div className="your-network-ad" data-slot={slot}>
        {/* Your ad network code */}
      </div>
    )
  }
  
  // Default to Google AdSense
  return (
    <ins className="adsbygoogle" ... />
  )
}
```

## Testing

### Development Testing

1. Enable ads in development:
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   ```

2. Without configuring `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`, you'll see placeholder boxes showing where ads will appear

3. The placeholder displays:
   - Ad position identifier
   - Configuration instructions

### Production Testing

Before going live:

1. Test with Google AdSense test mode
2. Verify ad placements don't break layout
3. Check mobile responsiveness
4. Ensure ads load asynchronously
5. Verify feature flag toggle works correctly

## Best Practices

1. **Feature Flag Control**
   - Always use the feature flag to control ads
   - Never hardcode ad visibility logic

2. **Ad Placement**
   - Don't overload pages with too many ads
   - Place ads where they don't disrupt user experience
   - Test on mobile devices

3. **Performance**
   - Ads load with `strategy="afterInteractive"` to not block page load
   - Ad components use client-side rendering
   - Feature flag check happens before any ad network code loads

4. **Privacy**
   - Ensure compliance with GDPR, CCPA, and other privacy regulations
   - Consider adding a cookie consent banner if required
   - Document data collection in your privacy policy

5. **Analytics**
   - Use the `position` prop to track ad performance
   - Monitor ad viewability and click-through rates
   - A/B test different placements

## Troubleshooting

### Ads Not Showing

1. Check if `NEXT_PUBLIC_ENABLE_ADS=true`
2. Verify `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` is set correctly
3. Check browser console for errors
4. Ensure ad blockers are disabled for testing
5. Wait 24-48 hours after AdSense approval for ads to appear

### Layout Issues

1. Ad components have minimum height (`minHeight: 250px`)
2. Use the `className` prop to adjust spacing
3. Test responsive behavior across screen sizes

### Performance Impact

1. Ads load after interactive to minimize impact
2. Feature flag check is zero-cost when disabled
3. Use React.memo if needed for heavy re-renders

## Future Enhancements

Potential improvements:

1. **A/B Testing**: Test different ad placements and formats
2. **Ad Refresh**: Implement ad refresh on single-page applications
3. **Lazy Loading**: Load ads only when they enter viewport
4. **Multiple Networks**: Support multiple ad networks simultaneously
5. **Analytics Integration**: Deep integration with Google Analytics
6. **Server-Side Detection**: Server-side ad blocker detection

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/ferryhinardi/supertool/issues)
- Review Google AdSense documentation
- Contact the development team

## References

- [Google AdSense Setup](https://support.google.com/adsense/answer/6242051)
- [Next.js Script Optimization](https://nextjs.org/docs/basic-features/script)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
