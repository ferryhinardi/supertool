# 03 - QR Code Generator

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Productivity Tools  
**Status:** ✅ Active · ⭐ New

## Overview

The QR Code Generator is a versatile tool for creating customizable QR codes for multiple data types. Whether you need to share URLs, text, WiFi credentials, or contact information, this tool generates high-quality QR codes instantly that can be scanned by any smartphone.

## Purpose

QR codes bridge the physical and digital worlds, making information instantly accessible via smartphone cameras. This tool eliminates the need for third-party services, providing a fast, privacy-focused, client-side solution for QR code generation.

## Key Features

### 1. **Multiple QR Code Types**

- **URL**: Website links and landing pages
- **Plain Text**: Messages, notes, serial numbers
- **WiFi**: Network credentials for easy connection
- **vCard**: Contact information (digital business card)

### 2. **Customization Options**

- **Size**: 128px to 512px
- **Colors**: Foreground and background color picker
- **Error Correction**: Low, Medium, Quartile, High levels
- **Border**: Include/exclude quiet zone

### 3. **Live Preview**

- Real-time QR code generation
- Instant visual feedback
- See changes as you type

### 4. **Export Formats**

- **PNG**: Raster image download
- **SVG**: Vector graphic (scalable)
- Copy QR code data to clipboard

### 5. **Specialized Configs**

#### WiFi QR Codes

- SSID (network name)
- Password
- Encryption type (WPA/WEP/Open)
- Hidden network support

#### vCard QR Codes

- First & last name
- Organization/company
- Phone number
- Email address
- Website URL
- Physical address

## How It Works

### Technical Implementation

#### Core Library

Uses `qrcode.react` for QR code generation:

```typescript
<QRCodeSVG
  value={qrValue}
  size={size}
  bgColor={bgColor}
  fgColor={fgColor}
  level={errorCorrection}
  includeMargin={includeMargin}
/>
```

#### Type-Based Data Encoding

**URL Mode:**

```typescript
const qrValue = urlInput // Direct URL
```

**WiFi Mode:**

```typescript
const qrValue = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`
```

**vCard Mode:**

```typescript
const qrValue = `BEGIN:VCARD
VERSION:3.0
FN:${firstName} ${lastName}
ORG:${organization}
TEL:${phone}
EMAIL:${email}
URL:${website}
ADR:${address}
END:VCARD`
```

#### Export Functionality

**PNG Download:**

```typescript
const canvas = document.createElement('canvas')
const svg = qrCodeRef.current.querySelector('svg')
// Convert SVG to canvas
const ctx = canvas.getContext('2d')
const img = new Image()
img.onload = () => {
  canvas.toBlob((blob) => {
    saveAs(blob, 'qrcode.png')
  })
}
```

**SVG Download:**

```typescript
const svgData = new XMLSerializer().serializeToString(svg)
const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
saveAs(svgBlob, 'qrcode.svg')
```

### State Management

```typescript
const [type, setType] = useState<QRCodeType>('url')
const [size, setSize] = useState(256)
const [fgColor, setFgColor] = useState('#000000')
const [bgColor, setBgColor] = useState('#ffffff')
const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
const [includeMargin, setIncludeMargin] = useState(true)
```

Type-specific states for WiFi and vCard configurations.

## Usage Instructions

### Creating a URL QR Code

1. **Select "URL" type** from tabs
2. **Enter website URL** (e.g., https://example.com)
3. **Customize appearance**:
   - Adjust size slider
   - Change colors (foreground/background)
   - Set error correction level
4. **Preview updates** automatically
5. **Download as PNG or SVG**

### Creating a WiFi QR Code

1. **Select "WiFi" type**
2. **Enter network name** (SSID)
3. **Enter password**
4. **Select encryption** (WPA recommended)
5. **Toggle hidden network** if applicable
6. Users scan to auto-connect!

### Creating a vCard QR Code

1. **Select "vCard" type**
2. **Fill in contact details**:
   - Name fields
   - Organization
   - Phone, email, website
   - Address
3. **Download QR code**
4. Share as digital business card

### Creating a Text QR Code

1. **Select "Text" type**
2. **Type or paste content**
3. **Customize design**
4. **Export and share**

## Error Correction Levels

QR codes have built-in error correction for damaged or partially obscured codes:

| Level            | Error Recovery | Use Case                             |
| ---------------- | -------------- | ------------------------------------ |
| **L (Low)**      | ~7%            | Clean environments, digital displays |
| **M (Medium)**   | ~15%           | General purpose (default)            |
| **Q (Quartile)** | ~25%           | Outdoor use, printed materials       |
| **H (High)**     | ~30%           | Industrial use, extreme conditions   |

Higher error correction = more data redundancy = larger QR code.

## Analytics Events

Tracked user interactions:

- `qr_code_type_change` - QR type switched
- `qr_code_download` - QR downloaded (PNG/SVG)
- `qr_code_copy` - Data copied to clipboard

Includes anonymized data (type, size) but no personal information.

## UI/UX Design

### Layout

1. **Type Selector** - Tab navigation for QR types
2. **Input Section** - Type-specific form fields
3. **Preview Card** - Live QR code display
4. **Customization Panel** - Size, colors, settings
5. **Export Buttons** - Download/copy actions

### Visual Design

- **Gradient**: Violet to purple (tech/digital theme)
- **Responsive Grid**: Desktop 2-column, mobile stacked
- **Live Updates**: No "generate" button needed
- **Color Pickers**: Native color inputs
- **Badges**: "NEW" indicator on homepage

### Accessibility

- Tab navigation between types
- Keyboard-accessible all controls
- High contrast default colors
- Clear labels for all inputs
- Screen reader friendly

## QR Code Best Practices

### Size Guidelines

- **Business Cards**: 256-384px
- **Posters/Flyers**: 512px+
- **Digital Displays**: 256px
- **Product Labels**: 128-256px

### Color Considerations

⚠️ **Important**:

- Foreground must be **darker** than background
- Maintain high contrast for scanability
- Avoid red on black (camera issues)
- Test before mass printing

### Data Limits

QR codes have maximum data capacity:

- **URL**: ~2,000 characters
- **Text**: ~4,296 characters
- **WiFi**: ~100 characters
- **vCard**: ~500 characters

Larger data = denser QR code = harder to scan.

## Real-World Applications

### Business Use

- Digital business cards
- Product packaging
- Marketing materials
- Event tickets
- Menu ordering

### Personal Use

- WiFi guest access
- Contact sharing
- Social media links
- Gift card messages

### Technical Use

- API documentation
- Git repository links
- Issue tracking
- Configuration files
- Serial numbers

## Privacy & Security

✅ **Client-Side Only**: All QR generation happens in browser  
✅ **No Data Storage**: Nothing saved on servers  
✅ **No Tracking**: Scans are not monitored  
⚠️ **Public QR Codes**: Don't embed sensitive data in public QR codes  
⚠️ **WiFi Passwords**: Only share with trusted individuals

## Performance

- **Instant Generation**: Real-time rendering
- **No API Calls**: Zero network latency
- **Lightweight**: Small library footprint
- **Browser-Native**: Uses HTML Canvas API

## Dependencies

- `qrcode.react` - QR code SVG generation
- `lucide-react` - UI icons
- `sonner` - Toast notifications

## File Structure

```
app/tools/qr-code/
├── page.tsx              # Main component (729 lines)
└── __tests__/
    └── logic.test.ts     # QR generation tests
```

## Future Enhancements

- [ ] Logo embedding in QR center
- [ ] Batch QR generation
- [ ] QR code templates/presets
- [ ] Analytics/tracking QR codes
- [ ] Dynamic QR codes (editable links)
- [ ] QR code scanner (decode)
- [ ] Frame/border designs
- [ ] Gradient QR codes

## Common Issues & Solutions

**Problem**: QR code won't scan  
**Solution**: Increase size, improve contrast, raise error correction level

**Problem**: Too much data  
**Solution**: Use URL shortener, reduce vCard fields, split into multiple codes

**Problem**: Colors not working  
**Solution**: Ensure dark foreground, light background, high contrast

## Testing Tips

✓ Test on multiple devices  
✓ Try different lighting conditions  
✓ Test from various distances  
✓ Verify all URLs before mass printing  
✓ Use error correction level Q or H for prints

## Related Tools

- **URL Shortener** - Create short URLs for QR codes
- **Base64 Encoder** - Embed small images in QR data
- **Text Transformer** - Format text before encoding

---

**Route:** `/tools/qr-code`  
**Component:** `app/tools/qr-code/page.tsx`  
**Tests:** `app/tools/qr-code/__tests__/logic.test.ts`
