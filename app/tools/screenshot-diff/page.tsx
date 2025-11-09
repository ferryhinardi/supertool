'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Diff,
  Download,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  RotateCcw,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DragDropZone } from '@/components/features/DragDropZone'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'
import {
  type ComparisonResult,
  compareImages,
  downloadImage,
  getImageDimensions,
  imageDataToDataURL,
  loadImageFromFile,
  resizeImage,
} from './utils'

type ViewMode = 'side-by-side' | 'overlay' | 'diff-only'

export default function ScreenshotDiffPage() {
  const [image1File, setImage1File] = useState<File | null>(null)
  const [image2File, setImage2File] = useState<File | null>(null)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [threshold, setThreshold] = useState(0.1)
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side')
  const [showOverlay, setShowOverlay] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track page visit
  useEffect(() => {
    trackToolEvent('screenshot_diff_open', {})
  }, [])

  // Load and process images when files change
  useEffect(() => {
    const loadImages = async () => {
      if (!image1File || !image2File) {
        setComparisonResult(null)
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        // Get dimensions first
        const [dims1, dims2] = await Promise.all([
          getImageDimensions(image1File),
          getImageDimensions(image2File),
        ])

        // Check if dimensions match
        const dimensionsMatch = dims1.width === dims2.width && dims1.height === dims2.height

        // Load images
        let img1 = await loadImageFromFile(image1File)
        let img2 = await loadImageFromFile(image2File)

        // Resize if dimensions don't match
        if (!dimensionsMatch) {
          const targetWidth = Math.max(dims1.width, dims2.width)
          const targetHeight = Math.max(dims1.height, dims2.height)

          toast.info(
            `Images have different dimensions. Resizing to ${targetWidth}x${targetHeight}`,
            {
              duration: 3000,
            }
          )

          img1 = resizeImage(img1, targetWidth, targetHeight)
          img2 = resizeImage(img2, targetWidth, targetHeight)
        }

        // Compare images
        const result = compareImages(img1, img2, {
          threshold,
          includeAA: true,
        })

        setComparisonResult(result)

        trackToolEvent('screenshot_diff_compare', {
          threshold,
          diff_percentage: result.percentageDiff.toFixed(2),
          dimensions_match: dimensionsMatch,
        })

        toast.success(
          `Comparison complete! ${result.percentageDiff.toFixed(2)}% difference detected`,
          {
            duration: 3000,
          }
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to compare images'
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Image comparison error:', err)
      } finally {
        setIsProcessing(false)
      }
    }

    loadImages()
  }, [image1File, image2File, threshold])

  const handleImage1Selected = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      setImage1File(file)
      trackToolEvent('screenshot_diff_upload_image1', {})
    }
  }

  const handleImage2Selected = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      setImage2File(file)
      trackToolEvent('screenshot_diff_upload_image2', {})
    }
  }

  const handleReset = () => {
    setImage1File(null)
    setImage2File(null)
    setComparisonResult(null)
    setError(null)
    toast.success('Reset complete')
    trackToolEvent('screenshot_diff_reset', {})
  }

  const handleDownloadDiff = () => {
    if (!comparisonResult) return

    downloadImage(comparisonResult.diffImageData, 'screenshot-diff.png')
    toast.success('Diff image downloaded!')
    trackToolEvent('screenshot_diff_download', {})
  }

  const handleThresholdChange = (value: string) => {
    const numValue = Number.parseFloat(value)
    if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      setThreshold(numValue)
    }
  }

  // Generate preview URLs
  const image1URL = useMemo(() => {
    return image1File ? URL.createObjectURL(image1File) : null
  }, [image1File])

  const image2URL = useMemo(() => {
    return image2File ? URL.createObjectURL(image2File) : null
  }, [image2File])

  const diffImageURL = useMemo(() => {
    return comparisonResult ? imageDataToDataURL(comparisonResult.diffImageData) : null
  }, [comparisonResult])

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (image1URL) URL.revokeObjectURL(image1URL)
      if (image2URL) URL.revokeObjectURL(image2URL)
    }
  }, [image1URL, image2URL])

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
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
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'orange.500/30',
            bg: 'orange.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Diff className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            Pixel-Perfect Comparison
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'red.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Screenshot Diff Tool
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Compare UI screenshots pixel-by-pixel to detect visual changes. Perfect for QA testing,
          design reviews, and tracking UI regressions.
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'orange.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Upload Screenshots</CardTitle>
            <CardDescription>
              Upload two screenshots to compare. Images will be automatically resized if dimensions
              don't match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                gap: '6',
              })}
            >
              {/* Image 1 */}
              <div className={css({ spaceY: '3' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <ImageIcon className={css({ h: '4', w: '4', color: 'blue.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Screenshot 1 (Before)
                  </span>
                  {image1File && <Badge variant="secondary">{image1File.name}</Badge>}
                </div>
                <DragDropZone
                  onFilesSelected={handleImage1Selected}
                  accept="image/*"
                  disabled={isProcessing}
                  className={css({ minH: '48' })}
                />
              </div>

              {/* Image 2 */}
              <div className={css({ spaceY: '3' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '2' })}>
                  <ImageIcon className={css({ h: '4', w: '4', color: 'green.400' })} />
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    Screenshot 2 (After)
                  </span>
                  {image2File && <Badge variant="secondary">{image2File.name}</Badge>}
                </div>
                <DragDropZone
                  onFilesSelected={handleImage2Selected}
                  accept="image/*"
                  disabled={isProcessing}
                  className={css({ minH: '48' })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      {(image1File || image2File) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Settings className={css({ h: '5', w: '5', color: 'purple.400' })} />
                <CardTitle>Comparison Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                  gap: '6',
                })}
              >
                {/* Sensitivity Control */}
                <div className={css({ spaceY: '3' })}>
                  <label
                    htmlFor="threshold"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Sensitivity Threshold
                    <Badge
                      className={css({
                        bg: 'purple.500/20',
                        color: 'purple.300',
                        border: '1px solid',
                        borderColor: 'purple.500/30',
                      })}
                    >
                      {threshold}
                    </Badge>
                  </label>
                  <Input
                    id="threshold"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={threshold}
                    onChange={(e) => handleThresholdChange(e.target.value)}
                    disabled={isProcessing}
                    className={css({
                      h: '8',
                      cursor: 'pointer',
                    })}
                  />
                  <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                    Lower values detect more subtle differences. Range: 0 (most sensitive) to 1
                    (least sensitive)
                  </p>
                </div>

                {/* View Mode */}
                <div className={css({ spaceY: '3' })}>
                  <span
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    View Mode
                  </span>
                  <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                    <Button
                      onClick={() => setViewMode('side-by-side')}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: viewMode === 'side-by-side' ? 'purple.500/20' : 'gray.800',
                        border: '1px solid',
                        borderColor: viewMode === 'side-by-side' ? 'purple.500/50' : 'gray.700/50',
                        color: viewMode === 'side-by-side' ? 'purple.300' : 'gray.400',
                        _hover: {
                          bg: viewMode === 'side-by-side' ? 'purple.500/30' : 'gray.700',
                        },
                      })}
                    >
                      <Layers className={css({ h: '4', w: '4' })} />
                      Side-by-Side
                    </Button>
                    <Button
                      onClick={() => setViewMode('overlay')}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: viewMode === 'overlay' ? 'purple.500/20' : 'gray.800',
                        border: '1px solid',
                        borderColor: viewMode === 'overlay' ? 'purple.500/50' : 'gray.700/50',
                        color: viewMode === 'overlay' ? 'purple.300' : 'gray.400',
                        _hover: {
                          bg: viewMode === 'overlay' ? 'purple.500/30' : 'gray.700',
                        },
                      })}
                    >
                      <Eye className={css({ h: '4', w: '4' })} />
                      Overlay
                    </Button>
                    <Button
                      onClick={() => setViewMode('diff-only')}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: viewMode === 'diff-only' ? 'purple.500/20' : 'gray.800',
                        border: '1px solid',
                        borderColor: viewMode === 'diff-only' ? 'purple.500/50' : 'gray.700/50',
                        color: viewMode === 'diff-only' ? 'purple.300' : 'gray.400',
                        _hover: {
                          bg: viewMode === 'diff-only' ? 'purple.500/30' : 'gray.700',
                        },
                      })}
                    >
                      <Diff className={css({ h: '4', w: '4' })} />
                      Diff Only
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
                <Button
                  onClick={handleReset}
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'gray.400',
                    _hover: { bg: 'gray.700' },
                  })}
                >
                  <RotateCcw className={css({ h: '4', w: '4' })} />
                  Reset
                </Button>
                {comparisonResult && (
                  <Button
                    onClick={handleDownloadDiff}
                    className={css({
                      gap: '2',
                      bg: 'orange.500/20',
                      border: '1px solid',
                      borderColor: 'orange.500/50',
                      color: 'orange.300',
                      _hover: { bg: 'orange.500/30' },
                    })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
                    Download Diff
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'red.500/30',
              bg: 'red.500/10',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent className={css({ py: '6' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                <AlertCircle
                  className={css({ h: '6', w: '6', color: 'red.400', flexShrink: '0' })}
                />
                <div>
                  <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'red.300' })}>
                    Comparison Error
                  </h3>
                  <p className={css({ mt: '1', fontSize: 'sm', color: 'red.400' })}>{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Comparison Results */}
      {comparisonResult && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                <CardTitle>Comparison Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent className={css({ spaceY: '6' })}>
              {/* Stats */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: '4',
                })}
              >
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Pixels</p>
                  <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.200' })}>
                    {comparisonResult.totalPixels.toLocaleString()}
                  </p>
                </div>
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'orange.700',
                    bg: 'orange.500/10',
                    p: '4',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'orange.400' })}>Different Pixels</p>
                  <p className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'orange.300' })}>
                    {comparisonResult.diffPixels.toLocaleString()}
                  </p>
                </div>
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: comparisonResult.percentageDiff < 1 ? 'green.700' : 'red.700',
                    bg: comparisonResult.percentageDiff < 1 ? 'green.500/10' : 'red.500/10',
                    p: '4',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'sm',
                      color: comparisonResult.percentageDiff < 1 ? 'green.400' : 'red.400',
                    })}
                  >
                    Difference
                  </p>
                  <p
                    className={css({
                      fontSize: '2xl',
                      fontWeight: 'bold',
                      color: comparisonResult.percentageDiff < 1 ? 'green.300' : 'red.300',
                    })}
                  >
                    {comparisonResult.percentageDiff.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              <div className={css({ spaceY: '4' })}>
                {viewMode === 'side-by-side' && (
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
                      gap: '4',
                    })}
                  >
                    <div className={css({ spaceY: '2' })}>
                      <p
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'blue.300' })}
                      >
                        Screenshot 1
                      </p>
                      {image1URL && (
                        <img
                          src={image1URL}
                          alt="Screenshot 1"
                          className={css({
                            w: 'full',
                            h: 'auto',
                            rounded: 'lg',
                            border: '2px solid',
                            borderColor: 'blue.500/50',
                          })}
                        />
                      )}
                    </div>
                    <div className={css({ spaceY: '2' })}>
                      <p
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'green.300',
                        })}
                      >
                        Screenshot 2
                      </p>
                      {image2URL && (
                        <img
                          src={image2URL}
                          alt="Screenshot 2"
                          className={css({
                            w: 'full',
                            h: 'auto',
                            rounded: 'lg',
                            border: '2px solid',
                            borderColor: 'green.500/50',
                          })}
                        />
                      )}
                    </div>
                    <div className={css({ spaceY: '2' })}>
                      <p
                        className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'red.300' })}
                      >
                        Diff (Magenta)
                      </p>
                      {diffImageURL && (
                        <img
                          src={diffImageURL}
                          alt="Diff"
                          className={css({
                            w: 'full',
                            h: 'auto',
                            rounded: 'lg',
                            border: '2px solid',
                            borderColor: 'red.500/50',
                          })}
                        />
                      )}
                    </div>
                  </div>
                )}

                {viewMode === 'overlay' && (
                  <div className={css({ spaceY: '4' })}>
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <Button
                        onClick={() => setShowOverlay(!showOverlay)}
                        size="sm"
                        className={css({
                          gap: '2',
                          bg: 'purple.500/20',
                          border: '1px solid',
                          borderColor: 'purple.500/50',
                          color: 'purple.300',
                          _hover: { bg: 'purple.500/30' },
                        })}
                      >
                        {showOverlay ? (
                          <>
                            <EyeOff className={css({ h: '4', w: '4' })} />
                            Hide Overlay
                          </>
                        ) : (
                          <>
                            <Eye className={css({ h: '4', w: '4' })} />
                            Show Overlay
                          </>
                        )}
                      </Button>
                    </div>
                    <div className={css({ position: 'relative', maxW: '2xl', mx: 'auto' })}>
                      {image1URL && (
                        <img
                          src={image1URL}
                          alt="Screenshot 1"
                          className={css({
                            w: 'full',
                            h: 'auto',
                            rounded: 'lg',
                            border: '2px solid',
                            borderColor: 'blue.500/50',
                          })}
                        />
                      )}
                      {showOverlay && diffImageURL && (
                        <img
                          src={diffImageURL}
                          alt="Diff Overlay"
                          className={css({
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            w: 'full',
                            h: 'full',
                            rounded: 'lg',
                            opacity: '0.7',
                            mixBlendMode: 'multiply',
                          })}
                        />
                      )}
                    </div>
                  </div>
                )}

                {viewMode === 'diff-only' && (
                  <div className={css({ spaceY: '2', maxW: '2xl', mx: 'auto' })}>
                    <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'red.300' })}>
                      Differences Highlighted (Magenta)
                    </p>
                    {diffImageURL && (
                      <img
                        src={diffImageURL}
                        alt="Diff"
                        className={css({
                          w: 'full',
                          h: 'auto',
                          rounded: 'lg',
                          border: '2px solid',
                          borderColor: 'red.500/50',
                        })}
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent className={css({ py: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Lower threshold values (0-0.1) detect subtle color differences</li>
                  <li>• Images with different dimensions will be automatically resized to match</li>
                  <li>• Magenta highlights show pixel differences in the diff view</li>
                  <li>• Use overlay mode to see differences in context with the original image</li>
                  <li>• All processing happens in your browser - no server uploads required</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

    <ToolSearch />

    
    </main>
  )
}
