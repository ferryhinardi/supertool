# Markdown Editor

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/productivity/markdown-editor`
**Category**: Productivity Tools
**Complexity**: Complex (1462 lines)

## Overview

The Markdown Editor is a powerful, real-time markdown writing and preview tool with full GitHub-Flavored Markdown (GFM) support. It features live preview with syntax highlighting for 180+ programming languages, tables, task lists, and professional export options. Perfect for writing README files, documentation, blog posts, and technical content. All processing happens client-side in your browser.

## Key Features

### GitHub-Flavored Markdown Support
- **Tables**: Create formatted tables with alignment support
- **Task Lists**: Interactive checkboxes with `- [ ]` and `- [x]` syntax
- **Strikethrough**: Use `~~text~~` for strikethrough text
- **Auto-linking**: URLs automatically converted to clickable links
- **Code Fencing**: Triple backticks with language identifiers
- **Emoji Support**: Use emoji shortcodes in your content

### Syntax Highlighting
- **180+ Languages**: JavaScript, Python, TypeScript, Java, C++, Go, Rust, and more
- **GitHub Dark Theme**: Professional code styling matching GitHub's appearance
- **Inline Code**: Single backticks for inline code snippets
- **Fenced Code Blocks**: Triple backticks with language specification

### View Modes
- **Editor Only**: Focus mode for distraction-free writing
- **Split View**: Side-by-side editor and preview (default)
- **Preview Only**: Full-screen rendered output for review

### Export Options
- **Download Markdown (.md)**: Save source file for version control
- **Download HTML**: Styled HTML document with GitHub CSS
- **Copy Markdown**: Copy raw markdown to clipboard
- **Copy HTML**: Copy rendered HTML for embedding

### Document Statistics
Real-time statistics displayed as badges:
- Line count
- Word count
- Character count
- Heading count
- Code block count
- Link count
- Image count
- Task list count

### File Management
- **Load Files**: Import existing .md or .markdown files
- **Reset**: Return to default template content
- **Auto-save**: Content persists in browser localStorage

## How to Use

### Basic Workflow

1. **Choose View Mode**
   - Navigate to `/tools/productivity/markdown-editor`
   - Select your preferred view: Editor Only, Split View, or Preview Only
   - Desktop users get grid view; mobile users get a picker interface

2. **Write or Load Content**
   - Type directly in the editor using markdown syntax
   - Or click "Load File" to import an existing .md file
   - Start with the provided template showing common markdown features

3. **Preview in Real-Time**
   - Watch your content render instantly in the preview pane
   - Code blocks show syntax highlighting automatically
   - Tables, task lists, and other GFM features render correctly

4. **Export Your Work**
   - **Download MD**: Save as .md file for Git/GitHub
   - **Download HTML**: Get styled HTML with GitHub CSS
   - **Copy MD**: Copy raw markdown to clipboard
   - **Copy HTML**: Copy rendered HTML for pasting

### Markdown Syntax Quick Reference

#### Headings
```markdown
# Heading 1
## Heading 2
### Heading 3
```

#### Text Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`inline code`
```

#### Lists
```markdown
- Bullet item
- Another item
  - Nested item

1. Numbered item
2. Second item
```

#### Task Lists
```markdown
- [ ] Unchecked task
- [x] Completed task
```

#### Code Blocks
````markdown
```javascript
function hello() {
  console.log('Hello, World!')
}
```
````

#### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

#### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

#### Blockquotes
```markdown
> This is a blockquote
> with multiple lines
```

## Use Cases

### README Files
Create professional README.md files for GitHub repositories:
- Project descriptions with headings
- Installation instructions with code blocks
- Feature lists with bullet points
- Contributing guidelines

### Technical Documentation
Write API docs, user guides, and technical specs:
- Code examples with syntax highlighting
- Parameter tables
- Step-by-step procedures
- Troubleshooting sections

### Blog Posts
Draft blog content with proper formatting:
- Headers for structure
- Images and links
- Code snippets
- Formatted quotes

### Project Planning
Use task lists for project management:
- Sprint planning checklists
- Feature requirements
- Bug tracking
- Release notes

### Note Taking
Quick notes with markdown formatting:
- Meeting notes with action items
- Research summaries
- Learning journals
- Knowledge base articles

## Tips & Tricks

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + C` | Copy Markdown |
| `Cmd/Ctrl + S` | Download Markdown |
| `Cmd/Ctrl + R` | Reset to template |
| `Cmd/Ctrl + /` | Show keyboard help |

### View Mode Best Practices

| Mode | Best For |
|------|----------|
| Editor Only | Drafting, focused writing, smaller screens |
| Split View | Editing with instant feedback, desktop use |
| Preview Only | Final review, sharing screen, presentations |

### Pro Tips

1. **Use Headings for Structure**: Start with H1 for title, use H2-H3 for sections
2. **Language Identifiers**: Always specify language in code blocks (```javascript)
3. **Tables for Data**: Use tables for parameters, comparisons, feature lists
4. **Task Lists for Action Items**: Track progress with checkboxes
5. **Preview Before Export**: Switch to Preview Only for final review

## Troubleshooting

### Preview Not Rendering
**Problem**: Preview shows raw markdown text

**Solutions**:
- Wait for plugins to load (shown as "Loading preview...")
- Refresh the page and try again
- Check for syntax errors in your markdown

### Code Highlighting Missing
**Problem**: Code blocks don't show colors

**Solutions**:
- Ensure language identifier is specified after triple backticks
- Use standard language names (javascript, python, not js, py)
- Wait for highlight.js to initialize

### File Won't Load
**Problem**: "Please select a .md or .markdown file" error

**Solutions**:
- Ensure file has .md or .markdown extension
- Rename file if using different extension
- Check file isn't corrupted

### Copy/Download Not Working
**Problem**: Buttons don't respond

**Solutions**:
- Ensure browser allows clipboard access
- Check for HTTPS connection (required for clipboard API)
- Try a different browser

### Content Lost After Closing
**Problem**: Work disappeared after closing tab

**Solutions**:
- Content is stored in localStorage (device-specific)
- Use Download MD/HTML to save permanent copies
- Commit to Git for version control

## Technical Details

### Architecture
```
MarkdownEditorPage (page.tsx)
├── Header Section
│   ├── Badge (GitHub-Flavored Markdown • Live Preview)
│   ├── Gradient Title
│   └── Description
├── View Mode Card
│   ├── Desktop: ToolOperationGrid
│   └── Mobile: ToolMobilePicker
├── Stats Bar (Badges)
├── Actions Card (6 buttons)
├── Editor/Preview Grid
│   ├── Markdown Editor (Textarea)
│   └── Live Preview (ReactMarkdown)
├── Pro Tips Section
├── How to Use Guide
├── Social Share
├── FAQ Accordion
├── Related Tools
├── Tool Rating
└── Keyboard Shortcuts Dialog
```

### Key Components

```typescript
type ViewMode = 'split' | 'editor' | 'preview'

// Document statistics (derived values)
const lines = value.split('\n').length
const chars = value.length
const words = value.trim().split(/\s+/).filter(Boolean).length
const headings = (value.match(/^#{1,6}\s/gm) || []).length
const codeBlocks = (value.match(/```/g) || []).length / 2
const links = (value.match(/\[.*?\]\(.*?\)/g) || []).length
const images = (value.match(/!\[.*?\]\(.*?\)/g) || []).length
const taskLists = (value.match(/^- \[[ x]\]/gm) || []).length
```

### Dynamic Imports
The editor uses dynamic imports for optimal performance:
```typescript
// ReactMarkdown with SSR disabled
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false })

// Markdown plugins loaded dynamically
const [remarkGfmModule, rehypeHighlightModule, rehypeRawModule] = await Promise.all([
  import('remark-gfm'),
  import('rehype-highlight'),
  import('rehype-raw'),
])
```

### HTML Export Template
Exported HTML includes:
- GitHub Markdown CSS (v5.5.1)
- Highlight.js GitHub Dark theme (v11.9.0)
- Responsive container styling
- Dark mode background (#0d1117)

### Dependencies
- `react-markdown`: Markdown to React rendering
- `remark-gfm`: GitHub Flavored Markdown support
- `rehype-highlight`: Syntax highlighting (highlight.js)
- `rehype-raw`: Raw HTML support in markdown
- `framer-motion`: Smooth animations
- `lucide-react`: Icons
- `sonner`: Toast notifications

### Supported Languages (highlight.js)
JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, HTML, CSS, SCSS, JSON, YAML, XML, SQL, Bash, PowerShell, Markdown, and 150+ more.

## Analytics Events

The tool tracks the following events for usage analysis:

| Event | Trigger | Data |
|-------|---------|------|
| `markdown_editor_mode_change` | View mode changed | `mode` |
| `markdown_editor_copy_md` | Copy Markdown clicked | None |
| `markdown_editor_copy_html` | Copy HTML clicked | None |
| `markdown_editor_download_md` | Download MD clicked | None |
| `markdown_editor_download_html` | Download HTML clicked | None |
| `markdown_editor_load_file` | File loaded | `filename` |
| `markdown_editor_reset` | Reset clicked | None |

## Related Tools

| Tool | Relationship |
|------|--------------|
| [JSON Beautifier](/tools/data/json-beautify) | Format JSON for documentation |
| [Text Transform](/tools/productivity/text-transform) | Transform text case and formatting |
| [Diff Viewer](/tools/development/diff-viewer) | Compare markdown versions |
| [Code Formatter](/tools/development/code-formatter) | Format code before pasting |

## FAQ

### Q: Does this support GitHub-Flavored Markdown?
**A**: Yes! Full GFM support including tables, task lists, strikethrough, auto-linking, code fencing with language identifiers, and emoji shortcuts.

### Q: Can I load existing markdown files?
**A**: Yes, click the "Load File" button and select any .md or .markdown file. The content will be displayed with live preview immediately.

### Q: Is my content saved automatically?
**A**: Content is saved to browser localStorage as you type. However, this is device-specific. For permanent storage, use the download feature or commit to version control.

### Q: How do I add code with syntax highlighting?
**A**: Use triple backticks followed by the language name:
````markdown
```javascript
const greeting = 'Hello!'
```
````
The editor supports 180+ programming languages.

### Q: Can I export to HTML?
**A**: Yes! Click "Download HTML" to get a fully styled HTML document with GitHub CSS and syntax highlighting. You can also "Copy HTML" to paste the rendered content elsewhere.

### Q: What's the best view mode for documentation?
**A**: Split View is ideal for documentation work - you can write markdown while seeing the rendered output side-by-side. Use Preview Only for final review.

### Q: Does it work offline?
**A**: Yes! All markdown rendering and syntax highlighting happens client-side in your browser. You can write and preview offline, then download your files when ready.

### Q: How do I create tables?
**A**: Use pipes and hyphens:
```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```
Tables support left, center, and right alignment.

### Q: Can I use emojis?
**A**: Yes! You can paste emojis directly or use GitHub-style shortcodes. The preview will render emojis correctly.

### Q: What's the maximum document size?
**A**: There's no hard limit, but very large documents (10,000+ lines) may slow down the live preview. For best performance, keep documents under 5,000 lines.

## Best Practices

### For README Files
1. Start with a clear project title (# Title)
2. Add badges for build status, license, etc.
3. Include installation instructions with code blocks
4. Document key features with bullet points
5. Add contributing guidelines
6. End with license information

### For Documentation
1. Use consistent heading hierarchy
2. Include code examples for all features
3. Add tables for parameters and options
4. Link to related documentation
5. Keep sections focused and scannable

### For Technical Writing
1. Define terms on first use
2. Use numbered lists for procedures
3. Include expected output for code examples
4. Add troubleshooting sections
5. Provide links to external resources

## Changelog

### Version 1.0.0 (January 2026)
- Initial release with full GFM support
- Three view modes (Editor, Split, Preview)
- Syntax highlighting for 180+ languages
- Real-time document statistics
- Export to Markdown and HTML
- Copy to clipboard functionality
- File loading support
- Keyboard shortcuts
- Responsive design with mobile picker
- GitHub Dark theme styling
- Pro tips and how-to guide
- Comprehensive FAQ section
- Social sharing integration
- Tool rating system

---

*Part of SuperTool - Your Developer Toolkit*
*Productivity Tools Category*
