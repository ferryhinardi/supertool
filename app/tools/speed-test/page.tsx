'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  Download,
  Info,
  Loader2,
  Play,
  Signal,
  Sparkles,
  Upload,
  Wifi,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

interface SpeedTestResult {
  downloadSpeed: number // Mbps
  uploadSpeed: number // Mbps
  latency: number // ms
  jitter: number // ms
  timestamp: Date
}

type TestPhase = 'idle' | 'latency' | 'download' | 'upload' | 'complete'

function SpeedTestContent() {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SpeedTestResult | null>(null)
  const [downloadSpeed, setDownloadSpeed] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState(0)
  const [latency, setLatency] = useState(0)
  const [jitter, setJitter] = useState(0)

  useEffect(() => {
    trackToolEvent('speed_test_open', {})
  }, [])

  const measureLatency = async (): Promise<{ latency: number; jitter: number }> => {
    const latencies: number[] = []
    const iterations = 5

    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      try {
        // Use a small HEAD request to measure latency
        await fetch('/favicon.ico', {
          method: 'HEAD',
          cache: 'no-store',
        })
        const end = performance.now()
        latencies.push(end - start)
      } catch (error) {
        console.error('Latency measurement error:', error)
      }
      setProgress(((i + 1) / iterations) * 100)
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
    const jitterValue =
      latencies.reduce((sum, lat) => sum + Math.abs(lat - avgLatency), 0) / latencies.length

    return { latency: avgLatency, jitter: jitterValue }
  }

  const measureDownloadSpeed = async (): Promise<number> => {
    const fileSizes = [100, 500, 1000, 2000] // KB
    const speeds: number[] = []

    for (let i = 0; i < fileSizes.length; i++) {
      const size = fileSizes[i] * 1024 // Convert to bytes

      try {
        // Use actual network requests to measure download speed
        const iterations = 3
        const iterationSpeeds: number[] = []

        for (let j = 0; j < iterations; j++) {
          try {
            const start = performance.now()

            // Generate random data on the server and download it
            // Using a public CDN test file or generating data via API
            const cacheBuster = `${Date.now()}-${Math.random()}`
            const response = await fetch(`https://httpbin.org/bytes/${size}?bust=${cacheBuster}`, {
              cache: 'no-store',
              signal: AbortSignal.timeout(10000), // 10s timeout
            })

            if (!response.ok) {
              console.warn(`Download test failed with status: ${response.status}`)
              continue
            }

            // Read the entire response to ensure data is transferred
            await response.arrayBuffer()

            const end = performance.now()
            const durationSeconds = (end - start) / 1000

            // Ensure we have a minimum duration to avoid division by very small numbers
            if (durationSeconds > 0.01) {
              const speedMbps = (size * 8) / (durationSeconds * 1000000)
              iterationSpeeds.push(speedMbps)
            }
          } catch (iterError) {
            console.warn(`Download iteration ${j + 1} failed:`, iterError)
            // Continue with other iterations
          }
        }

        // Calculate average speed for this file size
        if (iterationSpeeds.length > 0) {
          const avgSpeed = iterationSpeeds.reduce((a, b) => a + b, 0) / iterationSpeeds.length
          // Cap at reasonable maximum (1000 Mbps) to filter out unrealistic values
          const cappedSpeed = Math.min(avgSpeed, 1000)
          speeds.push(cappedSpeed)
          setDownloadSpeed(cappedSpeed)
        }
      } catch (error) {
        console.error(`Download measurement error for size ${size}:`, error)
        // Continue with next file size
      }

      setProgress(((i + 1) / fileSizes.length) * 100)
    }

    const finalSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
    console.log('Download test completed. Final speed:', finalSpeed.toFixed(2), 'Mbps')
    // Return average or 0 if no valid measurements
    return finalSpeed
  }

  const measureUploadSpeed = async (): Promise<number> => {
    const fileSizes = [100, 500, 1000] // KB
    const speeds: number[] = []

    for (let i = 0; i < fileSizes.length; i++) {
      const size = fileSizes[i] * 1024

      try {
        // Perform actual upload tests
        const iterations = 3
        const iterationSpeeds: number[] = []

        for (let j = 0; j < iterations; j++) {
          try {
            const start = performance.now()

            // Generate random data to upload
            const randomData = new Uint8Array(size)
            crypto.getRandomValues(randomData)
            const blob = new Blob([randomData])

            // Upload to httpbin which echoes back the data
            const response = await fetch('https://httpbin.org/post', {
              method: 'POST',
              body: blob,
              cache: 'no-store',
              signal: AbortSignal.timeout(10000), // 10s timeout
            })

            if (!response.ok) {
              console.warn(`Upload test failed with status: ${response.status}`)
              continue
            }

            // Read the response to ensure upload completes
            await response.arrayBuffer()

            const end = performance.now()
            const durationSeconds = (end - start) / 1000

            // Ensure minimum duration
            if (durationSeconds > 0.01) {
              const speedMbps = (size * 8) / (durationSeconds * 1000000)
              iterationSpeeds.push(speedMbps)
            }
          } catch (iterError) {
            console.warn(`Upload iteration ${j + 1} failed:`, iterError)
            // Continue with other iterations
          }
        }

        // Calculate average speed for this file size
        if (iterationSpeeds.length > 0) {
          const avgSpeed = iterationSpeeds.reduce((a, b) => a + b, 0) / iterationSpeeds.length
          // Cap at reasonable maximum (500 Mbps) for upload
          const cappedSpeed = Math.min(avgSpeed, 500)
          speeds.push(cappedSpeed)
          setUploadSpeed(cappedSpeed)
        }
      } catch (error) {
        console.error(`Upload measurement error for size ${size}:`, error)
        // Continue with next file size
      }

      setProgress(((i + 1) / fileSizes.length) * 100)
    }

    const finalSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0
    console.log('Upload test completed. Final speed:', finalSpeed.toFixed(2), 'Mbps')
    // Return average or 0 if no valid measurements
    return finalSpeed
  }

  const runSpeedTest = async () => {
    try {
      trackToolEvent('speed_test_start', {})

      // Reset state
      setResult(null)
      setDownloadSpeed(0)
      setUploadSpeed(0)
      setLatency(0)
      setJitter(0)
      setProgress(0)

      // Measure latency
      setPhase('latency')
      setProgress(0)
      const { latency: measuredLatency, jitter: measuredJitter } = await measureLatency()
      setLatency(measuredLatency)
      setJitter(measuredJitter)

      // Small delay between phases for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Measure download speed
      setPhase('download')
      setProgress(0)
      const downloadSpeedResult = await measureDownloadSpeed()

      // Small delay between phases for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Measure upload speed
      setPhase('upload')
      setProgress(0)
      const uploadSpeedResult = await measureUploadSpeed()

      // Complete
      setPhase('complete')
      setProgress(100)
      const finalResult: SpeedTestResult = {
        downloadSpeed: downloadSpeedResult,
        uploadSpeed: uploadSpeedResult,
        latency: measuredLatency,
        jitter: measuredJitter,
        timestamp: new Date(),
      }
      setResult(finalResult)

      trackToolEvent('speed_test_complete', {
        download_speed: downloadSpeedResult.toFixed(2),
        upload_speed: uploadSpeedResult.toFixed(2),
        latency: measuredLatency.toFixed(2),
      })

      toast.success('Speed test completed!')
    } catch (error) {
      console.error('Speed test error:', error)
      toast.error('Failed to complete speed test. Please try again.')
      setPhase('idle')
      setProgress(0)
      trackToolEvent('speed_test_error', {})
    }
  }

  const getPhaseLabel = () => {
    switch (phase) {
      case 'latency':
        return 'Measuring Latency...'
      case 'download':
        return 'Testing Download Speed...'
      case 'upload':
        return 'Testing Upload Speed...'
      case 'complete':
        return 'Test Complete!'
      default:
        return 'Ready to Test'
    }
  }

  const isTestRunning = phase !== 'idle' && phase !== 'complete'

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
            borderColor: 'purple.500/30',
            bg: 'purple.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Activity className={css({ h: '5', w: '5', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'purple.300' })}>
            Accurate & Fast Network Testing
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientVia: 'pink.400',
            gradientTo: 'red.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Network Speed Test
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Test your internet connection speed in real-time. Measure download speed, upload speed,
          latency, and jitter with accurate results.
        </p>
      </motion.div>

      {/* Main Speed Test Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
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
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <Wifi className={css({ h: '6', w: '6', color: 'purple.400' })} />
              <div>
                <CardTitle>Speed Test</CardTitle>
                <CardDescription>{getPhaseLabel()}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* Start Button */}
            {!isTestRunning && phase !== 'complete' && (
              <div className={css({ display: 'flex', justifyContent: 'center', py: '8' })}>
                <Button
                  onClick={runSpeedTest}
                  size="lg"
                  className={css({
                    gap: '3',
                    px: '12',
                    py: '6',
                    fontSize: 'xl',
                    bg: 'purple.500',
                    color: 'white',
                    _hover: {
                      bg: 'purple.600',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s',
                    },
                  })}
                >
                  <Play className={css({ h: '6', w: '6' })} />
                  Start Test
                </Button>
              </div>
            )}

            {/* Progress Indicator */}
            {isTestRunning && (
              <div className={css({ spaceY: '4' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                  <Loader2
                    className={css({ h: '5', w: '5', color: 'purple.400', animation: 'spin' })}
                  />
                  <span
                    className={css({ fontSize: 'lg', fontWeight: 'medium', color: 'gray.300' })}
                  >
                    {getPhaseLabel()}
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Real-time Results Display */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: '4',
              })}
            >
              {/* Download Speed */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: phase === 'download' ? 'green.500/50' : 'gray.700',
                  bg: phase === 'download' ? 'green.500/10' : 'gray.800/50',
                  p: '4',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                })}
              >
                <Download
                  className={css({
                    h: '6',
                    w: '6',
                    mx: 'auto',
                    mb: '2',
                    color: phase === 'download' ? 'green.400' : 'gray.500',
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>Download</p>
                <p
                  className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: phase === 'download' ? 'green.300' : 'gray.400',
                  })}
                >
                  {result?.downloadSpeed.toFixed(2) || downloadSpeed.toFixed(2) || '0.00'}
                </p>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>Mbps</p>
              </div>

              {/* Upload Speed */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: phase === 'upload' ? 'blue.500/50' : 'gray.700',
                  bg: phase === 'upload' ? 'blue.500/10' : 'gray.800/50',
                  p: '4',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                })}
              >
                <Upload
                  className={css({
                    h: '6',
                    w: '6',
                    mx: 'auto',
                    mb: '2',
                    color: phase === 'upload' ? 'blue.400' : 'gray.500',
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>Upload</p>
                <p
                  className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: phase === 'upload' ? 'blue.300' : 'gray.400',
                  })}
                >
                  {result?.uploadSpeed.toFixed(2) || uploadSpeed.toFixed(2) || '0.00'}
                </p>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>Mbps</p>
              </div>

              {/* Latency */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: phase === 'latency' ? 'yellow.500/50' : 'gray.700',
                  bg: phase === 'latency' ? 'yellow.500/10' : 'gray.800/50',
                  p: '4',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                })}
              >
                <Signal
                  className={css({
                    h: '6',
                    w: '6',
                    mx: 'auto',
                    mb: '2',
                    color: phase === 'latency' ? 'yellow.400' : 'gray.500',
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>Latency</p>
                <p
                  className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: phase === 'latency' ? 'yellow.300' : 'gray.400',
                  })}
                >
                  {result?.latency.toFixed(0) || latency.toFixed(0) || '0'}
                </p>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>ms</p>
              </div>

              {/* Jitter */}
              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: phase === 'latency' ? 'orange.500/50' : 'gray.700',
                  bg: phase === 'latency' ? 'orange.500/10' : 'gray.800/50',
                  p: '4',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                })}
              >
                <Activity
                  className={css({
                    h: '6',
                    w: '6',
                    mx: 'auto',
                    mb: '2',
                    color: phase === 'latency' ? 'orange.400' : 'gray.500',
                  })}
                />
                <p className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>Jitter</p>
                <p
                  className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: phase === 'latency' ? 'orange.300' : 'gray.400',
                  })}
                >
                  {result?.jitter.toFixed(0) || jitter.toFixed(0) || '0'}
                </p>
                <p className={css({ fontSize: 'xs', color: 'gray.500' })}>ms</p>
              </div>
            </div>

            {/* Retest Button */}
            {phase === 'complete' && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({ display: 'flex', justifyContent: 'center', pt: '4' })}
              >
                <Button
                  onClick={runSpeedTest}
                  className={css({
                    gap: '2',
                    bg: 'purple.500/20',
                    border: '1px solid',
                    borderColor: 'purple.500/50',
                    color: 'purple.300',
                    _hover: { bg: 'purple.500/30' },
                  })}
                >
                  <Play className={css({ h: '4', w: '4' })} />
                  Run Test Again
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Result Details */}
      {result && phase === 'complete' && (
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
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Completed at {result.timestamp.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' },
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
                  <p className={css({ fontSize: 'sm', color: 'gray.500', mb: '2' })}>
                    Connection Quality
                  </p>
                  <Badge
                    className={css({
                      bg:
                        result.downloadSpeed > 50
                          ? 'green.500/20'
                          : result.downloadSpeed > 25
                            ? 'yellow.500/20'
                            : 'red.500/20',
                      color:
                        result.downloadSpeed > 50
                          ? 'green.300'
                          : result.downloadSpeed > 25
                            ? 'yellow.300'
                            : 'red.300',
                      border: '1px solid',
                      borderColor:
                        result.downloadSpeed > 50
                          ? 'green.500/30'
                          : result.downloadSpeed > 25
                            ? 'yellow.500/30'
                            : 'red.500/30',
                    })}
                  >
                    {result.downloadSpeed > 50
                      ? 'Excellent'
                      : result.downloadSpeed > 25
                        ? 'Good'
                        : result.downloadSpeed > 10
                          ? 'Fair'
                          : 'Poor'}
                  </Badge>
                </div>

                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    p: '4',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.500', mb: '2' })}>
                    Latency Quality
                  </p>
                  <Badge
                    className={css({
                      bg:
                        result.latency < 50
                          ? 'green.500/20'
                          : result.latency < 100
                            ? 'yellow.500/20'
                            : 'red.500/20',
                      color:
                        result.latency < 50
                          ? 'green.300'
                          : result.latency < 100
                            ? 'yellow.300'
                            : 'red.300',
                      border: '1px solid',
                      borderColor:
                        result.latency < 50
                          ? 'green.500/30'
                          : result.latency < 100
                            ? 'yellow.500/30'
                            : 'red.500/30',
                    })}
                  >
                    {result.latency < 50
                      ? 'Excellent'
                      : result.latency < 100
                        ? 'Good'
                        : result.latency < 150
                          ? 'Fair'
                          : 'Poor'}
                  </Badge>
                </div>
              </div>

              <div
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'purple.500/20',
                  bg: 'purple.500/5',
                  p: '4',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                  <Info className={css({ h: '5', w: '5', color: 'purple.400', flexShrink: '0' })} />
                  <div className={css({ spaceY: '2' })}>
                    <h4
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: 'purple.300',
                      })}
                    >
                      What do these numbers mean?
                    </h4>
                    <ul className={css({ spaceY: '1', fontSize: 'xs', color: 'gray.400' })}>
                      <li>
                        • <strong>Download Speed:</strong> How fast you can receive data (streaming,
                        downloads)
                      </li>
                      <li>
                        • <strong>Upload Speed:</strong> How fast you can send data (video calls,
                        file uploads)
                      </li>
                      <li>
                        • <strong>Latency:</strong> Response time (lower is better for gaming, video
                        calls)
                      </li>
                      <li>
                        • <strong>Jitter:</strong> Variation in latency (lower is better for
                        real-time apps)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
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
                  Tips for Accurate Testing
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                  <li>• Close other tabs and applications that might be using the internet</li>
                  <li>• Connect via ethernet for most accurate results (Wi-Fi can be slower)</li>
                  <li>• Run multiple tests at different times for a complete picture</li>
                  <li>• Test results may vary based on server load and network conditions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

export default function SpeedTestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SpeedTestContent />
    </Suspense>
  )
}
