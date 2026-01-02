'use client'

import jsQR from 'jsqr'
import { Check, Copy, ScanLine, Upload, Video, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface ScannedCode {
  id: string
  data: string
  timestamp: Date
  format: string
}

export default function QRCodeScannerPage() {
  const [scannedCodes, setScannedCodes] = useState<ScannedCode[]>([])
  const [currentScan, setCurrentScan] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const [useWebcam, setUseWebcam] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Helper function to stop webcam streams with stable reference
  const stopWebcamStreams = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setUseWebcam(false)
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

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
      setIsScanning(true)
      trackToolEvent('qr_code_scanner_upload', {
        fileType: file.type,
        fileSize: file.size,
      })

      // Load image
      const image = new Image()
      const imageUrl = URL.createObjectURL(file)

      image.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size to image size
        canvas.width = image.width
        canvas.height = image.height

        // Draw image on canvas
        ctx.drawImage(image, 0, 0)

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // Scan for QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        URL.revokeObjectURL(imageUrl)

        if (code) {
          const scanned: ScannedCode = {
            id: Date.now().toString(),
            data: code.data,
            timestamp: new Date(),
            format: 'QR Code',
          }

          setCurrentScan(code.data)
          setScannedCodes((prev) => [scanned, ...prev])

          trackToolEvent('qr_code_scanner_success', {
            dataLength: code.data.length,
          })
        } else {
          setError('No QR code found in the image. Please try another image.')
          trackToolEvent('qr_code_scanner_no_code')
        }

        setIsScanning(false)
      }

      image.onerror = () => {
        setError('Failed to load image. Please try another file.')
        setIsScanning(false)
        URL.revokeObjectURL(imageUrl)
      }

      image.src = imageUrl
    } catch {
      setError('Failed to scan QR code. Please try again.')
      setIsScanning(false)
    }
  }, [])

  const startWebcamScan = useCallback(async () => {
    setError('')
    setUseWebcam(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        trackToolEvent('qr_code_scanner_webcam_start')

        // Start scanning loop
        const scanFrame = () => {
          if (!videoRef.current || !canvasRef.current) return

          const video = videoRef.current
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')

          if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationFrameRef.current = requestAnimationFrame(scanFrame)
            return
          }

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })

          if (code) {
            const scanned: ScannedCode = {
              id: Date.now().toString(),
              data: code.data,
              timestamp: new Date(),
              format: 'QR Code',
            }

            setCurrentScan(code.data)
            setScannedCodes((prev) => [scanned, ...prev])

            trackToolEvent('qr_code_scanner_webcam_success', {
              dataLength: code.data.length,
            })

            // Stop scanning after successful detection
            stopWebcamStreams()
            return
          }

          animationFrameRef.current = requestAnimationFrame(scanFrame)
        }

        scanFrame()
      }
    } catch {
      setError('Failed to access webcam. Please check permissions.')
      setUseWebcam(false)
    }
  }, [stopWebcamStreams])

  const stopWebcamScan = useCallback(() => {
    stopWebcamStreams()
    trackToolEvent('qr_code_scanner_webcam_stop')
  }, [stopWebcamStreams])

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)

    trackToolEvent('qr_code_scanner_copy', {
      dataLength: text.length,
    })
  }, [])

  const clearHistory = useCallback(() => {
    setScannedCodes([])
    setCurrentScan('')
    setError('')
    trackToolEvent('qr_code_scanner_clear_history')
  }, [])

  const deleteCode = useCallback((id: string) => {
    setScannedCodes((prev) => prev.filter((code) => code.id !== id))
    trackToolEvent('qr_code_scanner_delete')
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
          spaceY: '4',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
          })}
        >
          <div
            className={css({
              p: '3',
              bg: 'gradient-to-br',
              gradientFrom: 'blue.500',
              gradientTo: 'cyan.500',
              rounded: 'xl',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <ScanLine className={css({ w: '6', h: '6', color: 'white' })} />
          </div>
          <div>
            <h1
              className={css({
                fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                fontWeight: 'bold',
                color: 'white',
              })}
            >
              QR Code Scanner
            </h1>
            <p
              className={css({
                color: 'gray.400',
                fontSize: { base: 'sm', sm: 'base' },
              })}
            >
              Scan and read QR codes from images or webcam
            </p>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <Card
        className={css({
          p: { base: '4', sm: '6' },
          spaceY: '6',
        })}
      >
        <div
          className={css({
            spaceY: '4',
          })}
        >
          <h2
            className={css({
              fontSize: { base: 'lg', sm: 'xl' },
              fontWeight: 'semibold',
              color: 'white',
            })}
          >
            Scan QR Code
          </h2>

          {/* Action Buttons */}
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              gap: '3',
            })}
          >
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning || useWebcam}
              className={css({
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <Upload className={css({ w: '4', h: '4' })} />
              Upload Image
            </Button>

            {!useWebcam ? (
              <Button
                onClick={startWebcamScan}
                disabled={isScanning}
                variant="outline"
                className={css({
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Video className={css({ w: '4', h: '4' })} />
                Use Webcam
              </Button>
            ) : (
              <Button
                onClick={stopWebcamScan}
                variant="destructive"
                className={css({
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <X className={css({ w: '4', h: '4' })} />
                Stop Webcam
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className={css({ display: 'none' })}
          />

          {/* Error Message */}
          {error && (
            <div
              className={css({
                p: '4',
                bg: 'red.500/10',
                border: '1px solid',
                borderColor: 'red.500/20',
                rounded: 'lg',
                color: 'red.400',
                fontSize: 'sm',
              })}
            >
              {error}
            </div>
          )}

          {/* Webcam Preview */}
          {useWebcam && (
            <div
              className={css({
                position: 'relative',
                w: 'full',
                aspectRatio: '16/9',
                bg: 'black',
                rounded: 'lg',
                overflow: 'hidden',
              })}
            >
              <video
                ref={videoRef}
                className={css({
                  w: 'full',
                  h: 'full',
                  objectFit: 'cover',
                })}
                playsInline
                muted
              />
              <div
                className={css({
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  w: '64',
                  h: '64',
                  border: '2px solid',
                  borderColor: 'blue.500',
                  rounded: 'lg',
                  pointerEvents: 'none',
                })}
              />
            </div>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className={css({ display: 'none' })} />

          {/* Current Scan Result */}
          {currentScan && (
            <div
              className={css({
                p: '4',
                bg: 'green.500/10',
                border: '1px solid',
                borderColor: 'green.500/20',
                rounded: 'lg',
                spaceY: '2',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <span
                  className={css({
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'green.400',
                  })}
                >
                  Scanned Successfully
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(currentScan, 'current')}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  {copiedId === 'current' ? (
                    <>
                      <Check className={css({ w: '4', h: '4' })} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className={css({ w: '4', h: '4' })} />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p
                className={css({
                  fontSize: 'sm',
                  color: 'gray.300',
                  wordBreak: 'break-all',
                  fontFamily: 'mono',
                })}
              >
                {currentScan}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Scan History */}
      {scannedCodes.length > 0 && (
        <Card
          className={css({
            p: { base: '4', sm: '6' },
            spaceY: '4',
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
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'semibold',
                color: 'white',
              })}
            >
              Scan History
            </h2>
            <Button size="sm" variant="outline" onClick={clearHistory}>
              Clear All
            </Button>
          </div>

          <div
            className={css({
              spaceY: '3',
            })}
          >
            {scannedCodes.map((code) => (
              <div
                key={code.id}
                className={css({
                  p: '4',
                  bg: 'white/5',
                  border: '1px solid',
                  borderColor: 'white/10',
                  rounded: 'lg',
                  spaceY: '2',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '2',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      flex: '1',
                      minW: '0',
                    })}
                  >
                    <span
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.400',
                      })}
                    >
                      {code.format}
                    </span>
                    <span
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.500',
                      })}
                    >
                      •
                    </span>
                    <span
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.400',
                      })}
                    >
                      {code.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                    })}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(code.data, code.id)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1',
                      })}
                    >
                      {copiedId === code.id ? (
                        <>
                          <Check className={css({ w: '3', h: '3' })} />
                          <span className={css({ display: { base: 'none', sm: 'inline' } })}>
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className={css({ w: '3', h: '3' })} />
                          <span className={css({ display: { base: 'none', sm: 'inline' } })}>
                            Copy
                          </span>
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCode(code.id)}
                      className={css({
                        color: 'red.400',
                        _hover: { color: 'red.300', bg: 'red.500/10' },
                      })}
                    >
                      <X className={css({ w: '3', h: '3' })} />
                    </Button>
                  </div>
                </div>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'gray.300',
                    wordBreak: 'break-all',
                    fontFamily: 'mono',
                  })}
                >
                  {code.data}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* How to Use Section */}
      <Card
        className={css({
          p: { base: '4', sm: '6' },
          spaceY: '4',
        })}
      >
        <h2
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            fontWeight: 'semibold',
            color: 'white',
          })}
        >
          How to Use QR Code Scanner
        </h2>

        <div
          className={css({
            spaceY: '4',
            color: 'gray.300',
            fontSize: 'sm',
            lineHeight: 'relaxed',
          })}
        >
          <div>
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                mb: '2',
              })}
            >
              Method 1: Upload Image
            </h3>
            <ol
              className={css({
                listStyle: 'decimal',
                ml: '5',
                spaceY: '1',
              })}
            >
              <li>Click the "Upload Image" button</li>
              <li>Select an image file containing a QR code</li>
              <li>Wait for the scanner to detect the QR code</li>
              <li>View the decoded data and copy if needed</li>
            </ol>
          </div>

          <div>
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                mb: '2',
              })}
            >
              Method 2: Use Webcam
            </h3>
            <ol
              className={css({
                listStyle: 'decimal',
                ml: '5',
                spaceY: '1',
              })}
            >
              <li>Click the "Use Webcam" button</li>
              <li>Allow camera access when prompted</li>
              <li>Point your camera at the QR code</li>
              <li>The scanner will automatically detect and decode it</li>
            </ol>
          </div>

          <div>
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                mb: '2',
              })}
            >
              Tips for Best Results
            </h3>
            <ul
              className={css({
                listStyle: 'disc',
                ml: '5',
                spaceY: '1',
              })}
            >
              <li>Ensure good lighting when using the webcam</li>
              <li>Hold the QR code steady and within the frame</li>
              <li>Make sure the QR code is clear and not damaged</li>
              <li>Upload high-quality images for better detection</li>
              <li>Try different angles if the code is not detected</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Features Section */}
      <Card
        className={css({
          p: { base: '4', sm: '6' },
          spaceY: '4',
        })}
      >
        <h2
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            fontWeight: 'semibold',
            color: 'white',
          })}
        >
          Features
        </h2>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
            gap: '4',
          })}
        >
          <div
            className={css({
              spaceY: '2',
            })}
          >
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                fontSize: 'sm',
              })}
            >
              Multiple Scan Methods
            </h3>
            <p
              className={css({
                color: 'gray.400',
                fontSize: 'sm',
                lineHeight: 'relaxed',
              })}
            >
              Upload images or use your device's webcam to scan QR codes instantly.
            </p>
          </div>

          <div
            className={css({
              spaceY: '2',
            })}
          >
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                fontSize: 'sm',
              })}
            >
              Scan History
            </h3>
            <p
              className={css({
                color: 'gray.400',
                fontSize: 'sm',
                lineHeight: 'relaxed',
              })}
            >
              Keep track of all your scanned QR codes with timestamps for easy reference.
            </p>
          </div>

          <div
            className={css({
              spaceY: '2',
            })}
          >
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                fontSize: 'sm',
              })}
            >
              One-Click Copy
            </h3>
            <p
              className={css({
                color: 'gray.400',
                fontSize: 'sm',
                lineHeight: 'relaxed',
              })}
            >
              Quickly copy decoded QR code data to your clipboard with a single click.
            </p>
          </div>

          <div
            className={css({
              spaceY: '2',
            })}
          >
            <h3
              className={css({
                fontWeight: 'medium',
                color: 'white',
                fontSize: 'sm',
              })}
            >
              Privacy-Focused
            </h3>
            <p
              className={css({
                color: 'gray.400',
                fontSize: 'sm',
                lineHeight: 'relaxed',
              })}
            >
              All scanning happens locally in your browser. Your data never leaves your device.
            </p>
          </div>
        </div>
      </Card>
    </main>
  )
}
