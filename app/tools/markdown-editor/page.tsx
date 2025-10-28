'use client'

import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  FileText,
  Github,
  RotateCcw,
  SplitSquareHorizontal,
  Upload,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { css } from '@/styled-system/css'

type ViewMode = 'split' | 'editor' | 'preview'

const defaultMarkdown = `# Welcome to Markdown Editor & Preview

## Features

This is a **GitHub-flavored** markdown editor with live preview support!

### What you can do:
- ✅ Write markdown with syntax highlighting
- ✅ Preview in real-time
- ✅ Support for tables, task lists, and more
- ✅ Export to HTML or Markdown
- ✅ Copy formatted content

## Code Syntax Highlighting

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

greet('Developer');
\`\`\`

\`\`\`python
def calculate_sum(a, b):
    """Calculate the sum of two numbers"""
    return a + b

result = calculate_sum(10, 20)
print(f"Result: {result}")
\`\`\`

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown Preview | ✅ Done | High |
| Syntax Highlight | ✅ Done | High |
| Export | ✅ Done | Medium |
| Auto-save | 🔄 Coming | Low |

## Task Lists

- [x] Create markdown editor
- [x] Add live preview
- [x] Support GFM (GitHub Flavored Markdown)
- [ ] Add collaborative editing
- [ ] Add version history

## Blockquotes

> This is a blockquote.
> 
> You can use it for important notes or quotes.

## Links and Images

Check out [GitHub](https://github.com) for more markdown tips!

---

**Bold text**, *italic text*, ~~strikethrough~~, and \`inline code\`.

Happy writing! 🚀
`

export default function MarkdownEditorPage() {
  const [value, setValue] = useState(defaultMarkdown)
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  // Calculate stats
  const stats = useMemo(() => {
    const lines = value.split('\n').length
    const chars = value.length
    const words = value.trim().split(/\s+/).filter(Boolean).length
    const headings = (value.match(/^#{1,6}\s/gm) || []).length
    const codeBlocks = (value.match(/```/g) || []).length / 2
    const links = (value.match(/\[.*?\]\(.*?\)/g) || []).length
    const images = (value.match(/!\[.*?\]\(.*?\)/g) || []).length
    const tables = (value.match(/\|.*\|/g) || []).length > 0 ? 1 : 0
    const taskLists = (value.match(/^- \[[ x]\]/gm) || []).length

    return {
      lines,
      chars,
      words,
      headings,
      codeBlocks,
      links,
      images,
      tables,
      taskLists,
    }
  }, [value])

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(value)
    toast.success('Markdown copied to clipboard! 📋')
  }, [value])

  const handleCopyHTML = useCallback(() => {
    const tempDiv = document.createElement('div')
    const container = document.querySelector('.markdown-preview')
    if (container) {
      tempDiv.innerHTML = container.innerHTML
      navigator.clipboard.writeText(tempDiv.innerHTML)
      toast.success('HTML copied to clipboard! 📋')
    }
  }, [])

  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Markdown downloaded! 💾')
  }, [value])

  const handleDownloadHTML = useCallback(() => {
    const container = document.querySelector('.markdown-preview')
    if (container) {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <style>
        body { 
            max-width: 980px; 
            margin: 0 auto; 
            padding: 45px;
            background: #0d1117;
        }
        .markdown-body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <article class="markdown-body">
        ${container.innerHTML}
    </article>
</body>
</html>`

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.html'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('HTML downloaded! 💾')
    }
  }, [])

  const handleReset = useCallback(() => {
    setValue(defaultMarkdown)
    toast.info('Reset to default template! 🔄')
  }, [])

  const handleLoadFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          setValue(content)
          toast.success(`Loaded ${file.name}! 📄`)
        }
        reader.readAsText(file)
      } else {
        toast.error('Please select a .md or .markdown file! ⚠️')
      }
    }
  }, [])

  return (
    <>
      {/* Highlight.js GitHub Dark Theme Styles */}
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for syntax highlighting CSS
        dangerouslySetInnerHTML={{
          __html: `
        pre code.hljs { display: block; overflow-x: auto; padding: 1em; }
        code.hljs { padding: 3px 5px; }
        .hljs { color: #c9d1d9; background: #0d1117; }
        .hljs-doctag, .hljs-keyword, .hljs-meta .hljs-keyword, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-variable.language_ { color: #ff7b72; }
        .hljs-title, .hljs-title.class_, .hljs-title.class_.inherited__, .hljs-title.function_ { color: #d2a8ff; }
        .hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id, .hljs-variable { color: #79c0ff; }
        .hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #a5d6ff; }
        .hljs-built_in, .hljs-symbol { color: #ffa657; }
        .hljs-code, .hljs-comment, .hljs-formula { color: #8b949e; }
        .hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag { color: #7ee787; }
        .hljs-subst { color: #c9d1d9; }
        .hljs-section { color: #1f6feb; font-weight: 700; }
        .hljs-bullet { color: #f2cc60; }
        .hljs-emphasis { color: #c9d1d9; font-style: italic; }
        .hljs-strong { color: #c9d1d9; font-weight: 700; }
        .hljs-addition { color: #aff5b4; background-color: #033a16; }
        .hljs-deletion { color: #ffdcd7; background-color: #67060c; }
      `,
        }}
      />

      <div
        className={css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minH: '100vh',
          mx: 'auto',
          maxW: '1400px',
          w: 'full',
          px: { base: '4', sm: '6', md: '8' },
          py: { base: '6', sm: '8', md: '10' },
          gap: { base: '6', sm: '6', md: '8' },
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            flexDirection: { base: 'column', md: 'row' },
            alignItems: { base: 'start', md: 'start' },
            justifyContent: { base: 'start', md: 'space-between' },
            gap: { base: '4', md: '4' },
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'center', gap: '4' })}>
            <div
              className={css({
                display: 'flex',
                h: { base: '12', sm: '14' },
                w: { base: '12', sm: '14' },
                alignItems: 'center',
                justifyContent: 'center',
                rounded: '2xl',
                bgGradient: 'to-br',
                gradientFrom: 'green.500',
                gradientTo: 'emerald.600',
                shadow: 'lg',
                boxShadow: '0 10px 15px rgba(34, 197, 94, 0.3)',
              })}
            >
              <FileText
                className={css({
                  h: { base: '6', sm: '7' },
                  w: { base: '6', sm: '7' },
                  color: 'white',
                })}
              />
            </div>
            <div>
              <h1
                className={css({
                  fontSize: { base: '2xl', sm: '3xl' },
                  fontWeight: 'bold',
                  color: 'white',
                })}
              >
                Markdown Editor & Preview
              </h1>
              <p
                className={css({
                  mt: '1',
                  fontSize: { base: 'sm', sm: 'base' },
                  color: 'gray.400',
                })}
              >
                GitHub-flavored markdown with live preview and syntax highlighting
              </p>
            </div>
          </div>

          {/* View Mode Controls */}
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
            <Button
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('editor')}
              className="gap-2"
            >
              <Code2 className="h-4 w-4" />
              Editor Only
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="gap-2"
            >
              <SplitSquareHorizontal className="h-4 w-4" />
              Split View
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Only
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bg: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(8px)',
          })}
        >
          <CardContent>
            <div
              className={css({
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '3',
                p: { base: '4', sm: '5' },
              })}
            >
              <Badge variant="outline" className="gap-1.5 border-green-500/30 text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                {stats.lines} lines
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-blue-500/30 text-blue-400">
                {stats.words} words
              </Badge>
              <Badge variant="outline" className="gap-1.5 border-purple-500/30 text-purple-400">
                {stats.chars} characters
              </Badge>
              {stats.headings > 0 && (
                <Badge variant="outline" className="gap-1.5 border-orange-500/30 text-orange-400">
                  {stats.headings} headings
                </Badge>
              )}
              {stats.codeBlocks > 0 && (
                <Badge variant="outline" className="gap-1.5 border-cyan-500/30 text-cyan-400">
                  <Code2 className="h-3 w-3" />
                  {stats.codeBlocks} code blocks
                </Badge>
              )}
              {stats.links > 0 && (
                <Badge variant="outline" className="gap-1.5 border-pink-500/30 text-pink-400">
                  {stats.links} links
                </Badge>
              )}
              {stats.images > 0 && (
                <Badge variant="outline" className="gap-1.5 border-yellow-500/30 text-yellow-400">
                  {stats.images} images
                </Badge>
              )}
              {stats.taskLists > 0 && (
                <Badge variant="outline" className="gap-1.5 border-green-500/30 text-green-400">
                  ✓ {stats.taskLists} tasks
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <span>
                <Upload className="h-4 w-4" />
                Load File
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".md,.markdown"
              className="hidden"
              onChange={handleLoadFile}
            />
          </label>
          <Button variant="outline" size="sm" onClick={handleCopyMarkdown} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyHTML} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy HTML
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} className="gap-2">
            <Download className="h-4 w-4" />
            Download .md
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadHTML} className="gap-2">
            <Download className="h-4 w-4" />
            Download .html
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Editor and Preview */}
        <div
          className={css({
            display: 'grid',
            flex: '1',
            gap: { base: '6', lg: '6' },
            gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
            w: 'full',
          })}
        >
          {/* Editor */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'rgba(17, 24, 39, 0.5)',
                backdropFilter: 'blur(8px)',
                w: 'full',
              })}
            >
              <CardHeader>
                <div className={css({ spaceY: '2', p: { base: '4', sm: '5', md: '6' } })}>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Code2 className={css({ h: '5', w: '5', color: 'green.500' })} />
                    Markdown Editor
                  </CardTitle>
                  <CardDescription>
                    Write your markdown content using GitHub-flavored syntax
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                  <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Start typing markdown here..."
                    className="min-h-[600px] resize-none border-gray-700 bg-gray-950 font-mono text-gray-100 focus:ring-green-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'rgba(17, 24, 39, 0.5)',
                backdropFilter: 'blur(8px)',
              })}
            >
              <CardHeader>
                <div className={css({ spaceY: '2', p: { base: '4', sm: '5', md: '6' } })}>
                  <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Eye className={css({ h: '5', w: '5', color: 'emerald.500' })} />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See how your markdown will be rendered with GitHub styling
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className={css({ p: { base: '4', sm: '5', md: '6' } })}>
                  <div className="markdown-preview prose prose-invert min-h-[600px] w-max max-w-none overflow-auto rounded-lg border border-gray-700 bg-gray-950 p-6">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      components={{
                        // Custom component styling
                        h1: ({ ...props }) => (
                          <h1
                            className="mb-4 border-b border-gray-700 pb-2 text-3xl font-bold"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="mt-6 mb-3 border-b border-gray-800 pb-2 text-2xl font-bold"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3 className="mt-5 mb-2 text-xl font-bold" {...props} />
                        ),
                        a: ({ ...props }) => (
                          <a
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                            {...props}
                          />
                        ),
                        code: ({ className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <code
                              className="rounded bg-gray-800 px-1.5 py-0.5 text-sm text-pink-400"
                              {...props}
                            >
                              {children}
                            </code>
                          )
                        },
                        pre: ({ ...props }) => (
                          <pre
                            className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-4"
                            {...props}
                          />
                        ),
                        table: ({ ...props }) => (
                          <div className="overflow-x-auto">
                            <table
                              className="min-w-full border-collapse border border-gray-700"
                              {...props}
                            />
                          </div>
                        ),
                        th: ({ ...props }) => (
                          <th
                            className="border border-gray-700 bg-gray-800 px-4 py-2 text-left font-bold"
                            {...props}
                          />
                        ),
                        td: ({ ...props }) => (
                          <td className="border border-gray-700 px-4 py-2" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-600 pl-4 text-gray-400 italic"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => <ul className="list-disc pl-6" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal pl-6" {...props} />,
                        li: ({ children, ...props }) => {
                          // Check if this is a task list item
                          const firstChild = Array.isArray(children) ? children[0] : null
                          if (
                            firstChild &&
                            typeof firstChild === 'object' &&
                            'props' in firstChild
                          ) {
                            const input = firstChild.props?.children?.[0]
                            if (input?.type === 'input' && input?.props?.type === 'checkbox') {
                              return (
                                <li className="flex list-none items-center gap-2" {...props}>
                                  <input
                                    type="checkbox"
                                    checked={input.props.checked}
                                    disabled
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-800"
                                  />
                                  <span>{firstChild.props.children.slice(1)}</span>
                                </li>
                              )
                            }
                          }
                          return <li {...props}>{children}</li>
                        },
                        hr: ({ ...props }) => <hr className="my-4 border-gray-700" {...props} />,
                      }}
                    >
                      {value}
                    </ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            bgGradient: 'to-r',
            gradientFrom: 'green.500/10',
            gradientTo: 'emerald.500/10',
          })}
        >
          <CardContent>
            <div
              className={css({
                display: 'flex',
                alignItems: 'start',
                gap: '4',
                p: { base: '5', sm: '6' },
              })}
            >
              <Github
                className={css({ mt: '1', h: '6', w: '6', flexShrink: '0', color: 'green.400' })}
              />
              <div className={css({ flex: '1' })}>
                <h3 className={css({ mb: '2', fontWeight: 'semibold', color: 'white' })}>
                  GitHub-Flavored Markdown Support
                </h3>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  This editor supports all GitHub-flavored markdown features including tables, task
                  lists, strikethrough, autolinks, and syntax-highlighted code blocks. Perfect for
                  writing README files, PR summaries, documentation, and more!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
