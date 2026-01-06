# JSON to CSV Converter

**Created**: January 6, 2026  
**Last Updated**: January 6, 2026  
**Tool Path**: `/tools/data/json-to-csv`  
**Category**: Data Tools  
**Complexity**: Simple

## Overview

The JSON to CSV Converter transforms JSON arrays into CSV (Comma-Separated Values) format with intelligent nested object flattening. It features a real-time preview, configurable delimiters, and instant statistics showing rows, columns, and character counts. Perfect for data analysts, developers, and anyone who needs to convert API responses or JSON data for spreadsheet applications.

## Key Features

- **Real-Time Conversion**: See CSV output instantly as you type or paste JSON
- **Nested Object Flattening**: Automatically flatten nested objects using dot notation (e.g., `address.city`)
- **Configurable Delimiter**: Use comma, semicolon, tab, or any custom delimiter
- **Live Statistics**: View row count, column count, and total character count in real-time
- **Syntax Highlighting**: CodeMirror-powered JSON editor with full syntax highlighting
- **One-Click Copy**: Copy CSV output directly to clipboard
- **Download as File**: Export CSV with timestamped filename
- **Array Handling**: Arrays are automatically converted to JSON strings
- **Client-Side Processing**: All conversion happens locally - no data sent to servers

## How to Use

### Basic Conversion

1. Navigate to the JSON to CSV Converter tool
2. Paste your JSON array into the editor (a sample is pre-loaded)
3. The CSV output appears instantly in the preview pane
4. Review the statistics bar showing rows, columns, and characters

### Configure Options

1. **Delimiter**: Change the default comma to semicolon, tab, or any character
2. **Flatten Nested Objects**: Toggle to flatten nested objects or keep them as-is

### Export Your Data

1. Click **Copy CSV** to copy the output to your clipboard
2. Click **Download CSV** to save as a `.csv` file with timestamp
3. Click **Reset** to restore the default example

### Example Input

```json
[
  {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "city": "New York",
      "zip": "10001"
    }
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com",
    "address": {
      "city": "Los Angeles",
      "zip": "90001"
    }
  }
]
```

### Example Output (with flattening enabled)

```csv
address.city,address.zip,age,email,name
New York,10001,30,john@example.com,John Doe
Los Angeles,90001,25,jane@example.com,Jane Smith
```

## Use Cases

### 1. API Response Processing
Convert JSON responses from REST APIs into CSV format for analysis in Excel or Google Sheets.

### 2. Database Export
Transform JSON exports from NoSQL databases (MongoDB, Firebase) into spreadsheet-compatible format.

### 3. Data Migration
Prepare JSON data for import into systems that require CSV format.

### 4. Report Generation
Convert application logs or analytics data from JSON to CSV for reporting tools.

### 5. Data Cleaning
Flatten complex nested JSON structures for easier data manipulation and analysis.

### 6. Spreadsheet Integration
Quickly move JSON data into Excel, Google Sheets, or other spreadsheet applications.

## Tips & Tricks

### Working with Nested Data
- Enable "Flatten nested objects" to convert `{"user": {"name": "John"}}` to `user.name` column
- Deeply nested objects maintain their full path: `user.address.city`
- Arrays within objects are converted to JSON strings for preservation

### Delimiter Selection
- Use **comma (,)** for standard CSV files
- Use **semicolon (;)** for European locale compatibility
- Use **tab** for TSV (Tab-Separated Values) format
- Custom delimiters useful for pipe-delimited files

### Best Practices
- Ensure your JSON is a valid array of objects (not a single object)
- All objects in the array should have consistent structure for best results
- Headers are automatically sorted alphabetically for consistency

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Select all text in editor |
| `Ctrl/Cmd + Z` | Undo changes |
| `Ctrl/Cmd + Shift + Z` | Redo changes |
| `Ctrl/Cmd + F` | Find in editor |
| `Ctrl/Cmd + K` | Open tool search |

## Troubleshooting

### "Input must be an array of objects"
**Cause**: JSON is a single object, not an array  
**Solution**: Wrap your object in array brackets: `[{...}]`

### "Array cannot be empty"
**Cause**: Empty array `[]` provided  
**Solution**: Add at least one object to the array

### "Invalid JSON format"
**Cause**: Malformed JSON syntax  
**Solution**: Check for missing quotes, commas, or brackets. Use the syntax highlighting to identify errors

### Columns Missing in Output
**Cause**: Objects have inconsistent keys  
**Solution**: The converter automatically includes all unique keys across all objects

### Special Characters in Output
**Cause**: Values contain delimiter or quotes  
**Solution**: The converter automatically escapes these with proper CSV quoting

## Technical Details

### Libraries Used
- **CodeMirror**: Advanced code editor with JSON syntax highlighting
- **@codemirror/lang-json**: JSON language support for CodeMirror
- **Dynamic Import**: CodeMirror loaded dynamically to reduce initial bundle (~200KB savings)

### CSV Escaping Rules
- Fields containing the delimiter are wrapped in double quotes
- Fields containing double quotes have quotes escaped as `""`
- Fields containing newlines are properly quoted
- Null/undefined values become empty strings

### Performance
- Real-time conversion using `useMemo` for efficient re-computation
- Handles arrays with hundreds of objects smoothly
- Large datasets (1000+ rows) may experience slight delay

### Browser Compatibility
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- All modern browsers with ES2020 support

### Privacy & Security
- All processing happens entirely in your browser
- No JSON data is transmitted to any server
- Downloaded files are generated client-side using Blob API
- Safe for sensitive or confidential data

## Analytics Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `json_copy` | CSV copied to clipboard | `output_length` |
| `json_download` | CSV downloaded as file | `file_size_kb` |

## Related Tools

- **[CSV to Excel Converter](/tools/data/csv-excel)** - Convert CSV files to Excel format
- **[JSON Formatter](/tools/development/json-formatter)** - Format and validate JSON
- **[UUID Generator](/tools/data/uuid-generator)** - Generate unique identifiers for your data
- **[Base64 Encoder](/tools/development/base64)** - Encode/decode Base64 data

## FAQ

**Q: What's the maximum size JSON I can convert?**  
A: There's no hard limit, but for optimal performance, keep arrays under 10,000 objects. Very large datasets may cause browser slowdown.

**Q: Can I convert a single JSON object (not an array)?**  
A: No, the input must be an array of objects. Wrap single objects in brackets: `[{...}]`

**Q: How are nested arrays handled?**  
A: Nested arrays are converted to JSON strings (e.g., `["a","b"]`) to preserve the data structure.

**Q: Can I change the column order?**  
A: Columns are automatically sorted alphabetically. For custom ordering, you'll need to rearrange in your spreadsheet application.

**Q: Is my data secure?**  
A: Yes, all processing happens in your browser. No data is ever sent to any server.

**Q: What delimiter should I use for Excel?**  
A: Comma works best for most Excel versions. European users may prefer semicolon depending on locale settings.

## Best Practices

1. Validate your JSON syntax before conversion
2. Use consistent object structures across array items
3. Enable flattening for nested objects to get cleaner CSV columns
4. Preview the output before downloading large files
5. Use appropriate delimiter for your target application
6. Keep sensitive data local - this tool never uploads your data

## Changelog

### v1.0.0 (January 2026)
- Initial release
- JSON to CSV conversion with real-time preview
- Nested object flattening with dot notation
- Configurable delimiter support
- Copy and download functionality
- CodeMirror editor with syntax highlighting
- Real-time statistics display
