# JSON to CSV Converter - User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/data/json-to-csv`  
**Complexity**: Moderate  
**Category**: Data Tools

## Overview

The JSON to CSV Converter transforms JSON arrays into CSV (Comma-Separated Values) format. It intelligently handles nested objects, arrays, and special characters, making it perfect for exporting API responses, database queries, or JSON data files to spreadsheet-compatible formats.

## Key Features

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

## How to Use

### Basic Conversion

#### Step 1: Enter JSON Data
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

#### Step 2: View CSV Output
The CSV output appears automatically in the right panel.

**Example Output:**
```csv
age,email,name
30,john@example.com,John Doe
25,jane@example.com,Jane Smith
```

#### Step 3: Copy or Download
- **Copy**: Click "Copy CSV" button to copy to clipboard
- **Download**: Click "Download CSV" to save as file

### Handling Nested Objects

#### With Flattening (Default)

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

#### Without Flattening

Toggle off "Flatten nested objects" option.

**Output:**
```csv
address,user
"{""city"":""New York"",""zip"":""10001""}","{""name"":""John"",""age"":30}"
```

### Custom Delimiters

Change the delimiter to suit your needs:

#### Comma (Default)
```csv
name,age,city
John,30,NYC
```

#### Semicolon
```csv
name;age;city
John;30;NYC
```

#### Tab
```csv
name	age	city
John	30	NYC
```

#### Pipe
```csv
name|age|city
John|30|NYC
```

### Handling Arrays

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

## Use Cases

### Use Case 1: API Response to Excel
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

### Use Case 2: Database Query Results
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

### Use Case 3: Nested Configuration Files
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

### Use Case 4: E-commerce Product Data
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

### Use Case 5: Analytics Data Export
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

## Tips & Tricks

### JSON Format Requirements
- **Must be an array**: `[{...}, {...}]` not just `{...}`
- **Objects in array**: Each item should be an object with key-value pairs
- **Consistent structure**: All objects should have similar keys for clean CSV

### Handling Special Characters
- **Commas in values**: Automatically quoted: `"New York, NY"`
- **Quotes in values**: Escaped as double quotes: `"He said ""Hello"""`
- **Line breaks**: Preserved within quoted fields

### Performance Optimization
- **Large files**: Tool handles up to 10,000 rows smoothly
- **Very large files**: Consider splitting into chunks
- **Memory**: Browser memory limits apply (~100MB JSON)

### Column Ordering
- Columns are alphabetically sorted by default
- Nested keys use dot notation: `parent.child`
- To customize order, manually reorder in spreadsheet after conversion

### Best Practices for Nested Data
- **Enable flattening** for tabular data analysis
- **Disable flattening** to preserve complex structures
- **Test with sample** before converting large datasets
- **Check column names** - dot notation might need mapping

### Delimiter Selection Guide
- **Comma**: Standard, works everywhere (default)
- **Semicolon**: European Excel versions
- **Tab**: Better for data with many commas
- **Pipe**: When data contains commas and tabs

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + V | Paste JSON |
| Ctrl/Cmd + C | Copy CSV (when output focused) |
| Ctrl/Cmd + A | Select all |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |

## Troubleshooting

### Issue: "Input must be an array of objects" Error
**Cause**: JSON is not in array format

**Solution**:
```json
// ❌ Wrong
{"name": "John", "age": 30}

// ✅ Correct
[{"name": "John", "age": 30}]
```

Wrap your object in square brackets.

### Issue: "Array cannot be empty" Error
**Cause**: JSON array has no items

**Solution**:
```json
// ❌ Wrong
[]

// ✅ Correct
[{"name": "John"}]
```

Add at least one object to the array.

### Issue: "Invalid JSON format" Error
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

### Issue: Nested Data Not Flattening
**Cause**: "Flatten nested objects" option is disabled

**Solution**:
- Enable the "Flatten nested objects" toggle
- Nested objects will be expanded with dot notation

### Issue: Special Characters Appearing Incorrectly
**Cause**: Encoding issues or incorrect escaping

**Solution**:
- Ensure JSON is UTF-8 encoded
- Special characters are automatically escaped
- Check CSV output in plain text editor first

### Issue: Missing Columns in Output
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

### Issue: CSV Opens Incorrectly in Excel
**Cause**: Wrong delimiter for your locale

**Solution**:
- **US/UK**: Use comma
- **EU (Germany, France)**: Use semicolon
- Or use Excel's "Text to Columns" feature to split properly

## Technical Details

### For Developers

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

### CSV Format Details

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

## Related Tools

- **[JSON Beautifier](/tools/data/json-beautify)** - Format and validate JSON before conversion
- **[CSV to Excel](/tools/data/csv-excel)** - Convert CSV to Excel format
- **[CSV Merger](/tools/data/csv-merger)** - Combine multiple CSV files
- **[JSON Schema Generator](/tools/data/json-schema)** - Create schemas from JSON

## Frequently Asked Questions

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

## Code Examples

### Python (Alternative)
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

### JavaScript/Node.js
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

### Using jq (Command Line)
```bash
# Simple conversion
jq -r '(.[0] | keys_unsorted) as $keys | $keys, map([.[ $keys[] ]])[] | @csv' data.json > output.csv

# With flattening
jq -r '[paths(scalars) as $p | {($p | join(".")): getpath($p)}] | add' data.json
```

## Best Practices

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

## Changelog

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
