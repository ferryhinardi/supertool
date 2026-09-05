# 05 - Code Diff Viewer

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Development Tools  
**Status:** ✅ Active

## Overview

The Code Diff Viewer is a sophisticated side-by-side comparison tool for visualizing changes between two versions of text or code. With support for split/unified views, JSON formatting, and real-time statistics, it's perfect for code reviews, debugging, and document comparison.

## Purpose

Developers need to quickly understand what changed between file versions, debug regressions, or review pull requests. This tool provides a visual diff interface similar to GitHub's comparison view but with instant client-side processing and JSON-aware formatting.

## Key Features

### 1. **Dual View Modes**

- **Split View**: Side-by-side comparison (default)
- **Unified View**: Combined view with inline diff markers
- Instant switching between modes
- Preserves scroll position

### 2. **Content Type Support**

- **Plain Text**: General text comparison
- **JSON**: With auto-formatting and validation
- Syntax highlighting for JSON
- Real-time validation status

### 3. **Visual Diff Indicators**

- 🟢 Green: Added lines
- 🔴 Red: Removed lines
- 🟡 Yellow: Modified lines
- Line numbers for reference
- Inline character-level diff

### 4. **Smart Statistics**

- Lines added/removed/changed
- Character count difference
- JSON validation status
- Real-time updates as you type

### 5. **JSON Formatting**

- Auto-format JSON with pretty print
- 2-space indentation
- Syntax validation
- Format each side independently

### 6. **Export & Actions**

- Copy diff output
- Download as `.diff` file
- Clear/reset functionality
- Sample data loading

## How It Works

### Diff Algorithm

Uses `react-diff-viewer-continued` library with Myers diff algorithm:

```tsx
<ReactDiffViewer
  oldValue={oldValue}
  newValue={newValue}
  splitView={viewType === 'split'}
  showDiffOnly={false}
  useDarkTheme={true}
  compareMethod={DiffMethod.WORDS}
/>
```

### Statistics Calculation

```typescript
const stats = useMemo(() => {
  const oldLines = oldValue.split('\n').length
  const newLines = newValue.split('\n').length
  const oldChars = oldValue.length
  const newChars = newValue.length

  // JSON validation
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
```

### JSON Formatting

```typescript
const handleFormatJSON = (side: 'old' | 'new') => {
  try {
    const value = side === 'old' ? oldValue : newValue
    const parsed = JSON.parse(value)
    const formatted = JSON.stringify(parsed, null, 2)

    if (side === 'old') {
      setOldValue(formatted)
    } else {
      setNewValue(formatted)
    }

    toast.success('JSON formatted successfully! ✨')
  } catch (error) {
    toast.error(`Failed to format: ${error.message}`)
  }
}
```

## Usage Instructions

### Basic Text Comparison

1. **Enter Original**: Paste text in left panel ("Original / Old Version")
2. **Enter Modified**: Paste text in right panel ("Modified / New Version")
3. **View Diff**: Changes highlighted automatically
4. **Switch View**: Toggle between Split/Unified views

### JSON Comparison

1. **Select Content Type**: Click "JSON" button
2. **Paste JSON**: Enter JSON in both panels
3. **Validate**: Check badges for validity status
4. **Format**: Click "Format Old" or "Format New" buttons
5. **Compare**: Review formatted diff

### Reading the Diff

**Color Legend:**

- **Green background**: Added lines
- **Red background**: Removed lines
- **Yellow background**: Modified lines
- **Dark green/red highlights**: Character-level changes

**Navigation:**

- Scroll both panels synchronously
- Line numbers help locate changes
- Click lines for detailed view

### Export Workflow

1. **Review Diff**: Ensure comparison is correct
2. **Copy**: Click copy icon for clipboard
3. **Download**: Click download icon for `.diff` file
4. **Share**: Send file to team members

## Example Use Cases

### Code Review

```diff
- const apiUrl = 'http://localhost:3000'
+ const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

- fetch(apiUrl + '/api/users')
+ fetch(`${apiUrl}/api/users`)
```

### Configuration Changes

```json
Old:
{
  "timeout": 3000,
  "retries": 3
}

New:
{
  "timeout": 5000,
  "retries": 5,
  "backoff": "exponential"
}
```

### Documentation Updates

Compare README versions, changelog entries, or API documentation to see exactly what changed between releases.

## UI Design

### Layout Structure

```
┌─────────────────────────────────────┐
│  Header (Git Compare Icon)         │
├─────────────────────────────────────┤
│  View Toggle | Content Type         │
├──────────────────┬──────────────────┤
│  Original Text  │  Modified Text   │
│  [Textarea]     │  [Textarea]      │
│                 │                  │
│  Stats & JSON   │  Stats & JSON    │
│  Format Buttons │  Format Buttons  │
├──────────────────┴──────────────────┤
│  Diff Viewer (Split or Unified)    │
│  [Dynamic diff display]             │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Orange to red (comparison/change theme)
- **Glass Cards**: Backdrop-blur for modern look
- **Dark Theme**: Matches code editor aesthetic
- **Monospace Font**: For code/JSON readability

### Responsive Design

- **Desktop**: Side-by-side panels
- **Tablet**: Stacked panels
- **Mobile**: Full-width panels with scroll

## Technical Implementation

### Dependencies

```json
{
  "react-diff-viewer-continued": "^3.x.x",
  "lucide-react": "Icons",
  "sonner": "Toast notifications"
}
```

### Dynamic Import

```tsx
const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
  ssr: false,
  loading: () => <div>Loading diff viewer...</div>,
})
```

Prevents SSR issues and reduces initial bundle size.

### State Management

```typescript
const [oldValue, setOldValue] = useState('')
const [newValue, setNewValue] = useState('')
const [viewType, setViewType] = useState<DiffViewType>('split')
const [contentType, setContentType] = useState<ContentType>('text')
```

### Performance Optimization

- **useMemo** for stats calculation (prevents re-renders)
- **Dynamic import** for diff library (code splitting)
- **Debouncing** on large inputs (prevents lag)

## Analytics Events

```typescript
trackToolEvent('diff_compare', {
  view_type: 'split',
  content_type: 'json',
  lines_diff: 15,
})

trackToolEvent('diff_export', {
  format: 'file',
  size_bytes: 2048,
})
```

## Common Workflows

### Git Commit Review

1. Copy old file version
2. Copy new file version
3. Paste in diff viewer
4. Review changes before committing

### API Response Comparison

1. Set content type to JSON
2. Paste old API response
3. Paste new API response
4. Format both for readability
5. Identify breaking changes

### Debugging

1. Paste working code in left panel
2. Paste broken code in right panel
3. Identify what changed
4. Find regression cause

## Limitations

- **Large Files**: May lag with 10,000+ lines
- **Binary Files**: Not supported (text only)
- **No Git Integration**: Manual paste required
- **Client-Side Only**: No server-side diff storage

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
⚠️ Requires JavaScript enabled

## Future Enhancements

- [ ] Git integration (paste commit SHA)
- [ ] Multiple file comparison
- [ ] Syntax highlighting for more languages
- [ ] Ignore whitespace option
- [ ] Three-way merge view
- [ ] Patch file generation
- [ ] Line-by-line comments
- [ ] Save comparison history

## Related Tools

- **JSON Beautifier** - Format JSON before comparing
- **Text Transformer** - Clean text before diff
- **Markdown Editor** - Compare markdown documents

---

**Route:** `/tools/diff`  
**Component:** `app/tools/diff/page.tsx`  
**Library:** `react-diff-viewer-continued`
