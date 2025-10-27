'use client'

import {
  AlignJustify,
  Code2,
  Copy,
  Download,
  FileText,
  GitCompare,
  RotateCcw,
  SplitSquareHorizontal,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { css } from '@/styled-system/css'

// Dynamically import the diff viewer to avoid SSR issues
const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center">
      <div className="text-gray-400">Loading diff viewer...</div>
    </div>
  ),
})

type DiffViewType = 'split' | 'unified'
type ContentType = 'text' | 'json'

export default function DiffTool() {
  const [oldValue, setOldValue] = useState('')
  const [newValue, setNewValue] = useState('')
  const [viewType, setViewType] = useState<DiffViewType>('split')
  const [contentType, setContentType] = useState<ContentType>('text')

  // Stats and validation
  const stats = useMemo(() => {
    const oldLines = oldValue.split('\n').length
    const newLines = newValue.split('\n').length
    const oldChars = oldValue.length
    const newChars = newValue.length

    let oldValid = true
    let newValid = true

    if (contentType === 'json') {
      try {
        if (oldValue) JSON.parse(oldValue)
      } catch {
        oldValid = false
      }
      try {
        if (newValue) JSON.parse(newValue)
      } catch {
        newValid = false
      }
    }

    return {
      oldLines,
      newLines,
      oldChars,
      newChars,
      oldValid,
      newValid,
      linesDiff: newLines - oldLines,
      charsDiff: newChars - oldChars,
    }
  }, [oldValue, newValue, contentType])

  // Format JSON
  const handleFormatJSON = (side: 'old' | 'new') => {
    try {
      const value = side === 'old' ? oldValue : newValue
      if (!value) {
        toast.error('No content to format')
        return
      }

      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)

      if (side === 'old') {
        setOldValue(formatted)
      } else {
        setNewValue(formatted)
      }

      toast.success('JSON formatted successfully! ✨')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON'
      toast.error(`Failed to format: ${errorMessage}`)
    }
  }

  // Swap sides
  const handleSwap = () => {
    const temp = oldValue
    setOldValue(newValue)
    setNewValue(temp)
    toast.success('Sides swapped! 🔄')
  }

  // Reset
  const handleReset = () => {
    setOldValue('')
    setNewValue('')
    toast.info('Content cleared')
  }

  // Copy diff result
  const handleCopyDiff = () => {
    const diffText = `=== OLD ===\n${oldValue}\n\n=== NEW ===\n${newValue}`
    navigator.clipboard.writeText(diffText)
    toast.success('Diff copied to clipboard! 📋')
  }

  // Download diff
  const handleDownload = () => {
    const diffText = `=== OLD ===\n${oldValue}\n\n=== NEW ===\n${newValue}`
    const blob = new Blob([diffText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Diff downloaded! 📥')
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', md: '8' },
      })}
    >
      {/* Header */}
      <div className={css({ spaceY: '3' })}>
        <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
          <div
            className={css({
              animation: 'pulse 2s infinite',
              rounded: '2xl',
              bgGradient: 'to-br',
              gradientFrom: 'orange.600',
              gradientVia: 'red.600',
              gradientTo: 'pink.700',
              p: { base: '3', sm: '4' },
              shadow: '2xl',
              boxShadow: '0 25px 50px -12px rgba(251, 146, 60, 0.6)',
            })}
          >
            <GitCompare
              className={css({
                h: { base: '7', sm: '8' },
                w: { base: '7', sm: '8' },
                color: 'white',
              })}
            />
          </div>
          <div>
            <h1
              className={css({
                fontSize: { base: '3xl', md: '4xl', lg: '5xl' },
                fontWeight: 'extrabold',
                color: 'orange.400',
                textShadow: '0 10px 15px rgba(0, 0, 0, 0.3)',
              })}
            >
              Diff Viewer
            </h1>
            <p
              className={css({ fontSize: { base: 'sm', md: 'base', lg: 'lg' }, color: 'gray.300' })}
            >
              Compare text, JSON, or code side-by-side like GitHub PR reviews
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card
        className={css({
          border: '2px solid',
          borderColor: 'orange.500/30',
          bg: 'rgba(249, 115, 22, 0.05)',
          shadow: '2xl',
          boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.2)',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <div
            className={css({ spaceY: { base: '1', sm: '2' }, p: { base: '4', sm: '5', md: '6' } })}
          >
            <CardTitle className={css({ fontSize: 'xl', color: 'white' })}>Controls</CardTitle>
            <CardDescription>Configure your diff view</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className={css({ spaceY: '4', p: { base: '4', sm: '5', md: '6' } })}>
            {/* View Type */}
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              <Button
                variant={viewType === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('split')}
                className="gap-2"
              >
                <SplitSquareHorizontal className="h-4 w-4" />
                Split View
              </Button>
              <Button
                variant={viewType === 'unified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('unified')}
                className="gap-2"
              >
                <AlignJustify className="h-4 w-4" />
                Unified View
              </Button>
            </div>

            {/* Content Type */}
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              <Button
                variant={contentType === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('text')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Plain Text
              </Button>
              <Button
                variant={contentType === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('json')}
                className="gap-2"
              >
                <Code2 className="h-4 w-4" />
                JSON
              </Button>
            </div>

            {/* Actions */}
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              <Button variant="outline" size="sm" onClick={handleSwap} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Swap Sides
              </Button>
              {contentType === 'json' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFormatJSON('old')}
                    className="gap-2"
                  >
                    Format Old
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFormatJSON('new')}
                    className="gap-2"
                  >
                    Format New
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleCopyDiff} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Areas */}
      <div
        className={css({
          display: 'grid',
          gap: '4',
          gridTemplateColumns: { base: '1', md: 'repeat(2, 1fr)' },
        })}
      >
        {/* Old/Original */}
        <Card className="glass-card border-2 border-red-500/30 shadow-xl shadow-red-500/20">
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <CardTitle className="text-lg text-white">Original (Old)</CardTitle>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Badge variant={stats.oldValid ? 'success' : 'destructive'}>
                    {contentType === 'json' ? (stats.oldValid ? 'Valid' : 'Invalid') : 'Text'}
                  </Badge>
                  <Badge variant="info">
                    {stats.oldLines} lines • {stats.oldChars} chars
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <Textarea
                value={oldValue}
                onChange={(e) => setOldValue(e.target.value)}
                placeholder="Paste original content here..."
                className="font-mono text-sm"
                rows={12}
              />
            </div>
          </CardContent>
        </Card>

        {/* New/Modified */}
        <Card className="glass-card border-2 border-green-500/30 shadow-xl shadow-green-500/20">
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <CardTitle className="text-lg text-white">Modified (New)</CardTitle>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Badge variant={stats.newValid ? 'success' : 'destructive'}>
                    {contentType === 'json' ? (stats.newValid ? 'Valid' : 'Invalid') : 'Text'}
                  </Badge>
                  <Badge variant="info">
                    {stats.newLines} lines • {stats.newChars} chars
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <Textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Paste modified content here..."
                className="font-mono text-sm"
                rows={12}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {(oldValue || newValue) && (
        <Card className="glass-card border-2 border-blue-500/30 shadow-xl shadow-blue-500/20">
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <CardTitle className="text-lg text-white">Comparison Stats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <div
                className={css({
                  display: 'grid',
                  gap: '3',
                  gridTemplateColumns: { base: '1', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                })}
              >
                <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '3' })}>
                  <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Lines Changed</div>
                  <div
                    className={`text-2xl font-bold ${stats.linesDiff > 0 ? 'text-green-400' : stats.linesDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}
                  >
                    {stats.linesDiff > 0 ? '+' : ''}
                    {stats.linesDiff}
                  </div>
                </div>
                <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '3' })}>
                  <div className={css({ fontSize: 'sm', color: 'gray.400' })}>
                    Characters Changed
                  </div>
                  <div
                    className={`text-2xl font-bold ${stats.charsDiff > 0 ? 'text-green-400' : stats.charsDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}
                  >
                    {stats.charsDiff > 0 ? '+' : ''}
                    {stats.charsDiff}
                  </div>
                </div>
                <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '3' })}>
                  <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Old Content</div>
                  <div className="text-2xl font-bold text-red-400">{stats.oldLines} lines</div>
                </div>
                <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '3' })}>
                  <div className={css({ fontSize: 'sm', color: 'gray.400' })}>New Content</div>
                  <div className="text-2xl font-bold text-green-400">{stats.newLines} lines</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff Viewer */}
      {(oldValue || newValue) && (
        <Card className="glass-card border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <CardHeader>
            <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
              <CardTitle className="text-lg text-white">Diff Preview</CardTitle>
              <CardDescription>
                {viewType === 'split' ? 'Side-by-side' : 'Unified'} view •{' '}
                {contentType === 'json' ? 'JSON' : 'Text'} mode
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ overflow: 'auto' })}>
              <ReactDiffViewer
                oldValue={oldValue}
                newValue={newValue}
                splitView={viewType === 'split'}
                useDarkTheme={true}
                showDiffOnly={false}
                hideLineNumbers={false}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: '#1a1a2e',
                      diffViewerColor: '#e0e0e0',
                      addedBackground: '#044B53',
                      addedColor: '#8cc68c',
                      removedBackground: '#632F34',
                      removedColor: '#e88388',
                      wordAddedBackground: '#055d67',
                      wordRemovedBackground: '#7d383f',
                      addedGutterBackground: '#034148',
                      removedGutterBackground: '#632b30',
                      gutterBackground: '#1a1a2e',
                      gutterBackgroundDark: '#151521',
                      highlightBackground: '#2a2a3e',
                      highlightGutterBackground: '#2d2d44',
                    },
                  },
                  line: {
                    fontSize: '14px',
                    fontFamily: 'ui-monospace, monospace',
                    padding: '4px 8px',
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
