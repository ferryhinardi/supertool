'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  FileText,
  Lightbulb,
  RotateCcw,
  Sparkles,
  SplitSquareHorizontal,
  Upload,
} from 'lucide-react'
import dynamic from 'next/dynamic'
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
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useKeyboardShortcuts } from '@/hooks/common/useKeyboardShortcuts'
import { css } from '@/styled-system/css'

// Dynamically import ReactMarkdown with SSR disabled
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })

type ViewMode = 'split' | 'editor' | 'preview'

const faqs = [
  {
    question: 'What is Markdown and why should I use it?',
    answer:
      "Markdown is a lightweight markup language that uses plain text formatting to create structured documents. It's widely used for README files, documentation, blog posts, and technical writing because it's easy to read, write, and convert to HTML. Markdown allows you to focus on content while maintaining formatting consistency.",
  },
  {
    question: 'Does this editor support GitHub-flavored Markdown (GFM)?',
    answer:
      'Yes! Our editor fully supports GitHub-flavored Markdown including task lists, tables, strikethrough, automatic URL linking, code fencing with syntax highlighting, and emoji shortcuts. This makes it perfect for writing README files, GitHub issues, pull request descriptions, and documentation that will be displayed on GitHub.',
  },
  {
    question: 'Can I export my Markdown to other formats?',
    answer:
      'Yes, you can export your content in multiple formats: save as .md file for Markdown, export as .html for web publishing, or copy the rendered HTML to paste into other applications. The live preview shows exactly how your Markdown will render, making it easy to see the final result before exporting.',
  },
  {
    question: 'How do I create tables in Markdown?',
    answer:
      'Use pipes (|) and hyphens (-) to create tables. Start with a header row, add a separator row with hyphens, then add data rows. Example: | Column 1 | Column 2 | followed by |----------|----------|. Our editor supports table alignment (left, center, right) and renders them with proper formatting in the live preview.',
  },
  {
    question: 'Is my Markdown content saved automatically?',
    answer:
      "Your content is automatically saved to your browser's local storage as you type, so you won't lose work if you accidentally close the tab. However, this is device-specific storage. For permanent backup, use the export feature to download your Markdown file or copy it to a version control system like Git.",
  },
  {
    question: 'How do I add code blocks with syntax highlighting?',
    answer:
      'Use triple backticks (```) followed by the language name to create code blocks. For example: ```javascript for JavaScript code. Our editor supports syntax highlighting for 50+ languages including JavaScript, Python, Java, C++, HTML, CSS, and more. The live preview shows your code with proper formatting and colors.',
  },
  {
    question: 'Can I use this editor for writing documentation?',
    answer:
      'Absolutely! This editor is perfect for technical documentation, API docs, user guides, and README files. The GitHub-flavored Markdown support means your content will look great on GitHub, GitLab, and other platforms. Export to HTML for standalone documentation or copy markdown for version control.',
  },
  {
    question: 'What view modes are available?',
    answer:
      "The editor offers three view modes: Editor Only (focus on writing), Split View (see markdown and preview side-by-side), and Preview Only (see final output). Switch modes instantly to match your workflow, whether you're drafting content, refining formatting, or reviewing the final result.",
  },
  {
    question: 'How do I create task lists in Markdown?',
    answer:
      'Create task lists using - [ ] for unchecked items and - [x] for checked items. Task lists are great for tracking project progress, to-do items, and checklists. They render as interactive checkboxes in the preview, making them perfect for GitHub issues and project management.',
  },
  {
    question: 'Can I load existing Markdown files into the editor?',
    answer:
      'Yes! Click the "Load File" button to import existing .md or .markdown files from your computer. The editor will display your content with live preview immediately. You can then edit, export, or download your modified content. This makes it easy to work with existing documentation and README files.',
  },
]

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
  const [markdownPlugins, setMarkdownPlugins] = useState<{
    // biome-ignore lint/suspicious/noExplicitAny: remark/rehype plugins are dynamically loaded with complex types
    remarkGfm: any
    // biome-ignore lint/suspicious/noExplicitAny: remark/rehype plugins are dynamically loaded with complex types
    rehypeHighlight: any
    // biome-ignore lint/suspicious/noExplicitAny: remark/rehype plugins are dynamically loaded with complex types
    rehypeRaw: any
  } | null>(null)

  // Load markdown plugins dynamically
  useEffect(() => {
    const loadPlugins = async () => {
      const [remarkGfmModule, rehypeHighlightModule, rehypeRawModule] = await Promise.all([
        import('remark-gfm'),
        import('rehype-highlight'),
        import('rehype-raw'),
      ])
      setMarkdownPlugins({
        remarkGfm: remarkGfmModule.default,
        rehypeHighlight: rehypeHighlightModule.default,
        rehypeRaw: rehypeRawModule.default,
      })
    }
    loadPlugins()
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
              color: 'gray.400',
            })}
          >
            Write and preview markdown in real-time with syntax highlighting, tables, task lists,
            and full GitHub-flavored markdown support.
          </p>
        </motion.div>

        {/* View Mode Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
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
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'gray.800',
              bg: 'gray.900/50',
              backdropFilter: 'blur(8px)',
            })}
          >
            <CardContent className={css({ pt: '5', pb: '5' })}>
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
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
        </motion.div>

        {/* Editor and Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className={css({
            display: 'grid',
            gap: { base: '6', lg: '6' },
            gridTemplateColumns: {
              base: '1fr',
              lg: viewMode === 'split' ? 'repeat(2, 1fr)' : '1fr',
            },
            w: 'full',
          })}
        >
          {/* Editor */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <Card
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
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Start typing markdown here..."
                  className={css({
                    minH: '600px',
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
                    minH: '600px',
                    w: 'full',
                    maxW: 'none',
                    overflow: 'auto',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.950',
                    p: '6',
                  })}
                >
                  <div
                    className={`markdown-preview prose prose-invert ${css({
                      w: 'full',
                      maxW: 'none',
                    })}`}
                  >
                    {markdownPlugins ? (
                      <ReactMarkdown
                        remarkPlugins={[markdownPlugins.remarkGfm]}
                        rehypePlugins={[markdownPlugins.rehypeHighlight, markdownPlugins.rehypeRaw]}
                        components={{
                          // Custom component styling
                          h1: ({ ...props }) => (
                            <h1
                              className={css({
                                mb: '4',
                                borderBottom: '1px solid',
                                borderColor: 'gray.700',
                                pb: '2',
                                fontSize: '3xl',
                                fontWeight: 'bold',
                              })}
                              {...props}
                            />
                          ),
                          h2: ({ ...props }) => (
                            <h2
                              className={css({
                                mt: '6',
                                mb: '3',
                                borderBottom: '1px solid',
                                borderColor: 'gray.800',
                                pb: '2',
                                fontSize: '2xl',
                                fontWeight: 'bold',
                              })}
                              {...props}
                            />
                          ),
                          h3: ({ ...props }) => (
                            <h3
                              className={css({
                                mt: '5',
                                mb: '2',
                                fontSize: 'xl',
                                fontWeight: 'bold',
                              })}
                              {...props}
                            />
                          ),
                          a: ({ ...props }) => (
                            <a
                              className={css({
                                color: 'blue.400',
                                _hover: {
                                  color: 'blue.300',
                                  textDecoration: 'underline',
                                },
                              })}
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
                                className={css({
                                  rounded: 'md',
                                  bg: 'gray.800',
                                  px: '1.5',
                                  py: '0.5',
                                  fontSize: 'sm',
                                  color: 'pink.400',
                                })}
                                {...props}
                              >
                                {children}
                              </code>
                            )
                          },
                          pre: ({ ...props }) => (
                            <pre
                              className={css({
                                overflowX: 'auto',
                                rounded: 'lg',
                                border: '1px solid',
                                borderColor: 'gray.700',
                                bg: 'gray.900',
                                p: '4',
                              })}
                              {...props}
                            />
                          ),
                          table: ({ ...props }) => (
                            <div className={css({ overflowX: 'auto' })}>
                              <table
                                className={css({
                                  minW: 'full',
                                  borderCollapse: 'collapse',
                                  border: '1px solid',
                                  borderColor: 'gray.700',
                                })}
                                {...props}
                              />
                            </div>
                          ),
                          th: ({ ...props }) => (
                            <th
                              className={css({
                                border: '1px solid',
                                borderColor: 'gray.700',
                                bg: 'gray.800',
                                px: '4',
                                py: '2',
                                textAlign: 'left',
                                fontWeight: 'bold',
                              })}
                              {...props}
                            />
                          ),
                          td: ({ ...props }) => (
                            <td
                              className={css({
                                border: '1px solid',
                                borderColor: 'gray.700',
                                px: '4',
                                py: '2',
                              })}
                              {...props}
                            />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote
                              className={css({
                                borderLeft: '4px solid',
                                borderColor: 'gray.600',
                                pl: '4',
                                color: 'gray.400',
                                fontStyle: 'italic',
                              })}
                              {...props}
                            />
                          ),
                          ul: ({ ...props }) => (
                            <ul
                              className={css({
                                listStyleType: 'disc',
                                pl: '6',
                              })}
                              {...props}
                            />
                          ),
                          ol: ({ ...props }) => (
                            <ol
                              className={css({
                                listStyleType: 'decimal',
                                pl: '6',
                              })}
                              {...props}
                            />
                          ),
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
                                  <li
                                    className={css({
                                      display: 'flex',
                                      listStyleType: 'none',
                                      alignItems: 'center',
                                      gap: '2',
                                    })}
                                    {...props}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={input.props.checked}
                                      disabled
                                      className={css({
                                        h: '4',
                                        w: '4',
                                        rounded: 'md',
                                        borderColor: 'gray.600',
                                        bg: 'gray.800',
                                      })}
                                    />
                                    <span>{firstChild.props.children.slice(1)}</span>
                                  </li>
                                )
                              }
                            }
                            return <li {...props}>{children}</li>
                          },
                          hr: ({ ...props }) => (
                            <hr
                              className={css({
                                my: '4',
                                borderColor: 'gray.700',
                              })}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {value}
                      </ReactMarkdown>
                    ) : (
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'gray.400',
                        })}
                      >
                        Loading preview...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'cyan.500/20',
              bg: 'rgba(6, 182, 212, 0.05)',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Sparkles className={css({ h: '5', w: '5', color: 'cyan.400' })} />
                Pro Tips
              </CardTitle>
              <CardDescription>
                Expert techniques for writing better Markdown content faster
              </CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                <div
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'cyan.500/5',
                    borderLeft: '3px solid',
                    borderColor: 'cyan.500',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                    <strong className={css({ color: 'cyan.300' })}>
                      Master GitHub-Flavored Markdown:
                    </strong>{' '}
                    Take advantage of advanced features like tables (| Header | Header |), task
                    lists (- [ ] Todo), strikethrough (~~text~~), and auto-linked URLs for
                    documentation that looks professional on GitHub.
                  </p>
                </div>
                <div
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'cyan.500/5',
                    borderLeft: '3px solid',
                    borderColor: 'cyan.500',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                    <strong className={css({ color: 'cyan.300' })}>Optimize Your Workflow:</strong>{' '}
                    Use Editor Only mode for distraction-free writing, Split View for simultaneous
                    editing and verification, or Preview Only mode for final review and
                    presentation. Switch modes based on your current task.
                  </p>
                </div>
                <div
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'cyan.500/5',
                    borderLeft: '3px solid',
                    borderColor: 'cyan.500',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                    <strong className={css({ color: 'cyan.300' })}>Code Blocks Done Right:</strong>{' '}
                    Use fenced code blocks with language identifiers (```javascript) for automatic
                    syntax highlighting. Supports 180+ languages. Add line numbers or highlights for
                    technical documentation and tutorials.
                  </p>
                </div>
                <div
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'cyan.500/5',
                    borderLeft: '3px solid',
                    borderColor: 'cyan.500',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                    <strong className={css({ color: 'cyan.300' })}>Export Flexibility:</strong>{' '}
                    Download as .md for version control and collaboration, or export as styled HTML
                    for embedding in websites, blogs, or documentation sites. HTML exports include
                    syntax highlighting and responsive styling.
                  </p>
                </div>
                <div
                  className={css({
                    p: '3',
                    rounded: 'lg',
                    bg: 'cyan.500/5',
                    borderLeft: '3px solid',
                    borderColor: 'cyan.500',
                  })}
                >
                  <p className={css({ fontSize: 'sm', color: 'gray.300', lineHeight: '1.6' })}>
                    <strong className={css({ color: 'cyan.300' })}>
                      Documentation Best Practices:
                    </strong>{' '}
                    Structure content with clear headings (# ## ###), use bullet points for
                    scannability, add code examples liberally, and include a table of contents for
                    long documents. Preview regularly to ensure formatting consistency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Use Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '2px solid',
              borderColor: 'blue.500/30',
              bg: 'rgba(59, 130, 246, 0.05)',
              backdropFilter: 'blur(16px)',
              padding: '6',
            })}
          >
            <CardHeader
              className={css({
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '3',
                padding: '0',
                marginBottom: '4',
              })}
            >
              <Lightbulb
                className={css({
                  h: '6',
                  w: '6',
                  color: 'blue.400',
                  flexShrink: '0',
                })}
              />
              <CardTitle
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'semibold',
                  color: 'blue.300',
                })}
              >
                How to Use Markdown Editor
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ padding: '0' })}>
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', md: '1fr 1fr' },
                  gap: { base: '4', md: '6' },
                })}
              >
                <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
                  <Badge
                    variant="outline"
                    className={css({
                      minH: '10',
                      minW: '10',
                      h: '10',
                      w: '10',
                      rounded: 'full',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bg: 'purple.500/10',
                      borderColor: 'purple.500',
                      borderWidth: '2px',
                      fontSize: 'lg',
                      fontWeight: 'bold',
                      color: 'purple.300',
                      flexShrink: 0,
                    })}
                  >
                    1
                  </Badge>
                  <div className={css({ flex: '1', minW: '0' })}>
                    <h3
                      className={css({
                        fontWeight: 'semibold',
                        color: 'gray.100',
                        mb: '2',
                        fontSize: { base: 'sm', sm: 'base' },
                      })}
                    >
                      Choose Your View Mode
                    </h3>
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.400',
                        lineHeight: '1.6',
                      })}
                    >
                      Select Editor Only (focus on writing), Split View (side-by-side editing and
                      preview), or Preview Only (see final output) based on your workflow and screen
                      size.
                    </p>
                  </div>
                </div>

                <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
                  <Badge
                    variant="outline"
                    className={css({
                      minH: '10',
                      minW: '10',
                      h: '10',
                      w: '10',
                      rounded: 'full',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bg: 'pink.500/10',
                      borderColor: 'pink.500',
                      borderWidth: '2px',
                      fontSize: 'lg',
                      fontWeight: 'bold',
                      color: 'pink.300',
                      flexShrink: 0,
                    })}
                  >
                    2
                  </Badge>
                  <div className={css({ flex: '1', minW: '0' })}>
                    <h3
                      className={css({
                        fontWeight: 'semibold',
                        color: 'gray.100',
                        mb: '2',
                        fontSize: { base: 'sm', sm: 'base' },
                      })}
                    >
                      Write or Load Markdown
                    </h3>
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.400',
                        lineHeight: '1.6',
                      })}
                    >
                      Type directly in the editor using GitHub-flavored Markdown syntax, or load an
                      existing .md file using the "Load File" button. Start with the provided
                      template or reset anytime.
                    </p>
                  </div>
                </div>

                <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
                  <Badge
                    variant="outline"
                    className={css({
                      minH: '10',
                      minW: '10',
                      h: '10',
                      w: '10',
                      rounded: 'full',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bg: 'blue.500/10',
                      borderColor: 'blue.500',
                      borderWidth: '2px',
                      fontSize: 'lg',
                      fontWeight: 'bold',
                      color: 'blue.300',
                      flexShrink: 0,
                    })}
                  >
                    3
                  </Badge>
                  <div className={css({ flex: '1', minW: '0' })}>
                    <h3
                      className={css({
                        fontWeight: 'semibold',
                        color: 'gray.100',
                        mb: '2',
                        fontSize: { base: 'sm', sm: 'base' },
                      })}
                    >
                      See Live Preview with Syntax Highlighting
                    </h3>
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.400',
                        lineHeight: '1.6',
                      })}
                    >
                      Watch your markdown render in real-time with proper formatting, code
                      highlighting for 180+ languages, tables, task lists, and emoji support.
                    </p>
                  </div>
                </div>

                <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
                  <Badge
                    variant="outline"
                    className={css({
                      minH: '10',
                      minW: '10',
                      h: '10',
                      w: '10',
                      rounded: 'full',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bg: 'green.500/10',
                      borderColor: 'green.500',
                      borderWidth: '2px',
                      fontSize: 'lg',
                      fontWeight: 'bold',
                      color: 'green.300',
                      flexShrink: 0,
                    })}
                  >
                    4
                  </Badge>
                  <div className={css({ flex: '1', minW: '0' })}>
                    <h3
                      className={css({
                        fontWeight: 'semibold',
                        color: 'gray.100',
                        mb: '2',
                        fontSize: { base: 'sm', sm: 'base' },
                      })}
                    >
                      Export or Copy Your Work
                    </h3>
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'gray.400',
                        lineHeight: '1.6',
                      })}
                    >
                      Use the action buttons to download as .md or .html files, copy markdown or
                      HTML to clipboard, or reset to the default template.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Share */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <SocialShare
            toolName="Markdown Editor & Preview"
            toolUrl="https://supertool.com/tools/markdown-editor"
            description="Write and preview GitHub-flavored Markdown in real-time with syntax highlighting, tables, and task lists. Perfect for README files and documentation!"
            hashtags={['Markdown', 'Documentation', 'GithubMarkdown', 'Developer', 'Productivity']}
          />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <FAQAccordion faqs={faqs} />
        </motion.div>

        {/* Related Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <RelatedTools currentToolPath="/tools/markdown-editor" category="productivity" />
        </motion.div>

        {/* Tool Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <ToolRating toolId="/tools/markdown-editor" toolName="Markdown Editor" />
        </motion.div>

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
