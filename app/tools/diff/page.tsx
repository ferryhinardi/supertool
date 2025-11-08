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
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { RelatedTools } from '@/components/ui/related-tools'
import { Textarea } from '@/components/ui/textarea'
import { css } from '@/styled-system/css'

// Dynamically import the diff viewer to avoid SSR issues
const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
  ssr: false,
  loading: () => (
    <div
      className={css({
        display: 'flex',
        h: '64',
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <div className={css({ color: 'gray.400' })}>Loading diff viewer...</div>
    </div>
  ),
})

type DiffViewType = 'split' | 'unified'
type ContentType = 'text' | 'json'

const faqs = [
  {
    question: 'How do I compare two text or code files?',
    answer:
      'Paste your original text in the left panel and modified text in the right panel, then click Compare. The diff viewer will highlight additions in green, deletions in red, and unchanged lines in gray. You can switch between split view (side-by-side) and unified view (single column) for easier comparison.',
  },
  {
    question: 'What is the difference between split view and unified view?',
    answer:
      'Split view displays both texts side-by-side with synchronized scrolling, making it easy to see changes at a glance. Unified view combines both texts in a single column with +/- prefixes (like Git diffs), which is more compact and better for reviewing sequential changes or on smaller screens.',
  },
  {
    question: 'Does this diff tool support syntax highlighting for code?',
    answer:
      'Yes! Our diff viewer automatically detects and applies syntax highlighting for popular programming languages including JavaScript, TypeScript, Python, Java, C++, PHP, Ruby, Go, and many more. This makes code comparison clearer by color-coding keywords, strings, comments, and other syntax elements.',
  },
  {
    question: 'Can I compare JSON files with this tool?',
    answer:
      'Absolutely! The diff tool has special JSON formatting support that beautifies and validates JSON before comparison. This ensures accurate structural comparison even if the original JSON has different formatting or whitespace. It highlights object key changes, value modifications, and array differences.',
  },
  {
    question: 'Is my code or text data safe when using this diff tool?',
    answer:
      'Yes, your data is completely safe. All comparison happens entirely in your browser using JavaScript. No text, code, or files are uploaded to any server or stored anywhere. Your data never leaves your device, ensuring complete privacy and security for sensitive code or confidential information.',
  },
]

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
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'orange.500/30',
            bg: 'orange.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <GitCompare className={css({ h: '5', w: '5', color: 'orange.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'orange.300' })}>
            Side-by-Side Comparison
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'orange.400',
            gradientVia: 'red.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Diff Viewer
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Compare text, JSON, or code side-by-side like GitHub PR reviews. Instantly visualize
          changes with syntax highlighting.
        </p>
      </div>

      {/* Controls */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'orange.500/20',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Configure your diff view and actions</CardDescription>
        </CardHeader>
        <CardContent className={css({ spaceY: '4' })}>
          {/* View Type */}
          <div>
            <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              View Type
            </div>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', mt: '2' })}>
              <Button
                variant={viewType === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('split')}
                className={css({ gap: '2' })}
              >
                <SplitSquareHorizontal className={css({ h: '4', w: '4' })} />
                Split View
              </Button>
              <Button
                variant={viewType === 'unified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType('unified')}
                className={css({ gap: '2' })}
              >
                <AlignJustify className={css({ h: '4', w: '4' })} />
                Unified View
              </Button>
            </div>
          </div>

          {/* Content Type */}
          <div>
            <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              Content Type
            </div>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', mt: '2' })}>
              <Button
                variant={contentType === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('text')}
                className={css({ gap: '2' })}
              >
                <FileText className={css({ h: '4', w: '4' })} />
                Plain Text
              </Button>
              <Button
                variant={contentType === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContentType('json')}
                className={css({ gap: '2' })}
              >
                <Code2 className={css({ h: '4', w: '4' })} />
                JSON
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
              Actions
            </div>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', mt: '2' })}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className={css({ gap: '2' })}
              >
                <RotateCcw className={css({ h: '4', w: '4' })} />
                Swap Sides
              </Button>
              {contentType === 'json' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFormatJSON('old')}
                    className={css({ gap: '2' })}
                  >
                    Format Old
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFormatJSON('new')}
                    className={css({ gap: '2' })}
                  >
                    Format New
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyDiff}
                className={css({ gap: '2' })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className={css({ gap: '2' })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className={css({ gap: '2' })}
              >
                <RotateCcw className={css({ h: '4', w: '4' })} />
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
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          w: 'full',
        })}
      >
        {/* Old/Original */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'red.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            w: 'full',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '3',
                flexWrap: 'wrap',
              })}
            >
              <CardTitle className={css({ color: 'gray.100' })}>Original (Old)</CardTitle>
              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                <Badge
                  className={css({
                    bg: stats.oldValid ? 'green.500/20' : 'red.500/20',
                    color: stats.oldValid ? 'green.300' : 'red.300',
                    border: '1px solid',
                    borderColor: stats.oldValid ? 'green.500/30' : 'red.500/30',
                  })}
                >
                  {contentType === 'json' ? (stats.oldValid ? 'Valid' : 'Invalid') : 'Text'}
                </Badge>
                <Badge
                  className={css({
                    bg: 'gray.800',
                    color: 'gray.300',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  {stats.oldLines} lines • {stats.oldChars} chars
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={oldValue}
              onChange={(e) => setOldValue(e.target.value)}
              placeholder="Paste original content here..."
              className={css({
                fontFamily: 'mono',
                fontSize: 'sm',
                minH: '300px',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
              })}
            />
          </CardContent>
        </Card>

        {/* New/Modified */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'green.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            w: 'full',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '3',
                flexWrap: 'wrap',
              })}
            >
              <CardTitle className={css({ color: 'gray.100' })}>Modified (New)</CardTitle>
              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                <Badge
                  className={css({
                    bg: stats.newValid ? 'green.500/20' : 'red.500/20',
                    color: stats.newValid ? 'green.300' : 'red.300',
                    border: '1px solid',
                    borderColor: stats.newValid ? 'green.500/30' : 'red.500/30',
                  })}
                >
                  {contentType === 'json' ? (stats.newValid ? 'Valid' : 'Invalid') : 'Text'}
                </Badge>
                <Badge
                  className={css({
                    bg: 'gray.800',
                    color: 'gray.300',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  {stats.newLines} lines • {stats.newChars} chars
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Paste modified content here..."
              className={css({
                fontFamily: 'mono',
                fontSize: 'sm',
                minH: '300px',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700',
              })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {(oldValue || newValue) && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            w: 'full',
          })}
        >
          <CardHeader>
            <CardTitle>Comparison Stats</CardTitle>
            <CardDescription>Overview of changes between old and new content</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gap: '3',
                gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                w: 'full',
              })}
            >
              <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '4' })}>
                <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                  Lines Changed
                </div>
                <div
                  className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color:
                      stats.linesDiff > 0
                        ? 'green.400'
                        : stats.linesDiff < 0
                          ? 'red.400'
                          : 'gray.400',
                  })}
                >
                  {stats.linesDiff > 0 ? '+' : ''}
                  {stats.linesDiff}
                </div>
              </div>
              <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '4' })}>
                <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                  Characters Changed
                </div>
                <div
                  className={css({
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color:
                      stats.charsDiff > 0
                        ? 'green.400'
                        : stats.charsDiff < 0
                          ? 'red.400'
                          : 'gray.400',
                  })}
                >
                  {stats.charsDiff > 0 ? '+' : ''}
                  {stats.charsDiff}
                </div>
              </div>
              <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '4' })}>
                <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                  Old Content
                </div>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'red.400' })}>
                  {stats.oldLines} lines
                </div>
              </div>
              <div className={css({ rounded: 'lg', bg: 'gray.800/50', p: '4' })}>
                <div className={css({ fontSize: 'sm', color: 'gray.400', mb: '1' })}>
                  New Content
                </div>
                <div className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'green.400' })}>
                  {stats.newLines} lines
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff Viewer */}
      {(oldValue || newValue) && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
            w: 'full',
          })}
        >
          <CardHeader>
            <CardTitle>Diff Preview</CardTitle>
            <CardDescription>
              {viewType === 'split' ? 'Side-by-side' : 'Unified'} view •{' '}
              {contentType === 'json' ? 'JSON' : 'Text'} mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ overflow: 'auto', rounded: 'lg' })}>
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

      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/diff" category="development" />
    </main>
  )
}
