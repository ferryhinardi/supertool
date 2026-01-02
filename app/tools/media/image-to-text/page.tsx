'use client'

import { Check, Copy, Download, FileText, Image as ImageIcon, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

export default function ImageToTextPage() {
  const [extractedText, setExtractedText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('eng')
  const [uploadedImage, setUploadedImage] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setError('')
      setExtractedText('')

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      try {
        setIsProcessing(true)
        setProgress(0)

        trackToolEvent('image_to_text_upload', {
          fileType: file.type,
          fileSize: file.size,
          language: selectedLanguage,
        })

        // Create image preview
        const imageUrl = URL.createObjectURL(file)
        setUploadedImage(imageUrl)

        // Create Tesseract worker
        const worker = await createWorker(selectedLanguage, 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
            }
          },
        })

        // Perform OCR
        const {
          data: { text },
        } = await worker.recognize(file)

        setExtractedText(text)

        trackToolEvent('image_to_text_success', {
          textLength: text.length,
          language: selectedLanguage,
        })

        // Terminate worker
        await worker.terminate()

        // Clean up object URL after processing
        URL.revokeObjectURL(imageUrl)
      } catch (err) {
        setError('Failed to extract text from image. Please try again.')
        trackToolEvent('image_to_text_error', {
          language: selectedLanguage,
        })
      } finally {
        setIsProcessing(false)
        setProgress(0)
      }
    },
    [selectedLanguage]
  )

  const copyToClipboard = useCallback(() => {
    if (!extractedText) return

    navigator.clipboard.writeText(extractedText)
    setCopied(true)
    trackToolEvent('image_to_text_copy')

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }, [extractedText])

  const downloadText = useCallback(() => {
    if (!extractedText) return

    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extracted-text-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    trackToolEvent('image_to_text_download')
  }, [extractedText])

  const clearAll = useCallback(() => {
    setExtractedText('')
    setUploadedImage('')
    setError('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    trackToolEvent('image_to_text_clear')
  }, [])

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
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
        })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            w: '16',
            h: '16',
            rounded: 'xl',
            bgGradient: 'to-br',
            gradientFrom: 'green.500',
            gradientTo: 'emerald.500',
            mb: '4',
          })}
        >
          <FileText className={css({ w: '8', h: '8', color: 'white' })} />
        </div>

        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'green.400',
            gradientTo: 'emerald.600',
            bgClip: 'text',
            color: 'transparent',
          })}
        >
          Image to Text Converter
        </h1>

        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Extract text from images using OCR (Optical Character Recognition). Supports multiple
          languages and various image formats.
        </p>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: '6',
          w: 'full',
        })}
      >
        {/* Upload Section */}
        <Card
          className={css({
            p: '6',
            spaceY: '6',
          })}
        >
          <div className={css({ spaceY: '4' })}>
            <h2
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Upload Image
            </h2>

            {/* Language Selection */}
            <div className={css({ spaceY: '2' })}>
              <label
                htmlFor="language-select"
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                })}
              >
                Language
              </label>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isProcessing}
                className={css({
                  w: 'full',
                  px: '4',
                  py: '2',
                  bg: 'gray.800',
                  color: 'gray.200',
                  border: '1px solid',
                  borderColor: 'gray.700',
                  rounded: 'lg',
                  fontSize: 'sm',
                  cursor: 'pointer',
                  _disabled: {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                  _focus: {
                    outline: 'none',
                    borderColor: 'green.500',
                    ring: '2',
                    ringColor: 'green.500/20',
                  },
                })}
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="chi_sim">Chinese (Simplified)</option>
                <option value="chi_tra">Chinese (Traditional)</option>
                <option value="jpn">Japanese</option>
                <option value="kor">Korean</option>
                <option value="rus">Russian</option>
                <option value="ara">Arabic</option>
                <option value="por">Portuguese</option>
                <option value="ita">Italian</option>
              </select>
            </div>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className={css({ display: 'none' })}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={css({
                w: 'full',
                h: '12',
                fontSize: 'base',
                bgGradient: 'to-r',
                gradientFrom: 'green.500',
                gradientTo: 'emerald.500',
                _hover: {
                  gradientFrom: 'green.600',
                  gradientTo: 'emerald.600',
                },
              })}
            >
              <Upload className={css({ w: '5', h: '5', mr: '2' })} />
              {isProcessing ? `Processing... ${progress}%` : 'Upload Image'}
            </Button>

            {/* Image Preview */}
            {uploadedImage && (
              <div
                className={css({
                  mt: '4',
                  p: '4',
                  bg: 'gray.800/50',
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'gray.700',
                })}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className={css({
                    w: 'full',
                    h: 'auto',
                    maxH: '96',
                    objectFit: 'contain',
                    rounded: 'md',
                  })}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                className={css({
                  p: '4',
                  bg: 'red.500/10',
                  border: '1px solid',
                  borderColor: 'red.500/20',
                  rounded: 'lg',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '3',
                })}
              >
                <X className={css({ w: '5', h: '5', color: 'red.400', flexShrink: 0 })} />
                <p className={css({ fontSize: 'sm', color: 'red.400' })}>{error}</p>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div
                className={css({
                  w: 'full',
                  h: '2',
                  bg: 'gray.700',
                  rounded: 'full',
                  overflow: 'hidden',
                })}
              >
                <div
                  className={css({
                    h: 'full',
                    bg: 'green.500',
                    transition: 'width 0.3s',
                  })}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Results Section */}
        <Card
          className={css({
            p: '6',
            spaceY: '6',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <h2
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Extracted Text
            </h2>

            {extractedText && (
              <div className={css({ display: 'flex', gap: '2' })}>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className={css({
                    borderColor: 'green.500/20',
                    _hover: {
                      bg: 'green.500/10',
                      borderColor: 'green.500/30',
                    },
                  })}
                >
                  {copied ? (
                    <Check className={css({ w: '4', h: '4', color: 'green.400' })} />
                  ) : (
                    <Copy className={css({ w: '4', h: '4' })} />
                  )}
                </Button>

                <Button
                  onClick={downloadText}
                  variant="outline"
                  size="sm"
                  className={css({
                    borderColor: 'green.500/20',
                    _hover: {
                      bg: 'green.500/10',
                      borderColor: 'green.500/30',
                    },
                  })}
                >
                  <Download className={css({ w: '4', h: '4' })} />
                </Button>

                <Button
                  onClick={clearAll}
                  variant="outline"
                  size="sm"
                  className={css({
                    borderColor: 'red.500/20',
                    _hover: {
                      bg: 'red.500/10',
                      borderColor: 'red.500/30',
                    },
                  })}
                >
                  <X className={css({ w: '4', h: '4' })} />
                </Button>
              </div>
            )}
          </div>

          {/* Text Display */}
          {extractedText ? (
            <div
              className={css({
                p: '4',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
                rounded: 'lg',
                minH: '96',
                maxH: '96',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: 'sm',
                color: 'gray.300',
                fontFamily: 'mono',
              })}
            >
              {extractedText}
            </div>
          ) : (
            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minH: '96',
                textAlign: 'center',
                color: 'gray.500',
              })}
            >
              <ImageIcon className={css({ w: '16', h: '16', mb: '4', opacity: 0.5 })} />
              <p className={css({ fontSize: 'sm' })}>Upload an image to extract text using OCR</p>
              <p className={css({ fontSize: 'xs', mt: '2', color: 'gray.600' })}>
                Supported formats: PNG, JPEG, WEBP
              </p>
            </div>
          )}

          {/* Character Count */}
          {extractedText && (
            <div
              className={css({
                pt: '4',
                borderTop: '1px solid',
                borderColor: 'gray.700',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'sm',
                color: 'gray.400',
              })}
            >
              <span>Characters: {extractedText.length.toLocaleString()}</span>
              <span>Words: {extractedText.trim().split(/\s+/).length.toLocaleString()}</span>
            </div>
          )}
        </Card>
      </div>

      {/* How to Use Section */}
      <Card
        className={css({
          p: '6',
          spaceY: '6',
        })}
      >
        <h2
          className={css({
            fontSize: 'xl',
            fontWeight: 'semibold',
            color: 'gray.200',
          })}
        >
          How to Use
        </h2>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: '6',
          })}
        >
          <div className={css({ spaceY: '3' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '12',
                h: '12',
                rounded: 'lg',
                bg: 'green.500/10',
                border: '1px solid',
                borderColor: 'green.500/20',
              })}
            >
              <span
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'green.400',
                })}
              >
                1
              </span>
            </div>
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Select Language
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Choose the language of the text in your image. We support 12+ languages including
              English, Spanish, Chinese, and more.
            </p>
          </div>

          <div className={css({ spaceY: '3' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '12',
                h: '12',
                rounded: 'lg',
                bg: 'green.500/10',
                border: '1px solid',
                borderColor: 'green.500/20',
              })}
            >
              <span
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'green.400',
                })}
              >
                2
              </span>
            </div>
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Upload Image
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Click the upload button and select an image containing text. Supported formats: PNG,
              JPEG, WEBP. Max size: 10MB.
            </p>
          </div>

          <div className={css({ spaceY: '3' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '12',
                h: '12',
                rounded: 'lg',
                bg: 'green.500/10',
                border: '1px solid',
                borderColor: 'green.500/20',
              })}
            >
              <span
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'green.400',
                })}
              >
                3
              </span>
            </div>
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Wait for Processing
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Our OCR engine will analyze your image and extract the text. Processing time depends
              on image size and complexity.
            </p>
          </div>

          <div className={css({ spaceY: '3' })}>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                w: '12',
                h: '12',
                rounded: 'lg',
                bg: 'green.500/10',
                border: '1px solid',
                borderColor: 'green.500/20',
              })}
            >
              <span
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'bold',
                  color: 'green.400',
                })}
              >
                4
              </span>
            </div>
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Copy or Download
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Once the text is extracted, you can copy it to your clipboard or download it as a .txt
              file for later use.
            </p>
          </div>
        </div>
      </Card>

      {/* Features Section */}
      <Card
        className={css({
          p: '6',
          spaceY: '6',
        })}
      >
        <h2
          className={css({
            fontSize: 'xl',
            fontWeight: 'semibold',
            color: 'gray.200',
          })}
        >
          Key Features
        </h2>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: '6',
          })}
        >
          <div
            className={css({
              p: '4',
              bg: 'gray.800/30',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              spaceY: '3',
            })}
          >
            <FileText className={css({ w: '6', h: '6', color: 'green.400' })} />
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Accurate OCR
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Powered by Tesseract.js for high-quality text extraction from various image types.
            </p>
          </div>

          <div
            className={css({
              p: '4',
              bg: 'gray.800/30',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              spaceY: '3',
            })}
          >
            <ImageIcon className={css({ w: '6', h: '6', color: 'green.400' })} />
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Multiple Formats
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Support for PNG, JPEG, and WEBP image formats up to 10MB in size.
            </p>
          </div>

          <div
            className={css({
              p: '4',
              bg: 'gray.800/30',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              spaceY: '3',
            })}
          >
            <Upload className={css({ w: '6', h: '6', color: 'green.400' })} />
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Easy Upload
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Simple drag-and-drop or click-to-upload interface for quick image processing.
            </p>
          </div>

          <div
            className={css({
              p: '4',
              bg: 'gray.800/30',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              spaceY: '3',
            })}
          >
            <Copy className={css({ w: '6', h: '6', color: 'green.400' })} />
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              One-Click Copy
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Instantly copy extracted text to your clipboard with a single click.
            </p>
          </div>

          <div
            className={css({
              p: '4',
              bg: 'gray.800/30',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              spaceY: '3',
            })}
          >
            <Download className={css({ w: '6', h: '6', color: 'green.400' })} />
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              Download Text
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Save extracted text as a .txt file for future use or sharing.
            </p>
          </div>

          <div
            className={css({
              p: '4',
              bg: 'gray.800/30',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
              spaceY: '3',
            })}
          >
            <FileText className={css({ w: '6', h: '6', color: 'green.400' })} />
            <h3
              className={css({
                fontSize: 'base',
                fontWeight: 'semibold',
                color: 'gray.200',
              })}
            >
              12+ Languages
            </h3>
            <p className={css({ fontSize: 'sm', color: 'gray.400', lineHeight: 'relaxed' })}>
              Support for English, Spanish, French, German, Chinese, Japanese, Korean, and more.
            </p>
          </div>
        </div>
      </Card>
    </main>
  )
}
