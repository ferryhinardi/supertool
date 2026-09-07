# 12 - Base64 Encoder/Decoder

**Created:** October 2024  
**Last Updated:** October 2024  
**Category:** Security Tools  
**Status:** ✅ Active

## Overview

A dual-mode Base64 encoding and decoding tool for text and files. Convert binary data to text-safe Base64 strings or decode Base64 back to original content—essential for data URLs, API payloads, and embedding binary data in text formats.

## Purpose

Base64 encoding is fundamental in web development: embedding images in CSS/HTML, sending binary data in JSON APIs, encoding authentication tokens, and ensuring data integrity across systems that only support text.

## Key Features

### 1. **Dual Mode Operation**

- **Encode Mode**: Text/files → Base64 strings
- **Decode Mode**: Base64 strings → original content
- Instant mode switching
- State preserved when toggling

### 2. **Text Encoding/Decoding**

- Plain text input
- Multiline support
- UTF-8 encoding
- Special character handling

### 3. **File Encoding**

- Upload any file type
- Automatic Data URL generation
- Includes MIME type prefix
- Direct embedding support

### 4. **Image Preview**

- Detect image Base64 strings
- Automatic thumbnail preview
- Visual verification
- Download decoded images

### 5. **Quick Actions**

- Copy to clipboard (one-click)
- Download as text file
- Clear input/output
- File upload trigger

## How It Works

### Text Encoding

Uses browser-native `btoa()` function:

```typescript
const handleEncode = () => {
  try {
    const encoded = btoa(input)
    setOutput(encoded)
    toast.success('Text encoded to Base64')
  } catch (error) {
    toast.error('Failed to encode. Check your input.')
  }
}
```

**Example:**

```
Input: "Hello, World!"
Output: "SGVsbG8sIFdvcmxkIQ=="
```

### Text Decoding

Uses browser-native `atob()` function:

```typescript
const handleDecode = () => {
  try {
    const decoded = atob(input)
    setOutput(decoded)

    // Check if it's an image data URL
    if (input.startsWith('data:image/')) {
      setImagePreview(input)
    }

    toast.success('Base64 decoded successfully')
  } catch (error) {
    toast.error('Invalid Base64 string')
  }
}
```

### File Encoding

Uses FileReader API for Data URL generation:

```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (event) => {
    const result = event.target?.result as string
    setOutput(result) // Already Base64 with data URL prefix
    toast.success(`File encoded: ${file.name}`)
  }

  reader.readAsDataURL(file)
}
```

**Output Format:**

```
data:[MIME-type];base64,[Base64-string]

Example:
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### Image Detection & Preview

```typescript
const isImageDataURL = (str: string): boolean => {
  return str.startsWith('data:image/')
}

// Automatically show preview for images
if (isImageDataURL(decoded)) {
  setImagePreview(decoded)
}
```

## Usage Instructions

### Encoding Text

1. **Select Encode Mode**: Click "Encode" tab
2. **Enter Text**: Type or paste in textarea
3. **Click "Encode"**: Result appears instantly
4. **Copy**: Use copy button for clipboard

**Example Use:**

```
Original: "username:password"
Encoded: "dXNlcm5hbWU6cGFzc3dvcmQ="
Use in: Authorization: Basic [encoded-string]
```

### Decoding Text

1. **Select Decode Mode**: Click "Decode" tab
2. **Paste Base64**: Enter Base64 string
3. **Click "Decode"**: Original text revealed
4. **Copy/Use**: Access decoded content

### Encoding Files

1. **Select Encode Mode**
2. **Click Upload Button**: Browse for file
3. **Select File**: Any type accepted
4. **Auto-Encode**: Data URL generated
5. **Use in HTML/CSS**: Copy full data URL

**Example Output:**

```html
<img src="data:image/png;base64,iVBORw0KGgo..." />
```

### Decoding Images

1. **Select Decode Mode**
2. **Paste Image Data URL**: Complete string
3. **Click "Decode"**: Preview appears
4. **Verify**: Check thumbnail
5. **Download**: Right-click preview to save

## Technical Implementation

### Browser APIs

```typescript
// Native encoding (ASCII only)
window.btoa(string) // Binary to ASCII

// Native decoding
window.atob(string) // ASCII to Binary

// File reading
const reader = new FileReader()
reader.readAsDataURL(file) // Returns Base64 Data URL
```

### Character Encoding

Base64 alphabet: `A-Z`, `a-z`, `0-9`, `+`, `/`, `=` (padding)

```
3 bytes (24 bits) → 4 Base64 chars
Example:
"Man" → ASCII: 77, 97, 110
     → Binary: 01001101 01100001 01101110
     → Base64: TWFu (19, 22, 5, 46)
```

### State Management

```typescript
const [mode, setMode] = useState<'encode' | 'decode'>('encode')
const [input, setInput] = useState('')
const [output, setOutput] = useState('')
const [imagePreview, setImagePreview] = useState<string | null>(null)
```

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│  Header (Lock/Unlock Icons)        │
├─────────────────────────────────────┤
│  Mode Toggle: [Encode] | [Decode]  │
├─────────────────────────────────────┤
│  Input Panel                        │
│  ┌───────────────────────────────┐ │
│  │  Text Area (Multiline)        │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│  [Upload File] (Encode mode only) │
│  [Encode/Decode Button]            │
├─────────────────────────────────────┤
│  Output Panel                       │
│  ┌───────────────────────────────┐ │
│  │  Result Text Area             │ │
│  │  (Read-only)                  │ │
│  └───────────────────────────────┘ │
│  Image Preview (if applicable)     │
│  [Copy] [Download] [Clear]         │
└─────────────────────────────────────┘
```

### Visual Styling

- **Gradient**: Purple to pink (security/encoding theme)
- **Icons**: Lock (encode), Unlock (decode)
- **Mode Toggle**: Pills with active state
- **Monospace Font**: For Base64 strings

## Analytics Events

```typescript
trackToolEvent('base64_encode', {
  type: 'text',
  length: 250,
})

trackToolEvent('base64_file_encode', {
  file_type: 'image/png',
  size_kb: 150,
})

trackToolEvent('base64_decode', {
  has_image_preview: true,
})
```

## Common Use Cases

### 1. **Data URLs for Images**

Embed images directly in HTML/CSS:

```html
<!-- No external HTTP request needed -->
<img src="data:image/png;base64,iVBORw0KGgo..." alt="Embedded" />
```

```css
.icon {
  background-image: url('data:image/svg+xml;base64,PHN2Zy...');
}
```

### 2. **HTTP Basic Authentication**

```
Username: admin
Password: secret123

Concatenate: "admin:secret123"
Encode: "YWRtaW46c2VjcmV0MTIz"

Header: Authorization: Basic YWRtaW46c2VjcmV0MTIz
```

### 3. **JWT Tokens**

JWTs consist of 3 Base64 strings:

```
header.payload.signature
eyJhbGc...eyJzdWI...SflKxw...
```

Decode middle part to see token payload.

### 4. **Email Attachments**

MIME email attachments use Base64:

```
Content-Type: image/png; name="photo.png"
Content-Transfer-Encoding: base64

iVBORw0KGgoAAAANSUhEUgA...
```

### 5. **API Payloads**

Send binary data in JSON:

```json
{
  "filename": "document.pdf",
  "content": "JVBERi0xLjQKJeLjz9M..."
}
```

### 6. **Canvas Image Export**

```javascript
const canvas = document.getElementById('myCanvas')
const dataURL = canvas.toDataURL('image/png')
// dataURL is Base64 encoded
```

## Limitations

### Browser Encoding Limits

- **`btoa()`**: ASCII only (fails on Unicode)
- **Workaround**: Use `TextEncoder` for UTF-8

```typescript
// Better encoding for Unicode
const utf8Encode = (str: string): string => {
  const bytes = new TextEncoder().encode(str)
  const binString = String.fromCharCode(...bytes)
  return btoa(binString)
}
```

### Performance

- **Large Files**: May crash browser (> 50MB)
- **Memory**: Base64 increases size by ~33%
- **Processing**: Synchronous, blocks UI for large data

### Not Encryption

⚠️ **Important**: Base64 is NOT encryption!

- Data is easily decoded
- No security provided
- Anyone can decode
- Use only for encoding, not privacy

## Security Considerations

### DO:

✅ Use for data encoding and transport  
✅ Embed small images in CSS/HTML  
✅ Encode binary data for JSON APIs  
✅ Test JWT tokens (public info)

### DON'T:

❌ Store passwords in Base64 (use hashing instead)  
❌ "Encrypt" sensitive data with Base64  
❌ Rely on Base64 for security  
❌ Think it's obscure enough to hide secrets

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Internet Explorer 10+ (for btoa/atob)  
✅ Node.js with Buffer API

## Alternatives

For different encoding needs:

- **URL Encoding**: `encodeURIComponent()`
- **Hex Encoding**: `toString(16)`
- **Binary**: `ArrayBuffer`/`Uint8Array`

## Future Enhancements

- [ ] UTF-8 encoding support (automatic)
- [ ] URL-safe Base64 variant
- [ ] Batch file encoding
- [ ] Drag & drop file upload
- [ ] Multi-file handling
- [ ] Format validation
- [ ] Character set selection
- [ ] Compression before encoding

## Related Tools

- **Hash Generator** - Create file hashes
- **Password Generator** - Secure password creation
- **URL Shortener** - Encode URLs for sharing
- **Image Optimizer** - Compress before Base64

## Technical Notes

### Base64 Table

```
Value | Char    Value | Char    Value | Char    Value | Char
------|-----    ------|-----    ------|-----    ------|-----
    0 | A          16 | Q          32 | g          48 | w
    1 | B          17 | R          33 | h          49 | x
   ...
   62 | +          63 | /
Padding: =
```

### Size Calculation

Original size × 4/3 = Base64 size

Example:

- 3 MB file → 4 MB Base64
- Overhead: 33% larger

---

**Route:** `/tools/base64`  
**Component:** `app/tools/base64/page.tsx`  
**APIs:** `btoa()`, `atob()`, `FileReader`
