/**
 * Client-side video compression utility
 * Uses HTML5 Canvas and MediaRecorder API for compression
 */

export interface CompressionOptions {
  maxSizeMB?: number
  quality?: number // 0-1
  maxWidthOrHeight?: number
  onProgress?: (progress: number) => void
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Compress a video file using HTML5 Canvas and MediaRecorder
 * This reduces file size by re-encoding with lower quality/resolution
 */
export async function compressVideo(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const { maxSizeMB = 50, maxWidthOrHeight = 1280, onProgress = () => {} } = options

  const originalSize = file.size
  const targetSize = maxSizeMB * 1024 * 1024

  // If file is already small enough, return it as-is
  if (originalSize <= targetSize) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1.0,
    }
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    let mediaRecorder: MediaRecorder
    const chunks: Blob[] = []

    video.onloadedmetadata = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = video.videoWidth
      let height = video.videoHeight

      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        if (width > height) {
          height = Math.round((height * maxWidthOrHeight) / width)
          width = maxWidthOrHeight
        } else {
          width = Math.round((width * maxWidthOrHeight) / height)
          height = maxWidthOrHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Set up MediaRecorder with video stream from canvas
      const stream = canvas.captureStream(30) // 30 FPS

      // Calculate bitrate based on target size and video duration
      const duration = video.duration
      const targetBitrate = Math.floor((targetSize * 8) / duration) // bits per second

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'

      mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: Math.min(targetBitrate, 2500000), // Max 2.5 Mbps
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: mimeType })
        const compressedFile = new File([compressedBlob], file.name, {
          type: mimeType,
        })

        const compressedSize = compressedFile.size
        const compressionRatio = compressedSize / originalSize

        URL.revokeObjectURL(video.src)

        resolve({
          file: compressedFile,
          originalSize,
          compressedSize,
          compressionRatio,
        })
      }

      mediaRecorder.onerror = (error) => {
        reject(new Error(`MediaRecorder error: ${error}`))
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms

      // Play video and draw frames to canvas
      let lastProgress = 0
      video.currentTime = 0
      video.play()

      const drawFrame = () => {
        if (video.paused || video.ended) {
          mediaRecorder.stop()
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Update progress
        const progress = Math.round((video.currentTime / video.duration) * 100)
        if (progress !== lastProgress) {
          lastProgress = progress
          onProgress(progress)
        }

        requestAnimationFrame(drawFrame)
      }

      drawFrame()
    }

    video.onerror = () => {
      reject(new Error('Failed to load video file'))
    }

    // Load video file
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Check if browser supports video compression
 */
export function isCompressionSupported(): boolean {
  return !!(
    typeof MediaRecorder !== 'undefined' &&
    (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
      MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
      MediaRecorder.isTypeSupported('video/webm'))
  )
}

/**
 * Get estimated compression time in seconds
 */
export function estimateCompressionTime(fileSizeMB: number): number {
  // Rough estimate: ~1 second per MB on average hardware
  return Math.ceil(fileSizeMB)
}
