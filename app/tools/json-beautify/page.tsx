'use client'

import { useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Sparkles, Minimize2, Copy, Download, FileJson } from 'lucide-react'

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
    } catch {
      toast.error('Invalid JSON format ⚠️')
    }
  }

  const handleMinify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj))
      toast.success('JSON minified ✅')
    } catch {
      toast.error('Invalid JSON format ⚠️')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard 📋')
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
  }

  return (
    <TooltipProvider>
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div
              className="animate-pulse rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-4 shadow-2xl shadow-purple-500/60"
              style={{ animationDuration: '2s' }}
            >
              <FileJson className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-300 via-pink-400 to-blue-300 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-lg md:text-5xl">
                JSON Beautifier
              </h1>
              <p className="text-base text-gray-300 md:text-lg">
                Format, validate, and manage JSON data
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass-card rounded-2xl border-2 border-purple-500/30 p-6 shadow-xl shadow-purple-500/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Badge
                variant="outline"
                size="sm"
                className="border-purple-500/50 bg-purple-500/10 px-4 py-2 text-sm text-purple-300"
              >
                📏 {stats.lines} lines
              </Badge>
              <Badge
                variant="outline"
                size="sm"
                className="border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm text-blue-300"
              >
                📝 {stats.chars.toLocaleString()} chars
              </Badge>
              {stats.isValid && (
                <Badge
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300"
                >
                  🌲 Depth: {stats.objDepth}
                </Badge>
              )}
            </div>

            <Badge
              variant={stats.isValid ? 'success' : 'destructive'}
              size="sm"
              className={`animate-pulse px-4 py-2 text-sm font-semibold ${
                stats.isValid
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/50'
              }`}
            >
              {stats.isValid ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </Badge>
          </div>
        </div>

        {/* Editor */}
        <div className="glass-card overflow-hidden rounded-2xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/30">
          <CodeMirror
            value={value}
            height="550px"
            theme="dark"
            extensions={[json()]}
            onChange={(val) => setValue(val)}
            className="text-base"
          />
        </div>

        {/* Action Buttons */}
        <div className="glass-card rounded-2xl border-2 border-purple-500/30 p-6 shadow-xl shadow-purple-500/20">
          <div className="flex flex-wrap gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBeautify}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-6 py-6 text-base font-semibold shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-2xl hover:shadow-pink-500/60"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Beautify
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format JSON with indentation (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={handleMinify}
                  className="border-2 border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-6 text-base font-semibold hover:scale-105 hover:border-blue-500/70 hover:from-blue-500/30 hover:to-cyan-500/30"
                >
                  <Minimize2 className="mr-2 h-5 w-5" />
                  Minify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compress JSON to single line (Ctrl+M)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="border-2 border-purple-500/50 bg-purple-500/10 px-6 py-6 text-base font-semibold hover:scale-105 hover:border-purple-500/70 hover:bg-purple-500/20"
                >
                  <Copy className="mr-2 h-5 w-5" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy to clipboard (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!stats.isValid}
                  className="border-2 border-pink-500/50 bg-pink-500/10 px-6 py-6 text-base font-semibold hover:scale-105 hover:border-pink-500/70 hover:bg-pink-500/20 disabled:opacity-50"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as .json file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </main>
    </TooltipProvider>
  )
}
