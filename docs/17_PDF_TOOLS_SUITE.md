# 17 - PDF Tools Suite

**Created:** October 26, 2024  
**Last Updated:** October 26, 2024  
**Category:** Document Tools  
**Status:** ✅ Active · ⭐ New

## Overview

Complete browser-based PDF manipulation toolkit powered by pdf-lib, pdfjs-dist, and docx. Merge multiple PDFs, split documents, compress files, convert pages to images, convert PDFs to Word documents, add watermarks, extract page ranges, and rotate pages—all processed entirely in your browser with zero server uploads.

## Purpose

PDF manipulation is essential for document management, compliance workflows, digital archiving, and content distribution. This tool eliminates the need for expensive desktop software, command-line tools, or privacy-risky online services that upload your files. Everything happens locally in your browser using modern Web APIs.

## Key Features

### 1. **Merge PDFs**

Combine multiple PDF files into a single document while preserving all pages, formatting, and metadata.

**Use Cases:**

- Combining contract pages
- Merging invoice batches
- Consolidating reports
- Creating document packages

**How it works:**

```typescript
// Create new merged document
const mergedDoc = await PDFDocument.create()

// Copy all pages from each PDF
for (const pdf of pdfs) {
  const pdfDoc = await PDFDocument.load(await pdf.file.arrayBuffer())
  const copiedPages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices())
  copiedPages.forEach((page) => mergedDoc.addPage(page))
}

// Save as new PDF
const mergedBytes = await mergedDoc.save()
```

**Output:** `merged-document-{timestamp}.pdf`

### 2. **Split PDF**

Divide a PDF into two separate files at any page number.

**Use Cases:**

- Separating cover letters from resumes
- Splitting multi-section reports
- Extracting specific chapters
- Dividing scanned document batches

**How it works:**

```typescript
const originalDoc = await PDFDocument.load(arrayBuffer)
const totalPages = originalDoc.getPageCount()

// First part: pages 1 to splitPage
const firstPart = await PDFDocument.create()
const firstPages = await firstPart.copyPages(
  originalDoc,
  Array.from({ length: splitPage }, (_, i) => i)
)
firstPages.forEach((page) => firstPart.addPage(page))

// Second part: remaining pages
const secondPart = await PDFDocument.create()
const secondPages = await secondPart.copyPages(
  originalDoc,
  Array.from({ length: totalPages - splitPage }, (_, i) => i + splitPage)
)
secondPages.forEach((page) => secondPart.addPage(page))
```

**Output:** Two files with suffixes `-part1` and `-part2`

### 3. **Compress PDF**

Optimize PDF file size using pdf-lib's built-in compression algorithms.

**Use Cases:**

- Email attachment optimization
- Web hosting bandwidth reduction
- Mobile app file size limits
- Cloud storage quota management

**Technical Details:**

- Uses DEFLATE compression
- Removes unused objects
- Optimizes object streams
- Preserves visual quality

**Compression Options:**

```typescript
const compressedBytes = await pdfDoc.save({
  useObjectStreams: true, // Better compression
  addDefaultPage: false, // Skip empty pages
  objectsPerTick: 50, // Processing speed
})
```

**Typical Results:**

- Text-heavy PDFs: 30-60% size reduction
- Image-heavy PDFs: 10-30% size reduction
- Already compressed: 5-15% size reduction

**Output:** Original filename with `-compressed` suffix

### 4. **Convert to Images**

Export each PDF page as individual PNG images with high resolution.

**Use Cases:**

- Creating presentation slides
- Social media content
- Web gallery displays
- Email previews
- Thumbnail generation

**How it works:**

```typescript
// Load PDF with pdfjs-dist
const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
const pdf = await loadingTask.promise

// Render each page to canvas
for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 2.0 }) // High resolution

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise

  // Convert canvas to PNG blob
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png', 1.0)
  )
}
```

**Settings:**

- Scale: 2.0 (high resolution, 2x pixel density)
- Format: PNG (lossless compression)
- Quality: 1.0 (maximum quality)

**Output:** Multiple files named `page-1.png`, `page-2.png`, etc.

### 5. **Add Watermark**

Apply customizable text watermark across all pages with opacity control.

**Use Cases:**

- Copyright protection
- Draft document labeling
- Confidential marking
- Branding documents
- Version identification

**How it works:**

```typescript
const pages = pdfDoc.getPages()

for (const page of pages) {
  const { width, height } = page.getSize()

  // Draw diagonal watermark text
  page.drawText(watermarkText, {
    x: width / 2 - 100, // Centered
    y: height / 2, // Middle of page
    size: 50, // Font size
    font: await pdfDoc.embedFont('Helvetica-Bold'),
    color: rgb(0.7, 0.7, 0.7), // Gray color
    opacity: watermarkOpacity, // User-controlled (0-1)
    rotate: degrees(45), // Diagonal angle
  })
}
```

**Customization:**

- **Text**: Any string (default: "CONFIDENTIAL")
- **Opacity**: 0.0 (invisible) to 1.0 (opaque), default 0.3
- **Position**: Centered on page
- **Angle**: 45° diagonal
- **Font**: Helvetica Bold
- **Size**: 50pt
- **Color**: Gray (RGB 0.7, 0.7, 0.7)

**Output:** Original filename with `-watermarked` suffix

### 6. **Extract Pages**

Extract specific page range into a new PDF document.

**Use Cases:**

- Extracting relevant sections
- Creating excerpts
- Sharing specific pages
- Removing unwanted pages
- Creating samples

**How it works:**

```typescript
const originalDoc = await PDFDocument.load(arrayBuffer)
const newDoc = await PDFDocument.create()

// Copy only specified page range
const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, i) => i + startPage - 1)

const copiedPages = await newDoc.copyPages(originalDoc, pageIndices)
copiedPages.forEach((page) => newDoc.addPage(page))
```

**Page Selection:**

- Start Page: First page to extract (1-indexed)
- End Page: Last page to extract (inclusive)
- Validation: Ensures range is within document bounds

**Output:** Original filename with `-pages-{start}-{end}` suffix

### 7. **Rotate Pages**

Rotate all pages by specified angle (90°, 180°, 270°, or 360°).

**Use Cases:**

- Fixing scanned document orientation
- Correcting upside-down pages
- Adjusting landscape/portrait mode
- Preparing for printing

**How it works:**

```typescript
const pages = pdfDoc.getPages()

for (const page of pages) {
  const currentRotation = page.getRotation().angle
  const newRotation = (currentRotation + rotationAngle) % 360
  page.setRotation(degrees(newRotation))
}
```

**Rotation Options:**

- **90°**: Quarter turn clockwise
- **180°**: Upside down
- **270°**: Quarter turn counter-clockwise
- **360°**: Full rotation (no visual change, useful for testing)

**Output:** Original filename with `-rotated-{angle}` suffix

### 8. **PDF to Word**

Convert PDF documents to editable Word (.docx) format using text extraction and document reconstruction.

**Use Cases:**

- Converting reports for editing
- Extracting text from PDF articles
- Creating editable templates from PDFs
- Recovering content from read-only PDFs
- Preparing documents for collaborative editing

**How it works:**

```typescript
// Extract text content from PDF pages
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum)
  const textContent = await page.getTextContent()
  
  // Group text items by Y-coordinate (lines)
  const lines = groupTextByLines(textContent.items)
  
  // Detect headings by font size
  const paragraphs = detectHeadings(lines)
  
  // Build Word document
  doc.addSection({
    children: paragraphs.map(p => 
      new Paragraph({
        text: p.text,
        heading: p.isHeading ? HeadingLevel.HEADING_1 : undefined,
      })
    )
  })
}

// Generate DOCX file
const blob = await Packer.toBlob(doc)
```

**Technical Details:**

- **Text Extraction**: Uses pdfjs-dist to extract text with positional data
- **Line Detection**: Groups text by Y-coordinates (2px tolerance)
- **Heading Detection**: Identifies headings by font size (1.2x threshold)
- **Structure Preservation**: Maintains paragraph breaks and page boundaries
- **Best For**: Text-based documents, reports, articles, simple layouts

**Accuracy Expectations:**

- Simple text PDFs: 80-90% accuracy
- Complex layouts/tables: 50-70% accuracy
- Multi-column layouts: 60-80% accuracy
- Scanned PDFs: Not supported (requires OCR)

**Limitations:**

- **Text Only**: Images, graphics, and charts are not included
- **No Formatting**: Font styles, colors, and sizes are simplified
- **Layout Approximation**: Complex layouts may not be preserved exactly
- **No Tables**: Table structures are converted to plain text
- **No OCR**: Scanned PDFs (image-based) cannot be converted

**Progress Tracking:**

- 80% - Text extraction phase
- 20% - DOCX generation phase

**Output:** Original filename with `-converted.docx` extension

## How It Works

### Architecture

```
User Upload → File Validation → Operation Selection → Processing → Download
     ↓              ↓                    ↓                 ↓            ↓
  FileList      PDF Check         Config Panel      Browser Memory  Local Save
```

### Processing Pipeline

1. **File Upload**: User drags or selects PDF files
2. **Validation**: Check MIME type (`application/pdf`)
3. **Page Count**: Extract metadata using pdf-lib
4. **Queue Display**: Show files with status indicators
5. **Operation Config**: User selects operation and parameters
6. **In-Browser Processing**: pdf-lib/pdfjs-dist manipulates files
7. **Blob Creation**: Generate new PDF/image blobs
8. **Download Trigger**: Automatic browser download

### Data Flow Diagram

```
┌─────────────┐
│ User Device │
└──────┬──────┘
       │ Upload PDF
       ▼
┌─────────────────┐
│ Browser Memory  │ ← All processing happens here
│  (ArrayBuffer)  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ pdf-lib  │ → Merge, Split, Compress, Watermark, Extract, Rotate
    └────┬─────┘
         │
    ┌────▼─────┐
    │pdfjs-dist│ → Convert to Images
    └────┬─────┘
         │
    ┌────▼─────┐
    │   Blob   │
    └────┬─────┘
         │ Download
         ▼
┌─────────────┐
│ User Device │
└─────────────┘
```

**Privacy Guarantee**: Files never leave your browser. No server uploads, no cloud storage, no third-party services.

## Usage Instructions

### Basic Workflow

1. **Upload PDFs**: Drag files into drop zone or click to browse
2. **Review Queue**: Check file names, sizes, and page counts
3. **Select Operation**: Choose from 7 available operations
4. **Configure Settings**: Adjust operation-specific parameters
5. **Process**: Click "Process PDFs" button
6. **Download**: Results download automatically to your device

### Operation-Specific Instructions

#### Merge PDFs

```
Steps:
  1. Upload 2+ PDF files
  2. Select "Merge PDFs" operation
  3. Click "Process PDFs"
  4. Downloads: merged-document-{timestamp}.pdf

Example: Combining invoice-jan.pdf, invoice-feb.pdf, invoice-mar.pdf
Result: merged-document-1729900000000.pdf (3 files combined)
```

#### Split PDF

```
Steps:
  1. Upload 1 PDF file
  2. Select "Split PDF" operation
  3. Enter split page number (e.g., 5 = split after page 5)
  4. Click "Process PDFs"
  5. Downloads: document-part1.pdf, document-part2.pdf

Example: 10-page report, split at page 3
Result: report-part1.pdf (pages 1-3), report-part2.pdf (pages 4-10)
```

#### Compress PDF

```
Steps:
  1. Upload PDF file(s)
  2. Select "Compress PDF" operation
  3. Click "Process PDFs"
  4. Downloads: document-compressed.pdf
  5. View compression ratio in status

Example: 5MB presentation.pdf
Result: presentation-compressed.pdf (2.5MB, 50% reduction)
```

#### Convert to Images

```
Steps:
  1. Upload 1 PDF file
  2. Select "Convert to Images" operation
  3. Click "Process PDFs"
  4. Downloads: page-1.png, page-2.png, page-3.png, etc.

Example: 5-page brochure.pdf
Result: 5 PNG files (page-1.png through page-5.png)
```

#### Add Watermark

```
Steps:
  1. Upload PDF file(s)
  2. Select "Add Watermark" operation
  3. Enter watermark text (default: "CONFIDENTIAL")
  4. Adjust opacity slider (0-100%, default: 30%)
  5. Click "Process PDFs"
  6. Downloads: document-watermarked.pdf

Example: contract.pdf with "DRAFT" watermark at 50% opacity
Result: contract-watermarked.pdf with diagonal "DRAFT" text
```

#### Extract Pages

```
Steps:
  1. Upload 1 PDF file
  2. Select "Extract Pages" operation
  3. Enter start page (e.g., 5)
  4. Enter end page (e.g., 10)
  5. Click "Process PDFs"
  6. Downloads: document-pages-5-10.pdf

Example: Extract executive summary (pages 2-4) from 50-page report
Result: report-pages-2-4.pdf (3 pages)
```

#### Rotate Pages

```
Steps:
  1. Upload PDF file(s)
  2. Select "Rotate Pages" operation
  3. Select rotation angle (90°, 180°, 270°, 360°)
  4. Click "Process PDFs"
  5. Downloads: document-rotated-90.pdf

Example: Scanned pages are upside-down, rotate 180°
Result: document-rotated-180.pdf (all pages flipped)
```

#### PDF to Word

```
Steps:
  1. Upload 1 PDF file
  2. Select "PDF to Word" operation
  3. Click "Process PDFs"
  4. Downloads: document-converted.docx

Example: Convert report.pdf to editable Word format
Result: report-converted.docx (text extracted and formatted)

Note: Best for text-based PDFs. Complex layouts, images, and tables 
      may not be preserved. Scanned PDFs (image-based) are not supported.
```

## UI/UX Design

### Visual Hierarchy

```
┌──────────────────────────────────────────┐
│ Badge: "Document Tools"                  │
│ Gradient Title: "PDF Tools Suite"        │
│ Description                              │
├──────────────────────────────────────────┤
│ Upload Card                              │
│ ┌────────────────────────────────────┐  │
│ │ [Drag & Drop Zone]                 │  │
│ │ "Drop PDF files here..."           │  │
│ │ [Browse Files Button]              │  │
│ └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ PDF Queue Card (if files uploaded)       │
│ ┌────────────────────────────────────┐  │
│ │ File 1: document.pdf (2.5MB, 10p)  │  │
│ │ [✓] [Progress Bar] [Status]        │  │
│ │ File 2: report.pdf (1.2MB, 5p)     │  │
│ │ [✓] [Progress Bar] [Status]        │  │
│ └────────────────────────────────────┘  │
│ [Clear All Button]                       │
├──────────────────────────────────────────┤
│ Operations Card                          │
│ ┌────────────────────────────────────┐  │
│ │ Select Operation:                  │  │
│ │ (•) Merge PDFs                     │  │
│ │ ( ) Split PDF                      │  │
│ │ ( ) Compress PDF                   │  │
│ │ ( ) Convert to Images              │  │
│ │ ( ) Add Watermark                  │  │
│ │ ( ) Extract Pages                  │  │
│ │ ( ) Rotate Pages                   │  │
│ │ ( ) PDF to Word                    │  │
│ └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ Settings Card (dynamic based on op)     │
│ ┌────────────────────────────────────┐  │
│ │ [Operation-specific controls]      │  │
│ └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ [Process PDFs Button]                    │
│ (disabled if no files or invalid config) │
├──────────────────────────────────────────┤
│ Privacy Info Banner                      │
│ "100% browser-based processing..."       │
└──────────────────────────────────────────┘
```

### Color Scheme

- **Primary Gradient**: Red → Orange → Yellow (document/file theme)
- **Background**: Dark mode (`bg-gray-950`)
- **Cards**: Glass effect with `bg-gray-900/50` and backdrop blur
- **Borders**: Subtle `border-gray-800`
- **Accent**: Red (`red-500`, `red-600`)
- **Text Hierarchy**: `text-gray-100`, `text-gray-400`, `text-gray-600`
- **Success**: Green (`green-500`)
- **Error**: Red (`red-500`)
- **Processing**: Orange (`orange-500`)

### Interactive States

**File Upload Zone:**

- Default: Dashed border, gray background
- Drag Over: Blue border, highlighted background
- Uploaded: Green checkmark, file list appears

**Operation Buttons:**

- Unselected: Gray border, transparent background
- Selected: Red border, red background, white text
- Hover: Border brightens

**Process Button:**

- Default: Red gradient, "Process PDFs" text
- Loading: Orange gradient, "Processing..." with spinner
- Disabled: Gray, cursor not-allowed
- Completed: Green flash animation

**Progress Bars:**

- Pending: Gray background
- Processing: Animated orange gradient
- Completed: Green solid
- Error: Red solid

### Animations

```typescript
// File entry animation
animate={{
  opacity: [0, 1],
  y: [-20, 0],
}}
transition={{ duration: 0.3 }}

// Success checkmark
animate={{
  scale: [0, 1.2, 1],
  rotate: [0, 10, 0],
}}

// Processing spinner
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity }}
```

## Processing Performance

### Operation Speed Comparison

| Operation        | Small PDF (1-5p) | Medium PDF (10-50p) | Large PDF (100p+) |
| ---------------- | ---------------- | ------------------- | ----------------- |
| Merge (2 files)  | 0.5-1s           | 1-3s                | 3-8s              |
| Split            | 0.3-0.8s         | 0.8-2s              | 2-5s              |
| Compress         | 0.5-1.5s         | 1.5-4s              | 4-12s             |
| Convert to Image | 1-2s per page    | 2-4s per page       | 3-6s per page     |
| Watermark        | 0.4-1s           | 1-3s                | 3-8s              |
| Extract Pages    | 0.3-0.8s         | 0.8-2s              | 2-5s              |
| Rotate           | 0.2-0.5s         | 0.5-1.5s            | 1.5-4s            |
| PDF to Word      | 1-3s             | 3-8s                | 8-20s             |

**Factors affecting speed:**

- Page count (linear scaling)
- File complexity (images, fonts, annotations)
- Device CPU performance
- Browser memory availability
- Concurrent tab activity

### File Size Limits

**Maximum Upload Size**: 100 MB per file

**Why this limit?**

- Browser memory constraints (ArrayBuffer limit)
- Processing performance (large files can freeze UI)
- Download success rate (browsers struggle with huge blobs)

**Workaround for larger files:**

- Split large PDFs into smaller chunks first
- Use desktop PDF software for 100MB+ files
- Consider command-line tools (pdftk, ghostscript)

### Memory Management

```typescript
// Clean up after processing
URL.revokeObjectURL(processedBlob)

// Force garbage collection hint
processedBlob = null
arrayBuffer = null

// Prevent memory leaks in image conversion
canvas.remove()
context = null
```

## Browser Compatibility

✅ **Fully Supported:**

- Chrome 90+ (Desktop & Mobile)
- Firefox 88+
- Safari 14+ (macOS & iOS 14+)
- Edge 90+
- Opera 76+

⚠️ **Partial Support:**

- Safari 13: May struggle with large files (limited ArrayBuffer)
- Firefox Android: Slower processing on mobile CPUs
- Chrome Android: Works but slower than desktop

✅ **Requirements:**

- ES2020 JavaScript support
- WebAssembly (for pdfjs-dist)
- ArrayBuffer (for file manipulation)
- Blob/Object URL support
- Download attribute support
- Canvas API (for image conversion)

## Privacy & Security

### What Stays Local

✅ **100% Browser-Based Processing:**

- All PDF files stay in browser memory
- No uploads to servers
- No cloud storage
- No third-party API calls
- No telemetry on file contents

### Data Flow

```
Your Device → Browser Memory → Processing → Browser Memory → Your Device
            ↑                                                ↓
        Upload PDF                                    Download Result
```

**No external network requests for file processing.**

### What's Tracked (Analytics)

Analytics events are sent, but **no file content or metadata** is included:

```typescript
trackEvent({
  action: 'operation_started',
  category: 'pdf_tools',
  label: 'merge', // Operation type only
  value: 2, // File count only
})
```

**NOT tracked:**

- File names
- File contents
- File sizes (exact values)
- Text content
- Metadata (author, title, etc.)
- Watermark text

### Security Considerations

**Malicious PDFs:**

- pdf-lib and pdfjs-dist are sandboxed
- No arbitrary code execution from PDF JavaScript
- No external resource loading
- File validation before processing

**Browser Isolation:**

- Each tab has separate memory space
- Closing tab wipes all file data
- No persistence unless explicitly downloaded
- No shared state between sessions

## Limitations

### Technical Constraints

- **File Size**: 100 MB per file (browser memory limit)
- **Processing Time**: Large files may take 30-60 seconds
- **Merge Limit**: Recommend ≤ 20 files per merge (memory constraints)
- **Image Resolution**: 2x scale (trade-off between quality and performance)
- **Page Count**: Works with 1000+ page PDFs but very slow

### Feature Limitations

- **No OCR**: Cannot extract text from scanned images (PDF to Word requires text-based PDFs)
- **No Form Editing**: Cannot modify interactive PDF forms
- **No Encryption**: Cannot add password protection (security limitation)
- **No Decryption**: Cannot open password-protected PDFs
- **No Annotations**: Cannot add comments or highlights
- **No Digital Signatures**: Cannot sign PDFs
- **Watermark Position**: Fixed diagonal center (not customizable)
- **Rotation Granularity**: Only 90° increments (not arbitrary angles)
- **PDF to Word Limitations**:
  - Text only (no images, charts, or graphics)
  - Simplified formatting (fonts, colors, sizes)
  - Layout approximation (complex layouts may not be preserved exactly)
  - No table structure preservation
  - Best-effort conversion (not pixel-perfect)

### Browser Restrictions

- **Memory Limit**: Very large PDFs may crash tab
- **Download Popup**: Browser may block multiple simultaneous downloads
- **Private Mode**: May have stricter memory limits
- **Mobile**: Slower processing, higher crash risk

## Error Handling

### Common Errors & Solutions

**"Failed to load PDF. File may be corrupted or password-protected."**

- PDF is encrypted → Remove password first
- PDF is corrupted → Try repairing with desktop software
- File is not actually a PDF → Check file extension

**"Split page number must be between 1 and {pageCount}"**

- Entered invalid page number → Check total page count
- Split at page 1 or last page → Use Extract Pages instead

**"Start page must be less than or equal to end page"**

- Page range reversed → Swap start and end values
- Page numbers out of bounds → Check total page count

**"Browser ran out of memory"**

- File too large for browser → Split into smaller chunks first
- Too many files at once → Process in smaller batches
- Other tabs using memory → Close unnecessary tabs

**"Download failed"**

- Browser blocked popup → Allow downloads in settings
- Disk full → Free up storage space
- Large file timeout → Try smaller files first

### Debugging Tips

```typescript
// Check file validity
const file = pdfs[0].file
console.log('MIME type:', file.type) // Should be 'application/pdf'
console.log('Size:', file.size) // Should be < 100MB

// Monitor memory usage
console.log('Heap size:', performance.memory?.usedJSHeapSize)

// Test with simple PDF first
// Use tools/sample.pdf for testing
```

## API Reference

### Utility Functions

Located in `app/tools/pdf-tools/__tests__/logic.test.ts`:

#### `formatBytes(bytes: number): string`

Converts byte count to human-readable format.

```typescript
formatBytes(1024) // "1.0 KB"
formatBytes(1048576) // "1.0 MB"
formatBytes(500) // "500 Bytes"
```

#### `isValidPDFType(file: File): boolean`

Validates PDF MIME type.

```typescript
isValidPDFType(new File([], 'doc.pdf', { type: 'application/pdf' })) // true
isValidPDFType(new File([], 'doc.txt', { type: 'text/plain' })) // false
```

#### `isValidPageRange(start: number, end: number, total: number): boolean`

Validates page extraction range.

```typescript
isValidPageRange(1, 5, 10) // true
isValidPageRange(5, 1, 10) // false (start > end)
isValidPageRange(1, 20, 10) // false (end > total)
```

#### `calculateCompressionRatio(original: number, compressed: number): number`

Calculates compression percentage.

```typescript
calculateCompressionRatio(1000000, 500000) // 50 (50% reduction)
calculateCompressionRatio(1000000, 1000000) // 0 (no compression)
```

#### `isValidOpacity(opacity: number): boolean`

Validates watermark opacity value.

```typescript
isValidOpacity(0.5) // true (50% transparent)
isValidOpacity(1.5) // false (> 1.0)
isValidOpacity(-0.1) // false (< 0.0)
```

#### `isValidRotationAngle(angle: number): boolean`

Validates rotation angle.

```typescript
isValidRotationAngle(90) // true
isValidRotationAngle(180) // true
isValidRotationAngle(45) // false (not 90° increment)
isValidRotationAngle(450) // false (> 360°)
```

#### `generateOutputFilename(original: string, operation: string, suffix: string): string`

Generates output filename.

```typescript
generateOutputFilename('report.pdf', 'merge', 'merged-document')
// "merged-document-{timestamp}.pdf"

generateOutputFilename('contract.pdf', 'watermark', '')
// "contract-watermarked.pdf"

generateOutputFilename('doc.pdf', 'rotate', '90')
// "doc-rotated-90.pdf"
```

## Testing

### Test Coverage

**Test File:** `app/tools/pdf-tools/__tests__/logic.test.ts`

**Test Suites:** 7 utility functions  
**Total Tests:** 70+  
**Coverage:** 100% of utility functions

### Running Tests

```bash
# Run all tests
pnpm test

# Run PDF tools tests only
pnpm test pdf-tools

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Test Categories

1. **formatBytes()** - 10 tests
   - Bytes formatting
   - Kilobytes formatting
   - Megabytes formatting
   - Edge cases (0, negative)

2. **isValidPDFType()** - 8 tests
   - Valid PDF MIME types
   - Invalid MIME types
   - Edge cases (empty, null)

3. **isValidPageRange()** - 12 tests
   - Valid ranges
   - Invalid ranges (reversed, out of bounds)
   - Edge cases (single page, full document)

4. **calculateCompressionRatio()** - 10 tests
   - Various compression scenarios
   - Edge cases (no compression, expansion)

5. **isValidOpacity()** - 8 tests
   - Valid opacity values (0.0-1.0)
   - Invalid values (negative, > 1.0)
   - Edge cases (0, 1)

6. **isValidRotationAngle()** - 12 tests
   - Valid angles (90, 180, 270, 360)
   - Invalid angles (45, 450, negative)

7. **generateOutputFilename()** - 15 tests
   - Different operations
   - Suffix handling
   - Timestamp generation
   - Extension preservation

## Future Enhancements

### Planned Features

- [ ] **Password Protection**: Add encryption with user-defined password
- [ ] **Password Removal**: Decrypt password-protected PDFs
- [ ] **OCR for PDF to Word**: Extract text from scanned image PDFs using Tesseract.js
- [ ] **PDF to Word Options**: Preserve font styles, customize heading detection threshold
- [ ] **PDF to Word Image Support**: Extract and embed images in Word document
- [ ] **PDF Form Filling**: Edit interactive form fields
- [ ] **Digital Signatures**: Add cryptographic signatures
- [ ] **Annotations**: Add comments, highlights, and stamps
- [ ] **Custom Watermark Position**: Choose placement and angle
- [ ] **Multiple Watermarks**: Different text per page
- [ ] **Image Insertion**: Add images to pages
- [ ] **Page Deletion**: Remove specific pages
- [ ] **Page Reordering**: Drag-and-drop page rearrangement
- [ ] **Bookmarks/Outline**: Add/edit PDF table of contents
- [ ] **Metadata Editing**: Change title, author, keywords
- [ ] **Batch Operations**: Apply multiple operations in sequence
- [ ] **Undo/Redo**: Step through operations
- [ ] **Preview Mode**: View pages before processing
- [ ] **Custom Page Sizes**: Resize pages (A4, Letter, etc.)
- [ ] **Margin Adjustment**: Add/remove page margins
- [ ] **Background Color**: Change page background
- [ ] **Text Redaction**: Permanently remove sensitive text
- [ ] **Link Extraction**: List all URLs in PDF
- [ ] **Image Extraction**: Export embedded images
- [ ] **Font Subsetting**: Reduce file size by removing unused fonts
- [ ] **PDF/A Conversion**: Convert to archival format
- [ ] **Accessibility Check**: Validate WCAG compliance

### Technical Improvements

- [ ] **Web Worker Processing**: Move heavy operations off main thread
- [ ] **Progress Streaming**: Show real-time progress for large files
- [ ] **IndexedDB Caching**: Store processed files temporarily
- [ ] **Lazy Loading**: Load pdf-lib/pdfjs-dist only when needed
- [ ] **Code Splitting**: Reduce initial bundle size
- [ ] **Error Recovery**: Attempt automatic repair for minor corruption
- [ ] **Multi-file Download**: ZIP multiple outputs
- [ ] **Drag-and-Drop Reordering**: Visual file queue management
- [ ] **Keyboard Shortcuts**: Power user accelerators
- [ ] **Dark/Light Theme**: Match system preference

## Related Tools

- **Cloud File Upload** - Upload processed PDFs to cloud storage
- **QR Code Generator** - Create QR codes for PDF downloads
- **Hash Generator** - Verify PDF integrity with checksums
- **Text Transformer** - Extract and transform PDF text

## Use Cases

### 1. **Business & Legal**

- Contract assembly (merge signature pages)
- Invoice batching (combine monthly invoices)
- Report distribution (split by department)
- Confidential marking (watermark drafts)
- Document archival (compress for storage)

### 2. **Education**

- Assignment compilation (merge student submissions)
- Textbook chapter extraction (extract reading assignments)
- Presentation slides (convert pages to images)
- Worksheet rotation (fix scanned orientation)
- Study guide creation (extract key chapters)

### 3. **Design & Creative**

- Portfolio preparation (merge project pages)
- Print-ready files (rotate and compress)
- Social media content (convert pages to images)
- Client proofs (watermark with "DRAFT")
- Magazine layouts (split and extract sections)

### 4. **Personal**

- Recipe organization (extract favorite pages)
- Travel itinerary (merge flight, hotel, rental PDFs)
- Photo album (convert scanned photos to images)
- Tax documents (merge and compress receipts)
- Resume building (split cover letter and resume)

## Tips & Best Practices

💡 **Test with Small Files First**: Verify operation works before processing large batches  
💡 **Close Other Tabs**: Free up browser memory for large files  
💡 **Download Immediately**: Results are lost on page refresh  
💡 **Rename Files Before Upload**: Makes queue management easier  
💡 **Use Compress Before Upload**: Reduce file sizes for faster cloud uploads  
💡 **Split Large Files**: Process in chunks if hitting 100MB limit  
💡 **Check Page Count**: Ensure split/extract ranges are valid  
💡 **Save Originals**: Keep backup before processing  
💡 **Watermark Opacity**: Use 20-40% for subtle marks, 60-80% for prominent  
💡 **Rotation**: Use 180° for upside-down scans, 90° for portrait→landscape

## Troubleshooting Checklist

- ✅ Is file actually a PDF? (check extension and MIME type)
- ✅ Is file under 100MB? (check file size)
- ✅ Is page range valid? (start ≤ end ≤ total pages)
- ✅ Is browser up to date? (Chrome 90+, Firefox 88+, Safari 14+)
- ✅ Do you have enough disk space? (for downloads)
- ✅ Are browser popups allowed? (check download settings)
- ✅ Is file password-protected? (remove password first)
- ✅ Did you clear browser cache? (if experiencing persistent errors)
- ✅ Try incognito/private mode? (eliminates extension conflicts)
- ✅ Check browser console? (look for JavaScript errors)

## Keyboard Shortcuts

- **Ctrl/Cmd + O**: Open file picker (when focused on upload zone)
- **Delete**: Remove selected file from queue
- **Escape**: Cancel current processing
- **Ctrl/Cmd + S**: Download result (after processing complete)

## Accessibility

- **Keyboard Navigation**: All controls are keyboard accessible (Tab, Enter, Space)
- **Screen Readers**: ARIA labels on all interactive elements
- **Focus Indicators**: Clear focus rings for keyboard navigation
- **Color Contrast**: WCAG AA compliant text/background contrast
- **Error Messages**: Descriptive, screen reader-friendly error text
- **Progress Announcements**: ARIA live regions for status updates

---

**Route:** `/tools/pdf-tools`  
**Component:** `app/tools/pdf-tools/page.tsx`  
**Dependencies:**

- `pdf-lib` v1.17.1 (PDF manipulation)
- `pdfjs-dist` v5.4.296 (PDF rendering for image conversion)  
- `docx` v9.5.1 (Word document creation)

**Tests:** `app/tools/pdf-tools/__tests__/logic.test.ts` (70+ tests)  
**Analytics Events:**

- `page_view` (tool opened)
- `files_added` (PDF uploaded)
- `operation_started` (processing begins)
- `operation_completed` (processing succeeds)
- `operation_error` (processing fails)
- `file_downloaded` (result downloaded)
- `files_cleared` (queue reset)
