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

---

## User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/data/json-to-csv`  
**Complexity**: Moderate  
**Category**: Data Tools

### Overview

The JSON to CSV Converter transforms JSON arrays into CSV (Comma-Separated Values) format. It intelligently handles nested objects, arrays, and special characters, making it perfect for exporting API responses, database queries, or JSON data files to spreadsheet-compatible formats.

### Key Features

- **Nested Object Flattening**: Automatically flattens nested JSON structures
- **Array Handling**: Converts arrays to JSON strings
- **Custom Delimiters**: Choose comma, semicolon, tab, or pipe delimiters
- **Smart Escaping**: Properly escapes special characters and quotes
- **Real-time Preview**: See CSV output as you type
- **Statistics Display**: Shows row count, column count, and file size
- **Copy to Clipboard**: One-click copy of CSV output
- **Download as File**: Export as .csv file
- **Syntax Highlighting**: JSON editor with syntax validation
- **Error Detection**: Clear error messages for invalid JSON

### How to Use

#### Basic Conversion

##### Step 1: Enter JSON Data
Paste or type your JSON array into the left editor panel.

**Example Input:**
```json
[
  {
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com"
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "email": "jane@example.com"
  }
]
```

##### Step 2: View CSV Output
The CSV output appears automatically in the right panel.

**Example Output:**
```csv
age,email,name
30,john@example.com,John Doe
25,jane@example.com,Jane Smith
```

##### Step 3: Copy or Download
- **Copy**: Click "Copy CSV" button to copy to clipboard
- **Download**: Click "Download CSV" to save as file

#### Handling Nested Objects

##### With Flattening (Default)

**Input:**
```json
[
  {
    "user": {
      "name": "John",
      "age": 30
    },
    "address": {
      "city": "New York",
      "zip": "10001"
    }
  }
]
```

**Output:**
```csv
address.city,address.zip,user.age,user.name
New York,10001,30,John
```

##### Without Flattening

Toggle off "Flatten nested objects" option.

**Output:**
```csv
address,user
"{""city"":""New York"",""zip"":""10001""}","{""name"":""John"",""age"":30}"
```

#### Custom Delimiters

Change the delimiter to suit your needs:

##### Comma (Default)
```csv
name,age,city
John,30,NYC
```

##### Semicolon
```csv
name;age;city
John;30;NYC
```

##### Tab
```csv
name	age	city
John	30	NYC
```

##### Pipe
```csv
name|age|city
John|30|NYC
```

#### Handling Arrays

Arrays within objects are converted to JSON strings.

**Input:**
```json
[
  {
    "name": "John",
    "skills": ["JavaScript", "Python", "Go"]
  }
]
```

**Output:**
```csv
name,skills
John,"[""JavaScript"",""Python"",""Go""]"
```

### Use Cases

#### Use Case 1: API Response to Excel
Export API data for analysis in Excel or Google Sheets.

**Scenario**: You fetched user data from an API.

**Solution**:
1. Copy JSON response from API
2. Paste into JSON to CSV converter
3. Download CSV
4. Open in Excel/Sheets for analysis

**Example API Response:**
```json
[
  {"id": 1, "username": "john_doe", "posts": 150, "followers": 1200},
  {"id": 2, "username": "jane_smith", "posts": 89, "followers": 850}
]
```

#### Use Case 2: Database Query Results
Convert database JSON exports to CSV for reporting.

**Scenario**: MongoDB query returned JSON documents.

**Solution**:
1. Export query results as JSON array
2. Convert to CSV
3. Import into BI tools or Excel

**Example MongoDB Data:**
```json
[
  {"_id": "507f1f77bcf86cd799439011", "product": "Widget", "sales": 5000, "date": "2026-01-01"},
  {"_id": "507f191e810c19729de860ea", "product": "Gadget", "sales": 3500, "date": "2026-01-02"}
]
```

#### Use Case 3: Nested Configuration Files
Flatten complex configuration for analysis.

**Scenario**: You have nested JSON config that needs to be reviewed in spreadsheet format.

**Solution**:
1. Enable "Flatten nested objects"
2. Convert to CSV
3. Review in spreadsheet with dot-notation columns

**Example Config:**
```json
[
  {
    "server": {
      "host": "example.com",
      "port": 8080,
      "ssl": {
        "enabled": true,
        "cert": "/path/to/cert"
      }
    }
  }
]
```

**Flattened CSV:**
```csv
server.host,server.port,server.ssl.cert,server.ssl.enabled
example.com,8080,/path/to/cert,true
```

#### Use Case 4: E-commerce Product Data
Convert product listings for bulk import.

**Scenario**: Export products from one platform to import into another.

**Solution**:
1. Export products as JSON
2. Convert to CSV with appropriate delimiter
3. Map columns to target platform
4. Import CSV

**Example Products:**
```json
[
  {"sku": "PROD-001", "name": "Laptop", "price": 999.99, "stock": 50},
  {"sku": "PROD-002", "name": "Mouse", "price": 29.99, "stock": 200}
]
```

#### Use Case 5: Analytics Data Export
Prepare analytics data for visualization tools.

**Scenario**: Export event tracking data for analysis.

**Solution**:
1. Fetch events as JSON from analytics API
2. Convert to CSV
3. Import into visualization tool (Tableau, Power BI)

**Example Events:**
```json
[
  {"event": "page_view", "page": "/home", "timestamp": "2026-01-05T10:00:00Z", "user_id": 123},
  {"event": "button_click", "button": "signup", "timestamp": "2026-01-05T10:05:00Z", "user_id": 123}
]
```

### Tips & Tricks

#### JSON Format Requirements
- **Must be an array**: `[{...}, {...}]` not just `{...}`
- **Objects in array**: Each item should be an object with key-value pairs
- **Consistent structure**: All objects should have similar keys for clean CSV

#### Handling Special Characters
- **Commas in values**: Automatically quoted: `"New York, NY"`
- **Quotes in values**: Escaped as double quotes: `"He said ""Hello"""`
- **Line breaks**: Preserved within quoted fields

#### Performance Optimization
- **Large files**: Tool handles up to 10,000 rows smoothly
- **Very large files**: Consider splitting into chunks
- **Memory**: Browser memory limits apply (~100MB JSON)

#### Column Ordering
- Columns are alphabetically sorted by default
- Nested keys use dot notation: `parent.child`
- To customize order, manually reorder in spreadsheet after conversion

#### Best Practices for Nested Data
- **Enable flattening** for tabular data analysis
- **Disable flattening** to preserve complex structures
- **Test with sample** before converting large datasets
- **Check column names** - dot notation might need mapping

#### Delimiter Selection Guide
- **Comma**: Standard, works everywhere (default)
- **Semicolon**: European Excel versions
- **Tab**: Better for data with many commas
- **Pipe**: When data contains commas and tabs

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + V | Paste JSON |
| Ctrl/Cmd + C | Copy CSV (when output focused) |
| Ctrl/Cmd + A | Select all |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |

### Troubleshooting

#### Issue: "Input must be an array of objects" Error
**Cause**: JSON is not in array format

**Solution**:
```json
// ❌ Wrong
{"name": "John", "age": 30}

// ✅ Correct
[{"name": "John", "age": 30}]
```

Wrap your object in square brackets.

#### Issue: "Array cannot be empty" Error
**Cause**: JSON array has no items

**Solution**:
```json
// ❌ Wrong
[]

// ✅ Correct
[{"name": "John"}]
```

Add at least one object to the array.

#### Issue: "Invalid JSON format" Error
**Cause**: Syntax error in JSON

**Solutions**:
- Check for missing commas between properties
- Ensure all strings use double quotes (not single)
- Verify brackets and braces are balanced
- Remove trailing commas
- Use JSON validator first (JSON Beautifier tool)

**Common Mistakes:**
```json
// ❌ Wrong - single quotes
[{'name': 'John'}]

// ❌ Wrong - trailing comma
[{"name": "John",}]

// ❌ Wrong - missing quotes on key
[{name: "John"}]

// ✅ Correct
[{"name": "John"}]
```

#### Issue: Nested Data Not Flattening
**Cause**: "Flatten nested objects" option is disabled

**Solution**:
- Enable the "Flatten nested objects" toggle
- Nested objects will be expanded with dot notation

#### Issue: Special Characters Appearing Incorrectly
**Cause**: Encoding issues or incorrect escaping

**Solution**:
- Ensure JSON is UTF-8 encoded
- Special characters are automatically escaped
- Check CSV output in plain text editor first

#### Issue: Missing Columns in Output
**Cause**: Objects have different keys

**Solution**:
The converter includes ALL keys from ALL objects. If some objects are missing keys:
```json
[
  {"name": "John", "age": 30, "email": "john@example.com"},
  {"name": "Jane", "age": 25}  // Missing email
]
```

Output will have empty value:
```csv
age,email,name
30,john@example.com,John
25,,Jane
```

#### Issue: CSV Opens Incorrectly in Excel
**Cause**: Wrong delimiter for your locale

**Solution**:
- **US/UK**: Use comma
- **EU (Germany, France)**: Use semicolon
- Or use Excel's "Text to Columns" feature to split properly

### Technical Details

#### For Developers

**Flattening Algorithm:**
```javascript
function flattenObject(obj, prefix = '') {
  const flattened = {}
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value)
    } else {
      flattened[newKey] = value
    }
  }
  
  return flattened
}
```

**CSV Escaping Rules (RFC 4180):**
- Fields containing delimiter, quotes, or newlines are quoted
- Quotes within fields are escaped by doubling: `"` → `""`
- Null/undefined values become empty strings

**Performance:**
- Processing: O(n × m) where n = rows, m = unique keys
- Memory: ~2x JSON size (original + CSV output)
- Handles: 10,000+ rows typical, 100,000+ possible

**Browser Compatibility:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires ES2020 features

**Libraries:**
- CodeMirror 6 - JSON editor with syntax highlighting
- @codemirror/lang-json - JSON language support

**Limitations:**
- Maximum JSON size: ~100MB (browser memory dependent)
- Deeply nested objects (10+ levels) may impact performance
- Circular references are not supported

#### CSV Format Details

**Header Row:**
- Always includes all unique keys from all objects
- Sorted alphabetically
- Nested keys use dot notation: `user.address.city`

**Data Rows:**
- One row per JSON object
- Empty cells for missing keys
- Arrays converted to JSON strings

**Character Encoding:**
- Output is UTF-8
- BOM (Byte Order Mark) not included by default
- Excel may require BOM for proper Unicode display

### Related Tools

- **[JSON Beautifier](/tools/data/json-beautify)** - Format and validate JSON before conversion
- **[CSV to Excel](/tools/data/csv-excel)** - Convert CSV to Excel format
- **[CSV Merger](/tools/data/csv-merger)** - Combine multiple CSV files
- **[JSON Schema Generator](/tools/data/json-schema)** - Create schemas from JSON

### Frequently Asked Questions

**Q: Can I convert a single JSON object (not an array)?**  
A: No, wrap it in an array: `[{your object}]`

**Q: How do I handle very deeply nested objects?**  
A: Enable flattening. Nested keys become: `level1.level2.level3.property`

**Q: Can I customize the column order?**  
A: Columns are alphabetically sorted. Reorder in spreadsheet after export.

**Q: What happens to null values?**  
A: They become empty CSV cells.

**Q: Can I convert JSON with mixed data types?**  
A: Yes, but arrays and objects are stringified. Primitives are preserved.

**Q: Why does my CSV have extra columns?**  
A: All unique keys from all objects are included. Some objects may have keys others don't.

**Q: Can I convert multiple JSON files at once?**  
A: Currently one at a time. Merge JSON arrays first or convert separately.

**Q: How do I handle dates?**  
A: Dates are preserved as strings. Format them in your spreadsheet application.

**Q: Is there a size limit?**  
A: Browser memory is the limit (~100MB). Very large files may slow down.

**Q: Can I undo changes?**  
A: Use Ctrl+Z in the JSON editor. CSV is regenerated on each change.

### Code Examples

#### Python (Alternative)
```python
import json
import csv

# Read JSON
with open('data.json', 'r') as f:
    data = json.load(f)

# Write CSV
with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
```

#### JavaScript/Node.js
```javascript
const fs = require('fs')
const { parse } = require('json2csv')

// Read JSON
const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'))

// Convert to CSV
const csv = parse(jsonData)

// Write CSV
fs.writeFileSync('output.csv', csv)
```

#### Using jq (Command Line)
```bash
# Simple conversion
jq -r '(.[0] | keys_unsorted) as $keys | $keys, map([.[ $keys[] ]])[] | @csv' data.json > output.csv

# With flattening
jq -r '[paths(scalars) as $p | {($p | join(".")): getpath($p)}] | add' data.json
```

### Best Practices

1. **Validate JSON first** - Use JSON Beautifier to check syntax
2. **Test with small sample** - Verify output format before converting large files
3. **Choose appropriate delimiter** - Consider your locale and target application
4. **Enable flattening for analysis** - Easier to work with in spreadsheets
5. **Check column mappings** - Verify nested keys are correctly flattened
6. **Handle missing values** - Decide how to treat null/undefined in your workflow
7. **Use UTF-8 encoding** - Ensures special characters display correctly
8. **Document transformations** - Keep notes on how nested data was flattened
9. **Validate output** - Open CSV in text editor to verify format
10. **Keep JSON backup** - CSV loses structure information

### Changelog

**v1.0** (Current)
- JSON to CSV conversion
- Nested object flattening
- Array handling
- Custom delimiters (comma, semicolon, tab, pipe)
- Real-time preview
- Copy to clipboard
- Download as file
- Syntax highlighting
- Error detection
- Statistics display
