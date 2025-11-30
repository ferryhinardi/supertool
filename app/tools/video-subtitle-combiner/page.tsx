'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  FileVideo,
  Palette,
  Play,
  Settings,
  Sparkles,
  Subtitles,
  Trash2,
  Video,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DragDropZone } from '@/components/features/DragDropZone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/analytics'
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

interface ServerStatus {
  status: 'checking' | 'ready' | 'error'
  message?: string
}

const MAX_VIDEO_SIZE = 1000 * 1024 * 1024 // 1GB

export default function VideoSubtitleCombinerPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null)
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [serverStatus, setServerStatus] = useState<ServerStatus>({ status: 'checking' })

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
        const response = await fetch('/api/video-subtitle')
        console.log('🔵 Response status:', response.status, response.ok)

        if (!response.ok) {
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
        setServerStatus({ status: 'error', message: 'Failed to connect to server' })
        toast.error('Failed to connect to processing server. Please check if server is running.')
      }
    }

    checkServer()

    trackEvent({
      action: 'page_view',
      category: 'video_subtitle_combiner',
      label: 'tool_opened',
    })
  }, [])

  const handleVideoSelect = async (files: FileList) => {
    const file = files[0]
    if (!file || !file.type.startsWith('video/')) {
      toast.error('Please select a valid video file')
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`Video file exceeds the ${formatBytes(MAX_VIDEO_SIZE)} limit`)
      return
    }

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

    const processingFile: ProcessingFile = {
      id: Math.random().toString(36).substring(7),
      videoFile,
      subtitleFile,
      videoPreview: URL.createObjectURL(videoFile),
      status: 'processing',
      progress: 0,
      originalSize: videoFile.size,
    }

    setProcessingFiles((prev) => [...prev, processingFile])

    try {
      toast.info('Processing video... This may take a few minutes.')
      trackEvent({
        action: 'processing_started',
        category: 'video_subtitle_combiner',
        label: 'burn_subtitles',
      })

      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('subtitle', subtitleFile)
      formData.append('fontSize', fontSize.toString())
      formData.append('fontColor', fontColor)
      formData.append('backgroundColor', backgroundColor)
      formData.append('backgroundOpacity', backgroundOpacity.toString())
      formData.append('subtitlePosition', subtitlePosition)

      const response = await fetch('/api/video-subtitle', {
        method: 'POST',
        body: formData,
      })

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
            color: 'gray.400',
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
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
        })}
      >
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={css({ gridColumn: { base: '1', lg: 'span 2 / span 2' }, spaceY: '6' })}
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
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
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
          className={css({ spaceY: '6' })}
        >
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
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
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
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
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
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
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
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
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
                <label className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Position
                </label>
                <div className={css({ display: 'grid', gridTemplateColumns: '3', gap: '2' })}>
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
          <h2 className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'white' })}>
            Processed Videos
          </h2>

          <div
            className={css({
              display: 'grid',
              gap: '4',
              gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
            })}
          >
            {processingFiles.map((file) => (
              <Card key={file.id}>
                <CardContent className={css({ p: '4', spaceY: '3' })}>
                  {/* Video Preview */}
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
                    <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
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
