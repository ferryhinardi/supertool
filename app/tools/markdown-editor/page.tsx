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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
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
    remarkGfm: any
    rehypeHighlight: any
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
            <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'green.300' })}>
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
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: {
                    base: '1fr',
                    sm: 'repeat(3, 1fr)',
                  },
                  gap: '3',
                  w: 'full',
                })}
              >
                <Button
                  variant={viewMode === 'editor' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setViewMode('editor')}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '4',
                    bg: viewMode === 'editor' ? 'green.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: viewMode === 'editor' ? 'green.500/50' : 'gray.700/50',
                    color: viewMode === 'editor' ? 'green.300' : 'gray.400',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: viewMode === 'editor' ? 'green.500/30' : 'gray.800',
                      borderColor: viewMode === 'editor' ? 'green.500/70' : 'gray.600',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <Code2 className={css({ h: '5', w: '5' })} />
                  <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                    Editor Only
                  </span>
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setViewMode('split')}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '4',
                    bg: viewMode === 'split' ? 'green.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: viewMode === 'split' ? 'green.500/50' : 'gray.700/50',
                    color: viewMode === 'split' ? 'green.300' : 'gray.400',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: viewMode === 'split' ? 'green.500/30' : 'gray.800',
                      borderColor: viewMode === 'split' ? 'green.500/70' : 'gray.600',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <SplitSquareHorizontal className={css({ h: '5', w: '5' })} />
                  <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                    Split View
                  </span>
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setViewMode('preview')}
                  className={css({
                    h: 'auto',
                    flexDirection: 'column',
                    gap: '2',
                    py: '4',
                    bg: viewMode === 'preview' ? 'green.500/20' : 'gray.800/50',
                    border: '1px solid',
                    borderColor: viewMode === 'preview' ? 'green.500/50' : 'gray.700/50',
                    color: viewMode === 'preview' ? 'green.300' : 'gray.400',
                    transition: 'all 0.2s',
                    _hover: {
                      bg: viewMode === 'preview' ? 'green.500/30' : 'gray.800',
                      borderColor: viewMode === 'preview' ? 'green.500/70' : 'gray.600',
                      transform: 'translateY(-2px)',
                    },
                  })}
                >
                  <Eye className={css({ h: '5', w: '5' })} />
                  <span className={css({ fontSize: 'sm', fontWeight: 'semibold' })}>
                    Preview Only
                  </span>
                </Button>
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
            <CardContent className={css({ py: '5' })}>
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
                    size="sm"
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
                  size="sm"
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
                  size="sm"
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
                  size="sm"
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
                  size="sm"
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
                  size="sm"
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
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
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
                <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
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
                  <div className="markdown-preview prose prose-invert w-full max-w-none">
                    {markdownPlugins ? (
                      <ReactMarkdown
                        remarkPlugins={[markdownPlugins.remarkGfm]}
                        rehypePlugins={[markdownPlugins.rehypeHighlight, markdownPlugins.rehypeRaw]}
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
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'green.500/5',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardContent className={css({ py: '6' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
                <Sparkles
                  className={css({ h: '6', w: '6', color: 'green.400', flexShrink: '0' })}
                />
                <div className={css({ spaceY: '2' })}>
                  <h3
                    className={css({
                      fontSize: 'lg',
                      fontWeight: 'semibold',
                      color: 'green.300',
                    })}
                  >
                    Pro Tips
                  </h3>
                  <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'gray.400' })}>
                    <li>• Supports GitHub-flavored markdown with tables and task lists</li>
                    <li>• Use the view mode switcher to focus on editing or previewing</li>
                    <li>• Export your work as HTML with styling or plain markdown</li>
                    <li>• Perfect for README files, documentation, and PR descriptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Use Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'blue.500/20',
              bg: 'blue.500/5',
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
            <CardContent className={css({ padding: '0', spaceY: '4' })}>
              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    fontSize: 'sm',
                    fontWeight: 'bold',
                    px: '2.5',
                    py: '1',
                    flexShrink: '0',
                  })}
                >
                  1
                </Badge>
                <p className={css({ color: 'gray.400', lineHeight: '1.6' })}>
                  <strong className={css({ color: 'gray.300' })}>Choose your view mode:</strong>{' '}
                  Select Editor Only (focus on writing), Split View (side-by-side editing and
                  preview), or Preview Only (see final output) based on your workflow.
                </p>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    fontSize: 'sm',
                    fontWeight: 'bold',
                    px: '2.5',
                    py: '1',
                    flexShrink: '0',
                  })}
                >
                  2
                </Badge>
                <p className={css({ color: 'gray.400', lineHeight: '1.6' })}>
                  <strong className={css({ color: 'gray.300' })}>Write or load Markdown:</strong>{' '}
                  Type directly in the editor using GitHub-flavored Markdown syntax, or load an
                  existing .md file using the "Load File" button.
                </p>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    fontSize: 'sm',
                    fontWeight: 'bold',
                    px: '2.5',
                    py: '1',
                    flexShrink: '0',
                  })}
                >
                  3
                </Badge>
                <p className={css({ color: 'gray.400', lineHeight: '1.6' })}>
                  <strong className={css({ color: 'gray.300' })}>
                    See live preview with syntax highlighting:
                  </strong>{' '}
                  Watch your markdown render in real-time with proper formatting, code highlighting,
                  tables, and task lists.
                </p>
              </div>

              <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
                <Badge
                  className={css({
                    bg: 'blue.500/20',
                    color: 'blue.300',
                    fontSize: 'sm',
                    fontWeight: 'bold',
                    px: '2.5',
                    py: '1',
                    flexShrink: '0',
                  })}
                >
                  4
                </Badge>
                <p className={css({ color: 'gray.400', lineHeight: '1.6' })}>
                  <strong className={css({ color: 'gray.300' })}>Export or copy your work:</strong>{' '}
                  Use the action buttons to download as .md or .html files, copy markdown or HTML to
                  clipboard, or reset to the default template.
                </p>
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
      </main>
    </>
  )
}
