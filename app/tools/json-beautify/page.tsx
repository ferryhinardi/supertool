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
      <main className="mx-auto max-w-6xl space-y-6 py-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="animate-pulse rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-3 shadow-lg shadow-purple-500/50"
              style={{ animationDuration: '2s' }}
            >
              <FileJson className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
                JSON Beautifier
              </h1>
              <p className="text-sm text-gray-400">Format, validate, and manage JSON data</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass-card rounded-xl border-gray-800/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" size="sm">
                {stats.lines} lines
              </Badge>
              <Badge variant="outline" size="sm">
                {stats.chars.toLocaleString()} chars
              </Badge>
              {stats.isValid && (
                <Badge variant="outline" size="sm">
                  Depth: {stats.objDepth}
                </Badge>
              )}
            </div>

            <Badge
              variant={stats.isValid ? 'success' : 'destructive'}
              size="sm"
              className="animate-pulse"
            >
              {stats.isValid ? '✅ Valid JSON' : '❌ Invalid JSON'}
            </Badge>
          </div>
        </div>

        {/* Editor */}
        <div className="glass-card overflow-hidden rounded-xl border-gray-800/50 shadow-2xl">
          <CodeMirror
            value={value}
            height="500px"
            theme="dark"
            extensions={[json()]}
            onChange={(val) => setValue(val)}
            className="text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="glass-card rounded-xl border-gray-800/50 p-4">
          <div className="flex flex-wrap gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleBeautify}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/60"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Beautify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format JSON with indentation (Ctrl+B)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" onClick={handleMinify}>
                  <Minimize2 className="mr-2 h-4 w-4" />
                  Minify
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compress JSON to single line (Ctrl+M)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy to clipboard (Ctrl+C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleDownload} disabled={!stats.isValid}>
                  <Download className="mr-2 h-4 w-4" />
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
