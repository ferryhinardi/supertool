'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  Info,
  Layers,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface OptimizationStats {
  originalSize: number
  optimizedSize: number
  reduction: number
  originalElements: number
  optimizedElements: number
}

interface OptimizationOptions {
  removeComments: boolean
  removeMetadata: boolean
  removeHiddenElements: boolean
  convertStyleToAttrs: boolean
  removeUselessDefs: boolean
  cleanupIds: boolean
  minifyColors: boolean
  removeEmptyAttrs: boolean
  convertPathData: boolean
  mergePaths: boolean
}

function SVGOptimizerContent() {
  const [svgInput, setSvgInput] = useState('')
  const [svgOutput, setSvgOutput] = useState('')
  const [stats, setStats] = useState<OptimizationStats | null>(null)
  const [options, setOptions] = useState<OptimizationOptions>({
    removeComments: true,
    removeMetadata: true,
    removeHiddenElements: true,
    convertStyleToAttrs: true,
    removeUselessDefs: true,
    cleanupIds: true,
    minifyColors: true,
    removeEmptyAttrs: true,
    convertPathData: true,
    mergePaths: false,
  })

  // Track page visit
  useEffect(() => {
    trackToolEvent('svg_optimizer_open', {})
  }, [])

  const optimizeSVG = (svg: string, opts: OptimizationOptions): string => {
    let optimized = svg

    // Remove XML declaration and DOCTYPE
    if (opts.removeMetadata) {
      optimized = optimized.replace(/<\?xml[^?]*\?>/g, '')
      optimized = optimized.replace(/<!DOCTYPE[^>]*>/g, '')
    }

    // Remove comments
    if (opts.removeComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')
    }

    // Remove metadata tags
    if (opts.removeMetadata) {
      optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
      optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '')
      optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '')
    }

    // Remove hidden elements
    if (opts.removeHiddenElements) {
      optimized = optimized.replace(/<[^>]*display="none"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
      optimized = optimized.replace(/<[^>]*visibility="hidden"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
      optimized = optimized.replace(/<[^>]*opacity="0"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    }

    // Remove useless defs (empty or unused)
    if (opts.removeUselessDefs) {
      optimized = optimized.replace(/<defs[\s\S]*?<\/defs>/gi, (match) => {
        // Keep defs if they have meaningful content
        if (match.includes('<linearGradient') || match.includes('<radialGradient')) {
          return match
        }
        if (match.includes('<clipPath') || match.includes('<mask')) {
          return match
        }
        // Remove if empty or has only whitespace
        if (/<defs>\s*<\/defs>/i.test(match)) {
          return ''
        }
        return match
      })
    }

    // Minify colors (convert to shortest form)
    if (opts.minifyColors) {
      // Convert hex colors to shortest form
      optimized = optimized.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
      // Convert rgb to hex where shorter
      optimized = optimized.replace(
        /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g,
        (_, r, g, b) =>
          `#${[r, g, b].map((x) => Number.parseInt(x, 10).toString(16).padStart(2, '0')).join('')}`
      )
    }

    // Remove empty attributes
    if (opts.removeEmptyAttrs) {
      optimized = optimized.replace(/\s+[a-z-]+=""\s*/gi, ' ')
    }

    // Convert style to attributes
    if (opts.convertStyleToAttrs) {
      optimized = optimized.replace(/style="([^"]*)"/g, (_match, styles) => {
        const attrs: string[] = []
        styles.split(';').forEach((style: string) => {
          const [prop, value] = style.split(':').map((s: string) => s.trim())
          if (prop && value) {
            attrs.push(`${prop}="${value}"`)
          }
        })
        return attrs.join(' ')
      })
    }

    // Optimize path data (remove unnecessary spaces and decimals)
    if (opts.convertPathData) {
      optimized = optimized.replace(/d="([^"]*)"/g, (_match, path) => {
        let optimizedPath = path
        // Remove extra spaces
        optimizedPath = optimizedPath.replace(/\s+/g, ' ')
        // Remove spaces around commands
        optimizedPath = optimizedPath.replace(/\s*([MmLlHhVvCcSsQqTtAaZz])\s*/g, '$1')
        // Remove leading zeros
        optimizedPath = optimizedPath.replace(/\b0+(\d+\.?\d*)/g, '$1')
        // Simplify decimals
        optimizedPath = optimizedPath.replace(/(\d+\.\d{3})\d+/g, '$1')
        return `d="${optimizedPath.trim()}"`
      })
    }

    // Cleanup IDs (remove or simplify)
    if (opts.cleanupIds) {
      let idCounter = 0
      const idMap = new Map<string, string>()

      // Find all IDs
      optimized = optimized.replace(/id="([^"]*)"/g, (_match, id) => {
        if (!idMap.has(id)) {
          idMap.set(id, `a${idCounter++}`)
        }
        return `id="${idMap.get(id)}"`
      })

      // Replace references to IDs
      idMap.forEach((newId, oldId) => {
        optimized = optimized.replace(new RegExp(`#${oldId}\\b`, 'g'), `#${newId}`)
        optimized = optimized.replace(new RegExp(`url\\(#${oldId}\\)`, 'g'), `url(#${newId})`)
      })
    }

    // Remove extra whitespace
    optimized = optimized.replace(/>\s+</g, '><')
    optimized = optimized.replace(/\s+/g, ' ')
    optimized = optimized.trim()

    return optimized
  }

  const countElements = (svg: string): number => {
    const matches = svg.match(/<[^/][^>]*>/g)
    return matches ? matches.length : 0
  }

  const handleOptimize = () => {
    if (!svgInput.trim()) {
      toast.error('Please enter SVG code to optimize')
      return
    }

    // Validate SVG
    if (!svgInput.includes('<svg') || !svgInput.includes('</svg>')) {
      toast.error('Invalid SVG format. Please enter valid SVG code.')
      return
    }

    try {
      const optimized = optimizeSVG(svgInput, options)
      setSvgOutput(optimized)

      const originalSize = new Blob([svgInput]).size
      const optimizedSize = new Blob([optimized]).size
      const reduction = ((originalSize - optimizedSize) / originalSize) * 100

      setStats({
        originalSize,
        optimizedSize,
        reduction,
        originalElements: countElements(svgInput),
        optimizedElements: countElements(optimized),
      })

      toast.success('SVG optimized successfully!')
      trackToolEvent('svg_optimizer_optimize', {
        originalSize,
        optimizedSize,
        reduction: Math.round(reduction),
      })
    } catch (error) {
      toast.error('Failed to optimize SVG')
      console.error(error)
    }
  }

  const handleClear = () => {
    setSvgInput('')
    setSvgOutput('')
    setStats(null)
    trackToolEvent('svg_optimizer_clear', {})
  }

  const handleCopy = () => {
    if (svgOutput) {
      navigator.clipboard.writeText(svgOutput)
      toast.success('Copied to clipboard!')
      trackToolEvent('svg_optimizer_copy', {})
    }
  }

  const handleDownload = () => {
    if (svgOutput) {
      const blob = new Blob([svgOutput], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'optimized.svg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('SVG downloaded!')
      trackToolEvent('svg_optimizer_download', {})
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  return (
    <main
      className={css({
        maxW: '7xl',
        mx: 'auto',
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
            borderRadius: 'full',
            border: '1px solid',
            borderColor: 'green.500/30',
            bg: 'green.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Layers className={css({ h: '5', w: '5', color: 'green.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.300' })}>
            Minify • Compress • Reduce File Size
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            background:
              'linear-gradient(to right, var(--colors-green-400), var(--colors-emerald-400), var(--colors-teal-400))',
            backgroundClip: 'text',
          })}
          style={{ WebkitTextFillColor: 'transparent' }}
        >
          SVG Optimizer & Editor
        </h1>

        <p
          className={css({
            maxW: '3xl',
            mx: 'auto',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Minify and optimize SVG files with live preview. Remove unnecessary metadata, compress
          paths, and reduce file size by up to 70%. Perfect for web performance.
        </p>
      </motion.div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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
            <CardTitle className={css({ fontSize: 'lg' })}>Optimization Options</CardTitle>
            <CardDescription>Configure what to optimize in your SVG</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gap: '3',
                gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                w: 'full',
              })}
            >
              {Object.entries(options).map(([key, value]) => (
                <label
                  key={key}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    cursor: 'pointer',
                    p: '3',
                    borderRadius: 'md',
                    border: '1px solid',
                    borderColor: value ? 'green.500/30' : 'gray.700',
                    bg: value ? 'green.500/10' : 'gray.800/50',
                    transition: 'all 0.2s',
                    _hover: {
                      borderColor: 'green.500/40',
                    },
                  })}
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        [key]: e.target.checked,
                      })
                    }
                    className={css({
                      w: '4',
                      h: '4',
                      cursor: 'pointer',
                    })}
                  />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                      .trim()}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
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
            <CardTitle className={css({ fontSize: 'lg' })}>Input SVG</CardTitle>
            <CardDescription>Paste your SVG code below</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <textarea
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#4ade80" />
  <path d="M 30 50 L 45 65 L 70 35" stroke="#fff" stroke-width="4" fill="none" />
</svg>`}
              className={css({
                w: 'full',
                minH: '64',
                p: '4',
                border: '1px solid',
                borderColor: 'gray.700',
                borderRadius: 'md',
                bg: 'gray.800/50',
                color: 'gray.100',
                fontSize: 'sm',
                fontFamily: 'mono',
                resize: 'vertical',
                _focus: {
                  outline: 'none',
                  borderColor: 'green.500',
                  ring: '2px',
                  ringColor: 'green.500/20',
                },
              })}
            />

            <div className={css({ display: 'flex', gap: '3', flexWrap: 'wrap' })}>
              <Button
                onClick={handleOptimize}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Sparkles className={css({ h: '4', w: '4' })} />
                Optimize SVG
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <X className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Section */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={css({
            display: 'grid',
            gap: '4',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            w: 'full',
          })}
        >
          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <FileCode
                className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'blue.400' })}
              />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {formatBytes(stats.originalSize)}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Original Size</div>
            </CardContent>
          </Card>

          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <Zap className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'green.400' })} />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {formatBytes(stats.optimizedSize)}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Optimized Size</div>
            </CardContent>
          </Card>

          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <CheckCircle2
                className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'emerald.400' })}
              />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {stats.reduction.toFixed(1)}%
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>Size Reduction</div>
            </CardContent>
          </Card>

          <Card
            className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}
          >
            <CardContent withTopPadding className={css({ p: '4', textAlign: 'center' })}>
              <Layers className={css({ h: '8', w: '8', mx: 'auto', mb: '2', color: 'teal.400' })} />
              <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'gray.100' })}>
                {stats.optimizedElements}
              </div>
              <div className={css({ fontSize: 'sm', color: 'white' })}>
                Elements (was {stats.originalElements})
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Output Section */}
      {svgOutput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={css({
            display: 'grid',
            gap: '6',
            gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
            w: 'full',
          })}
        >
          {/* Code Output */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <CheckCircle2 className={css({ h: '5', w: '5', color: 'green.400' })} />
                  <CardTitle className={css({ fontSize: 'lg' })}>Optimized SVG</CardTitle>
                </div>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button onClick={handleCopy} variant="ghost" size="sm">
                    <Copy className={css({ h: '4', w: '4' })} />
                  </Button>
                  <Button onClick={handleDownload} variant="ghost" size="sm">
                    <Download className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              </div>
              <CardDescription>Minified and optimized output</CardDescription>
            </CardHeader>
            <CardContent>
              <pre
                className={css({
                  p: '4',
                  bg: 'gray.800/50',
                  borderRadius: 'md',
                  overflowX: 'auto',
                  fontSize: 'xs',
                  fontFamily: 'mono',
                  color: 'gray.100',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxH: '96',
                })}
              >
                {svgOutput}
              </pre>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ fontSize: 'lg' })}>Live Preview</CardTitle>
              <CardDescription>Visual representation of optimized SVG</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minH: '64',
                  p: '8',
                  bg: 'gray.800/50',
                  borderRadius: 'md',
                  border: '1px dashed',
                  borderColor: 'gray.700',
                })}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG preview requires HTML rendering
                dangerouslySetInnerHTML={{ __html: svgOutput }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Educational Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={css({
          display: 'grid',
          gap: '6',
          gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
          w: 'full',
        })}
      >
        <Card className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}>
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Optimization Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3', fontSize: 'sm', color: 'white' })}>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Faster loading:</strong> Smaller file
                  sizes mean faster page loads
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Better performance:</strong> Optimized
                  SVGs render faster in browsers
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Reduced bandwidth:</strong> Save on
                  hosting and CDN costs
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <CheckCircle2
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'green.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Cleaner code:</strong> Remove
                  unnecessary metadata and attributes
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={css({ border: '1px solid', borderColor: 'gray.700', bg: 'gray.800/50' })}>
          <CardHeader>
            <CardTitle className={css({ fontSize: 'lg' })}>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={css({ spaceY: '3', fontSize: 'sm', color: 'white' })}>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Info
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'blue.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Test before deploying:</strong> Always
                  check the preview to ensure nothing broke
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Info
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'blue.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Keep originals:</strong> Save a backup
                  of the original SVG before optimizing
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Info
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'blue.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Use viewBox:</strong> Prefer viewBox
                  over width/height for responsive SVGs
                </div>
              </li>
              <li className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                <Info
                  className={css({
                    h: '4',
                    w: '4',
                    color: 'blue.400',
                    mt: '0.5',
                    flexShrink: '0',
                  })}
                />
                <div>
                  <strong className={css({ color: 'white' })}>Gzip compression:</strong> Combine
                  with server-side gzip for maximum savings
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <Suspense fallback={null}>
        <ToolSearch />
      </Suspense>
    </main>
  )
}

export default function SVGOptimizerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SVGOptimizerContent />
    </Suspense>
  )
}
