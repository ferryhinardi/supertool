'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  FileVideo,
  Minimize2,
  Palette,
  Play,
  Scissors,
  Settings,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ToolSearch } from '@/components/ui/tool-search'
import { compressVideo, isCompressionSupported } from '@/lib/media/video-compressor'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ProcessingFile {
  id: string
  videoFile: File
  subtitleFile: File
  videoPreview: string
  outputBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  originalSize: number
  outputSize?: number
}

interface QueuedVideo {
  id: string
  file: File
  preview: string
}

interface ServerStatus {
  status: 'checking' | 'ready' | 'error'
  message?: string
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB (Vercel Pro plan limit)

export default function VideoSubtitleCombinerPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null)
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'checking' })

  // Batch processing
  const [enableBatch, _setEnableBatch] = useState(false)
  const [_videoQueue, setVideoQueue] = useState<QueuedVideo[]>([])
  const [_currentBatchIndex, _setCurrentBatchIndex] = useState(0)

  // Compression options
  const [enableCompression, setEnableCompression] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const compressionSupported = isCompressionSupported()

  // Chunked upload options
  const [_useChunkedUpload, _setUseChunkedUpload] = useState(false)
  const [_isUploading, _setIsUploading] = useState(false)
  const [_uploadProgress, _setUploadProgress] = useState(0)
  const [_uploadedBytes, _setUploadedBytes] = useState(0)

  // Video trimming options
  const [enableTrim, setEnableTrim] = useState(false)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)

  // Video filter options
  const [enableFilters, setEnableFilters] = useState(false)
  const [brightness, setBrightness] = useState(1.0) // 0.0 to 2.0
  const [contrast, setContrast] = useState(1.0) // 0.0 to 2.0
  const [saturation, setSaturation] = useState(1.0) // 0.0 to 3.0

  // Advanced filter options
  const [enableAdvancedFilters, setEnableAdvancedFilters] = useState(false)
  const [blur, setBlur] = useState(0) // 0 to 20
  const [sharpen, setSharpen] = useState(0) // 0 to 5
  const [vignette, setVignette] = useState(0) // 0.0 to 1.0
  const [temperature, setTemperature] = useState(6500) // 1000 to 40000 (Kelvin)

  // Export preset options
  const [exportPreset, setExportPreset] = useState<
    'none' | 'instagram' | 'tiktok' | 'youtube' | 'twitter'
  >('none')

  // Preview options
  const [showPreview, _setShowPreview] = useState(true)
  const [previewWithFilters, setPreviewWithFilters] = useState(true)

  // Subtitle styling options
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5)
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'top' | 'center'>('bottom')

  // Check server status on mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        console.log('🔵 Checking server status...')
        const response = await fetch('/api/video-subtitle', {
          cache: 'no-store',
        })
        console.log('🔵 Response status:', response.status, response.ok)

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          console.error('❌ Server error response:', errorText)
          throw new Error(`Server returned ${response.status}`)
        }

        const data = await response.json()
        console.log('🔵 Server response:', data)

        if (data.status === 'ok') {
          setServerStatus({
            status: 'ready',
            message: `Server ready - FFmpeg ${data.version?.split(' ')[2] || 'installed'}`,
          })
          toast.success('Server is ready for video processing')
        } else {
          setServerStatus({ status: 'error', message: data.error || 'Server is not ready' })
          toast.error(`Server error: ${data.error || 'Not available'}`)
        }
      } catch (error) {
        console.error('❌ Server check failed:', error)
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        setServerStatus({
          status: 'error',
          message: `Failed to connect: ${errorMsg}`,
        })
        toast.error(
          'Failed to connect to processing server. The server may still be starting up. Please wait a moment and refresh the page.'
        )
      }
    }

    // Small delay to ensure API route is compiled in development
    const timeoutId = setTimeout(checkServer, 500)

    trackEvent({
      action: 'page_view',
      category: 'video_subtitle_combiner',
      label: 'tool_opened',
    })

    return () => clearTimeout(timeoutId)
  }, [])

  const handleVideoSelect = async (files: FileList) => {
    if (enableBatch) {
      // Batch mode: add all files to queue
      const validFiles: QueuedVideo[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('video/')) {
          toast.error(`Skipping ${file.name}: not a video file`)
          continue
        }

        if (file.size > MAX_VIDEO_SIZE) {
          toast.error(`Skipping ${file.name}: exceeds ${formatBytes(MAX_VIDEO_SIZE)} limit`)
          continue
        }

        validFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          preview: URL.createObjectURL(file),
        })
      }

      setVideoQueue((prev) => [...prev, ...validFiles])
      toast.success(`Added ${validFiles.length} video(s) to queue`)

      trackEvent({
        action: 'batch_videos_added',
        category: 'video_subtitle_combiner',
        label: `${validFiles.length}_videos`,
      })
      return
    }

    // Single file mode
    const file = files[0]
    if (!file || !file.type.startsWith('video/')) {
      toast.error('Please select a valid video file')
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`Video file exceeds the ${formatBytes(MAX_VIDEO_SIZE)} limit`)
      return
    }

    // Get video duration for trimming
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration)
      setTrimEnd(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.src = URL.createObjectURL(file)

    setVideoFile(file)
    toast.success(`Video file selected: ${file.name}`)
    trackEvent({
      action: 'video_selected',
      category: 'video_subtitle_combiner',
      label: file.type,
    })
  }

  const handleSubtitleSelect = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Validate subtitle file
    const text = await file.text()
    if (!text.includes('-->')) {
      toast.error('Please select a valid SRT or VTT subtitle file')
      return
    }

    setSubtitleFile(file)
    toast.success(`Subtitle file selected: ${file.name}`)
    trackEvent({
      action: 'subtitle_selected',
      category: 'video_subtitle_combiner',
      label: 'subtitle_file',
    })
  }

  const processVideo = async () => {
    if (!videoFile || !subtitleFile) {
      toast.error('Please select both video and subtitle files')
      return
    }

    if (serverStatus.status !== 'ready') {
      toast.error('Server is not ready. Please wait or refresh the page.')
      return
    }

    setIsProcessing(true)
    const startTime = Date.now()

    let processVideoFile = videoFile

    // Compress video if enabled and file is large
    if (enableCompression && videoFile.size > 50 * 1024 * 1024) {
      try {
        setIsCompressing(true)
        toast.info('Compressing video before upload...')

        const compressionResult = await compressVideo(videoFile, {
          maxSizeMB: 80,
          maxWidthOrHeight: 1920,
          onProgress: (progress) => {
            setCompressionProgress(progress)
          },
        })

        processVideoFile = compressionResult.file
        const savedMB = (
          (compressionResult.originalSize - compressionResult.compressedSize) /
          1024 /
          1024
        ).toFixed(1)

        toast.success(
          `Video compressed! Saved ${savedMB}MB (${Math.round(compressionResult.compressionRatio * 100)}% of original size)`
        )

        trackEvent({
          action: 'video_compressed',
          category: 'video_subtitle_combiner',
          label: 'compression_success',
          value: Math.round(compressionResult.compressionRatio * 100),
        })
      } catch (error) {
        console.error('Compression failed:', error)
        toast.error('Compression failed. Proceeding with original file...')
        processVideoFile = videoFile
      } finally {
        setIsCompressing(false)
        setCompressionProgress(0)
      }
    }

    const processingFile: ProcessingFile = {
      id: Math.random().toString(36).substring(7),
      videoFile: processVideoFile,
      subtitleFile,
      videoPreview: URL.createObjectURL(processVideoFile),
      status: 'processing',
      progress: 0,
      originalSize: processVideoFile.size,
    }

    setProcessingFiles((prev) => [...prev, processingFile])

    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProcessingFiles((prev) =>
        prev.map((file) => {
          if (file.id === processingFile.id && file.status === 'processing') {
            // Simulate progress: slowly increase to 95%, then wait for completion
            const newProgress = Math.min(file.progress + Math.random() * 5, 95)
            return { ...file, progress: Math.round(newProgress) }
          }
          return file
        })
      )
    }, 1000)

    try {
      toast.info('Processing video... This may take a few minutes.')
      trackEvent({
        action: 'processing_started',
        category: 'video_subtitle_combiner',
        label: 'burn_subtitles',
      })

      const formData = new FormData()
      formData.append('video', processVideoFile)
      formData.append('subtitle', subtitleFile)
      formData.append('fontSize', fontSize.toString())
      formData.append('fontColor', fontColor)
      formData.append('backgroundColor', backgroundColor)
      formData.append('backgroundOpacity', backgroundOpacity.toString())
      formData.append('subtitlePosition', subtitlePosition)

      // Add trim parameters if enabled
      if (enableTrim) {
        formData.append('trimStart', trimStart.toString())
        formData.append('trimEnd', trimEnd.toString())
      }

      // Add filter parameters if enabled
      if (enableFilters) {
        formData.append('brightness', brightness.toString())
        formData.append('contrast', contrast.toString())
        formData.append('saturation', saturation.toString())
      }

      // Add advanced filter parameters if enabled
      if (enableAdvancedFilters) {
        formData.append('blur', blur.toString())
        formData.append('sharpen', sharpen.toString())
        formData.append('vignette', vignette.toString())
        formData.append('temperature', temperature.toString())
      }

      // Add export preset
      if (exportPreset !== 'none') {
        formData.append('exportPreset', exportPreset)
      }

      const response = await fetch('/api/video-subtitle', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process video')
      }

      const blob = await response.blob()
      const processingTime = Date.now() - startTime

      setProcessingFiles((prev) =>
        prev.map((file) =>
          file.id === processingFile.id
            ? {
                ...file,
                outputBlob: blob,
                outputSize: blob.size,
                status: 'completed',
                progress: 100,
              }
            : file
        )
      )

      toast.success('Video processed successfully!')
      trackEvent({
        action: 'processing_completed',
        category: 'video_subtitle_combiner',
        label: 'burn_subtitles_success',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Error processing video:', error)
      setProcessingFiles((prev) =>
        prev.map((file) =>
          file.id === processingFile.id
            ? {
                ...file,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to process video',
              }
            : file
        )
      )

      toast.error(error instanceof Error ? error.message : 'Failed to process video')
      trackEvent({
        action: 'processing_error',
        category: 'video_subtitle_combiner',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (file: ProcessingFile) => {
    if (!file.outputBlob) return

    const url = URL.createObjectURL(file.outputBlob)
    const a = document.createElement('a')
    a.href = url
    const originalName = file.videoFile.name.split('.').slice(0, -1).join('.')
    const extension = file.videoFile.name.split('.').pop()
    a.download = `${originalName}_subtitled.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Video downloaded successfully!')
    trackEvent({
      action: 'video_downloaded',
      category: 'video_subtitle_combiner',
      label: 'subtitled_video',
    })
  }

  const handleBatchDownload = async () => {
    const completedFiles = processingFiles.filter((f) => f.status === 'completed' && f.outputBlob)

    if (completedFiles.length === 0) {
      toast.error('No completed videos to download')
      return
    }

    if (completedFiles.length === 1) {
      // Just download the single file
      handleDownload(completedFiles[0])
      return
    }

    try {
      toast.info('Creating ZIP archive...')

      // Dynamically import JSZip
      const JSZip = (await import('jszip')).default

      const zip = new JSZip()

      // Add each video to the ZIP
      for (const file of completedFiles) {
        if (file.outputBlob) {
          const originalName = file.videoFile.name.split('.').slice(0, -1).join('.')
          const extension = file.videoFile.name.split('.').pop()
          const filename = `${originalName}_subtitled.${extension}`

          zip.file(filename, file.outputBlob)
        }
      }

      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // Download ZIP
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subtitled_videos_${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Downloaded ${completedFiles.length} videos as ZIP!`)
      trackEvent({
        action: 'batch_downloaded',
        category: 'video_subtitle_combiner',
        label: 'zip_download',
        value: completedFiles.length,
      })
    } catch (error) {
      console.error('Error creating ZIP:', error)
      toast.error('Failed to create ZIP archive')
    }
  }

  const handleRemove = (id: string) => {
    setProcessingFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.videoPreview)
      }
      return prev.filter((f) => f.id !== id)
    })

    trackEvent({
      action: 'file_removed',
      category: 'video_subtitle_combiner',
    })
  }

  const handleReset = () => {
    setVideoFile(null)
    setSubtitleFile(null)
    for (const file of processingFiles) {
      URL.revokeObjectURL(file.videoPreview)
    }
    setProcessingFiles([])

    trackEvent({
      action: 'reset',
      category: 'video_subtitle_combiner',
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const getFilterStyles = () => {
    const filters: string[] = []

    // Basic filters
    if (enableFilters && previewWithFilters) {
      filters.push(`brightness(${brightness})`)
      filters.push(`contrast(${contrast})`)
      filters.push(`saturate(${saturation})`)
    }

    // Advanced filters
    if (enableAdvancedFilters && previewWithFilters) {
      if (blur > 0) {
        filters.push(`blur(${blur}px)`)
      }
      // Note: CSS doesn't support sharpen, vignette, or color temperature directly
      // These will only be visible in the final processed video
    }

    return filters.length > 0 ? { filter: filters.join(' ') } : {}
  }

  const canProcess = videoFile && subtitleFile && !isProcessing && serverStatus.status === 'ready'

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            bg: 'rgba(59, 130, 246, 0.1)',
            px: '4',
            py: '2',
          })}
        >
          <Sparkles className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.400' })}>
            Video Tools
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            color: 'white',
            lineHeight: 'tight',
          })}
        >
          Video Subtitle Combiner
        </h1>

        <p
          className={css({
            fontSize: { base: 'base', sm: 'lg' },
            color: 'white',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Merge SRT subtitle files with your videos. Customize subtitle appearance with custom
          fonts, colors, and positioning. All processing happens in your browser using FFmpeg.
        </p>

        {/* Initialize Tool Button */}
        <div className={css({ mx: 'auto', maxW: 'md' })}>
          <Button
            onClick={() => {
              const element = document.getElementById('upload-section')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={css({ gap: '2', bg: 'blue.600', _hover: { bg: 'blue.700' } })}
          >
            <Zap className={css({ h: '4', w: '4' })} />
            Initialize Subtitle Tool
          </Button>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div
        id="upload-section"
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: '1fr 2fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
        })}
      >
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={css({
            gridColumn: { base: '1 / -1', md: '1 / 2', lg: '1 / 3' },
            spaceY: '6',
          })}
        >
          {/* Server Status */}
          <Card>
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                {serverStatus.status === 'ready' && (
                  <CheckCircle className={css({ h: '5', w: '5', color: 'green.500' })} />
                )}
                {serverStatus.status === 'error' && (
                  <AlertCircle className={css({ h: '5', w: '5', color: 'red.500' })} />
                )}
                {serverStatus.status === 'checking' && (
                  <Settings className={css({ h: '5', w: '5', color: 'blue.500' })} />
                )}
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={css({ fontSize: 'sm', color: 'white' })}>
                {serverStatus.message || 'Checking server status...'}
              </p>
            </CardContent>
          </Card>

          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  color: 'gray.200',
                })}
              >
                <FileVideo className={css({ h: '5', w: '5', color: 'blue.400' })} />
                Video File
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              <DragDropZone
                onFilesSelected={(files) => handleVideoSelect(files)}
                accept="video/*"
                multiple={false}
                disabled={serverStatus.status !== 'ready'}
              />
              {videoFile && (
                <div className={css({ p: '3', rounded: 'md', bg: 'rgba(34, 197, 94, 0.1)' })}>
                  <p className={css({ fontSize: 'sm', color: 'green.400' })}>
                    ✓ {videoFile.name} ({formatBytes(videoFile.size)})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subtitle Upload */}
          <Card>
            <CardHeader>
              <CardTitle
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  color: 'gray.200',
                })}
              >
                <FileText className={css({ h: '5', w: '5', color: 'purple.400' })} />
                Subtitle File (SRT/VTT)
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              <DragDropZone
                onFilesSelected={(files) => handleSubtitleSelect(files)}
                accept=".srt,.vtt"
                multiple={false}
                disabled={serverStatus.status !== 'ready'}
              />
              {subtitleFile && (
                <div className={css({ p: '3', rounded: 'md', bg: 'rgba(168, 85, 247, 0.1)' })}>
                  <p className={css({ fontSize: 'sm', color: 'purple.400' })}>
                    ✓ {subtitleFile.name} ({formatBytes(subtitleFile.size)})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Preview */}
          {videoFile && showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Play className={css({ h: '5', w: '5', color: 'green.400' })} />
                  Video Preview
                </CardTitle>
                <CardDescription>Preview with filters applied</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '3' })}>
                {/* biome-ignore lint/a11y/useMediaCaption: preview video, no captions needed */}
                <video
                  src={URL.createObjectURL(videoFile)}
                  controls
                  style={getFilterStyles()}
                  className={css({
                    w: 'full',
                    rounded: 'md',
                    bg: 'black',
                    maxH: '400px',
                    transition: 'filter 0.3s ease',
                  })}
                />
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <label
                    htmlFor="preview-filters"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                  >
                    Show Filter Preview
                  </label>
                  <input
                    id="preview-filters"
                    type="checkbox"
                    checked={previewWithFilters}
                    onChange={(e) => setPreviewWithFilters(e.target.checked)}
                    className={css({ w: '4', h: '4', cursor: 'pointer' })}
                    disabled={!enableFilters}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Process Button */}
          <Button
            onClick={processVideo}
            disabled={!canProcess}
            className={css({
              w: 'full',
              gap: '2',
              h: '12',
              fontSize: 'lg',
              bg: 'green.600',
              _hover: { bg: 'green.700' },
              _disabled: {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            })}
          >
            {isProcessing ? (
              <>
                <Settings className={css({ h: '5', w: '5', animation: 'spin' })} />
                Processing...
              </>
            ) : (
              <>
                <Play className={css({ h: '5', w: '5' })} />
                Burn Subtitles
              </>
            )}
          </Button>
        </motion.div>

        {/* Subtitle Styling Options */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={css({ gridColumn: { base: '1 / -1', md: '2 / 3', lg: '3 / 4' }, spaceY: '6' })}
        >
          {/* Video Trimming */}
          {videoFile && videoDuration > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Scissors className={css({ h: '5', w: '5', color: 'orange.400' })} />
                  Trim Video
                </CardTitle>
                <CardDescription>Cut video to specific time range</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <label
                    htmlFor="enable-trim"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                  >
                    Enable Trimming
                  </label>
                  <input
                    id="enable-trim"
                    type="checkbox"
                    checked={enableTrim}
                    onChange={(e) => setEnableTrim(e.target.checked)}
                    className={css({ w: '4', h: '4', cursor: 'pointer' })}
                  />
                </div>

                {enableTrim && (
                  <>
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Start Time: {trimStart.toFixed(1)}s
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={videoDuration}
                        step="0.1"
                        value={trimStart}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setTrimStart(Math.min(value, trimEnd - 0.1))
                        }}
                        className={css({ w: 'full' })}
                      />
                    </div>

                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        End Time: {trimEnd.toFixed(1)}s
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={videoDuration}
                        step="0.1"
                        value={trimEnd}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          setTrimEnd(Math.max(value, trimStart + 0.1))
                        }}
                        className={css({ w: 'full' })}
                      />
                    </div>

                    <p className={css({ fontSize: 'sm', color: 'orange.400' })}>
                      Duration: {(trimEnd - trimStart).toFixed(1)}s / {videoDuration.toFixed(1)}s
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Video Filters */}
          {videoFile && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Settings className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                  Video Filters
                </CardTitle>
                <CardDescription>Adjust video appearance</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <label
                    htmlFor="enable-filters"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                  >
                    Enable Filters
                  </label>
                  <input
                    id="enable-filters"
                    type="checkbox"
                    checked={enableFilters}
                    onChange={(e) => setEnableFilters(e.target.checked)}
                    className={css({ w: '4', h: '4', cursor: 'pointer' })}
                  />
                </div>

                {enableFilters && (
                  <>
                    {/* Brightness */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Brightness: {brightness.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={brightness}
                        onChange={(e) => setBrightness(parseFloat(e.target.value))}
                        className={css({ w: 'full' })}
                      />
                    </div>

                    {/* Contrast */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Contrast: {contrast.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={contrast}
                        onChange={(e) => setContrast(parseFloat(e.target.value))}
                        className={css({ w: 'full' })}
                      />
                    </div>

                    {/* Saturation */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Saturation: {saturation.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.05"
                        value={saturation}
                        onChange={(e) => setSaturation(parseFloat(e.target.value))}
                        className={css({ w: 'full' })}
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setBrightness(1.0)
                        setContrast(1.0)
                        setSaturation(1.0)
                      }}
                      className={css({ w: 'full', fontSize: 'xs' })}
                    >
                      Reset Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Advanced Filters */}
          {videoFile && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Sparkles className={css({ h: '5', w: '5', color: 'purple.400' })} />
                  Advanced Filters
                </CardTitle>
                <CardDescription>Apply professional-grade effects to your video</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent checkbox */}
                  <label className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                    Enable Advanced Filters
                  </label>
                  <input
                    type="checkbox"
                    checked={enableAdvancedFilters}
                    onChange={(e) => setEnableAdvancedFilters(e.target.checked)}
                    className={css({ w: '4', h: '4', cursor: 'pointer' })}
                  />
                </div>

                {enableAdvancedFilters && (
                  <>
                    {/* Blur */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Blur: {blur}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={blur}
                        onChange={(e) => setBlur(parseInt(e.target.value, 10))}
                        className={css({ w: 'full' })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Add motion blur or soften the image
                      </p>
                    </div>

                    {/* Sharpen */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Sharpen: {sharpen}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={sharpen}
                        onChange={(e) => setSharpen(parseFloat(e.target.value))}
                        className={css({ w: 'full' })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Enhance edges and details
                      </p>
                    </div>

                    {/* Vignette */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Vignette: {vignette.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={vignette}
                        onChange={(e) => setVignette(parseFloat(e.target.value))}
                        className={css({ w: 'full' })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        Darken corners for cinematic look
                      </p>
                    </div>

                    {/* Color Temperature */}
                    <div className={css({ spaceY: '2' })}>
                      {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent input */}
                      <label
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                      >
                        Temperature: {temperature}K
                      </label>
                      <input
                        type="range"
                        min="2000"
                        max="12000"
                        step="100"
                        value={temperature}
                        onChange={(e) => setTemperature(parseInt(e.target.value, 10))}
                        className={css({ w: 'full' })}
                      />
                      <p className={css({ fontSize: 'xs', color: 'white' })}>
                        {temperature < 6500
                          ? '❄️ Cool (blue)'
                          : temperature > 6500
                            ? '🔥 Warm (orange)'
                            : '☀️ Neutral'}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setBlur(0)
                        setSharpen(0)
                        setVignette(0)
                        setTemperature(6500)
                      }}
                      className={css({ w: 'full', fontSize: 'xs' })}
                    >
                      Reset Advanced Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Export Presets */}
          {videoFile && (
            <Card>
              <CardHeader>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Zap className={css({ h: '5', w: '5', color: 'yellow.400' })} />
                  Export Presets
                </CardTitle>
                <CardDescription>
                  Optimize video for specific social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gap: '3',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                  })}
                >
                  <button
                    type="button"
                    onClick={() => setExportPreset('none')}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: exportPreset === 'none' ? 'blue.500' : 'gray.700',
                      bg: exportPreset === 'none' ? 'rgba(59, 130, 246, 0.1)' : 'gray.800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'blue.500' },
                    })}
                  >
                    <p className={css({ fontWeight: 'medium', fontSize: 'sm' })}>Original</p>
                    <p className={css({ fontSize: 'xs', color: 'white', mt: '1' })}>
                      No optimization
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportPreset('youtube')}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: exportPreset === 'youtube' ? 'red.500' : 'gray.700',
                      bg: exportPreset === 'youtube' ? 'rgba(239, 68, 68, 0.1)' : 'gray.800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'red.500' },
                    })}
                  >
                    <p className={css({ fontWeight: 'medium', fontSize: 'sm' })}>YouTube</p>
                    <p className={css({ fontSize: 'xs', color: 'white', mt: '1' })}>
                      1920x1080 • 30fps
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportPreset('instagram')}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: exportPreset === 'instagram' ? 'pink.500' : 'gray.700',
                      bg: exportPreset === 'instagram' ? 'rgba(236, 72, 153, 0.1)' : 'gray.800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'pink.500' },
                    })}
                  >
                    <p className={css({ fontWeight: 'medium', fontSize: 'sm' })}>Instagram</p>
                    <p className={css({ fontSize: 'xs', color: 'white', mt: '1' })}>
                      1080x1350 • 4:5
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportPreset('tiktok')}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: exportPreset === 'tiktok' ? 'cyan.500' : 'gray.700',
                      bg: exportPreset === 'tiktok' ? 'rgba(6, 182, 212, 0.1)' : 'gray.800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'cyan.500' },
                    })}
                  >
                    <p className={css({ fontWeight: 'medium', fontSize: 'sm' })}>TikTok</p>
                    <p className={css({ fontSize: 'xs', color: 'white', mt: '1' })}>
                      1080x1920 • 9:16
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportPreset('twitter')}
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: exportPreset === 'twitter' ? 'blue.400' : 'gray.700',
                      bg: exportPreset === 'twitter' ? 'rgba(96, 165, 250, 0.1)' : 'gray.800',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: { borderColor: 'blue.400' },
                      gridColumn: 'span 2',
                    })}
                  >
                    <p className={css({ fontWeight: 'medium', fontSize: 'sm' })}>Twitter / X</p>
                    <p className={css({ fontSize: 'xs', color: 'white', mt: '1' })}>
                      1280x1024 • 30fps
                    </p>
                  </button>
                </div>

                {exportPreset !== 'none' && (
                  <div
                    className={css({
                      p: '3',
                      rounded: 'lg',
                      bg: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid',
                      borderColor: 'blue.500/50',
                    })}
                  >
                    <p className={css({ fontSize: 'xs', color: 'white' })}>
                      ℹ️ Video will be optimized for{' '}
                      <span className={css({ fontWeight: 'bold', textTransform: 'capitalize' })}>
                        {exportPreset}
                      </span>{' '}
                      with proper aspect ratio, frame rate, and encoding settings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compression Options */}
          <Card>
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Minimize2 className={css({ h: '5', w: '5', color: 'cyan.400' })} />
                Compression
              </CardTitle>
              <CardDescription>
                {compressionSupported
                  ? 'Compress large videos before processing'
                  : 'Not supported in this browser'}
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {compressionSupported ? (
                <>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <label
                      htmlFor="enable-compression"
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                    >
                      Enable Compression
                    </label>
                    <input
                      id="enable-compression"
                      type="checkbox"
                      checked={enableCompression}
                      onChange={(e) => setEnableCompression(e.target.checked)}
                      className={css({ w: '4', h: '4', cursor: 'pointer' })}
                    />
                  </div>
                  {isCompressing && (
                    <div className={css({ spaceY: '2' })}>
                      <p className={css({ fontSize: 'sm', color: 'cyan.400' })}>
                        Compressing... {compressionProgress}%
                      </p>
                      <Progress value={compressionProgress} className={css({ h: '2' })} />
                    </div>
                  )}
                  <p className={css({ fontSize: 'xs', color: 'white' })}>
                    Automatically compress videos larger than 50MB. Helps process larger files
                    within the 100MB upload limit.
                  </p>
                </>
              ) : (
                <p className={css({ fontSize: 'sm', color: 'white' })}>
                  Video compression is not supported in this browser. Try using Chrome, Edge, or
                  Firefox.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Palette className={css({ h: '5', w: '5', color: 'pink.400' })} />
                Subtitle Styling
              </CardTitle>
              <CardDescription>Customize subtitle appearance</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {/* Font Size */}
              <div className={css({ spaceY: '2' })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent range input */}
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className={css({ w: 'full' })}
                />
              </div>

              {/* Font Color */}
              <div className={css({ spaceY: '2' })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent color input */}
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Font Color
                </label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className={css({ w: 'full', h: '10', rounded: 'md', cursor: 'pointer' })}
                />
              </div>

              {/* Background Color */}
              <div className={css({ spaceY: '2' })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent color input */}
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={css({ w: 'full', h: '10', rounded: 'md', cursor: 'pointer' })}
                />
              </div>

              {/* Background Opacity */}
              <div className={css({ spaceY: '2' })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes adjacent range input */}
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Background Opacity: {Math.round(backgroundOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={backgroundOpacity}
                  onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                  className={css({ w: 'full' })}
                />
              </div>

              {/* Position */}
              <div className={css({ spaceY: '2' })}>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: label describes position button group below */}
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Position
                </label>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2',
                    w: 'full',
                  })}
                >
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setSubtitlePosition(pos)}
                      className={css({
                        px: '3',
                        py: '2',
                        rounded: 'md',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        border: '1px solid',
                        borderColor: subtitlePosition === pos ? 'blue.500' : 'gray.700',
                        bg: subtitlePosition === pos ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        color: subtitlePosition === pos ? 'blue.400' : 'gray.400',
                        cursor: 'pointer',
                        _hover: { borderColor: 'blue.500' },
                      })}
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          {(videoFile || subtitleFile) && (
            <Button
              onClick={handleReset}
              variant="outline"
              className={css({ w: 'full', gap: '2' })}
            >
              <Trash2 className={css({ h: '4', w: '4' })} />
              Reset All
            </Button>
          )}
        </motion.div>
      </div>

      {/* Processed Videos */}
      {processingFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={css({ spaceY: '4' })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '4',
            })}
          >
            <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'white' })}>
              Processed Videos ({processingFiles.filter((f) => f.status === 'completed').length}/
              {processingFiles.length})
            </h2>

            {processingFiles.filter((f) => f.status === 'completed').length > 1 && (
              <Button onClick={handleBatchDownload} variant="outline" className={css({ gap: '2' })}>
                <Download className={css({ h: '4', w: '4' })} />
                Download All as ZIP
              </Button>
            )}
          </div>

          <div
            className={css({
              display: 'grid',
              gap: '4',
              gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
            })}
          >
            {processingFiles.map((file) => (
              <Card key={file.id}>
                <CardContent withTopPadding className={css({ p: '4', spaceY: '3' })}>
                  {/* Video Preview */}
                  {/* biome-ignore lint/a11y/useMediaCaption: preview video, captions will be burned into output */}
                  <video
                    src={file.videoPreview}
                    controls
                    className={css({ w: 'full', rounded: 'md', bg: 'black', h: '40' })}
                  />

                  {/* File Info */}
                  <div className={css({ spaceY: '2' })}>
                    <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                      {file.videoFile.name}
                    </p>
                    <p className={css({ fontSize: 'xs', color: 'white' })}>
                      Original: {formatBytes(file.originalSize)}
                      {file.outputSize && ` → Output: ${formatBytes(file.outputSize)}`}
                    </p>
                  </div>

                  {/* Status */}
                  {file.status === 'processing' && (
                    <div className={css({ spaceY: '2' })}>
                      <p className={css({ fontSize: 'sm', color: 'blue.400' })}>
                        Processing... {file.progress}%
                      </p>
                      <Progress value={file.progress} className={css({ h: '2' })} />
                    </div>
                  )}

                  {file.status === 'completed' && (
                    <div className={css({ display: 'flex', gap: '2' })}>
                      <Button
                        onClick={() => handleDownload(file)}
                        className={css({ flex: '1', gap: '2' })}
                      >
                        <Download className={css({ h: '4', w: '4' })} />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleRemove(file.id)}
                        variant="outline"
                        className={css({ gap: '2' })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className={css({ spaceY: '2' })}>
                      <p className={css({ fontSize: 'sm', color: 'red.400' })}>{file.error}</p>
                      <Button
                        onClick={() => handleRemove(file.id)}
                        variant="outline"
                        className={css({ w: 'full', gap: '2' })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tool Search */}
      <div className={css({ mt: '12' })}>
        <ToolSearch />
      </div>
    </main>
  )
}
