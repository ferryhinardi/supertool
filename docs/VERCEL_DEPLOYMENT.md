# Vercel Deployment Guide for Video Subtitle Tool

## ✅ FFmpeg Setup (Completed)

The Video Subtitle Combiner tool now uses `@ffmpeg-installer/ffmpeg` which includes pre-built FFmpeg binaries that work on Vercel's serverless infrastructure.

### What was changed:

1. **Added Package**: `@ffmpeg-installer/ffmpeg` (1.1.0)
2. **Updated API Route**: `/app/api/video-subtitle/route.ts`
   - Uses static FFmpeg binary instead of system FFmpeg
   - Works on Vercel, AWS Lambda, and local development
   - No additional configuration needed

### Deployment Steps:

```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy to Vercel
# Vercel will automatically:
# - Install @ffmpeg-installer/ffmpeg
# - Bundle the FFmpeg binary for your platform
# - Deploy the API route with FFmpeg available
```

### Testing Deployment:

After deployment, test the FFmpeg availability:

```bash
# Check if FFmpeg is working
curl https://your-app.vercel.app/api/video-subtitle

# Expected response:
{
  "status": "ok",
  "ffmpeg": "installed",
  "version": "ffmpeg version 4.4 ...",
  "path": "/var/task/node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
}
```

### Platform-Specific Binaries:

The package includes binaries for:
- **Linux x64** (Vercel, AWS Lambda)
- **macOS ARM64** (M1/M2 Macs)
- **macOS x64** (Intel Macs)
- **Windows x64**

Vercel automatically selects the correct binary based on the deployment platform.

---

## Limitations on Vercel

### ⚠️ Important Constraints:

1. **Execution Time Limits**:
   - **Hobby**: 10 seconds max
   - **Pro**: 60 seconds max
   - Large videos (>100MB) may timeout

2. **Request Size Limits**:
   - **Max body size**: 4.5MB (Vercel limit)
   - Our app sets 1GB max, but this only works with streaming uploads

3. **Memory Limits**:
   - **Default**: 1024MB (1GB)
   - FFmpeg video processing is memory-intensive

### Recommendations:

For production use with large videos:

#### Option A: Use Vercel Edge Config
```typescript
// vercel.json
{
  "functions": {
    "app/api/video-subtitle/route.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  }
}
```

#### Option B: Move to Railway/Render
For unlimited processing:
- **Railway**: Docker support, no time limits
- **Render**: Background workers, 15-min timeout
- **Fly.io**: Global edge compute

---

## Alternative Solutions

### For Large Videos (>500MB):

1. **Split Processing**:
   - Process video in chunks
   - Use Vercel for smaller segments
   - Combine on client side

2. **External Service**:
   - **Cloudinary**: Video transformation API
   - **Mux**: Professional video platform
   - **AWS MediaConvert**: Enterprise-grade processing

3. **Self-Hosted**:
   - Deploy on Railway/Render with Docker
   - Full control, no limits

---

## Testing Locally

Test the FFmpeg integration locally:

```bash
# Start dev server
pnpm dev

# Test health endpoint
curl http://localhost:3000/api/video-subtitle

# Test video processing
curl -X POST http://localhost:3000/api/video-subtitle \
  -F "video=@test-video.mp4" \
  -F "subtitle=@test-subtitle.srt" \
  -o output-with-subtitles.mp4
```

---

## Troubleshooting

### Issue: "FFmpeg not available"

**Solution**: Ensure package is installed
```bash
pnpm install
# Check if binary exists
ls node_modules/@ffmpeg-installer/*/ffmpeg
```

### Issue: "ENOENT: no such file or directory"

**Solution**: Binary permissions issue (rare on Vercel)
```bash
# Locally, make executable
chmod +x node_modules/@ffmpeg-installer/*/ffmpeg
```

### Issue: Function timeout

**Solution**: 
1. Reduce video size/quality
2. Upgrade to Vercel Pro
3. Use alternative platform

---

## Environment Variables

No environment variables needed! The FFmpeg binary is bundled with the deployment.

---

## Cost Estimation

### Vercel Hobby (Free):
- ✅ Up to 100GB bandwidth/month
- ✅ 100 serverless function executions/hour
- ❌ 10-second timeout (may not work for large videos)

### Vercel Pro ($20/month):
- ✅ 1TB bandwidth/month
- ✅ 60-second timeout
- ✅ 3GB max memory
- ✅ Good for videos up to 100MB

### Railway ($5-20/month):
- ✅ Unlimited timeout
- ✅ Persistent storage
- ✅ Docker support
- ✅ Best for large videos (1GB+)

---

## Migration Checklist

- [x] Install `@ffmpeg-installer/ffmpeg`
- [x] Update API route to use static binary
- [x] Test locally
- [ ] Deploy to Vercel
- [ ] Test health endpoint in production
- [ ] Test with small video (<10MB)
- [ ] Test with medium video (50-100MB)
- [ ] Monitor function execution times
- [ ] Consider migration to Railway if needed

---

## Support

If you encounter issues:
1. Check [Vercel Function Logs](https://vercel.com/docs/observability/runtime-logs)
2. Test FFmpeg binary path: `console.log(FFMPEG_PATH)`
3. Verify binary exists in deployment bundle
4. Check execution time in logs

---

## Next Steps

The app is now ready for Vercel deployment with FFmpeg support! 🚀

Simply push to GitHub and Vercel will handle the rest.
