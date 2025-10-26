# 01 - JSON Beautifier & Formatter

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Data Tools  
**Status:** ✅ Active

## Overview

The JSON Beautifier & Formatter is a professional-grade JSON manipulation tool designed for developers and data analysts. It provides real-time syntax highlighting, validation, and formatting capabilities to help you work with JSON data efficiently.

## Purpose

This tool solves the common problem of dealing with minified or poorly formatted JSON data. Whether you're debugging API responses, examining configuration files, or cleaning up JSON exports, this tool makes JSON data human-readable and easier to work with.

## Key Features

### 1. **Real-time Syntax Highlighting**

- Powered by CodeMirror with JSON language support
- Color-coded JSON syntax for better readability
- Dark theme with purple accent colors matching the app's design system

### 2. **JSON Validation**

- Instant validation as you type
- Clear error messages for invalid JSON
- Visual indicators (badges) showing validation status

### 3. **Beautify & Minify**

- **Beautify**: Formats JSON with proper indentation (2 spaces)
- **Minify**: Compresses JSON by removing whitespace
- One-click transformations with toast notifications

### 4. **Statistics Dashboard**

- Line count
- Character count
- Validation status
- Object depth calculation

### 5. **Export Options**

- **Copy to Clipboard**: One-click copy with visual feedback
- **Download as File**: Save formatted JSON as `.json` file

## How It Works

### Technical Implementation

1. **Editor Component**: Uses `@uiw/react-codemirror` with `@codemirror/lang-json` extension

   ```tsx
   <CodeMirror value={value} extensions={[json()]} onChange={setValue} />
   ```

2. **Validation Logic**:
   - Wraps `JSON.parse()` in try-catch block
   - Calculates object depth recursively
   - Updates stats in real-time using `useMemo` hook

3. **Beautification**:

   ```typescript
   const obj = JSON.parse(value)
   setValue(JSON.stringify(obj, null, 2)) // 2-space indentation
   ```

4. **Minification**:
   ```typescript
   const obj = JSON.parse(value)
   setValue(JSON.stringify(obj)) // No whitespace
   ```

### State Management

- Single state variable `value` stores the JSON string
- Derived stats computed using `useMemo` for performance
- React Compiler optimization enabled (no manual memoization needed)

## Usage Instructions

### Basic Workflow

1. **Paste or type JSON** into the editor
2. **Monitor the stats** panel for validation status
3. **Click "Beautify"** to format with indentation
4. **Click "Minify"** to compress JSON
5. **Copy or Download** the result

### Example Use Cases

#### API Response Debugging

```json
// Input (minified from API):
{"userId":1,"id":1,"title":"delectus aut autem","completed":false}

// After Beautify:
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

#### Configuration File Cleanup

- Import messy config files
- Beautify for readability
- Download formatted version

## Analytics Events

The tool tracks these user interactions:

- `json_beautify` - When user beautifies JSON
- `json_minify` - When user minifies JSON
- `json_copy` - When user copies to clipboard
- `json_download` - When user downloads file

All events include success status and character count (anonymized).

## UI/UX Details

### Layout

- **Main Editor**: Full-width CodeMirror instance with glassmorphic card
- **Stats Panel**: Top-right badges showing real-time metrics
- **Action Buttons**: Bottom toolbar with primary actions

### Design Elements

- Purple/pink gradient header icon
- Glassmorphism effects (backdrop-blur)
- Responsive grid layout
- Toast notifications for user feedback

### Accessibility

- Keyboard shortcuts supported by CodeMirror
- ARIA labels on interactive elements
- High contrast syntax highlighting

## Performance Optimizations

1. **useMemo for Stats**: Prevents unnecessary recalculations
2. **React Compiler**: Automatic optimization of component renders
3. **Lazy Parsing**: Only parses on beautify/minify actions, not on every keystroke

## Error Handling

- Invalid JSON shows error toast with details
- Try-catch blocks prevent app crashes
- Graceful fallback for edge cases

## Dependencies

- `@uiw/react-codemirror` - Code editor component
- `@codemirror/lang-json` - JSON syntax highlighting
- `sonner` - Toast notifications
- `lucide-react` - Icons

## File Structure

```
app/tools/json-beautify/
├── page.tsx              # Main component
└── __tests__/
    └── logic.test.ts     # Unit tests for JSON operations
```

## Future Enhancements

- [ ] JSON Schema validation
- [ ] Compare two JSON objects
- [ ] JSON path finder
- [ ] Convert JSON to other formats (YAML, XML)
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts panel

## Related Tools

- **JSON to CSV Converter** - For tabular data export
- **Code Diff Viewer** - For comparing JSON versions
- **Text Transformer** - For additional text manipulations

---

**Route:** `/tools/json-beautify`  
**Component:** `app/tools/json-beautify/page.tsx`  
**Tests:** `app/tools/json-beautify/__tests__/logic.test.ts`
