'use client'

import { Check, Copy, Download, Image as ImageIcon, Smile, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'
import {
  copyToClipboard,
  createIcoFile,
  downloadBlob,
  FAVICON_SIZES,
  type GeneratedFavicon,
  generateEmojiFavicons,
  generateFavicons,
  generateHtmlTags,
  isValidImageFile,
} from './utils'

const POPULAR_EMOJIS = [
  '🚀',
  '⚡',
  '🎨',
  '💡',
  '🔥',
  '✨',
  '🎯',
  '💻',
  '📱',
  '🌟',
  '❤️',
  '👍',
  '🎉',
  '🏆',
  '🎵',
  '📚',
  '🌈',
  '🦄',
  '🐱',
  '🐶',
  '🍕',
  '☕',
  '🌸',
  '🎮',
]

export default function FaviconGeneratorPage() {
  const [mode, setMode] = useState<'upload' | 'emoji'>('upload')
  const [selectedEmoji, setSelectedEmoji] = useState('🚀')
  const [customEmoji, setCustomEmoji] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [favicons, setFavicons] = useState<GeneratedFavicon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    if (!isValidImageFile(file)) {
      setError('Please upload a valid image file (PNG, JPEG, GIF, SVG, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setUploadedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    trackEvent({ action: 'favicon_upload_image', category: 'favicon_generator', label: file.type })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleGenerate = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      let generatedFavicons: GeneratedFavicon[]

      if (mode === 'emoji') {
        const emoji = customEmoji || selectedEmoji
        trackEvent({ action: 'favicon_select_emoji', category: 'favicon_generator', label: emoji })
        generatedFavicons = await generateEmojiFavicons(emoji)
      } else if (uploadedImage) {
        generatedFavicons = await generateFavicons(uploadedImage)
      } else {
        setError('Please upload an image or select an emoji')
        return
      }

      setFavicons(generatedFavicons)
      trackEvent({
        action: 'favicon_generate',
        category: 'favicon_generator',
        label: mode,
        value: generatedFavicons.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate favicons')
    } finally {
      setLoading(false)
    }
  }, [mode, uploadedImage, selectedEmoji, customEmoji])

  const handleDownloadIco = useCallback(async () => {
    if (favicons.length === 0) return

    try {
      const icoBlob = await createIcoFile(favicons)
      downloadBlob(icoBlob, 'favicon.ico')
      trackEvent({
        action: 'favicon_download_ico',
        category: 'favicon_generator',
        value: favicons.length,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ICO file')
    }
  }, [favicons])

  const handleDownloadPng = useCallback((favicon: GeneratedFavicon) => {
    downloadBlob(favicon.blob, `favicon-${favicon.size}x${favicon.size}.png`)
    trackEvent({
      action: 'favicon_download_png',
      category: 'favicon_generator',
      value: favicon.size,
    })
  }, [])

  const handleCopyHtml = useCallback(async () => {
    const html = generateHtmlTags([...FAVICON_SIZES])
    await copyToClipboard(html)
    setCopiedHtml(true)
    trackEvent({
      action: 'favicon_copy_html',
      category: 'favicon_generator',
      value: FAVICON_SIZES.length,
    })
    setTimeout(() => setCopiedHtml(false), 2000)
  }, [])

  return (
    <main
      className={css({
        minH: '100vh',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '8', sm: '12', md: '16' },
        maxW: '1200px',
        mx: 'auto',
      })}
    >
      {/* Header */}
      <div
        className={css({
          textAlign: 'center',
          mb: '12',
        })}
      >
        <h1
          className={css({
            fontSize: { base: '3xl', md: '4xl', lg: '5xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'violet.500',
            gradientTo: 'purple.500',
            bgClip: 'text',
            mb: '4',
          })}
        >
          Favicon Generator
        </h1>
        <p
          className={css({
            fontSize: { base: 'lg', md: 'xl' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Convert logos, images, or emojis into favicons for websites. Generate all required sizes
          and formats with preview and instant download.
        </p>
      </div>

      {/* Mode Selection */}
      <Card
        className={css({
          p: '6',
          mb: '6',
          bg: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderWidth: '1px',
          borderColor: 'whiteAlpha.200',
        })}
      >
        <div
          className={css({
            display: 'flex',
            gap: '4',
            mb: '6',
          })}
        >
          <Button
            onClick={() => setMode('upload')}
            className={css({
              flex: '1',
              bg: mode === 'upload' ? 'violet.500' : 'whiteAlpha.100',
              _hover: { bg: mode === 'upload' ? 'violet.600' : 'whiteAlpha.200' },
            })}
          >
            <Upload className={css({ mr: '2', w: '4', h: '4' })} />
            Upload Image
          </Button>
          <Button
            onClick={() => setMode('emoji')}
            className={css({
              flex: '1',
              bg: mode === 'emoji' ? 'violet.500' : 'whiteAlpha.100',
              _hover: { bg: mode === 'emoji' ? 'violet.600' : 'whiteAlpha.200' },
            })}
          >
            <Smile className={css({ mr: '2', w: '4', h: '4' })} />
            Use Emoji
          </Button>
        </div>

        {mode === 'upload' ? (
          <div>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: File input handles keyboard events */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: Delegating to hidden file input for accessibility */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={css({
                border: '2px dashed',
                borderColor: dragActive ? 'violet.500' : 'whiteAlpha.300',
                borderRadius: 'lg',
                p: '8',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                bg: dragActive ? 'whiteAlpha.100' : 'transparent',
                _hover: { borderColor: 'violet.500', bg: 'whiteAlpha.50' },
              })}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className={css({ display: 'none' })}
              />
              {uploadedImage ? (
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4',
                  })}
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={css({
                      maxW: '200px',
                      maxH: '200px',
                      borderRadius: 'md',
                    })}
                  />
                  <p className={css({ color: 'gray.400' })}>{uploadedImage.name}</p>
                </div>
              ) : (
                <div>
                  <ImageIcon
                    className={css({
                      w: '12',
                      h: '12',
                      mx: 'auto',
                      mb: '4',
                      color: 'gray.500',
                    })}
                  />
                  <p className={css({ color: 'gray.300', mb: '2' })}>
                    Drag and drop an image here, or click to select
                  </p>
                  <p className={css({ color: 'gray.500', fontSize: 'sm' })}>
                    Supports PNG, JPEG, GIF, SVG, WebP (max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="custom-emoji-input"
              className={css({
                display: 'block',
                color: 'gray.300',
                mb: '2',
                fontSize: 'sm',
                fontWeight: 'medium',
              })}
            >
              Select or Enter Emoji
            </label>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '2',
                mb: '4',
              })}
            >
              {POPULAR_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    setSelectedEmoji(emoji)
                    setCustomEmoji('')
                  }}
                  className={css({
                    p: '2',
                    fontSize: '2xl',
                    borderRadius: 'md',
                    bg: selectedEmoji === emoji && !customEmoji ? 'violet.500' : 'whiteAlpha.100',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'violet.500' },
                  })}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              id="custom-emoji-input"
              type="text"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              placeholder="Or paste your own emoji here..."
              className={css({
                w: 'full',
                p: '3',
                borderRadius: 'md',
                bg: 'whiteAlpha.100',
                borderWidth: '1px',
                borderColor: 'whiteAlpha.300',
                color: 'white',
                fontSize: '2xl',
                textAlign: 'center',
                _focus: {
                  outline: 'none',
                  borderColor: 'violet.500',
                },
              })}
            />
          </div>
        )}

        {error && (
          <div
            className={css({
              mt: '4',
              p: '3',
              bg: 'red.500/20',
              borderWidth: '1px',
              borderColor: 'red.500',
              borderRadius: 'md',
              color: 'red.300',
              fontSize: 'sm',
            })}
          >
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading || (mode === 'upload' && !uploadedImage)}
          className={css({
            w: 'full',
            mt: '6',
            bg: 'violet.500',
            _hover: { bg: 'violet.600' },
            _disabled: { opacity: '0.5', cursor: 'not-allowed' },
          })}
        >
          {loading ? 'Generating...' : 'Generate Favicons'}
        </Button>
      </Card>

      {/* Preview and Download */}
      {favicons.length > 0 && (
        <Card
          className={css({
            p: '6',
            mb: '6',
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderWidth: '1px',
            borderColor: 'whiteAlpha.200',
          })}
        >
          <h2
            className={css({
              fontSize: '2xl',
              fontWeight: 'bold',
              mb: '6',
              color: 'white',
            })}
          >
            Preview & Download
          </h2>

          {/* Size Previews */}
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '4',
              mb: '6',
            })}
          >
            {favicons.map((favicon) => (
              <div
                key={favicon.size}
                className={css({
                  p: '4',
                  bg: 'whiteAlpha.100',
                  borderRadius: 'md',
                  textAlign: 'center',
                })}
              >
                <div
                  className={css({
                    bg: 'whiteAlpha.200',
                    p: '4',
                    borderRadius: 'md',
                    mb: '3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minH: '100px',
                  })}
                >
                  <img
                    src={favicon.dataUrl}
                    alt={`${favicon.size}x${favicon.size}`}
                    className={css({
                      maxW: `${favicon.size}px`,
                      maxH: `${favicon.size}px`,
                      imageRendering: favicon.size <= 32 ? 'pixelated' : 'auto',
                    })}
                  />
                </div>
                <p className={css({ color: 'gray.400', fontSize: 'sm', mb: '2' })}>
                  {favicon.size}×{favicon.size}
                </p>
                <Button
                  onClick={() => handleDownloadPng(favicon)}
                  size="sm"
                  className={css({
                    w: 'full',
                    bg: 'whiteAlpha.200',
                    _hover: { bg: 'whiteAlpha.300' },
                  })}
                >
                  <Download className={css({ mr: '1', w: '3', h: '3' })} />
                  PNG
                </Button>
              </div>
            ))}
          </div>

          {/* Download Options */}
          <div
            className={css({
              display: 'flex',
              gap: '4',
              flexWrap: 'wrap',
              mb: '6',
            })}
          >
            <Button
              onClick={handleDownloadIco}
              className={css({
                flex: '1',
                minW: '200px',
                bg: 'violet.500',
                _hover: { bg: 'violet.600' },
              })}
            >
              <Download className={css({ mr: '2', w: '4', h: '4' })} />
              Download ICO File
            </Button>
          </div>

          {/* HTML Code */}
          <div>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: '3',
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                HTML Code
              </h3>
              <Button
                onClick={handleCopyHtml}
                size="sm"
                className={css({
                  bg: copiedHtml ? 'green.500' : 'whiteAlpha.200',
                  _hover: { bg: copiedHtml ? 'green.600' : 'whiteAlpha.300' },
                })}
              >
                {copiedHtml ? (
                  <>
                    <Check className={css({ mr: '1', w: '3', h: '3' })} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className={css({ mr: '1', w: '3', h: '3' })} />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre
              className={css({
                p: '4',
                bg: 'blackAlpha.500',
                borderRadius: 'md',
                overflow: 'auto',
                fontSize: 'sm',
                color: 'gray.300',
                fontFamily: 'mono',
              })}
            >
              {generateHtmlTags([...FAVICON_SIZES])}
            </pre>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card
        className={css({
          p: '6',
          bg: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderWidth: '1px',
          borderColor: 'whiteAlpha.200',
        })}
      >
        <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '3', color: 'white' })}>
          About Favicons
        </h3>
        <div className={css({ color: 'gray.400', fontSize: 'sm', lineHeight: '1.6' })}>
          <p className={css({ mb: '2' })}>
            Favicons are small icons that appear in browser tabs, bookmarks, and address bars. This
            tool generates all the sizes you need:
          </p>
          <ul className={css({ listStyleType: 'disc', pl: '5', mb: '2' })}>
            <li>16×16, 32×32 - Standard browser tabs</li>
            <li>48×48, 64×64 - Desktop shortcuts</li>
            <li>128×128 - Chrome Web Store</li>
            <li>180×180 - Apple Touch Icon (iOS home screen)</li>
          </ul>
          <p>
            All processing is done locally in your browser. Your images are never uploaded to any
            server.
          </p>
        </div>
      </Card>

    {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

    <ToolSearch />

    
    </main>
  )
}
