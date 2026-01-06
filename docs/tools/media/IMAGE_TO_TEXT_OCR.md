# Image to Text (OCR) - User Guide

## Overview

The **Image to Text Converter** (OCR - Optical Character Recognition) is a powerful tool that extracts text from images using Tesseract.js, a JavaScript OCR engine. Whether you need to digitize scanned documents, extract text from screenshots, convert photos of whiteboards, or process business cards, this tool accurately recognizes and extracts text from images in 12+ languages.

Perfect for students, researchers, business professionals, content creators, and anyone who needs to convert printed or handwritten text into editable digital format.

## Key Features

### Tesseract.js OCR Engine
- Industry-standard OCR accuracy
- Client-side processing (no server upload required)
- Real-time progress tracking
- Optimized for various text styles and fonts

### 12+ Language Support
- **English** (default)
- **Spanish** (Español)
- **French** (Français)
- **German** (Deutsch)
- **Chinese Simplified** (简体中文)
- **Chinese Traditional** (繁體中文)
- **Japanese** (日本語)
- **Korean** (한국어)
- **Russian** (Русский)
- **Arabic** (العربية)
- **Portuguese** (Português)
- **Italian** (Italiano)

### Multiple Image Format Support
- **PNG** - Best for screenshots and digital text
- **JPEG** - Common photo format
- **WEBP** - Modern compressed format
- **Maximum file size**: 10MB

### Image Preview
- See uploaded image before processing
- Visual confirmation of correct file
- Side-by-side comparison with extracted text
- Automatic image cleanup after processing

### Text Export Options
- **Copy to Clipboard** - One-click copy functionality
- **Download as TXT** - Save as plain text file
- **Word/Character Count** - Statistics on extracted text
- **Monospace Display** - Easy-to-read formatting

### Progress Tracking
- Real-time percentage indicator
- Visual progress bar
- Processing status updates
- Estimated completion time

## How to Use

### Basic Workflow

1. **Select Language**
   - Click the language dropdown
   - Choose the language of text in your image
   - Default is English
   - Language selection affects OCR accuracy

2. **Upload Image**
   - Click "Upload Image" button
   - Select image file from your device
   - Supported formats: PNG, JPEG, WEBP
   - Maximum size: 10MB
   - Image preview appears on the left

3. **Wait for Processing**
   - Progress bar shows extraction status
   - Percentage indicator updates in real-time
   - Processing time: 3-15 seconds (depending on image size and complexity)
   - Don't close the page during processing

4. **Review Extracted Text**
   - Text appears on the right panel
   - Check accuracy of extraction
   - Word and character count displayed at bottom
   - Scroll to read full text

5. **Copy or Download**
   - Click **Copy** button (with checkmark icon) to copy to clipboard
   - Click **Download** button to save as `.txt` file
   - Click **X** button to clear and start over
   - Filename format: `extracted-text-[timestamp].txt`

### Advanced Usage

#### Multi-Language Documents
1. Upload image with mixed languages
2. Try primary language first
3. If results poor, switch to secondary language
4. Combine results from multiple passes if needed

#### Improving OCR Accuracy
1. **Pre-process images** before uploading:
   - Increase contrast
   - Crop to text area only
   - Straighten rotated images
   - Adjust brightness

2. **Use high-resolution images** (300 DPI or higher)
3. **Ensure good lighting** in photos
4. **Avoid blurry or distorted images**
5. **Select correct language** for text

#### Batch Processing Workflow
1. Upload first image
2. Copy extracted text to clipboard
3. Paste into document or spreadsheet
4. Click Clear (X button)
5. Upload next image
6. Repeat process

#### Scanned PDF Workflow
1. Convert PDF pages to images first (use external tool)
2. Upload each page image individually
3. Extract text from each page
4. Combine all text in your text editor
5. Format and edit as needed

## Use Cases

### 1. Digitizing Scanned Documents
**Scenario**: Convert old paper documents to digital text

```
Input: Photo of printed contract or letter
Language: English
Processing Time: 5-8 seconds
Output: Editable text with 95%+ accuracy
Use Case: Archive old documents digitally
```

**Tips**:
- Scan at 300 DPI for best results
- Ensure even lighting
- Use high contrast images

### 2. Screenshot Text Extraction
**Scenario**: Extract text from app screenshots or error messages

```
Input: Screenshot with error message
Language: English
Processing Time: 3-5 seconds
Output: Exact error text for searching/reporting
Use Case: Bug reports, technical support
```

**Tips**:
- Use PNG format (lossless)
- Crop to text area only
- Avoid UI elements that aren't text

### 3. Business Card Processing
**Scenario**: Extract contact information from business cards

```
Input: Photo of business card
Language: English/Chinese/Japanese
Processing Time: 4-6 seconds
Output: Name, email, phone, address
Use Case: Digital contact management
```

**Tips**:
- Photograph flat on surface
- Good lighting essential
- Minimal shadows
- Post-process to correct formatting

### 4. Whiteboard Notes Digitization
**Scenario**: Convert meeting whiteboard notes to text

```
Input: Photo of whiteboard after meeting
Language: English
Processing Time: 8-12 seconds
Output: Meeting notes and action items
Use Case: Meeting documentation
```

**Tips**:
- Take photo straight-on (not angled)
- Use marker with high contrast
- Avoid reflections and glare
- Erase old marks before photo

### 5. Recipe or Instructions Extraction
**Scenario**: Extract recipes from cookbooks or instruction manuals

```
Input: Photo of cookbook page
Language: Any supported language
Processing Time: 6-10 seconds
Output: Recipe ingredients and instructions
Use Case: Digital recipe collection
```

**Tips**:
- Flatten book pages
- Good overhead lighting
- High-resolution photo
- OCR one section at a time

### 6. Foreign Language Text Translation
**Scenario**: Extract text from foreign language signs or documents

```
Input: Photo of street sign or menu
Language: Spanish/French/German/Japanese/etc.
Processing Time: 5-8 seconds
Output: Text for translation tools
Use Case: Travel, language learning
```

**Tips**:
- Select correct language crucial
- Clear, focused photo
- Use translation tool after extraction
- Verify accuracy with native speaker

### 7. Academic Research - Printed Source Material
**Scenario**: Extract text from printed research papers or books

```
Input: Photo/scan of academic paper page
Language: English or academic language
Processing Time: 10-15 seconds
Output: Citations, quotes, data
Use Case: Literature review, note-taking
```

**Tips**:
- Use scanner for best quality
- 300 DPI recommended
- Process one page at a time
- Verify quotes for accuracy

### 8. Invoice and Receipt Processing
**Scenario**: Extract data from invoices for accounting

```
Input: Photo of receipt or invoice
Language: English or local language
Processing Time: 5-8 seconds
Output: Amounts, dates, vendor info
Use Case: Expense tracking, bookkeeping
```

**Tips**:
- Straighten receipt before photo
- Ensure all text visible
- High contrast important
- Verify numbers carefully

### 9. Handwritten Note Conversion
**Scenario**: Attempt to extract clear handwritten text

```
Input: Photo of handwritten notes
Language: English
Processing Time: 10-15 seconds
Output: Partial text (accuracy varies)
Use Case: Note digitization
```

**⚠️ Limitations**:
- Handwriting accuracy lower than printed (50-80%)
- Works best with print-style handwriting
- Cursive may have poor results
- Manual editing often required

### 10. Code Snippet Extraction
**Scenario**: Extract code from screenshots or books

```
Input: Screenshot of code editor
Language: English (code is language-agnostic)
Processing Time: 5-8 seconds
Output: Copyable code
Use Case: Code documentation, tutorials
```

**Tips**:
- Use monospace font if possible
- High contrast theme
- Large font size
- Verify syntax after extraction

## Tips & Best Practices

### Optimizing Image Quality

1. **Resolution**
   - Minimum: 150 DPI
   - Recommended: 300 DPI
   - Higher resolution = better accuracy

2. **Lighting**
   - Even, diffused lighting best
   - Avoid shadows on text
   - No glare or reflections
   - Natural light often better than flash

3. **Image Clarity**
   - Sharp focus essential
   - Avoid motion blur
   - Use tripod or stable surface
   - Tap to focus on smartphone

4. **Contrast**
   - High contrast between text and background
   - Black text on white background ideal
   - Adjust brightness/contrast in photo editor if needed

5. **Alignment**
   - Photograph straight-on (perpendicular to surface)
   - Avoid angles or perspective distortion
   - Crop to text area
   - Straighten rotated images

### Maximizing OCR Accuracy

1. **Choose Correct Language**
   - Accuracy depends heavily on language selection
   - Test different languages if results poor
   - Some documents have multiple languages

2. **Pre-Process Images**
   - Use image editor to enhance before upload
   - Increase contrast
   - Convert to grayscale
   - Remove noise

3. **Break Up Large Documents**
   - Process one section at a time
   - Better accuracy than full-page
   - Easier to verify results
   - Less processing time per image

4. **Verify Results**
   - Always proofread extracted text
   - OCR not 100% accurate
   - Numbers and special characters most error-prone
   - Check formatting and spacing

### Common Pitfalls to Avoid

- **Don't use low-resolution images** (under 150 DPI)
- **Don't expect perfect handwriting recognition** (60-70% accuracy typical)
- **Don't upload images over 10MB** (will be rejected)
- **Don't photograph at extreme angles** (straight-on is best)
- **Don't use images with complex backgrounds** (text should be isolated)
- **Don't expect 100% accuracy** (always proofread)
- **Don't forget to select language** (defaults to English)

## Technical Details

### Tesseract.js OCR Engine
- **Version**: Tesseract.js 4.x
- **Accuracy**: 85-98% for printed text (depends on quality)
- **Processing**: Client-side (browser-based)
- **Engine**: Based on Google's Tesseract OCR
- **Training Data**: Pre-trained models for 100+ languages

### Supported Image Specifications

| Specification | Details |
|---------------|---------|
| **Formats** | PNG, JPEG, JPG, WEBP |
| **Max File Size** | 10MB |
| **Min Resolution** | 150 DPI recommended |
| **Optimal Resolution** | 300 DPI |
| **Color Mode** | RGB, Grayscale, B&W all supported |
| **Dimensions** | No specific limits (constrained by file size) |

### Language Codes

| Language | Code | Native Name |
|----------|------|-------------|
| English | eng | English |
| Spanish | spa | Español |
| French | fra | Français |
| German | deu | Deutsch |
| Chinese (Simplified) | chi_sim | 简体中文 |
| Chinese (Traditional) | chi_tra | 繁體中文 |
| Japanese | jpn | 日本語 |
| Korean | kor | 한국어 |
| Russian | rus | Русский |
| Arabic | ara | العربية |
| Portuguese | por | Português |
| Italian | ita | Italiano |

### Processing Performance

| Image Size | Complexity | Estimated Time |
|------------|------------|----------------|
| Small (<1MB) | Low (simple text) | 3-5 seconds |
| Medium (1-3MB) | Medium (mixed content) | 5-10 seconds |
| Large (3-10MB) | High (dense text) | 10-15 seconds |

**Factors Affecting Speed**:
- Image resolution
- Text density
- Font complexity
- Device CPU speed
- Browser performance

### Browser Compatibility
- **Chrome**: 90+ ✅ (Recommended)
- **Firefox**: 88+ ✅
- **Safari**: 14+ ✅
- **Edge**: 90+ ✅
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Required**: JavaScript, File API, Web Workers

### Data Privacy & Security
- **Client-Side Processing**: All OCR happens in your browser
- **No Server Upload**: Images never leave your device
- **No Storage**: Images and text not saved anywhere
- **No Tracking**: Only anonymized analytics (file type, size, language)
- **Memory Management**: Images cleared from memory after processing
- **Recommendation**: Safe for confidential documents

## Keyboard Shortcuts

- **Ctrl/Cmd + V**: Paste image (after copying from screenshot tool)
- **Tab**: Navigate between elements
- **Enter**: Trigger upload when upload button focused
- **Ctrl/Cmd + C**: Copy extracted text (after selecting)
- **Ctrl/Cmd + A**: Select all extracted text

## Troubleshooting

### Issue: "Please upload a valid image file"
**Solution**: File type not supported. Use PNG, JPEG, or WEBP formats only. Check file extension.

### Issue: "File size must be less than 10MB"
**Solution**: Image too large. Compress or resize image before uploading. Use online image compressor or photo editing software.

### Issue: Extracted text is gibberish or incorrect
**Solution**: 
- Verify correct language selected (most common cause)
- Check image quality (blur, low resolution)
- Improve image contrast
- Try pre-processing image (increase sharpness, contrast)
- Re-photograph document with better lighting

### Issue: Text extraction incomplete (missing sections)
**Solution**: 
- Image resolution too low
- Text blurred or obscured
- Complex layout confusing OCR
- Try cropping to specific text areas
- Process sections individually

### Issue: Processing takes very long (>30 seconds)
**Solution**: 
- Large file size (reduce image size)
- Slow device/browser
- Close other browser tabs
- Refresh page and try again
- Use smaller image or crop to essential area

### Issue: Handwriting not recognized
**Solution**: 
- Tesseract optimized for printed text, not handwriting
- Handwriting accuracy 50-70% at best
- Use print-style handwriting for better results
- Consider manual transcription for cursive
- Try Google Vision API or specialized handwriting OCR tools

### Issue: Numbers extracted incorrectly
**Solution**: 
- OCR often confuses similar characters (0 vs O, 1 vs l, 5 vs S)
- Always verify numbers manually
- Use high-contrast, clear fonts
- Increase image resolution
- Manually correct after extraction

### Issue: Copy button doesn't work
**Solution**: 
- Browser clipboard permissions denied
- Manually select text and use Ctrl/Cmd + C
- Check browser settings for clipboard access
- Try different browser

### Issue: Download doesn't start
**Solution**: 
- Browser blocking downloads
- Check popup blocker settings
- Allow downloads from the site
- Verify disk space available

### Issue: Foreign language text not recognized
**Solution**: 
- Wrong language selected
- Language not in supported list (use English for best-effort)
- Font style unusual or decorative
- Try different language if mixed scripts

### Issue: "Failed to extract text from image"
**Solution**: 
- Tesseract worker failed to load
- Network issue (check connection)
- Browser compatibility issue
- Refresh page and try again
- Try different browser
- Clear browser cache

## Accuracy Expectations

### Print Quality Text
- **Standard Fonts** (Arial, Times): 95-98%
- **Clear Contrast**: 95-98%
- **300 DPI Scans**: 95-98%

### Photo of Text
- **Well-lit**: 90-95%
- **Good focus**: 90-95%
- **Straight-on angle**: 90-95%

### Challenging Scenarios
- **Low contrast**: 70-85%
- **Complex fonts**: 75-90%
- **Handwriting**: 50-70%
- **Decorative fonts**: 60-80%
- **Backgrounds/watermarks**: 70-85%

**Always proofread**: OCR is a tool to assist, not replace human verification.

## Frequently Asked Questions

**Q: Is my image uploaded to a server?**  
A: No. All processing happens in your browser using Tesseract.js. Images never leave your device.

**Q: Can I extract text from PDFs?**  
A: Not directly. Convert PDF pages to images first (screenshot or PDF-to-image converter), then use this tool.

**Q: Why is handwriting accuracy so low?**  
A: Tesseract is trained primarily on printed fonts. Handwriting varies greatly and requires specialized recognition algorithms.

**Q: Can I add more languages?**  
A: The tool currently supports 12 languages. Additional languages would require loading extra Tesseract training data (increases page size).

**Q: How long does processing take?**  
A: Typically 3-15 seconds depending on image size, complexity, and device speed.

**Q: Can I extract text from multiple images at once?**  
A: Currently one image at a time. Process images sequentially and combine results afterward.

**Q: Why did OCR fail on my image?**  
A: Common reasons: wrong language selected, poor image quality, low resolution, extreme angles, low contrast. Try improving image quality first.

**Q: Is there a limit on how many images I can process?**  
A: No limit. Process as many as needed. Each image is independent.

**Q: Can I use this offline?**  
A: Partially. After first load, Tesseract models are cached. Subsequent uses may work offline, but initial load requires internet.

**Q: What about scanned documents with backgrounds?**  
A: OCR accuracy decreases with complex backgrounds. Use image editor to remove background or increase contrast before uploading.

**Q: Can I extract tables or structured data?**  
A: OCR extracts text linearly. Table structure may be lost. Manual reformatting often required.

**Q: Why are some characters wrong (O vs 0, l vs 1)?**  
A: Similar-looking characters are common OCR errors. Always verify numbers, codes, and similar characters manually.

## Related Tools

- **PDF Tools Suite**: Convert PDFs to images before OCR
- **Image Optimizer**: Enhance image quality before OCR
- **Photo Editor**: Adjust contrast, brightness, crop
- **Grammar Checker**: Proofread and correct OCR output
- **Text Transformer**: Format extracted text
- **Markdown Editor**: Format OCR text with Markdown

## Version Information

- **Last Updated**: January 2026
- **OCR Engine**: Tesseract.js 4.x
- **Tool Version**: 1.0
- **Framework**: Next.js 15, React 19, Panda CSS
- **Supported Languages**: 12 (with capability to add more)

## Support & Feedback

For issues, questions, or feature requests:
- Report bugs via GitHub issues
- Check OpenCode documentation at https://opencode.ai/docs
- Request additional languages via feature requests
- Check Tesseract.js docs for advanced configuration: https://tesseract.projectnaptha.com/

---

**Note**: OCR accuracy depends heavily on image quality. This tool provides excellent results with high-quality images but cannot overcome fundamental image quality issues. Always review and proofread extracted text before using in production or critical applications.
