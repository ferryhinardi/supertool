'use client'

import {
  AlertCircle,
  CheckCircle,
  Download,
  ImageIcon,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AffiliateSuggestion } from '@/components/features/ads/AffiliateSuggestion'
import { DragDropZone } from '@/components/features/media/DragDropZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Progress } from '@/components/ui/progress'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

type ProcessingStatus = 'idle' | 'loading-model' | 'processing' | 'completed' | 'error'

interface ImageState {
  original: string | null
  processed: string | null
  originalFile: File | null
  status: ProcessingStatus
  progress: number
  error: string | null
}

export default function BackgroundRemoverPage() {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    processed: null,
    originalFile: null,
    status: 'idle',
    progress: 0,
    error: null,
  })
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent')
  const [_modelLoaded, setModelLoaded] = useState(false)
  const removeBackgroundRef = useRef<
    typeof import('@imgly/background-removal').removeBackground | null
  >(null)

  // Track page visit
  useEffect(() => {
    trackEvent({
      action: 'page_view',
      category: 'background_remover',
      label: 'tool_opened',
    })
  }, [])

  // Preload the model on mount
  useEffect(() => {
    const preloadModel = async () => {
      try {
        const { removeBackground } = await import('@imgly/background-removal')
        removeBackgroundRef.current = removeBackground
        setModelLoaded(true)
      } catch (error) {
        console.error('Failed to preload model:', error)
      }
    }
    preloadModel()
  }, [])

  const handleFileSelected = useCallback((files: FileList) => {
    const file = files[0]
    if (!file || !file.type.startsWith('image/')) {
      setImageState((prev) => ({
        ...prev,
        error: 'Please select a valid image file',
        status: 'error',
      }))
      return
    }

    trackEvent({
      action: 'image_uploaded',
      category: 'background_remover',
      label: 'upload',
    })

    const url = URL.createObjectURL(file)
    setImageState({
      original: url,
      processed: null,
      originalFile: file,
      status: 'idle',
      progress: 0,
      error: null,
    })
  }, [])

  const processImage = useCallback(async () => {
    if (!imageState.originalFile) return

    const startTime = Date.now()

    try {
      setImageState((prev) => ({
        ...prev,
        status: 'loading-model',
        progress: 0,
        error: null,
      }))

      // Dynamic import for the background removal library
      const { removeBackground } = await import('@imgly/background-removal')

      setImageState((prev) => ({
        ...prev,
        status: 'processing',
        progress: 20,
      }))

      // Process the image
      const blob = await removeBackground(imageState.originalFile, {
        progress: (_key: string, current: number, total: number) => {
          const progressPercent = Math.round((current / total) * 80) + 20
          setImageState((prev) => ({
            ...prev,
            progress: Math.min(progressPercent, 99),
          }))
        },
      })

      // Create URL for processed image
      const processedUrl = URL.createObjectURL(blob)

      const processingTime = Date.now() - startTime

      setImageState((prev) => ({
        ...prev,
        processed: processedUrl,
        status: 'completed',
        progress: 100,
      }))

      trackEvent({
        action: 'background_removed',
        category: 'background_remover',
        label: 'success',
        value: Math.round(processingTime / 1000),
      })
    } catch (error) {
      console.error('Error removing background:', error)
      setImageState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to remove background',
      }))

      trackEvent({
        action: 'background_removal_error',
        category: 'background_remover',
        label: error instanceof Error ? error.message : 'unknown_error',
      })
    }
  }, [imageState.originalFile])

  const handleDownload = useCallback(() => {
    if (!imageState.processed || !imageState.originalFile) return

    const link = document.createElement('a')
    link.href = imageState.processed
    const originalName = imageState.originalFile.name.split('.').slice(0, -1).join('.')
    link.download = `${originalName}_no_background.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    trackEvent({
      action: 'image_downloaded',
      category: 'background_remover',
      label: 'download',
    })
  }, [imageState.processed, imageState.originalFile])

  const handleReset = useCallback(() => {
    if (imageState.original) {
      URL.revokeObjectURL(imageState.original)
    }
    if (imageState.processed) {
      URL.revokeObjectURL(imageState.processed)
    }
    setImageState({
      original: null,
      processed: null,
      originalFile: null,
      status: 'idle',
      progress: 0,
      error: null,
    })
  }, [imageState.original, imageState.processed])

  const getStatusMessage = () => {
    switch (imageState.status) {
      case 'loading-model':
        return 'Loading AI model...'
      case 'processing':
        return 'Removing background...'
      case 'completed':
        return 'Background removed successfully!'
      case 'error':
        return imageState.error || 'An error occurred'
      default:
        return 'Ready to process'
    }
  }

  const backgroundColors = [
    { value: 'transparent', label: 'Transparent', color: 'bg-[url("/checkerboard.svg")]' },
    { value: '#ffffff', label: 'White', color: 'bg-white' },
    { value: '#000000', label: 'Black', color: 'bg-black' },
    { value: '#ef4444', label: 'Red', color: 'bg-red-500' },
    { value: '#22c55e', label: 'Green', color: 'bg-green-500' },
    { value: '#3b82f6', label: 'Blue', color: 'bg-blue-500' },
  ]

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      {/* Header */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4',
          textAlign: 'center',
          w: 'full',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'purple.500/10',
            px: '4',
            py: '2',
            backdropFilter: 'blur(4px)',
          })}
        >
          <Wand2 className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'purple.300',
            })}
          >
            AI-Powered Background Removal
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            lineHeight: 'tight',
          })}
        >
          <span
            className={css({
              bgGradient: 'to-r',
              gradientFrom: 'purple.400',
              gradientVia: 'pink.400',
              gradientTo: 'rose.400',
              bgClip: 'text',
              color: 'transparent',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Background Remover
          </span>
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '2xl',
            fontSize: { base: 'md', sm: 'lg' },
            color: 'gray.300',
          })}
        >
          Remove backgrounds from images instantly with AI. 100% free, works entirely in your
          browser for complete privacy. No upload to servers, no sign-up required.
        </p>
      </div>

      {/* Main Tool Card */}
      <div
        className={css({
          w: 'full',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.1s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            backdropFilter: 'blur(4px)',
          })}
        >
          <CardHeader>
            <CardTitle
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <ImageIcon className={css({ h: '5', w: '5', color: 'purple.400' })} />
              Remove Background
            </CardTitle>
            <CardDescription>
              Upload an image to remove its background automatically using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!imageState.original ? (
              <DragDropZone
                onFilesSelected={handleFileSelected}
                accept="image/*"
                maxSize={20 * 1024 * 1024}
                multiple={false}
              />
            ) : (
              <div className={css({ spaceY: '6' })}>
                {/* Image Comparison */}
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                    gap: '6',
                    w: 'full',
                  })}
                >
                  {/* Original Image */}
                  <div className={css({ spaceY: '3' })}>
                    <h3
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Original Image
                    </h3>
                    <div
                      className={css({
                        position: 'relative',
                        aspectRatio: '1',
                        overflow: 'hidden',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800',
                      })}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageState.original}
                        alt="Original"
                        className={css({
                          h: 'full',
                          w: 'full',
                          objectFit: 'contain',
                        })}
                      />
                    </div>
                  </div>

                  {/* Processed Image */}
                  <div className={css({ spaceY: '3' })}>
                    <h3
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Background Removed
                    </h3>
                    <div
                      className={css({
                        position: 'relative',
                        aspectRatio: '1',
                        overflow: 'hidden',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                      style={{
                        backgroundColor:
                          backgroundColor === 'transparent' ? undefined : backgroundColor,
                        backgroundImage:
                          backgroundColor === 'transparent'
                            ? 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)'
                            : undefined,
                        backgroundSize: backgroundColor === 'transparent' ? '20px 20px' : undefined,
                        backgroundPosition:
                          backgroundColor === 'transparent'
                            ? '0 0, 0 10px, 10px -10px, -10px 0px'
                            : undefined,
                      }}
                    >
                      {imageState.processed ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageState.processed}
                          alt="Background removed"
                          className={css({
                            h: 'full',
                            w: 'full',
                            objectFit: 'contain',
                          })}
                        />
                      ) : (
                        <div
                          className={css({
                            display: 'flex',
                            h: 'full',
                            w: 'full',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bg: 'gray.800/80',
                          })}
                        >
                          {imageState.status === 'loading-model' ||
                          imageState.status === 'processing' ? (
                            <div className={css({ textAlign: 'center', spaceY: '3', p: '4' })}>
                              <RefreshCw
                                className={css({
                                  h: '8',
                                  w: '8',
                                  color: 'purple.400',
                                  mx: 'auto',
                                  animation: 'spin 1s linear infinite',
                                })}
                              />
                              <p className={css({ fontSize: 'sm', color: 'gray.300' })}>
                                {getStatusMessage()}
                              </p>
                              <Progress
                                value={imageState.progress}
                                className={css({ h: '2', w: '48', mx: 'auto' })}
                              />
                              <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                                {imageState.progress}%
                              </p>
                            </div>
                          ) : imageState.status === 'error' ? (
                            <div className={css({ textAlign: 'center', spaceY: '2', p: '4' })}>
                              <AlertCircle
                                className={css({ h: '8', w: '8', color: 'red.400', mx: 'auto' })}
                              />
                              <p className={css({ fontSize: 'sm', color: 'red.400' })}>
                                {imageState.error}
                              </p>
                            </div>
                          ) : (
                            <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                              Click "Remove Background" to process
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Background Color Selector */}
                {imageState.processed && (
                  <div className={css({ spaceY: '3' })}>
                    <h3
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Preview Background
                    </h3>
                    <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                      {backgroundColors.map((bg) => (
                        <button
                          type="button"
                          key={bg.value}
                          onClick={() => setBackgroundColor(bg.value)}
                          className={css({
                            h: '10',
                            w: '10',
                            rounded: 'lg',
                            border: '2px solid',
                            borderColor: backgroundColor === bg.value ? 'purple.500' : 'gray.700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            _hover: {
                              borderColor: 'purple.400',
                            },
                          })}
                          style={{
                            backgroundColor: bg.value === 'transparent' ? undefined : bg.value,
                            backgroundImage:
                              bg.value === 'transparent'
                                ? 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)'
                                : undefined,
                            backgroundSize: bg.value === 'transparent' ? '10px 10px' : undefined,
                            backgroundPosition:
                              bg.value === 'transparent'
                                ? '0 0, 0 5px, 5px -5px, -5px 0px'
                                : undefined,
                          }}
                          title={bg.label}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {imageState.status === 'completed' && (
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      rounded: 'lg',
                      bg: 'green.500/10',
                      border: '1px solid',
                      borderColor: 'green.500/30',
                      px: '4',
                      py: '3',
                    })}
                  >
                    <CheckCircle className={css({ h: '5', w: '5', color: 'green.400' })} />
                    <span className={css({ fontSize: 'sm', color: 'green.300' })}>
                      {getStatusMessage()}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '3',
                    pt: '2',
                  })}
                >
                  {!imageState.processed &&
                    imageState.status !== 'processing' &&
                    imageState.status !== 'loading-model' && (
                      <Button
                        onClick={processImage}
                        className={css({
                          gap: '2',
                          bg: 'purple.600',
                          _hover: {
                            bg: 'purple.700',
                          },
                        })}
                      >
                        <Wand2 className={css({ h: '4', w: '4' })} />
                        Remove Background
                      </Button>
                    )}

                  {imageState.processed && (
                    <>
                      <Button
                        onClick={handleDownload}
                        className={css({
                          gap: '2',
                          bg: 'green.600',
                          _hover: {
                            bg: 'green.700',
                          },
                        })}
                      >
                        <Download className={css({ h: '4', w: '4' })} />
                        Download PNG
                      </Button>
                      <Button
                        variant="outline"
                        onClick={processImage}
                        className={css({ gap: '2' })}
                      >
                        <RefreshCw className={css({ h: '4', w: '4' })} />
                        Reprocess
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className={css({
                      gap: '2',
                      border: '1px solid',
                      borderColor: 'red.500/30',
                      color: 'red.400',
                      _hover: {
                        bg: 'red.500/10',
                      },
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          w: 'full',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.2s',
          opacity: 0,
        })}
      >
        {[
          {
            icon: Sparkles,
            title: 'AI-Powered',
            description: 'Advanced machine learning models for accurate background detection',
          },
          {
            icon: Zap,
            title: 'Instant Results',
            description: 'Get results in seconds, no waiting for server processing',
          },
          {
            icon: ImageIcon,
            title: 'High Quality',
            description: 'Preserves edges and details for professional-grade output',
          },
          {
            icon: Upload,
            title: '100% Private',
            description: 'Images never leave your browser - complete privacy guaranteed',
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
              backdropFilter: 'blur(4px)',
            })}
          >
            <CardContent withTopPadding>
              <div className={css({ p: '4' })}>
                <feature.icon
                  className={css({
                    mb: '3',
                    h: '8',
                    w: '8',
                    color: 'purple.400',
                  })}
                />
                <h3
                  className={css({
                    mb: '2',
                    fontWeight: 'semibold',
                    color: 'gray.200',
                  })}
                >
                  {feature.title}
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Social Share */}
      <div
        className={css({
          w: 'full',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.4s',
          opacity: 0,
        })}
      >
        <SocialShare
          toolName="Background Remover"
          toolUrl="/tools/media/background-remover"
          description="Free AI-powered background remover. Remove backgrounds from images instantly in your browser with complete privacy."
          hashtags={['BackgroundRemover', 'AITool', 'PhotoEditing', 'ImageProcessing', 'FreeTool']}
        />
      </div>

      {/* Related Tools */}
      <div
        className={css({
          w: 'full',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.6s',
          opacity: 0,
        })}
      >
        <RelatedTools currentToolPath="/tools/media/background-remover" category="media" />
      </div>

      {/* Tool Rating */}
      <div
        className={css({
          w: 'full',
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.7s',
          opacity: 0,
        })}
      >
        <ToolRating toolId="/tools/media/background-remover" toolName="Background Remover" />
      </div>

      {/* Affiliate Suggestions */}
      <AffiliateSuggestion tool="background-remover" variant="banner" />

      {/* Global Tool Search */}
      <ToolSearch />
    </main>
  )
}
