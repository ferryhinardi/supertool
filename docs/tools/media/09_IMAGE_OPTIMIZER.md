# 09 - Image Optimizer

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Media Tools  
**Status:** ✅ Active

## Overview

High-performance browser-based image compression and optimization tool. Reduce file sizes by up to 90% while maintaining quality, with support for batch processing, format conversion (JPEG/PNG/WebP), and custom resolution resizing.

## Purpose

Large images slow down websites and consume storage space. This tool uses client-side compression algorithms to optimize images instantly without uploading to servers, preserving privacy while achieving professional results.

## Key Features

### 1. **Smart Compression**

- Adjustable quality (1-100%)
- Automatic optimization algorithms
- Preserves visual quality at lower file sizes
- Powered by `browser-image-compression`

### 2. **Format Conversion**

- JPEG → High compatibility, small sizes
- PNG → Transparency support, lossless
- WebP → Modern format, best compression

### 3. **Resolution Resizing**

- Max width/height constraints
- Maintains aspect ratio automatically
- Common presets: 1920x1080, 1280x720, 800x600
- Custom dimensions supported

### 4. **Batch Processing**

- Process multiple images simultaneously
- Progress tracking per image
- Web Workers for parallel processing
- No limits on batch size

### 5. **Before/After Comparison**

- Visual preview thumbnails
- File size reduction percentage
- Original vs compressed metrics
- Side-by-side display

### 6. **Download Options**

- Individual image download
- ZIP archive for batch (future)
- Original filename preservation
- Format-appropriate extensions

## How It Works

### Compression Pipeline

```typescript
import imageCompression from 'browser-image-compression'

const optimizeImage = async (imageFile: ImageFile) => {
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    useWebWorker: true,
    fileType: `image/${outputFormat}`,
    initialQuality: quality / 100,
    onProgress: (progress) => {
      updateProgress(imageFile.id, progress)
    },
  }

  const compressedBlob = await imageCompression(imageFile.file, options)

  return {
    blob: compressedBlob,
    size: compressedBlob.size,
    reduction: ((originalSize - compressedBlob.size) / originalSize) * 100,
  }
}
```

### Quality Algorithm

- **High Quality (80-100%)**: Minimal compression, near-original
- **Medium Quality (60-80%)**: Balanced size/quality
- **Low Quality (1-60%)**: Maximum compression, visible artifacts

### Format Selection

```typescript
const formatRecommendations = {
  photos: 'jpeg', // Best for photographs
  graphics: 'png', // Best for illustrations/logos
  modern: 'webp', // Best overall (browser support needed)
}
```

## Usage Instructions

### Single Image Optimization

1. **Upload Image**: Click or drag & drop
2. **Adjust Settings**:
   - Quality slider (default: 80%)
   - Output format (JPEG/PNG/WebP)
   - Max resolution (optional)
3. **Click "Optimize"**: Processing begins
4. **Review**: Check size reduction
5. **Download**: Save optimized image

### Batch Optimization

1. **Upload Multiple**: Select or drop multiple files
2. **Set Global Settings**: Apply to all images
3. **Click "Optimize All"**: Processes in parallel
4. **Monitor Progress**: Per-image progress bars
5. **Download Each**: Individual downloads

### Recommended Settings

**For Web:**

- Format: WebP or JPEG
- Quality: 75-85%
- Max Width: 1920px
- Use case: Website images, social media

**For Print:**

- Format: PNG
- Quality: 90-100%
- Max Width: Original
- Use case: High-res printing

**For Email:**

- Format: JPEG
- Quality: 60-70%
- Max Width: 800px
- Use case: Email attachments

## Technical Implementation

### Dependencies

```json
{
  "browser-image-compression": "^2.0.2"
}
```

### State Management

```typescript
interface ImageFile {
  id: string
  file: File
  preview: string
  originalSize: number
  compressedSize?: number
  compressedBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

const [images, setImages] = useState<ImageFile[]>([])
const [quality, setQuality] = useState(80)
const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
```

### Web Workers

Uses Web Workers for non-blocking compression:

- Main thread remains responsive
- Multiple images processed in parallel
- Progress updates via message passing

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  Header + Settings Panel            │
│  ├─ Quality Slider                  │
│  ├─ Format Selector                 │
│  └─ Resolution Inputs                │
├─────────────────────────────────────┤
│  Drag & Drop Zone                   │
│  (or click to browse)               │
├─────────────────────────────────────┤
│  Image Grid                         │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Image1│ │Image2│ │Image3│       │
│  │Before│ │Before│ │Before│       │
│  │After │ │After │ │After │       │
│  │[↓]   │ │[↓]   │ │[↓]   │       │
│  └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Teal to cyan (media/image theme)
- **Progress Bars**: Animated loading indicators
- **Thumbnails**: Preview with size badges
- **Comparison**: Side-by-side before/after

## Analytics Events

```typescript
trackToolEvent('image_optimize', {
  format: 'webp',
  quality: 80,
  original_size_kb: 2500,
  compressed_size_kb: 450,
  reduction_percent: 82,
})
```

## Performance

- **Processing Speed**: 1-5 seconds per image (depending on size)
- **Batch Capacity**: Tested up to 100 images
- **Memory Usage**: Efficient worker-based processing
- **Browser Limits**: 500MB+ images may fail

## Limitations

- **Browser Memory**: Very large images (> 50MB) may crash
- **Format Support**: WebP not supported in old browsers
- **No Cloud Sync**: Processed images not saved online
- **Single Session**: Close tab = lose processed images

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest)  
⚠️ WebP: Not supported in IE11  
⚠️ Large files may fail on low-memory devices

## Future Enhancements

- [ ] ZIP download for batch
- [ ] Metadata stripping (EXIF removal)
- [ ] Watermark addition
- [ ] Crop/rotate tools
- [ ] Image filters (brightness, contrast, saturation)
- [ ] Save presets
- [ ] Cloud storage integration

## Related Tools

- **Video Converter** - Optimize video files
- **Upload Tool** - Host optimized images
- **QR Code Generator** - Create image-based codes

---

**Route:** `/tools/image-optimizer`  
**Component:** `app/tools/image-optimizer/page.tsx`  
**Library:** `browser-image-compression`
