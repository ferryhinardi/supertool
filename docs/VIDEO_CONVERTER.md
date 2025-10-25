# Video Converter & Compressor

> Professional video conversion tool with FFmpeg integration

## Overview

The Video Converter tool allows users to convert videos between multiple formats, compress file sizes, and optimize videos for web playback - all directly in the browser using WebAssembly-powered FFmpeg.

## Features

### ✅ Implemented Features

1. **Multiple Format Support**
   - Input: Any video format supported by FFmpeg
   - Output: MP4, WebM, AVI, MOV, MKV

2. **Video Codecs**
   - H.264 (libx264) - Most compatible, good quality
   - H.265 (libx265) - Better compression, smaller files
   - VP9 (libvpx-vp9) - Open codec, WebM standard
   - AV1 - Future codec (planned)

3. **Audio Codecs**
   - AAC - Standard for MP4
   - MP3 - Universal compatibility
   - Opus - Best quality for WebM

4. **Quality Control**
   - CRF (Constant Rate Factor) slider: 0-51
   - Lower values = better quality, larger files
   - Recommended: 23 (default)

5. **Resolution Scaling**
   - Original (no scaling)
   - 1920x1080 (Full HD)
   - 1280x720 (HD)
   - 854x480 (SD)
   - 640x360 (Low)

6. **Batch Processing**
   - Convert up to 10 videos at once
   - Max file size: 500MB per video
   - Progress tracking for each video
   - Bulk download option

7. **Browser-Based Processing**
   - No server upload required
   - Complete privacy - files never leave your device
   - FFmpeg runs in WebAssembly
   - Real-time progress updates

## Usage

### Getting Started

1. **Initialize FFmpeg**: Click "Initialize Video Converter" button
   - Downloads FFmpeg WASM (~30MB)
   - One-time load per session
   - Cached for future use

2. **Add Videos**: Drag & drop or click to select
   - Supports: MP4, AVI, MOV, MKV, WebM, etc.
   - Max 10 videos at once
   - Max 500MB per video

3. **Configure Settings**:
   - **Output Format**: Choose MP4, WebM, AVI, MOV, or MKV
   - **Video Codec**: Select compression method
   - **Audio Codec**: Choose audio format
   - **Quality**: Adjust CRF slider (23 = balanced)
   - **Resolution**: Scale video dimensions

4. **Convert**: Click "Convert All" or individual convert buttons

5. **Download**: Get converted videos individually or all at once

### Recommended Settings

#### For Web/Streaming

```
Format: MP4
Video Codec: H.264
Audio Codec: AAC
Quality: 23
Resolution: 1280x720 or 1920x1080
```

#### Maximum Compression

```
Format: MP4
Video Codec: H.265
Audio Codec: AAC
Quality: 28
Resolution: 854x480
```

#### WebM for Web

```
Format: WebM
Video Codec: VP9
Audio Codec: Opus
Quality: 31
Resolution: 1280x720
```

## Technical Details

### FFmpeg Integration

The tool uses [@ffmpeg/ffmpeg](https://github.com/ffmpeg/ffmpeg.wasm) v0.12.6:

- Runs entirely in browser via WebAssembly
- No server communication
- Full FFmpeg capabilities

### Codec Details

**H.264 (libx264)**

- CRF range: 0-51 (23 = default)
- Best compatibility across devices
- Good balance of quality and size

**H.265 (libx265)**

- CRF range: 0-51 (28 = default)
- 25-50% better compression than H.264
- Requires modern devices for playback

**VP9 (libvpx-vp9)**

- CRF range: 0-63 (31 = default)
- Open source alternative to H.265
- Best for WebM containers

### Resolution Scaling

Videos are scaled proportionally:

- Maintains aspect ratio
- Uses FFmpeg's scale filter
- Example: `-vf scale=1280:720`

## Performance

### File Size Savings

Typical compression results:

- H.264 at CRF 23: 30-50% smaller
- H.265 at CRF 28: 40-60% smaller
- VP9 at CRF 31: 35-55% smaller

### Conversion Speed

Depends on:

- Video duration and resolution
- Selected codec and quality
- Device CPU performance
- Browser limitations

Approximate speeds (on modern hardware):

- 1080p 1-minute video: ~30-60 seconds
- 720p 1-minute video: ~20-40 seconds
- 480p 1-minute video: ~10-20 seconds

## Limitations

1. **File Size**: Max 500MB per video
2. **Batch Limit**: 10 videos at once
3. **Browser Memory**: Large files may cause issues
4. **Codec Support**: Limited to FFmpeg WASM build
5. **AV1**: Not yet implemented (codec availability)

## Troubleshooting

### FFmpeg fails to load

- Check internet connection
- Try refreshing the page
- Clear browser cache
- Try different browser

### Conversion fails

- Ensure input file is valid video
- Check file size < 500MB
- Try different codec combination
- Check browser console for errors

### Out of memory

- Close other browser tabs
- Reduce video resolution
- Convert fewer videos at once
- Use lower quality setting

### Slow conversion

- Normal for large files
- Close other applications
- Use faster codec (H.264 > VP9 > H.265)
- Reduce output resolution

## Analytics

The tool tracks:

- Page views
- FFmpeg initialization success/failure
- Files added count
- Conversion attempts and completions
- Conversion time and settings
- Download events
- Error occurrences

No personally identifiable information or file content is tracked.

## Future Enhancements

- [ ] AV1 codec support
- [ ] Video trimming/cutting
- [ ] Subtitle support
- [ ] Bitrate control (CBR/VBR)
- [ ] Two-pass encoding
- [ ] Frame rate adjustment
- [ ] Video filters (blur, brightness, etc.)
- [ ] Batch preset configurations
- [ ] Video preview before conversion
- [ ] Audio extraction

## Testing

Run tests with:

```bash
npm test -- video-converter
```

Tests cover:

- File size formatting
- Duration formatting
- Space savings calculation
- File format validation
- Filename parsing

## Related Tools

- **Image Optimizer**: For image compression
- **Upload Tool**: For cloud storage
- **URL Shortener**: For sharing converted videos

## Support

For issues or feature requests, please check:

1. Browser console for error messages
2. FFmpeg documentation for codec details
3. Project repository for known issues
