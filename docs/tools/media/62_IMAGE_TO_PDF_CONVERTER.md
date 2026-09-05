# 62 - Image to PDF Converter

**Created:** January 2, 2026  
**Last Updated:** January 2, 2026  
**Category:** Media Tools  
**Status:** ✅ Active · ⭐ New

---

## Overview

The Image to PDF Converter is a browser-based tool that instantly converts JPG, PNG, WebP, and other image formats into professional PDF documents. Users can combine multiple images into a single PDF with customizable page sizes (A4, Letter, Legal, A3, A5), orientations (portrait/landscape), image fit modes, and margins. With optional OCR (Optical Character Recognition) powered by Tesseract.js, the tool can extract text from images to create searchable PDFs—all without uploading files to any server.

## Purpose

This tool addresses essential document creation and image management needs for various professionals and use cases:

- **Document Digitization:** Convert scanned documents, receipts, contracts, and forms into organized PDF files for archival and sharing
- **Multi-Image PDFs:** Combine multiple photos, screenshots, or scanned pages into a single cohesive document
- **Privacy Protection:** All processing happens locally in the browser—no files uploaded to servers, ensuring complete data confidentiality
- **Professional Formatting:** Customize page sizes, orientations, and layouts to match specific document requirements (A4 reports, Letter presentations, etc.)
- **Searchable PDFs:** Enable OCR to extract text from images, making scanned documents searchable and text-selectable
- **Flexible Layouts:** Choose from four image fit modes (contain, cover, fill, scale-down) to control how images appear on PDF pages

## Key Features

### 1. Universal Image Format Support
Accepts all common image formats via HTML5 File API:
- **Raster formats:** JPEG/JPG, PNG, WebP, GIF, BMP, TIFF
- **Modern formats:** AVIF (where browser-supported), HEIC (after conversion)
- **Max file size:** 10MB per image (configurable via maxSize prop)
- **Batch upload:** Unlimited images (limited only by browser memory)

### 2. Five Standard Page Sizes
Industry-standard page dimensions in millimeters:
- **A4:** 210 × 297 mm (international standard, most common for documents)
- **Letter:** 216 × 279 mm (8.5" × 11", US standard)
- **Legal:** 216 × 356 mm (8.5" × 14", US legal documents)
- **A3:** 297 × 420 mm (large format, posters and diagrams)
- **A5:** 148 × 210 mm (small format, booklets and flyers)

### 3. Portrait and Landscape Orientations
Toggle between two page orientations:
- **Portrait:** Vertical orientation (width < height), default for most documents
- **Landscape:** Horizontal orientation (width > height), ideal for wide images and presentations

### 4. Four Image Fit Modes
Control how images are positioned on PDF pages:
- **Contain (default):** Fits entire image within page boundaries while maintaining aspect ratio, adds letterboxing if needed
- **Cover:** Fills entire page while maintaining aspect ratio, crops overflow areas
- **Fill:** Stretches image to fill page completely, may distort aspect ratio
- **Scale-down:** Shrinks large images to fit page but never enlarges small images

### 5. Adjustable Page Margins
Slider control for margin spacing (0-50mm in 5mm increments):
- **0mm:** No margins, images extend to page edges (full bleed)
- **10mm (default):** Standard margin for professional documents
- **20-30mm:** Wide margins for binding or annotations
- **40-50mm:** Extra-wide margins for special formatting needs

### 6. Optional OCR (Optical Character Recognition)
Tesseract.js integration for text extraction:
- **Engine:** Tesseract 5.0 (industry-standard open-source OCR)
- **Language:** English (eng) trained data (~2MB download)
- **Accuracy:** 85-95% for clear, high-resolution text images
- **Output:** Searchable text layer behind image in PDF (invisible but selectable)
- **Use cases:** Scanned documents, photos of text, screenshots with text content

### 7. Real-Time Progress Tracking
Visual feedback during PDF generation:
- **Progress bar:** 0-100% indicating images processed
- **Status indicators:** "Pending", "Processing", "Completed", "Error" badges on each image
- **OCR progress:** Separate status messages during text extraction ("Loading OCR engine", "Extracting text from image 3/10")
- **Processing order:** Sequential processing in the order images appear in the grid

### 8. Interactive Image Management
Drag-and-drop interface with preview grid:
- **Drag & drop zone:** Click or drag images onto the upload area
- **Preview thumbnails:** 16:9 aspect ratio cards showing image content
- **Reorderable grid:** Images can be removed individually via X button
- **Image metadata:** File name, dimensions (width × height), file size in KB
- **Responsive grid:** 1-4 columns depending on screen size

### 9. High-Quality JPEG Encoding
Image conversion settings for optimal output:
- **Canvas rendering:** Images converted to canvas before PDF embedding
- **JPEG quality:** 0.95 (95%) ensures minimal visual quality loss
- **Color space:** RGB maintained from source images
- **Alpha channel handling:** Transparent PNGs converted to white background in JPEG

### 10. Instant Download with Timestamped Names
Generated PDFs are downloaded immediately:
- **File naming:** `images-to-pdf-{timestamp}.pdf` (e.g., `images-to-pdf-1704153600000.pdf`)
- **Download trigger:** Browser's native download mechanism (no server round-trip)
- **File size:** Depends on image count, resolution, and quality settings

## How It Works

### Core TypeScript Interfaces

```typescript
interface ImageFile {
  id: string
  file: File
  preview: string                    // Object URL for thumbnail
  width: number                      // Original image width in pixels
  height: number                     // Original image height in pixels
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5'
type PageOrientation = 'portrait' | 'landscape'
type ImageFit = 'contain' | 'cover' | 'fill' | 'scale-down'

const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
}
```

### Image Dimension Loading

```typescript
const loadImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)  // Free memory after loading
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
```

### Image Fit Calculation Algorithm

```typescript
// Calculate image dimensions based on fit mode
const availableWidth = pageWidth - margin * 2
const availableHeight = pageHeight - margin * 2

let imgWidth = availableWidth
let imgHeight = availableHeight
let x = margin
let y = margin

if (imageFit === 'contain' || imageFit === 'scale-down') {
  // Maintain aspect ratio and fit within page
  const imgAspectRatio = img.width / img.height
  const pageAspectRatio = availableWidth / availableHeight
  
  if (imgAspectRatio > pageAspectRatio) {
    // Image is wider - fit to width
    imgWidth = availableWidth
    imgHeight = availableWidth / imgAspectRatio
    y = margin + (availableHeight - imgHeight) / 2  // Center vertically
  } else {
    // Image is taller - fit to height
    imgHeight = availableHeight
    imgWidth = availableHeight * imgAspectRatio
    x = margin + (availableWidth - imgWidth) / 2  // Center horizontally
  }
} else if (imageFit === 'cover') {
  // Cover entire page while maintaining aspect ratio
  const imgAspectRatio = img.width / img.height
  const pageAspectRatio = availableWidth / availableHeight
  
  if (imgAspectRatio > pageAspectRatio) {
    imgHeight = availableHeight
    imgWidth = availableHeight * imgAspectRatio
    x = margin - (imgWidth - availableWidth) / 2  // Crop sides
  } else {
    imgWidth = availableWidth
    imgHeight = availableWidth / imgAspectRatio
    y = margin - (imgHeight - availableHeight) / 2  // Crop top/bottom
  }
}
// 'fill' mode uses full available space (no calculation needed)
```

### PDF Generation with OCR

```typescript
const generatePDF = async () => {
  // Get page dimensions based on orientation
  const pageDimensions = PAGE_SIZES[pageSize]
  const pageWidth = orientation === 'portrait' 
    ? pageDimensions.width 
    : pageDimensions.height
  const pageHeight = orientation === 'portrait' 
    ? pageDimensions.height 
    : pageDimensions.width
  
  // Create PDF document
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pageWidth, pageHeight],
  })
  
  // Load OCR worker if enabled
  let ocrWorker: Tesseract.Worker | null = null
  if (enableOCR) {
    setOcrProgress('Loading OCR engine...')
    const { createWorker } = await import('tesseract.js')
    ocrWorker = await createWorker('eng')  // ~2MB download
    setOcrProgress('OCR engine ready')
  }
  
  // Process each image
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    setProgress(((i + 1) / images.length) * 100)
    
    // Add new page for subsequent images
    if (i > 0) {
      pdf.addPage()
    }
    
    // Load image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = image.preview
    })
    
    // Calculate dimensions (see above algorithm)
    // ...
    
    // Extract text with OCR if enabled
    if (enableOCR && ocrWorker) {
      setOcrProgress(`Extracting text from image ${i + 1}/${images.length}...`)
      
      const { data: { text } } = await ocrWorker.recognize(img)
      
      // Add searchable text layer behind image
      if (text.trim()) {
        pdf.setFontSize(6)
        pdf.setTextColor(250, 250, 250)  // Very light gray (barely visible)
        
        const lines = pdf.splitTextToSize(text.trim(), imgWidth - 10)
        let textY = y + 4
        
        for (const line of lines) {
          if (textY < y + imgHeight - 4) {
            pdf.text(line, x + 5, textY)
            textY += 3  // Line height
          }
        }
      }
    }
    
    // Render image to canvas for JPEG conversion
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0, img.width, img.height)
    
    // Convert to JPEG at 95% quality
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    
    // Add image to PDF (on top of text layer)
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight)
    
    // Update status
    setImages(prev => 
      prev.map(img => 
        img.id === image.id ? { ...img, status: 'completed' } : img
      )
    )
  }
  
  // Cleanup OCR worker
  if (ocrWorker) {
    await ocrWorker.terminate()
  }
  
  // Download PDF
  const fileName = `images-to-pdf-${Date.now()}.pdf`
  pdf.save(fileName)
}
```

### Memory Management

```typescript
// Revoke Object URLs when images are removed
const removeImage = (id: string) => {
  const image = images.find(img => img.id === id)
  if (image) {
    URL.revokeObjectURL(image.preview)  // Free memory
  }
  setImages(prev => prev.filter(img => img.id !== id))
}

// Cleanup all URLs on unmount
useEffect(() => {
  return () => {
    for (const img of images) {
      URL.revokeObjectURL(img.preview)
    }
  }
}, [images])
```

## Usage Instructions

### Basic Workflow

1. **Upload Images**
   - Click the "Upload Images" card or drag and drop image files
   - Supported formats: JPEG, PNG, WebP, GIF, BMP, TIFF (max 10MB each)
   - Multiple images can be added at once
   - Thumbnails appear in a responsive grid (1-4 columns)

2. **Review Image Order**
   - Images are processed in the order they appear in the grid
   - Remove unwanted images by clicking the X button on each thumbnail
   - Use "Clear All" button to remove all images and start over

3. **Configure PDF Settings** (optional)
   - **Page Size:** Select from A4, Letter, Legal, A3, or A5
   - **Orientation:** Choose Portrait (vertical) or Landscape (horizontal)
   - **Image Fit:** Select how images fill pages (Contain, Cover, Fill, Scale-down)
   - **Margin:** Adjust spacing from page edges (0-50mm slider)
   - **OCR:** Toggle "Extract Text (OCR)" to create searchable PDFs

4. **Generate PDF**
   - Click "Generate PDF" button
   - Watch progress bar (0-100%) as images are processed
   - If OCR is enabled, additional status messages appear during text extraction
   - PDF downloads automatically when complete

5. **Download and Verify**
   - File is saved as `images-to-pdf-{timestamp}.pdf`
   - Open in PDF viewer to verify layout and quality
   - If OCR was enabled, test searchability by trying Ctrl+F in the PDF

### Common Use Cases

**Use Case 1: Scan Documents to PDF**
- Upload: Multiple photos of document pages taken with phone camera
- Settings: A4, Portrait, Contain fit, 10mm margin, OCR enabled
- Result: Professional multi-page PDF with searchable text
- Ideal for: Receipts, invoices, contracts, handwritten notes

**Use Case 2: Create Photo Album PDF**
- Upload: Family photos or event pictures (10-50 images)
- Settings: A4, Landscape, Cover fit, 5mm margin, OCR disabled
- Result: Full-page photo album suitable for printing or sharing
- Ideal for: Wedding photos, vacation albums, portfolio presentations

**Use Case 3: Combine Screenshots into Report**
- Upload: Screenshots from software, websites, or applications
- Settings: Letter, Portrait, Contain fit, 20mm margin, OCR disabled
- Result: Professional report with consistent page formatting
- Ideal for: Bug reports, tutorials, design mockups, documentation

**Use Case 4: Business Card Collection**
- Upload: Photos of business cards
- Settings: A5, Portrait, Contain fit, 5mm margin, OCR enabled
- Result: Searchable database of contact information
- Ideal for: Networking events, conference attendees, client management

**Use Case 5: Architecture/Design Portfolio**
- Upload: High-resolution design mockups or architectural renders
- Settings: A3, Landscape, Fill fit, 0mm margin, OCR disabled
- Result: Large-format presentation PDF suitable for printing
- Ideal for: Portfolio reviews, client presentations, print shops

**Use Case 6: Book Page Digitization**
- Upload: Photos of book pages (one page per photo)
- Settings: Letter, Portrait, Contain fit, 15mm margin, OCR enabled
- Result: Searchable digital copy of printed book
- Ideal for: Research notes, out-of-print books, personal library digitization

**Use Case 7: Poster/Flyer Creation**
- Upload: Single graphic design image
- Settings: A4, Portrait, Fill fit, 0mm margin, OCR disabled
- Result: Print-ready PDF at exact page size
- Ideal for: Event flyers, advertising posters, promotional materials

## Analytics Events

The tool tracks the following user interactions for usage analysis:

### Page View Event
```typescript
trackToolEvent('image_to_pdf_opened', {
  timestamp: new Date().toISOString(),
})
```
**Trigger:** Component mount (first page load)

### Image Upload Event
```typescript
trackToolEvent('images_added', {
  count: imageFiles.length,  // Number of images added
})
```
**Trigger:** When user selects/drops image files

### PDF Generation Started Event
```typescript
trackToolEvent('pdf_generation_started', {
  imageCount: images.length,
  pageSize,                  // 'A4', 'Letter', etc.
  orientation,               // 'portrait' or 'landscape'
  imageFit,                  // 'contain', 'cover', 'fill', 'scale-down'
  enableOCR,                 // true or false
})
```
**Trigger:** When user clicks "Generate PDF" button

### PDF Generation Success Event
```typescript
trackToolEvent('pdf_generated', {
  imageCount: images.length,
  pageSize,
  orientation,
  imageFit,
  enableOCR,
  duration,                  // Time in milliseconds
  success: true,
})
```
**Trigger:** After PDF is successfully generated and downloaded

### PDF Generation Failure Event
```typescript
trackToolEvent('pdf_generation_failed', {
  error: error.message,      // Error description
})
```
**Trigger:** If PDF generation encounters an error

## UI/UX Design

### Layout Structure (ASCII Diagram)

```
┌──────────────────────────────────────────────────────────────┐
│                   [FileText Icon]                            │
│          Convert Images to PDF • Free Forever                │
│                                                              │
│            Image to PDF Converter                            │
│                                                              │
│  Convert JPG, PNG, WebP, and other image formats to PDF...  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  📄 Upload Images                                      [🗑 Clear All] │
│  Select one or more images to convert to PDF.                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  [📁 Drag and drop zone]                              │ │
│  │  Click to browse or drag images here                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📷 10 images selected                                       │
│                                                              │
│  ┌─────────┬─────────┬─────────┬─────────┐                 │
│  │ [X] ✓   │ [X]     │ [X]     │ [X]     │                 │
│  │ img1.jpg│ img2.png│ img3.jpg│ img4.png│                 │
│  │ 1920×   │ 1080×   │ 3000×   │ 2560×   │                 │
│  │ 1080    │ 1920    │ 2000    │ 1440    │                 │
│  │ 125.5 KB│ 432.1 KB│ 892.3 KB│ 678.9 KB│                 │
│  └─────────┴─────────┴─────────┴─────────┘                 │
│  (6 more images...)                                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ⚙️ PDF Settings                                             │
│  Customize your PDF output                                   │
│                                                              │
│  Page Size                    Orientation                    │
│  [A4 (210 × 297 mm) ▾]       [Portrait ▾]                   │
│                                                              │
│  Image Fit                    Margin: 10mm                   │
│  [Contain (fit within page)▾] [━━●━━━━━━━━]                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  💡 Extract Text (OCR)                        [ O  ]  │   │
│  │  Convert image text to searchable PDF text            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              [████████████████░░░░] 75%                      │
│              Extracting text from image 8/10...              │
│                                                              │
│            [⬇ Generate PDF] (button)                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  💡 Pro Tips                                                 │
│  • Drag and drop multiple images to add them all at once     │
│  • Images are processed in the order they appear in the grid │
│  • Choose "Contain" to fit images without cropping           │
│  • Use "Cover" to fill the entire page with your images      │
│  • All processing happens locally - no uploads required      │
└──────────────────────────────────────────────────────────────┘
```

### Visual Design Details

**Color Palette:**
- Primary gradient: Blue (400-500) → Cyan (400-500) → Teal (400-500)
- Background: Dark glass (`gray.900/50` with `blur(16px)`)
- Accent colors: Blue for primary actions, Red for delete actions
- Status colors: Green (completed), Red (error)

**Typography:**
- Heading (h1): 4xl-6xl responsive, gradient text fill
- Card titles: Base size, medium weight, white
- Body text: Small/medium size, gray.200 primary, muted white secondary
- Labels: Small size, medium weight

**Interactive Elements:**
- Buttons: Primary blue with border, ghost red for delete
- Select dropdowns: Gray.800 background with blue focus ring
- Range slider: Gray.700 track, custom thumb styling
- Toggle switch: Blue (enabled), Gray (disabled)
- Remove buttons: Red overlay on hover

**Animations (Framer Motion):**
- Header: Fade in + slide up (0.5s)
- Upload card: Fade in + slide up (0.1s delay)
- Settings card: Fade in + slide up (0.2s delay)
- Generate button: Fade in + slide up (0.3s delay)
- Pro tips: Fade in + slide up (0.4s delay)
- Image cards: Scale in (0.8 → 1.0) with layout animation

**Responsive Breakpoints:**
- Mobile (base): Single column grid for images
- Tablet (sm): 2-column image grid
- Desktop (md): 3-column image grid, 2-column settings
- Wide (lg): 4-column image grid

### Accessibility Features

- Semantic HTML5 elements (`<main>`, `<label>`, `<select>`, `<button>`)
- ARIA labels on icon-only buttons (`aria-label="Remove image"`)
- ARIA roles on toggle switch (`role="switch"`, `aria-checked`)
- Keyboard navigation for all interactive elements
- Focus visible states with blue rings
- High contrast text (WCAG AA compliant)
- Alt text on image previews

## Performance Optimizations

### 1. Lazy Tesseract.js Loading
OCR library (~2MB) is loaded only when the user enables the "Extract Text (OCR)" toggle, not on initial page load. This reduces initial bundle size and improves Time to Interactive (TTI).

```typescript
if (enableOCR) {
  const { createWorker } = await import('tesseract.js')  // Dynamic import
  ocrWorker = await createWorker('eng')
}
```

### 2. Canvas Rendering Optimization
The `willReadFrequently: false` context option is set to optimize canvas for one-time rendering rather than repeated reads, improving GPU performance.

```typescript
const ctx = canvas.getContext('2d', { willReadFrequently: false })
```

### 3. Blob URL Memory Management
Object URLs created for image previews are explicitly revoked when images are removed or on component unmount, preventing memory leaks during long sessions.

```typescript
URL.revokeObjectURL(image.preview)  // Called on remove and unmount
```

### 4. Sequential Image Processing
Images are processed one at a time in a loop rather than parallel processing. This prevents browser memory exhaustion when handling many large images.

```typescript
for (let i = 0; i < images.length; i++) {
  // Process image i
  setProgress(((i + 1) / images.length) * 100)
}
```

### 5. High-Quality JPEG Compression
Images are converted to JPEG at 95% quality before embedding in PDF, balancing file size with visual quality. This typically reduces PDF size by 30-50% compared to lossless PNG.

```typescript
const imgData = canvas.toDataURL('image/jpeg', 0.95)
```

### 6. Debounced State Updates
Progress updates are throttled to avoid excessive re-renders during processing. React's state batching automatically groups updates within the same event loop.

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| **Chrome** | 76+ | Full support including FileReader API and canvas rendering |
| **Firefox** | 78+ | Full support with excellent PDF generation performance |
| **Safari** | 14+ | Full support; requires iOS 14+ for mobile Safari |
| **Edge** | 79+ | Full support (Chromium-based) |
| **Opera** | 63+ | Full support |
| **Mobile Safari** | 14+ | Works well; OCR may be slow on older devices |
| **Chrome Android** | 76+ | Full support with good performance on mid-range devices |
| **Samsung Internet** | 12+ | Full support |

**Requirements:**
- FileReader API (all modern browsers since 2015)
- Canvas API with toDataURL (universal support)
- Blob URL support (universal support)
- Minimum 2GB RAM recommended for OCR on mobile devices
- Minimum 4GB RAM recommended for processing 20+ high-res images

**Known Limitations:**
- OCR requires ~2MB download on first use (Tesseract trained data)
- Very large images (>20MP) may cause memory issues on mobile browsers
- OCR accuracy varies based on image quality (85-95% for clear text)
- HEIC images require browser conversion or server-side preprocessing

## Common Questions

### Q1: How many images can I convert at once?
**A:** There is no hard limit on the number of images, but browser memory is the practical constraint. Most modern computers can handle 50-100 images (10-20MB each) without issues. Mobile devices should limit to 10-20 images to avoid memory warnings.

### Q2: Does OCR work with handwritten text?
**A:** OCR (Tesseract.js) is optimized for printed text and performs poorly on handwriting. Accuracy for handwritten text is typically 20-40%, compared to 85-95% for clear printed text. For handwriting, consider specialized handwriting recognition services.

### Q3: Can I reorder images after uploading?
**A:** Currently, images cannot be reordered after upload. They are processed in the order they appear in the grid (top-left to bottom-right). To change order, remove images and re-upload them in the desired sequence.

### Q4: What happens to transparent PNG images?
**A:** Transparent areas in PNG images are converted to white backgrounds when embedded in the PDF as JPEG. If you need to preserve transparency, consider using a PDF creation tool that supports PNG embedding.

### Q5: Why does OCR take so long?
**A:** OCR text extraction typically takes 2-5 seconds per image, depending on image size and text complexity. For 10 images, expect 20-50 seconds total. The process is CPU-intensive and runs in a web worker to avoid blocking the UI.

### Q6: Can I edit the PDF after generation?
**A:** No, the tool generates a finalized PDF that is immediately downloaded. To make changes, you must adjust settings and regenerate the PDF. For post-generation editing, use dedicated PDF editors like Adobe Acrobat or online PDF editors.

### Q7: Is there a file size limit for the generated PDF?
**A:** No explicit limit, but PDFs with 100+ high-resolution images can exceed 100MB, which may cause browser memory issues. For large projects, consider splitting into multiple PDFs or reducing image resolution before upload.

### Q8: Why do my images look blurry in the PDF?
**A:** Blurriness can result from:
- **Fill mode stretching:** Low-res images stretched to fill pages (use Contain mode instead)
- **Excessive margin:** Large margins reduce image display size (reduce margin value)
- **Source image quality:** Low-resolution source images (minimum 1000×1000px recommended)
- **JPEG compression:** 95% quality is high but not lossless (unavoidable trade-off)

### Q9: Can I password-protect the PDF?
**A:** No, the current version does not support PDF encryption or password protection. For secure PDFs, generate the file first, then use a PDF security tool or Adobe Acrobat to add password protection.

### Q10: Does the tool work offline?
**A:** Partially. Once the page is loaded, basic PDF generation works offline. However, OCR requires downloading Tesseract trained data (~2MB) on first use, which needs an internet connection. Subsequent OCR operations work offline if the data is cached.

## Future Enhancements

- [ ] **Image Reordering:** Drag-and-drop to rearrange images before PDF generation
- [ ] **Custom Page Sizes:** Input custom width/height in mm or inches for non-standard formats
- [ ] **Batch Page Settings:** Apply different orientations or fits to specific pages
- [ ] **PDF Metadata Editing:** Set title, author, subject, keywords in PDF properties
- [ ] **Multi-Page Per Image:** Split large images across multiple PDF pages (useful for infographics)
- [ ] **Image Rotation:** 90°/180°/270° rotation controls for each image
- [ ] **Crop Tool:** In-browser image cropping before PDF embedding
- [ ] **Text Annotation Layer:** Add custom text overlays on top of images
- [ ] **Page Numbering:** Automatic page number insertion (footer/header)
- [ ] **Header/Footer Templates:** Custom header/footer text for all pages
- [ ] **Multi-Language OCR:** Support for languages beyond English (French, Spanish, Chinese, etc.)
- [ ] **OCR Proofreading:** Show extracted text for user verification before embedding
- [ ] **PDF Compression Options:** Choose between "High Quality", "Balanced", "Small Size" presets
- [ ] **PNG Transparency Preservation:** Embed PNGs without JPEG conversion to maintain alpha channel
- [ ] **PDF Merge:** Combine generated PDF with existing PDF files
- [ ] **Watermark Overlay:** Add text or image watermarks to each page
- [ ] **Background Color:** Set custom page background color instead of white
- [ ] **Border Styles:** Add decorative borders around images
- [ ] **Zoom-to-Fill:** Automatic intelligent cropping to remove empty margins from scanned documents
- [ ] **Image Enhancement:** Auto-adjust brightness, contrast, and sharpness before PDF embedding
- [ ] **QR Code Embedding:** Generate and embed QR codes on pages
- [ ] **Table of Contents:** Auto-generate TOC based on image filenames
- [ ] **PDF/A Standard:** Generate PDF/A-compliant documents for long-term archival
- [ ] **Cloud Storage Integration:** Direct upload to Google Drive, Dropbox, or OneDrive
- [ ] **Collaboration Sharing:** Generate shareable links for PDF preview before download

## Related Tools

1. **Video Converter & Compressor** (`/tools/media/video-converter`) - Convert videos between formats using FFmpeg.wasm
2. **Image Optimizer & Converter** (`/tools/media/image-optimizer`) - Compress and convert images before creating PDFs
3. **PDF Tools Suite** (`/tools/productivity/pdf-tools`) - Edit, merge, split, and manipulate existing PDF files
4. **File Inspector** (`/tools/development/file-inspector`) - Analyze image metadata (dimensions, format, EXIF)
5. **Cloud File Upload** (`/tools/productivity/cloud-file-upload`) - Upload generated PDFs to cloud storage
6. **Meme Generator** (`/tools/media/meme-generator`) - Add text overlays to images before conversion

## Tips & Best Practices

💡 **Use high-resolution source images** - Minimum 1000×1000px recommended for sharp PDF output; low-res images will appear pixelated

💡 **Choose "Contain" fit for documents** - Ensures entire page is visible without cropping; ideal for scanned receipts, contracts, forms

💡 **Use "Cover" fit for photo albums** - Fills entire page with no white space; perfect for full-bleed photo layouts

💡 **Enable OCR for scanned documents** - Makes text searchable and copyable; essential for digitized contracts, invoices, and reports

💡 **Adjust margins for binding** - Use 20-30mm margins if printing and binding; 0-5mm for screen-only PDFs

💡 **Process images in batches** - For 100+ images, split into multiple PDFs (20-30 images each) to avoid browser memory issues

💡 **Use landscape for wide images** - Screenshots and panoramic photos look better in landscape orientation

💡 **Clear images before new project** - Click "Clear All" to free browser memory between different conversion tasks

💡 **Verify OCR accuracy** - After generating searchable PDF, test Ctrl+F search to ensure text was extracted correctly

💡 **Optimize images before upload** - Use Image Optimizer tool first to reduce file sizes if working with very large photos (>10MB)

💡 **Choose A4 for international sharing** - A4 is the global standard; use Letter only for US-specific documents

💡 **Test with one image first** - Before batch-processing 50 images, generate a 1-page PDF to verify settings are correct

💡 **Use Legal size for contracts** - Legal (8.5" × 14") is standard for US legal documents and multi-page contracts

💡 **Disable OCR for photos** - OCR adds 2-5 seconds per image; skip it for pure photo albums with no text

💡 **Check file size before sharing** - Large PDFs (>25MB) may fail email attachment limits; consider splitting or compressing

## Additional Features

### Toast Notifications
The tool provides user feedback via toast messages (Sonner library):
- **Success toasts:** "Added 5 images", "PDF generated successfully! 🎉", "All images cleared"
- **Error toasts:** "Please select valid image files", "Failed to load some images", "Failed to generate PDF"
- **Position:** Bottom-right corner with auto-dismiss (3-5 seconds)

### Related Tools Component
Displays a carousel of related media tools below the main interface, encouraging users to explore other conversion utilities.

### Social Share Component
Enables users to share the tool on social media platforms (Twitter, Facebook, LinkedIn) with pre-populated messages highlighting key features.

### Tool Rating Component
Allows users to rate their experience (1-5 stars) and submit feedback, stored in Supabase for analytics and improvement tracking.

---

**Route:** `/tools/media/image-to-pdf`  
**Component:** `app/tools/media/image-to-pdf/page.tsx`  
**Dependencies:**
- `jspdf` ^2.5.1 - PDF generation library with canvas support
- `tesseract.js` ^5.0.0 - OCR engine for text extraction (optional, lazy-loaded)
- `framer-motion` - Animation library for UI transitions
- `lucide-react` - Icon library (FileText, Download, Settings, Trash2, etc.)
- `sonner` - Toast notification library for user feedback
- `react` 19 - Core framework with hooks (useState, useEffect, useCallback)
- Custom components: `DragDropZone`, `Button`, `Card`, `Progress`, `RelatedTools`, `SocialShare`, `ToolRating`
- `@/lib/services/analytics` - Event tracking service (trackToolEvent)
- `@/styled-system/css` - Panda CSS styling

**Test Coverage:** ✅ Partial - Component rendering tested (`page.test.tsx`)
