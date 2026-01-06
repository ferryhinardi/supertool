# QR Code Generator

**Created**: January 6, 2026  
**Last Updated**: January 6, 2026  
**Tool Path**: `/tools/productivity/qr-code`  
**Category**: Productivity Tools  
**Complexity**: Complex

## Overview

The QR Code Generator is a comprehensive tool for creating customizable QR codes supporting 12 different data types including URLs, text, WiFi credentials, contact cards (vCard), emails, SMS, phone numbers, WhatsApp messages, location coordinates, calendar events, app store links, and social media profiles. Features include 10 style presets, logo embedding, bulk generation, QR code scanning, history management, and export to multiple formats (PNG, SVG, JPEG, WebP, PDF).

## Key Features

- **12 QR Code Types**: URL, Text, WiFi, vCard, Email, SMS, Phone, WhatsApp, Geo Location, Event, App Store, Social Media
- **10 Style Presets**: Classic, Modern, Branded, Minimalist, Professional, Vibrant, Ocean, Sunset, Forest, Neon
- **Custom Logo Support**: Upload logos with adjustable size, opacity, position, and mask options (circle, square, rounded)
- **Bulk Generation**: Upload CSV to generate up to 500 QR codes at once, download as ZIP
- **QR Code Scanner**: Scan QR codes via webcam or file upload with automatic data parsing
- **History Management**: Save, favorite, search, filter, import/export history (last 100+ entries)
- **Multiple Export Formats**: PNG, SVG, JPEG, WebP, PDF with customizable DPI and quality
- **Print Templates**: Export to PDF with various print templates for labels and stickers
- **Scan Analytics**: Optional tracking URLs to monitor QR code scans
- **Scannability Validation**: Check QR code quality and get improvement suggestions
- **Client-Side Processing**: All generation happens locally - no data sent to servers

## Supported QR Code Types

| Type | Icon | Description | Data Encoded |
|------|------|-------------|--------------|
| URL | Link | Website links | HTTP/HTTPS URLs |
| Text | FileText | Plain text | Any text content |
| WiFi | Wifi | Network credentials | SSID, password, encryption |
| vCard | Contact | Contact information | Name, phone, email, address, org |
| Email | Mail | Email address | To, subject, body |
| SMS | MessageSquare | Text message | Phone number, message |
| Phone | Phone | Phone number | Dialable phone number |
| WhatsApp | MessageSquare | WhatsApp chat | Phone number, message |
| Geo | MapPin | GPS coordinates | Latitude, longitude, label |
| Event | Calendar | Calendar event | Title, location, date/time, description |
| App Store | ShoppingBag | App download | iOS/Android app ID |
| Social | Globe | Social profile | Platform, username/handle |

## How to Use

### Create a Basic QR Code

1. Navigate to the QR Code Generator tool
2. Select a **QR Code Type** from the grid (URL is default)
3. Enter the required content for your selected type
4. Preview the QR code in real-time on the right panel
5. Click **Download PNG** or **Download SVG** to save

### Add a Custom Logo

1. Scroll to the styling section
2. Click **Upload Logo** and select an image (max 5MB)
3. Adjust logo settings:
   - **Size**: 10-50% of QR code
   - **Opacity**: 0-100%
   - **Position**: Center (default)
   - **Mask**: None, Circle, Square, Rounded
4. The QR code updates in real-time with your logo

### Apply Style Presets

1. Choose from 10 style presets:
   - **Classic**: Black and white, square corners
   - **Modern**: Purple gradient, rounded corners
   - **Branded**: For corporate use with frames
   - **Minimalist**: Clean, dot pattern
   - **Professional**: Dark slate, business-ready
   - **Vibrant**: Orange/red gradient, bold
   - **Ocean**: Blue/cyan gradient
   - **Sunset**: Orange gradient
   - **Forest**: Green gradient
   - **Neon**: Purple/pink with frame
2. Presets automatically update colors and styling

### Bulk Generation

1. Click **Bulk Mode** to expand the section
2. Download the sample CSV to see the format
3. Create your CSV with columns: `type, content, label, color`
4. Upload your CSV file (max 500 entries)
5. Click **Generate All** to create QR codes
6. Download as ZIP containing all PNG files

### Scan QR Codes

1. Click the **Scanner** tab/section
2. Choose scan method:
   - **Webcam**: Grant camera permission and point at QR code
   - **File Upload**: Select an image containing a QR code
3. View scanned data with automatic type detection
4. Copy or use the decoded information

### Manage History

1. Click **History** button to view saved QR codes
2. Features available:
   - Search by content
   - Filter by type
   - Sort by newest/oldest/favorites
   - Toggle favorites-only view
3. Click any history item to reload its configuration
4. Export history as JSON for backup
5. Import previously exported history

## Style Presets Reference

| Preset | Colors | Corner Style | Features |
|--------|--------|--------------|----------|
| Classic | Black/White | Square | None |
| Modern | Purple/Pink gradient | Rounded | Eye styling |
| Branded | Custom | Extra-rounded | Frame, eye styling |
| Minimalist | Black/White | Square | Dot pattern |
| Professional | Dark slate | Rounded | Frame, eye styling |
| Vibrant | Orange/Red gradient | Extra-rounded | Eye styling |
| Ocean | Blue/Cyan gradient | Rounded | Eye styling |
| Sunset | Orange gradient | Extra-rounded | Eye styling |
| Forest | Green gradient | Rounded | Eye styling |
| Neon | Purple/Pink gradient | Extra-rounded | Frame |

## Export Options

### Image Formats

| Format | Use Case | Options |
|--------|----------|---------|
| PNG | General use, web | DPI (72-600) |
| SVG | Print, scalable | Vector, infinite scaling |
| JPEG | Photos, smaller files | Quality (0-100%), DPI |
| WebP | Modern web | Quality (0-100%) |
| PDF | Print, documents | Print templates |

### Print Templates

- **None**: Plain QR code
- **Business Card**: Card layout with QR
- **Label Sheet**: Multiple QR codes per page
- **Poster**: Large format with title

## Use Cases

### 1. Restaurant Menus
Create WiFi QR codes for guests and URL codes linking to digital menus.

### 2. Business Cards
Generate vCard QR codes with full contact information for networking.

### 3. Event Marketing
Create event QR codes that add meetings/conferences directly to calendars.

### 4. Product Packaging
Link to product information, manuals, or support pages via URL codes.

### 5. Social Media Promotion
Generate social profile QR codes for Instagram, Twitter, TikTok, etc.

### 6. App Marketing
Create App Store/Play Store links for easy app downloads.

### 7. Location Sharing
Share exact GPS coordinates for stores, events, or meeting points.

### 8. Marketing Campaigns
Use bulk generation for unique QR codes on promotional materials.

## Tips & Tricks

### Optimal QR Code Size
- **Digital displays**: 200-400 pixels
- **Print materials**: Use SVG or 300+ DPI PNG
- **Minimum physical size**: 2cm x 2cm (0.8" x 0.8")

### Logo Best Practices
- Keep logo size under 30% of QR code area
- Use high-contrast colors
- Simple logos work better than complex ones
- Test scanning after adding logo

### Improving Scannability
- Use high contrast (dark on light)
- Ensure adequate quiet zone (white margin)
- Test with multiple scanner apps
- Use the built-in validation tool

### Bulk Generation Tips
- Maximum 500 QR codes per batch
- Use consistent type across batch for best results
- Include descriptive labels for organization
- Custom colors per item via CSV

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + C` | Copy QR code to clipboard |
| `Ctrl/Cmd + S` | Save to history |
| `Ctrl/Cmd + H` | Toggle history panel |
| `Ctrl/Cmd + R` | Reset form |
| `?` | Show keyboard shortcuts |

## Troubleshooting

### QR Code Won't Scan
**Causes**: Low contrast, too small, damaged print  
**Solutions**: Increase contrast, use larger size, enable quiet zone, test with validator

### Logo Breaks Scanning
**Cause**: Logo too large or low contrast  
**Solution**: Reduce logo size to <25%, increase QR code error correction

### Bulk Generation Fails
**Cause**: Invalid CSV format or too many items  
**Solution**: Use sample CSV as template, limit to 500 items per batch

### Webcam Scanner Not Working
**Cause**: Camera permissions denied  
**Solution**: Allow camera access in browser settings, try file upload instead

### Export Quality Poor
**Cause**: Low DPI or JPEG compression  
**Solution**: Use higher DPI (300+), SVG for print, or WebP for web

## Technical Details

### Libraries Used
- **qrcode.react**: QR code SVG generation (QRCodeSVG)
- **html5-qrcode**: Webcam and file-based QR scanning
- **JSZip**: Bulk download ZIP file creation
- **jsPDF**: PDF export functionality
- **Framer Motion**: UI animations
- **Sonner**: Toast notifications

### QR Code Encoding
- Error correction level: H (High, 30% recovery)
- Character encoding: UTF-8
- Version: Auto-selected based on content length

### Data Formats
- **WiFi**: `WIFI:T:{encryption};S:{ssid};P:{password};H:{hidden};`
- **vCard**: Standard vCard 3.0 format
- **Email**: `mailto:{to}?subject={subject}&body={body}`
- **SMS**: `sms:{phone}?body={message}`
- **Phone**: `tel:{number}`
- **Geo**: `geo:{lat},{long}?q={label}`

### Browser Compatibility
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Webcam scanner requires HTTPS

### Privacy & Security
- All QR generation is client-side
- No data transmitted to external servers
- History stored in browser localStorage
- Optional tracking uses URL shortener API

## Analytics Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `qr_code_download` | QR downloaded | `format`, `type`, `hasLogo` |
| `qr_code_copy` | QR copied to clipboard | `type`, `hasLogo` |
| `qr_bulk_generate` | Bulk generation started | `count` |
| `qr_batch_export` | Bulk export completed | `count` |
| `qr_logo_upload` | Logo uploaded | `fileType` |
| `qr_style_preset` | Style preset applied | `preset` |
| `qr_scanner_webcam_start` | Webcam scanner started | - |
| `qr_scanner_webcam_success` | Webcam scan successful | `dataType` |
| `qr_scanner_file_upload` | File scan started | - |
| `qr_scanner_file_success` | File scan successful | `dataType` |
| `qr_validate_run` | Validation started | - |
| `qr_validate_score` | Validation completed | `score` |
| `qr_history_save` | Saved to history | `type` |
| `qr_history_load` | Loaded from history | `type` |
| `qr_history_favorite` | Toggled favorite | - |
| `qr_history_delete` | Deleted from history | - |
| `qr_history_clear` | History cleared | - |
| `qr_history_export` | History exported | `count` |
| `qr_history_import` | History imported | `count` |
| `qr_tracking_enabled` | Scan tracking enabled | `type` |
| `qr_export_png_dpi` | PNG export with DPI | `dpi`, `type` |
| `qr_export_jpeg` | JPEG export | `quality`, `dpi`, `type` |
| `qr_export_webp` | WebP export | `quality`, `type` |
| `qr_export_pdf` | PDF export | `template`, `type` |

## Related Tools

- **[QR Code Scanner](/tools/productivity/qr-scanner)** - Dedicated QR scanner tool
- **[URL Shortener](/tools/productivity/url-shortener)** - Shorten URLs before encoding
- **[vCard Generator](/tools/productivity/vcard)** - Create contact cards
- **[Base64 Encoder](/tools/development/base64)** - Encode data for QR codes

## FAQ

**Q: How do I create a QR code for free?**  
A: Enter your data, customize the design, and click download. It's completely free with no watermarks or registration required.

**Q: What types of QR codes can I generate?**  
A: We support 12 types: URLs, text, WiFi, vCard contacts, email, SMS, phone, WhatsApp, geo location, calendar events, app store links, and social media profiles.

**Q: Can I customize the QR code design?**  
A: Yes! Customize colors, add your logo, choose from 10 style presets, adjust corner styles, and more while maintaining scannability.

**Q: Are the QR codes permanent?**  
A: Yes, static QR codes never expire. They work forever as long as the linked content remains accessible.

**Q: What's the best size for QR codes?**  
A: For digital use, 300-500 pixels. For print, use SVG or 300+ DPI PNG. Minimum physical size is 2cm x 2cm.

**Q: Why won't my QR code scan?**  
A: Common issues include low contrast, small size, or too-large logos. Use the built-in validation tool to check scannability.

**Q: Can I generate multiple QR codes at once?**  
A: Yes! Upload a CSV with up to 500 entries and download all QR codes as a ZIP file.

**Q: Is my data safe?**  
A: Yes. All processing happens in your browser. No data is sent to any server.

## Best Practices

1. Always test QR codes before printing or publishing
2. Use high contrast colors (dark foreground, light background)
3. Include adequate quiet zone (margin) around QR codes
4. Keep logos under 25% of QR code area
5. Use SVG for print materials to ensure quality at any size
6. Save important QR codes to history or export configurations
7. For URLs, consider using a URL shortener for shorter QR codes
8. Test with multiple scanning apps on different devices

## Changelog

### v1.0.0 (January 2026)
- Initial release
- 12 QR code types supported
- 10 style presets
- Custom logo with positioning and masking
- Bulk generation (up to 500 QR codes)
- QR code scanner (webcam and file)
- History management with favorites
- Multiple export formats (PNG, SVG, JPEG, WebP, PDF)
- Print templates for PDF export
- Optional scan analytics tracking
- Scannability validation tool
- Keyboard shortcuts
