'use client'

import type { FFmpeg } from '@ffmpeg/ffmpeg'
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
  Upload as UploadIcon,
  Video,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB

export default function VideoSubtitleCombinerPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null)
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false)

  // Subtitle styling options
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5)
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'top' | 'center'>('bottom')

  const ffmpegRef = useRef<FFmpeg | null>(null)

  // Track page visit
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'video_subtitle_combiner',
      label: 'tool_opened',
    })
  }, [])

  // Load FFmpeg
  const loadFFmpeg = async () => {
    if (ffmpegLoaded || loadingFFmpeg) return

    setLoadingFFmpeg(true)
    try {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ])

      const ffmpeg = new FFmpeg()
      ffmpegRef.current = ffmpeg

      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingFiles((prev) =>
          prev.map((file) =>
            file.status === 'processing' ? { ...file, progress: Math.round(progress * 100) } : file
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
        category: 'video_subtitle_combiner',
        label: 'initialization_success',
      })
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      trackEvent({
        action: 'ffmpeg_load_error',
        category: 'video_subtitle_combiner',
        label: 'initialization_failed',
      })
    } finally {
      setLoadingFFmpeg(false)
    }
  }

  const handleVideoSelect = async (files: FileList) => {
    const file = files[0]
    if (!file || !file.type.startsWith('video/')) {
      alert('Please select a valid video file')
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      alert(`Video file exceeds the ${formatBytes(MAX_VIDEO_SIZE)} limit`)
      return
    }

    setVideoFile(file)
    trackEvent({
      action: 'video_selected',
      category: 'video_subtitle_combiner',
      label: file.type,
    })

    // Load FFmpeg when video is selected
    if (!ffmpegLoaded && !loadingFFmpeg) {
      loadFFmpeg()
    }
  }

  const handleSubtitleSelect = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    // Validate SRT file
    const text = await file.text()
    if (!text.includes('-->')) {
      alert('Please select a valid SRT subtitle file')
      return
    }

    setSubtitleFile(file)
    trackEvent({
      action: 'subtitle_selected',
      category: 'video_subtitle_combiner',
      label: 'srt_file',
    })
  }

  const processVideo = async () => {
    if (!videoFile || !subtitleFile || !ffmpegRef.current || !ffmpegLoaded) {
      alert('Please select both video and subtitle files, and wait for FFmpeg to load')
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
      trackEvent({
        action: 'processing_started',
        category: 'video_subtitle_combiner',
        label: 'burn_subtitles',
      })

      const { fetchFile } = await import('@ffmpeg/util')
      const ffmpeg = ffmpegRef.current

      const videoExt = videoFile.name.substring(videoFile.name.lastIndexOf('.'))
      const inputVideoName = `input${videoExt}`
      const inputSubtitleName = 'subtitle.srt'
      const outputName = `output${videoExt}`

      // Write input files
      await ffmpeg.writeFile(inputVideoName, await fetchFile(videoFile))
      await ffmpeg.writeFile(inputSubtitleName, await fetchFile(subtitleFile))

      // Build subtitle style filter
      const rgbColor = hexToRgb(fontColor)
      const bgRgbColor = hexToRgb(backgroundColor)
      const bgAlpha = Math.round(backgroundOpacity * 255)
        .toString(16)
        .padStart(2, '0')

      // Calculate vertical position based on selection
      let marginV = 50
      if (subtitlePosition === 'top') {
        marginV = 400
      } else if (subtitlePosition === 'center') {
        marginV = 200
      }

      const subtitleStyle = [
        `FontSize=${fontSize}`,
        `PrimaryColour=&H${rgbToAss(rgbColor)}`,
        `BackColour=&H${bgAlpha}${rgbToAss(bgRgbColor)}`,
        `BorderStyle=3`,
        `Outline=0`,
        `Shadow=0`,
        `MarginV=${marginV}`,
      ].join(',')

      // FFmpeg command to burn subtitles
      const args = [
        '-i',
        inputVideoName,
        '-vf',
        `subtitles=${inputSubtitleName}:force_style='${subtitleStyle}'`,
        '-c:a',
        'copy',
        outputName,
      ]

      await ffmpeg.exec(args)

      // Read output file
      const data = await ffmpeg.readFile(outputName)
      const uint8Array = data as Uint8Array
      const regularUint8Array = new Uint8Array(uint8Array)
      const blob = new Blob([regularUint8Array], { type: videoFile.type })

      // Clean up FFmpeg files
      await ffmpeg.deleteFile(inputVideoName)
      await ffmpeg.deleteFile(inputSubtitleName)
      await ffmpeg.deleteFile(outputName)

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

  // Helper functions
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 }
  }

  const rgbToAss = (rgb: { r: number; g: number; b: number }) => {
    // ASS format is BGR (reversed)
    return `${rgb.b.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.r.toString(16).padStart(2, '0')}`
  }

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
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <Subtitles className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            Burn Subtitles Into Video
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'bold',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'blue.400',
              gradientVia: 'indigo.400',
              gradientTo: 'purple.400',
              bgClip: 'text',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Video Subtitle Combiner
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
          Merge SRT subtitle files with your videos. Customize subtitle appearance with custom
          fonts, colors, and positioning. All processing happens in your browser using FFmpeg.
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
                <div
                  className={css({
                    h: '4',
                    w: '4',
                    animation: 'spin',
                    rounded: 'full',
                    border: '2px solid',
                    borderColor: 'blue.500',
                    borderTopColor: 'transparent',
                  })}
                />
                Loading FFmpeg engine...
              </div>
            ) : (
              <Button
                onClick={loadFFmpeg}
                className={css({
                  gap: '2',
                  bg: 'blue.600',
                  _hover: { bg: 'blue.700' },
                })}
              >
                <Zap className={css({ h: '4', w: '4' })} />
                Initialize Subtitle Tool
              </Button>
            )}
          </div>
        )}
      </motion.div>

      <div
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          w: 'full',
        })}
      >
        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={css({ lg: { gridColumn: 'span 2 / span 2' } })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <UploadIcon className={css({ h: '5', w: '5', color: 'blue.400' })} />
                Upload Files
              </CardTitle>
              <CardDescription>Upload a video file and an SRT subtitle file</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Video Upload */}
              <div className={css({ spaceY: '2' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Video File
                </div>
                <DragDropZone
                  onFilesSelected={handleVideoSelect}
                  accept="video/*"
                  maxSize={MAX_VIDEO_SIZE}
                  disabled={!ffmpegLoaded}
                />
                {videoFile && (
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'green.500/30',
                      bg: 'green.500/10',
                      p: '3',
                    })}
                  >
                    <CheckCircle className={css({ h: '5', w: '5', color: 'green.400' })} />
                    <div className={css({ minW: '0', flex: '1' })}>
                      <p
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.200' })}
                      >
                        {videoFile.name}
                      </p>
                      <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {formatBytes(videoFile.size)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setVideoFile(null)}
                      className={css({ color: 'red.400', _hover: { bg: 'red.500/20' } })}
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Subtitle Upload */}
              <div className={css({ spaceY: '2' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Subtitle File (.srt)
                </div>
                <DragDropZone
                  onFilesSelected={handleSubtitleSelect}
                  accept=".srt,text/plain"
                  maxSize={10 * 1024 * 1024}
                  disabled={!ffmpegLoaded}
                />
                {subtitleFile && (
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'green.500/30',
                      bg: 'green.500/10',
                      p: '3',
                    })}
                  >
                    <CheckCircle className={css({ h: '5', w: '5', color: 'green.400' })} />
                    <div className={css({ minW: '0', flex: '1' })}>
                      <p
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.200' })}
                      >
                        {subtitleFile.name}
                      </p>
                      <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                        {formatBytes(subtitleFile.size)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSubtitleFile(null)}
                      className={css({ color: 'red.400', _hover: { bg: 'red.500/20' } })}
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Process Button */}
              <Button
                onClick={processVideo}
                disabled={!videoFile || !subtitleFile || isProcessing || !ffmpegLoaded}
                className={css({
                  w: 'full',
                  gap: '2',
                  bg: 'blue.600',
                  _hover: { bg: 'blue.700' },
                })}
                size="lg"
              >
                <Zap className={css({ h: '5', w: '5' })} />
                {isProcessing ? 'Processing...' : 'Combine Video & Subtitles'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Settings className={css({ h: '5', w: '5', color: 'blue.400' })} />
                Subtitle Style
              </CardTitle>
              <CardDescription>Customize subtitle appearance</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Font Size */}
              <div className={css({ spaceY: '2' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <label
                    htmlFor="font-size"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Font Size
                  </label>
                  <span className={css({ fontSize: 'sm', fontWeight: 'bold', color: 'blue.400' })}>
                    {fontSize}px
                  </span>
                </div>
                <input
                  id="font-size"
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className={css({ w: 'full', accentColor: 'blue.500' })}
                />
              </div>

              {/* Font Color */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="font-color"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Font Color
                </label>
                <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                  <input
                    id="font-color"
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className={css({ h: '10', w: '10', rounded: 'md', cursor: 'pointer' })}
                  />
                  <input
                    type="text"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    className={css({
                      flex: '1',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800',
                      px: '3',
                      py: '2',
                      fontSize: 'sm',
                      color: 'gray.100',
                    })}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className={css({ spaceY: '2' })}>
                <label
                  htmlFor="bg-color"
                  className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                >
                  Background Color
                </label>
                <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                  <input
                    id="bg-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className={css({ h: '10', w: '10', rounded: 'md', cursor: 'pointer' })}
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className={css({
                      flex: '1',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800',
                      px: '3',
                      py: '2',
                      fontSize: 'sm',
                      color: 'gray.100',
                    })}
                  />
                </div>
              </div>

              {/* Background Opacity */}
              <div className={css({ spaceY: '2' })}>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <label
                    htmlFor="bg-opacity"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Background Opacity
                  </label>
                  <span className={css({ fontSize: 'sm', fontWeight: 'bold', color: 'blue.400' })}>
                    {Math.round(backgroundOpacity * 100)}%
                  </span>
                </div>
                <input
                  id="bg-opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={backgroundOpacity}
                  onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                  className={css({ w: 'full', accentColor: 'blue.500' })}
                />
              </div>

              {/* Position */}
              <div className={css({ spaceY: '2' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Position
                </div>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2',
                  })}
                >
                  {(['bottom', 'center', 'top'] as const).map((pos) => (
                    <Button
                      key={pos}
                      variant={subtitlePosition === pos ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSubtitlePosition(pos)}
                      className={
                        subtitlePosition === pos
                          ? css({
                              border: '1px solid',
                              borderColor: 'blue.500/50',
                              bg: 'blue.500/20',
                              color: 'blue.200',
                            })
                          : css({ border: '1px solid', borderColor: 'gray.700' })
                      }
                    >
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Processed Videos */}
      {processingFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <FileVideo className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  Processed Videos ({processingFiles.length})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className={css({ gap: '2', color: 'red.400', _hover: { bg: 'red.500/20' } })}
                >
                  <Trash2 className={css({ h: '4', w: '4' })} />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              {processingFiles.map((file) => (
                <div
                  key={file.id}
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
                        src={file.videoPreview}
                        className={css({ h: 'full', w: 'full', objectFit: 'cover' })}
                        muted
                      />
                      {file.status === 'completed' && (
                        <div
                          className={css({
                            position: 'absolute',
                            inset: '0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bg: 'blue.500/20',
                          })}
                        >
                          <Play className={css({ h: '6', w: '6', color: 'blue.400' })} />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
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
                          <p
                            className={css({
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              fontSize: 'sm',
                              fontWeight: 'medium',
                              color: 'gray.200',
                            })}
                          >
                            {file.videoFile.name}
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
                            <span>{formatBytes(file.originalSize)}</span>
                            {file.outputSize && (
                              <>
                                <span>→</span>
                                <span className={css({ color: 'blue.400' })}>
                                  {formatBytes(file.outputSize)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={css({ display: 'flex', gap: '1' })}>
                          {file.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(file)}
                              className={css({
                                h: '8',
                                w: '8',
                                p: '0',
                                color: 'blue.400',
                                _hover: { bg: 'blue.500/20' },
                              })}
                            >
                              <Download className={css({ h: '4', w: '4' })} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(file.id)}
                            className={css({
                              h: '8',
                              w: '8',
                              p: '0',
                              color: 'red.400',
                              _hover: { bg: 'red.500/20' },
                            })}
                          >
                            <Trash2 className={css({ h: '4', w: '4' })} />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'processing' && (
                        <div className={css({ spaceY: '1' })}>
                          <Progress value={file.progress} className={css({ h: '2' })} />
                          <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                            Processing... {file.progress}%
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {file.status === 'error' && (
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            fontSize: 'xs',
                            color: 'red.400',
                          })}
                        >
                          <AlertCircle className={css({ h: '4', w: '4' })} />
                          {file.error}
                        </div>
                      )}

                      {/* Completed Status */}
                      {file.status === 'completed' && (
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            fontSize: 'xs',
                            color: 'green.400',
                          })}
                        >
                          <CheckCircle className={css({ h: '4', w: '4' })} />
                          Subtitles burned successfully
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          w: 'full',
        })}
      >
        {[
          {
            icon: FileText,
            title: 'SRT Support',
            description: 'Upload standard SubRip (.srt) subtitle files',
          },
          {
            icon: Palette,
            title: 'Custom Styling',
            description: 'Customize font size, colors, and positioning',
          },
          {
            icon: Video,
            title: 'Permanent Burn',
            description: 'Subtitles are permanently embedded into the video',
          },
          {
            icon: Sparkles,
            title: 'Browser Processing',
            description: 'All processing happens locally using FFmpeg.wasm',
          },
        ].map((feature) => (
          <Card
            key={feature.title}
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bgGradient: 'to-br',
              gradientFrom: 'gray.900/50',
              gradientTo: 'gray.900/30',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardContent className={css({ p: '6' })}>
              <feature.icon className={css({ mb: '3', h: '8', w: '8', color: 'blue.400' })} />
              <h3 className={css({ mb: '2', fontWeight: 'semibold', color: 'gray.200' })}>
                {feature.title}
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.500' })}>{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
      <ToolSearch />
    </main>
  )
}
