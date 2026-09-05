# QR Code Scanner - Comprehensive User Guide

**Tool URL**: `/tools/media/qr-code-scanner`  
**Category**: Media  
**Complexity**: Moderate  
**Last Updated**: January 5, 2026

---

## Overview

The **QR Code Scanner** is a versatile media tool that reads and decodes QR codes using two methods: image upload or live webcam scanning. Powered by the jsQR library, it provides instant QR code detection with scan history tracking, one-click copying, and complete client-side processing for maximum privacy.

### Purpose
- Decode QR codes from uploaded images (PNG, JPEG, WebP, etc.)
- Scan QR codes in real-time using device webcam
- Track scan history with timestamps for reference
- Copy decoded data instantly to clipboard
- Process all scans locally without server uploads

### Target Users
- **Mobile Users**: Scanning QR codes from screenshots or photos
- **Developers**: Testing QR code implementations
- **Business Professionals**: Reading QR codes from documents or presentations
- **Event Attendees**: Scanning tickets, badges, or check-in codes
- **Privacy-Conscious Users**: Need local-only QR code processing
- **Shoppers**: Scanning product QR codes for information

---

## Key Features

### 1. **Dual Scanning Methods**

**Method A: Image Upload**
- Upload any image file containing a QR code
- Supported formats: PNG, JPEG, JPG, WebP, GIF, BMP
- Maximum file size: 10MB
- Drag-and-drop support
- Instant detection and decoding

**Method B: Live Webcam Scanning**
- Real-time QR code detection via webcam
- Automatic camera access request
- Environment-facing camera preference (rear camera on mobile)
- Visual targeting frame for alignment
- Auto-stops after successful scan
- Works on desktop and mobile browsers

### 2. **jsQR Library Integration**
- **Library**: jsQR (JavaScript QR code scanner)
- **Client-Side Processing**: All scanning happens in browser
- **No Server Upload**: Images never leave your device
- **Inversion Handling**: Optimized for standard black-on-white QR codes
- **Accuracy**: High detection rate for clear, well-lit codes

### 3. **Scan History Tracking**
- **Persistent History**: All scans saved during session
- **Timestamps**: Each scan tagged with date/time
- **Format Label**: "QR Code" format identifier
- **Chronological Order**: Newest scans first
- **Individual Management**: Copy or delete specific scans
- **Bulk Clear**: "Clear All" button for full history reset

### 4. **One-Click Copy**
- **Clipboard API**: Modern clipboard integration
- **Visual Feedback**: "Copied!" confirmation (2-second display)
- **Current Scan**: Quick copy button in success message
- **History Copy**: Copy button on each historical scan
- **Mobile Friendly**: Works on touch devices

### 5. **Error Handling & Validation**
- **File Type Validation**: Ensures uploaded file is an image
- **Size Limit**: 10MB maximum to prevent browser memory issues
- **QR Detection**: Clear error if no QR code found
- **Camera Permission**: Graceful handling of denied access
- **Image Load Errors**: Feedback for corrupted/invalid files

### 6. **Privacy & Security**
- **100% Client-Side**: All processing in your browser
- **No Data Transmission**: QR content never sent to servers
- **No Storage**: No cookies or local storage for scan data
- **Session-Only History**: Clears on page refresh
- **Secure Context**: Works on HTTPS for webcam access

---

## How to Use

### Method 1: Upload Image with QR Code

**Step 1: Prepare QR Code Image**
- Take a photo of the QR code (clear, well-lit)
- OR save a screenshot containing the QR code
- OR download an image file with embedded QR code

**Step 2: Upload to Scanner**
1. Click **"Upload Image"** button
2. File picker opens
3. Navigate to your image file
4. Select the file
5. Click "Open"

**Step 3: Wait for Scan**
- Tool displays "Scanning..." state
- Processing typically takes < 1 second
- Progress indicated by UI state change

**Step 4: View Results**
- **Success**: Green card appears with decoded data
- **Failure**: Red error message if no QR code detected
- Decoded text displays in monospace font (e.g., URL, text, data)

**Step 5: Copy Data (Optional)**
1. Click **"Copy"** button next to decoded data
2. Button changes to "Copied!" with checkmark
3. Data now in clipboard
4. Paste anywhere with Ctrl+V / Cmd+V

**Example**:
```
Upload: screenshot-qr-code.png
Result: "https://example.com/product/12345"
Action: Click Copy → Paste into browser
```

---

### Method 2: Scan with Webcam

**Step 1: Click "Use Webcam"**
- Button labeled **"Use Webcam"** (with video camera icon)
- Located next to "Upload Image" button

**Step 2: Grant Camera Permission**
- Browser prompts for camera access
- Click "Allow" or "Grant Permission"
- **Note**: Permission required only once per domain

**Step 3: Position QR Code**
- Webcam feed displays in 16:9 preview window
- Blue targeting frame appears in center
- Hold QR code within the frame
- Keep steady for 1-2 seconds
- Ensure good lighting

**Step 4: Automatic Detection**
- Scanner continuously analyzes video frames
- Detection happens automatically (no button press)
- Green success card appears instantly when decoded
- Webcam automatically stops after successful scan

**Step 5: Stop Webcam (Manual)**
- If scan unsuccessful or done early
- Click **"Stop Webcam"** button (red, X icon)
- Camera feed stops, webcam light turns off

**Tips for Webcam Scanning**:
- Hold device 6-12 inches from QR code
- Ensure QR code fills 50-80% of frame
- Avoid shadows or glare on QR code
- Keep hand steady (motion blur affects detection)
- If not detecting, try different angle or distance

---

### Managing Scan History

**View History**
- Scroll down below main scanner section
- "Scan History" card displays all scans
- Each entry shows:
  - Format: "QR Code"
  - Timestamp: Full date/time of scan
  - Decoded data: Full content in monospace font

**Copy from History**
1. Find desired scan in history list
2. Click **"Copy"** button on that entry
3. Button confirms with "Copied"
4. Data copied to clipboard

**Delete Single Scan**
1. Locate scan to remove
2. Click red **X** button on right side
3. Scan immediately removed from history

**Clear All History**
1. Click **"Clear All"** button (top-right of history section)
2. Confirms with toast notification
3. All history instantly cleared
4. "Scan History" section hides (empty state)

**Note**: History is session-only. Refreshing page clears all history.

---

## Use Cases

### 1. **Scanning Restaurant QR Menus**

**Scenario**: You're at a restaurant with a QR code menu on the table. You want to view the menu on your phone.

**Method**: Webcam Scan
1. Click "Use Webcam"
2. Grant camera permission
3. Point phone camera at table QR code
4. Automatic detection within 2 seconds
5. Decoded URL appears: `https://restaurant.com/menu`
6. Click Copy
7. Paste into browser or tap if clickable URL

**Result**: Menu opens in browser without typing or app installation.

---

### 2. **Reading QR Codes from Screenshots**

**Scenario**: Someone sent you a screenshot with a QR code via email. You need to extract the URL.

**Method**: Image Upload
1. Save screenshot to device: `qr-code-screenshot.png`
2. Open QR Code Scanner tool
3. Click "Upload Image"
4. Select `qr-code-screenshot.png`
5. Scanner extracts URL: `https://meeting.zoom.us/j/1234567890`
6. Click Copy
7. Paste into Zoom app or browser

**Result**: Joined Zoom meeting without manually typing long code.

---

### 3. **Testing Developer-Generated QR Codes**

**Scenario**: You're a developer who generated QR codes for your app. You need to verify they encode the correct data.

**Method**: Image Upload
1. Generate QR code image from your code: `product-qr-123.png`
2. Upload to scanner
3. Verify decoded data matches expected:
   - **Expected**: `{"product_id":123,"variant":"blue"}`
   - **Actual**: Decoded text from scanner
4. Confirm match ✓

**Iteration**:
- Upload 10 different QR codes
- History tracks all 10 scans
- Compare side-by-side
- Identify any encoding errors

**Result**: QR code validation complete without third-party scanning apps.

---

### 4. **Event Ticket Verification**

**Scenario**: You have a digital event ticket PDF with a QR code. You need to extract the ticket ID for customer service.

**Method**: Image Upload (Screenshot)
1. Open PDF ticket in viewer
2. Screenshot the QR code region
3. Upload screenshot to scanner
4. Decoded: `TICKET-2024-EVENT-A12B34C56`
5. Copy ticket ID
6. Paste into customer service form

**Result**: Ticket ID extracted without manual transcription errors.

---

### 5. **Scanning Product QR Codes for Info**

**Scenario**: You're shopping and see a QR code on a product box. You want to check reviews or specifications.

**Method**: Webcam Scan
1. In store, open scanner on phone
2. Click "Use Webcam"
3. Point at product QR code
4. Decoded: `https://brandsite.com/product/XYZ-9000`
5. URL opens in browser
6. View product details, reviews, videos

**Result**: Instant access to product information while shopping.

---

### 6. **Batch Scanning Multiple QR Codes**

**Scenario**: You have 20 business cards with QR codes containing contact info. You need to extract all vCard data.

**Method**: Image Upload (Batch Processing)
1. Upload first card QR code
2. Decoded: vCard data appears
3. Copy to spreadsheet
4. Upload second card
5. Copy data
6. Repeat for all 20 cards
7. History shows all 20 scans for verification

**Result**: All contact data extracted and organized in 10 minutes.

---

### 7. **Scanning WiFi Network QR Codes**

**Scenario**: A coffee shop displays a QR code for WiFi access. You want to connect without manually entering credentials.

**Method**: Webcam Scan
1. Open scanner on phone
2. Use webcam to scan WiFi QR code on wall
3. Decoded: `WIFI:S:CoffeeShop_Guest;T:WPA;P:password123;;`
4. Copy WiFi credentials
5. Go to Settings → WiFi → Manual entry
6. Paste SSID and password

**Alternative**: Some phones auto-detect WiFi QR format and offer to connect directly.

**Result**: Connected to WiFi in seconds without typing complex password.

---

### 8. **Extracting URLs from Physical Documents**

**Scenario**: You received a printed invoice with a QR code for online payment. You're on a desktop computer without a phone.

**Method**: Image Upload (Scan from Phone → Upload to Desktop)
1. Take photo of invoice QR code with phone
2. Transfer photo to computer (email/cloud/USB)
3. Open scanner on desktop browser
4. Upload photo
5. Decoded: `https://billing.company.com/pay/invoice/98765`
6. Open URL in browser
7. Complete payment

**Result**: Accessed payment link from printed document without retyping.

---

### 9. **Social Media Profile Scanning**

**Scenario**: At a networking event, someone shows you a QR code linking to their LinkedIn profile. You want to connect.

**Method**: Webcam Scan
1. Click "Use Webcam" on your phone
2. Scan QR code from their phone screen
3. Decoded: `https://linkedin.com/in/johndoe`
4. Click decoded URL (if browser auto-links)
5. LinkedIn profile opens
6. Click "Connect"

**Result**: LinkedIn connection made in 10 seconds without searching by name.

---

### 10. **Verifying QR Code Contents Before Scanning**

**Scenario**: You see a suspicious QR code sticker on a parking meter. You want to check what it links to before scanning with your phone's default app (which might auto-open URLs).

**Method**: Image Upload (Safety Check)
1. Take photo of suspicious QR code with phone
2. Upload photo to scanner
3. Decoded URL appears: `http://sketchy-phishing-site.com/steal-data`
4. Recognize as phishing attempt
5. Do NOT visit URL
6. Report to authorities

**Result**: Avoided phishing attack by previewing QR content safely.

---

## Tips & Best Practices

### Image Upload Best Practices

**1. Image Quality Matters**
- **Resolution**: Minimum 200x200 pixels for QR code region
- **Clarity**: Sharp focus (no motion blur)
- **Lighting**: Even lighting across QR code surface
- **Contrast**: High contrast between QR code and background

**2. Ideal Image Characteristics**
- QR code occupies 30-70% of image frame
- No severe skewing or distortion
- No reflections or glare obscuring modules
- Background doesn't interfere with QR code pattern

**3. File Format Recommendations**
- **Best**: PNG (lossless, maintains QR code sharpness)
- **Good**: JPEG (quality 85+)
- **Avoid**: Heavily compressed JPEG (quality < 70)
- **Works**: WebP, GIF, BMP

**4. Pre-Process Images**
- Crop to QR code region for faster processing
- Rotate to upright orientation if needed
- Increase brightness if underexposed
- Reduce file size if over 10MB (resize or compress)

### Webcam Scanning Tips

**5. Optimal Distance**
- **Too Close**: QR code fills entire frame, edges cut off
- **Too Far**: QR code too small, details unreadable
- **Ideal**: QR code fills 50-80% of blue targeting frame
- **Distance**: Typically 6-12 inches (15-30 cm)

**6. Lighting Requirements**
- **Natural Light**: Best, even illumination
- **Indoor Lighting**: Adequate, avoid shadows
- **Avoid**: Direct sunlight causing glare or washout
- **Backlit**: Tilt to eliminate screen reflections

**7. Stability & Focus**
- Hold device steady (motion blur reduces accuracy)
- Wait for auto-focus to engage (most modern phones)
- Breathe slowly to minimize hand shake
- Rest elbows on table for stability if available

**8. Troubleshooting Detection Failures**
- **Try Different Angle**: Reduce glare or perspective distortion
- **Adjust Distance**: Move closer or farther
- **Improve Lighting**: Turn on room lights or move to brighter area
- **Clean Camera Lens**: Smudges significantly impact detection
- **Refresh Page**: Restart webcam if frozen

### Privacy & Security

**9. Verify QR Code Source**
- Only scan QR codes from trusted sources
- Be wary of stickers placed over original QR codes (scam technique)
- Parking meters, payment terminals: Check for tampering
- Random QR codes in public: Approach with skepticism

**10. Preview Before Action**
- Always read decoded content before visiting URLs
- Look for suspicious domains (typos, unusual TLDs)
- Check for phishing indicators (urgency, threats, too-good-to-be-true)
- If suspicious, DO NOT visit the URL

**11. Use This Tool for Safety Checks**
- Upload or scan QR code here first
- Review decoded URL without auto-opening
- Safer than scanning with apps that auto-open links
- Clipboard copy gives you control over next action

### Workflow Optimization

**12. Batch Processing Strategy**
- Upload/scan first QR code
- Copy data to destination (spreadsheet, doc, etc.)
- Immediately upload/scan next QR code
- Repeat workflow without clicking away
- Use history to verify or re-copy if needed

**13. History Management**
- Clear history periodically for privacy
- Take screenshot of history before clearing if needed for records
- Delete individual scans with sensitive data immediately after copying

**14. Mobile vs. Desktop**
- **Mobile**: Webcam scanning ideal for real-world QR codes
- **Desktop**: Image upload ideal for screenshots or photos
- **Workflow**: Scan on phone, email photo, decode on desktop

### Error Recovery

**15. "No QR Code Found" Troubleshooting**
- Verify image actually contains a QR code (not barcode or other format)
- Check if QR code is damaged or partially obscured
- Try different image (higher resolution or better lighting)
- Rotate image 90° and re-upload if orientation issue

**16. Camera Permission Denied**
- Check browser settings for camera permissions
- Look for camera icon in address bar
- Grant permission and reload page
- Try different browser if permission bugs exist

---

## Technical Details

### jsQR Library

**Core Technology**:
```
Library: jsQR
Purpose: Pure JavaScript QR code scanner
Processing: Client-side (no server required)
Detection: Analyzes ImageData pixel arrays
```

**Detection Algorithm**:
1. Image converted to canvas ImageData
2. jsQR scans for QR code patterns (alignment, timing, finder patterns)
3. Decodes data from identified modules
4. Returns decoded string or null if not found

**Inversion Handling**:
```javascript
inversionAttempts: 'dontInvert'
```
- Optimized for standard QR codes (black modules on white background)
- Skips inverted detection (white on black) for speed
- Faster processing but requires standard QR code orientation

### Browser Compatibility

**Supported Browsers**:
- ✅ Chrome 90+ (full support)
- ✅ Firefox 88+ (full support)
- ✅ Safari 14+ (full support, webcam requires iOS 14.3+ on iPhone)
- ✅ Edge 90+ (full support)
- ✅ Opera 76+ (full support)

**Mobile Support**:
- ✅ iOS Safari 14+ (webcam requires camera permission)
- ✅ Android Chrome 90+ (full support)
- ✅ Android Firefox 88+ (full support)

**Required Features**:
- Canvas API (for image processing)
- File API (for image upload)
- MediaDevices API (for webcam access)
- Clipboard API (for copy functionality)
- ES6+ JavaScript support

**Webcam Requirements**:
- HTTPS or localhost (secure context required)
- User permission for camera access
- Physical camera device available
- Camera not in use by another application

### File Upload Specifications

**Supported Image Formats**:
```
- PNG (.png) ✓
- JPEG (.jpg, .jpeg) ✓
- WebP (.webp) ✓
- GIF (.gif) ✓ (first frame only)
- BMP (.bmp) ✓
```

**Size Limits**:
- Maximum file size: 10MB
- Recommended: < 5MB for faster processing
- Minimum QR code size: 200x200 pixels (within image)
- Maximum image dimensions: Browser-dependent (typically 8K)

**Upload Process**:
1. File selected via input[type="file"]
2. File validated (type, size)
3. Blob URL created with URL.createObjectURL()
4. Image loaded into Image element
5. Drawn to canvas at original dimensions
6. ImageData extracted via getImageData()
7. jsQR processes ImageData
8. Blob URL revoked to free memory

### Webcam Implementation

**Camera Access**:
```javascript
navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
})
```

**Facing Mode**:
- `environment`: Rear camera (preferred for scanning)
- Fallback: Front camera if rear unavailable
- Desktop: Default webcam

**Scanning Loop**:
1. requestAnimationFrame() creates continuous loop
2. Video frame drawn to canvas each iteration
3. ImageData extracted from canvas
4. jsQR attempts detection
5. Loop continues until QR code found or stopped
6. Automatic stop after successful scan

**Performance**:
- Scanning rate: 30-60 FPS (depending on device)
- Detection time: < 100ms for clear QR codes
- Resource usage: Moderate (GPU-accelerated canvas operations)

### Technology Stack

**Framework & Libraries**:
- **Next.js 15**: App Router, React Server Components
- **React 19**: Latest React features
- **TypeScript**: Full type safety
- **jsQR**: QR code detection library
- **Panda CSS**: Styling system
- **Lucide React**: Icon library

**State Management**:
- React useState for local state (scans, errors, UI flags)
- useRef for DOM element references (video, canvas, input, stream)
- useCallback for stable function references

**Analytics Tracking**:
```javascript
Events tracked:
- qr_code_scanner_upload (file type, size)
- qr_code_scanner_success (data length)
- qr_code_scanner_no_code
- qr_code_scanner_webcam_start
- qr_code_scanner_webcam_success (data length)
- qr_code_scanner_webcam_stop
- qr_code_scanner_copy (data length)
- qr_code_scanner_clear_history
- qr_code_scanner_delete
```

**Privacy**: No QR content or personal data tracked, only interaction types.

### Performance Optimization

**Memory Management**:
- Blob URLs revoked after image load
- MediaStream tracks stopped when webcam closed
- Animation frames canceled when scanning stops
- Canvas references cleaned up

**Processing Speed**:
- Image upload: 100-500ms (includes file load + decode)
- Webcam scan: Real-time (30-60 FPS processing)
- Copy operation: < 10ms
- History operations: Instant (array manipulation)

---

## Troubleshooting

### Issue 1: "No QR Code Found" Error

**Symptoms**:
- Uploaded image but scanner says no QR code detected
- Red error message appears

**Solutions**:
1. **Verify Image Contains QR Code**
   - Open image in photo viewer
   - Confirm visible QR code pattern
   - Ensure not a barcode or Data Matrix code (different formats)

2. **Check Image Quality**
   - Zoom in: Can you see individual QR modules clearly?
   - If blurry: Re-capture with better focus
   - If pixelated: Use higher resolution image

3. **Try Different Angle/Lighting**
   - Retake photo with better lighting
   - Reduce glare or shadows
   - Ensure no reflections obscuring code

4. **Crop to QR Code**
   - Use image editor to crop closely around QR code
   - Remove background distractions
   - Re-upload cropped version

5. **Check for Damage**
   - Inspect physical QR code for tears, fading, or obstruction
   - If damaged, request new QR code from source

---

### Issue 2: Webcam Not Starting

**Symptoms**:
- Clicked "Use Webcam" but no video feed
- Error: "Failed to access webcam"

**Solutions**:
1. **Grant Camera Permission**
   - Browser prompt appears requesting camera access
   - Click "Allow" or "Grant"
   - If denied by mistake, look for camera icon in address bar (click to change)

2. **Check Browser Settings**
   - **Chrome**: Settings → Privacy → Site Settings → Camera
   - **Firefox**: Preferences → Privacy & Security → Permissions → Camera
   - **Safari**: Safari → Settings → Websites → Camera
   - Ensure this site has camera permission

3. **Close Other Apps Using Camera**
   - Zoom, Teams, Skype, other video apps
   - Close or exit from camera-using applications
   - Try webcam button again

4. **Verify HTTPS Connection**
   - Camera requires secure context (HTTPS)
   - Check address bar shows padlock icon
   - If localhost, should work regardless

5. **Try Different Browser**
   - If permission issues persist, test in different browser
   - Chrome/Edge typically most reliable
   - Safari on iOS sometimes has quirks

6. **Restart Browser**
   - Close all browser windows
   - Reopen and revisit tool
   - Camera state may be stuck

---

### Issue 3: Webcam Scanning Not Detecting QR Code

**Symptoms**:
- Webcam feed showing, targeting frame visible
- Pointing at QR code but no detection
- No success message appears

**Solutions**:
1. **Adjust Distance**
   - Move closer: QR code should fill 50-80% of blue frame
   - Too far = modules too small
   - Too close = edges cut off

2. **Hold Steady**
   - Motion blur prevents detection
   - Rest elbows on table or against body
   - Take a breath and hold still for 2 seconds

3. **Improve Lighting**
   - Turn on room lights
   - Face window for natural light
   - Avoid backlighting (QR code in shadow)

4. **Check Camera Focus**
   - Tap screen on mobile to trigger auto-focus (some phones)
   - Wait 1-2 seconds for focus to lock
   - Clean camera lens if smudged

5. **Try Different Angle**
   - Tilt QR code to reduce glare
   - Rotate 90° if orientation issue
   - Adjust perspective if skewed

6. **Stop and Restart Webcam**
   - Click "Stop Webcam"
   - Wait 2 seconds
   - Click "Use Webcam" again
   - Fresh start may resolve stuck state

---

### Issue 4: File Upload Button Does Nothing

**Symptoms**:
- Clicked "Upload Image" but file picker doesn't open
- Button appears disabled or unresponsive

**Solutions**:
1. **Webcam Must Be Stopped**
   - If webcam active, upload button disabled
   - Click "Stop Webcam" first
   - Then try "Upload Image"

2. **Check Browser Compatibility**
   - Very old browsers may not support File API
   - Update browser to latest version
   - Try Chrome/Firefox/Safari/Edge (modern versions)

3. **Pop-Up Blocker Interference**
   - Some extensions block file picker
   - Disable extensions temporarily
   - Try incognito/private mode

4. **JavaScript Error**
   - Press F12 to open developer console
   - Look for red error messages
   - Report error if found

5. **Refresh Page**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clears any stuck state

---

### Issue 5: "File Size Must Be Less Than 10MB" Error

**Symptoms**:
- Uploaded image but rejected due to size
- Red error message about file size

**Solutions**:
1. **Compress Image**
   - Use image editor (Photoshop, GIMP, online tool)
   - Export with lower quality (JPEG 70-80%)
   - Or reduce dimensions (resize to 1920px max width)

2. **Crop to QR Code**
   - Remove surrounding content
   - Crop tightly around QR code
   - Smaller file size and faster processing

3. **Convert Format**
   - If PNG, try converting to JPEG
   - JPEG typically smaller for photos
   - PNG better for graphics/screenshots

4. **Use Screenshot Instead**
   - Open large image in viewer
   - Screenshot just the QR code portion
   - Upload screenshot (usually < 1MB)

---

### Issue 6: Copied Data Not Pasting

**Symptoms**:
- Clicked "Copy" button
- Button showed "Copied!" confirmation
- But paste (Ctrl+V) doesn't work

**Solutions**:
1. **Check Clipboard Permission**
   - Some browsers require clipboard permission
   - Look for prompt and click "Allow"
   - Or check site settings for clipboard

2. **Try Manual Copy**
   - Click and drag to select decoded text
   - Right-click → Copy
   - Or Ctrl+C / Cmd+C

3. **Clipboard API Limitations**
   - Older browsers may not support Clipboard API
   - Update to modern browser version
   - Works in Chrome 76+, Firefox 63+, Safari 13.1+

4. **Security Context Required**
   - Clipboard API requires HTTPS
   - Verify page served over HTTPS
   - Should work on localhost regardless

---

### Issue 7: Scan History Not Showing

**Symptoms**:
- Successfully scanned QR codes
- But "Scan History" section doesn't appear

**Solutions**:
1. **Scroll Down**
   - History section below main scanner card
   - May need to scroll on smaller screens
   - Appears automatically after first successful scan

2. **Check If Scans Successful**
   - Did green success card appear after scan?
   - If no success, no history entry added
   - Error scans don't add to history

3. **History Cleared**
   - Check if "Clear All" was clicked by mistake
   - History empties, section hides
   - Scan another code to see history re-appear

4. **Page Refreshed**
   - History is session-only (not saved)
   - Refreshing page clears all history
   - This is by design for privacy

---

### Issue 8: Webcam Feed Frozen or Black

**Symptoms**:
- Webcam started but shows black screen
- Or feed frozen on first frame

**Solutions**:
1. **Wait for Camera Initialization**
   - Some cameras take 2-5 seconds to start
   - Look for indicator light on webcam
   - Wait for feed to start

2. **Check Camera in Use**
   - Another app might have camera locked
   - Close Zoom, Teams, Skype, etc.
   - Try "Stop Webcam" → "Use Webcam" again

3. **Grant Permission Again**
   - Permission might have been partially granted
   - Refresh page
   - Grant full camera access when prompted

4. **Try Different Camera**
   - If multiple cameras (laptop + external)
   - Browser may select wrong one
   - Disconnect external webcam and retry
   - Or check browser settings to select camera

5. **Restart Browser**
   - Camera state can get stuck
   - Close all browser windows
   - Reopen and try again

---

### Issue 9: Mobile Camera Showing Front Camera Instead of Rear

**Symptoms**:
- Clicked "Use Webcam" on phone
- Front-facing camera activated instead of rear

**Solutions**:
1. **This Is Normal Fallback Behavior**
   - Tool requests `facingMode: 'environment'` (rear camera)
   - If rear camera unavailable or blocked, browser uses front
   - Some devices don't support facingMode hint

2. **Workaround: Mirror QR Code**
   - Point front camera at a mirror
   - Mirror reflects QR code
   - Scan from mirror reflection

3. **Use Image Upload Instead**
   - Take photo with phone's native camera app
   - Use rear camera in camera app
   - Upload photo to scanner

4. **Check Browser Settings**
   - Some browsers have camera selection in UI
   - Look for flip camera button during webcam use
   - May depend on browser and OS

---

### Issue 10: Decoded Data Looks Incorrect

**Symptoms**:
- QR code scanned successfully
- But decoded text seems wrong or garbled

**Solutions**:
1. **Verify QR Code Source**
   - Double-check this is the correct QR code
   - Compare with known-good QR code if available
   - Ensure not a different/wrong code

2. **Character Encoding Issues**
   - QR codes can encode binary data
   - May appear as strange characters if not text
   - This is the actual data in the QR code

3. **Scan Again for Confirmation**
   - Upload/scan same QR code again
   - Compare results
   - If identical both times, that's the correct data

4. **Check QR Code Format**
   - Some QR codes encode structured data (vCard, WiFi, etc.)
   - Format: `WIFI:S:NetworkName;T:WPA;P:password;;`
   - Appears "garbled" but is actually formatted data

5. **Original QR Code Error**
   - If QR code generated with wrong data
   - Scanner decodes it correctly (garbage in, garbage out)
   - Contact QR code creator to regenerate

---

## FAQ

### Q1: What types of QR codes can this scanner read?

**Answer**: **All standard QR codes**, regardless of data type:

**Supported Content Types**:
- ✅ URLs (http://, https://, etc.)
- ✅ Plain text (any characters)
- ✅ Contact info (vCard format)
- ✅ WiFi credentials (WIFI: format)
- ✅ Email addresses (mailto:)
- ✅ Phone numbers (tel:)
- ✅ SMS/MMS (sms:)
- ✅ Geo coordinates (geo:)
- ✅ Calendar events (VEVENT format)
- ✅ Binary data
- ✅ App deep links
- ✅ Cryptocurrency addresses
- ✅ Any UTF-8 encoded data

**NOT Supported**:
- ❌ Barcodes (UPC, EAN, Code 128, etc.) - different format
- ❌ Data Matrix codes - different format
- ❌ Aztec codes - different format
- ❌ PDF417 codes - different format

**QR Code Versions**: Supports all versions (1-40, from 21x21 to 177x177 modules).

---

### Q2: Is my scanned data sent to any server?

**Answer**: **No, absolutely not. All processing is 100% client-side.**

**Privacy Guarantee**:
- ✅ Images never uploaded to any server
- ✅ Decoded QR data never transmitted
- ✅ Webcam feed processed locally only
- ✅ No cookies storing scan data
- ✅ No local storage of QR contents
- ✅ Session history clears on page refresh

**What IS Tracked** (Anonymous Analytics):
- Page visits (count)
- Button clicks (upload vs. webcam)
- Scan success/failure (boolean)
- Decoded data length (number of characters, NOT the actual content)

**What Is NOT Tracked**:
- ❌ QR code contents
- ❌ Decoded URLs
- ❌ Personal information
- ❌ Image files

**Verification**: Open browser DevTools (F12) → Network tab. Scan a QR code. You'll see NO network requests to any server (except analytics ping with no personal data).

---

### Q3: Why do I need to grant camera permission for webcam scanning?

**Answer**: **Browser security policy requires explicit user permission for camera access.**

**Why Permission Required**:
- Prevents malicious websites from secretly recording you
- User control over privacy-sensitive hardware
- Standard web security practice (same as microphone, location)

**What the Tool Accesses**:
- Video feed from camera (for QR scanning)
- No audio recording
- No photo/video storage
- No background camera access

**Permission Scope**:
- Granted per-domain (this website only)
- Can revoke anytime in browser settings
- Expires when you close browser (depending on browser)

**Mobile Considerations**:
- iOS Safari: Permission required each time (stricter)
- Android Chrome: Permission persists until revoked

**How to Revoke**:
- Chrome: Click padlock icon → Site settings → Camera → Block
- Firefox: Click "i" icon → Permissions → Camera → Block
- Safari: Safari menu → Settings for This Website → Camera → Deny

---

### Q4: Can I scan QR codes from my phone's photo gallery?

**Answer**: **Yes! Use the "Upload Image" method.**

**How**:
1. Save QR code image to phone gallery (photo, screenshot, download)
2. Open this tool in mobile browser
3. Tap "Upload Image"
4. File picker opens
5. Navigate to "Gallery" or "Photos"
6. Select image containing QR code
7. Scanner decodes it

**Alternative Workflow**:
- Take photo with phone camera app
- Without leaving camera app, share photo to this tool's browser tab
- Or AirDrop/email to yourself, download, upload

**Why This Works**:
- Modern mobile browsers support file uploads
- File picker integrates with system photo library
- No need for native app

---

### Q5: What if the QR code is damaged or partially obscured?

**Answer**: **QR codes have built-in error correction, but there are limits.**

**Error Correction Levels** (set when QR code created):
- **L**: ~7% of code can be damaged and still scan
- **M**: ~15% damage tolerance
- **Q**: ~25% damage tolerance
- **H**: ~30% damage tolerance (highest)

**In Practice**:
- Small dirt spots: Usually OK
- Corner damage: Often recoverable (corners less critical)
- Center damage: More problematic (center contains alignment patterns)
- >30% obscured: Likely unreadable even with H-level correction

**What to Try**:
1. Clean the QR code surface
2. Try better lighting
3. Scan from different angle
4. Upload higher resolution image
5. If still failing, request new/undamaged QR code from source

**Tool Behavior**:
- If error correction successful: Decodes normally
- If damage too severe: "No QR code found" error

---

### Q6: Does this work offline without internet connection?

**Answer**: **Partially yes, but initial page load requires internet.**

**Offline Capabilities**:
- ✅ Scanning works offline (client-side processing)
- ✅ File upload works offline
- ✅ Webcam scanning works offline
- ✅ History tracking works offline
- ❌ Page must load initially with internet (downloads JS libraries)

**How to Use Offline**:
1. Load page once with internet (tool caches in browser)
2. Disconnect from internet
3. Scanning still works (jsQR library already loaded)
4. Reconnect for future updates

**Progressive Web App (PWA)**:
- This tool could be installed as PWA for true offline use
- Check if "Install" button appears in browser
- Installed PWA works completely offline after first load

---

### Q7: Can I scan QR codes from my computer screen?

**Answer**: **Yes, using webcam scan or screenshot methods.**

**Method A: Webcam Scan**
1. QR code displayed on another monitor/device
2. Click "Use Webcam"
3. Point webcam at screen showing QR code
4. Adjust distance/angle to reduce screen glare/moiré
5. Scanner decodes it

**Challenges**:
- Screen glare interferes with detection
- Moiré patterns from pixel grid
- Lower success rate than scanning printed codes

**Method B: Screenshot**
1. Take screenshot of screen showing QR code (Shift+Cmd+4 on Mac, Win+Shift+S on Windows)
2. Save screenshot
3. Upload screenshot to scanner
4. Much more reliable than webcam scanning screen

**Recommended**: Screenshot method is far more reliable for screen-displayed QR codes.

---

### Q8: How many QR codes can I scan in one session?

**Answer**: **Unlimited scans. History tracks all scans during session.**

**Practical Limits**:
- No hard limit on number of scans
- History stored in browser memory (RAM)
- Very large history (1000+ scans) may slow browser
- Each scan adds ~100-500 bytes to memory

**Memory Management**:
- Click "Clear All" to free memory if history gets very long
- Or delete individual scans no longer needed
- Page refresh clears all history

**Best Practice**:
- For extensive scanning (100+ codes), clear history every 50-100 scans
- Export important data before clearing
- Take screenshot of history if needed for records

---

### Q9: Can I scan multiple QR codes from a single image?

**Answer**: **No, the scanner detects only ONE QR code per image/frame.**

**Current Behavior**:
- Scanner finds first QR code in image
- Stops processing after first detection
- Ignores additional codes in same image

**Workaround for Multiple Codes**:
1. Crop image to isolate each QR code
2. Upload/scan each cropped image separately
3. Each scan adds to history

**Example**:
- Page with 5 QR codes
- Create 5 cropped images (one QR code each)
- Upload all 5 separately
- All 5 results in scan history

**Future Enhancement**: Multi-code detection could be added in future version (not currently supported).

---

### Q10: What happens to my scan history when I close the browser?

**Answer**: **History is completely erased. No data persists.**

**Session-Only Storage**:
- History stored in React state (browser memory)
- Closing tab/window: History lost
- Refreshing page: History lost
- Browser crash: History lost
- No cookies, no localStorage, no sessionStorage

**Why Session-Only?**:
- Privacy: No scan data stored on device
- Security: Sensitive QR data doesn't persist
- Simplicity: No database or storage management

**How to Save History**:
1. Screenshot history section before closing
2. Copy important entries to notes/doc before closing
3. Export history manually (no built-in export feature currently)

**Feature Request**: Persistent history with encryption could be added based on user demand.

---

### Q11: Can I use this scanner for commercial/business purposes?

**Answer**: **Yes, this is a free tool for any use (personal or commercial).**

**Allowed Uses**:
- ✅ Business QR code verification
- ✅ Event management (ticket scanning)
- ✅ Inventory management (product QR codes)
- ✅ Quality assurance (testing QR implementations)
- ✅ Customer service (helping users decode QR codes)
- ✅ Educational/training purposes

**No Restrictions**:
- No account required
- No usage limits
- No licensing fees
- No attribution required (but appreciated!)

**Note**: For high-volume business use (1000s of scans/day), consider:
- Implementing your own scanner with jsQR library
- Or using API-based QR scanning service
- This web tool not optimized for industrial-scale operations

---

### Q12: Why does webcam scanning sometimes take longer than uploading?

**Answer**: **Webcam scanning is real-time and depends on conditions. Upload is one-time processing.**

**Webcam Scanning Variables**:
- Lighting conditions (low light = harder detection)
- Camera quality (low-res camera = slower detection)
- Hand stability (motion blur requires retries)
- QR code size in frame (too small/large = poor detection)
- Distance and angle (suboptimal positioning = more attempts)

**Image Upload Variables**:
- Image quality (high-res, clear image = instant detection)
- Processing power (fast device = faster decode)
- File size (large file = longer load time)

**Typical Times**:
- Image upload: 100-500ms (very consistent)
- Webcam scan: 0.5-5 seconds (highly variable)

**When Webcam Faster**:
- Ideal conditions (good light, steady hand, close distance)
- High-quality camera (1080p+)
- Clear, undamaged QR code

**When Upload Faster**:
- Always more consistent timing
- Poor lighting environments
- Shaky hands
- Low-quality webcam

**Recommendation**: For speed-critical applications, take photo first, then upload (combines best of both).

---

## Conclusion

The **QR Code Scanner** provides a reliable, privacy-focused solution for reading QR codes from images or live webcam feeds. With client-side processing, scan history tracking, and one-click copying, it serves as a versatile tool for personal, professional, and development use cases.

**Key Takeaways**:
- Dual scanning methods (upload & webcam) for flexibility
- 100% client-side processing ensures complete privacy
- Session history for reference and comparison
- No installation or accounts required
- Works on desktop and mobile browsers

**Best Practices**:
- Use webcam for real-world QR codes in good lighting
- Use upload for screenshots, photos, or difficult scans
- Verify QR source before visiting decoded URLs
- Clear history after scanning sensitive data

Whether you're scanning restaurant menus, verifying event tickets, testing developer QR codes, or extracting data from documents, this tool provides fast, accurate, and private QR code decoding.

---

**Document Version**: 1.0  
**Last Reviewed**: January 5, 2026  
**Tool Version**: Next.js 15 / React 19  
**Library**: jsQR (JavaScript QR code scanner)  
**Feedback**: Report issues via GitHub or contact support
