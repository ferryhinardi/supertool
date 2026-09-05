# 06 - Markdown Editor & Preview

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Productivity Tools  
**Status:** ✅ Active

## Overview

A full-featured GitHub-Flavored Markdown (GFM) editor with live preview, syntax highlighting, and export capabilities. Write documentation, READMEs, blog posts, or notes with instant visual feedback and professional formatting.

## Purpose

Markdown is the universal format for technical documentation, but editing in plain text without preview is painful. This tool provides a split-pane editor with real-time rendering, supporting all GitHub markdown extensions like tables, task lists, and code blocks with syntax highlighting.

## Key Features

### 1. **Triple View Modes**

- **Split View**: Editor + Preview side-by-side (default)
- **Editor Only**: Focus on writing
- **Preview Only**: Focus on reading
- Instant mode switching

### 2. **GitHub-Flavored Markdown (GFM)**

- ✅ **Tables** with alignment
- ✅ **Task lists** with checkboxes
- ✅ **Strikethrough** text
- ✅ **Autolinks** (URLs become clickable)
- ✅ **Emoji** shortcuts
- ✅ **Footnotes** support

### 3. **Syntax Highlighting**

- Code blocks for 100+ languages
- JavaScript, Python, TypeScript, Go, Rust, etc.
- Line numbers
- Dark theme styling
- Powered by `highlight.js`

### 4. **Export Options**

- **Markdown**: Download as `.md` file
- **HTML**: Download as `.html` with styles
- **Copy**: Copy markdown to clipboard
- **Copy HTML**: Copy rendered HTML

### 5. **Real-Time Statistics**

- Word count
- Character count
- Line count
- Paragraph count
- Reading time estimate

### 6. **Smart Starter Template**

- Pre-loaded with examples
- Shows all markdown features
- Code samples included
- Tables, lists, and links demonstrated

## How It Works

### Markdown Rendering Pipeline

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
;<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight, rehypeRaw]}
  components={customComponents}
>
  {markdown}
</ReactMarkdown>
```

**Processing Steps:**

1. Parse markdown text → AST
2. Apply GFM plugin (tables, tasks, etc.)
3. Transform AST → HTML
4. Apply syntax highlighting
5. Render with custom components

### Statistics Calculation

```typescript
const stats = useMemo(() => {
  const lines = value.split('\n').length
  const chars = value.length
  const words = value.trim().split(/\s+/).filter(Boolean).length

  // Estimate paragraphs (double newlines)
  const paragraphs = value.split(/\n\n+/).filter(Boolean).length

  // Reading time (200 words per minute)
  const readingTime = Math.ceil(words / 200)

  return { lines, chars, words, paragraphs, readingTime }
}, [value])
```

### HTML Export

```typescript
const exportHTML = () => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css">
</head>
<body class="markdown-body">
  ${renderedHTML}
</body>
</html>`

  downloadFile(html, 'document.html', 'text/html')
}
```

## Usage Instructions

### Writing Markdown

#### Headers

```markdown
# H1 - Main Title

## H2 - Section

### H3 - Subsection
```

#### Emphasis

```markdown
**Bold text**
_Italic text_
**_Bold and italic_**
~~Strikethrough~~
```

#### Lists

```markdown
- Bullet point
- Another point
  - Nested item

1. Numbered item
2. Another number
```

#### Task Lists

```markdown
- [x] Completed task
- [ ] Pending task
- [ ] Another todo
```

#### Code Blocks

````markdown
```javascript
function hello(name) {
  console.log(`Hello, ${name}!`)
}
```
````

#### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

#### Links & Images

```markdown
[Link text](https://example.com)
![Alt text](image-url.png)
```

#### Blockquotes

```markdown
> This is a quote.
> It can span multiple lines.
```

### View Mode Workflow

**For Writing:**

1. Select "Editor" mode
2. Maximize writing space
3. Use markdown syntax
4. Switch to "Split" periodically to check formatting

**For Reviewing:**

1. Select "Preview" mode
2. Read rendered output
3. Check formatting and links
4. Switch back to fix issues

### Export Workflow

**As Markdown:**

1. Write content in editor
2. Click "Download Markdown" button
3. Save `.md` file
4. Use in GitHub, GitLab, or other markdown platforms

**As HTML:**

1. Write content in editor
2. Click "Export HTML" button
3. Save `.html` file
4. Open in browser or embed in website

## Supported Markdown Syntax

### Basic Formatting

| Syntax       | Output     |
| ------------ | ---------- |
| `**bold**`   | **bold**   |
| `*italic*`   | _italic_   |
| `` `code` `` | `code`     |
| `~~strike~~` | ~~strike~~ |

### Lists

- Unordered lists with `-`, `*`, or `+`
- Ordered lists with numbers
- Nested lists with indentation
- Task lists with `- [ ]` and `- [x]`

### Code

- Inline code with backticks
- Fenced code blocks with triple backticks
- Language-specific syntax highlighting
- Line numbers automatically added

### Tables

- Pipe-separated columns
- Header row with dashes
- Alignment with colons (`:---`, `:---:`, `---:`)
- Supports inline formatting

### Advanced

- Footnotes: `[^1]` and `[^1]: Note text`
- Automatic URL linking
- Emoji shortcuts (`:smile:` → 😊)
- HTML support (with rehype-raw)

## UI/UX Design

### Layout Modes

**Split View (Default):**

```
┌────────────┬────────────┐
│  Editor    │  Preview   │
│  (Editable)│  (Rendered)│
│            │            │
└────────────┴────────────┘
```

**Editor Only:**

```
┌─────────────────────────┐
│  Editor (Full Width)    │
│                         │
└─────────────────────────┘
```

**Preview Only:**

```
┌─────────────────────────┐
│  Preview (Full Width)   │
│                         │
└─────────────────────────┘
```

### Visual Styling

- **Gradient**: Green to emerald (documentation/writing theme)
- **Glass Effect**: Translucent panels with backdrop blur
- **Typography**: Clear fonts for readability
- **Syntax Theme**: GitHub Dark for code blocks

### Controls

- **Mode Buttons**: Split / Editor / Preview
- **Action Bar**: Copy, Download, Export HTML
- **Stats Panel**: Word count, reading time
- **Clear Button**: Reset to default content

## Technical Architecture

### Dependencies

```json
{
  "react-markdown": "^8.x.x",
  "remark-gfm": "^3.x.x",
  "rehype-highlight": "^6.x.x",
  "rehype-raw": "^6.x.x",
  "highlight.js": "^11.x.x"
}
```

### Component Structure

```tsx
MarkdownEditorPage
├── Textarea (Editor)
├── ReactMarkdown (Preview)
├── Stats Display
└── Action Buttons
```

### State Management

```typescript
const [value, setValue] = useState(defaultMarkdown)
const [viewMode, setViewMode] = useState<ViewMode>('split')

const stats = useMemo(() => calculateStats(value), [value])
```

### Performance

- **Debounced Rendering**: Prevents lag on fast typing
- **Memoized Stats**: Only recalculates on content change
- **Lazy Highlighting**: Code blocks highlighted on demand

## Analytics Events

```typescript
trackToolEvent('markdown_edit', {
  word_count: 500,
  view_mode: 'split',
})

trackToolEvent('markdown_export', {
  format: 'html',
  size_kb: 12.5,
})
```

## Common Use Cases

### Writing READMEs

Perfect for GitHub project documentation:

1. Write installation instructions
2. Add code examples
3. Create API tables
4. Preview exactly how it looks on GitHub
5. Export as `README.md`

### Blog Post Drafts

Draft technical blog posts:

1. Write with markdown simplicity
2. Use code blocks for examples
3. Preview final formatting
4. Export HTML for CMS

### Technical Documentation

Create guides and tutorials:

1. Use headers for structure
2. Add task lists for steps
3. Include code samples
4. Export for wiki or docs site

### Meeting Notes

Quick note-taking:

1. Use bullet points
2. Add task lists for action items
3. Format with headers
4. Export for sharing

## Browser Support

✅ Chrome, Firefox, Safari, Edge (latest versions)  
✅ Mobile browsers (responsive design)

## Keyboard Shortcuts

_Currently manual, future enhancement will add:_

- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + I`: Italic
- `Ctrl/Cmd + K`: Insert link
- `Ctrl/Cmd + S`: Save/export

## Limitations

- No collaborative editing (single user)
- No auto-save (use browser localStorage in future)
- No image uploads (use external URLs)
- No spell check (browser native only)

## Future Enhancements

- [ ] Auto-save to localStorage
- [ ] Keyboard shortcuts
- [ ] Image upload and hosting
- [ ] Collaborative editing
- [ ] Version history
- [ ] Export to PDF
- [ ] Custom CSS themes
- [ ] Markdown templates library
- [ ] Integration with GitHub Gists

## Related Tools

- **Code Diff Viewer** - Compare markdown versions
- **Text Transformer** - Clean text before formatting
- **QR Code Generator** - Share markdown URLs

## Learning Resources

- [GitHub Markdown Guide](https://guides.github.com/features/mastering-markdown/)
- [Markdown Cheatsheet](https://www.markdownguide.org/cheat-sheet/)

---

**Route:** `/tools/markdown-editor`  
**Component:** `app/tools/markdown-editor/page.tsx`  
**Libraries:** `react-markdown`, `remark-gfm`, `rehype-highlight`
