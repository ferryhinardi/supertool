"use client"

import { useState, useMemo, useEffect } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Sparkles, Minimize2, Copy, Download, FileJson } from "lucide-react"

export default function JSONBeautifyPage() {
  const [value, setValue] = useState("{\n  \"example\": true,\n  \"message\": \"Welcome to SuperTool!\"\n}")
  const [isValidJSON, setIsValidJSON] = useState(true)

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
      const getDepth = (obj: any): number => {
        if (obj == null || typeof obj !== 'object') return 0
        return 1 + Math.max(0, ...Object.values(obj).map(v => getDepth(v)))
      }
      objDepth = getDepth(parsed)
    } catch {
      isValid = false
    }

    return { lines, chars, isValid, objDepth }
  }, [value])

  useEffect(() => {
    setIsValidJSON(stats.isValid)
  }, [stats.isValid])

  const handleBeautify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj, null, 2))
      toast.success("JSON beautified successfully 🎉")
    } catch (err) {
      toast.error("Invalid JSON format ⚠️")
    }
  }

  const handleMinify = () => {
    try {
      const obj = JSON.parse(value)
      setValue(JSON.stringify(obj))
      toast.success("JSON minified ✅")
    } catch (err) {
      toast.error("Invalid JSON format ⚠️")
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    toast.success("Copied to clipboard 📋")
  }

  const handleDownload = () => {
    if (!isValidJSON) {
      toast.error("Cannot download invalid JSON")
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
    toast.success("JSON file downloaded 📥")
  }

  return (
    <TooltipProvider>
      <main className="max-w-6xl mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 shadow-lg shadow-purple-500/50 animate-pulse" style={{ animationDuration: '2s' }}>
              <FileJson className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">JSON Beautifier</h1>
              <p className="text-gray-400 text-sm">Format, validate, and manage JSON data</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass-card border-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" size="sm">
                {stats.lines} lines
              </Badge>
              <Badge variant="outline" size="sm">
                {stats.chars.toLocaleString()} chars
              </Badge>
              {isValidJSON && (
                <Badge variant="outline" size="sm">
                  Depth: {stats.objDepth}
                </Badge>
              )}
            </div>
            
            <Badge 
              variant={isValidJSON ? "success" : "destructive"}
              size="sm"
              className="animate-pulse"
            >
              {isValidJSON ? "✅ Valid JSON" : "❌ Invalid JSON"}
            </Badge>
          </div>
        </div>

        {/* Editor */}
        <div className="glass-card border-gray-800/50 rounded-xl overflow-hidden shadow-2xl">
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
        <div className="glass-card border-gray-800/50 p-4 rounded-xl">
          <div className="flex flex-wrap gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleBeautify}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Beautify
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
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
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
                >
                  <Copy className="w-4 h-4 mr-2" />
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
                  disabled={!isValidJSON}
                >
                  <Download className="w-4 h-4 mr-2" />
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
