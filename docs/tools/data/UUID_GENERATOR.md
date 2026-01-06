# UUID Generator - User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/data/uuid-generator`  
**Complexity**: Simple  
**Category**: Data Tools

## Overview

The UUID Generator is a powerful tool for generating and validating Universally Unique Identifiers (UUIDs). It supports multiple UUID versions, bulk generation, and real-time validation, making it perfect for developers, database administrators, and anyone working with unique identifiers.

## Key Features

- **Single UUID Generation**: Generate one UUID at a time with a click
- **Bulk Generation**: Create up to 100 UUIDs simultaneously
- **UUID Validation**: Verify UUID format and identify version
- **Version Support**: Works with UUID v1, v4, and v5
- **One-Click Copy**: Copy individual or all UUIDs to clipboard
- **Format Detection**: Automatically detects and displays UUID version
- **Secure Generation**: Uses Web Crypto API for cryptographically secure UUIDs
- **No Server Required**: All generation happens in your browser

## How to Use

### Generating a Single UUID

#### Step 1: Generate
Click the "Generate New UUID" button or the refresh icon. A new UUID v4 will be created instantly.

#### Step 2: Copy
Click the "Copy" button next to the UUID to copy it to your clipboard. A success message will confirm the copy.

**Example Output:**
```
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

### Generating Multiple UUIDs (Bulk)

#### Step 1: Set Quantity
Enter the number of UUIDs you want to generate (1-100) in the "Bulk Generation" section.

#### Step 2: Generate
Click "Generate Bulk UUIDs". The tool will create all UUIDs instantly.

#### Step 3: Copy
- **Copy Individual**: Click the copy icon next to any UUID
- **Copy All**: Click "Copy All" to copy all UUIDs to clipboard (one per line)

**Example Bulk Output:**
```
a1b2c3d4-e5f6-4789-a012-3456789abcde
b2c3d4e5-f6a7-4890-b123-456789abcdef
c3d4e5f6-a7b8-4901-c234-56789abcdef0
...
```

### Validating a UUID

#### Step 1: Enter UUID
Paste or type a UUID into the "UUID Validation" input field.

#### Step 2: Validate
Click "Validate UUID". The tool will:
- Check if the format is valid
- Display the UUID version (1-5)
- Show any errors if invalid

#### Step 3: Review Results
- **Valid UUID**: Green checkmark with version number
- **Invalid UUID**: Red X with error message

## Use Cases

### Use Case 1: Database Primary Keys
Generate unique identifiers for database records without collisions.

**Solution**:
```javascript
// Generate UUID for new user
const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

// Insert into database
INSERT INTO users (id, name, email) 
VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'John Doe', 'john@example.com');
```

### Use Case 2: API Request IDs
Create unique request identifiers for distributed systems and logging.

**Solution**:
```javascript
// Add UUID to API request headers
fetch('https://api.example.com/data', {
  headers: {
    'X-Request-ID': 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
  }
})
```

### Use Case 3: File Naming
Generate unique filenames to prevent overwriting and organize uploads.

**Solution**:
```javascript
// Original: profile.jpg
// New: f47ac10b-58cc-4372-a567-0e02b2c3d479_profile.jpg
const filename = `${uuid}_${originalName}`
```

### Use Case 4: Session IDs
Create secure session identifiers for web applications.

**Solution**:
```javascript
// Generate session ID on login
const sessionId = generateUUIDv4()
localStorage.setItem('sessionId', sessionId)
```

### Use Case 5: Test Data Generation
Quickly create unique identifiers for testing and development.

**Solution**:
1. Generate 100 UUIDs in bulk
2. Copy all to clipboard
3. Paste into test data file or database seed

## Tips & Tricks

### UUID Best Practices
- **Use v4 for most cases**: Randomly generated, no privacy concerns
- **Avoid v1 in distributed systems**: Contains timestamp and MAC address
- **Store as binary in databases**: Saves space (16 bytes vs 36 chars)
- **Index UUID columns**: Improves query performance

### Performance Optimization
- **Bulk generation**: Generate multiple UUIDs at once instead of repeatedly
- **Reuse generated UUIDs**: Copy all bulk UUIDs for later use
- **Browser performance**: Generating 100 UUIDs takes ~300ms

### Integration Tips
- **JavaScript**: `crypto.randomUUID()` (modern browsers)
- **Node.js**: `import { randomUUID } from 'crypto'`
- **Python**: `import uuid; uuid.uuid4()`
- **PostgreSQL**: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; SELECT uuid_generate_v4()`

### Validation Use Cases
- **Verify format before database insertion**
- **Check UUID version for compatibility**
- **Validate user input in forms**
- **Debug UUID generation issues**

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click Generate | Create new UUID |
| Click Copy | Copy to clipboard |
| Enter (in validation) | Validate UUID |

## Troubleshooting

### Issue: "Invalid UUID format" Error
**Cause**: UUID doesn't match the standard format

**Solution**:
- Ensure format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Check for extra spaces or characters
- Verify hyphens are in correct positions
- Ensure all characters are hexadecimal (0-9, a-f)

### Issue: Copy Button Not Working
**Cause**: Browser permissions or clipboard API not available

**Solution**:
- Grant clipboard permissions when prompted
- Try manually selecting and copying (Ctrl+C)
- Update your browser to the latest version

### Issue: "Invalid UUID version" Message
**Cause**: UUID version number is outside 1-5 range

**Solution**:
- Most UUIDs should be v1, v4, or v5
- v4 is recommended for general use
- Regenerate if version is incorrect

### Issue: Bulk Generation Fails
**Cause**: Invalid count entered

**Solution**:
- Enter a number between 1 and 100
- Ensure input is a valid integer
- Avoid special characters or decimals

## Technical Details

### For Developers

**UUID Format:**
```
xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
         ^    ^    ^
         |    |    |
         |    |    Version (M)
         |    Variant (N: 8,9,a,b)
         Timestamp/Random
```

**Generation Method:**
- Uses `crypto.randomUUID()` (Web Crypto API)
- Falls back to `Math.random()` for older browsers
- v4: 122 random bits with 4-bit version and 2-bit variant

**Validation:**
- Regex pattern: `/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`
- Checks version byte (13th character, 0-indexed position 14)
- Validates variant bits (17th character)

**Browser Compatibility:**
- Chrome/Edge 92+
- Firefox 95+
- Safari 15.4+
- All modern browsers with Web Crypto API

**Performance:**
- Single UUID: < 1ms
- Bulk 100 UUIDs: ~300ms (including UI updates)
- Validation: < 1ms

**Security:**
- Uses cryptographically secure random number generator
- No predictable patterns
- Safe for session IDs and security tokens

### UUID Versions Explained

**v1 - Time-Based:**
- Contains timestamp and MAC address
- Sortable by creation time
- **Caution**: May leak hardware info

**v4 - Random:**
- 122 random bits
- Most commonly used
- **Recommended** for general use

**v5 - Name-Based (SHA-1):**
- Generated from namespace + name
- Deterministic (same input = same UUID)
- Useful for consistent identifiers

## Related Tools

- **[Hash Generator](/tools/security/hash-generator)** - Generate MD5, SHA-1, SHA-256 hashes
- **[Random Password Generator](/tools/security/password-generator)** - Create secure passwords
- **[Base64 Encoder](/tools/security/base64)** - Encode/decode Base64 data
- **[JSON Beautifier](/tools/data/json-beautify)** - Format JSON with UUIDs

## Frequently Asked Questions

**Q: What's the difference between UUID versions?**  
A: v1 uses timestamp + MAC address, v4 is fully random, v5 uses SHA-1 hash. v4 is recommended for most use cases.

**Q: Can UUIDs collide (be duplicated)?**  
A: The probability is astronomically low (~1 in 2^122 for v4). For practical purposes, UUIDs are unique.

**Q: Should I use UUIDs as database primary keys?**  
A: Yes, but store as binary (not strings) and consider sequential UUIDs (UUIDv6/v7) for better index performance.

**Q: Are generated UUIDs secure for authentication tokens?**  
A: Yes, v4 UUIDs use cryptographically secure random numbers, but consider JWTs for authentication.

**Q: How do I generate UUIDs in my code?**  
A: Modern browsers: `crypto.randomUUID()`, Node.js: `require('crypto').randomUUID()`, or use UUID libraries.

**Q: Can I customize UUID format?**  
A: No, UUIDs follow RFC 4122 standard format. For custom IDs, consider alternatives like NanoID or ULID.

**Q: Why uppercase vs lowercase?**  
A: Both are valid per RFC 4122. This tool uses lowercase, which is more common.

## Code Examples

### JavaScript/TypeScript
```javascript
// Browser
const uuid = crypto.randomUUID()
console.log(uuid) // f47ac10b-58cc-4372-a567-0e02b2c3d479

// Node.js
import { randomUUID } from 'crypto'
const uuid = randomUUID()
```

### Python
```python
import uuid

# Generate v4 UUID
my_uuid = uuid.uuid4()
print(my_uuid)  # f47ac10b-58cc-4372-a567-0e02b2c3d479

# Generate v5 UUID (name-based)
namespace = uuid.NAMESPACE_DNS
my_uuid = uuid.uuid5(namespace, 'example.com')
```

### PostgreSQL
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generate UUID
SELECT uuid_generate_v4();

-- Use in table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100)
);
```

### MySQL
```sql
-- Generate UUID
SELECT UUID();

-- Use in table
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    name VARCHAR(100)
);
```

## Best Practices

1. **Use v4 for general purposes** - Random, no privacy concerns
2. **Store as binary in databases** - Saves 20 bytes per UUID
3. **Index UUID columns** - Especially important for large tables
4. **Validate UUIDs on input** - Prevent malformed data
5. **Use bulk generation** - More efficient for multiple UUIDs
6. **Consider sequential UUIDs for performance** - UUIDv6/v7 (not yet standard)

## Changelog

**v1.0** (Current)
- Single UUID generation (v4)
- Bulk generation (up to 100)
- UUID validation (v1-v5)
- Version detection
- Copy to clipboard
- Secure generation using Web Crypto API
