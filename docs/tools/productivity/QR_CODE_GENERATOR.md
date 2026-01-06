# QR Code Generator - User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/productivity/qr-code`  
**Complexity**: Complex  
**Category**: Productivity Tools

## Overview

The QR Code Generator is a comprehensive tool for creating, customizing, and managing QR codes. It supports 12+ content types (URLs, WiFi, vCards, emails, and more), offers extensive styling options, includes a built-in scanner, and features history tracking with favorites.

## Key Features

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

## How to Use

### Generating a Basic QR Code

#### Step 1: Select Type
Choose your QR code type from the grid:
- **URL**: Website links
- **Text**: Plain text messages
- **WiFi**: Network credentials
- **vCard**: Contact information
- And 8 more types...

#### Step 2: Enter Content
Fill in the required fields based on your selected type.

**Example - URL:**
```
https://supertool.app
```

#### Step 3: Customize (Optional)
- **Color Preset**: Choose from 10 beautiful presets
- **Custom Colors**: Set foreground and background colors
- **Size**: Adjust QR code dimensions
- **Logo**: Upload your logo (max 2MB)

#### Step 4: Download
Click "Download QR Code" and select your format:
- **PNG**: Best for web and print (recommended)
- **JPEG**: Smaller file size
- **WebP**: Modern format with great compression
- **SVG**: Vector format for scalability
- **PDF**: Ready for printing

### Creating Specialized QR Codes

#### WiFi QR Code
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

#### vCard (Contact) QR Code
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

#### Email QR Code
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

#### Event QR Code
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

#### Geo Location QR Code
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

### Customizing QR Code Appearance

#### Color Presets
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

#### Custom Colors
Set exact colors using hex codes or color picker:
- **Foreground**: QR code pattern color
- **Background**: Canvas background color

**Best Practices:**
- High contrast (dark on light or light on dark)
- Avoid similar colors (affects scanability)
- Test scannability after customization

#### Corner Styles
Change the style of corner markers:
- **Square**: Traditional sharp corners
- **Rounded**: Slightly rounded
- **Extra-Rounded**: Very round, modern look
- **Dot**: Circular dots

#### Dot Styles
Customize individual data points:
- **Square**: Standard squares
- **Rounded**: Rounded squares
- **Dots**: Circular dots
- **Classy**: Elegant rounded style

#### Adding Logos
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

### Using the QR Code Scanner

#### Scan from Webcam

1. Switch to "Scanner" tab
2. Click "Start Camera"
3. Allow camera permissions
4. Point camera at QR code
5. Scanner auto-detects and decodes

**Supported:**
- Desktop webcams
- Laptop cameras
- Mobile device cameras

#### Scan from File

1. Click "Upload Image"
2. Select image containing QR code
3. Tool automatically detects and decodes
4. Results displayed instantly

**Supported Formats:**
- PNG, JPEG, WebP, GIF
- Max file size: 10MB

#### Scanner Results
After scanning, view:
- Decoded content
- QR code type (URL, WiFi, etc.)
- Validation status
- Action buttons (Open URL, Copy, Save, etc.)

### Managing History

#### Saving QR Codes
Every generated QR code is automatically saved to history (last 100).

#### Viewing History
1. Click "History" tab
2. Browse all generated codes
3. Filter by type or search by content
4. Sort by date

#### Favorite QR Codes
- Click the star icon on any QR code
- Access favorites quickly from filter
- Never lost in history

#### Deleting History
- Delete individual items: Click trash icon
- Clear all history: Click "Clear All" button

#### Exporting History
Export all your QR codes:
1. Click "Export History"
2. Choose format: JSON (data) or ZIP (images)
3. Download archive

#### Importing History
Restore from backup:
1. Click "Import History"
2. Select exported JSON file
3. History is merged (no duplicates)

## Use Cases

### Use Case 1: Restaurant Menu
Create touchless menus for tables.

**Solution:**
1. Generate URL QR code pointing to online menu
2. Customize with restaurant colors/logo
3. Export as PDF
4. Print as table tent cards
5. Customers scan to view menu

### Use Case 2: Event Check-in
Streamline event registration.

**Solution:**
1. Generate unique QR codes for each attendee
2. Include vCard with attendee info
3. Export as PDF with print template
4. Email/print tickets
5. Scan at entrance for check-in

### Use Case 3: Product Packaging
Add smart features to physical products.

**Solution:**
1. Generate URL to product manual/support
2. Add company logo for branding
3. Export as high-res PNG
4. Include in product packaging design
5. Customers scan for instant support

### Use Case 4: WiFi Guest Access
Share network credentials easily.

**Solution:**
1. Generate WiFi QR code
2. Include SSID and password
3. Print as card or poster
4. Place in reception/guest areas
5. Guests scan to auto-connect

### Use Case 5: Business Cards
Modernize networking.

**Solution:**
1. Generate vCard QR code
2. Include all contact details
3. Customize with brand colors
4. Add to business card design
5. Contacts scan to save info instantly

### Use Case 6: Real Estate Listings
Provide instant property information.

**Solution:**
1. Generate URL to property details
2. Include geo location QR for directions
3. Print on yard signs
4. Buyers scan for virtual tour/info
5. Track engagement via URL analytics

## Tips & Tricks

### Scannability Best Practices
- **High Contrast**: Dark on light backgrounds
- **Minimum Size**: At least 2cm x 2cm for print
- **Quiet Zone**: 4-module white border around QR code
- **Error Correction**: Use "H" (highest) for logos or damage resistance
- **Test Before Printing**: Scan with multiple devices

### Size Recommendations
- **Business Cards**: 1.5cm - 2cm square
- **Flyers/Posters**: 3cm - 5cm square
- **Billboards**: 30cm+ (view distance)
- **Digital Screens**: 200-300px
- **Packaging**: Based on package size

### Print Quality
- **Resolution**: Minimum 300 DPI
- **Format**: SVG (scalable) or high-res PNG
- **Paper**: Matte finish reduces glare
- **Color**: CMYK mode for professional printing
- **Testing**: Print test page before mass production

### Content Optimization
- **URLs**: Use short links for cleaner QR codes
- **Text**: Keep messages concise (< 300 chars)
- **WiFi**: Use WPA encryption (most compatible)
- **vCards**: Include only essential info
- **Events**: Use standard datetime formats

### Logo Integration
- **File Type**: PNG with transparency preferred
- **Size**: Logo should be 10-20% of QR size
- **Position**: Centered for best results
- **Error Correction**: Set to "H" when using logos
- **Testing**: Always test scannability

### Error Correction Levels
- **L (Low - 7%)**: Basic, smallest QR codes
- **M (Medium - 15%)**: Standard, most common
- **Q (Quartile - 25%)**: Good, for minor damage
- **H (High - 30%)**: Best, for logos/heavy customization

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + G | Generate QR code |
| Ctrl/Cmd + D | Download QR code |
| Ctrl/Cmd + C | Copy QR to clipboard |
| Ctrl/Cmd + S | Save to history |
| Ctrl/Cmd + K | Open scanner |
| Escape | Close dialogs |
| Tab | Navigate fields |

## Troubleshooting

### Issue: QR Code Won't Scan
**Causes**: Low contrast, too small, damaged, or poor lighting

**Solutions**:
- Increase size (min 2cm x 2cm)
- Use higher contrast colors
- Increase error correction level
- Remove or simplify logo
- Ensure adequate lighting when scanning
- Test with multiple scanner apps

### Issue: Logo Makes Code Unscannable
**Cause**: Logo too large or low contrast

**Solution**:
- Reduce logo size (< 20% of QR)
- Use simpler logo design
- Increase error correction to "H"
- Ensure logo has good contrast
- Test on multiple devices

### Issue: WiFi QR Not Connecting
**Cause**: Incorrect credentials or encryption type

**Solution**:
- Double-check SSID (case-sensitive)
- Verify password accuracy
- Confirm encryption type (WPA/WEP)
- Some Android devices need WiFi QR reader app
- Check "Hidden network" setting

### Issue: vCard Not Adding to Contacts
**Cause**: Missing required fields or format issues

**Solution**:
- Include at least name and one contact method
- Check phone number format (include country code)
- Use valid email addresses
- Some devices need dedicated vCard reader app

### Issue: Download Produces Blurry Images
**Cause**: Low resolution or wrong format

**Solution**:
- Increase QR code size before exporting
- Use PNG or SVG (not JPEG)
- For print, use SVG for infinite scalability
- Set DPI to 300+ for print

### Issue: History Not Saving
**Cause**: Browser storage limit or privacy mode

**Solution**:
- Check browser storage settings
- Clear some history to free space
- Disable private/incognito mode
- Enable cookies and local storage
- Try different browser

### Issue: Scanner Not Detecting Code
**Cause**: Camera permissions, focus, or lighting

**Solution**:
- Grant camera permissions
- Ensure good lighting
- Hold steady for auto-focus
- Clean camera lens
- Try uploading image instead

## Technical Details

### For Developers

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

## Related Tools

- **[QR Code Scanner](/tools/media/qr-code-scanner)** - Dedicated scanning tool
- **[URL Shortener](/tools/productivity/url-shortener)** - Shorten URLs for cleaner QR codes
- **[vCard Generator](/tools/productivity/vcard-generator)** - Create detailed contact cards
- **[Image Optimizer](/tools/media/image-optimizer)** - Optimize logos for QR codes
- **[PDF Tools](/tools/productivity/pdf-tools)** - Create printable QR sheets

## Frequently Asked Questions

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

## Best Practices

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

## Changelog

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
