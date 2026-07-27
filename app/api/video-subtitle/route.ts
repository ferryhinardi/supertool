import { execFile } from 'node:child_process'
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { type NextRequest, NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)

// Get FFmpeg binary path with proper dynamic import for Vercel
let FFMPEG_PATH: string | null = null

async function getFFmpegPath(): Promise<string> {
  if (FFMPEG_PATH) return FFMPEG_PATH

  try {
    // In production (Vercel), download FFmpeg to /tmp on first request
    // In development, use local ffmpeg-static or system ffmpeg
    if (process.env.NODE_ENV === 'production') {
      const tmpFFmpegPath = '/tmp/ffmpeg'

      // Check if already downloaded
      try {
        await access(tmpFFmpegPath)
        FFMPEG_PATH = tmpFFmpegPath
        return FFMPEG_PATH
      } catch {
        // Download FFmpeg binary on first request
        const response = await fetch(
          'https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-linux-x64.gz'
        )

        if (!response.ok) {
          throw new Error(`Failed to download FFmpeg: ${response.statusText}`)
        }

        const { createGunzip } = await import('node:zlib')
        const { createWriteStream } = await import('node:fs')
        const { pipeline } = await import('node:stream/promises')
        const { Readable } = await import('node:stream')

        // Download, gunzip, and save to /tmp
        const gunzip = createGunzip()
        const writeStream = createWriteStream(tmpFFmpegPath, { mode: 0o755 })

        // Convert Web ReadableStream to Node.js Readable stream
        if (!response.body) {
          throw new Error('Response body is null')
        }
        const nodeReadable = Readable.fromWeb(response.body as import('stream/web').ReadableStream)
        await pipeline(nodeReadable, gunzip, writeStream)

        FFMPEG_PATH = tmpFFmpegPath
      }
    } else {
      // Development: try ffmpeg-static first, fallback to system ffmpeg
      try {
        const ffmpegStatic = await import('ffmpeg-static')
        FFMPEG_PATH = ffmpegStatic.default || ''
      } catch {
        // Fallback to system ffmpeg (brew install ffmpeg)
        FFMPEG_PATH = 'ffmpeg'
      }
    }

    if (!FFMPEG_PATH) {
      throw new Error('FFmpeg path is empty')
    }

    // Validate the binary exists and is executable
    await access(FFMPEG_PATH)

    return FFMPEG_PATH
  } catch (error) {
    console.error('❌ Failed to load FFmpeg:', error)
    throw new Error(
      `FFmpeg not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Maximum file size: 100MB (Vercel Pro plan limit)
const MAX_FILE_SIZE = 100 * 1024 * 1024

interface PresetSettings {
  preset: string
  crf: string
  audioBitrate: string
  audioSampleRate: string
  scale?: string
  frameRate?: string
}

function getPresetSettings(preset?: string): PresetSettings {
  switch (preset) {
    case 'instagram':
      // Instagram: Max 1080x1350 (4:5), 30fps, H.264, AAC
      return {
        preset: 'medium',
        crf: '23',
        audioBitrate: '128k',
        audioSampleRate: '44100',
        scale: '1080:1350:force_original_aspect_ratio=decrease',
        frameRate: '30',
      }
    case 'tiktok':
      // TikTok: 1080x1920 (9:16), 30fps, H.264, AAC
      return {
        preset: 'medium',
        crf: '23',
        audioBitrate: '128k',
        audioSampleRate: '44100',
        scale: '1080:1920:force_original_aspect_ratio=decrease',
        frameRate: '30',
      }
    case 'youtube':
      // YouTube: 1920x1080 (16:9), 30fps, H.264, AAC (high quality)
      return {
        preset: 'slow',
        crf: '18',
        audioBitrate: '192k',
        audioSampleRate: '48000',
        scale: '1920:1080:force_original_aspect_ratio=decrease',
        frameRate: '30',
      }
    case 'twitter':
      // Twitter: Max 1280x1024, 30fps, H.264, AAC
      return {
        preset: 'medium',
        crf: '23',
        audioBitrate: '128k',
        audioSampleRate: '44100',
        scale: '1280:1024:force_original_aspect_ratio=decrease',
        frameRate: '30',
      }
    default:
      // Default: No preset, maintain original quality
      return {
        preset: 'medium',
        crf: '23',
        audioBitrate: '128k',
        audioSampleRate: '44100',
      }
  }
}

interface SubtitleOptions {
  fontSize?: number
  fontColor?: string
  backgroundColor?: string
  backgroundOpacity?: number
  position?: 'bottom' | 'top' | 'center'
  trimStart?: number
  trimEnd?: number
  brightness?: number
  contrast?: number
  saturation?: number
  blur?: number
  sharpen?: number
  vignette?: number
  temperature?: number
  exportPreset?: 'instagram' | 'tiktok' | 'youtube' | 'twitter'
}

export async function POST(request: NextRequest) {
  let tempDir: string | null = null

  try {
    // Parse multipart form data
    const formData = await request.formData()
    const videoFile = formData.get('video') as File
    const subtitleFile = formData.get('subtitle') as File

    // Get styling options from form data
    const fontSize = formData.get('fontSize')
    const fontColor = formData.get('fontColor')
    const backgroundColor = formData.get('backgroundColor')
    const backgroundOpacity = formData.get('backgroundOpacity')
    const subtitlePosition = formData.get('subtitlePosition')
    const trimStart = formData.get('trimStart')
    const trimEnd = formData.get('trimEnd')
    const brightness = formData.get('brightness')
    const contrast = formData.get('contrast')
    const saturation = formData.get('saturation')
    const blur = formData.get('blur')
    const sharpen = formData.get('sharpen')
    const vignette = formData.get('vignette')
    const temperature = formData.get('temperature')
    const exportPreset = formData.get('exportPreset')

    // Validate inputs
    if (!videoFile || !subtitleFile) {
      return NextResponse.json({ error: 'Missing video or subtitle file' }, { status: 400 })
    }

    // Validate file sizes
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Video file too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate subtitle file extension
    const subtitleExt = subtitleFile.name.split('.').pop()?.toLowerCase()
    if (!['srt', 'vtt', 'ass', 'ssa'].includes(subtitleExt || '')) {
      return NextResponse.json(
        { error: 'Invalid subtitle format. Supported: SRT, VTT, ASS, SSA' },
        { status: 400 }
      )
    }

    // Parse options (convert null to undefined so defaults are applied)
    const options: SubtitleOptions = {
      fontSize: fontSize ? parseInt(fontSize as string, 10) : undefined,
      fontColor: fontColor ? (fontColor as string) : undefined,
      backgroundColor: backgroundColor ? (backgroundColor as string) : undefined,
      backgroundOpacity: backgroundOpacity ? parseFloat(backgroundOpacity as string) : undefined,
      position: subtitlePosition ? (subtitlePosition as 'bottom' | 'top' | 'center') : undefined,
      trimStart: trimStart ? parseFloat(trimStart as string) : undefined,
      trimEnd: trimEnd ? parseFloat(trimEnd as string) : undefined,
      brightness: brightness ? parseFloat(brightness as string) : undefined,
      contrast: contrast ? parseFloat(contrast as string) : undefined,
      saturation: saturation ? parseFloat(saturation as string) : undefined,
      blur: blur ? parseFloat(blur as string) : undefined,
      sharpen: sharpen ? parseFloat(sharpen as string) : undefined,
      vignette: vignette ? parseFloat(vignette as string) : undefined,
      temperature: temperature ? parseFloat(temperature as string) : undefined,
      exportPreset: exportPreset
        ? (exportPreset as 'instagram' | 'tiktok' | 'youtube' | 'twitter')
        : undefined,
    }

    // Create temporary directory for processing
    tempDir = join(tmpdir(), `video-subtitle-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    await mkdir(tempDir, { recursive: true })

    // Save uploaded files to temp directory
    const videoExt = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4'
    const inputVideoPath = join(tempDir, `input.${videoExt}`)
    const inputSubtitlePath = join(tempDir, `subtitle.${subtitleExt}`)
    const outputVideoPath = join(tempDir, `output.${videoExt}`)

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
    const subtitleBuffer = Buffer.from(await subtitleFile.arrayBuffer())

    await writeFile(inputVideoPath, videoBuffer)
    await writeFile(inputSubtitlePath, subtitleBuffer)

    // Get FFmpeg path and check if it's available
    let ffmpegPath: string
    try {
      ffmpegPath = await getFFmpegPath()
      await execFileAsync(ffmpegPath, ['-version'])
    } catch (error) {
      return NextResponse.json(
        {
          error: `FFmpeg is not available: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // Build FFmpeg command to burn subtitles into video
    // Note: We need to escape the subtitle path for FFmpeg's subtitles filter
    const escapedSubtitlePath = inputSubtitlePath.replace(/\\/g, '/').replace(/:/g, '\\\\:')
    const ffmpegFilters = buildFFmpegFilters(escapedSubtitlePath, options)

    // Build command as array to avoid shell escaping issues
    const ffmpegArgs = ['-i', inputVideoPath]

    // Add trim options if enabled
    if (options.trimStart !== undefined && options.trimEnd !== undefined) {
      if (options.trimStart > 0) {
        ffmpegArgs.push('-ss', options.trimStart.toString())
      }
      if (options.trimEnd > 0) {
        const duration = options.trimEnd - (options.trimStart || 0)
        ffmpegArgs.push('-t', duration.toString())
      }
    }

    // Get preset-specific settings
    const presetSettings = getPresetSettings(options.exportPreset)

    ffmpegArgs.push(
      '-vf',
      ffmpegFilters,
      '-c:v',
      'libx264',
      '-preset',
      presetSettings.preset,
      '-crf',
      presetSettings.crf,
      '-c:a',
      'aac',
      '-b:a',
      presetSettings.audioBitrate,
      '-ar',
      presetSettings.audioSampleRate
    )

    // Add resolution scaling if preset requires it
    if (presetSettings.scale) {
      const scaleIndex = ffmpegArgs.indexOf('-vf')
      if (scaleIndex !== -1) {
        ffmpegArgs[scaleIndex + 1] = `${ffmpegFilters},scale=${presetSettings.scale}`
      }
    }

    // Add frame rate if preset requires it
    if (presetSettings.frameRate) {
      ffmpegArgs.push('-r', presetSettings.frameRate)
    }

    ffmpegArgs.push('-y', outputVideoPath) // Overwrite output file

    await execFileAsync(ffmpegPath, ffmpegArgs, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for output
    })

    // Read the output file
    const outputBuffer = await readFile(outputVideoPath)

    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true })
    tempDir = null

    // Return the processed video
    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="video-with-subtitles.${videoExt}"`,
        'Content-Length': outputBuffer.length.toString(),
      },
    })
  } catch (error) {
    // Clean up temp directory on error
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.error('Failed to clean up temp directory:', cleanupError)
      }
    }

    console.error('🔴 Error processing video:', error)

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while processing the video'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

function buildFFmpegFilters(subtitlePath: string, options: SubtitleOptions): string {
  const {
    fontSize = 24,
    fontColor = '#ffffff',
    backgroundColor = '#000000',
    backgroundOpacity = 0.5,
    position = 'bottom',
    brightness = 1.0,
    contrast = 1.0,
    saturation = 1.0,
    blur = 0,
    sharpen = 0,
    vignette = 0,
    temperature = 6500,
  } = options

  // Convert hex colors to FFmpeg format (without #)
  const primaryColor = `${fontColor.replace('#', '&H')}FF` // Add alpha
  const bgColor = backgroundColor.replace('#', '&H')
  const bgOpacity = Math.round(backgroundOpacity * 255)
    .toString(16)
    .padStart(2, '0')
  const bgColorWithAlpha = bgColor + bgOpacity

  // Calculate vertical position
  let marginV = 20
  if (position === 'top') {
    marginV = 20
  } else if (position === 'center') {
    marginV = 0
  } else {
    marginV = 20 // bottom
  }

  // Build filter chain
  const filters: string[] = []

  // Add color adjustment filters if they differ from defaults
  if (brightness !== 1.0 || contrast !== 1.0 || saturation !== 1.0) {
    const eqFilter = `eq=brightness=${(brightness - 1.0) * 0.1}:contrast=${contrast}:saturation=${saturation}`
    filters.push(eqFilter)
  }

  // Add blur filter if enabled
  if (blur > 0) {
    // boxblur: radius_x:radius_y (0-20 recommended)
    filters.push(`boxblur=${blur}:${blur}`)
  }

  // Add sharpen filter if enabled
  if (sharpen > 0) {
    // unsharp: luma_msize_x:luma_msize_y:luma_amount (0-5 recommended)
    const amount = sharpen * 0.5 // Scale to 0-2.5 range
    filters.push(`unsharp=5:5:${amount}:5:5:${amount}`)
  }

  // Add vignette filter if enabled
  if (vignette > 0) {
    // vignette: angle:x0:y0 (0-1 range for intensity)
    const angle = `PI/${2 + (1 - vignette) * 10}` // Angle inversely related to intensity
    filters.push(`vignette='${angle}'`)
  }

  // Add color temperature filter if not default
  if (temperature !== 6500) {
    // Convert Kelvin to RGB multipliers (simplified)
    // Warmer (>6500): increase red, decrease blue
    // Cooler (<6500): decrease red, increase blue
    const tempDiff = (temperature - 6500) / 10000 // Normalized difference
    const redAdj = 1 + Math.max(-0.3, Math.min(0.3, tempDiff))
    const blueAdj = 1 - Math.max(-0.3, Math.min(0.3, tempDiff))

    filters.push(`eq=r=${redAdj}:b=${blueAdj}`)
  }

  // Build subtitles filter with styling
  // Note: subtitlePath should already be escaped by caller
  const subtitleFilter = `subtitles=${subtitlePath}:force_style='FontSize=${fontSize},PrimaryColour=${primaryColor},BackColour=${bgColorWithAlpha},MarginV=${marginV}'`
  filters.push(subtitleFilter)

  return filters.join(',')
}

// Health check endpoint
export async function GET() {
  try {
    // Try to load FFmpeg
    const ffmpegPath = await getFFmpegPath()

    // Check if FFmpeg binary exists
    await access(ffmpegPath)

    // Try to get FFmpeg version
    const { stdout } = await execFileAsync(ffmpegPath, ['-version'])
    const version = stdout.split('\n')[0]

    return NextResponse.json({
      status: 'ok',
      ffmpeg: 'installed',
      version,
      path: ffmpegPath,
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        ffmpeg: 'not available',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    )
  }
}
