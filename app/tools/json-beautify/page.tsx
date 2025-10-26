'use client'

import { useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Sparkles, Minimize2, Copy, Download, FileJson } from 'lucide-react'
import { trackToolEvent } from '@/lib/analytics'
import { css } from '@/styled-system/css'

export default function JSONBeautifyPage() {
  const [value, setValue] = useState(
    '{\n  "example": true,\n  "message": "Welcome to SuperTool!"\n}'
  )

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
              className="animate-pulse rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-2.5 shadow-2xl shadow-purple-500/60 sm:rounded-2xl sm:p-4"
              style={{ animationDuration: '2s' }}
            >
              <FileJson className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-300 via-pink-400 to-blue-300 bg-clip-text text-2xl font-extrabold text-transparent drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                JSON Beautifier
              </h1>
              <p className="text-sm text-gray-200 sm:text-base md:text-lg">
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
                className="border-purple-500/50 bg-purple-500/10 px-2.5 py-1.5 text-xs text-purple-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
              >
                📏 {stats.lines} lines
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className="border-blue-500/50 bg-blue-500/10 px-2.5 py-1.5 text-xs text-blue-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
              >
                📝 {stats.chars.toLocaleString()} chars
              </Badge>
              {stats.isValid && (
                <Badge
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 bg-cyan-500/10 px-2.5 py-1.5 text-xs text-cyan-200 sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2"
                >
                  🌲 Depth: {stats.objDepth}
                </Badge>
              )}
            </div>

            <Badge
              variant={stats.isValid ? 'success' : 'destructive'}
              size="sm"
              className={`animate-pulse px-2.5 py-1.5 text-xs font-semibold sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 ${
                stats.isValid
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50'
              }`}
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
            <CodeMirror
              value={value}
              height="400px"
              theme="dark"
              extensions={[json()]}
              onChange={(val) => setValue(val)}
              className="text-sm sm:text-base"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
              }}
            />
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
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-2xl hover:shadow-pink-500/60 sm:px-4 sm:py-2.5 md:px-6 md:py-3 md:text-base"
                >
                  <Sparkles className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  Beautify
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-foreground">Format JSON with indentation (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={handleMinify}
                  className="border-2 border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-2 text-sm font-semibold text-blue-100 hover:scale-105 hover:border-blue-500/70 hover:from-blue-500/30 hover:to-cyan-500/30 hover:text-white sm:px-4 sm:py-2.5 md:px-6 md:py-3 md:text-base"
                >
                  <Minimize2 className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  Minify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-foreground">Compress JSON to single line (Ctrl+M)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="border-2 border-purple-500/50 bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-100 hover:scale-105 hover:border-purple-500/70 hover:bg-purple-500/20 hover:text-white sm:px-4 sm:py-2.5 md:px-6 md:py-3 md:text-base"
                >
                  <Copy className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-foreground">Copy to clipboard (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!stats.isValid}
                  className="border-2 border-pink-500/50 bg-pink-500/10 px-3 py-2 text-sm font-semibold text-pink-100 hover:scale-105 hover:border-pink-500/70 hover:bg-pink-500/20 hover:text-white disabled:opacity-50 sm:px-4 sm:py-2.5 md:px-6 md:py-3 md:text-base"
                >
                  <Download className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-foreground">Download as .json file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}
