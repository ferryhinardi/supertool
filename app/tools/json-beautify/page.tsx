'use client'

import { Copy, Download, FileJson, Minimize2, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQueryState } from 'nuqs'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTrackToolView } from '@/hooks/useRecentTools'
import { trackToolEvent } from '@/lib/analytics'
import { tools } from '@/lib/tools'
import { css } from '@/styled-system/css'

// Dynamically import CodeMirror to reduce initial bundle size (~200KB)
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

function JSONBeautifyContent() {
  // Find tool data for tracking
  const toolData = tools.find((t) => t.href === '/tools/json-beautify')

  // Track tool view
  useTrackToolView({
    toolId: toolData?.href || '/tools/json-beautify',
    title: toolData?.title || 'JSON Beautifier',
    href: toolData?.href || '/tools/json-beautify',
    iconName: 'FileJson',
    gradient: toolData?.gradient || 'from-purple-500 to-pink-500',
  })

  const [value, setValue] = useQueryState('json', {
    defaultValue: '{\n  "example": true,\n  "message": "Welcome to SuperTool!"\n}',
  })

  // Dynamically load json extension
  const [jsonExtension, setJsonExtension] = useState<any>(null)

  useEffect(() => {
    const loadExtension = async () => {
      const { json } = await import('@codemirror/lang-json')
      setJsonExtension(json())
    }
    loadExtension()
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const lines = value.split('\n').length
    const chars = value.length
    let isValid = false
    let objDepth = 0

    try {
      const parsed = JSON.parse(value)
      isValid = true
      // Calculate object depth
      const getDepth = (obj: unknown): number => {
        if (obj == null || typeof obj !== 'object') return 0
        return (
          1 + Math.max(0, ...Object.values(obj as Record<string, unknown>).map((v) => getDepth(v)))
        )
      }
      objDepth = getDepth(parsed)
    } catch {
      isValid = false
    }

    return { lines, chars, isValid, objDepth }
  }, [value])

  const handleBeautify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj, null, 2))
      toast.success('JSON beautified successfully 🎉')
      trackToolEvent('json_beautify', {
        success: true,
        input_length: value.length,
      })
    } catch {
      toast.error('Invalid JSON format ⚠️')
      trackToolEvent('json_beautify', {
        success: false,
        error_type: 'parse_error',
      })
    }
  }

  const handleMinify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj))
      toast.success('JSON minified ✅')
      trackToolEvent('json_minify', {
        success: true,
        input_length: value.length,
      })
    } catch {
      toast.error('Invalid JSON format ⚠️')
      trackToolEvent('json_minify', {
        success: false,
      })
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard 📋')
    trackToolEvent('json_copy', {
      output_length: value.length,
    })
  }

  const handleDownload = () => {
    if (!stats.isValid) {
      toast.error('Cannot download invalid JSON')
      return
    }

    const blob = new Blob([value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('JSON file downloaded 📥')
    trackToolEvent('json_download', {
      file_size_kb: Math.round(blob.size / 1024),
    })
  }

  return (
    <TooltipProvider>
      <main
        className={css({
          mx: 'auto',
          maxW: '1400px',
          w: 'full',
          px: { base: '4', sm: '6', md: '8' },
          py: { base: '6', sm: '8', md: '10' },
          spaceY: { base: '4', sm: '6', md: '8' },
        })}
      >
        {/* Header */}
        <div className={css({ spaceY: '3' })}>
          <div
            className={css({ display: 'flex', alignItems: 'center', gap: { base: '3', sm: '4' } })}
          >
            <div
              className={css({
                animation: 'pulse 2s infinite',
                rounded: { base: 'xl', sm: '2xl' },
                bgGradient: 'to-br',
                gradientFrom: 'purple.600',
                gradientVia: 'pink.600',
                gradientTo: 'purple.700',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.6)',
              })}
            >
              <FileJson
                className={css({
                  h: { base: '6', sm: '8' },
                  w: { base: '6', sm: '8' },
                  color: 'white',
                })}
              />
            </div>
            <div>
              <h1
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.300',
                  gradientVia: 'pink.400',
                  gradientTo: 'blue.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  color: 'transparent',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                JSON Beautifier
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Format, validate, and manage JSON data
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: '0 20px 25px rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'flex',
              flexDirection: { base: 'column', sm: 'row' },
              alignItems: { base: 'start', sm: 'center' },
              justifyContent: 'space-between',
              gap: { base: '3', sm: '4' },
            })}
          >
            <div
              className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2' })}
            >
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'purple.500/50',
                  bg: 'purple.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'purple.200',
                })}
              >
                📏 {stats.lines} lines
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className={css({
                  borderColor: 'blue.500/50',
                  bg: 'blue.500/10',
                  px: { base: '2.5', sm: '3', md: '4' },
                  py: { base: '1.5', sm: '1.5', md: '2' },
                  fontSize: { base: 'xs', sm: 'sm' },
                  color: 'blue.200',
                })}
              >
                📝 {stats.chars.toLocaleString()} chars
              </Badge>
              {stats.isValid && (
                <Badge
                  variant="outline"
                  size="sm"
                  className={css({
                    borderColor: 'cyan.500/50',
                    bg: 'cyan.500/10',
                    px: { base: '2.5', sm: '3', md: '4' },
                    py: { base: '1.5', sm: '1.5', md: '2' },
                    fontSize: { base: 'xs', sm: 'sm' },
                    color: 'cyan.200',
                  })}
                >
                  🌲 Depth: {stats.objDepth}
                </Badge>
              )}
            </div>

            <Badge
              variant={stats.isValid ? 'success' : 'destructive'}
              size="sm"
              className={css({
                animation: 'pulse 2s infinite',
                px: { base: '2.5', sm: '3', md: '4' },
                py: { base: '1.5', sm: '1.5', md: '2' },
                fontSize: { base: 'xs', sm: 'sm' },
                fontWeight: 'semibold',
                bgGradient: stats.isValid ? 'to-r' : 'to-r',
                gradientFrom: stats.isValid ? 'green.500' : 'red.500',
                gradientTo: stats.isValid ? 'emerald.600' : 'rose.600',
                color: 'white',
                shadow: 'lg',
                boxShadow: stats.isValid
                  ? '0 10px 15px rgba(34, 197, 94, 0.5)'
                  : '0 10px 15px rgba(239, 68, 68, 0.5)',
              })}
            >
              {stats.isValid ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </Badge>
          </div>
        </div>

        {/* Editor */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '3', sm: '4' },
            overflow: 'hidden',
            shadow: '2xl',
            boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div className={css({ overflowX: 'auto' })}>
            {jsonExtension && (
              <CodeMirror
                value={value}
                height="400px"
                theme="dark"
                extensions={[jsonExtension]}
                onChange={(val) => setValue(val)}
                className={css({ fontSize: { base: 'sm', sm: 'base' } })}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                }}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/30',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: '0 20px 25px rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: 'repeat(2, 1fr)', sm: 'auto' },
              gap: '2',
              sm: { display: 'flex', flexWrap: 'wrap' },
            })}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBeautify}
                  className={css({
                    position: 'relative',
                    overflow: 'hidden',
                    bgGradient: 'to-r',
                    gradientFrom: 'purple.600',
                    gradientVia: 'pink.600',
                    gradientTo: 'blue.600',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'white',
                    shadow: '2xl',
                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.5)',
                    transition: 'all 0.3s',
                    _hover: {
                      transform: 'scale(1.05)',
                      gradientFrom: 'purple.700',
                      gradientVia: 'pink.700',
                      gradientTo: 'blue.700',
                      boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.6)',
                    },
                  })}
                >
                  <Sparkles
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Beautify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>
                  Format JSON with indentation (Ctrl+B)
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={handleMinify}
                  className={css({
                    border: '2px solid',
                    borderColor: 'blue.500/50',
                    bgGradient: 'to-r',
                    gradientFrom: 'blue.500/20',
                    gradientTo: 'cyan.500/20',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'blue.100',
                    _hover: {
                      transform: 'scale(1.05)',
                      borderColor: 'blue.500/70',
                      gradientFrom: 'blue.500/30',
                      gradientTo: 'cyan.500/30',
                      color: 'white',
                    },
                  })}
                >
                  <Minimize2
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Minify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>
                  Compress JSON to single line (Ctrl+M)
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className={css({
                    border: '2px solid',
                    borderColor: 'purple.500/50',
                    bg: 'purple.500/10',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'purple.100',
                    _hover: {
                      transform: 'scale(1.05)',
                      borderColor: 'purple.500/70',
                      bg: 'purple.500/20',
                      color: 'white',
                    },
                  })}
                >
                  <Copy
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>Copy to clipboard (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!stats.isValid}
                  className={css({
                    border: '2px solid',
                    borderColor: 'pink.500/50',
                    bg: 'pink.500/10',
                    px: { base: '3', sm: '4', md: '6' },
                    py: { base: '2', sm: '2.5', md: '3' },
                    fontSize: { base: 'sm', md: 'base' },
                    fontWeight: 'semibold',
                    color: 'pink.100',
                    _hover: {
                      transform: 'scale(1.05)',
                      borderColor: 'pink.500/70',
                      bg: 'pink.500/20',
                      color: 'white',
                    },
                    _disabled: {
                      opacity: 0.5,
                    },
                  })}
                >
                  <Download
                    className={css({
                      mr: { base: '1.5', sm: '2' },
                      h: { base: '4', sm: '5' },
                      w: { base: '4', sm: '5' },
                    })}
                  />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={css({ color: 'foreground' })}>Download as .json file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}

export default function JSONBeautifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JSONBeautifyContent />
    </Suspense>
  )
}
