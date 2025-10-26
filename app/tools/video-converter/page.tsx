'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import {
  Video,
  Download,
  Trash2,
  Settings,
  Sparkles,
  Zap,
  Play,
  Film,
  Scissors,
  FileVideo,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { DragDropZone } from '@/components/features/DragDropZone'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface VideoFile {
  id: string
  file: File
  preview: string
  originalSize: number
  convertedSize?: number
  convertedBlob?: Blob
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  duration?: number
}

type OutputFormat = 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv'
type VideoCodec = 'h264' | 'h265' | 'vp9' | 'av1'
type AudioCodec = 'aac' | 'mp3' | 'opus'

const MAX_VIDEOS = 10 // Maximum number of videos that can be processed at once
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB per video

export default function VideoConverterPage() {
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4')
  const [videoCodec, setVideoCodec] = useState<VideoCodec>('h264')
  const [audioCodec, setAudioCodec] = useState<AudioCodec>('aac')
  const [quality, setQuality] = useState(23) // CRF value (lower = better quality)
  const [resolution, setResolution] = useState<string>('original')
  const [isProcessing, setIsProcessing] = useState(false)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false)

  const ffmpegRef = useRef<FFmpeg | null>(null)

  // Track page visit
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'video_converter',
      label: 'tool_opened',
    })
  }, [])

  // Load FFmpeg
  const loadFFmpeg = async () => {
    if (ffmpegLoaded || loadingFFmpeg) return

    setLoadingFFmpeg(true)
    try {
      const ffmpeg = new FFmpeg()
      ffmpegRef.current = ffmpeg

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })

      ffmpeg.on('progress', ({ progress }) => {
        // Update progress for current video
        setVideos((prev) =>
          prev.map((video) =>
            video.status === 'processing'
              ? { ...video, progress: Math.round(progress * 100) }
              : video
          )
        )
      })

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      setFfmpegLoaded(true)
      trackEvent({
        action: 'ffmpeg_loaded',
        category: 'video_converter',
        label: 'initialization_success',
      })
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      trackEvent({
        action: 'ffmpeg_load_error',
        category: 'video_converter',
        label: 'initialization_failed',
      })
    } finally {
      setLoadingFFmpeg(false)
    }
  }

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files)
    const videoFiles = fileArray.filter((file) => file.type.startsWith('video/'))

    // Check if adding these videos would exceed the limit
    if (videos.length + videoFiles.length > MAX_VIDEOS) {
      alert(`Maximum ${MAX_VIDEOS} videos allowed. Please remove some videos first.`)
      return
    }

    // Check for oversized files
    const oversizedFiles = videoFiles.filter((file) => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      alert(
        `Some files exceed the ${formatBytes(MAX_FILE_SIZE)} limit: ${oversizedFiles.map((f) => f.name).join(', ')}`
      )
      return
    }

    trackEvent({
      action: 'files_added',
      category: 'video_converter',
      label: 'video_upload',
      value: videoFiles.length,
    })

    const newVideos: VideoFile[] = await Promise.all(
      videoFiles.map(async (file) => {
        const preview = URL.createObjectURL(file)
        // Get video duration
        const video = document.createElement('video')
        video.src = preview
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve
        })

        return {
          id: Math.random().toString(36).substring(7),
          file,
          preview,
          originalSize: file.size,
          status: 'pending' as const,
          progress: 0,
          duration: video.duration,
        }
      })
    )

    setVideos((prev) => [...prev, ...newVideos])

    // Load FFmpeg when first video is added
    if (!ffmpegLoaded && !loadingFFmpeg) {
      loadFFmpeg()
    }
  }

  const convertVideo = async (videoFile: VideoFile) => {
    if (!ffmpegRef.current || !ffmpegLoaded) {
      console.error('FFmpeg not loaded')
      return
    }

    const startTime = Date.now()

    try {
      setVideos((prev) =>
        prev.map((v) => (v.id === videoFile.id ? { ...v, status: 'processing', progress: 0 } : v))
      )

      trackEvent({
        action: 'conversion_started',
        category: 'video_converter',
        label: `${videoCodec}_${outputFormat}`,
      })

      const ffmpeg = ffmpegRef.current
      const inputName =
        'input' + videoFile.file.name.substring(videoFile.file.name.lastIndexOf('.'))
      const outputName = `output.${outputFormat}`

      // Write input file
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile.file))

      // Build FFmpeg command
      const args: string[] = ['-i', inputName]

      // Video codec
      if (videoCodec === 'h264') {
        args.push('-c:v', 'libx264', '-crf', quality.toString())
      } else if (videoCodec === 'h265') {
        args.push('-c:v', 'libx265', '-crf', quality.toString())
      } else if (videoCodec === 'vp9') {
        args.push('-c:v', 'libvpx-vp9', '-crf', quality.toString())
      }

      // Audio codec
      if (audioCodec === 'aac') {
        args.push('-c:a', 'aac', '-b:a', '128k')
      } else if (audioCodec === 'mp3') {
        args.push('-c:a', 'libmp3lame', '-b:a', '128k')
      } else if (audioCodec === 'opus') {
        args.push('-c:a', 'libopus', '-b:a', '128k')
      }

      // Resolution
      if (resolution !== 'original') {
        args.push('-vf', `scale=${resolution}`)
      }

      // Output format
      args.push(outputName)

      // Execute conversion
      await ffmpeg.exec(args)

      // Read output file
      const data = await ffmpeg.readFile(outputName)
      const uint8Array = data as Uint8Array
      // Create a copy with regular ArrayBuffer (not SharedArrayBuffer)
      const regularUint8Array = new Uint8Array(uint8Array)
      const blob = new Blob([regularUint8Array], { type: `video/${outputFormat}` })

      // Clean up FFmpeg files
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      const conversionTime = Date.now() - startTime

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoFile.id
            ? {
                ...v,
                convertedBlob: blob,
                convertedSize: blob.size,
                status: 'completed',
                progress: 100,
              }
            : v
        )
      )

      trackEvent({
        action: 'conversion_completed',
        category: 'video_converter',
        label: `${videoCodec}_${outputFormat}`,
        value: Math.round(conversionTime / 1000), // conversion time in seconds
      })
    } catch (error) {
      console.error('Error converting video:', error)
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoFile.id
            ? {
                ...v,
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to convert video',
              }
            : v
        )
      )

      trackEvent({
        action: 'conversion_error',
        category: 'video_converter',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }

  const handleConvertAll = async () => {
    setIsProcessing(true)
    const pendingVideos = videos.filter((v) => v.status === 'pending')

    for (const video of pendingVideos) {
      await convertVideo(video)
    }

    setIsProcessing(false)
  }

  const handleDownload = (videoFile: VideoFile) => {
    if (!videoFile.convertedBlob) return

    const url = URL.createObjectURL(videoFile.convertedBlob)
    const a = document.createElement('a')
    a.href = url
    const originalName = videoFile.file.name.split('.').slice(0, -1).join('.')
    a.download = `${originalName}_converted.${outputFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackEvent({
      action: 'video_downloaded',
      category: 'video_converter',
      label: outputFormat,
    })
  }

  const handleDownloadAll = () => {
    const completedVideos = videos.filter((v) => v.status === 'completed')
    completedVideos.forEach((video) => {
      setTimeout(() => handleDownload(video), 100)
    })

    trackEvent({
      action: 'batch_download',
      category: 'video_converter',
      label: 'download_all',
      value: completedVideos.length,
    })
  }

  const handleRemove = (id: string) => {
    setVideos((prev) => {
      const video = prev.find((v) => v.id === id)
      if (video) {
        URL.revokeObjectURL(video.preview)
      }
      return prev.filter((v) => v.id !== id)
    })

    trackEvent({
      action: 'video_removed',
      category: 'video_converter',
    })
  }

  const handleClearAll = () => {
    videos.forEach((v) => URL.revokeObjectURL(v.preview))
    setVideos([])

    trackEvent({
      action: 'clear_all',
      category: 'video_converter',
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateSavings = (original: number, converted?: number) => {
    if (!converted) return 0
    return Math.round(((original - converted) / original) * 100)
  }

  const totalOriginalSize = videos.reduce((sum, v) => sum + v.originalSize, 0)
  const totalConvertedSize = videos.reduce((sum, v) => sum + (v.convertedSize || 0), 0)
  const totalSavings =
    totalOriginalSize > 0 ? calculateSavings(totalOriginalSize, totalConvertedSize) : 0

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'indigo.500/20',
            bg: 'indigo.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <Video className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-300">
            Professional Video Conversion
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Video Converter & Compressor
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: 'lg',
            color: 'gray.400',
          })}
        >
          Convert videos between formats (MP4, WebM, AVI, MOV), compress file sizes, and optimize
          for web. All processing happens in your browser using FFmpeg.
        </p>

        {!ffmpegLoaded && (
          <div className={css({ mx: 'auto', maxW: 'md' })}>
            {loadingFFmpeg ? (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  color: 'gray.400',
                })}
              >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Loading FFmpeg engine...
              </div>
            ) : (
              <Button onClick={loadFFmpeg} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Zap className="h-4 w-4" />
                Initialize Video Converter
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Stats Summary */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            width: '100%',
            maxWidth: '1400px',
          }}
          className="sm:grid-cols-4"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-indigo-400">{videos.length}</div>
                <div className="text-xs text-gray-400">Total Videos</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-blue-400">
                  {formatBytes(totalOriginalSize)}
                </div>
                <div className="text-xs text-gray-400">Original Size</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-green-400">
                  {formatBytes(totalConvertedSize)}
                </div>
                <div className="text-xs text-gray-400">Converted Size</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardContent>
              <div className={css({ p: '4', textAlign: 'center' })}>
                <div className="mb-2 text-2xl font-bold text-purple-400">{totalSavings}%</div>
                <div className="text-xs text-gray-400">Space Saved</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1', lg: 'repeat(3, 1fr)' },
          w: 'full',
          maxW: '1400px',
        })}
      >
        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ width: '100%' }}
          className="lg:col-span-1"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  Conversion Settings
                </CardTitle>
                <CardDescription>Configure output format and quality</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '6' })}>
                {/* Output Format */}
                <div className={css({ spaceY: '2' })}>
                  <label className="text-sm font-medium text-gray-300">Output Format</label>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '2',
                    })}
                  >
                    {(['mp4', 'webm', 'mkv'] as OutputFormat[]).map((format) => (
                      <Button
                        key={format}
                        variant={outputFormat === format ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOutputFormat(format)}
                        className={`${
                          outputFormat === format
                            ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                            : 'border-gray-700'
                        }`}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Video Codec */}
                <div className={css({ spaceY: '2' })}>
                  <label className="text-sm font-medium text-gray-300">Video Codec</label>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2',
                    })}
                  >
                    {(['h264', 'h265'] as VideoCodec[]).map((codec) => (
                      <Button
                        key={codec}
                        variant={videoCodec === codec ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVideoCodec(codec)}
                        className={`${
                          videoCodec === codec
                            ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                            : 'border-gray-700'
                        }`}
                      >
                        {codec.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Audio Codec */}
                <div className={css({ spaceY: '2' })}>
                  <label className="text-sm font-medium text-gray-300">Audio Codec</label>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '2',
                    })}
                  >
                    {(['aac', 'mp3', 'opus'] as AudioCodec[]).map((codec) => (
                      <Button
                        key={codec}
                        variant={audioCodec === codec ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAudioCodec(codec)}
                        className={`${
                          audioCodec === codec
                            ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
                            : 'border-gray-700'
                        }`}
                      >
                        {codec.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div className={css({ spaceY: '3' })}>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    })}
                  >
                    <label className="text-sm font-medium text-gray-300">Quality (CRF)</label>
                    <span className="text-sm font-bold text-indigo-400">{quality}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="51"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'xs',
                      color: 'gray.500',
                    })}
                  >
                    <span>Best Quality</span>
                    <span>Smaller Size</span>
                  </div>
                </div>

                {/* Resolution */}
                <div className={css({ spaceY: '2' })}>
                  <label className="text-sm font-medium text-gray-300">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="original">Original</option>
                    <option value="1920:-1">1080p (1920x1080)</option>
                    <option value="1280:-1">720p (1280x720)</option>
                    <option value="854:-1">480p (854x480)</option>
                    <option value="640:-1">360p (640x360)</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className={css({ spaceY: '2', pt: '4' })}>
                  <Button
                    onClick={handleConvertAll}
                    disabled={videos.length === 0 || isProcessing || !ffmpegLoaded}
                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Zap className="h-4 w-4" />
                    Convert All Videos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadAll}
                    disabled={!videos.some((v) => v.status === 'completed')}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    disabled={videos.length === 0}
                    className="w-full gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload & Videos Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ width: '100%' }}
          className="lg:col-span-2"
        >
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="h-5 w-5 text-indigo-400" />
                  Videos ({videos.length})
                </CardTitle>
                <CardDescription>
                  Drag & drop videos or click to browse. Supports MP4, WebM, AVI, MOV, MKV.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ p: { base: '4', sm: '5', md: '6' }, spaceY: '4' })}>
                {/* Drag & Drop Zone */}
                {videos.length === 0 ? (
                  <DragDropZone
                    onFilesSelected={handleFilesSelected}
                    accept="video/*"
                    maxSize={500 * 1024 * 1024}
                    multiple
                    disabled={!ffmpegLoaded}
                  />
                ) : (
                  <>
                    <DragDropZone
                      onFilesSelected={handleFilesSelected}
                      accept="video/*"
                      maxSize={500 * 1024 * 1024}
                      multiple
                      disabled={!ffmpegLoaded}
                      className="!py-8"
                    />

                    <div
                      className={css({
                        maxH: '[600px]',
                        spaceY: '3',
                        overflowY: 'auto',
                        pr: '2',
                      })}
                    >
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className={css({
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor: 'gray.800',
                            bg: 'gray.900/80',
                            p: '4',
                          })}
                        >
                          <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                            {/* Video Preview */}
                            <div
                              className={css({
                                position: 'relative',
                                h: '20',
                                w: '32',
                                flexShrink: '0',
                                overflow: 'hidden',
                                rounded: 'lg',
                                bg: 'gray.800',
                              })}
                            >
                              <video
                                src={video.preview}
                                className="h-full w-full object-cover"
                                muted
                              />
                              {video.status === 'completed' && (
                                <div
                                  className={css({
                                    position: 'absolute',
                                    inset: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bg: 'indigo.500/20',
                                  })}
                                >
                                  <Play className="h-6 w-6 text-indigo-400" />
                                </div>
                              )}
                            </div>

                            {/* Video Info */}
                            <div className={css({ minW: '0', flex: '1' })}>
                              <div
                                className={css({
                                  mb: '2',
                                  display: 'flex',
                                  alignItems: 'start',
                                  justifyContent: 'space-between',
                                  gap: '2',
                                })}
                              >
                                <div className={css({ minW: '0', flex: '1' })}>
                                  <p className="truncate text-sm font-medium text-gray-200">
                                    {video.file.name}
                                  </p>
                                  <div
                                    className={css({
                                      mt: '1',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '3',
                                      fontSize: 'xs',
                                      color: 'gray.500',
                                    })}
                                  >
                                    <span>{formatBytes(video.originalSize)}</span>
                                    {video.duration && (
                                      <span>{formatDuration(video.duration)}</span>
                                    )}
                                    {video.convertedSize && (
                                      <>
                                        <span>→</span>
                                        <span className="text-indigo-400">
                                          {formatBytes(video.convertedSize)}
                                        </span>
                                        <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
                                          {calculateSavings(
                                            video.originalSize,
                                            video.convertedSize
                                          )}
                                          % saved
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className={css({ display: 'flex', gap: '1' })}>
                                  {video.status === 'completed' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDownload(video)}
                                      className="h-8 w-8 p-0 text-indigo-400 hover:bg-indigo-500/20"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemove(video.id)}
                                    className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              {video.status === 'processing' && (
                                <div className={css({ spaceY: '1' })}>
                                  <Progress value={video.progress} className="h-2" />
                                  <p className="text-xs text-gray-500">
                                    Converting... {video.progress}%
                                  </p>
                                </div>
                              )}

                              {/* Error Message */}
                              {video.status === 'error' && (
                                <p className="text-xs text-red-400">{video.error}</p>
                              )}

                              {/* Status */}
                              {video.status === 'pending' && (
                                <p className="text-xs text-gray-500">Ready to convert</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: '1fr',
          width: '100%',
          maxWidth: '1400px',
        }}
        className="sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            icon: Sparkles,
            title: 'Multiple Formats',
            description: 'Convert between MP4, WebM, AVI, MOV, and MKV formats',
          },
          {
            icon: Zap,
            title: 'Fast Conversion',
            description: 'Hardware-accelerated encoding with modern codecs',
          },
          {
            icon: Scissors,
            title: 'Compression',
            description: 'Reduce file size while maintaining video quality',
          },
          {
            icon: Film,
            title: 'Web Optimized',
            description: 'Perfect settings for web playback and streaming',
          },
        ].map((feature, index) => (
          <Card
            key={index}
            className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-sm"
          >
            <CardContent>
              <div className={css({ p: '6' })}>
                <feature.icon className="mb-3 h-8 w-8 text-indigo-400" />
                <h3 className="mb-2 font-semibold text-gray-200">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </main>
  )
}
