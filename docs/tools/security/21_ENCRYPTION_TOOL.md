# Encryption Tool Implementation

## Overview

The Encryption Tool provides secure, client-side file and text encryption using AES-256-GCM. Users can encrypt sensitive data with password protection, share encrypted links, and decrypt received content—all without data leaving their browser.

**Page Location:** `/app/tools/encryption-tool/page.tsx`  
**Utils Location:** `/app/tools/encryption-tool/utils.ts`  
**Tests Location:** `/app/tools/encryption-tool/__tests__/utils.test.ts`

## Features

### Core Encryption Functionality

- **AES-256-GCM Encryption:** Industry-standard encryption algorithm
- **Password-Based Key Derivation:** PBKDF2 with 100,000 iterations
- **Client-Side Only:** All encryption happens in the browser
- **No Server Storage:** Data never leaves your device
- **Three Operation Modes:**
  - Text encryption/decryption
  - File encryption/decryption
  - Link decryption (for shared encrypted data)

### Text Encryption

- **Multi-line Support:** Encrypt messages of any length
- **Copy to Clipboard:** One-click copy of encrypted data
- **Download Option:** Save encrypted text as a file
- **Shareable Links:** Generate secure links with embedded encrypted data
- **Unicode Support:** Full support for international characters and emojis

### File Encryption

- **Drag & Drop:** Easy file selection via drag-and-drop
- **File Browse:** Traditional file picker support
- **Binary Files:** Support for all file types (images, PDFs, documents, etc.)
- **Size Display:** Shows original and encrypted file sizes
- **Download Encrypted:** Save encrypted files to disk
- **Preserve Metadata:** Original filename preserved after decryption

### Security Features

- **Password Strength Meter:**
  - Real-time strength calculation
  - Visual feedback (Very Weak to Very Strong)
  - Actionable suggestions for improvement
  - Common pattern detection
- **Show/Hide Password:** Toggle password visibility
- **Random Salt:** Unique salt for each encryption
- **Random IV:** Unique initialization vector per encryption
- **Protection Against:**
  - Brute force attacks (PBKDF2)
  - Common password patterns
  - Rainbow table attacks (salt)
  - Replay attacks (random IV)

## Technical Implementation

### Encryption Algorithm

The tool uses the Web Crypto API for secure encryption:

```typescript
// Key Derivation
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}
```

### Text Encryption Flow

1. **Input Validation:** Check for empty plaintext/password
2. **Generate Salt:** Create random 16-byte salt
3. **Key Derivation:** Derive AES-256 key from password using PBKDF2
4. **Generate IV:** Create random 12-byte initialization vector
5. **Encrypt:** Use AES-GCM to encrypt text
6. **Encode:** Convert to Base64 for storage/transmission

### File Encryption Flow

1. **File Reading:** Convert file to ArrayBuffer
2. **Input Validation:** Check for empty file/password
3. **Generate Salt:** Create random 16-byte salt
4. **Key Derivation:** Derive AES-256 key from password using PBKDF2
5. **Generate IV:** Create random 12-byte initialization vector
6. **Encrypt:** Use AES-GCM to encrypt file data
7. **Encode:** Convert to Base64 for download

### Decryption Process

1. **Input Validation:** Check for all required data
2. **Decode:** Convert Base64 to ArrayBuffer
3. **Key Derivation:** Derive key using provided password and salt
4. **Decrypt:** Use AES-GCM to decrypt data
5. **Error Handling:** Throw clear error on failure (wrong password/corrupted data)

### Password Strength Calculation

The tool evaluates password strength based on multiple factors:

```typescript
interface PasswordStrength {
  score: number // 0-4
  label: string // "Very Weak" to "Very Strong"
  color: string // CSS color token
  suggestions: string[] // Up to 3 improvement tips
}
```

**Scoring Criteria:**

- Length (8+, 12+, 16+ characters)
- Character variety (uppercase, lowercase, numbers, special chars)
- Avoiding common patterns (123, abc, qwerty, password)
- No repeating characters (aaa, 111)

### Link Sharing

Encrypted data can be shared via URL:

```typescript
// Create shareable link
function createEncryptedLink(result: EncryptionResult): string {
  const data = {
    e: result.encrypted, // encrypted data
    i: result.iv, // initialization vector
    s: result.salt, // salt
  }
  const encoded = btoa(JSON.stringify(data))
  return `${window.location.origin}${window.location.pathname}?data=${encodeURIComponent(encoded)}`
}
```

**Security Note:** The password is NEVER included in the link—it must be shared separately.

### Component Structure

```typescript
EncryptionToolPage (Main Component)
├── Mode Selector (Text/File/Decrypt Link)
├── Text Mode
│   ├── Plaintext Input (textarea)
│   ├── Password Input (with strength meter)
│   ├── Encrypt Button
│   └── Encrypted Output Section
│       ├── Encrypted Data Display
│       ├── IV and Salt Display
│       ├── Copy Button
│       ├── Download Button
│       └── Share Link Button
├── File Mode
│   ├── DragDropZone (file picker)
│   ├── Password Input (with strength meter)
│   ├── Encrypt Button
│   └── Encrypted Output Section
│       ├── File Info Display
│       ├── Encrypted Data Display
│       ├── Download Button
│       └── Share Link Button
└── Decrypt Link Mode
    ├── Link Input
    ├── Password Input
    └── Decrypt Button
```

### State Management

The component uses React hooks for state management:

```typescript
// Mode state
const [mode, setMode] = useState<'text' | 'file' | 'decrypt-link'>('text')

// Text encryption state
const [plaintext, setPlaintext] = useState('')
const [textPassword, setTextPassword] = useState('')
const [showTextPassword, setShowTextPassword] = useState(false)
const [encryptedResult, setEncryptedResult] = useState<EncryptionResult | null>(null)

// File encryption state
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [filePassword, setFilePassword] = useState('')
const [showFilePassword, setShowFilePassword] = useState(false)
const [fileResult, setFileResult] = useState<EncryptionResult | null>(null)

// Link decryption state
const [encryptedLink, setEncryptedLink] = useState('')
const [linkPassword, setLinkPassword] = useState('')
const [showLinkPassword, setShowLinkPassword] = useState(false)
const [decryptedText, setDecryptedText] = useState<string | null>(null)

// UI state
const [isEncrypting, setIsEncrypting] = useState(false)
const [isDecrypting, setIsDecrypting] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### Error Handling

The tool provides clear, user-friendly error messages:

- **Empty Input:** "Plaintext cannot be empty" / "File data cannot be empty"
- **Empty Password:** "Password cannot be empty"
- **Decryption Failed:** "Decryption failed. Incorrect password or corrupted data."
- **Missing Data:** "Missing encryption data"
- **Invalid Link:** "Invalid encrypted link format"

## Testing Strategy

### Test Coverage

The test suite includes 37 comprehensive tests covering:

1. **Text Encryption/Decryption:**
   - Successful encryption and decryption
   - Wrong password rejection
   - Empty plaintext validation
   - Empty password validation
   - Unique IV and salt generation
   - Unicode character support
   - Long text handling (10,000+ characters)

2. **File Encryption/Decryption:**
   - Successful file encryption and decryption
   - Empty file validation
   - Empty password validation
   - Binary data support
   - Wrong password rejection

3. **Password Strength Calculator:**
   - Empty password detection
   - Short password detection
   - Strong password recognition
   - Common pattern detection
   - Case mixing suggestions
   - Number suggestions
   - Special character suggestions
   - Very strong password recognition
   - Suggestion limit (max 3)

4. **Link Sharing:**
   - Valid link generation
   - Successful parsing
   - Round-trip encryption/decryption
   - Invalid link rejection
   - Malformed data rejection
   - Special character handling in Base64

5. **Utility Functions:**
   - File size formatting (Bytes, KB, MB, GB)
   - Decimal precision (2 places)

### Running Tests

```bash
# Run Encryption Tool tests only
pnpm test encryption-tool

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch
```

## UI Components Used

The Encryption Tool uses the following Ark UI components:

- **Card:** Main container and section wrappers
- **Button:** Action buttons (encrypt, decrypt, copy, download, share)
- **Input:** Text inputs for passwords and links
- **Textarea:** Multi-line text input for plaintext
- **Progress:** Password strength indicator
- **Tooltip:** Helpful hints and explanations
- **Badge:** Mode selector pills

### Custom Components

- **DragDropZone:** File upload interface with drag-and-drop support

## Styling

The component uses Panda CSS for styling:

- **Layout:** Flexbox for responsive layouts
- **Spacing:** Consistent spacing tokens (4, 8, 12, 16px)
- **Colors:** Semantic color tokens
  - Primary: Indigo gradient
  - Success: Green
  - Warning: Yellow/Orange
  - Danger: Red
- **Typography:** Standard type scale with monospace for encrypted data
- **Responsive:** Mobile-first responsive design
- **Animations:** Smooth transitions for mode switching

## Security Considerations

### What's Secure

- **Strong Encryption:** AES-256-GCM is military-grade encryption
- **Key Derivation:** PBKDF2 with 100,000 iterations protects against brute force
- **Random Values:** Salt and IV are cryptographically random
- **Client-Side:** No data transmission to servers
- **Web Crypto API:** Browser-native, hardware-accelerated when available

### What Users Should Know

- **Password Responsibility:** Strong passwords are essential—tool can't protect weak ones
- **No Password Recovery:** If password is lost, data cannot be recovered
- **Link Security:** Encrypted links should be shared via secure channels
- **Separate Channels:** Share password separately from encrypted data/link
- **Browser Storage:** Encrypted data may be in browser memory—use private browsing for sensitive data

### Limitations

- **No Forward Secrecy:** Same password always derives same key from same salt
- **Browser Dependency:** Requires modern browser with Web Crypto API
- **Memory Constraints:** Large files may cause browser memory issues
- **No Compliance Certification:** Not audited for regulatory compliance (HIPAA, SOC 2, etc.)

## Analytics Integration

The component tracks user interactions using the analytics library:

```typescript
import { trackToolEvent } from '@/lib/analytics'

// Events tracked:
trackToolEvent('encryption_tool', 'encrypt_text')
trackToolEvent('encryption_tool', 'encrypt_file')
trackToolEvent('encryption_tool', 'decrypt_text')
trackToolEvent('encryption_tool', 'decrypt_file')
trackToolEvent('encryption_tool', 'decrypt_link')
trackToolEvent('encryption_tool', 'copy_encrypted')
trackToolEvent('encryption_tool', 'download_encrypted')
trackToolEvent('encryption_tool', 'share_link')
trackToolEvent('encryption_tool', 'switch_mode', mode)
```

## Browser Compatibility

The tool requires:

- **Web Crypto API:** For encryption/decryption
- **TextEncoder/TextDecoder:** For string encoding
- **Clipboard API:** For copy functionality (optional)
- **Download API:** For file downloads

**Supported Browsers:**

- Chrome/Edge 37+
- Firefox 34+
- Safari 11+
- Opera 24+

## Future Enhancements

Potential improvements for future versions:

1. **Multi-File Support:** Encrypt multiple files at once
2. **Compression:** Compress before encrypting to reduce size
3. **File Chunking:** Handle very large files (>100MB)
4. **Key Files:** Support key files in addition to passwords
5. **Time-Limited Links:** Auto-expire shared links after time period
6. **Password Generator:** Built-in strong password generator
7. **Dark Mode Theme:** User-selectable dark theme
8. **Export/Import Keys:** Save and restore encryption keys
9. **Folder Encryption:** Encrypt entire folders as archives
10. **Progressive Web App:** Offline functionality

## Related Documentation

- [Testing Guide](../../guides/TESTING.md)
- [Panda CSS Guide](../../guides/PANDA_CSS_GUIDE.md)
- [Analytics](../../features/ANALYTICS.md)
- [Migration Guide](../../archive/PANDA_CSS_MIGRATION_GUIDE.md)
