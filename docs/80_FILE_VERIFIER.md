# File Integrity Verifier

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/security/file-verifier`
**Category**: Security Tools
**Complexity**: Moderate (745 lines)

## Overview

The File Integrity Verifier is a client-side security tool that calculates and verifies cryptographic hashes for files. It enables users to detect file tampering, corruption, or unauthorized modifications by comparing calculated hash values against expected checksums. All processing happens entirely in the browser using the WebCrypto API, ensuring complete privacy - your files are never uploaded to any server.

## Key Features

### Hash Algorithm Support
- **MD5**: Legacy algorithm (128-bit) - fast but cryptographically weak
- **SHA-1**: Legacy algorithm (160-bit) - cryptographically weak
- **SHA-256**: Recommended (256-bit) - secure and widely used
- **SHA-512**: Maximum security (512-bit) - strongest option available

### Core Capabilities
- **Client-Side Processing**: All hash calculations performed locally in your browser
- **Instant Verification**: Compare calculated hashes against expected values
- **Real-Time Recalculation**: Automatically recalculates hash when algorithm changes
- **Auto-Verification**: Automatically verifies if expected hash is pre-entered
- **No File Size Limits**: Process files of any size (limited only by browser memory)
- **Universal File Support**: Works with any file type

### User Experience
- **Drag & Drop Upload**: Easy file selection interface
- **One-Click Copy**: Copy calculated hash to clipboard
- **Visual Feedback**: Clear match/mismatch indicators with color coding
- **File Information Display**: Shows file name, size, type, and last modified date
- **Security Warnings**: Alerts about weak algorithms (MD5, SHA-1)

## How to Use

### Step 1: Select Hash Algorithm
1. Navigate to the File Verifier tool at `/tools/security/file-verifier`
2. Choose your preferred hash algorithm from the selection buttons:
   - **SHA-256** (default, recommended for most use cases)
   - **SHA-512** (for maximum security requirements)
   - **SHA-1** or **MD5** (only for legacy compatibility)

### Step 2: Upload Your File
1. Click the upload area or drag and drop a file onto it
2. Wait for the hash calculation to complete (progress indicated by loading state)
3. View the calculated hash and file information

### Step 3: Verify Integrity (Optional)
1. Enter the expected hash value in the verification input field
2. Click "Verify Hash" to compare
3. Review the verification result:
   - **Green (Match)**: File integrity confirmed
   - **Red (Mismatch)**: File may be corrupted or tampered with

### Step 4: Copy or Clear
- Click "Copy Hash" to copy the calculated hash to clipboard
- Click "Clear File" to reset and start with a new file

## Use Cases

### Software Downloads
Verify that downloaded software installers, ISO images, or packages haven't been tampered with:
1. Download the file from the official source
2. Find the official checksum (usually SHA-256) on the download page
3. Upload the file to the verifier
4. Compare against the official hash

### Data Backup Verification
Ensure backup files haven't been corrupted during storage:
1. Calculate and record hashes when creating backups
2. Periodically verify backup integrity by recalculating hashes
3. Detect silent corruption before you need to restore

### File Transfer Validation
Confirm files received match the originals after network transfer:
1. Sender calculates hash before transfer
2. Receiver calculates hash after transfer
3. Compare hashes to ensure integrity

### Security Audits
Detect unauthorized modifications to sensitive files:
1. Establish baseline hashes for critical system files
2. Periodically recalculate and compare
3. Investigate any mismatches

### Digital Evidence Integrity
Maintain chain of custody for digital forensics:
1. Calculate hash immediately upon collection
2. Document the hash value
3. Verify integrity before analysis

## Tips & Tricks

### Choosing the Right Algorithm

| Scenario | Recommended Algorithm |
|----------|----------------------|
| General file verification | SHA-256 |
| High security requirements | SHA-512 |
| Legacy system compatibility | SHA-1 (with caution) |
| Matching old checksums | MD5 (verification only) |

### Performance Considerations
- **Large files**: SHA-256 offers the best balance of speed and security
- **Many files**: Consider using SHA-256 for batch operations
- **Speed priority**: MD5 is fastest but not recommended for security

### Best Practices
1. Always use SHA-256 or SHA-512 for new hash calculations
2. Keep a secure record of hashes separate from the files
3. Verify hashes immediately after download, before installation
4. Use HTTPS sources when obtaining expected hash values

## Troubleshooting

### Hash Calculation Fails
**Problem**: Error message when calculating hash

**Solutions**:
- Ensure the file isn't corrupted or inaccessible
- Try with a smaller file to test functionality
- Check browser console for specific error messages
- Refresh the page and try again

### Hash Mismatch
**Problem**: Calculated hash doesn't match expected value

**Possible Causes**:
- File was modified, corrupted, or tampered with
- Wrong algorithm selected (e.g., expecting SHA-256 but using MD5)
- Extra whitespace or characters in expected hash
- Downloaded wrong version of the file

**Solutions**:
1. Verify you're using the correct algorithm
2. Re-download the file from the original source
3. Check that the expected hash is complete and correct
4. Try downloading from a different mirror

### Slow Hash Calculation
**Problem**: Hash takes too long to calculate

**Reasons**:
- Very large file size (GB+)
- Limited device memory
- Browser performance issues

**Solutions**:
- Be patient for large files - processing is memory-intensive
- Close other browser tabs to free memory
- Use a desktop browser for large files (better performance)

### Browser Compatibility Issues
**Problem**: Tool doesn't work in certain browsers

**Requirements**:
- Modern browser with WebCrypto API support
- Chrome 37+, Firefox 34+, Safari 11+, Edge 12+

## Technical Details

### Architecture
```
FileVerifierPage (page.tsx)
├── FileVerifierContent (main component)
│   ├── Algorithm Selection (MD5, SHA-1, SHA-256, SHA-512)
│   ├── File Upload (drag & drop interface)
│   ├── Hash Display (calculated result)
│   ├── Verification Input (expected hash)
│   └── Result Display (match/mismatch)
```

### Key Interfaces

```typescript
type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512'

interface FileData {
  name: string
  size: number
  type: string
  lastModified: Date
  hash: string
  algorithm: HashAlgorithm
}
```

### Hash Calculation Process
1. File is read as ArrayBuffer using FileReader API
2. WebCrypto API `crypto.subtle.digest()` calculates the hash
3. Hash buffer is converted to hexadecimal string
4. Result is displayed and available for copying

### Security Note on MD5
The tool uses SHA-1 as a fallback when MD5 is selected because the WebCrypto API doesn't support MD5. This is noted in the code at line 60:
```typescript
const cryptoAlgo = algo === 'MD5' ? 'SHA-1' : algo
```

For true MD5 hashes, consider using external tools or libraries.

### Verification Logic
```typescript
// Hash comparison is case-insensitive and whitespace-tolerant
const normalizedCalculated = hashToVerify.toLowerCase().trim()
const normalizedExpected = expectedHash.toLowerCase().trim()
const isMatch = normalizedCalculated === normalizedExpected
```

### File Size Formatting
```typescript
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
}
```

### Dependencies
- `framer-motion`: Smooth animations
- `lucide-react`: Icons (Shield, Upload, Copy, CheckCircle2, AlertCircle, etc.)
- `sonner`: Toast notifications
- WebCrypto API: Native browser cryptographic functions

## Analytics Events

The tool tracks the following events for usage analysis (no PII collected):

| Event | Description | Data |
|-------|-------------|------|
| `file_verifier_open` | Page load | None |
| `file_verifier_hash` | Hash calculated | `algorithm`, `file_size`, `file_type` |
| `file_verifier_verify` | Hash verified | `algorithm`, `result` (match/mismatch) |
| `file_verifier_clear` | File cleared | None |
| `file_verifier_copy` | Hash copied | `field` (hash) |
| `file_verifier_algorithm_change` | Algorithm changed | `algorithm` |

## Related Tools

| Tool | Relationship |
|------|--------------|
| [Hash Generator](/tools/security/hash-generator) | Generate hashes for text input |
| [Password Generator](/tools/security/password-generator) | Create secure passwords |
| [SSL Checker](/tools/security/ssl-checker) | Check website security certificates |
| [Base64 Encoder](/tools/security/base64) | Encode/decode Base64 data |

## FAQ

### Q: Is my file uploaded to a server?
**A**: No. All processing happens entirely in your browser. Your files never leave your device. This is emphasized by the "Secure - Client-Side - No Server Upload" badge on the tool.

### Q: What's the difference between the hash algorithms?
**A**: 
- **MD5** (128-bit): Fast but cryptographically broken - only for legacy compatibility
- **SHA-1** (160-bit): Also considered weak - deprecated for security use
- **SHA-256** (256-bit): Current standard, secure for most applications
- **SHA-512** (512-bit): Maximum security, slightly slower

### Q: Why doesn't MD5 work correctly?
**A**: The WebCrypto API doesn't support MD5 due to its security weaknesses. When MD5 is selected, the tool falls back to SHA-1. For true MD5 hashes, use command-line tools like `md5sum`.

### Q: Can I verify multiple files at once?
**A**: Currently, the tool processes one file at a time. For batch verification, you'll need to verify each file individually.

### Q: Why did my verification fail?
**A**: Common reasons include:
- Wrong algorithm selected
- File was modified during download
- Incorrect expected hash value
- Network corruption during transfer

### Q: Is SHA-512 always better than SHA-256?
**A**: Not necessarily. SHA-256 is sufficient for most security needs and is faster. SHA-512 provides additional security margin but with slightly higher computational cost. Both are considered secure.

### Q: How do I get the expected hash for verification?
**A**: Obtain expected hashes from:
- Official download pages (e.g., software vendors)
- CHECKSUMS or SHA256SUMS files
- Trusted third-party verification sources
- The original file creator

## Best Practices

### For Security Verification
1. **Always verify before installing** - Check downloaded software before execution
2. **Use trusted hash sources** - Get expected hashes from official websites over HTTPS
3. **Prefer SHA-256/512** - Avoid MD5 and SHA-1 for security-critical verification
4. **Document your hashes** - Keep records of verified hashes for future reference

### For Data Integrity
1. **Create baseline hashes** - Calculate hashes when files are first created/received
2. **Store hashes separately** - Keep hash records in a different location than files
3. **Regular verification** - Periodically verify backup and archive integrity
4. **Multiple algorithms** - Consider storing both SHA-256 and SHA-512 for critical files

### For Compliance
1. **Maintain audit trails** - Document when hashes were calculated and verified
2. **Use strong algorithms** - SHA-256 minimum for compliance requirements
3. **Timestamp verification** - Record the date and time of each verification

## Changelog

### Version 1.0.0 (January 2026)
- Initial release with MD5, SHA-1, SHA-256, SHA-512 support
- Client-side processing with WebCrypto API
- Hash verification with visual match/mismatch indicators
- Copy hash functionality
- File information display (size, type, modified date)
- Security warning for weak algorithms
- Responsive design with glassmorphic UI
- Analytics integration

---

*Part of SuperTool - Your Developer Toolkit*
*Security Tools Category*
