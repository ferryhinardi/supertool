# 16 - Website Screenshot Tool

**Created:** October 26, 2024  
**Last Updated:** October 26, 2024  
**Category:** Media Tools  
**Status:** ✅ Active · ⭐ New

## Overview

High-resolution website screenshot capture tool powered by ScreenshotOne API. Capture any website across multiple device sizes (mobile, tablet, desktop), choose between viewport or full-page capture, and download instantly as PNG with 2x pixel density for retina-sharp quality.

## Purpose

Website screenshots are essential for documentation, presentations, design portfolios, bug reports, competitor analysis, and archiving web content. This tool eliminates the need for browser extensions, manual scrolling, or complex software—just enter a URL and capture.

## Key Features

### 1. **Multi-Device Viewport Simulation**

- **Mobile (375x667)**: iPhone-sized captures for mobile testing
- **Tablet (768x1024)**: iPad-sized captures for tablet layouts
- **Desktop (1920x1080)**: Full HD resolution for desktop views

Each device preset automatically adjusts viewport dimensions to match real device sizes.

### 2. **Dual Capture Modes**

#### Viewport Capture

- Captures only the visible browser area
- Fast processing (~3-5 seconds)
- Perfect for above-the-fold content
- Standard screenshot size

#### Full Page Capture

- Scrolls and stitches entire page
- Captures all content from top to bottom
- Longer processing time (~10-30 seconds)
- Large file sizes for long pages

### 3. **High-Resolution Output**

- 2x device pixel ratio (Retina display quality)
- PNG format for lossless compression
- Sharp text and crisp images
- Professional quality for presentations

### 4. **Smart URL Handling**

- Auto-prefix with `https://` if protocol missing
- Validates URL format before capture
- Accepts domain names or full URLs
- Example inputs: `example.com`, `https://example.com`, `www.example.com`

### 5. **Ad & Tracker Blocking**

Built-in blocking for cleaner screenshots:

- Ad banners removed
- Cookie consent popups blocked
- Tracking scripts disabled
- Clean, distraction-free captures

### 6. **Instant Download**

- One-click download after capture
- Automatic filename: `screenshot-{device}-{timestamp}.png`
- No server storage required
- Files saved directly to browser downloads

## How It Works

### Architecture

```
User Input → URL Validation → API Request → Image Blob → Preview Display → Download
```

### URL Normalization Pipeline

```typescript
// Step 1: User enters URL
Input: 'example.com'

// Step 2: Validate format
const validateUrl = (input: string): boolean => {
  try {
    const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Step 3: Normalize to full URL
const normalizeUrl = (input: string): string => {
  return input.startsWith('http') ? input : `https://${input}`
}

// Result: "https://example.com"
```

### Screenshot API Integration

```typescript
const captureScreenshot = async () => {
  const device = DEVICE_SIZES[deviceSize]

  // Build API URL with parameters
  const screenshotApiUrl = [
    'https://api.screenshotone.com/take',
    `?url=${encodeURIComponent(normalizedUrl)}`,
    `&viewport_width=${device.width}`,
    `&viewport_height=${device.height}`,
    '&device_scale_factor=2', // Retina quality
    '&format=png', // PNG output
    '&block_ads=true', // Block ads
    '&block_cookie_banners=true', // Block popups
    '&block_trackers=true', // Block trackers
    '&cache=false', // Fresh capture
    captureMode === 'fullpage' ? '&full_page=true' : '',
  ].join('')

  // Fetch screenshot as blob
  const response = await fetch(screenshotApiUrl)
  const blob = await response.blob()
  const imageUrl = URL.createObjectURL(blob)

  setScreenshotUrl(imageUrl)
}
```

### Device Configurations

```typescript
interface DeviceConfig {
  width: number
  height: number
  label: string
  icon: React.ElementType
}

const DEVICE_SIZES: Record<DeviceSize, DeviceConfig> = {
  mobile: {
    width: 375,
    height: 667,
    label: 'Mobile (375x667)',
    icon: Smartphone,
  },
  tablet: {
    width: 768,
    height: 1024,
    label: 'Tablet (768x1024)',
    icon: Tablet,
  },
  desktop: {
    width: 1920,
    height: 1080,
    label: 'Desktop (1920x1080)',
    icon: Monitor,
  },
}
```

### Download Implementation

```typescript
const downloadScreenshot = async () => {
  // Fetch blob from object URL
  const response = await fetch(screenshotUrl)
  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)

  // Create temporary download link
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `screenshot-${deviceSize}-${Date.now()}.png`

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Cleanup
  URL.revokeObjectURL(downloadUrl)
}
```

## Usage Instructions

### Basic Screenshot Capture

1. **Enter URL**: Type website address (with or without `https://`)
2. **Select Device**: Choose mobile, tablet, or desktop
3. **Choose Mode**: Viewport (visible area) or Full Page (entire page)
4. **Click "Capture"**: Wait for processing (3-30 seconds)
5. **Preview**: View screenshot in browser
6. **Download**: Click download button to save PNG

### Example Workflows

#### Portfolio Documentation

```
Goal: Show responsive design across devices
Steps:
  1. Enter: mywebsite.com
  2. Capture desktop (1920x1080) - Viewport
  3. Capture tablet (768x1024) - Viewport
  4. Capture mobile (375x667) - Viewport
  5. Download all three for comparison
Result: Complete responsive design showcase
```

#### Bug Report Screenshot

```
Goal: Capture issue on specific page
Steps:
  1. Enter: app.example.com/dashboard
  2. Select device where bug occurs
  3. Use Viewport mode for faster capture
  4. Add screenshot to bug report
Result: Clear visual evidence of issue
```

#### Landing Page Analysis

```
Goal: Analyze competitor's full homepage
Steps:
  1. Enter: competitor.com
  2. Select Desktop (1920x1080)
  3. Choose Full Page mode
  4. Wait for complete capture (~30s)
  5. Download entire homepage
Result: Complete page layout for analysis
```

#### Mobile App Store Preview

```
Goal: Generate app store screenshots
Steps:
  1. Enter: app.website.com
  2. Select Mobile (375x667)
  3. Use Viewport mode
  4. Capture key screens
  5. Download for app submission
Result: iOS/Android compatible screenshots
```

## UI/UX Design

### Visual Hierarchy

```
┌────────────────────────────────────────────┐
│  Badge: "Website Screenshot Tool"          │
│  Gradient Title                            │
│  Description                               │
├────────────────────────────────────────────┤
│  URL Input Card                            │
│  ┌──────────────────────────────────────┐ │
│  │ [URL Input] [Capture Button]         │ │
│  │                                       │ │
│  │ Device Size (3 buttons):              │ │
│  │ [📱 Mobile] [📱 Tablet] [🖥 Desktop] │ │
│  │                                       │ │
│  │ Capture Mode (2 buttons):             │ │
│  │ [👁 Viewport] [⛶ Full Page]         │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Error Card (if error)                     │
├────────────────────────────────────────────┤
│  Screenshot Preview Card                   │
│  ┌──────────────────────────────────────┐ │
│  │ Title: "Screenshot Preview"           │ │
│  │ [Download Button]                     │ │
│  │                                       │ │
│  │ [Screenshot Image]                    │ │
│  └──────────────────────────────────────┘ │
├────────────────────────────────────────────┤
│  Features Grid (4 cards)                   │
├────────────────────────────────────────────┤
│  Privacy Info Banner                       │
└────────────────────────────────────────────┘
```

### Color Scheme

- **Primary Gradient**: Purple → Pink → Blue (media/creative theme)
- **Background**: Dark mode (`bg-gray-900`)
- **Cards**: Semi-transparent glass effect (`bg-gray-900/50`)
- **Accent**: Purple (`purple-400`, `purple-500`)
- **Text**: Light gray hierarchy (`gray-200`, `gray-400`, `gray-500`)

### Interactive States

**URL Input:**

- Placeholder: "example.com or https://example.com"
- Enter key: Triggers capture
- Disabled during loading

**Capture Button:**

- Default: "🖼 Capture"
- Loading: "⏳ Capturing..." (spinning icon)
- Disabled when URL empty or invalid

**Device Buttons:**

- Unselected: Gray border, outline style
- Selected: Purple border, filled background, white text
- Hover: Border brightens

**Mode Buttons:**

- Similar to device buttons
- Icons: 👁 Eye (viewport) / ⛶ Maximize (fullpage)

### Responsive Breakpoints

- **Mobile (< 640px)**: Single column, stacked buttons
- **Tablet (640px - 1024px)**: 2-column grids
- **Desktop (> 1024px)**: 3-column grids, side-by-side layouts

## Processing Times

### Viewport Mode

| Device  | Typical Time | File Size  |
| ------- | ------------ | ---------- |
| Mobile  | 2-4 seconds  | 50-200 KB  |
| Tablet  | 3-6 seconds  | 100-400 KB |
| Desktop | 4-8 seconds  | 200-800 KB |

### Full Page Mode

| Page Length          | Typical Time | File Size     |
| -------------------- | ------------ | ------------- |
| Short (1-2 screens)  | 5-10 sec     | 300-600 KB    |
| Medium (3-5 screens) | 10-20 sec    | 600 KB - 2 MB |
| Long (5+ screens)    | 20-45 sec    | 2-10 MB       |

**Factors affecting speed:**

- Page complexity (images, animations)
- Network connection speed
- API server load
- JavaScript-heavy pages (slower)

## Browser Compatibility

✅ **Fully Supported:**

- Chrome 90+ (Desktop & Mobile)
- Firefox 88+
- Safari 14+ (macOS & iOS)
- Edge 90+
- Opera 76+

✅ **Requirements:**

- JavaScript enabled
- Modern Fetch API support
- Blob/Object URL support
- Download attribute support

## Privacy & Security

### What's Sent to API

- Target website URL
- Viewport dimensions
- Capture mode preferences
- Device pixel ratio

### What's NOT Sent

- User cookies or auth tokens
- Personal browsing history
- Form data or passwords
- Other open tabs

### Data Flow

1. API fetches public-facing website
2. Screenshot rendered on API servers
3. Image blob returned to your browser
4. **No storage on our servers**
5. Image stored only in browser memory
6. Download saves to your local device

### Third-Party Service

- Uses ScreenshotOne API (public endpoint)
- Screenshots processed on external servers
- No authentication required for basic use
- API has its own privacy policy

## Limitations

### Technical Constraints

- **API Rate Limits**: Free tier may have request limits
- **File Size**: Very long pages may create large files (> 10 MB)
- **Processing Time**: Full page captures can take 30-60 seconds
- **Authentication**: Cannot capture pages requiring login
- **Dynamic Content**: May not capture infinite scroll or lazy-loaded content
- **Popup Modals**: Some modals may not appear in screenshots

### Browser Restrictions

- **Download Limits**: Browser may warn on large files
- **Memory**: Very large screenshots may slow browser
- **CORS**: API must support cross-origin requests

### Website Restrictions

- **Paywalls**: Cannot bypass paid content
- **Geofencing**: May show different content based on API server location
- **Anti-Scraping**: Some sites block automated screenshot tools
- **Private Pages**: Intranet or localhost URLs not accessible

## Error Handling

### Common Errors & Solutions

**"Please enter a valid URL"**

- Check URL format (needs domain name)
- Add `https://` if missing
- Remove trailing slashes or fragments

**"Screenshot service returned 4xx"**

- Website may block screenshot tools
- Try different website
- Check if website exists (DNS error)

**"Failed to capture screenshot"**

- Network connection issue
- API rate limit exceeded
- Website timing out
- Try again in a few moments

**Empty/Blank Screenshot**

- Page may be loading too slowly
- Try viewport mode instead of full page
- Website may have anti-bot protections

### Debugging Tips

```typescript
// Check console for detailed errors
console.error('Screenshot error:', err)

// Verify URL is valid
validateUrl(url) // Should return true

// Test with simple site first
url = 'example.com'
```

## Performance Optimization

### Speed Tips

1. **Use Viewport Mode**: 3-5x faster than full page
2. **Choose Mobile Size**: Smaller dimensions = faster renders
3. **Test URL First**: Verify website loads normally
4. **Avoid Peak Times**: API may be slower during high traffic

### Quality Tips

1. **Desktop Size**: Best for showcasing details
2. **Full Page Mode**: Complete content capture
3. **2x Pixel Ratio**: Automatically enabled for sharp images
4. **PNG Format**: Lossless quality for text and graphics

## API Details

### ScreenshotOne Parameters

```javascript
// Base URL
https://api.screenshotone.com/take

// Query Parameters
?url=https://example.com          // Target URL (required)
&viewport_width=1920              // Browser width
&viewport_height=1080             // Browser height
&device_scale_factor=2            // Pixel density (1=normal, 2=retina)
&format=png                       // Output format (png, jpg, webp)
&block_ads=true                   // Block advertisements
&block_cookie_banners=true        // Block cookie popups
&block_trackers=true              // Block tracking scripts
&cache=false                      // Fresh capture every time
&full_page=true                   // Capture entire scrollable page
```

### Alternative APIs

If switching to different screenshot service:

**ApiFlash:**

```javascript
https://api.apiflash.com/v1/urltoimage
?access_key=YOUR_KEY
&url=https://example.com
&width=1920
&height=1080
&fresh=true
```

**ScreenshotAPI:**

```javascript
https://shot.screenshotapi.net/screenshot
?token=YOUR_TOKEN
&url=https://example.com
&width=1920
&height=1080
&full_page=true
```

**URLBox:**

```javascript
https://api.urlbox.io/v1/YOUR_TOKEN/png
?url=https://example.com
&width=1920
&height=1080
&full_page=true
```

## Future Enhancements

- [ ] **API Key Integration**: Use authenticated endpoint for higher limits
- [ ] **Custom Dimensions**: Manual width/height input
- [ ] **More Device Presets**: iPhone 14, Galaxy S23, iPad Pro sizes
- [ ] **Format Options**: JPEG, WebP, PDF export
- [ ] **Quality Settings**: Compression level control
- [ ] **Delay Timer**: Wait for page load (2s, 5s, 10s)
- [ ] **Screenshot History**: Save recent captures in localStorage
- [ ] **Batch Capture**: Multiple URLs at once
- [ ] **CSS Injection**: Custom styles for cleaner captures
- [ ] **Element Selector**: Capture specific DOM element
- [ ] **Compare Mode**: Side-by-side before/after
- [ ] **Scheduled Captures**: Periodic monitoring
- [ ] **Dark Mode Toggle**: Force dark/light theme on target
- [ ] **Video Recording**: Capture page interactions as video
- [ ] **Text Extraction**: OCR from screenshots

## Related Tools

- **Image Optimizer** - Compress downloaded screenshots
- **QR Code Generator** - Generate QR for website URLs
- **Video Converter** - Convert screen recordings
- **Upload Tool** - Host screenshots in cloud

## Use Cases

### 1. **Web Development**

- Responsive design testing
- Client presentations
- Design system documentation
- Visual regression testing

### 2. **Marketing**

- Competitor analysis
- Ad creative inspiration
- Social media previews
- Landing page research

### 3. **Documentation**

- Tutorial screenshots
- User guides
- Bug reports
- Feature documentation

### 4. **Legal/Compliance**

- Website archival
- Terms of service capture
- Evidence collection
- Timestamp records

### 5. **Design**

- Inspiration gallery
- Portfolio case studies
- Mood boards
- Style guides

## Tips & Best Practices

💡 **Start with Viewport**: Test capture with faster mode first  
💡 **Mobile First**: Smaller dimensions process faster  
💡 **Check URL**: Verify site loads before capturing  
💡 **Use Full Page Sparingly**: Only when you need entire content  
💡 **Desktop for Details**: Best resolution for showcasing work  
💡 **Download Immediately**: Screenshots not saved on refresh  
💡 **Name Files Clearly**: Auto-generated names include device & timestamp

## Troubleshooting Checklist

- ✅ Is URL correctly formatted? (include domain)
- ✅ Does website load in your browser?
- ✅ Is internet connection stable?
- ✅ Did you wait long enough? (full page takes time)
- ✅ Try simpler website first (e.g., example.com)
- ✅ Check browser console for errors
- ✅ Try different device size
- ✅ Switch to viewport mode if full page fails

## Keyboard Shortcuts

- **Enter**: Trigger capture (when URL input focused)
- **Ctrl/Cmd + V**: Paste URL
- **Ctrl/Cmd + S**: Download screenshot (after capture)

## Accessibility

- **Keyboard Navigation**: All buttons are keyboard accessible
- **Screen Readers**: ARIA labels on interactive elements
- **Focus Indicators**: Clear focus states for navigation
- **Color Contrast**: WCAG AA compliant text contrast

---

**Route:** `/tools/website-screenshot`  
**Component:** `app/tools/website-screenshot/page.tsx`  
**External API:** ScreenshotOne (https://screenshotone.com)  
**Dependencies:** None (pure fetch API)  
**Tests:** `app/tools/website-screenshot/__tests__/` (22 tests passing)  
**Analytics Events:** TBD (to be implemented)
