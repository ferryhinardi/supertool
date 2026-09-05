# Multi-Network Ads System Documentation

A comprehensive advertising system supporting multiple ad networks with granular control over which networks are active.

## Table of Contents

1. [Overview](#overview)
2. [Supported Ad Networks](#supported-ad-networks)
3. [Quick Start](#quick-start)
4. [Configuration Guide](#configuration-guide)
5. [Usage Examples](#usage-examples)
6. [Component Reference](#component-reference)
7. [Revenue Optimization](#revenue-optimization)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The multi-network ads system allows you to:

- **Support multiple ad networks simultaneously** (Google AdSense, Carbon Ads, EthicalAds)
- **Configure affiliate marketing** with context-aware suggestions
- **Automatic network selection** based on priority
- **Granular control** over which networks are enabled
- **Easy integration** with a single component

### Network Priority

When multiple networks are enabled, the system automatically selects the best one:

**Priority Order:** Carbon Ads > EthicalAds > Google AdSense

---

## Supported Ad Networks

### 1. **Google AdSense**
- Traditional display advertising
- High fill rate
- Good for broad audiences
- Best for: General content sites

### 2. **Carbon Ads**
- Developer-focused advertising
- Premium ad quality
- Higher CPM for tech audiences
- Best for: Developer tools, tech sites

### 3. **EthicalAds**
- Privacy-focused advertising
- No tracking or cookies
- Developer-friendly
- Best for: Privacy-conscious audiences

### 4. **Affiliate Marketing**
- Context-aware product suggestions
- Tool-specific recommendations
- Multiple partner integrations
- Best for: Specific tool pages

---

## Quick Start

### Step 1: Enable Ads Globally

Create a `.env.local` file and add:

```bash
# Master switch - enables all ad functionality
NEXT_PUBLIC_ENABLE_ADS=true
```

### Step 2: Choose Your Ad Network(s)

#### Option A: Google AdSense (Easiest)

```bash
NEXT_PUBLIC_ENABLE_ADSENSE=true
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

#### Option B: Carbon Ads (Best for Developers)

```bash
NEXT_PUBLIC_ENABLE_CARBON_ADS=true
NEXT_PUBLIC_CARBON_SERVE_ID=your-serve-id
NEXT_PUBLIC_CARBON_PLACEMENT=your-placement
```

#### Option C: EthicalAds (Privacy-Focused)

```bash
NEXT_PUBLIC_ENABLE_ETHICAL_ADS=true
NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID=your-publisher-id
```

### Step 3: Add to Your Page

```tsx
import { AdContainer } from '@/components/features/AdContainer'

export default function MyPage() {
  return (
    <div>
      <h1>My Content</h1>
      
      {/* Automatic network selection */}
      <AdContainer position="content" />
    </div>
  )
}
```

That's it! The system will automatically select the best ad network based on your configuration.

---

## Configuration Guide

### Complete Environment Variables

```bash
# ==========================================
# MASTER SWITCH
# ==========================================
# Set to 'true' to enable ads globally
NEXT_PUBLIC_ENABLE_ADS=true

# ==========================================
# GOOGLE ADSENSE
# ==========================================
NEXT_PUBLIC_ENABLE_ADSENSE=true
NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX

# ==========================================
# CARBON ADS
# ==========================================
NEXT_PUBLIC_ENABLE_CARBON_ADS=true
NEXT_PUBLIC_CARBON_SERVE_ID=your-serve-id
NEXT_PUBLIC_CARBON_PLACEMENT=your-placement

# ==========================================
# ETHICALADS
# ==========================================
NEXT_PUBLIC_ENABLE_ETHICAL_ADS=true
NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID=your-publisher-id

# ==========================================
# AFFILIATE MARKETING
# ==========================================
NEXT_PUBLIC_ENABLE_AFFILIATES=true

# Password Managers
NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF=?ref=supertool
NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF=?source=supertool
NEXT_PUBLIC_AFFILIATE_DASHLANE_REF=?utm_source=supertool

# Image & CDN Services
NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF=?ap=supertool
NEXT_PUBLIC_AFFILIATE_TINYPNG_REF=?ref=supertool

# Developer Tools
NEXT_PUBLIC_AFFILIATE_POSTMAN_REF=?ref=supertool
NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF=?ref=supertool

# VPN Services
NEXT_PUBLIC_AFFILIATE_NORDVPN_REF=?ref=supertool
NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF=?referrer_id=supertool

# Hosting & Cloud
NEXT_PUBLIC_AFFILIATE_VERCEL_REF=?utm_source=supertool
NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF=?ref=supertool
NEXT_PUBLIC_AFFILIATE_SUPABASE_REF=?ref=supertool
```

### Network Setup Instructions

#### Google AdSense Setup

1. Sign up at [Google AdSense](https://www.google.com/adsense)
2. Get your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Create ad units and note the slot IDs
4. Add to environment:
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   NEXT_PUBLIC_ENABLE_ADSENSE=true
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

#### Carbon Ads Setup

1. Apply at [Carbon Ads](https://www.carbonads.net/)
2. Get approved (focused on developer/tech sites)
3. Receive your Serve ID and Placement ID
4. Add to environment:
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   NEXT_PUBLIC_ENABLE_CARBON_ADS=true
   NEXT_PUBLIC_CARBON_SERVE_ID=your-serve-id
   NEXT_PUBLIC_CARBON_PLACEMENT=your-placement
   ```

#### EthicalAds Setup

1. Sign up at [EthicalAds](https://www.ethicalads.io/)
2. Create a publisher account
3. Get your Publisher ID
4. Add to environment:
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   NEXT_PUBLIC_ENABLE_ETHICAL_ADS=true
   NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID=your-publisher-id
   ```

#### Affiliate Setup

1. Sign up for affiliate programs with your chosen partners
2. Get your referral codes/IDs
3. Add to environment (example):
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   NEXT_PUBLIC_ENABLE_AFFILIATES=true
   NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF=?ref=supertool
   NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF=?ap=supertool
   ```

---

## Usage Examples

### Example 1: Automatic Network Selection

The simplest approach - let the system choose the best network:

```tsx
import { AdContainer } from '@/components/features/AdContainer'

export default function Page() {
  return (
    <div>
      <AdContainer position="content" />
    </div>
  )
}
```

### Example 2: Force a Specific Network

Override automatic selection:

```tsx
import { AdContainer } from '@/components/features/AdContainer'

export default function Page() {
  return (
    <div>
      {/* Always use Carbon Ads if available */}
      <AdContainer 
        position="sidebar" 
        forceNetwork="carbon"
      />
      
      {/* Always use AdSense if available */}
      <AdContainer 
        position="footer" 
        forceNetwork="adsense"
        slot="footer-ad-slot"
      />
    </div>
  )
}
```

### Example 3: Multiple Ad Placements

```tsx
import { AdContainer } from '@/components/features/AdContainer'

export default function Page() {
  return (
    <div>
      {/* Header ad */}
      <AdContainer position="header" slot="header-ad" />
      
      <article>
        {/* Your content */}
      </article>
      
      {/* Sidebar ad */}
      <aside>
        <AdContainer position="sidebar" />
      </aside>
      
      {/* Footer ad */}
      <AdContainer position="footer" slot="footer-ad" />
    </div>
  )
}
```

### Example 4: Tool-Specific Affiliate Suggestions

```tsx
import { AffiliateSuggestion } from '@/components/features/AffiliateSuggestion'

export default function PasswordGeneratorPage() {
  return (
    <div>
      <h1>Password Generator</h1>
      
      {/* Tool interface */}
      <PasswordGeneratorUI />
      
      {/* Context-aware affiliate suggestions */}
      <AffiliateSuggestion 
        tool="password-generator"
        variant="banner"
      />
    </div>
  )
}
```

### Example 5: Mixed Ad Strategy

Combine network ads with affiliate suggestions:

```tsx
import { AdContainer } from '@/components/features/AdContainer'
import { AffiliateSuggestion } from '@/components/features/AffiliateSuggestion'

export default function ImageOptimizerPage() {
  return (
    <div>
      {/* Network ad at top */}
      <AdContainer position="header" />
      
      <h1>Image Optimizer</h1>
      
      {/* Tool interface */}
      <ImageOptimizerUI />
      
      {/* Affiliate suggestions (image CDN services) */}
      <AffiliateSuggestion 
        tool="image-optimizer"
        variant="card"
      />
      
      {/* Network ad at bottom */}
      <AdContainer position="footer" />
    </div>
  )
}
```

---

## Component Reference

### `<AdContainer />`

Unified ad component with automatic network selection.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'header' \| 'sidebar' \| 'footer' \| 'content'` | `'content'` | Position identifier for analytics |
| `className` | `string` | - | Custom CSS classes |
| `slot` | `string` | - | Ad slot ID (for Google AdSense) |
| `forceNetwork` | `'adsense' \| 'carbon' \| 'ethical' \| null` | `null` | Force specific network |

**Example:**
```tsx
<AdContainer 
  position="sidebar"
  className="my-custom-class"
  forceNetwork="carbon"
/>
```

---

### `<AdBanner />`

Google AdSense component (used internally by AdContainer).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slot` | `string` | `'default-slot'` | AdSense slot ID |
| `format` | `string` | `'auto'` | Ad format |
| `responsive` | `boolean` | `true` | Enable responsive ads |
| `className` | `string` | - | Custom CSS classes |
| `position` | `'header' \| 'sidebar' \| 'footer' \| 'content'` | `'content'` | Position identifier |

**Example:**
```tsx
<AdBanner 
  slot="1234567890"
  format="horizontal"
  responsive={true}
  position="header"
/>
```

---

### `<CarbonAd />`

Carbon Ads component (used internally by AdContainer).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'header' \| 'sidebar' \| 'footer' \| 'content'` | `'content'` | Position identifier |
| `className` | `string` | - | Custom CSS classes |

**Example:**
```tsx
<CarbonAd position="sidebar" />
```

---

### `<EthicalAd />`

EthicalAds component (used internally by AdContainer).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'header' \| 'sidebar' \| 'footer' \| 'content'` | `'content'` | Position identifier |
| `className` | `string` | - | Custom CSS classes |
| `type` | `'image' \| 'text'` | `'image'` | Ad type |

**Example:**
```tsx
<EthicalAd position="sidebar" type="image" />
```

---

### `<AffiliateSuggestion />`

Context-aware affiliate marketing component.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tool` | `'password-generator' \| 'encryption-tool' \| 'image-optimizer' \| 'api-tester' \| 'upload'` | **Required** | Tool identifier |
| `variant` | `'banner' \| 'card' \| 'inline'` | `'card'` | Layout variant |
| `className` | `string` | - | Custom CSS classes |

**Example:**
```tsx
<AffiliateSuggestion 
  tool="password-generator"
  variant="banner"
/>
```

---

## Revenue Optimization

### Strategy 1: Network Priority

Enable multiple networks and let the system optimize:

```bash
# Enable all networks
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_CARBON_ADS=true    # Highest priority
NEXT_PUBLIC_ENABLE_ETHICAL_ADS=true   # Medium priority
NEXT_PUBLIC_ENABLE_ADSENSE=true       # Fallback
```

The system will show Carbon Ads first (highest CPM for tech audiences), fall back to EthicalAds, then AdSense.

### Strategy 2: Audience-Based Selection

Use different networks for different pages:

```tsx
// Developer tools page - use Carbon Ads
<AdContainer forceNetwork="carbon" />

// General utility page - use AdSense
<AdContainer forceNetwork="adsense" />
```

### Strategy 3: Mixed Monetization

Combine network ads with affiliate marketing:

```tsx
// Network ad at top
<AdContainer position="header" />

// Affiliate suggestions in content
<AffiliateSuggestion tool="password-generator" variant="card" />

// Network ad at bottom
<AdContainer position="footer" />
```

### Strategy 4: A/B Testing

Test different networks to find what works best:

```tsx
// Week 1: Carbon Ads
<AdContainer forceNetwork="carbon" />

// Week 2: EthicalAds
<AdContainer forceNetwork="ethical" />

// Week 3: AdSense
<AdContainer forceNetwork="adsense" />

// Compare revenue and choose the winner
```

---

## Troubleshooting

### Ads Not Showing

**Problem:** No ads appear on the page.

**Solutions:**

1. Check master switch:
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   ```

2. Enable specific network:
   ```bash
   NEXT_PUBLIC_ENABLE_ADSENSE=true
   ```

3. Verify credentials:
   ```bash
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

4. Check browser console for errors

5. Verify ad blocker is disabled during testing

---

### Wrong Network Showing

**Problem:** Expected Carbon Ads but seeing AdSense.

**Solutions:**

1. Check priority order (Carbon > Ethical > AdSense)

2. Verify Carbon Ads is enabled:
   ```bash
   NEXT_PUBLIC_ENABLE_CARBON_ADS=true
   NEXT_PUBLIC_CARBON_SERVE_ID=your-serve-id
   ```

3. Force specific network:
   ```tsx
   <AdContainer forceNetwork="carbon" />
   ```

---

### Placeholder Showing Instead of Ads

**Problem:** Seeing "Configure credentials" placeholder.

**Solutions:**

1. Check that credentials are set:
   ```bash
   # For AdSense
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   
   # For Carbon
   NEXT_PUBLIC_CARBON_SERVE_ID=your-serve-id
   NEXT_PUBLIC_CARBON_PLACEMENT=your-placement
   ```

2. Restart dev server after changing environment variables

3. Clear browser cache

---

### Affiliate Suggestions Not Showing

**Problem:** No affiliate suggestions appear.

**Solutions:**

1. Enable affiliates:
   ```bash
   NEXT_PUBLIC_ENABLE_AFFILIATES=true
   ```

2. Configure at least one affiliate partner:
   ```bash
   NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF=?ref=supertool
   ```

3. Verify tool identifier matches:
   ```tsx
   <AffiliateSuggestion tool="password-generator" />
   ```

---

### Testing Tips

1. **Disable ad blockers** during development
2. **Use incognito mode** to avoid cached ads
3. **Check browser console** for script loading errors
4. **Test on multiple devices** (mobile/desktop)
5. **Monitor network tab** to see if ad scripts load
6. **Use placeholder mode** to verify placement without real ads:
   ```bash
   NEXT_PUBLIC_ENABLE_ADS=true
   # Don't set credentials to see placeholders
   ```

---

## Best Practices

### 1. Don't Overdo It

- **Max 2-3 ads per page** to maintain user experience
- Space ads throughout content, not clustered together
- Use `<AdContainer>` instead of direct components for consistency

### 2. Match Network to Audience

- **Developer tools?** → Carbon Ads
- **Privacy-focused?** → EthicalAds
- **General audience?** → Google AdSense

### 3. Use Affiliate Marketing Wisely

- Only show relevant suggestions for specific tools
- Use `variant="inline"` for subtle integration
- Don't show multiple affiliate banners on one page

### 4. Test and Optimize

- Monitor click-through rates
- Track revenue by network
- A/B test different placements
- Adjust based on performance data

### 5. Respect Users

- Don't use intrusive ad formats
- Ensure fast page load times
- Provide value before showing ads
- Consider user experience first

---

## Support

For questions or issues:

1. Check this documentation first
2. Review the [example implementation](../../app/page.tsx)
3. Check component source code in `components/features/`
4. File an issue on GitHub

---

## Changelog

### v1.0.0 (Current)
- Initial multi-network ads system
- Support for AdSense, Carbon Ads, EthicalAds
- Affiliate marketing system
- Automatic network selection
- Comprehensive configuration options
