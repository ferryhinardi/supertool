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

---

## User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/productivity/qr-code`  
**Complexity**: Complex  
**Category**: Productivity Tools

### Overview

The QR Code Generator is a comprehensive tool for creating, customizing, and managing QR codes. It supports 12+ content types (URLs, WiFi, vCards, emails, and more), offers extensive styling options, includes a built-in scanner, and features history tracking with favorites.

### Key Features

- **12+ Content Types**: URL, Text, WiFi, vCard, Email, SMS, Phone, WhatsApp, Geo Location, Events, App Store, Social Media
- **Advanced Styling**: 10+ color presets, custom colors, corner styles, dot styles
- **Logo Embedding**: Add custom logos/images to QR codes
- **Multiple Export Formats**: PNG, JPEG, WebP, SVG, PDF
- **Built-in Scanner**: Scan QR codes from webcam or file upload
- **History & Favorites**: Save and organize generated QR codes
- **Bulk Export**: Export multiple codes as ZIP
- **Print Templates**: Business cards, labels, posters
- **Real-time Preview**: See changes instantly
- **Error Correction**: L, M, Q, H levels for reliability

### How to Use

#### Generating a Basic QR Code

##### Step 1: Select Type
Choose your QR code type from the grid:
- **URL**: Website links
- **Text**: Plain text messages
- **WiFi**: Network credentials
- **vCard**: Contact information
- And 8 more types...

##### Step 2: Enter Content
Fill in the required fields based on your selected type.

**Example - URL:**
```
https://supertool.app
```

##### Step 3: Customize (Optional)
- **Color Preset**: Choose from 10 beautiful presets
- **Custom Colors**: Set foreground and background colors
- **Size**: Adjust QR code dimensions
- **Logo**: Upload your logo (max 2MB)

##### Step 4: Download
Click "Download QR Code" and select your format:
- **PNG**: Best for web and print (recommended)
- **JPEG**: Smaller file size
- **WebP**: Modern format with great compression
- **SVG**: Vector format for scalability
- **PDF**: Ready for printing

#### Creating Specialized QR Codes

##### WiFi QR Code
Perfect for sharing network credentials.

**Fields:**
- Network Name (SSID)
- Password
- Encryption type (WPA/WEP/None)
- Hidden network toggle

**Example:**
```
SSID: MyHomeNetwork
Password: SecurePass123
Encryption: WPA
Hidden: No
```

Scan with smartphone → Auto-connect to WiFi!

##### vCard (Contact) QR Code
Share contact information instantly.

**Fields:**
- First/Last Name
- Organization
- Phone number
- Email address
- Website
- Physical address

**Example:**
```
John Doe
ABC Corporation
(555) 123-4567
john@example.com
https://example.com
123 Main St, City, State 12345
```

Scan with smartphone → Add to contacts!

##### Email QR Code
Pre-fill email compose fields.

**Fields:**
- To (email address)
- Subject line
- Body (message)

**Example:**
```
To: support@supertool.app
Subject: Feature Request
Body: I'd like to suggest...
```

Scan → Opens email app with pre-filled fields!

##### Event QR Code
Share calendar events.

**Fields:**
- Event title
- Location
- Start date/time
- End date/time
- Description

**Example:**
```
Title: Team Meeting
Location: Conference Room A
Start: 2026-01-15 10:00 AM
End: 2026-01-15 11:00 AM
Description: Quarterly planning session
```

Scan → Add to calendar!

##### Geo Location QR Code
Share map coordinates or addresses.

**Fields:**
- Latitude
- Longitude
- OR formatted address

**Example:**
```
40.7128° N, 74.0060° W
(New York City)
```

Scan → Open in maps app!

#### Customizing QR Code Appearance

##### Color Presets
Choose from 10 professionally designed color schemes:
- **Classic**: Black on white (traditional)
- **Modern**: Blue gradient
- **Branded**: Purple/pink theme
- **Minimalist**: Gray tones
- **Professional**: Navy blue
- **Vibrant**: Bright colors
- **Ocean**: Blue/teal gradient
- **Sunset**: Orange/pink gradient
- **Forest**: Green tones
- **Neon**: High contrast bright colors

##### Custom Colors
Set exact colors using hex codes or color picker:
- **Foreground**: QR code pattern color
- **Background**: Canvas background color

**Best Practices:**
- High contrast (dark on light or light on dark)
- Avoid similar colors (affects scanability)
- Test scannability after customization

##### Corner Styles
Change the style of corner markers:
- **Square**: Traditional sharp corners
- **Rounded**: Slightly rounded
- **Extra-Rounded**: Very round, modern look
- **Dot**: Circular dots

##### Dot Styles
Customize individual data points:
- **Square**: Standard squares
- **Rounded**: Rounded squares
- **Dots**: Circular dots
- **Classy**: Elegant rounded style

##### Adding Logos
Enhance brand recognition:

1. Click "Upload Logo"
2. Select image (PNG, JPG, WebP)
3. Max file size: 2MB
4. Recommended: Square images, transparent background
5. Logo size auto-adjusts for scannability

**Logo Tips:**
- Use simple, recognizable logos
- Ensure high contrast with QR code
- Test scanning after adding logo
- Logos should be 10-20% of QR size

#### Using the QR Code Scanner

##### Scan from Webcam

1. Switch to "Scanner" tab
2. Click "Start Camera"
3. Allow camera permissions
4. Point camera at QR code
5. Scanner auto-detects and decodes

**Supported:**
- Desktop webcams
- Laptop cameras
- Mobile device cameras

##### Scan from File

1. Click "Upload Image"
2. Select image containing QR code
3. Tool automatically detects and decodes
4. Results displayed instantly

**Supported Formats:**
- PNG, JPEG, WebP, GIF
- Max file size: 10MB

##### Scanner Results
After scanning, view:
- Decoded content
- QR code type (URL, WiFi, etc.)
- Validation status
- Action buttons (Open URL, Copy, Save, etc.)

#### Managing History

##### Saving QR Codes
Every generated QR code is automatically saved to history (last 100).

##### Viewing History
1. Click "History" tab
2. Browse all generated codes
3. Filter by type or search by content
4. Sort by date

##### Favorite QR Codes
- Click the star icon on any QR code
- Access favorites quickly from filter
- Never lost in history

##### Deleting History
- Delete individual items: Click trash icon
- Clear all history: Click "Clear All" button

##### Exporting History
Export all your QR codes:
1. Click "Export History"
2. Choose format: JSON (data) or ZIP (images)
3. Download archive

##### Importing History
Restore from backup:
1. Click "Import History"
2. Select exported JSON file
3. History is merged (no duplicates)

### Use Cases

#### Use Case 1: Restaurant Menu
Create touchless menus for tables.

**Solution:**
1. Generate URL QR code pointing to online menu
2. Customize with restaurant colors/logo
3. Export as PDF
4. Print as table tent cards
5. Customers scan to view menu

#### Use Case 2: Event Check-in
Streamline event registration.

**Solution:**
1. Generate unique QR codes for each attendee
2. Include vCard with attendee info
3. Export as PDF with print template
4. Email/print tickets
5. Scan at entrance for check-in

#### Use Case 3: Product Packaging
Add smart features to physical products.

**Solution:**
1. Generate URL to product manual/support
2. Add company logo for branding
3. Export as high-res PNG
4. Include in product packaging design
5. Customers scan for instant support

#### Use Case 4: WiFi Guest Access
Share network credentials easily.

**Solution:**
1. Generate WiFi QR code
2. Include SSID and password
3. Print as card or poster
4. Place in reception/guest areas
5. Guests scan to auto-connect

#### Use Case 5: Business Cards
Modernize networking.

**Solution:**
1. Generate vCard QR code
2. Include all contact details
3. Customize with brand colors
4. Add to business card design
5. Contacts scan to save info instantly

#### Use Case 6: Real Estate Listings
Provide instant property information.

**Solution:**
1. Generate URL to property details
2. Include geo location QR for directions
3. Print on yard signs
4. Buyers scan for virtual tour/info
5. Track engagement via URL analytics

### Tips & Tricks

#### Scannability Best Practices
- **High Contrast**: Dark on light backgrounds
- **Minimum Size**: At least 2cm x 2cm for print
- **Quiet Zone**: 4-module white border around QR code
- **Error Correction**: Use "H" (highest) for logos or damage resistance
- **Test Before Printing**: Scan with multiple devices

#### Size Recommendations
- **Business Cards**: 1.5cm - 2cm square
- **Flyers/Posters**: 3cm - 5cm square
- **Billboards**: 30cm+ (view distance)
- **Digital Screens**: 200-300px
- **Packaging**: Based on package size

#### Print Quality
- **Resolution**: Minimum 300 DPI
- **Format**: SVG (scalable) or high-res PNG
- **Paper**: Matte finish reduces glare
- **Color**: CMYK mode for professional printing
- **Testing**: Print test page before mass production

#### Content Optimization
- **URLs**: Use short links for cleaner QR codes
- **Text**: Keep messages concise (< 300 chars)
- **WiFi**: Use WPA encryption (most compatible)
- **vCards**: Include only essential info
- **Events**: Use standard datetime formats

#### Logo Integration
- **File Type**: PNG with transparency preferred
- **Size**: Logo should be 10-20% of QR size
- **Position**: Centered for best results
- **Error Correction**: Set to "H" when using logos
- **Testing**: Always test scannability

#### Error Correction Levels
- **L (Low - 7%)**: Basic, smallest QR codes
- **M (Medium - 15%)**: Standard, most common
- **Q (Quartile - 25%)**: Good, for minor damage
- **H (High - 30%)**: Best, for logos/heavy customization

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + G | Generate QR code |
| Ctrl/Cmd + D | Download QR code |
| Ctrl/Cmd + C | Copy QR to clipboard |
| Ctrl/Cmd + S | Save to history |
| Ctrl/Cmd + K | Open scanner |
| Escape | Close dialogs |
| Tab | Navigate fields |

### Troubleshooting

#### Issue: QR Code Won't Scan
**Causes**: Low contrast, too small, damaged, or poor lighting

**Solutions**:
- Increase size (min 2cm x 2cm)
- Use higher contrast colors
- Increase error correction level
- Remove or simplify logo
- Ensure adequate lighting when scanning
- Test with multiple scanner apps

#### Issue: Logo Makes Code Unscannable
**Cause**: Logo too large or low contrast

**Solution**:
- Reduce logo size (< 20% of QR)
- Use simpler logo design
- Increase error correction to "H"
- Ensure logo has good contrast
- Test on multiple devices

#### Issue: WiFi QR Not Connecting
**Cause**: Incorrect credentials or encryption type

**Solution**:
- Double-check SSID (case-sensitive)
- Verify password accuracy
- Confirm encryption type (WPA/WEP)
- Some Android devices need WiFi QR reader app
- Check "Hidden network" setting

#### Issue: vCard Not Adding to Contacts
**Cause**: Missing required fields or format issues

**Solution**:
- Include at least name and one contact method
- Check phone number format (include country code)
- Use valid email addresses
- Some devices need dedicated vCard reader app

#### Issue: Download Produces Blurry Images
**Cause**: Low resolution or wrong format

**Solution**:
- Increase QR code size before exporting
- Use PNG or SVG (not JPEG)
- For print, use SVG for infinite scalability
- Set DPI to 300+ for print

#### Issue: History Not Saving
**Cause**: Browser storage limit or privacy mode

**Solution**:
- Check browser storage settings
- Clear some history to free space
- Disable private/incognito mode
- Enable cookies and local storage
- Try different browser

#### Issue: Scanner Not Detecting Code
**Cause**: Camera permissions, focus, or lighting

**Solution**:
- Grant camera permissions
- Ensure good lighting
- Hold steady for auto-focus
- Clean camera lens
- Try uploading image instead

### Technical Details

#### For Developers

**Libraries Used:**
- `qrcode.react` - QR code generation
- `html5-qrcode` - Webcam scanning
- `jszip` - Bulk export compression

**Content Type Formats:**

**URL:**
```
https://example.com
```

**WiFi:**
```
WIFI:T:WPA;S:NetworkName;P:password;H:false;;
```

**vCard:**
```
BEGIN:VCARD
VERSION:3.0
FN:John Doe
ORG:Company
TEL:+15551234567
EMAIL:john@example.com
END:VCARD
```

**Email:**
```
mailto:email@example.com?subject=Subject&body=Message
```

**SMS:**
```
SMSTO:+15551234567:Message text
```

**Phone:**
```
tel:+15551234567
```

**Geo:**
```
geo:40.7128,-74.0060?q=Empire State Building
```

**Event (iCal):**
```
BEGIN:VEVENT
SUMMARY:Event Title
LOCATION:Location
DTSTART:20260115T100000
DTEND:20260115T110000
END:VEVENT
```

**Error Correction:**
- L: 7% data recovery
- M: 15% data recovery
- Q: 25% data recovery
- H: 30% data recovery

**Size Limits:**
- Numeric: 7,089 characters (L)
- Alphanumeric: 4,296 characters (L)
- Binary: 2,953 bytes (L)
- Kanji: 1,817 characters (L)

*Higher error correction reduces capacity*

**Browser Compatibility:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (camera support varies)

**Performance:**
- Generation: < 100ms
- Scanning: Real-time (30+ FPS)
- Export: < 500ms for PNG/JPEG
- Bulk export: ~1s per 10 codes

**Privacy:**
- All processing client-side
- No data sent to servers
- History stored in browser localStorage
- Camera stream never recorded

### Related Tools

- **[QR Code Scanner](/tools/media/qr-code-scanner)** - Dedicated scanning tool
- **[URL Shortener](/tools/productivity/url-shortener)** - Shorten URLs for cleaner QR codes
- **[vCard Generator](/tools/productivity/vcard-generator)** - Create detailed contact cards
- **[Image Optimizer](/tools/media/image-optimizer)** - Optimize logos for QR codes
- **[PDF Tools](/tools/productivity/pdf-tools)** - Create printable QR sheets

### Frequently Asked Questions

**Q: How long do QR codes last?**  
A: Forever! QR codes are not time-limited. However, the URL they point to must remain active.

**Q: Can I track how many times my QR code is scanned?**  
A: Use a URL shortener with analytics or tracking parameters in your URLs.

**Q: What's the best error correction level?**  
A: Use "M" (15%) for standard codes, "H" (30%) for codes with logos or potential damage.

**Q: Can I make QR codes with images/gradients?**  
A: Solid colors are recommended for best scannability. Test thoroughly if using gradients.

**Q: Why won't my WiFi QR code work on iPhone?**  
A: iOS 11+ supports WiFi QR codes natively in the Camera app. Ensure format is correct.

**Q: Can I edit a QR code after printing?**  
A: No, QR codes are static. Use dynamic QR codes (URL redirects) for editable content.

**Q: What's the smallest printable size?**  
A: 2cm x 2cm minimum for reliable scanning. Larger is better for viewing distances.

**Q: Can QR codes be colored?**  
A: Yes, but maintain high contrast. Test scannability with target devices.

**Q: Do QR codes expire?**  
A: No, but the content they link to may become unavailable.

**Q: Can I password-protect a QR code?**  
A: QR codes themselves can't be protected. Use a URL pointing to password-protected content.

### Best Practices

1. **Always test before mass production** - Scan with multiple devices
2. **Use high contrast** - Dark foreground, light background
3. **Include adequate margins** - 4-module quiet zone
4. **Choose appropriate error correction** - H for logos, M for standard
5. **Keep URLs short** - Reduces complexity, improves scannability
6. **Size appropriately** - Minimum 2cm, larger for distance
7. **Provide context** - Add "Scan me" text near code
8. **Test in target environment** - Lighting, distance, surface
9. **Track engagement** - Use analytics-enabled URLs
10. **Keep content updated** - Use redirects for flexibility

### Changelog

**v2.0** (Current)
- Added 12 content types
- Built-in scanner with webcam support
- History with favorites
- 10 style presets
- Logo embedding
- Multiple export formats
- Print templates
- Bulk export

**v1.0**
- Basic URL QR generation
- Simple color customization
- PNG export
