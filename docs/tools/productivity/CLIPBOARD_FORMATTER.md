# Clipboard Formatter

> **Category**: Productivity  
> **Path**: `/tools/productivity/clipboard-formatter`  
> **Status**: Active  
> **Processing**: 100% Client-side

## Overview

The Clipboard Formatter is a text cleaning and transformation tool that removes extra whitespace, normalizes line breaks, and applies case transformations. It features automatic formatting, clipboard history, and persistent settings.

## Features

### Core Features

- **Paste from Clipboard**: One-click paste from system clipboard
- **Auto-Format**: Automatically format text as you type or paste
- **Case Transformations**: UPPERCASE, lowercase, Title Case, Sentence case
- **Whitespace Cleaning**: Remove extra spaces, normalize tabs, trim lines

### Additional Features

- **Clipboard History**: Access last 5 clipboard items
- **Persistent Settings**: Settings saved in localStorage
- **Download Output**: Export formatted text as `.txt` file
- **URL State**: Input text persisted in URL for sharing
- **Real-time Stats**: Character, word, and line counts

## How to Use

1. **Paste Text**: Click "Paste from Clipboard" or type directly in the input area
2. **Auto-Format**: With auto-format enabled, text is formatted immediately
3. **Apply Transformations**:
   - Click **UPPER** for UPPERCASE
   - Click **lower** for lowercase
   - Click **Title** for Title Case
   - Click **Sentence** for Sentence case
4. **Export**: Copy to clipboard or download as text file
5. **History**: Click any history item to reload previous text

## Format Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Auto-format on input | Format text automatically as you type | On |
| Trim lines | Remove leading/trailing whitespace from each line | On |
| Remove empty lines | Delete blank lines from text | Off |
| Normalize line breaks | Convert Windows (CRLF) to Unix (LF) line endings | On |
| Tab size | Convert tabs to spaces (2, 4, or 8 spaces) | 4 spaces |

## Case Transformations

| Transformation | Example | Description |
|----------------|---------|-------------|
| UPPERCASE | `HELLO WORLD` | All characters uppercase |
| lowercase | `hello world` | All characters lowercase |
| Title Case | `Hello World` | First letter of each word capitalized |
| Sentence case | `Hello world` | First letter of sentences capitalized |

## Statistics Display

The tool shows real-time statistics for both input and output:

- **Characters**: Total character count
- **Words**: Word count (whitespace-separated)
- **Lines**: Number of lines
- **Characters Removed**: Difference between input and output lengths

## Clipboard History

- Automatically saves last 5 pasted items
- Click any history item to restore it
- Clear history with the "Clear" button
- History persists in localStorage

## Use Cases

- **Code Formatting**: Clean up copied code snippets
- **Data Cleaning**: Remove extra whitespace from data
- **Text Standardization**: Normalize line endings across platforms
- **Content Editing**: Quick case transformations for headlines
- **Email Cleanup**: Remove formatting artifacts from pasted emails
- **Documentation**: Clean text before inserting into docs

## Technical Details

### Processing

| Aspect | Details |
|--------|---------|
| Processing Location | 100% client-side (browser) |
| Data Storage | Settings and history in localStorage |
| URL State | Input text in query parameter |
| Dependencies | nuqs (URL state), Framer Motion |
| Privacy | No data sent to server |

### Format Operations (in order)

1. **Normalize line breaks**: `\r\n` and `\r` converted to `\n`
2. **Convert tabs**: Tabs replaced with spaces (based on tab size setting)
3. **Trim lines**: Leading/trailing whitespace removed from each line
4. **Remove empty lines**: Blank lines filtered out (if enabled)

### Settings Persistence

Settings are automatically saved to localStorage under the key `clipboard-formatter-settings` and restored on page load.

## Keyboard Shortcuts

The tool responds to standard browser shortcuts:
- `Ctrl/Cmd + V`: Paste from clipboard
- `Ctrl/Cmd + A`: Select all text
- `Ctrl/Cmd + C`: Copy selected text

## Related Tools

- [Text Transformer](/tools/productivity/text-transformer) - Advanced text transformations
- [Word Counter](/tools/productivity/word-counter) - Detailed text statistics
- [JSON Beautifier](/tools/data/json-beautify) - Format JSON data
- [Code Diff Viewer](/tools/development/diff) - Compare text differences

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with auto-format, case transforms, and clipboard history |
