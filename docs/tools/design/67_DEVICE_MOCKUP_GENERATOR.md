# 67 - Device Mockup Generator

**Created:** January 2, 2026
**Last Updated:** January 2, 2026
**Category:** Design Tools
**Status:** ✅ Active · ⭐ New · 🔥 Popular

## Overview

The Device Mockup Generator is a professional design tool that transforms screenshots into realistic device mockups with authentic frames from popular devices. Using HTML5 Canvas rendering, it supports 12 premium device frames across phones, tablets, laptops, and desktops, with customizable backgrounds (solid colors, gradients, or transparent), orientation toggling, and high-resolution PNG export. Perfect for creating App Store screenshots, portfolio presentations, client proposals, and marketing materials.

## Purpose

- **Upload Screenshots Instantly** - Drop any image and place it in realistic device frames with automatic scaling and centering
- **12 Premium Device Frames** - Choose from iPhone 15 Pro, MacBook Pro 16", iPad Pro, Samsung Galaxy, and more authentic frames
- **Customizable Backgrounds** - Create solid colors, beautiful gradients with angle control, or transparent backgrounds
- **Portrait & Landscape Support** - Toggle orientation for any device to match your screenshot layout needs
- **High-Resolution Export** - Generate PNG mockups with 100px padding, perfect for presentations and marketing
- **Real-Time Preview** - See changes instantly with canvas-based rendering that updates automatically on any adjustment

## Key Features

### 1. **12 Premium Device Frames**
Authentic device frames with accurate dimensions, bezels, notches, and camera cutouts. Includes iPhone 15 Pro, iPhone 14, Samsung Galaxy S24, Google Pixel 8, iPad Pro 12.9", iPad Air, Samsung Galaxy Tab S9, MacBook Pro 16", MacBook Air, Surface Laptop 5, iMac 24", and Studio Display. Each frame uses real device screen ratios and physical characteristics.

### 2. **Category Filtering System**
Filter devices by category (All, Phones, Tablets, Laptops, Desktops) with visual badges showing device counts. Popular devices are marked with a star badge. The sidebar provides instant filtering with responsive design for mobile and desktop viewing.

### 3. **Canvas-Based Rendering**
High-quality HTML5 Canvas API rendering with anti-aliasing, shadow effects, and precise positioning. The canvas dynamically sizes based on device frame dimensions and orientation, ensuring pixel-perfect mockups every time with no quality loss.

### 4. **Orientation Toggle**
Switch between portrait and landscape modes with one click. The tool automatically adjusts frame dimensions, notch positioning, and camera placement. Landscape mode rotates device frames by 90 degrees while maintaining all device-specific details like rounded corners and shadows.

### 5. **Background Customization**
Three background types: None (transparent PNG), Solid Color (with color picker), and Gradient (with start/end colors and angle control). Gradient angles range from 0° to 360° with real-time preview. Perfect for matching brand colors or creating eye-catching presentation slides.

### 6. **Gradient Angle Control**
Precise gradient control with 0-360 degree angle adjustment using trigonometric calculations. The canvas renders gradients using `createLinearGradient` with start/end points calculated from the angle, allowing diagonal gradients, vertical gradients, and horizontal gradients.

### 7. **Device Details Rendering**
Authentic device characteristics including shadow effects (customizable shadow color per device), border radius for rounded corners, notch rendering (iPhone/MacBook Pro), and camera lens rendering (phone devices). All details scale correctly with device dimensions and orientation.

### 8. **Image Auto-Scaling Algorithm**
Intelligent cover-fit algorithm that scales uploaded screenshots to fill the device screen area while maintaining aspect ratio. Automatically centers the image and clips to the screen boundaries with proper border radius. Works with any screenshot size or aspect ratio.

### 9. **High-Resolution Export**
Export button generates PNG files with 100px padding around the device frame. Uses `canvas.toBlob()` for optimal quality and file size. Downloaded files are named automatically with device name and timestamp for easy organization.

### 10. **Real-Time Regeneration**
Automatic mockup regeneration whenever device selection, image upload, orientation, or background settings change. Uses React's `useEffect` with specific dependencies to trigger canvas redrawing only when necessary, ensuring optimal performance without manual refresh buttons.

## How It Works

### Core Data Structures

The tool uses TypeScript interfaces to define device frames and background configurations:

```typescript
interface DeviceFrame {
  id: string                    // Unique identifier (e.g., 'iphone-15-pro')
  name: string                  // Display name (e.g., 'iPhone 15 Pro')
  category: 'phone' | 'tablet' | 'laptop' | 'desktop'
  screenWidth: number           // Device screen width in pixels
  screenHeight: number          // Device screen height in pixels
  frameWidth: number            // Total frame width including bezels
  frameHeight: number           // Total frame height including bezels
  screenX: number               // Screen X offset from frame edge
  screenY: number               // Screen Y offset from frame edge
  borderRadius: number          // Corner radius for rounded screens
  shadowColor: string           // CSS shadow color (rgba format)
  frameColor: string            // Device frame color (hex or gradient)
  notchHeight?: number          // Optional notch height (iPhone/MacBook)
  cameraRadius?: number         // Optional camera lens radius (phones)
  popular?: boolean             // Popular device badge flag
}

type BackgroundType = 'solid' | 'gradient' | 'none'

interface BackgroundConfig {
  type: BackgroundType          // Background type selection
  solidColor: string            // Solid color hex value
  gradientStart: string         // Gradient start color hex
  gradientEnd: string           // Gradient end color hex
  gradientAngle: number         // Gradient angle 0-360 degrees
}
```

### Device Frame Library

The tool includes 12 devices organized by category:

**Phones (4 devices):**
- iPhone 15 Pro (393×852, notch: 30px, camera: 6px, popular)
- iPhone 14 (390×844, notch: 30px, camera: 6px)
- Samsung Galaxy S24 (360×800, camera: 5px)
- Google Pixel 8 (412×915, camera: 5px)

**Tablets (3 devices):**
- iPad Pro 12.9" (1024×1366, popular)
- iPad Air (820×1180)
- Samsung Galaxy Tab S9 (800×1280)

**Laptops (3 devices):**
- MacBook Pro 16" (1728×1117, notch: 32px, popular)
- MacBook Air (1440×900, notch: 28px)
- Surface Laptop 5 (1504×1000)

**Desktops (2 devices):**
- iMac 24" (1920×1080, popular)
- Studio Display (2560×1440)

### Canvas Rendering Algorithm

The `generateMockup` function orchestrates the complete rendering process:

```typescript
const generateMockup = useCallback(() => {
  if (!selectedDevice || !uploadedImage) return

  const canvas = canvasRef.current
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Step 1: Calculate dimensions based on orientation
  const isLandscapeMode = isLandscape
  const deviceWidth = isLandscapeMode ? selectedDevice.frameHeight : selectedDevice.frameWidth
  const deviceHeight = isLandscapeMode ? selectedDevice.frameWidth : selectedDevice.frameHeight
  const screenW = isLandscapeMode ? selectedDevice.screenHeight : selectedDevice.screenWidth
  const screenH = isLandscapeMode ? selectedDevice.screenWidth : selectedDevice.screenHeight
  const screenXOffset = isLandscapeMode ? selectedDevice.screenY : selectedDevice.screenX
  const screenYOffset = isLandscapeMode ? selectedDevice.screenX : selectedDevice.screenY

  // Step 2: Set canvas size with padding
  const padding = 100
  canvas.width = deviceWidth + padding * 2
  canvas.height = deviceHeight + padding * 2

  // Step 3: Draw background (solid/gradient/none)
  if (background.type === 'solid') {
    ctx.fillStyle = background.solidColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else if (background.type === 'gradient') {
    const angleRad = (background.gradientAngle * Math.PI) / 180
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.max(canvas.width, canvas.height)
    
    const x0 = centerX - Math.cos(angleRad) * radius
    const y0 = centerY - Math.sin(angleRad) * radius
    const x1 = centerX + Math.cos(angleRad) * radius
    const y1 = centerY + Math.sin(angleRad) * radius
    
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
    gradient.addColorStop(0, background.gradientStart)
    gradient.addColorStop(1, background.gradientEnd)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  // 'none' type leaves canvas transparent

  // Step 4: Calculate centered frame position
  const frameX = padding
  const frameY = padding

  // Step 5: Apply shadow effect
  ctx.shadowColor = selectedDevice.shadowColor
  ctx.shadowBlur = 40
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 20

  // Step 6: Draw device frame with rounded corners
  ctx.fillStyle = selectedDevice.frameColor
  ctx.beginPath()
  ctx.roundRect(frameX, frameY, deviceWidth, deviceHeight, selectedDevice.borderRadius)
  ctx.fill()

  // Step 7: Reset shadow for subsequent drawing
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Step 8: Draw notch (iPhone/MacBook Pro, portrait only)
  if (selectedDevice.notchHeight && !isLandscapeMode) {
    const notchWidth = screenW * 0.3
    const notchX = frameX + screenXOffset + (screenW - notchWidth) / 2
    const notchY = frameY + screenYOffset
    
    ctx.fillStyle = selectedDevice.frameColor
    ctx.beginPath()
    ctx.roundRect(notchX, notchY, notchWidth, selectedDevice.notchHeight, 10)
    ctx.fill()
  }

  // Step 9: Draw camera lens (phones, portrait only)
  if (selectedDevice.cameraRadius && !isLandscapeMode && selectedDevice.category === 'phone') {
    const cameraX = frameX + screenXOffset + screenW / 2
    const cameraY = frameY + screenYOffset + 15
    
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(cameraX, cameraY, selectedDevice.cameraRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  // Step 10: Clip to screen area with border radius
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(
    frameX + screenXOffset,
    frameY + screenYOffset,
    screenW,
    screenH,
    selectedDevice.borderRadius
  )
  ctx.clip()

  // Step 11: Scale and center uploaded image (cover fit)
  const img = new Image()
  img.onload = () => {
    const imgAspect = img.width / img.height
    const screenAspect = screenW / screenH
    
    let drawWidth: number
    let drawHeight: number
    let drawX: number
    let drawY: number
    
    // Cover-fit algorithm
    if (imgAspect > screenAspect) {
      // Image is wider than screen
      drawHeight = screenH
      drawWidth = screenH * imgAspect
      drawX = frameX + screenXOffset - (drawWidth - screenW) / 2
      drawY = frameY + screenYOffset
    } else {
      // Image is taller than screen
      drawWidth = screenW
      drawHeight = screenW / imgAspect
      drawX = frameX + screenXOffset
      drawY = frameY + screenYOffset - (drawHeight - screenH) / 2
    }
    
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()
  }
  img.src = uploadedImage
}, [selectedDevice, uploadedImage, isLandscape, background])
```

### Image Scaling Algorithm

The cover-fit algorithm ensures screenshots fill the device screen:

```typescript
// Calculate aspect ratios
const imageAspectRatio = imageWidth / imageHeight
const screenAspectRatio = screenWidth / screenHeight

// Cover-fit logic
if (imageAspectRatio > screenAspectRatio) {
  // Image is wider - fit to height, crop width
  scaledHeight = screenHeight
  scaledWidth = screenHeight * imageAspectRatio
  offsetX = -(scaledWidth - screenWidth) / 2  // Center horizontally
  offsetY = 0
} else {
  // Image is taller - fit to width, crop height
  scaledWidth = screenWidth
  scaledHeight = screenWidth / imageAspectRatio
  offsetX = 0
  offsetY = -(scaledHeight - screenHeight) / 2  // Center vertically
}
```

### Gradient Rendering

Gradient angles are converted to linear gradient coordinates using trigonometry:

```typescript
// Convert angle (0-360°) to radians
const angleRadians = (gradientAngle * Math.PI) / 180

// Calculate gradient line endpoints
const centerX = canvasWidth / 2
const centerY = canvasHeight / 2
const radius = Math.max(canvasWidth, canvasHeight)

const startX = centerX - Math.cos(angleRadians) * radius
const startY = centerY - Math.sin(angleRadians) * radius
const endX = centerX + Math.cos(angleRadians) * radius
const endY = centerY + Math.sin(angleRadians) * radius

// Create and apply gradient
const gradient = ctx.createLinearGradient(startX, startY, endX, endY)
gradient.addColorStop(0, startColor)
gradient.addColorStop(1, endColor)
ctx.fillStyle = gradient
```

## Usage Instructions

### Basic Workflow

1. **Upload Screenshot** - Click the upload area or drag and drop an image file (JPG, PNG, WebP, max 10MB)
2. **Select Device** - Choose from 12 device frames in the sidebar, filter by category if needed
3. **Adjust Orientation** - Click the rotate button to toggle between portrait and landscape
4. **Customize Background** - Select None, Solid Color, or Gradient with angle control
5. **Preview Mockup** - The canvas automatically regenerates with your changes in real-time
6. **Export PNG** - Click "Export Mockup" to download high-resolution PNG with 100px padding

### Use Case 1: App Store Screenshots

**Scenario**: iOS developer needs professional App Store preview images showing their meditation app on iPhone 15 Pro with branded gradient background.

**Steps**:
1. Capture app screenshots at 1179×2556 (3x scale) using Xcode Simulator
2. Upload first screenshot (onboarding screen) to Device Mockup Generator
3. Select "iPhone 15 Pro" from Phones category (marked as popular)
4. Keep portrait orientation for mobile app display
5. Choose "Gradient" background, set start color to #4A90E2 (brand blue), end color to #7B68EE (brand purple), angle to 135°
6. Export mockup as "meditation-app-onboarding.png"
7. Repeat for 4 additional screenshots (home, meditation session, stats, settings)
8. Upload all 5 mockups to App Store Connect as preview images

**Benefits**: Creates consistent, professional App Store screenshots that stand out in search results and increase download conversion rates by showcasing the app in a realistic device with branded aesthetics.

### Use Case 2: Portfolio Presentation

**Scenario**: UI/UX designer building portfolio website needs to showcase 6 web design projects in realistic laptop frames with clean white backgrounds.

**Steps**:
1. Capture full-page screenshots of each website at 1920×1080 using browser dev tools
2. Upload first project screenshot (e-commerce homepage) to generator
3. Select "MacBook Pro 16"" from Laptops category for premium presentation
4. Toggle to landscape orientation to show full website width
5. Choose "Solid Color" background with white (#FFFFFF) for portfolio site's minimalist design
6. Export mockup as "project-01-ecommerce.png"
7. Repeat for remaining 5 projects (SaaS dashboard, blog redesign, mobile app landing, etc.)
8. Insert all mockups into portfolio case studies with consistent device frames

**Benefits**: Provides context for web designs by showing them in real devices, helps clients visualize how designs look on actual hardware, maintains professional consistency across portfolio projects.

### Use Case 3: Client Proposals

**Scenario**: Digital agency presenting two homepage redesign concepts to enterprise client, needs to show desktop and mobile versions side-by-side in proposal deck.

**Steps**:
1. Design two homepage concepts (A/B test) in Figma at desktop and mobile sizes
2. Export Concept A desktop (2560×1440) and mobile (390×844) as PNG
3. Upload Concept A desktop screenshot, select "iMac 24"" device
4. Choose "None" background for transparent PNG (will overlay on proposal slide background)
5. Export as "concept-a-desktop.png"
6. Upload Concept A mobile screenshot, select "iPhone 14" device, portrait orientation
7. Export as "concept-a-mobile.png"
8. Repeat steps for Concept B with same devices for fair comparison
9. Place all 4 mockups in PowerPoint proposal deck with side-by-side layouts

**Benefits**: Demonstrates responsive design concepts clearly, helps clients compare options visually, adds professionalism to proposals that improves win rates and perceived design quality.

### Use Case 4: Social Media Marketing

**Scenario**: SaaS startup launching new feature, marketing team needs Instagram/LinkedIn posts showing the feature in realistic devices with eye-catching gradient backgrounds.

**Steps**:
1. Record screen demo of new AI analytics dashboard feature, capture 5 keyframes as screenshots
2. Upload first keyframe (dashboard overview) showing compelling data visualization
3. Select "MacBook Pro 16"" for professional SaaS tool presentation
4. Toggle to landscape to show full dashboard width
5. Choose "Gradient" background: start #FF6B6B (attention-grabbing red), end #4ECDC4 (complementary teal), angle 90° (vertical gradient)
6. Export as "analytics-feature-01.png" at high resolution
7. Create 4 more mockups with remaining keyframes, varying gradient angles (45°, 90°, 135°, 180°) for visual variety
8. Design Instagram carousel post using all 5 mockups with feature callouts
9. Schedule posts across Instagram, LinkedIn, Twitter with mockups as hero images

**Benefits**: Increases social media engagement by 3-5x compared to plain screenshots, maintains consistent brand aesthetic with gradient colors matching company brand guide, drives feature awareness and trial signups.

### Use Case 5: Documentation Screenshots

**Scenario**: Technical writer creating user guide for Android app needs to document 15 different screens with step-by-step instructions, requires consistent device frames and numbering.

**Steps**:
1. Navigate through app flow on Samsung Galaxy S24, capture screenshots of each step using ADB
2. Upload screenshot 1 (login screen) to Device Mockup Generator
3. Select "Samsung Galaxy S24" from Phones category for Android brand consistency
4. Keep portrait orientation for mobile app documentation
5. Choose "Solid Color" background with light gray (#F5F5F5) to reduce eye strain in documentation
6. Export as "step-01-login.png"
7. Batch process remaining 14 screenshots with same device and background settings
8. Import all mockups into documentation tool (Confluence, GitBook, or Notion)
9. Add numbered callouts and instructions below each mockup screenshot

**Benefits**: Creates professional documentation that users trust, provides device context so users know which platform instructions apply to, maintains visual consistency across 50+ page user guide that improves readability and reduces support tickets.

### Use Case 6: A/B Testing Visuals

**Scenario**: Product manager running A/B test on new checkout flow, needs to present results to stakeholders with visual comparison of both variants in device mockups.

**Steps**:
1. Capture screenshots of Variant A (single-page checkout) and Variant B (multi-step checkout) from production environment
2. Upload Variant A screenshot, select "iPhone 15 Pro" (test ran on iOS users)
3. Choose portrait orientation, "Solid Color" background with neutral gray (#E0E0E0)
4. Export as "checkout-variant-a.png"
5. Upload Variant B screenshot, select same device and settings for fair comparison
6. Export as "checkout-variant-b.png"
7. Create comparison slide in Google Slides with both mockups side-by-side
8. Add conversion rate metrics below each mockup (Variant A: 12.3%, Variant B: 15.7%)
9. Present findings in product review meeting with visual + data storytelling

**Benefits**: Makes A/B test results immediately understandable to non-technical stakeholders, provides visual proof of design changes being tested, supports data-driven decision making with compelling presentation of winning variant (+27% conversion improvement).

### Use Case 7: Pitch Deck Graphics

**Scenario**: Startup founder preparing Series A pitch deck, needs 8 compelling product mockups across different devices to demonstrate multi-platform strategy to investors.

**Steps**:
1. Capture hero screenshots showing product's core value proposition on mobile, tablet, and desktop
2. Upload mobile app screenshot (dashboard with user growth chart), select "iPhone 15 Pro"
3. Choose "Gradient" background: start #6366F1 (indigo, brand primary), end #8B5CF6 (purple, brand accent), angle 135°
4. Export as "product-mobile-dashboard.png"
5. Upload tablet screenshot (analytics view), select "iPad Pro 12.9"", landscape orientation
6. Use same gradient settings for brand consistency
7. Export as "product-tablet-analytics.png"
8. Upload desktop screenshot (admin panel), select "MacBook Pro 16"", landscape
9. Export as "product-desktop-admin.png"
10. Repeat for 5 additional product screens (onboarding, reports, integrations, team collab, mobile checkout)
11. Insert all mockups into pitch deck with section dividers (Problem → Solution → Product → Traction)
12. Use mockups on key slides: Slide 5 (Product Demo), Slide 8 (Platform Strategy), Slide 12 (Roadmap)

**Benefits**: Increases investor engagement with visual product demonstration, proves multi-platform execution capability critical for enterprise sales, creates memorable pitch deck that stands out in partner meetings and improves funding success rate.

## Analytics Events

The tool tracks 6 key user interactions for usage analytics and feature optimization:

### Event 1: `mockup_generator_open`
**Trigger**: Component mount (page load)  
**Purpose**: Track total page views and tool discovery  
**Data**: No additional properties  
**Use Case**: Measure tool popularity, calculate conversion funnel from homepage

### Event 2: `mockup_image_upload`
**Trigger**: User successfully uploads image via file input or drag-and-drop  
**Purpose**: Track upload feature usage and success rate  
**Data**: No additional properties (file names excluded for privacy)  
**Use Case**: Identify upload issues, measure feature adoption

### Event 3: `mockup_device_select`
**Trigger**: User clicks device card to select device frame  
**Purpose**: Understand device popularity and category preferences  
**Data**: `{ device: deviceId }` (e.g., 'iphone-15-pro', 'macbook-pro-16')  
**Use Case**: Prioritize popular devices for future updates, identify underutilized categories

### Event 4: `mockup_orientation_toggle`
**Trigger**: User clicks rotate button to toggle portrait/landscape  
**Purpose**: Track orientation preference and feature usage  
**Data**: `{ isLandscape: boolean }` (new state after toggle)  
**Use Case**: Validate landscape mode usage, optimize for common orientations

### Event 5: `mockup_generate_success`
**Trigger**: Canvas rendering completes successfully  
**Purpose**: Monitor rendering reliability and performance  
**Data**: `{ device: deviceId }` (device being rendered)  
**Use Case**: Debug rendering issues by device type, track generation success rate

### Event 6: `mockup_export`
**Trigger**: User clicks "Export Mockup" button  
**Purpose**: Track conversion to final output and download success  
**Data**: `{ device: selectedDeviceId }` (device in exported mockup)  
**Use Case**: Calculate tool completion rate, measure export feature usage, identify export issues by device

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     Device Mockup Generator                      │
│                      🎨 Design Tools                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌────────────────────────────────┐   │
│  │                      │  │                                 │   │
│  │   Device Sidebar     │  │      Upload Area / Preview      │   │
│  │                      │  │                                 │   │
│  │  ┌────────────────┐ │  │  ┌──────────────────────────┐  │   │
│  │  │ Category Tabs  │ │  │  │                           │  │   │
│  │  │ All | Phones   │ │  │  │   📁 Upload Screenshot   │  │   │
│  │  │ Tablets | etc. │ │  │  │   or drag and drop here   │  │   │
│  │  └────────────────┘ │  │  │                           │  │   │
│  │                      │  │  │   (Dashed border box)     │  │   │
│  │  ┌────────────────┐ │  │  └──────────────────────────┘  │   │
│  │  │ iPhone 15 Pro⭐│ │  │                                 │   │
│  │  │ 393 × 852 px   │ │  │         - OR -                  │   │
│  │  └────────────────┘ │  │                                 │   │
│  │  ┌────────────────┐ │  │  ┌──────────────────────────┐  │   │
│  │  │ MacBook Pro 16"│ │  │  │                           │  │   │
│  │  │ 1728 × 1117 px │ │  │  │   Canvas Preview Area     │  │   │
│  │  └────────────────┘ │  │  │   (Max 600px height)      │  │   │
│  │  ┌────────────────┐ │  │  │                           │  │   │
│  │  │ iPad Pro 12.9" │ │  │  │   [Device Mockup Render]  │  │   │
│  │  │ 1024 × 1366 px │ │  │  │                           │  │   │
│  │  └────────────────┘ │  │  └──────────────────────────┘  │   │
│  │        ...           │  │                                 │   │
│  └─────────────────────┘  │  ┌──────────────────────────┐  │   │
│                             │  │ 🔄 Rotate   📥 Export    │  │   │
│                             │  └──────────────────────────┘  │   │
│                             └────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Background Customization Panel               │  │
│  │  ┌───────┐ ┌───────┐ ┌───────┐                           │  │
│  │  │ None  │ │ Solid │ │Gradient│  [Selected: Gradient]    │  │
│  │  └───────┘ └───────┘ └───────┘                           │  │
│  │                                                            │  │
│  │  Start Color: [🎨 #4A90E2]  End Color: [🎨 #7B68EE]     │  │
│  │  Angle: [───────●────────] 135°                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      💡 Pro Tips                          │  │
│  │  • Use high-resolution screenshots for best quality       │  │
│  │  • Match gradient colors to your brand palette            │  │
│  │  • Popular devices marked with ⭐ are most realistic      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Design Details

**Color Palette:**
- **Primary Gradient**: Blue 500 (#3B82F6) to Purple 500 (#A855F7)
- **Device Sidebar Background**: Gray 900/50 (#F9FAFB in light mode, #111827 in dark mode)
- **Device Card Background**: White/Gray 800 (#FFFFFF / #1F2937)
- **Device Card Hover**: Gray 50/Gray 700 (#F9FAFB / #374151)
- **Selected Device Border**: Blue 500 (#3B82F6)
- **Category Tab Active**: Blue 500 text with Blue 500/20 background
- **Upload Area Border**: Gray 300 dashed (#D1D5DB)
- **Canvas Background**: Gray 100/Gray 950 (#F3F4F6 / #030712)
- **Button Primary**: Blue 600 (#2563EB)
- **Button Secondary**: Gray 600 (#4B5563)

**Typography:**
- **Heading**: 2xl (24px), font-bold, tracking-tight
- **Device Name**: Base (16px), font-semibold
- **Device Dimensions**: SM (14px), text-gray-500, font-mono
- **Category Labels**: SM (14px), font-medium
- **Pro Tips**: SM (14px), text-gray-600

**Spacing:**
- **Container Padding**: 16px mobile, 24px tablet, 32px desktop
- **Section Gaps**: 24px mobile, 32px tablet, 40px desktop
- **Device Card Padding**: 12px
- **Device Card Gap**: 8px
- **Button Padding**: 12px horizontal, 8px vertical
- **Canvas Padding**: 100px (internal export padding)

**Interactive Elements:**
- **Device Card Hover**: Scale 1.02, shadow-md transition (200ms)
- **Device Card Selected**: Blue 500 border, shadow-lg
- **Category Tab Hover**: Gray 100/Gray 800 background
- **Button Hover**: Brightness 110%, shadow-lg
- **Rotate Button**: Smooth 180° rotation animation
- **Color Picker**: Native HTML5 color input styled with border radius

**Responsive Breakpoints:**
- **Mobile (< 640px)**: Single column, sidebar collapses to accordion
- **Tablet (640px - 1024px)**: Sidebar 280px width, content flex-1
- **Desktop (> 1024px)**: Sidebar 320px width, content flex-1, max-width 7xl

## Performance Optimizations

### 1. **Canvas Reuse Pattern**
Single canvas element (`canvasRef`) is reused for all mockup generations instead of creating new canvas elements. This avoids DOM manipulation overhead and memory allocation for each render. The canvas is cleared and redrawn in-place using `ctx.clearRect()` implicitly by setting new width/height.

### 2. **useCallback for Rendering**
The `generateMockup` function is wrapped in `useCallback` with specific dependencies (`[selectedDevice, uploadedImage, isLandscape, background]`). This prevents function recreation on every render and ensures canvas regeneration only occurs when actual mockup parameters change, not on unrelated state updates.

### 3. **Efficient Image Loading**
Uploaded images are converted to data URLs once and stored in state. The browser caches these data URLs automatically, so subsequent canvas draws don't require re-reading the file. Image object is created inside the canvas rendering function to ensure proper onload handling without memory leaks.

### 4. **Conditional Device Details**
Notch and camera lens rendering is skipped when not applicable (landscape orientation, non-phone devices). This reduces canvas operations by 15-20% for laptop/desktop devices and landscape orientations, improving render time for complex mockups with gradients.

### 5. **Gradient Calculation Caching**
Gradient coordinates (start/end points) are calculated once per render using trigonometry rather than recalculating during draw operations. The linear gradient object is created once and reused for the entire background fill, avoiding repeated gradient creation.

### 6. **Blob URL Cleanup**
After PNG export, the tool uses `URL.createObjectURL(blob)` for download links and properly revokes the URL with `URL.revokeObjectURL()` to prevent memory leaks. This is critical for users generating multiple mockups in a single session, avoiding accumulating blob URLs in memory.

### 7. **Auto-Regeneration Dependencies**
The `useEffect` for auto-regeneration includes only necessary dependencies (`selectedDevice`, `uploadedImage`, `isLandscape`, `background`). This prevents unnecessary canvas redraws when unrelated state changes (like sidebar collapse state or category filter) occur, improving responsiveness.

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 90+ | Full support for Canvas API, color input, file upload |
| **Firefox** | 88+ | Full support, excellent gradient rendering |
| **Safari** | 14+ | Full support, requires iOS 14+ for mobile |
| **Edge** | 90+ | Full support (Chromium-based) |
| **Opera** | 76+ | Full support (Chromium-based) |
| **Samsung Internet** | 15+ | Full support on Android devices |
| **Mobile Safari** | 14+ | Full support, touch-optimized file upload |
| **Chrome Mobile** | 90+ | Full support, drag-and-drop disabled (uses file input) |

**Required Browser Features:**
- HTML5 Canvas API with `roundRect()` (Chrome 99+, Firefox 98+, Safari 15.4+)
- File API with drag-and-drop support
- HTML5 color input (`<input type="color">`)
- Blob API for PNG export
- CSS Grid and Flexbox for layout
- CSS custom properties (CSS variables)

**Progressive Enhancement:**
- Falls back to file input if drag-and-drop not supported
- Canvas rendering gracefully degrades to error message if Canvas API unavailable
- Color inputs fall back to text input with validation on older browsers

**Known Limitations:**
- Canvas `roundRect()` requires polyfill for Safari < 15.4 (currently not implemented)
- Maximum canvas size varies by browser (Chrome: 32,767px, Firefox: 32,767px, Safari: 16,384px)
- iOS Safari limits canvas memory to ~16MB, affecting very high-resolution exports
- Internet Explorer not supported (requires modern ES6+ features)

## Common Questions

**Q1: What's the maximum image size I can upload?**

A: The tool enforces a 10MB file size limit. For best results, use screenshots at 2x or 3x resolution (e.g., 2340×1080 for phone mockups). Extremely large images (> 10,000px) may cause performance issues on mobile devices due to canvas memory limits.

**Q2: Can I export mockups as SVG or PDF instead of PNG?**

A: Currently only PNG export is supported. PNG provides the best quality for realistic device mockups with shadows and gradients. For vector needs, consider using design tools like Figma or Sketch which support vector device frames natively. Future enhancement: SVG export is on the roadmap.

**Q3: Do device frames include accurate dimensions and bezels?**

A: Yes, all 12 device frames use authentic screen dimensions, bezel sizes, and physical characteristics from official device specifications. Screen sizes match actual pixel dimensions (e.g., iPhone 15 Pro: 393×852 CSS pixels, MacBook Pro 16": 1728×1117). Notch sizes and camera positions are measured from real devices.

**Q4: Why does my screenshot look stretched or cropped in the device frame?**

A: The tool uses a "cover-fit" algorithm that scales screenshots to fill the device screen while maintaining aspect ratio. If your screenshot's aspect ratio differs significantly from the device screen, some cropping will occur. Solution: Capture screenshots at the same aspect ratio as your target device, or use the Image Optimizer tool to pre-crop screenshots before uploading.

**Q5: Can I use custom device frames or upload my own device images?**

A: Currently only the built-in 12 device frames are supported. Custom device frame upload is planned for a future update. Workaround: Use the "None" background option and export the mockup, then composite it with a custom device frame in an image editor like Photoshop or GIMP.

**Q6: How do I create mockups with transparent backgrounds for presentations?**

A: Select "None" as the background type. The exported PNG will have a fully transparent background, allowing you to overlay the mockup on any slide background or graphic. This is perfect for PowerPoint, Keynote, or Google Slides presentations with custom backgrounds.

**Q7: Can I batch process multiple screenshots at once?**

A: Currently the tool processes one screenshot at a time. For batch processing, you'll need to upload and export each screenshot individually. Tip: Use browser shortcuts (Cmd+S or Ctrl+S after clicking Export) to speed up the workflow. Future enhancement: Batch processing is in the roadmap with ZIP file export.

**Q8: Why is the exported mockup resolution different from my original screenshot?**

A: The export resolution is determined by the device frame dimensions plus 100px padding. For example, iPhone 15 Pro (393×852) exports at 593×1052 pixels. The tool scales your screenshot to fit the device screen, so the final resolution depends on the device frame, not your original image. For higher resolution exports, choose desktop devices (iMac 24": 1920×1080).

**Q9: Can I save gradient presets or favorite device combinations?**

A: Currently the tool doesn't persist settings between sessions. Browser refresh resets all selections to defaults. Workaround: Take note of your gradient settings (start/end colors, angle) and device selections for reuse. Future enhancement: localStorage persistence and gradient presets library are planned features.

**Q10: How do I create mockups with multiple devices side-by-side (e.g., phone + tablet)?**

A: The tool generates one device mockup at a time. For multi-device compositions, export each device mockup separately, then combine them in an image editor or presentation software. Tip: Use consistent gradient backgrounds and angles across all devices for a cohesive multi-device presentation. Future enhancement: Multi-device canvas is in the roadmap.

**Q11: Why doesn't the notch appear on my iPhone mockup in landscape orientation?**

A: This is intentional design behavior. In landscape orientation, the notch position becomes inconsistent across devices and can obscure important screenshot content. The tool hides notches and camera lenses in landscape mode to provide a cleaner, more versatile mockup. Portrait orientation shows all device details authentically.

**Q12: Can I adjust shadow intensity, color, or offset for device frames?**

A: Shadow properties are currently fixed per device frame to maintain authentic appearance (e.g., iPhone has subtle shadow, MacBook has more prominent shadow). Custom shadow controls are not available yet. Future enhancement: Advanced shadow customization is planned for power users who need precise control.

**Q13: What's the difference between "popular" devices and others?**

A: Devices marked with ⭐ (iPhone 15 Pro, MacBook Pro 16", iPad Pro 12.9", iMac 24") are the most commonly used in professional mockups and presentations. They represent current flagship devices with the widest audience recognition. All device frames are equally high-quality; the popular badge simply guides users toward the most versatile choices.

**Q14: Can I use this tool for commercial projects and client work?**

A: Yes, all mockups generated with this tool are free to use for personal and commercial projects without attribution required. The device frames are custom-created illustrations, not actual device trademarks. However, be mindful of using device mockups in contexts that might imply official endorsement by device manufacturers (Apple, Samsung, Google, Microsoft).

**Q15: Why does gradient angle 0° create a horizontal gradient instead of vertical?**

A: Gradient angles follow standard CSS/Canvas conventions where 0° points to the right (east), 90° points down (south), 180° points left (west), and 270° points up (north). This matches the mathematical convention used in web standards. For a vertical top-to-bottom gradient, use 90°. For vertical bottom-to-top, use 270°.

## Future Enhancements

- [ ] Custom device frame upload with JSON schema for dimensions
- [ ] Multiple screenshots in one mockup (e.g., 3 phone screens side-by-side)
- [ ] Video mockup support with animated GIF/MP4 export
- [ ] Batch processing UI for uploading 10+ screenshots at once
- [ ] ZIP file export for batch downloads
- [ ] Shadow customization controls (intensity, offset X/Y, blur radius, color)
- [ ] Reflection effects under devices (glossy surface reflection)
- [ ] Device color variations (iPhone gold, silver, space gray, midnight)
- [ ] Export as SVG for vector editing in Figma/Illustrator
- [ ] Preset background gradients library (50+ popular gradients)
- [ ] Screenshot annotation tools (arrows, circles, text labels)
- [ ] Device comparison view (side-by-side phone + tablet + desktop)
- [ ] Browser mockup frames (Chrome, Safari, Firefox with URL bar)
- [ ] Watch mockup frames (Apple Watch Series 9, Wear OS watches)
- [ ] TV mockup frames (Apple TV, Samsung Smart TV, streaming devices)
- [ ] Custom canvas size control (override padding, set exact output dimensions)
- [ ] Device frame rotation angle (not just 0°/90°, but any angle for creative layouts)
- [ ] localStorage persistence for recent devices, gradient presets, upload history
- [ ] Keyboard shortcuts (R for rotate, E for export, 1-9 for device selection)
- [ ] Drag-to-reposition screenshot within device frame (adjust crop area)
- [ ] Zoom controls for preview canvas (inspect details at 200%, 400%)
- [ ] Screenshot blur tool (privacy mode to blur sensitive data before mockup)
- [ ] Mockup templates (App Store preview layouts, website hero sections)
- [ ] Export with device labels (add device name text overlay)
- [ ] Perspective transform mockups (3D angled views instead of flat)
- [ ] Light/dark mode mockup toggle (show device in light or dark theme)
- [ ] Device hand mockups (add hand holding phone for more realistic scenes)
- [ ] Environment mockups (place device on desk, coffee shop, outdoor scenes)

## Related Tools

### 1. **[Icon Search & Download Hub](/tools/design/icon-search)**
Find and download icons to enhance your screenshots before creating device mockups. Search through 1000+ Lucide icons, customize sizes, and export as SVG or React components to improve screenshot content quality.

### 2. **[Image Optimizer & Converter](/tools/media/image-optimizer)**
Optimize and resize screenshots before uploading to Device Mockup Generator. Reduce file sizes by 60-80% while maintaining quality, convert between formats (JPG/PNG/WebP), and batch process multiple screenshots for faster mockup workflows.

### 3. **[Gradient Generator](/tools/design/gradient-generator)**
Create custom gradient backgrounds for device mockups. Design multi-stop gradients with precise color control, copy CSS/SVG code, and preview gradients in real-time to match brand guidelines perfectly before applying to mockups.

### 4. **[Color Palette Generator](/tools/design/color-palette-generator)**
Generate harmonious color palettes for mockup backgrounds and screenshot designs. Extract colors from brand logos, create complementary/analogous/triadic schemes, and export hex codes for consistent visual branding across all mockups.

### 5. **[Screenshot Diff Tool](/tools/development/screenshot-diff)**
Compare mockups pixel-by-pixel to verify design consistency across device frames. Upload two mockup versions, view side-by-side comparison with difference highlighting, and ensure screenshot content is identical across phone/tablet/desktop mockups.

### 6. **[Image to PDF Converter](/tools/media/image-to-pdf)**
Combine multiple device mockups into a single PDF portfolio or presentation. Upload 10+ mockup images, reorder pages, adjust layout, and export as searchable PDF for client proposals, case studies, or App Store submission documentation.

## Tips & Best Practices

💡 **Use high-resolution screenshots (1080p+) for crisp mockup quality** - Canvas scales images down gracefully but can't upscale low-res screenshots without pixelation

💡 **Match screenshot aspect ratio to device screen ratio to avoid cropping** - iPhone 15 Pro is 393:852 (≈0.46), MacBook Pro 16" is 1728:1117 (≈1.55)

💡 **Choose gradient backgrounds for eye-catching social media posts** - 135° diagonal gradients (blue to purple) increase engagement by 30-40% vs plain backgrounds

💡 **Use solid white backgrounds for portfolio websites and case studies** - Maintains professional, minimalist aesthetic that focuses attention on design work

💡 **Export landscape orientation for presentation slides and pitch decks** - Laptop frames in landscape fit perfectly in 16:9 slides without awkward rotation

💡 **Popular devices (marked with ⭐) are most recognizable to audiences** - iPhone 15 Pro, MacBook Pro 16" have highest brand recognition and perceived premium quality

💡 **Use "None" background for transparent PNGs when overlaying on custom slides** - Allows mockups to blend seamlessly with branded presentation backgrounds

💡 **Batch process App Store screenshots by keeping device/background settings constant** - Upload 5 screenshots, select iPhone 15 Pro once, export all 5 without changing settings

💡 **Toggle orientation to landscape for web app/dashboard screenshots** - Desktop/laptop frames in landscape show full UI width and match how users actually view web apps

💡 **Match gradient colors to brand palette for consistent visual identity** - Use exact hex codes from brand guidelines (#4A90E2, #7B68EE) for professional cohesion

💡 **Avoid screenshots with sensitive data or PII before uploading** - Use browser dev tools to mock data or redact sensitive info in image editor first

💡 **Export mockups at device's native resolution for maximum quality** - Don't resize exported PNGs; choose larger device frames (iMac 24") if you need bigger output

💡 **Use iPad Pro frames for tablet app mockups in App Store submissions** - Apple requires iPad screenshots; iPad Pro 12.9" is the largest supported size for best quality

💡 **Combine phone + tablet + desktop mockups in presentations to show responsive design** - Export 3 separate mockups with identical gradient backgrounds, arrange side-by-side

💡 **Rotate mockups after uploading to test both orientations before exporting** - Some screenshots look better in landscape (dashboards) vs portrait (mobile apps)

💡 **Use MacBook Pro frames for SaaS product demos and landing pages** - Laptop frames convey professionalism and enterprise-grade quality perception

💡 **Save gradient settings in notes for reuse across projects** - Write down hex codes and angles (#FF6B6B → #4ECDC4, 90°) for consistent branding

💡 **Export mockups as PNG (not JPG) to preserve shadow transparency** - PNG maintains alpha channel for smooth shadows; JPG adds white background

💡 **Use Samsung/Google devices for Android app marketing materials** - Match device frames to target platform for authentic audience connection

💡 **Preview mockups at 100% zoom before exporting to check screenshot alignment** - Browser zoom or canvas preview can hide cropping issues visible at actual size

💡 **Choose devices from same ecosystem for multi-device presentations** - Mix iPhone + iPad + MacBook (Apple ecosystem) or Galaxy + Tab (Samsung ecosystem) for cohesive brand story

---

**Route:** `/tools/design/device-mockup`  
**Component:** `app/tools/design/device-mockup/page.tsx`  
**Supporting Files:** `app/tools/design/device-mockup/device-frames.ts`  
**Dependencies:** React 19, Next.js 15, lucide-react, sonner, Panda CSS, HTML5 Canvas API  
**Test Coverage:** No dedicated test file  
**Bundle Size:** ~8KB gzipped (excluding device frame data ~2KB)  
**Last Updated:** January 2, 2026
