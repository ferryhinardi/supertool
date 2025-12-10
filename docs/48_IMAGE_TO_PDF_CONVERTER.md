# 48 - Image to PDF Converter

**Created:** December 2024  
**Last Updated:** December 2024  
**Category:** Media Tools  
**Status:** ✅ Active

## Overview

Browser-based image to PDF converter that allows users to combine multiple images (JPG, PNG, WebP) into a single PDF document. Supports customizable page sizes, orientations, margins, and image fit modes with complete client-side processing for maximum privacy.

## Purpose

Consolidating multiple images into a single PDF is a common need for documentation, presentations, reports, and file organization. This tool provides a simple, secure way to create PDFs from images without uploading files to external servers.

## Key Features

### 1. **Multi-Image Upload**

- Drag & drop or click to select
- Support for JPG, PNG, and WebP formats
- Multiple image selection at once
- Image preview with thumbnails
- Remove individual images or clear all

### 2. **PDF Customization**

- **Page Size Options:**
  - A4 (210 × 297mm)
  - Letter (215.9 × 279.4mm)
  - Legal (215.9 × 355.6mm)
- **Orientation:**
  - Portrait (default)
  - Landscape
- **Image Fit Modes:**
  - Contain: Fit entire image within page (default)
  - Cover: Fill page, may crop edges
  - Fill: Stretch to fill page (may distort)
- **Margin Control:**
  - Adjustable from 0-50mm
  - Slider with live preview

### 3. **Privacy-First Processing**

- 100% client-side PDF generation
- No files uploaded to servers
- No data stored or tracked (except anonymized analytics)
- Works offline after page load

### 4. **User-Friendly Interface**

- Real-time image preview grid
- Responsive design for mobile/tablet
- Accessible form controls with labels
- Toast notifications for feedback
- Loading states during generation

## How It Works

### PDF Generation Pipeline

```typescript
import { jsPDF } from 'jspdf'

const generatePDF = async () => {
  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.pageSize,
  })

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const imgData = await loadImage(img.url)
    
    if (i > 0) {
      pdf.addPage()
    }

    const { x, y, width, height } = calculateImagePosition(
      imgData,
      pdf.internal.pageSize,
      settings.margin,
      settings.imageFit
    )

    pdf.addImage(imgData, 'JPEG', x, y, width, height)
  }

  pdf.save('images.pdf')
}
```

### Image Fit Algorithms

**Contain (Default):**
```typescript
// Fit entire image within page margins
const scale = Math.min(
  maxWidth / imgWidth,
  maxHeight / imgHeight
)
// Center image on page
const x = margin + (maxWidth - imgWidth * scale) / 2
const y = margin + (maxHeight - imgHeight * scale) / 2
```

**Cover:**
```typescript
// Fill entire page, may crop
const scale = Math.max(
  maxWidth / imgWidth,
  maxHeight / imgHeight
)
// Center and crop
```

**Fill:**
```typescript
// Stretch to fill page (may distort)
const width = maxWidth
const height = maxHeight
// No aspect ratio preservation
```

## Usage Instructions

### Basic PDF Creation

1. **Upload Images**: 
   - Click "Select Files" or drag & drop
   - Select one or more image files
   - Preview appears below

2. **Adjust Settings** (optional):
   - Choose page size (A4, Letter, Legal)
   - Select orientation (Portrait/Landscape)
   - Pick image fit mode (Contain/Cover/Fill)
   - Adjust margins with slider

3. **Generate PDF**:
   - Click "Generate PDF" button
   - Wait for processing
   - PDF downloads automatically

4. **Manage Images**:
   - Remove individual images with X button
   - Clear all images with "Clear All"
   - Add more images anytime

### Recommended Settings

**For Documents:**
- Page Size: A4
- Orientation: Portrait
- Image Fit: Contain
- Margin: 10mm
- Use case: Scanned documents, receipts

**For Photos:**
- Page Size: Letter
- Orientation: Landscape
- Image Fit: Cover
- Margin: 0mm
- Use case: Photo albums, portfolios

**For Presentations:**
- Page Size: Letter
- Orientation: Landscape
- Image Fit: Contain
- Margin: 5mm
- Use case: Slide exports, reports

## Technical Implementation

### Dependencies

```json
{
  "jspdf": "^2.5.2"
}
```

### State Management

```typescript
interface ImageFile {
  id: string
  file: File
  url: string
  name: string
}

interface PDFSettings {
  pageSize: 'A4' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  imageFit: 'contain' | 'cover' | 'fill'
  margin: number
}

const [images, setImages] = useState<ImageFile[]>([])
const [settings, setSettings] = useState<PDFSettings>({
  pageSize: 'A4',
  orientation: 'portrait',
  imageFit: 'contain',
  margin: 10,
})
const [isGenerating, setIsGenerating] = useState(false)
```

### File Handling

```typescript
const handleFileSelect = (files: FileList) => {
  const validImages = Array.from(files).filter(file =>
    file.type.startsWith('image/')
  )

  if (validImages.length === 0) {
    toast.error('Please select valid image files')
    return
  }

  const newImages = validImages.map(file => ({
    id: crypto.randomUUID(),
    file,
    url: URL.createObjectURL(file),
    name: file.name,
  }))

  setImages(prev => [...prev, ...newImages])
  trackToolEvent('images_added', { count: newImages.length })
}
```

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  Header: Image to PDF Converter     │
├─────────────────────────────────────┤
│  Upload Section                     │
│  ┌───────────────────────────────┐ │
│  │  Drag & Drop Zone              │ │
│  │  or Click to Browse            │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  Image Preview Grid                 │
│  ┌────┐ ┌────┐ ┌────┐             │
│  │Img1│ │Img2│ │Img3│             │
│  │ X  │ │ X  │ │ X  │             │
│  └────┘ └────┘ └────┘             │
│  [Clear All]                        │
├─────────────────────────────────────┤
│  PDF Settings                       │
│  └─ Page Size: [A4 ▼]              │
│  └─ Orientation: [Portrait ▼]      │
│  └─ Image Fit: [Contain ▼]         │
│  └─ Margin: [━━━━●━━] 10mm        │
├─────────────────────────────────────┤
│  [Generate PDF]                     │
├─────────────────────────────────────┤
│  Pro Tips & Related Tools           │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Purple to pink (document theme)
- **Glass Effect**: Semi-transparent cards with backdrop blur
- **Upload Zone**: Dashed border, hover state
- **Preview Thumbnails**: Grid layout, responsive
- **Form Controls**: Labeled selects and sliders

## Analytics Events

```typescript
trackToolEvent('image_to_pdf_opened', {
  timestamp: Date.now(),
})

trackToolEvent('images_added', {
  count: 3,
})

trackToolEvent('pdf_generation_started', {
  imageCount: 3,
  pageSize: 'A4',
  orientation: 'portrait',
})

trackToolEvent('pdf_generated', {
  imageCount: 3,
  fileSize: 1024000, // bytes
  duration: 2500, // ms
})
```

## Performance

- **Processing Speed**: 1-2 seconds per image
- **Batch Capacity**: Tested up to 50 images
- **Memory Usage**: Efficient blob handling
- **File Size**: Depends on image quality/size

## Limitations

- **Browser Memory**: Very large images (> 100MB total) may crash
- **Format Support**: Input limited to JPG, PNG, WebP
- **No OCR**: Text in images not searchable in PDF
- **No Editing**: Cannot crop/rotate images before conversion
- **Single Session**: Close tab = lose images

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)  
✅ Mobile browsers (iOS Safari, Chrome Android)  
⚠️ Large batches may fail on low-memory devices

## Future Enhancements

- [ ] OCR integration for searchable PDFs
- [ ] Image rotation/crop before adding
- [ ] Custom page order (drag & drop reorder)
- [ ] Image compression options
- [ ] Password-protect PDFs
- [ ] Add text/annotations to pages
- [ ] Save settings as presets
- [ ] Merge existing PDFs with images

## Related Tools

- **Image Optimizer** - Compress images before PDF
- **PDF Tools Suite** - Merge/split existing PDFs
- **Photo Editor** - Edit images before conversion

---

**Route:** `/tools/image-to-pdf`  
**Component:** `app/tools/image-to-pdf/page.tsx`  
**Library:** `jspdf`
