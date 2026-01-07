# Batch File Renamer

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/productivity/batch-rename`
**Category**: Productivity Tools
**Complexity**: Complex (1039 lines)

## Overview

The Batch File Renamer is a powerful client-side tool for renaming multiple files simultaneously using flexible pattern rules. It supports prefix/suffix additions, find & replace operations (with regex support), sequential numbering, and case transformations. All processing happens locally in the browser, ensuring complete privacy.

## Key Features

### 1. Drag & Drop File Upload
- Intuitive drag-and-drop interface for adding files
- Click-to-browse alternative file selection
- Support for all file types
- No file size limitations
- Batch file addition with count display

### 2. Pattern-Based Renaming
- **Prefix Addition**: Add text before the filename
- **Suffix Addition**: Add text after the filename (before extension)
- **Find & Replace**: Simple text or regex-based replacement
- **Regex Support**: Enable advanced pattern matching
- **Sequential Numbering**: Insert auto-incrementing numbers using `{n}` placeholder

### 3. Case Transformations
- None (preserve original)
- lowercase
- UPPERCASE
- Capitalize Each Word
- camelCase
- kebab-case

### 4. Sequential Numbering Options
- **Start Number**: Begin sequence at any number
- **Step**: Increment by custom value (1, 2, 5, etc.)
- **Padding**: Zero-pad numbers (e.g., 001, 002, 003)

### 5. Real-Time Preview
- Live preview of all filename changes
- Visual indicators for changed vs unchanged files
- Error detection for invalid filenames
- Duplicate filename warnings
- Side-by-side original/new name comparison

### 6. Validation & Error Handling
- Detects invalid characters (`< > : " / \ | ? *`)
- Warns about empty filenames
- Highlights duplicate filename conflicts
- Prevents download if validation errors exist

## How to Use

### Basic Workflow

1. **Upload Files**
   - Drag files onto the upload zone, or
   - Click to browse and select files

2. **Configure Pattern**
   - Set prefix/suffix as needed
   - Enter find/replace text
   - Configure sequential numbering
   - Choose case transformation

3. **Preview Changes**
   - Review all renamed filenames in the preview table
   - Check for errors (red highlighting)
   - Verify no duplicates exist

4. **Download Renamed Files**
   - Click "Download Renamed Files"
   - Each file downloads with its new name

### Using Sequential Numbers

Add `{n}` in your prefix or suffix to insert sequential numbers:

| Pattern | Files | Result |
|---------|-------|--------|
| `photo_{n}` | 3 photos | `photo_001.jpg`, `photo_002.jpg`, `photo_003.jpg` |
| `{n}_document` | 2 PDFs | `001_document.pdf`, `002_document.pdf` |

Configure sequence with:
- **Start**: First number (default: 1)
- **Step**: Increment value (default: 1)
- **Padding**: Zero-padding width (default: 3 → 001)

### Using Regex

Enable "Use Regex" for powerful pattern matching:

| Pattern | Replacement | Effect |
|---------|-------------|--------|
| `IMG_\d+` | `photo` | Replace `IMG_1234` with `photo` |
| `^(\d+)_` | `$1-` | Change `01_file` to `01-file` |
| `\s+` | `_` | Replace all whitespace with underscores |

## Use Cases

### Photography
- Rename vacation photos: `Hawaii_2026_{n}` → `Hawaii_2026_001.jpg`
- Organize by date: `2026-01-06_{n}` → `2026-01-06_001.jpg`

### Document Management
- Add project prefix: `ProjectX_` + filename
- Standardize case: UPPERCASE → lowercase
- Remove special characters via regex

### Development
- Rename assets: `icon_{n}` → `icon_001.png`
- Convert to kebab-case for URLs
- Add version suffixes: `_v2`

### Batch Processing
- Convert `IMG_XXXX.jpg` to `photo_001.jpg`
- Standardize file naming conventions
- Prepare files for upload with consistent naming

## Tips & Tricks

1. **Test with Preview First**: Always verify changes in the preview before downloading
2. **Use Padding for Sorting**: Set padding to ensure files sort correctly (001 before 010)
3. **Combine Transformations**: Use prefix + case transform + suffix for complex renaming
4. **Regex for Complex Patterns**: Enable regex for advanced find/replace operations
5. **Clear Between Batches**: Use "Clear All" to start fresh with new files
6. **Watch for Duplicates**: The tool automatically detects and warns about duplicate names

## Troubleshooting

### "Contains invalid characters" Error
Windows filenames cannot contain: `< > : " / \ | ? *`
**Solution**: Use find/replace to remove these characters

### "Duplicate filename" Warning
Two or more files will have the same name after renaming.
**Solution**: Add sequential numbering `{n}` or modify patterns

### "Filename cannot be empty" Error
Pattern results in an empty filename (no characters before extension).
**Solution**: Add content via prefix, suffix, or adjust find/replace

### Files Not Downloading
Check for validation errors in the preview table.
**Solution**: Fix all errors (red highlighting) before downloading

## Technical Details

### Architecture
- **Client-Side Processing**: All operations run in browser
- **State Management**: React useState hooks
- **File Handling**: FileReader API for file access
- **Download**: Blob URLs with anchor element clicks

### Pattern Application Order
1. Find & Replace (text or regex)
2. Case Transformation
3. Prefix Addition
4. Suffix Addition
5. Sequence Number Replacement

### Validation Rules
- Invalid characters detection
- Empty filename check
- Duplicate detection across all files
- Real-time validation on pattern changes

### Performance
- Handles large batches (100+ files)
- Instant preview updates
- Memory-efficient blob handling

## Analytics Events

| Event | Trigger | Data |
|-------|---------|------|
| `batch_rename_open` | Page load | - |
| `batch_rename_upload` | Files added | `file_count` |
| `batch_rename_remove_file` | File removed | - |
| `batch_rename_clear` | Clear all files | - |
| `batch_rename_reset` | Reset patterns | - |
| `batch_rename_apply` | Download renamed | `file_count` |

## Related Tools

- **[Text Transformer](/tools/productivity/text-transformer)** - Case transformations for text
- **[File Inspector](/tools/development/file-inspector)** - View file metadata
- **[Regex Tester](/tools/development/regex-tester)** - Test regex patterns

## FAQ

**Q: Are my files uploaded to a server?**
A: No. All processing happens locally in your browser. Files never leave your device.

**Q: Is there a file size limit?**
A: No server-side limits. Limited only by your browser's memory.

**Q: Can I rename files in subfolders?**
A: The tool processes all files as a flat list. Subfolder structure is not preserved.

**Q: What happens to the original files?**
A: Original files remain unchanged. New files are downloaded with renamed versions.

**Q: Does it work offline?**
A: Yes, once loaded, the tool works completely offline.

## Best Practices

1. **Backup originals**: Keep original files in case renaming doesn't work as expected
2. **Start simple**: Test with a few files before processing large batches
3. **Use descriptive names**: Include dates, project names, or categories
4. **Standardize conventions**: Establish naming patterns for your workflow
5. **Preview thoroughly**: Check every renamed file before downloading

## Changelog

### v1.0.0 (January 2026)
- Initial release
- Pattern-based renaming with prefix/suffix
- Find & replace with regex support
- Sequential numbering with customizable padding
- Case transformations (6 options)
- Real-time preview with validation
- Error detection and duplicate warnings
