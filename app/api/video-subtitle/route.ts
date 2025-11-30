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
        console.log('✅ Using cached FFmpeg from /tmp')
        return FFMPEG_PATH
      } catch {
        // Download FFmpeg binary on first request
        console.log('📥 Downloading FFmpeg binary...')
        const response = await fetch(
          'https://github.com/eugeneware/ffmpeg-static/releases/download/b6.0/ffmpeg-linux-x64.gz'
        )

        if (!response.ok) {
          throw new Error(`Failed to download FFmpeg: ${response.statusText}`)
        }

        const { createGunzip } = await import('node:zlib')
        const { createWriteStream } = await import('node:fs')
        const { pipeline } = await import('node:stream/promises')

        // Download, gunzip, and save to /tmp
        const gunzip = createGunzip()
        const writeStream = createWriteStream(tmpFFmpegPath, { mode: 0o755 })

        await pipeline(response.body as any, gunzip, writeStream)

        FFMPEG_PATH = tmpFFmpegPath
        console.log('✅ FFmpeg downloaded and cached to /tmp')
      }
    } else {
      // Development: try ffmpeg-static first, fallback to system ffmpeg
      try {
        const ffmpegStatic = await import('ffmpeg-static')
        FFMPEG_PATH = ffmpegStatic.default || ''
        console.log('💻 Using ffmpeg-static for development:', FFMPEG_PATH)
      } catch {
        // Fallback to system ffmpeg (brew install ffmpeg)
        FFMPEG_PATH = 'ffmpeg'
        console.log('💻 Using system FFmpeg for development')
      }
    }

    if (!FFMPEG_PATH) {
      throw new Error('FFmpeg path is empty')
    }

    // Validate the binary exists and is executable
    await access(FFMPEG_PATH)
    console.log('✅ FFmpeg binary verified at:', FFMPEG_PATH)

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
}

export async function POST(request: NextRequest) {
  let tempDir: string | null = null

  try {
    console.log('🔵 Video subtitle API called')

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

    console.log('🔵 Files received:', {
      video: videoFile?.name,
      videoSize: videoFile?.size,
      subtitle: subtitleFile?.name,
      subtitleSize: subtitleFile?.size,
      trimStart,
      trimEnd,
    })

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

    // Parse options
    const options: SubtitleOptions = {
      fontSize: fontSize ? parseInt(fontSize as string, 10) : undefined,
      fontColor: fontColor as string,
      backgroundColor: backgroundColor as string,
      backgroundOpacity: backgroundOpacity ? parseFloat(backgroundOpacity as string) : undefined,
      position: subtitlePosition as 'bottom' | 'top' | 'center',
      trimStart: trimStart ? parseFloat(trimStart as string) : undefined,
      trimEnd: trimEnd ? parseFloat(trimEnd as string) : undefined,
      brightness: brightness ? parseFloat(brightness as string) : undefined,
      contrast: contrast ? parseFloat(contrast as string) : undefined,
      saturation: saturation ? parseFloat(saturation as string) : undefined,
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

    ffmpegArgs.push(
      '-vf',
      ffmpegFilters,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '23',
      '-c:a',
      'copy',
      '-y', // Overwrite output file
      outputVideoPath
    )

    // Execute FFmpeg command with progress tracking
    console.log('Executing FFmpeg with args:', [ffmpegPath, ...ffmpegArgs].join(' '))

    // First, get video duration for progress calculation
    const durationArgs = ['-i', inputVideoPath, '-f', 'null', '-']
    let totalDuration = 0

    try {
      await execFileAsync(ffmpegPath, durationArgs)
    } catch (durationError: unknown) {
      // FFmpeg outputs duration info to stderr even on "error"
      const stderr = (durationError as { stderr?: string })?.stderr
      const durationMatch = stderr?.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
      if (durationMatch) {
        const hours = parseInt(durationMatch[1], 10)
        const minutes = parseInt(durationMatch[2], 10)
        const seconds = parseInt(durationMatch[3], 10)
        totalDuration = hours * 3600 + minutes * 60 + seconds
        console.log(`Video duration: ${totalDuration} seconds`)
      }
    }

    const { stdout, stderr } = await execFileAsync(ffmpegPath, ffmpegArgs, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for output
    })

    console.log('FFmpeg stdout:', stdout)
    if (stderr) console.log('FFmpeg stderr:', stderr)

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
    // Use eq filter for brightness and contrast
    // Use hue filter for saturation
    const eqFilter = `eq=brightness=${(brightness - 1.0) * 0.1}:contrast=${contrast}:saturation=${saturation}`
    filters.push(eqFilter)
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
