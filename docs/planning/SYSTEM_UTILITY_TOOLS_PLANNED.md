# System & Utility Tools - Implementation Plan

**Created**: October 28, 2025  
**Status**: Planning Phase  
**Category**: System / Utility Tools (distributed across `development` and `productivity` categories)  
**Estimated Timeline**: 3 weeks (2 phases)

## Overview

Adding 4 system and utility tools focused on browser capabilities, network diagnostics, clipboard enhancement, and file inspection. These tools leverage modern browser APIs to provide technical insights and productivity enhancements without requiring server-side processing.

**Category Distribution Decision**: Instead of creating a new "System / Utility Tools" category, these tools are distributed across existing categories based on their primary use case:

- **Development** (3 tools): Browser Fingerprint, Speed Test, File Inspector - technical/diagnostic tools
- **Productivity** (1 tool): Clipboard Formatter - daily utility tool

---

## Tools Summary

| Tool                       | Category     | Stack               | Pricing  | Priority |
| -------------------------- | ------------ | ------------------- | -------- | -------- |
| Browser Fingerprint Viewer | development  | fingerprintjs       | Free     | High     |
| Network Speed Test (Lite)  | development  | fetch() Blob test   | Freemium | Medium   |
| Clipboard Formatter        | productivity | navigator.clipboard | Free     | High     |
| File Metadata Inspector    | development  | File API            | Free     | High     |

---

## 1. Browser Fingerprint Viewer 🔍

### Description

Display comprehensive browser and device fingerprinting data for privacy awareness. Shows unique identifiers that websites can use to track users across sessions.

### Key Features

- **Canvas Fingerprint**: Extract unique canvas rendering signature
- **WebGL Renderer**: Display GPU and graphics driver info
- **Device Characteristics**: Screen resolution, color depth, timezone, language
- **Installed Fonts**: Detect available system fonts (privacy concern)
- **Browser Plugins**: List installed browser extensions/plugins
- **Hardware Info**: CPU cores, memory, touch support, device pixel ratio
- **Audio Context**: AudioContext fingerprinting
- **Privacy Score**: Calculate how unique the fingerprint is (0-100)

### Technical Stack

```typescript
// Core dependencies
- fingerprintjs: "^4.0.0"    // Browser fingerprinting library
- canvas-fingerprint: "^2.0.0" // Canvas-based fingerprinting
- webgl-fingerprint: "^1.0.0"  // WebGL fingerprinting

// Browser APIs
- navigator.userAgent
- navigator.hardwareConcurrency
- navigator.deviceMemory
- window.screen
- HTMLCanvasElement
- WebGLRenderingContext
```

### Implementation Details

**Data Collection**:

```typescript
interface BrowserFingerprint {
  // Basic Info
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;

  // Screen & Display
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;

  // Hardware
  cpuCores: number;
  deviceMemory?: number;
  touchSupport: boolean;

  // Canvas Fingerprint
  canvasHash: string;

  // WebGL
  webglVendor: string;
  webglRenderer: string;

  // Fonts (subset)
  installedFonts: string[];

  // Privacy Score
  uniquenessScore: number; // 0-100
}
```

**Canvas Fingerprinting**:

```typescript
function getCanvasFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Draw complex patterns
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("Browser Fingerprint", 2, 15);

  // Extract unique hash
  return canvas.toDataURL();
}
```

**WebGL Fingerprinting**:

```typescript
function getWebGLFingerprint() {
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) return null;

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
  };
}
```

### UI/UX Design

- **Category Sections**: Group fingerprint data by type (Browser, Hardware, Graphics, Privacy)
- **Visual Privacy Score**: Large circular gauge showing uniqueness (0-100)
- **Copy Individual Fields**: Click to copy any fingerprint attribute
- **Export Full Report**: Download complete fingerprint as JSON
- **Privacy Tips**: Educational content about fingerprinting and mitigation
- **Color Coding**: Red for highly identifying data, yellow for moderate, green for common

### SEO Keywords

- browser fingerprint viewer
- device fingerprint checker
- canvas fingerprint test
- webgl fingerprint
- browser privacy check
- tracking detection tool

---

## 2. Network Speed Test (Lite) 📊

### Description

Browser-based internet speed test using fetch() API and Blob downloads. Free version shows basic speeds, Pro version includes advanced metrics and historical tracking.

### Key Features (Free Tier)

- **Download Speed**: Test download bandwidth with large file fetch
- **Upload Speed**: Test upload bandwidth with POST request
- **Real-time Graph**: Live speed chart during test
- **Server Selection**: Auto-select nearest test server
- **Test History**: Last 10 test results (localStorage)

### Key Features (Pro Tier - Freemium)

- **Latency/Ping**: ICMP-like ping measurement
- **Jitter**: Connection stability analysis
- **Packet Loss**: Simulated packet loss detection
- **Historical Charts**: 30-day speed trends
- **Multiple Servers**: Test to 5+ global locations
- **Export Data**: CSV/JSON export of all tests

### Technical Stack

```typescript
// Free version - no dependencies
- fetch() API with large Blobs
- Performance API for timing
- localStorage for history

// Pro version (future)
- Supabase for cloud sync
- Chart.js for advanced graphs
- WebRTC for jitter/packet loss
```

### Implementation Details

**Speed Test Algorithm**:

```typescript
interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  latency: number; // ms
  jitter?: number; // ms (Pro)
  packetLoss?: number; // % (Pro)
  timestamp: number;
  serverId: string;
}

async function testDownloadSpeed(): Promise<number> {
  const testFileSize = 10 * 1024 * 1024; // 10 MB
  const testUrl = "/api/speed-test/download"; // Serve test file

  const startTime = performance.now();
  const response = await fetch(testUrl);
  const blob = await response.blob();
  const endTime = performance.now();

  const durationSeconds = (endTime - startTime) / 1000;
  const speedBps = (blob.size * 8) / durationSeconds;
  const speedMbps = speedBps / (1024 * 1024);

  return speedMbps;
}

async function testUploadSpeed(): Promise<number> {
  const testData = new Blob([new ArrayBuffer(5 * 1024 * 1024)]); // 5 MB

  const startTime = performance.now();
  await fetch("/api/speed-test/upload", {
    method: "POST",
    body: testData,
  });
  const endTime = performance.now();

  const durationSeconds = (endTime - startTime) / 1000;
  const speedMbps = (testData.size * 8) / durationSeconds / (1024 * 1024);

  return speedMbps;
}
```

**Latency Measurement** (Pro):

```typescript
async function measureLatency(): Promise<number> {
  const pings: number[] = [];

  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    await fetch("/api/speed-test/ping", { method: "HEAD" });
    const end = performance.now();
    pings.push(end - start);
  }

  return pings.reduce((a, b) => a + b) / pings.length;
}
```

### UI/UX Design

- **Large Speedometer Gauge**: Animated circular gauge showing current speed
- **Test Progress**: Linear progress bar with % complete
- **Live Stats Table**: Download/Upload/Latency updated in real-time
- **Start/Stop Button**: Large CTA button to begin test
- **History Cards**: Grid of previous test results (last 10)
- **Freemium Paywall**: Banner showing Pro features with upgrade CTA
- **Server Selector**: Dropdown to choose test server location

### SEO Keywords

- speed test online
- internet speed test
- check internet speed
- bandwidth test
- network speed checker
- upload speed test

---

## 3. Clipboard Formatter 📋

### Description

Automatically format and clean pasted text using smart detection. Remove unwanted formatting, fix whitespace, and apply transformations instantly on paste.

### Key Features

- **Smart Format Detection**: Auto-detect JSON, Markdown, code, plain text
- **Whitespace Cleanup**: Remove extra spaces, tabs, newlines
- **Line Break Normalization**: Convert Windows/Mac/Unix line endings
- **Tab to Spaces**: Convert tabs to configurable spaces (2/4/8)
- **Case Transformations**: Quick buttons for upper/lower/title/sentence case
- **Trim Lines**: Remove leading/trailing whitespace per line
- **Remove Empty Lines**: Filter out blank lines
- **Format on Paste**: Automatic formatting when pasting (toggle)
- **History**: Save last 5 formatted clipboard items

### Technical Stack

```typescript
// No dependencies needed
- navigator.clipboard API (Clipboard API)
- String manipulation functions
- localStorage for history
```

### Implementation Details

**Clipboard API Integration**:

```typescript
interface ClipboardFormatter {
  autoFormat: boolean;
  tabSize: 2 | 4 | 8;
  removeEmptyLines: boolean;
  trimLines: boolean;
  normalizeLineBreaks: boolean;
}

// Listen for paste events
useEffect(() => {
  const handlePaste = async (e: ClipboardEvent) => {
    if (!settings.autoFormat) return;

    e.preventDefault();
    const text = await navigator.clipboard.readText();
    const formatted = formatText(text, settings);

    setFormattedText(formatted);
    trackToolEvent("clipboard_auto_format", { length: text.length });
  };

  window.addEventListener("paste", handlePaste);
  return () => window.removeEventListener("paste", handlePaste);
}, [settings]);

// Format function
function formatText(text: string, settings: ClipboardFormatter): string {
  let result = text;

  // Normalize line breaks
  if (settings.normalizeLineBreaks) {
    result = result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  // Convert tabs to spaces
  result = result.replace(/\t/g, " ".repeat(settings.tabSize));

  // Trim lines
  if (settings.trimLines) {
    result = result
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }

  // Remove empty lines
  if (settings.removeEmptyLines) {
    result = result
      .split("\n")
      .filter((line) => line.length > 0)
      .join("\n");
  }

  return result;
}
```

**Smart Detection**:

```typescript
function detectFormat(text: string): "json" | "markdown" | "code" | "plain" {
  // Try parse JSON
  try {
    JSON.parse(text);
    return "json";
  } catch {}

  // Check for markdown patterns
  if (/^#{1,6}\s/.test(text) || /\*\*.*\*\*/.test(text)) {
    return "markdown";
  }

  // Check for code patterns
  if (/^(function|const|let|var|class|import|export)\s/.test(text)) {
    return "code";
  }

  return "plain";
}
```

### UI/UX Design

- **Two-Column Layout**: Original (left) and Formatted (right)
- **Settings Panel**: Toggles for all formatting options
- **Quick Actions Bar**: Buttons for case transformations
- **Paste Target Area**: Large textarea with "Paste here" placeholder
- **Copy Button**: One-click copy of formatted text
- **History Sidebar**: Collapsible list of last 5 clipboard items
- **Format Preview**: Show diff/changes made by formatter

### SEO Keywords

- clipboard formatter
- text formatter
- paste formatter
- whitespace cleaner
- text cleaner online
- format pasted text

---

## 4. File Metadata Inspector 🔍

### Description

Inspect file metadata without uploading to a server. All analysis happens client-side using the File API. View MIME type, size, hashes, and technical properties.

### Key Features

- **MIME Type Detection**: Accurate MIME type from file signature
- **File Hash**: Calculate MD5, SHA-1, SHA-256, SHA-512
- **Size Analysis**: Display size in bytes, KB, MB, GB with formatting
- **Creation/Modified Date**: Show file timestamps
- **Image Metadata**: For images, show dimensions, color space, DPI
- **Video Metadata**: For videos, show duration, codec, bitrate
- **Audio Metadata**: For audio, show duration, bitrate, sample rate
- **Hex Viewer**: View first 1KB of file in hexadecimal
- **No Upload**: All processing happens locally in browser
- **Batch Mode**: Inspect multiple files at once

### Technical Stack

```typescript
// Core dependencies
- crypto-js: "^4.2.0"       // Hashing functions
- file-type: "^19.0.0"      // MIME detection from buffer
- exifr: "^7.1.3"           // EXIF/image metadata

// Browser APIs
- File API
- FileReader API
- SubtleCrypto API (native hashing)
```

### Implementation Details

**File Analysis Function**:

```typescript
interface FileMetadata {
  // Basic Info
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  mimeDetected: string; // From file signature
  lastModified: number;

  // Hashes
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;

  // Type-specific metadata
  image?: ImageMetadata;
  video?: VideoMetadata;
  audio?: AudioMetadata;

  // Hex preview
  hexPreview: string; // First 1KB
}

async function analyzeFile(file: File): Promise<FileMetadata> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Calculate hashes
  const [md5, sha256] = await Promise.all([
    calculateHash(arrayBuffer, "MD5"),
    calculateHash(arrayBuffer, "SHA-256"),
  ]);

  // Detect MIME from file signature
  const detectedType = await fileType.fromBuffer(uint8Array);

  // Extract type-specific metadata
  let imageMetadata: ImageMetadata | undefined;
  if (file.type.startsWith("image/")) {
    imageMetadata = await extractImageMetadata(file);
  }

  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatBytes(file.size),
    mimeType: file.type,
    mimeDetected: detectedType?.mime || "unknown",
    lastModified: file.lastModified,
    md5,
    sha256,
    imageMetadata,
    hexPreview: arrayToHex(uint8Array.slice(0, 1024)),
  };
}

// Native SubtleCrypto hashing
async function calculateHash(
  buffer: ArrayBuffer,
  algorithm: string
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

**Image Metadata Extraction**:

```typescript
interface ImageMetadata {
  width: number;
  height: number;
  colorSpace: string;
  dpi?: number;
  exif?: {
    make?: string;
    model?: string;
    dateTime?: string;
    gps?: { lat: number; lng: number };
  };
}

async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  // Use exifr library for comprehensive EXIF data
  const exif = await exifr.parse(file);

  // Get dimensions from Image element
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  return {
    width: img.width,
    height: img.height,
    colorSpace: "sRGB", // Default assumption
    exif: exif
      ? {
          make: exif.Make,
          model: exif.Model,
          dateTime: exif.DateTime,
          gps:
            exif.latitude && exif.longitude
              ? { lat: exif.latitude, lng: exif.longitude }
              : undefined,
        }
      : undefined,
  };
}
```

### UI/UX Design

- **Drag & Drop Zone**: Large file drop area with visual feedback
- **File Info Card**: Primary card showing basic file info
- **Hash Display**: Monospace font with copy buttons for each hash
- **Metadata Tabs**: Separate tabs for General, Hashes, Type-specific, Hex View
- **Batch List**: When multiple files uploaded, show list with expand/collapse
- **Progress Indicator**: For large files, show hash calculation progress
- **No Server Warning**: Badge showing "Processed locally - never uploaded"
- **Export Report**: Download full metadata as JSON

### SEO Keywords

- file metadata viewer
- file info tool
- file hash calculator
- mime type checker
- file inspector online
- exif viewer

---

## Implementation Timeline

### Phase 1: High Priority (Week 1-2)

**Goal**: Implement 3 free tools with core functionality

1. **Browser Fingerprint Viewer** (5 days)

   - Day 1-2: Integrate fingerprintjs, collect basic data
   - Day 3: Implement canvas/WebGL fingerprinting
   - Day 4: Build UI with category sections
   - Day 5: Add privacy score calculation and tips

2. **Clipboard Formatter** (4 days)

   - Day 1: Set up clipboard API listeners
   - Day 2: Implement formatting functions
   - Day 3: Build two-column UI with settings
   - Day 4: Add history and quick actions

3. **File Metadata Inspector** (5 days)
   - Day 1-2: Integrate file-type and exifr libraries
   - Day 3: Implement hash calculation with progress
   - Day 4: Build drag-drop UI with tabs
   - Day 5: Add batch mode and export

### Phase 2: Freemium Tool (Week 3)

**Goal**: Implement speed test with Pro upgrade path

4. **Network Speed Test (Lite)** (6 days)
   - Day 1: Set up API routes for test files
   - Day 2: Implement download/upload speed tests
   - Day 3: Build speedometer gauge UI
   - Day 4: Add localStorage history and charts
   - Day 5: Implement latency measurement (Pro feature)
   - Day 6: Add freemium paywall and upgrade flow

---

## Testing Strategy

### Unit Tests

```typescript
// Clipboard formatter tests
describe("formatText", () => {
  it("should remove extra whitespace", () => {
    const input = "hello    world";
    const result = formatText(input, { trimLines: true });
    expect(result).toBe("hello world");
  });

  it("should convert tabs to spaces", () => {
    const input = "hello\tworld";
    const result = formatText(input, { tabSize: 4 });
    expect(result).toBe("hello    world");
  });
});

// File inspector tests
describe("calculateHash", () => {
  it("should calculate correct SHA-256 hash", async () => {
    const buffer = new TextEncoder().encode("test");
    const hash = await calculateHash(buffer, "SHA-256");
    expect(hash).toBe(
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    );
  });
});
```

### Integration Tests

- Browser Fingerprint: Test on different browsers (Chrome, Firefox, Safari)
- Speed Test: Verify speed calculations with known file sizes
- Clipboard: Test auto-format on paste event
- File Inspector: Test with various file types (image, video, PDF)

### Browser Compatibility

- **Chrome/Edge**: Full support (primary target)
- **Firefox**: Test WebGL fingerprinting differences
- **Safari**: Test SubtleCrypto API compatibility
- **Mobile**: Test touch events and mobile clipboard

---

## Analytics Events

### Browser Fingerprint Viewer

```typescript
trackToolEvent("fingerprint_view", { uniqueness_score: 85 });
trackToolEvent("fingerprint_copy_field", { field: "canvas_hash" });
trackToolEvent("fingerprint_export", { format: "json" });
```

### Network Speed Test

```typescript
trackToolEvent("speed_test_start", { server: "us-east-1" });
trackToolEvent("speed_test_complete", {
  download_mbps: 150.5,
  upload_mbps: 25.3,
  latency_ms: 15,
});
trackToolEvent("speed_test_upgrade_click"); // Pro CTA
```

### Clipboard Formatter

```typescript
trackToolEvent("clipboard_paste", { text_length: 500 });
trackToolEvent("clipboard_format", {
  operations: ["trim", "remove_empty_lines"],
  format_detected: "json",
});
trackToolEvent("clipboard_copy_formatted");
```

### File Metadata Inspector

```typescript
trackToolEvent("file_inspect", {
  file_type: "image/jpeg",
  file_size_mb: 2.5,
  has_exif: true,
});
trackToolEvent("file_hash_calculate", { algorithms: ["md5", "sha256"] });
trackToolEvent("file_export_metadata", { format: "json" });
```

---

## SEO Optimization

### Meta Tags (per tool)

```typescript
// Browser Fingerprint
export const metadata: Metadata = generateToolMetadata({
  title: "Browser Fingerprint Viewer - Check Your Browser Tracking ID",
  description:
    "Discover your unique browser fingerprint. View canvas fingerprint, WebGL data, device info, and privacy score. Learn how websites track you across sessions.",
  keywords: [
    "browser fingerprint",
    "canvas fingerprint",
    "device fingerprint",
    "tracking detection",
    "privacy check",
  ],
  category: "development",
  path: "/tools/browser-fingerprint",
});
```

### Structured Data

Add `SoftwareApplication` schema to each tool page:

```json
{
  "@type": "SoftwareApplication",
  "name": "Browser Fingerprint Viewer",
  "applicationCategory": "DeveloperApplication",
  "offers": {
    "@type": "Offer",
    "price": "0"
  },
  "operatingSystem": "Web Browser"
}
```

---

## Future Enhancements

### Browser Fingerprint Viewer

- [ ] Compare fingerprints over time to detect changes
- [ ] Add fingerprint randomization suggestions
- [ ] Browser extension integration
- [ ] Share anonymous fingerprint data for research

### Network Speed Test

- [ ] WebRTC-based peer speed test
- [ ] Detailed packet loss visualization
- [ ] ISP comparison database
- [ ] VPN speed comparison

### Clipboard Formatter

- [ ] Code language auto-detection with syntax highlighting
- [ ] Markdown to HTML preview
- [ ] Regular expression find-replace
- [ ] Custom formatting rules (user-defined)

### File Metadata Inspector

- [ ] PDF metadata extraction (author, title, keywords)
- [ ] Document structure analysis
- [ ] Malware signature detection (ClamAV integration)
- [ ] Batch hash verification against known databases

---

## Notes

**Browser Compatibility**: All tools require modern browsers with:

- Clipboard API (Chrome 66+, Firefox 63+, Safari 13.1+)
- SubtleCrypto API (universal support)
- File API (universal support)
- fingerprintjs (universal support)

**Privacy Considerations**:

- Browser Fingerprint tool includes educational content about privacy
- No data sent to server - all processing client-side
- Clear privacy notices on each tool page

**Freemium Strategy**:

- Speed Test is only freemium tool in this set
- Pro tier adds advanced metrics and cloud sync
- Upgrade CTA after each test with "See detailed insights" message
- Monthly subscription: $4.99/month or $39.99/year

**Documentation**:

- Each tool will get dedicated docs page explaining use cases
- FAQ sections for common questions
- Privacy tips and best practices
- API documentation for developers

---

## Completion Checklist

### Browser Fingerprint Viewer

- [ ] Integrate fingerprintjs library
- [ ] Implement canvas fingerprinting
- [ ] Implement WebGL fingerprinting
- [ ] Build category sections UI
- [ ] Add privacy score calculation
- [ ] Add copy and export functions
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation
- [ ] Add FAQ schema for SEO

### Network Speed Test (Lite)

- [ ] Set up API routes for test files
- [ ] Implement download speed test
- [ ] Implement upload speed test
- [ ] Build speedometer gauge UI
- [ ] Add real-time graph
- [ ] Implement localStorage history
- [ ] Add freemium paywall
- [ ] Implement latency measurement (Pro)
- [ ] Write unit tests
- [ ] Add analytics events

### Clipboard Formatter

- [ ] Set up clipboard API listeners
- [ ] Implement formatting functions
- [ ] Build two-column layout
- [ ] Add settings panel
- [ ] Implement history feature
- [ ] Add case transformation buttons
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation

### File Metadata Inspector

- [ ] Integrate file-type library
- [ ] Integrate exifr library
- [ ] Implement hash calculation
- [ ] Build drag-drop UI
- [ ] Add metadata tabs
- [ ] Implement batch mode
- [ ] Add hex viewer
- [ ] Add export function
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation
