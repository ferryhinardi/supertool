# 08 - Text Transformer

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Productivity Tools  
**Status:** ✅ Active · 🔥 Popular

## Overview

A Swiss Army knife for text manipulation with 17+ transformation operations. Convert case, clean formatting, sort lines, find & replace, and apply batch transformations—all instantly in your browser.

## Purpose

Text editing often requires repetitive formatting tasks: converting case, removing duplicates, sorting lines, or cleaning whitespace. This tool eliminates manual work with one-click transformations perfect for developers, writers, and data processors.

## Key Features

### 1. **Case Transformations** (6 types)

- **UPPERCASE**: ALL CAPS
- **lowercase**: all lowercase
- **Title Case**: First Letter Of Each Word
- **Sentence case**: First letter of each sentence
- **camelCase**: for JavaScript variables
- **PascalCase**: for class names
- **snake_case**: for Python/database fields
- **kebab-case**: for URLs and CSS classes

### 2. **Text Cleaning** (4 operations)

- **Remove Duplicate Lines**: Unique lines only
- **Remove Empty Lines**: Compact text
- **Trim Lines**: Remove leading/trailing spaces
- **Remove Extra Spaces**: Collapse multiple spaces

### 3. **Sorting & Organization** (3 operations)

- **Sort A→Z**: Alphabetical ascending
- **Sort Z→A**: Alphabetical descending
- **Reverse Lines**: Flip order

### 4. **Line Modifications** (2 operations)

- **Add Line Numbers**: Prefix each line with number
- **Remove Line Numbers**: Strip numeric prefixes

### 5. **Find & Replace**

- Real-time search highlighting
- Batch replace all occurrences
- Case-sensitive/insensitive options
- Regular expression support (future)

### 6. **Undo System**

- 50-step history
- Undo/Redo buttons
- Preserves all transformations
- Never lose work

### 7. **Real-Time Statistics**

- Lines count
- Words count
- Characters count (with/without spaces)
- Paragraphs count

## How It Works

### Transform Engine

Each transformation is a pure function:

```typescript
type TransformOperation =
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'camelcase'
  | 'snakecase'
  | 'kebabcase'
  | 'removeDuplicateLines'
  | 'sortAsc'
  | 'sortDesc'

const transforms: Record<TransformOperation, (text: string) => string> = {
  uppercase: (text) => text.toUpperCase(),

  lowercase: (text) => text.toLowerCase(),

  titlecase: (text) =>
    text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()),

  camelcase: (text) => {
    const words = text.toLowerCase().split(/[\s_-]+/)
    return (
      words[0] +
      words
        .slice(1)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('')
    )
  },

  snakecase: (text) => text.toLowerCase().replace(/[\s-]+/g, '_'),

  kebabcase: (text) => text.toLowerCase().replace(/[\s_]+/g, '-'),

  removeDuplicateLines: (text) => [...new Set(text.split('\n'))].join('\n'),

  sortAsc: (text) =>
    text
      .split('\n')
      .sort((a, b) => a.localeCompare(b))
      .join('\n'),

  // ... more transforms
}
```

### Undo System

```typescript
const [history, setHistory] = useState<string[]>([initialText])
const [historyIndex, setHistoryIndex] = useState(0)

const pushHistory = (newText: string) => {
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(newText)

  // Keep last 50 entries
  if (newHistory.length > 50) {
    newHistory.shift()
  }

  setHistory(newHistory)
  setHistoryIndex(newHistory.length - 1)
}

const undo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(historyIndex - 1)
    setText(history[historyIndex - 1])
  }
}

const redo = () => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(historyIndex + 1)
    setText(history[historyIndex + 1])
  }
}
```

### Find & Replace

```typescript
const handleFindReplace = () => {
  if (!findText) return

  const flags = caseSensitive ? 'g' : 'gi'
  const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)

  const newText = text.replace(regex, replaceText)

  pushHistory(newText)
  setText(newText)

  const occurrences = (text.match(regex) || []).length
  toast.success(`Replaced ${occurrences} occurrence(s)`)
}
```

## Usage Instructions

### Quick Transformations

1. **Paste Text**: Enter or paste text in the textarea
2. **Choose Operation**: Click any transformation button
3. **View Result**: Text updates instantly
4. **Undo if Needed**: Click undo to revert

### Case Conversion Workflow

**For Variables:**

```
Input: "user profile data"
→ Click camelCase → "userProfileData"

Input: "UserProfileData"
→ Click snake_case → "user_profile_data"
```

**For Titles:**

```
Input: "the quick brown fox"
→ Click Title Case → "The Quick Brown Fox"
```

### Text Cleaning Workflow

**Remove Duplicates:**

```
Input:
apple
banana
apple
cherry
banana

→ Click "Remove Duplicate Lines"

Output:
apple
banana
cherry
```

**Clean Formatting:**

```
Input:
  extra   spaces    everywhere

  empty lines

→ Click "Remove Extra Spaces" + "Remove Empty Lines"

Output:
extra spaces everywhere
```

### Find & Replace

1. **Enter Find Text**: Type word/phrase to search
2. **Enter Replace Text**: Type replacement
3. **Optional: Toggle Case Sensitive**
4. **Click "Replace All"**: All instances replaced
5. **Review**: Check result
6. **Undo if Wrong**: Click undo

### Batch Operations

Apply multiple transforms sequentially:

```
1. Remove Empty Lines
2. Trim Lines
3. Remove Duplicates
4. Sort A→Z
5. Add Line Numbers
```

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  Header (Type Icon + Title)        │
├─────────────────────────────────────┤
│  Transformation Buttons Grid        │
│  [Case] [Case] [Case] [Case]       │
│  [Clean] [Clean] [Sort] [Sort]     │
├─────────────────────────────────────┤
│  Text Area (Large)                  │
│  [Real-time statistics below]       │
├─────────────────────────────────────┤
│  Find & Replace Panel               │
│  [Find Input] [Replace Input]       │
│  [Replace All Button]               │
├─────────────────────────────────────┤
│  Actions: Copy | Download | Clear   │
│  Undo/Redo History                  │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Purple to pink (text/formatting theme)
- **Button Categories**: Color-coded by operation type
  - Case: Blue
  - Clean: Green
  - Sort: Orange
  - Modify: Purple
- **Monospace Font**: For code transformations
- **Glass Cards**: Semi-transparent panels

### Categorized Buttons

Buttons organized by function for easy discovery:

- **Case Transformations**: First row
- **Cleaning Operations**: Second row
- **Sorting & Modifications**: Third row

## Analytics Events

```typescript
trackToolEvent('text_transform', {
  operation: 'camelcase',
  input_length: 250,
})

trackToolEvent('text_find_replace', {
  occurrences: 15,
  case_sensitive: true,
})

trackToolEvent('text_undo', {
  history_position: 5,
})
```

## Use Cases

### 1. **Code Formatting**

**Snake Case to Camel Case:**

```
user_profile_id → userProfileId
api_response_data → apiResponseData
```

**Class Name Formatting:**

```
user profile manager → UserProfileManager
api client service → ApiClientService
```

### 2. **Data Cleanup**

**CSV Column Headers:**

```
First Name → FIRST_NAME
Email Address → EMAIL_ADDRESS
Phone Number → PHONE_NUMBER
```

**Remove Survey Duplicates:**
Clean up repeated responses before analysis.

### 3. **Content Writing**

**Title Capitalization:**

```
how to build a website → How To Build A Website
```

**Sentence Formatting:**

```
this is great. another sentence. final one.
→ This is great. Another sentence. Final one.
```

### 4. **URL Generation**

**Slug Creation:**

```
My Amazing Blog Post → my-amazing-blog-post
Product: Super Widget 3000 → product-super-widget-3000
```

### 5. **List Management**

**Alphabetize:**

```
Zebra
Apple
Mango
Banana

→ Sort A→Z →

Apple
Banana
Mango
Zebra
```

### 6. **SQL/Database**

**Table Column Names:**

```
Created At → created_at
User Full Name → user_full_name
```

## Keyboard Shortcuts (Future)

Planned shortcuts:

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Ctrl/Cmd + F`: Find & Replace focus
- `Ctrl/Cmd + Shift + U`: Uppercase
- `Ctrl/Cmd + Shift + L`: Lowercase

## Performance

- **Instant**: < 10ms for most operations
- **Large Text**: Handles up to 1MB+ text
- **No Lag**: Debounced updates for live stats
- **Memory Efficient**: Limited history prevents bloat

## Limitations

- **Very Large Files**: May slow down browser (> 10MB)
- **Complex Regex**: Not yet supported in find/replace
- **Unicode Edge Cases**: Some special characters may behave unexpectedly
- **Undo Limit**: 50 steps maximum

## Browser Support

✅ All modern browsers  
✅ Mobile responsive  
✅ Works offline (no network needed)

## Future Enhancements

- [ ] Regular expression find/replace
- [ ] Custom transformation macros
- [ ] Batch file processing
- [ ] Save transformation presets
- [ ] Export transformation history
- [ ] Multi-cursor editing
- [ ] Syntax highlighting
- [ ] Column-mode editing
- [ ] Text comparison mode
- [ ] Character encoding conversion

## Related Tools

- **Code Diff Viewer** - Compare before/after transformations
- **Markdown Editor** - Format text as markdown
- **JSON Beautifier** - Format JSON data

## Pro Tips

💡 **Chain Transformations**: Apply multiple operations for complex formatting  
💡 **Use Undo Liberally**: Experiment without fear  
💡 **Check Statistics**: Verify line count changes  
💡 **Copy Result**: Keep original in clipboard before transforming  
💡 **Find Preview**: Check matches before replacing all

---

**Route:** `/tools/text-transformer`  
**Component:** `app/tools/text-transformer/page.tsx`  
**Features:** 17+ transformations, find/replace, undo system, statistics
