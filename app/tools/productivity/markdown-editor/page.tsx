'use client'

import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  FileText,
  RotateCcw,
  SplitSquareHorizontal,
  Upload,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  TOOL_COLORS,
  ToolMobilePicker,
  type ToolOperation,
  ToolOperationGrid,
} from '@/components/features/tool-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { css } from '@/styled-system/css'
import { MarkdownPreview } from './components/markdown-preview'

// Import highlight.js theme
import 'highlight.js/styles/github-dark.css'

type ViewMode = 'split' | 'editor' | 'preview'

// View Mode Operations
const VIEW_MODE_OPERATIONS: ToolOperation[] = [
  {
    id: 'editor',
    label: 'Editor Only',
    icon: Code2,
    color: TOOL_COLORS.success,
    description: 'Focus on writing',
  },
  {
    id: 'split',
    label: 'Split View',
    icon: SplitSquareHorizontal,
    color: TOOL_COLORS.info,
    description: 'Side-by-side editing',
  },
  {
    id: 'preview',
    label: 'Preview Only',
    icon: Eye,
    color: TOOL_COLORS.purple,
    description: 'See final output',
  },
]

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

  useEffect(() => {
    if (window.matchMedia?.('(max-width: 1023px)').matches) {
      setViewMode('editor')
    }
  }, [])

  // Calculate stats (derived values - React Compiler handles optimization)
  const lines = value.split('\n').length
  const chars = value.length
  const words = value.trim().split(/\s+/).filter(Boolean).length
  const headings = (value.match(/^#{1,6}\s/gm) || []).length
  const codeBlocks = (value.match(/```/g) || []).length / 2
  const links = (value.match(/\[.*?\]\(.*?\)/g) || []).length
  const images = (value.match(/!\[.*?\]\(.*?\)/g) || []).length
  const taskLists = (value.match(/^- \[[ x]\]/gm) || []).length

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(value)
    toast.success('Markdown copied to clipboard! 📋')
  }

  const handleCopyHTML = () => {
    const tempDiv = document.createElement('div')
    const container = document.querySelector('.markdown-preview')
    if (container) {
      tempDiv.innerHTML = container.innerHTML
      navigator.clipboard.writeText(tempDiv.innerHTML)
      toast.success('HTML copied to clipboard! 📋')
    }
  }

  const handleDownloadMarkdown = () => {
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
  }

  const handleDownloadHTML = () => {
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
  }

  const handleReset = () => {
    setValue(defaultMarkdown)
    toast.info('Reset to default template! 🔄')
  }

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  // Keyboard shortcuts
  const { showHelp, setShowHelp, modifierKey } = useKeyboardShortcuts({
    onCopy: handleCopyMarkdown,
    onSave: handleDownloadMarkdown,
    onReset: handleReset,
  })

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
        <div
          className={css({
            textAlign: 'center',
            spaceY: '4',
            animation: 'slideUp 0.5s ease-out forwards',
            opacity: 0,
          })}
        >
          <div
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3',
              rounded: 'full',
              border: '1px solid',
              borderColor: 'green.500/30',
              bg: 'green.500/10',
              px: '5',
              py: '2',
              backdropFilter: 'blur(8px)',
            })}
          >
            <FileText className={css({ h: '5', w: '5', color: 'green.400' })} />
            <span
              className={css({
                fontSize: 'sm',
                fontWeight: 'semibold',
                color: 'green.300',
              })}
            >
              GitHub-Flavored Markdown • Live Preview
            </span>
          </div>

          <h1
            className={css({
              fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
              fontWeight: 'extrabold',
              bgGradient: 'to-r',
              gradientFrom: 'green.400',
              gradientVia: 'emerald.400',
              gradientTo: 'teal.400',
              bgClip: 'text',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Markdown Editor
          </h1>

          <p
            className={css({
              mx: 'auto',
              maxW: '3xl',
              fontSize: { base: 'lg', sm: 'xl' },
              color: 'white',
            })}
          >
            Write and preview markdown in real-time with syntax highlighting, tables, task lists,
            and full GitHub-flavored markdown support.
          </p>
        </div>

        {/* View Mode Controls */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.1s',
            opacity: 0,
          })}
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
              <CardTitle>View Mode</CardTitle>
              <CardDescription>Choose how you want to work with your markdown</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop: Operation Grid */}
              <div className={css({ display: { base: 'none', md: 'block' } })}>
                <ToolOperationGrid
                  operations={VIEW_MODE_OPERATIONS}
                  selectedOperation={viewMode}
                  onOperationChange={(newMode) => setViewMode(newMode as ViewMode)}
                  columns={{ base: 1, sm: 3 }}
                  analyticsCategory="markdown_editor"
                />
              </div>

              {/* Mobile: Bottom Sheet Picker */}
              <div className={css({ display: { base: 'block', md: 'none' } })}>
                <ToolMobilePicker
                  label={`Mode: ${
                    VIEW_MODE_OPERATIONS.find((op) => op.id === viewMode)?.label || 'Split View'
                  }`}
                  title="Choose View Mode"
                  description="Select how you want to work with your markdown"
                  color={VIEW_MODE_OPERATIONS.find((op) => op.id === viewMode)?.color}
                >
                  <ToolOperationGrid
                    operations={VIEW_MODE_OPERATIONS}
                    selectedOperation={viewMode}
                    onOperationChange={(newMode) => setViewMode(newMode as ViewMode)}
                    columns={{ base: 1 }}
                    analyticsCategory="markdown_editor"
                  />
                </ToolMobilePicker>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Bar */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.2s',
            opacity: 0,
          })}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardContent withTopPadding className={css({ pt: '5', pb: '5' })}>
              <div
                className={css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '3',
                })}
              >
                <Badge
                  variant="outline"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1.5',
                    border: '1px solid',
                    borderColor: 'green.500/30',
                    color: 'green.400',
                  })}
                >
                  <CheckCircle2 className={css({ h: '3', w: '3' })} />
                  {lines} lines
                </Badge>
                <Badge
                  variant="outline"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1.5',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                    color: 'blue.400',
                  })}
                >
                  {words} words
                </Badge>
                <Badge
                  variant="outline"
                  className={css({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '1.5',
                    border: '1px solid',
                    borderColor: 'purple.500/30',
                    color: 'purple.400',
                  })}
                >
                  {chars} characters
                </Badge>
                {headings > 0 && (
                  <Badge
                    variant="outline"
                    className={css({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1.5',
                      border: '1px solid',
                      borderColor: 'orange.500/30',
                      color: 'orange.400',
                    })}
                  >
                    {headings} headings
                  </Badge>
                )}
                {codeBlocks > 0 && (
                  <Badge
                    variant="outline"
                    className={css({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1.5',
                      border: '1px solid',
                      borderColor: 'cyan.500/30',
                      color: 'cyan.400',
                    })}
                  >
                    <Code2 className={css({ h: '3', w: '3' })} />
                    {codeBlocks} code blocks
                  </Badge>
                )}
                {links > 0 && (
                  <Badge
                    variant="outline"
                    className={css({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1.5',
                      border: '1px solid',
                      borderColor: 'pink.500/30',
                      color: 'pink.400',
                    })}
                  >
                    {links} links
                  </Badge>
                )}
                {images > 0 && (
                  <Badge
                    variant="outline"
                    className={css({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1.5',
                      border: '1px solid',
                      borderColor: 'yellow.500/30',
                      color: 'yellow.400',
                    })}
                  >
                    {images} images
                  </Badge>
                )}
                {taskLists > 0 && (
                  <Badge
                    variant="outline"
                    className={css({
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '1.5',
                      border: '1px solid',
                      borderColor: 'green.500/30',
                      color: 'green.400',
                    })}
                  >
                    ✓ {taskLists} tasks
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.3s',
            opacity: 0,
          })}
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
              <CardTitle>Actions</CardTitle>
              <CardDescription>Load, copy, download, or reset your markdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(6, 1fr)',
                  },
                  gap: '3',
                  w: 'full',
                })}
              >
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    asChild
                    className={css({
                      h: 'auto',
                      w: 'full',
                      flexDirection: 'column',
                      gap: '2',
                      py: '3',
                      cursor: 'pointer',
                      minH: '11',
                    })}
                  >
                    <span>
                      <Upload className={css({ h: '4', w: '4' })} />
                      <span className={css({ fontSize: 'xs' })}>Load File</span>
                    </span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".md,.markdown"
                    className={css({ display: 'none' })}
                    onChange={handleLoadFile}
                  />
                </label>
                <Button
                  variant="outline"
                  onClick={handleCopyMarkdown}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '3',
                    minH: '11',
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  <span className={css({ fontSize: 'xs' })}>Copy MD</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyHTML}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '3',
                    minH: '11',
                  })}
                >
                  <Copy className={css({ h: '4', w: '4' })} />
                  <span className={css({ fontSize: 'xs' })}>Copy HTML</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadMarkdown}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '3',
                    minH: '11',
                  })}
                >
                  <Download className={css({ h: '4', w: '4' })} />
                  <span className={css({ fontSize: 'xs' })}>Download MD</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadHTML}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '3',
                    minH: '11',
                  })}
                >
                  <Download className={css({ h: '4', w: '4' })} />
                  <span className={css({ fontSize: 'xs' })}>Download HTML</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '3',
                    minH: '11',
                  })}
                >
                  <RotateCcw className={css({ h: '4', w: '4' })} />
                  <span className={css({ fontSize: 'xs' })}>Reset</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor and Preview */}
        <div
          className={css({
            display: 'grid',
            gap: { base: '6', lg: '6' },
            gridTemplateColumns: {
              base: '1fr',
              lg: viewMode === 'split' ? 'repeat(2, 1fr)' : '1fr',
            },
            w: 'full',
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.4s',
            opacity: 0,
          })}
        >
          {/* Editor */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <Card
              data-testid="markdown-editor-panel"
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
                backdropFilter: 'blur(8px)',
                w: 'full',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Code2 className={css({ h: '5', w: '5', color: 'green.500' })} />
                  Markdown Editor
                </CardTitle>
                <CardDescription>
                  Write your markdown content using GitHub-flavored syntax
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  aria-label="Markdown editor"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Start typing markdown here..."
                  className={css({
                    minH: { base: '50vh', sm: '600px' },
                    resize: 'none',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.950',
                    fontFamily: 'mono',
                    color: 'gray.100',
                    _focus: {
                      ring: '2px',
                      ringColor: 'green.500/20',
                      borderColor: 'green.500',
                    },
                  })}
                />
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card
              data-testid="markdown-preview-panel"
              className={css({
                border: '1px solid',
                borderColor: 'gray.800',
                bg: 'gray.900/50',
                backdropFilter: 'blur(8px)',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Eye className={css({ h: '5', w: '5', color: 'emerald.500' })} />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your markdown will be rendered with GitHub styling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    minH: { base: '50vh', sm: '600px' },
                    w: 'full',
                    maxW: 'none',
                    overflow: 'auto',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.950',
                    p: { base: '3', sm: '6' },
                  })}
                >
                  <div
                    className={`markdown-preview prose prose-invert ${css({
                      w: 'full',
                      maxW: 'none',
                    })}`}
                  >
                    <MarkdownPreview content={value} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pro Tips */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.1s',
            opacity: 0,
          })}
        >
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'cyan.500/20',
              bg: 'rgba(6, 182, 212, 0.05)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
            })}
          >
            <h3
              className={css({
                mb: '3',
                fontSize: { base: 'base', sm: 'lg' },
                fontWeight: 'bold',
                color: 'cyan.300',
              })}
            >
              Pro Tips
            </h3>
            <ul className={css({ spaceY: '2', pl: '5', color: 'gray.400', listStyle: 'disc' })}>
              <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
                <strong>Master GitHub-Flavored Markdown:</strong> Take advantage of advanced
                features like tables, task lists (- [ ] Todo), strikethrough (~~text~~), and
                auto-linked URLs for professional documentation
              </li>
              <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
                <strong>Optimize Your Workflow:</strong> Use Editor Only mode for distraction-free
                writing, Split View for simultaneous editing and verification, or Preview Only mode
                for final review
              </li>
              <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
                <strong>Code Blocks Done Right:</strong> Use fenced code blocks with language
                identifiers (```javascript) for automatic syntax highlighting - supports 180+
                languages
              </li>
              <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
                <strong>Export Flexibility:</strong> Download as .md for version control and
                collaboration, or export as styled HTML for embedding in websites and blogs
              </li>
              <li className={css({ fontSize: { base: 'sm', sm: 'base' } })}>
                <strong>Documentation Best Practices:</strong> Structure content with clear
                headings, use bullet points for scannability, add code examples, and preview
                regularly for formatting consistency
              </li>
            </ul>
          </div>
        </div>

        {/* Social Share */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.7s',
            opacity: 0,
          })}
        >
          <SocialShare
            toolName="Markdown Editor & Preview"
            toolUrl="https://supertool.com/tools/markdown-editor"
            description="Write and preview GitHub-flavored Markdown in real-time with syntax highlighting, tables, and task lists. Perfect for README files and documentation!"
            hashtags={['Markdown', 'Documentation', 'GithubMarkdown', 'Developer', 'Productivity']}
          />
        </div>

        {/* Related Tools */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '0.9s',
            opacity: 0,
          })}
        >
          <RelatedTools currentToolPath="/tools/markdown-editor" category="productivity" />
        </div>

        {/* Tool Rating */}
        <div
          className={css({
            animation: 'slideUp 0.5s ease-out forwards',
            animationDelay: '1.0s',
            opacity: 0,
          })}
        >
          <ToolRating toolId="/tools/markdown-editor" toolName="Markdown Editor" />
        </div>

        {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

        <ToolSearch />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          open={showHelp}
          onOpenChange={setShowHelp}
          shortcuts={[
            { key: `${modifierKey}+C`, label: 'Copy', description: 'Copy Markdown' },
            { key: `${modifierKey}+S`, label: 'Save', description: 'Download Markdown file' },
            { key: `${modifierKey}+R`, label: 'Reset', description: 'Reset to template' },
            { key: `${modifierKey}+/`, label: 'Help', description: 'Show this help' },
          ]}
        />
      </main>
    </>
  )
}
