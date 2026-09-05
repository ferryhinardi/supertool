# FFmpeg Setup for Vercel Deployment

## Problem
Vercel's serverless functions don't include FFmpeg by default, so the `/api/video-subtitle` endpoint will fail in production.

## Solutions

### Option 1: Use FFmpeg Lambda Layer (Recommended) ⭐

Use a pre-built FFmpeg binary for AWS Lambda (which Vercel uses under the hood):

#### Step 1: Install `ffmpeg-static` package

```bash
pnpm add @ffmpeg-installer/ffmpeg
```

#### Step 2: Update the API route to use the static binary

```typescript
// app/api/video-subtitle/route.ts
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// Replace all execAsync('ffmpeg ...') calls with:
const { stdout, stderr } = await execFileAsync(ffmpegPath.path, [
  '-version'
])
```

#### Step 3: Update `next.config.ts`

```typescript
// next.config.ts
const nextConfig = {
  // ... existing config
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@ffmpeg-installer/ffmpeg')
    }
    return config
  },
}
```

---

### Option 2: Use Vercel Edge Functions with FFmpeg WASM

Convert the API route to use FFmpeg WASM in Edge Runtime:

```typescript
// app/api/video-subtitle/route.ts
export const runtime = 'edge'

import { FFmpeg } from '@ffmpeg/ffmpeg'
// ... rest of implementation
```

**Pros**: No binary dependencies needed  
**Cons**: Slower performance, limited to 50MB request size

---

### Option 3: Use External Video Processing Service (Production Grade)

For production apps, use a dedicated video processing service:

1. **AWS MediaConvert** - AWS managed service
2. **Cloudinary** - Video transformation API
3. **Mux** - Video streaming platform
4. **Zencoder** - Video transcoding API

**Example with Cloudinary:**

```typescript
// app/api/video-subtitle/route.ts
import { v2 as cloudinary } from 'cloudinary'

export async function POST(request: NextRequest) {
  // Upload video to Cloudinary
  const result = await cloudinary.uploader.upload(videoUrl, {
    resource_type: 'video',
    overlay: {
      resource_type: 'subtitles',
      url: subtitleUrl,
    },
  })
  
  return NextResponse.json({ url: result.secure_url })
}
```

---

### Option 4: Use Docker Container (Self-Hosted)

Deploy to a platform that supports Docker:

1. **Railway** - Easy Docker deployment
2. **Fly.io** - Global edge compute
3. **Render** - Managed Docker hosting
4. **AWS ECS/Fargate** - Full control

**Example Dockerfile:**

```dockerfile
FROM node:20-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## Recommended Approach for Your Project

### Quick Fix (Development): Use `@ffmpeg-installer/ffmpeg`

```bash
pnpm add @ffmpeg-installer/ffmpeg
```

Then update your API route:

```typescript
// app/api/video-subtitle/route.ts
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

// Replace exec() with execFile() using static binary
const ffmpegCommand = [
  '-i', videoPath,
  '-vf', subtitleFilter,
  // ... rest of args
]

await execFileAsync(ffmpegPath.path, ffmpegCommand)
```

### Production Solution: Move to Railway/Render

For production use with large videos (1GB), Vercel's serverless functions have limitations:

- **Max execution time**: 10 seconds (Hobby), 60 seconds (Pro)
- **Max request size**: 4.5MB body payload
- **Memory**: 1024MB max

**Better platforms for video processing:**

1. **Railway** (Recommended)
   - Docker support
   - Persistent storage
   - No time limits
   - Simple deployment: `railway up`

2. **Render**
   - Docker support
   - Background workers
   - 15-minute timeout

---

## Testing FFmpeg Availability

Add this endpoint to test FFmpeg:

```typescript
// app/api/video-subtitle/health/route.ts
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { NextResponse } from 'next/server'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const { stdout } = await execAsync('ffmpeg -version')
    return NextResponse.json({ 
      status: 'ok', 
      ffmpeg: 'available',
      version: stdout.split('\n')[0]
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      ffmpeg: 'not available',
      error: error.message
    }, { status: 500 })
  }
}
```

---

## Migration Steps

### Phase 1: Quick Fix (Today)
1. Install `@ffmpeg-installer/ffmpeg`
2. Update API route to use static binary
3. Deploy to Vercel
4. Test with small videos (<10MB)

### Phase 2: Production (This Week)
1. Sign up for Railway/Render
2. Add Dockerfile
3. Deploy container
4. Update frontend to point to new API
5. Keep Vercel for frontend, use Railway for video processing

---

## Cost Comparison

### Vercel + FFmpeg Static Binary
- **Cost**: Free tier (100GB bandwidth)
- **Limitations**: 10s timeout, 4.5MB payload
- **Best for**: Demo/MVP

### Railway
- **Cost**: $5/month (512MB RAM)
- **Limitations**: None for video processing
- **Best for**: Production

### Cloudinary
- **Cost**: $99/month (25GB storage, 25GB bandwidth)
- **Limitations**: API rate limits
- **Best for**: Enterprise

---

## Next Steps

Choose one approach and let me know if you need help implementing it!
