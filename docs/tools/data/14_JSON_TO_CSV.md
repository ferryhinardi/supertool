# 14 - JSON to CSV Converter

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Data Tools  
**Status:** ✅ Active

## Overview

Convert JSON arrays to CSV format with support for nested object flattening, custom delimiters, and real-time preview. Perfect for data analysis, spreadsheet imports, and transforming API responses into tabular data.

## Purpose

JSON is great for APIs and structured data, but spreadsheets and data analysis tools require CSV. This converter bridges the gap, automatically handling nested structures and generating properly escaped CSV files ready for Excel, Google Sheets, or database imports.

## Key Features

### 1. **Intelligent JSON Parsing**

- Validates JSON syntax
- Supports arrays of objects
- Error messages for invalid input
- Real-time validation feedback

### 2. **Nested Object Flattening**

- Automatic flattening of nested structures
- Dot notation for nested keys
- Array stringification
- Preserves data relationships

### 3. **Custom Delimiters**

- **Comma** (`,`) - Standard CSV
- **Semicolon** (`;`) - European format
- **Tab** (`\t`) - TSV format
- **Pipe** (`|`) - Database exports
- Custom delimiter support

### 4. **CSV Escaping**

- Automatic field escaping
- Quote handling
- Newline preservation
- Delimiter protection

### 5. **Live Preview**

- Real-time CSV output
- Syntax highlighted JSON input (CodeMirror)
- Statistics (rows, columns)
- Visual feedback

### 6. **Export Options**

- Download as `.csv` file
- Copy to clipboard
- Filename customization
- UTF-8 encoding

## How It Works

### JSON to CSV Conversion Algorithm

```typescript
const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty array of objects')
  }

  // Step 1: Flatten nested objects (if enabled)
  const processedData = flattenNested ? data.map((item) => flattenObject(item)) : data

  // Step 2: Extract all unique headers
  const headers = Array.from(new Set(processedData.flatMap((obj) => Object.keys(obj)))).sort()

  // Step 3: Create CSV header row
  const headerRow = headers.map((h) => escapeCSVField(h)).join(delimiter)

  // Step 4: Create CSV data rows
  const dataRows = processedData.map((obj) => {
    return headers.map((header) => escapeCSVField(obj[header])).join(delimiter)
  })

  // Step 5: Combine header + data
  return [headerRow, ...dataRows].join('\n')
}
```

### Nested Object Flattening

```typescript
const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
  const flattened: Record<string, unknown> = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey))
    } else if (Array.isArray(value)) {
      // Stringify arrays
      flattened[newKey] = JSON.stringify(value)
    } else {
      flattened[newKey] = value
    }
  })

  return flattened
}
```

**Example:**

```json
// Input
{
  "user": {
    "name": "John",
    "address": {
      "city": "NYC"
    }
  }
}

// Flattened
{
  "user.name": "John",
  "user.address.city": "NYC"
}
```

### CSV Field Escaping

```typescript
const escapeCSVField = (field: unknown): string => {
  if (field === null || field === undefined) return ''

  const str = String(field)

  // Escape if contains delimiter, quotes, or newlines
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
    // Wrap in quotes and escape internal quotes
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}
```

**Example:**

```
Input:  My name is "John"
Output: "My name is ""John"""

Input:  City, State
Output: "City, State"
```

## Usage Instructions

### Basic Conversion

1. **Enter JSON**: Paste JSON array in editor

   ```json
   [
     { "name": "John", "age": 30, "city": "NYC" },
     { "name": "Jane", "age": 25, "city": "LA" }
   ]
   ```

2. **Verify**: Check validation badge (✅ Valid)

3. **Preview**: View CSV output automatically

4. **Download**: Click "Download CSV" button

5. **Result**:
   ```csv
   age,city,name
   30,NYC,John
   25,LA,Jane
   ```

### Custom Delimiter

**For European Excel (semicolon):**

1. Select `;` from delimiter dropdown
2. Output updates automatically
3. Download for Excel compatibility

**Example:**

```csv
age;city;name
30;NYC;John
25;LA;Jane
```

### Handling Nested Data

**Input (nested JSON):**

```json
[
  {
    "id": 1,
    "user": {
      "name": "John",
      "email": "john@example.com"
    },
    "address": {
      "city": "NYC",
      "zip": "10001"
    }
  }
]
```

**Output (flattened CSV):**

```csv
id,user.name,user.email,address.city,address.zip
1,John,john@example.com,NYC,10001
```

### API Response Conversion

**Workflow:**

1. Fetch JSON from API
2. Paste response in converter
3. Download CSV
4. Import to Excel/Google Sheets
5. Analyze data

## Technical Implementation

### Dependencies

```json
{
  "@uiw/react-codemirror": "^4.x.x",
  "@codemirror/lang-json": "^6.x.x"
}
```

### CodeMirror Integration

```tsx
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
;<CodeMirror
  value={jsonInput}
  height="400px"
  theme="dark"
  extensions={[json()]}
  onChange={(value) => setJsonInput(value)}
/>
```

### State Management

```typescript
const [jsonInput, setJsonInput] = useState(defaultJSON)
const [delimiter, setDelimiter] = useState(',')
const [flattenNested, setFlattenNested] = useState(true)

const { stats, csvOutput, isValid, error } = useMemo(() => {
  try {
    const parsed = JSON.parse(jsonInput)
    const csv = convertToCSV(parsed)

    return {
      stats: {
        rows: parsed.length,
        columns: Object.keys(parsed[0] || {}).length,
      },
      csvOutput: csv,
      isValid: true,
      error: null,
    }
  } catch (err) {
    return {
      stats: null,
      csvOutput: '',
      isValid: false,
      error: err.message,
    }
  }
}, [jsonInput, delimiter, flattenNested])
```

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  Header (FileSpreadsheet Icon)     │
├─────────────────────────────────────┤
│  Settings Panel                     │
│  ├─ Delimiter: [, ; | tab]         │
│  └─ [✓] Flatten nested objects     │
├──────────────┬──────────────────────┤
│  JSON Input  │  CSV Output          │
│  (CodeMirror)│  (Preview)           │
│              │                      │
│  Validation  │  Statistics          │
│  ✅ Valid    │  15 rows, 8 columns  │
├──────────────┴──────────────────────┤
│  [Download CSV] [Copy] [Clear]     │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Purple to pink (data transformation theme)
- **Split View**: JSON editor | CSV preview
- **Validation Badge**: Green (valid) / Red (error)
- **Dark Theme**: CodeMirror JSON syntax highlighting

## Analytics Events

```typescript
trackToolEvent('json_to_csv', {
  rows: 150,
  columns: 12,
  delimiter: ',',
  flattened: true,
})

trackToolEvent('csv_download', {
  filename: 'data.csv',
  size_kb: 25.6,
})
```

## Common Use Cases

### 1. **API Response to Spreadsheet**

```
GET /api/users → JSON array
↓
Paste in converter
↓
Download CSV
↓
Open in Excel/Sheets
↓
Analyze data with pivot tables
```

### 2. **Database Export**

```sql
SELECT * FROM users;
-- Export as JSON
```

```
JSON → Converter → CSV → Import to another database
```

### 3. **Data Cleaning**

```
1. Export messy JSON from source
2. Convert to CSV
3. Clean in Excel
4. Re-import as clean data
```

### 4. **Report Generation**

```
Dashboard API → JSON
Converter → CSV
Email stakeholders with CSV attachment
```

### 5. **Data Migration**

```
Old system (JSON) → Converter → CSV → New system import
```

## Delimiter Guide

| Delimiter | Symbol | Use Case          | Excel Compatibility |
| --------- | ------ | ----------------- | ------------------- |
| Comma     | `,`    | US/UK standard    | ✅ US/UK Excel      |
| Semicolon | `;`    | European standard | ✅ EU Excel         |
| Tab       | `\t`   | TSV files         | ✅ Universal        |
| Pipe      | `\|`   | Database exports  | ⚠️ Manual import    |

### Regional Settings

**US/UK Excel**: Expects commas  
**European Excel**: Expects semicolons (decimal comma regions)  
**Google Sheets**: Auto-detects delimiter

## CSV Standards

Follows RFC 4180 (CSV specification):

1. **Header Row**: First row contains field names
2. **Data Rows**: Subsequent rows contain values
3. **Quoting**: Fields with special chars wrapped in `""`
4. **Quote Escaping**: Internal quotes doubled (`""`)
5. **Line Endings**: CRLF (`\r\n`) or LF (`\n`)

## Performance

- **Small Data** (<1000 rows): Instant
- **Medium Data** (1000-10,000 rows): < 1 second
- **Large Data** (10,000-100,000 rows): 1-5 seconds
- **Very Large** (>100,000 rows): May freeze browser

## Limitations

### Input Requirements

❌ **NOT Supported:**

- Plain objects (must be array)
- Empty arrays
- Non-JSON strings
- Circular references

✅ **Supported:**

- Array of objects
- Nested objects (with flattening)
- Arrays within objects (stringified)
- Mixed data types

### Edge Cases

**Inconsistent Objects:**

```json
[
  { "name": "John", "age": 30 },
  { "name": "Jane", "city": "NYC" } // Missing age
]
```

Result: Empty cell for missing fields

**Deep Nesting:**

```json
{ "a": { "b": { "c": { "d": "value" } } } }
```

Result: `a.b.c.d` column (may be too deep for some tools)

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Works offline after initial load  
✅ No server required

## Troubleshooting

**"Input must be an array":**

- Wrap single object in brackets: `{ } → [{ }]`

**"Invalid JSON":**

- Check for missing commas, quotes
- Use JSON validator first

**Empty cells in CSV:**

- Objects have inconsistent fields
- Expected behavior (fill missing with empty)

**Weird characters in Excel:**

- Encoding issue
- Save as UTF-8
- Use "Import Data" in Excel instead of double-click

## Future Enhancements

- [ ] CSV to JSON (reverse conversion)
- [ ] Excel file upload (XLSX → CSV)
- [ ] Column selection/filtering
- [ ] Data type inference
- [ ] Custom header names
- [ ] Row filtering
- [ ] Batch conversion
- [ ] Compression for large files

## Related Tools

- **JSON Beautifier** - Format JSON before conversion
- **Text Transformer** - Clean CSV output
- **Code Diff Viewer** - Compare CSV versions

## Example Templates

### Users Data

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin"
  }
]
```

### Nested Products

```json
[
  {
    "sku": "PROD-001",
    "product": {
      "name": "Widget",
      "category": "Electronics"
    },
    "pricing": {
      "cost": 10,
      "retail": 25
    }
  }
]
```

### API Response

```json
[
  {
    "timestamp": "2024-10-26T10:00:00Z",
    "status": 200,
    "endpoint": "/api/users",
    "response_time_ms": 145
  }
]
```

---

**Route:** `/tools/json-to-csv`  
**Component:** `app/tools/json-to-csv/page.tsx`  
**Libraries:** `@uiw/react-codemirror`, `@codemirror/lang-json`  
**Standards:** RFC 4180 CSV Format
