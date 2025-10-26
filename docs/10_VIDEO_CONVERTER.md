# 10 - Video Converter

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Media Tools  
**Status:** ✅ Active · ⭐ New

## Overview

Browser-powered video converter using FFmpeg WebAssembly. Convert between formats (MP4, WebM, AVI, MOV, MKV), change codecs (H.264, H.265, VP9, AV1), adjust quality, and resize resolution—all without uploading to servers.

## Purpose

Video format compatibility is critical for web playback, mobile devices, and editing software. This tool brings FFmpeg's industry-standard conversion capabilities to the browser for privacy-focused, client-side video processing.

## Key Features

### 1. **Format Conversion**

- **MP4**: Universal compatibility
- **WebM**: Web-optimized, HTML5 video
- **AVI**: Legacy format support
- **MOV**: Apple ecosystem
- **MKV**: High-quality container

### 2. **Video Codecs**

- **H.264 (AVC)**: Most compatible
- **H.265 (HEVC)**: 50% better compression
- **VP9**: Open-source, YouTube standard
- **AV1**: Next-gen, best compression

### 3. **Audio Codecs**

- **AAC**: High quality, universal
- **MP3**: Widely supported
- **Opus**: Best quality-to-size ratio

### 4. **Quality Control**

- CRF (Constant Rate Factor) slider
- Range: 0-51 (lower = better)
- Default: 23 (balanced)
- Presets: High/Medium/Low

### 5. **Resolution Scaling**

- Common presets: 4K, 1080p, 720p, 480p
- Maintain aspect ratio
- Custom dimensions
- Upscaling/downscaling

### 6. **FFmpeg.wasm Integration**

- Full FFmpeg capabilities in browser
- 150+ codecs supported
- Real-time progress tracking
- No server uploads needed

## How It Works

### FFmpeg WebAssembly Loading

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const loadFFmpeg = async () => {
  const ffmpeg = new FFmpeg()

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })

  ffmpeg.on('progress', ({ progress }) => {
    setProgress(Math.round(progress * 100))
  })

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  setFfmpegLoaded(true)
}
```

### Conversion Pipeline

```typescript
const convertVideo = async (video: VideoFile) => {
  const ffmpeg = ffmpegRef.current
  if (!ffmpeg) return

  // Write input file to FFmpeg virtual filesystem
  await ffmpeg.writeFile('input.mp4', await fetchFile(video.file))

  // Build FFmpeg command
  const command = [
    '-i',
    'input.mp4',
    '-c:v',
    getVideoCodec(videoCodec),
    '-c:a',
    getAudioCodec(audioCodec),
    '-crf',
    quality.toString(),
    '-preset',
    'medium',
    ...(resolution !== 'original' ? ['-vf', `scale=${resolution}`] : []),
    `output.${outputFormat}`,
  ]

  // Execute conversion
  await ffmpeg.exec(command)

  // Read output file
  const data = await ffmpeg.readFile(`output.${outputFormat}`)
  const blob = new Blob([data], { type: `video/${outputFormat}` })

  return {
    blob,
    size: blob.size,
    format: outputFormat,
  }
}
```

### Codec Mapping

```typescript
const codecMap = {
  h264: 'libx264',
  h265: 'libx265',
  vp9: 'libvpx-vp9',
  av1: 'libaom-av1',
  aac: 'aac',
  mp3: 'libmp3lame',
  opus: 'libopus',
}
```

## Usage Instructions

### Basic Conversion

1. **First Time**: Click "Load FFmpeg" (one-time, ~30MB download)
2. **Upload Video**: Drag & drop or browse
3. **Select Output Format**: Choose from dropdown
4. **Click "Convert"**: Processing begins
5. **Wait**: Progress bar shows completion
6. **Download**: Click download button

### Advanced Settings

**Quality Optimization:**

- CRF 18-23: High quality, larger files
- CRF 23-28: Balanced (recommended)
- CRF 28-35: Lower quality, smaller files

**Codec Selection:**

- H.264: For maximum compatibility
- H.265: For 50% size reduction (slower)
- VP9/AV1: For web streaming

**Resolution Scaling:**

- 1080p → 720p: 50% size reduction
- 4K → 1080p: 75% size reduction
- Maintains aspect ratio automatically

### Example Workflows

**For Web Upload:**

```
Input: Large MOV file (4K, 2GB)
Output Format: MP4
Video Codec: H.264
Audio Codec: AAC
Quality: CRF 23
Resolution: 1080p
Result: 200MB file, web-compatible
```

**For Social Media:**

```
Input: Any format
Output Format: MP4
Video Codec: H.264
Resolution: 720p
Quality: CRF 25
Result: Instagram/TikTok ready
```

**For Archival:**

```
Input: Old AVI files
Output Format: MKV
Video Codec: H.265
Quality: CRF 20
Resolution: Original
Result: 50% size reduction, same quality
```

## Technical Architecture

### Dependencies

```json
{
  "@ffmpeg/ffmpeg": "^0.12.6",
  "@ffmpeg/util": "^0.12.1"
}
```

### State Management

```typescript
interface VideoFile {
  id: string
  file: File
  preview: string
  originalSize: number
  convertedSize?: number
  convertedBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  duration?: number
  error?: string
}
```

### Memory Management

```typescript
// Clean up after conversion
const cleanup = async () => {
  await ffmpeg.deleteFile('input.mp4')
  await ffmpeg.deleteFile(`output.${outputFormat}`)
  URL.revokeObjectURL(videoPreviewUrl)
}
```

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  FFmpeg Status (Load button if needed) │
├─────────────────────────────────────┤
│  Conversion Settings                │
│  ├─ Output Format Dropdown          │
│  ├─ Video Codec Select              │
│  ├─ Audio Codec Select              │
│  ├─ Quality Slider (CRF)            │
│  └─ Resolution Dropdown             │
├─────────────────────────────────────┤
│  Video Upload Zone                  │
│  (Drag & Drop or Browse)            │
├─────────────────────────────────────┤
│  Processing Queue                   │
│  ┌──────────────────────────────┐  │
│  │ Video 1                      │  │
│  │ [████████░░] 80%             │  │
│  │ Status: Converting...        │  │
│  │ [Download Button]            │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Purple to indigo (video/media theme)
- **Progress Bars**: Animated with percentage
- **Status Badges**: Color-coded (pending/processing/complete)
- **Video Preview**: Thumbnail with play button

## Analytics Events

```typescript
trackToolEvent('video_convert', {
  input_format: 'mov',
  output_format: 'mp4',
  video_codec: 'h264',
  audio_codec: 'aac',
  quality_crf: 23,
  original_size_mb: 1500,
  converted_size_mb: 250,
  processing_time_sec: 180,
})
```

## Performance

- **FFmpeg Load Time**: 10-30 seconds (first time only)
- **Conversion Speed**: Depends on video length and codec
  - H.264: Fastest (~realtime)
  - H.265: Slower (~0.5x realtime)
  - AV1: Very slow (~0.1x realtime)
- **Memory Usage**: ~2GB for large videos
- **File Size Limit**: Recommended < 500MB

## Browser Requirements

✅ **Supported:**

- Chrome 88+ (SharedArrayBuffer support)
- Firefox 79+
- Edge 88+
- Safari 15.2+

⚠️ **Requirements:**

- Cross-Origin Isolation headers (COOP/COEP)
- WebAssembly support
- Sufficient RAM (4GB+ recommended)

## Limitations

- **File Size**: Browser crashes on very large files (> 2GB)
- **Processing Time**: CPU-intensive, may take minutes
- **Battery Drain**: Laptop users beware
- **No GPU Acceleration**: CPU-only encoding
- **Single Video**: No batch processing yet

## Troubleshooting

**"Failed to load FFmpeg":**

- Check internet connection
- Clear browser cache
- Try different browser

**"Out of memory" errors:**

- Reduce video resolution
- Lower quality setting
- Close other tabs
- Use smaller input files

**Slow conversion:**

- Normal for H.265/AV1 codecs
- Use H.264 for faster results
- Reduce resolution

## Security & Privacy

🔒 **100% Client-Side:**

- No videos uploaded to servers
- All processing in browser
- No data leaves your computer

🔒 **No Tracking:**

- No video content analytics
- Only anonymized conversion metrics

## Future Enhancements

- [ ] Batch video conversion
- [ ] Video trimming/cutting
- [ ] Subtitle embedding
- [ ] Audio extraction
- [ ] Video merging
- [ ] Thumbnail extraction
- [ ] Metadata editing
- [ ] GPU acceleration (when available)
- [ ] Preset templates (YouTube, Instagram, etc.)

## Related Tools

- **Image Optimizer** - Compress image files
- **Upload Tool** - Host converted videos
- **QR Code Generator** - Share video links

## FFmpeg Command Reference

Common commands this tool generates:

```bash
# Basic format conversion
ffmpeg -i input.mp4 output.webm

# With quality control
ffmpeg -i input.mp4 -crf 23 output.mp4

# Resize video
ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4

# Change codecs
ffmpeg -i input.mp4 -c:v libx265 -c:a aac output.mp4
```

---

**Route:** `/tools/video-converter`  
**Component:** `app/tools/video-converter/page.tsx`  
**Library:** `@ffmpeg/ffmpeg` (WebAssembly)  
**Requires:** Cross-Origin Isolation, SharedArrayBuffer
