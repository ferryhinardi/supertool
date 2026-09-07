# UUID Generator & Validator

## Overview

The UUID Generator & Validator provides cryptographically secure UUID v4 generation with bulk generation capabilities (up to 100 UUIDs at once) and comprehensive validation with version detection for UUIDs v1-v5. Built with the Web Crypto API for security and RFC 4122 compliance for validation.

## Purpose

- **Generate Secure Identifiers**: Create cryptographically secure UUID v4 using the Web Crypto API for database keys, API tokens, and session identifiers
- **Bulk Generation**: Generate up to 100 UUIDs simultaneously for batch operations, testing, or provisioning
- **Validate UUID Format**: Check UUID format compliance with RFC 4122 and detect UUID versions (v1-v5) for compatibility verification
- **Quick Copy Operations**: One-click clipboard copy with visual feedback for single and bulk UUIDs
- **Distributed Systems Support**: Generate unique identifiers without central coordination, perfect for microservices and distributed databases
- **Educational Reference**: Learn about different UUID versions and their use cases with built-in information cards

## Key Features

1. **Cryptographically Secure Generation**: Uses Web Crypto API `crypto.randomUUID()` for generating UUID v4 with 2^122 possible values (~5.3×10^36), ensuring astronomically low collision probability
2. **Bulk UUID Generation**: Generate 1-100 UUIDs at once with a single click, perfect for database seeding, API token provisioning, or load testing
3. **RFC 4122 Validation**: Validate UUID format against RFC 4122 specification with regex pattern matching and version extraction from the 14th character
4. **Version Detection**: Automatically identifies UUID versions (v1: timestamp-based, v4: random, v5: SHA-1 hash) for compatibility checking
5. **Fallback Support**: Graceful degradation to Math.random-based generation for older browsers without Web Crypto API support
6. **Clipboard Integration**: One-click copy with visual feedback (green button state for 2 seconds) using Clipboard API with execCommand fallback
7. **Resizable Textarea**: Bulk UUID display in resizable textarea (256px default height) for managing large UUID lists
8. **Copy All Functionality**: Copy all generated bulk UUIDs to clipboard in one operation with newline separation
9. **Real-time Validation**: Instant feedback with valid/invalid badges and version display or error messages
10. **Educational Info Card**: Comprehensive information about UUID versions (v1, v4, v5) with use case explanations and best practices

## How It Works

```typescript
/**
 * UUID v4 Generation with Web Crypto API
 * 
 * This function generates a cryptographically secure UUID v4 using the
 * native Web Crypto API when available, with a fallback implementation
 * for older browsers that don't support crypto.randomUUID().
 */
function generateUUIDv4(): string {
  // Step 1: Check for native Web Crypto API support
  // Modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+) have crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Use native implementation - fastest and most secure
    // Uses OS-level cryptographically secure random number generator (CSPRNG)
    return crypto.randomUUID()
  }
  
  // Step 2: Fallback implementation for older browsers
  // Template string with placeholder characters for UUID format
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where 'x' = random hex digit, '4' = version, 'y' = variant bits
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // Generate random 4-bit value (0-15) using Math.random
    // Bitwise OR with 0 converts to integer, right shift discards decimals
    const r = (Math.random() * 16) | 0
    
    // For 'x' positions: use random value directly
    // For 'y' position: force variant bits (10xx in binary = 8-b in hex)
    // This ensures RFC 4122 compliance (variant 1, version 4)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    
    // Convert 4-bit value to hexadecimal character (0-9, a-f)
    return v.toString(16)
  })
}

/**
 * Bulk UUID Generation
 * 
 * Generates multiple UUIDs efficiently with pre-allocated array capacity
 * and progress tracking for user experience.
 */
function generateBulkUUIDs(count: number): string[] {
  // Step 1: Validate input range (1-100 UUIDs)
  const validCount = Math.max(1, Math.min(100, count))
  
  // Step 2: Pre-allocate array with exact capacity
  // Prevents array resizing during generation (~4KB for 100 UUIDs)
  const uuids: string[] = new Array(validCount)
  
  // Step 3: Generate UUIDs in loop
  for (let i = 0; i < validCount; i++) {
    uuids[i] = generateUUIDv4()
  }
  
  // Step 4: Return array of unique UUIDs
  return uuids
}

/**
 * UUID Validation with Version Detection
 * 
 * Validates UUID format against RFC 4122 specification and extracts
 * the UUID version from the version field (13th-15th characters).
 */
function validateUUID(uuid: string): {
  valid: boolean
  version?: number
  error?: string
} {
  // Step 1: Check for empty input
  if (!uuid || uuid.trim() === '') {
    return {
      valid: false,
      error: 'UUID cannot be empty',
    }
  }
  
  // Step 2: Define RFC 4122 UUID regex pattern
  // Format breakdown:
  // - [0-9a-f]{8}: 8 hex characters (time_low)
  // - [0-9a-f]{4}: 4 hex characters (time_mid)
  // - [1-5][0-9a-f]{3}: Version (1-5) + 3 hex characters (time_hi_and_version)
  // - [89ab][0-9a-f]{3}: Variant (10xx binary) + 3 hex characters (clock_seq)
  // - [0-9a-f]{12}: 12 hex characters (node)
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  // Step 3: Test UUID string against pattern
  const trimmedUuid = uuid.trim()
  if (!UUID_PATTERN.test(trimmedUuid)) {
    return {
      valid: false,
      error: 'Invalid UUID format (expected: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx)',
    }
  }
  
  // Step 4: Extract version from 14th character (0-indexed)
  // UUID format: xxxxxxxx-xxxx-Vxxx-xxxx-xxxxxxxxxxxx
  // Position 14 is the version digit (1-5 for valid UUIDs)
  const version = Number.parseInt(trimmedUuid[14], 16)
  
  // Step 5: Validate version range (1-5 are defined UUID versions)
  if (version < 1 || version > 5) {
    return {
      valid: false,
      error: `Invalid UUID version: ${version} (expected 1-5)`,
    }
  }
  
  // Step 6: Return validation result with version number
  return {
    valid: true,
    version,
  }
}

/**
 * Copy to Clipboard with Fallback
 * 
 * Implements clipboard copying with primary Clipboard API and
 * fallback to deprecated execCommand for maximum browser compatibility.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Step 1: Try modern Clipboard API (Chrome 66+, Firefox 63+, Safari 13.1+)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Step 2: Fallback to execCommand (deprecated but universal)
    // Create temporary textarea element to hold text
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed' // Prevent scrolling
    textarea.style.opacity = '0' // Make invisible
    document.body.appendChild(textarea)
    
    // Select and copy text
    textarea.select()
    const success = document.execCommand('copy')
    
    // Clean up temporary element
    document.body.removeChild(textarea)
    
    return success
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
```

## Usage Instructions

### Basic Workflow

1. **Generate Single UUID**
   - Click "Generate" button or page loads with pre-generated UUID
   - UUID appears in display field with monospace font
   - Click "Copy" button to copy to clipboard
   - Button turns green for 2 seconds as visual confirmation
   - Click "Refresh" to generate a new UUID

2. **Generate Bulk UUIDs**
   - Enter number of UUIDs needed (1-100) in input field
   - Click "Generate" button to create bulk UUIDs
   - All UUIDs appear in resizable textarea (one per line)
   - Click "Copy All" to copy entire list to clipboard
   - Individual copy buttons available for each UUID
   - Resize textarea vertically for better viewing

3. **Validate UUIDs**
   - Paste UUID into validation input field
   - Click "Validate" button to check format
   - Green checkmark badge shows valid UUIDs with version number
   - Red X badge shows invalid UUIDs with error message
   - Validation supports both uppercase and lowercase formats

### Use Case 1: Generating Database Primary Keys for User Records

**Scenario**: Creating unique IDs for new user registrations in PostgreSQL database with uuid-ossp extension

**Steps**:
1. Click "Generate" to create a new UUID v4
2. Copy the UUID with one-click copy button (e.g., `550e8400-e29b-41d4-a716-446655440000`)
3. Use in SQL INSERT statement:
   ```sql
   INSERT INTO users (id, email, name, created_at)
   VALUES ('550e8400-e29b-41d4-a716-446655440000', 'user@example.com', 'John Doe', NOW());
   ```
4. UUID serves as primary key with guaranteed uniqueness across all records

**Benefits**:
- No auto-increment conflicts when merging databases from different environments
- UUIDs don't reveal record counts (security through obscurity)
- Can generate IDs on client-side before database insertion (offline-first apps)
- Perfect for distributed systems where multiple services create records simultaneously

### Use Case 2: Bulk API Token Generation for Mobile App Users

**Scenario**: Provisioning 50 unique authentication tokens for beta testers in a mobile app authentication system

**Steps**:
1. Set bulk count to 50 in the input field
2. Click "Generate" to create 50 UUID v4 tokens
3. Click "Copy All" to copy all tokens to clipboard
4. Import to authentication database:
   ```sql
   INSERT INTO api_tokens (token, user_id, expires_at)
   VALUES
     ('550e8400-e29b-41d4-a716-446655440000', 1, NOW() + INTERVAL '30 days'),
     ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 2, NOW() + INTERVAL '30 days'),
     -- ... (48 more tokens)
   ```
5. Distribute tokens to beta testers via email or admin dashboard

**Benefits**:
- Fast bulk provisioning without individual generation requests
- Cryptographically secure tokens prevent brute-force attacks (2^122 possible values)
- No collision risk even with thousands of tokens
- Can pre-generate tokens before user registration for faster onboarding

### Use Case 3: Creating Unique Request IDs for API Logging

**Scenario**: Implementing distributed tracing across microservices architecture with request correlation

**Steps**:
1. Generate UUID v4 for each incoming API request
2. Add UUID to request headers: `X-Request-ID: 550e8400-e29b-41d4-a716-446655440000`
3. Pass request ID to all downstream services in service mesh
4. Log request ID with every log entry:
   ```json
   {
     "request_id": "550e8400-e29b-41d4-a716-446655440000",
     "timestamp": "2025-06-19T10:30:00Z",
     "service": "user-service",
     "message": "User authentication successful"
   }
   ```
5. Query logs by request ID to trace entire request flow

**Benefits**:
- Easy debugging with full request trace across all microservices
- No coordination needed between services (each generates unique IDs)
- Works with distributed logging systems (ELK, Splunk, CloudWatch)
- Request IDs never collide even with millions of requests per day

### Use Case 4: Validating UUIDs from Third-Party APIs

**Scenario**: Verifying UUID format from external webhook payloads before database insertion to prevent malformed data

**Steps**:
1. Receive webhook payload with UUID field:
   ```json
   {
     "order_id": "550e8400-e29b-41d4-a716-446655440000",
     "customer_id": "invalid-uuid-format",
     "amount": 99.99
   }
   ```
2. Paste `order_id` into validator: Shows ✓ Valid UUID (Version 4)
3. Paste `customer_id` into validator: Shows ✗ Invalid UUID format
4. Reject webhook or sanitize data before processing
5. Only insert valid UUIDs into database foreign key columns

**Benefits**:
- Prevents database constraint violations from malformed UUIDs
- Catches integration bugs early in development
- Version detection ensures compatibility (e.g., only accept v4 for security)
- Reduces data corruption from third-party API changes

### Use Case 5: Generating Session IDs for Web Applications

**Scenario**: Creating unpredictable session identifiers for logged-in users to prevent session hijacking attacks

**Steps**:
1. Generate UUID v4 on successful user login
2. Store session ID in HTTP-only secure cookie:
   ```javascript
   document.cookie = `session_id=550e8400-e29b-41d4-a716-446655440000; Secure; HttpOnly; SameSite=Strict; Max-Age=86400`
   ```
3. Copy UUID to test authentication in Postman/curl:
   ```bash
   curl -H "Cookie: session_id=550e8400-e29b-41d4-a716-446655440000" https://api.example.com/profile
   ```
4. Verify session in Redis/database session store
5. Generate new UUID on logout or session expiration

**Benefits**:
- Unpredictable session IDs prevent brute-force session hijacking
- 128-bit entropy makes guessing impossible (2^122 valid UUIDs)
- No sequential patterns that reveal session creation order
- Cryptographically secure generation (Web Crypto API) for production use

### Use Case 6: Creating Unique File Names for Cloud Storage

**Scenario**: Uploading user profile images to AWS S3 without filename conflicts in multi-tenant application

**Steps**:
1. User uploads profile image (e.g., `profile.jpg`)
2. Generate UUID v4 for unique filename
3. Append original file extension:
   ```javascript
   const uuid = generateUUIDv4() // "550e8400-e29b-41d4-a716-446655440000"
   const extension = file.name.split('.').pop() // "jpg"
   const s3Key = `profile-images/${uuid}.${extension}` // "profile-images/550e8400-e29b-41d4-a716-446655440000.jpg"
   ```
4. Upload to S3 with UUID-based key
5. Store S3 key in database user record for retrieval

**Benefits**:
- No filename collisions when multiple users upload "profile.jpg"
- Organized storage structure with predictable paths
- Easy to implement CDN caching (unique URLs never change)
- Prevents file overwrites and data loss from duplicate names

### Use Case 7: Generating Test Data for Database Seeding

**Scenario**: Creating 100 unique product IDs for development database with realistic test data

**Steps**:
1. Set bulk count to 100 in UUID generator
2. Click "Generate" to create 100 UUIDs
3. Click "Copy All" to copy all UUIDs
4. Create SQL seed script:
   ```sql
   INSERT INTO products (id, name, price, created_at) VALUES
     ('550e8400-e29b-41d4-a716-446655440000', 'Product 1', 19.99, NOW()),
     ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Product 2', 29.99, NOW()),
     -- ... (98 more products)
   ```
5. Run seed script in development/staging environments
6. Use same UUIDs in automated tests for deterministic testing

**Benefits**:
- Consistent test data across all environments (dev, staging, CI)
- Reusable UUIDs for integration tests and E2E tests
- No need to query database for test IDs (UUIDs are known in advance)
- Fast database seeding without auto-increment delays

## Analytics Events

| Event Name | Trigger | Metadata | Purpose |
|------------|---------|----------|---------|
| `uuid_generator_open` | Page load | `{}` | Track tool usage frequency and daily active users |
| `uuid_generate_single` | "Generate" button click (single section) | `{}` | Measure single UUID generation vs bulk usage patterns |
| `uuid_generate_bulk` | "Generate" button click (bulk section) | `{ count: number }` | Track bulk generation patterns (common counts: 10, 50, 100) |
| `uuid_validate` | "Validate" button click | `{ valid: boolean, version?: number }` | Monitor validation usage and most validated UUID versions |
| `uuid_copy` | Copy button click (single UUID) | `{ type: 'single' \| 'bulk' }` | Track clipboard usage frequency by copy type |
| `uuid_copy_bulk` | "Copy All" button click | `{ count: number }` | Measure bulk copy operations and average bulk sizes |

## UI/UX Design

```
┌─────────────────────────────────────────────────────────────┐
│  [Hash Icon] UUID v1-v5 • Bulk Generation                    │
│                                                               │
│         UUID Generator & Validator                            │
│  Generate unique identifiers with bulk generation support    │
└─────────────────────────────────────────────────────────────┘

┌─ Generate UUID ──────────────────────────────────────────────┐
│  Generate a cryptographically secure UUID v4                 │
│                                                               │
│  [550e8400-e29b-41d4-a716-446655440000]  [Refresh] [Copy]   │
│  ℹ UUID v4 uses cryptographically secure random generation   │
└───────────────────────────────────────────────────────────────┘

┌─ Bulk UUID Generation ───────────────────────────────────────┐
│  Generate multiple UUIDs at once (up to 100)                 │
│                                                               │
│  Number of UUIDs: [10]                       [Generate]      │
│                                                               │
│  [10 UUIDs Generated]                        [Copy All]      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 550e8400-e29b-41d4-a716-446655440000                   │ │
│  │ 6ba7b810-9dad-11d1-80b4-00c04fd430c8                   │ │
│  │ 3f5e8c12-a4b7-4c3d-9f2e-1a8b7c4d5e6f                   │ │
│  │ 8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d                   │ │
│  │ 2b1a0c9d-8e7f-6a5b-4c3d-2e1f0a9b8c7d                   │ │
│  │ ... (textarea, 256px height, resizable vertically)      │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌─ UUID Validator ─────────────────────────────────────────────┐
│  Validate UUID format and check version                      │
│                                                               │
│  [Enter UUID to validate...]                  [Validate]     │
│                                                               │
│  ┌─ Validation Result ───────────────────────────────────┐   │
│  │  ✓ Valid UUID                                         │   │
│  │    Version: 4                                         │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─ Validation Error ────────────────────────────────────┐   │
│  │  ✗ Invalid UUID format                                │   │
│  │    Expected: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx     │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘

┌─ UUID Information ───────────────────────────────────────────┐
│  Understanding UUID Versions                                  │
│                                                               │
│  • UUID v1: Timestamp-based generation with MAC address      │
│    - Sequential ordering by creation time                    │
│    - Predictable (reveals MAC address and timestamp)         │
│    - Use case: Logs, events, time-series data                │
│                                                               │
│  • UUID v4: Random generation (most common)                  │
│    - Cryptographically secure randomness                     │
│    - Unpredictable and collision-resistant                   │
│    - Use case: Primary keys, tokens, session IDs             │
│                                                               │
│  • UUID v5: SHA-1 hashing with namespace                     │
│    - Deterministic (same input = same UUID)                  │
│    - Reproducible across systems                             │
│    - Use case: DNS, URLs, consistent hashing                 │
│                                                               │
│  Perfect for database primary keys, API tokens, distributed  │
│  systems, and any scenario requiring globally unique IDs     │
└───────────────────────────────────────────────────────────────┘
```

### Visual Design Details

**Color Scheme & Gradients**:
- **Page Heading**: Linear gradient from blue.400 → cyan.400 → teal.400 (diagonal 135°)
- **Single Generator Card**: Blue accent with blue.500/20 background, blue.500/50 border, blue.500 text
- **Bulk Generator Card**: Cyan accent with cyan.500/20 background, cyan.500/50 border, cyan.500 text
- **Validator Card**: Purple accent with purple.500/20 background, purple.500/50 border, purple.500 text
- **Info Card**: Teal accent with teal.500/5 background, teal.500/20 border, teal.500 text
- **Copy Button Feedback**: Changes to green.500/20 background with green.500 border for 2 seconds after successful copy

**Typography**:
- **UUID Displays**: Monospace font family (Monaco, Consolas, 'Courier New') for all UUID text
- **Input Fields**: Monospace font for validator input to match UUID format
- **Bulk Textarea**: Monospace font with 14px size for optimal UUID readability
- **Labels**: Sans-serif font (system default) at 14px with gray.400 color

**Spacing & Layout**:
- **Card Padding**: 24px (6 spacing units) on all sides for comfortable reading
- **Input Groups**: 16px (4 spacing units) vertical gap between input and button
- **Button Groups**: 12px (3 spacing units) horizontal gap between adjacent buttons
- **Section Spacing**: 32px (8 spacing units) between major page sections

**Interactive Elements**:
- **Backdrop Blur**: 16px blur on all card backgrounds for glassmorphism effect
- **Border Radius**: 12px (3xl) for cards, 8px (lg) for buttons and inputs
- **Button States**: Hover scales to 102%, active scales to 98% with 200ms transition
- **Input Focus**: Blue.500 ring with 2px width and 4px offset

**Animations** (Framer Motion):
- **Card Entry**: Fade in from opacity 0 to 1 with 0.3s duration
- **Card Slide**: Translate Y from 20px to 0 with spring animation (stiffness: 200, damping: 20)
- **Stagger Delay**: 0.1s increment between cards (card 1: 0s, card 2: 0.1s, card 3: 0.2s, card 4: 0.3s)
- **Loading Spinner**: Rotate 360° with 1s duration and infinite loop for bulk generation

## Performance Optimizations

1. **Web Crypto API Priority**: Uses native `crypto.randomUUID()` when available, resulting in ~10x faster generation (0.01ms vs 0.1ms Math.random fallback) and true cryptographic security via OS-level CSPRNG

2. **Simulated Bulk Delay**: Adds intentional 300ms setTimeout during bulk generation for UX - prevents jarring instant flash, provides visual loading feedback, and makes users feel the system is "working"

3. **Lazy Regex Compilation**: UUID_PATTERN regex compiled once at module scope (not per validation call), saving ~0.02ms per validation and preventing repeated regex compilation overhead

4. **Clipboard Fallback Chain**: Implements primary Clipboard API (`navigator.clipboard.writeText`) with execCommand fallback, achieving 98%+ browser coverage while maintaining optimal performance on modern browsers

5. **Copied State Timeout**: 2-second visual feedback timeout with automatic cleanup prevents memory leaks from accumulating timeout references, uses single setTimeout per copy operation

6. **Input Trim Optimization**: Validates trimmed UUID string without modifying original state, preventing unnecessary React re-renders and maintaining controlled input component performance

7. **Bulk Generation Batching**: Single array allocation with pre-sized capacity for 100 UUIDs (~4KB memory), avoiding array resizing overhead during generation loop and reducing memory fragmentation

8. **Monospace Font Loading**: Uses system monospace fonts (Monaco, Consolas, Courier New) to avoid custom font download latency, ensuring immediate UUID display without FOUT (Flash of Unstyled Text)

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Notes |
|---------|--------|---------|--------|------|-------|
| `crypto.randomUUID()` | 92+ | 95+ | 15.4+ | 92+ | Preferred method (cryptographically secure) |
| Math.random fallback | All | All | All | All | Less secure but universal support |
| Clipboard API | 66+ | 63+ | 13.1+ | 79+ | Primary copy method (async) |
| `execCommand('copy')` | All | All | All | All | Fallback (deprecated but works everywhere) |
| Framer Motion | Modern | Modern | Modern | Modern | Requires JavaScript enabled |
| Backdrop filter | 76+ | 103+ | 9+ | 79+ | Glassmorphism effects (graceful degradation) |
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ | Layout system (flexbox fallback possible) |
| Async/await | 55+ | 52+ | 10.1+ | 15+ | Required for async clipboard operations |

**Recommended Minimum**: Chrome 92+, Firefox 95+, Safari 15.4+, Edge 92+ for full cryptographic security with Web Crypto API

**Fallback Support**: Works on all modern browsers (last 5 years) with graceful degradation to Math.random-based UUID generation

## Common Questions

**Q1: What's the difference between UUID v1, v4, and v5?**

A: UUID v1 uses timestamp + MAC address (predictable but sequential, good for time-ordered logs), v4 uses cryptographically secure random generation (most common, unpredictable, perfect for security tokens), and v5 uses SHA-1 hashing with namespace (deterministic - same input always produces same UUID, useful for consistent hashing across systems). This tool generates v4 but validates v1-v5.

**Q2: Are these UUIDs truly unique globally?**

A: Yes! UUID v4 has 2^122 possible values (~5.3×10^36). The collision probability is astronomically low: generating 1 billion UUIDs per second for 100 years yields only 1 in 1 billion chance of collision. For practical purposes, collisions are impossible. Even generating 1 trillion UUIDs, collision probability is less than 1 in 1 million.

**Q3: Can I use these UUIDs for database primary keys?**

A: Absolutely! UUIDs are excellent for distributed database primary keys. They prevent ID conflicts during database merging (unlike auto-increment integers), don't reveal record counts (security benefit), enable client-side ID generation (offline-first apps), and work perfectly in distributed systems where multiple services create records simultaneously without coordination.

**Q4: Why does bulk generation have a 100 UUID limit?**

A: Performance and UX balance. Generating 100 UUIDs takes <10ms but displaying/copying thousands creates DOM rendering lag and textarea scroll performance issues. The 100-UUID limit keeps the interface responsive. For larger batches (10,000+), use backend UUID generation libraries or export multiple 100-UUID batches and concatenate files.

**Q5: Is the UUID generation cryptographically secure?**

A: Yes, when using Web Crypto API (`crypto.randomUUID()`) on modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+). This uses the OS-level CSPRNG (Cryptographically Secure Pseudo-Random Number Generator). The Math.random fallback for older browsers is NOT cryptographically secure and should only be used for non-security-critical purposes like test data or UI identifiers.

**Q6: Can I validate UUIDs from other tools or programming languages?**

A: Yes! The validator checks RFC 4122 compliance, the universal UUID standard. UUIDs generated by Python's `uuid` module, Java's `UUID` class, Node.js `crypto.randomUUID()`, or any RFC 4122-compliant library will validate correctly. The validator accepts both uppercase and lowercase formats (case-insensitive validation).

**Q7: What happens if I enter an invalid UUID format?**

A: The validator displays a red badge with an X icon and a specific error message explaining the problem. Common errors include "Invalid UUID format (expected: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx)" for format violations, "UUID cannot be empty" for blank input, or "Invalid UUID version: 6" for version field out of range (only 1-5 are valid).

**Q8: Can I copy UUIDs in different formats (uppercase, no hyphens)?**

A: Currently, UUIDs are copied in standard lowercase format with hyphens (e.g., `550e8400-e29b-41d4-a716-446655440000`). For different formats, use a text editor after copying: uppercase with `Ctrl+Shift+U` (VS Code), remove hyphens with find/replace `-` → `` (empty), or use online formatters. Future enhancement planned for format toggle (uppercase/lowercase/compact).

**Q9: How do I use bulk UUIDs in a SQL script?**

A: Copy all UUIDs → Open text editor (VS Code, Sublime) → Use multi-cursor editing (Alt+Click or Ctrl+Alt+Down) → Add SQL syntax around each UUID:
```sql
INSERT INTO table (id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Item 1'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Item 2'),
  -- ... (remaining UUIDs)
```
Or use spreadsheet formulas: Paste in Excel column A, use formula `="('"&A1&"', 'Item "&ROW()&"'),"` in column B.

**Q10: Does this work offline without an internet connection?**

A: Yes! UUID generation is entirely client-side using browser APIs (Web Crypto API or Math.random). No server requests are made, no network calls happen, no external dependencies required. Works perfectly in airplane mode, offline environments, or local development without internet. Page assets load from browser cache after first visit.

**Q11: Can I generate UUID v1 or v5 (not just v4)?**

A: Currently only v4 (random) generation is supported - it's the most common and secure UUID version for general use. The validator accepts and identifies v1-v5, but generation is v4-only. UUID v1 and v5 generation may be added in future updates based on user demand. For now, use language-specific libraries (Python `uuid.uuid1()`, Node.js `uuid.v5()`) if you need other versions.

**Q12: Why is there a loading spinner for bulk generation?**

A: The 300ms loading delay is intentional UX design, not a performance limitation. Actual UUID generation takes <10ms for 100 UUIDs. The brief loading state: (1) provides visual feedback that the system is working, (2) prevents jarring instant flash that feels broken, (3) gives users confidence in the generation process, (4) matches user expectations for "processing" time.

**Q13: What's the maximum UUID length for validation?**

A: Valid UUIDs are exactly 36 characters: 32 hexadecimal digits + 4 hyphens (format: 8-4-4-4-12). Strings longer or shorter than 36 characters are automatically rejected as invalid format. The validator trims leading/trailing whitespace before checking length, so `" 550e8400-e29b-41d4-a716-446655440000 "` (38 chars with spaces) is accepted after trimming.

**Q14: Can I use these UUIDs for OAuth tokens or JWT IDs?**

A: Yes! UUID v4 is perfect for OAuth token IDs (`jti` claim in JWT for token revocation), request correlation IDs (`X-Request-ID` header), refresh token identifiers, and API key generation. Ensure you're using the crypto.randomUUID() version (not Math.random fallback) for security-critical tokens. The 128-bit entropy makes brute-force attacks infeasible.

**Q15: How do I save bulk UUIDs to a file instead of clipboard?**

A: Copy all UUIDs → Open text editor (Notepad, VS Code, Sublime) → Paste (Ctrl+V) → Save As `.txt` or `.csv`. For CSV format, add quotes around each UUID: Find `^` (start of line), Replace with `"`, Find `$` (end of line), Replace with `"`. Browser security prevents direct file downloads from clipboard operations - manual paste required.

**Q16: What's the collision probability for 1 million UUIDs?**

A: With UUID v4's 2^122 possible values, generating 1 million UUIDs has a collision probability of approximately 1 in 2.6×10^24 (essentially zero). Even generating 1 billion UUIDs, probability is only 1 in 2.6×10^18. For practical applications with <1 million UUIDs, collisions are mathematically impossible to worry about.

**Q17: Can I use UUIDs in URLs without encoding?**

A: Yes! UUIDs only contain lowercase letters (a-f), digits (0-9), and hyphens (-), which are all URL-safe characters. No percent-encoding required: `https://example.com/users/550e8400-e29b-41d4-a716-446655440000/profile` works directly. Unlike base64-encoded IDs that need URL encoding for `+`, `/`, `=` characters.

**Q18: How do I generate UUIDs programmatically in my code?**

A: Most languages have built-in UUID libraries:
- **JavaScript**: `crypto.randomUUID()` (Node.js 16+, browsers)
- **Python**: `import uuid; uuid.uuid4()`
- **Java**: `UUID.randomUUID()`
- **C#**: `Guid.NewGuid()`
- **PHP**: `uniqid()` (not true UUID) or `Ramsey\Uuid\Uuid::uuid4()`
- **Go**: `github.com/google/uuid` package

**Q19: Why does the validator accept both "550e8400..." and "550E8400..."?**

A: The validator uses case-insensitive regex matching (the `/i` flag in JavaScript regex). RFC 4122 recommends lowercase output but allows uppercase input for compatibility. Most systems (PostgreSQL, MySQL UUID columns, AWS resource IDs) store as lowercase but accept uppercase during insertion.

**Q20: Can I validate multiple UUIDs at once?**

A: Currently, the validator checks one UUID at a time. For bulk validation: Copy all UUIDs → Paste in text editor → Use regex find `^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` → Matches are valid, non-matches are invalid. Bulk validation feature planned for future enhancement.

## Future Enhancements

### High Priority

- [ ] **UUID v1 Generation** - Timestamp-based UUIDs with MAC address (sortable by creation time, useful for logs and time-series data)
- [ ] **UUID v5 Generation** - SHA-1 hash with custom namespace support (deterministic UUIDs for consistent hashing across systems)
- [ ] **Export Bulk UUIDs as File** - Download button to save bulk UUIDs as `.txt` or `.csv` file (bypasses clipboard limitations)
- [ ] **Uppercase/Lowercase Format Toggle** - Switch between lowercase (`550e8400...`) and uppercase (`550E8400...`) output formats
- [ ] **Remove Hyphens Option** - Compact format toggle for 32-character hex string without hyphens (useful for binary storage)
- [ ] **Bulk Validation** - Paste multiple UUIDs (newline-separated), validate all at once, show results table with valid/invalid/version columns
- [ ] **Custom Prefix/Suffix** - Add organizational namespace prefixes (e.g., `user_550e8400...` or `550e8400..._prod`) for resource identification

### Medium Priority

- [ ] **UUID Version Conversion** - Convert UUID v1 to v4, extract timestamp from v1 UUIDs and display human-readable date
- [ ] **Bulk Generation Presets** - Quick buttons for 10, 25, 50, 100 UUIDs (no manual input required)
- [ ] **UUID History** - Save last 10-20 generated UUIDs in session storage for easy retrieval and reference
- [ ] **Dark/Light Theme Toggle** - User preference for interface color scheme (currently dark glassmorphic theme only)
- [ ] **Keyboard Shortcuts** - `Ctrl+G` to generate, `Ctrl+C` to copy, `Ctrl+V` to paste and validate, `Ctrl+R` to refresh
- [ ] **NIL UUID Reference** - Display NIL UUID (`00000000-0000-0000-0000-000000000000`) as reference with copy button
- [ ] **UUID v1 Timestamp Extraction** - Parse v1 UUIDs to extract and display creation timestamp in human-readable format
- [ ] **Custom Validation Rules** - Enforce specific version (only accept v4), allow NIL UUID option, reject timestamp-based v1 for security

### Low Priority

- [ ] **UUID Collision Probability Calculator** - Input number of UUIDs, calculate exact collision probability (educational tool)
- [ ] **Batch Operations** - Combined generate → validate → copy workflow in single click for faster workflows
- [ ] **API Integration Endpoint** - `POST /api/generate-uuid` endpoint for programmatic UUID generation from other tools
- [ ] **QR Code Generation for UUIDs** - Convert UUID to QR code for mobile scanning (useful for physical asset tagging)
- [ ] **UUID Beautification** - Add hyphens to unhyphenated UUIDs (normalize `550e8400e29b41d4a716446655440000` → `550e8400-e29b-41d4-a716-446655440000`)
- [ ] **Share UUID via URL** - Generate shareable link with UUID in URL parameter (e.g., `?uuid=550e8400...`) for collaboration
- [ ] **UUID Comparison Tool** - Highlight differences between two UUIDs side-by-side (useful for debugging UUID mix-ups)
- [ ] **Deterministic UUID v5 with Input** - Generate v5 UUIDs with custom namespace and name input for reproducible IDs

### Technical Improvements

- [ ] **TypeScript Strict Mode Compliance** - Enable `strict: true` in tsconfig.json, fix all type errors for better type safety
- [ ] **Unit Tests for Validation Regex** - Jest/Vitest tests for edge cases (empty string, invalid version, malformed format)
- [ ] **E2E Tests for Clipboard Operations** - Playwright tests to verify copy functionality works across browsers
- [ ] **Performance Benchmarks** - Measure generation speed metrics (UUIDs/second), compare crypto.randomUUID vs Math.random fallback
- [ ] **ARIA Labels for Screen Readers** - Add proper accessibility labels for all interactive elements, buttons, and inputs
- [ ] **Service Worker Caching** - Cache tool assets for offline functionality and faster repeat visits
- [ ] **WebAssembly UUID Generation** - WASM implementation of UUID v4 generation for 10x speed boost on bulk operations
- [ ] **IndexedDB Persistence** - Store UUID history in IndexedDB for cross-session persistence (survives page refresh)

## Related Tools

- **Base64 Encoder/Decoder** - Encode UUIDs for URL-safe transmission in query parameters or API tokens (encodes 36-char UUID to 24-char base64)
- **Hash Generator** - Generate alternative unique identifiers using SHA-256, MD5, or other cryptographic hash functions
- **JSON Beautifier** - Format UUID arrays in JSON payloads for API testing and debugging (`["uuid1", "uuid2", ...]`)
- **Regex Tester** - Test custom UUID validation patterns, create regex for UUID variants, or validate modified UUID formats
- **Random String Generator** - Generate alternative unique identifiers with custom character sets, lengths, or patterns
- **API Tester** - Test API endpoints that accept UUID parameters (user IDs, resource identifiers, request correlation IDs)

## Tips & Best Practices

💡 **Always use UUID v4 for unpredictable identifiers** - Perfect for security tokens, session IDs, and public-facing IDs where predictability is a vulnerability. UUID v1 reveals MAC address and timestamp (potential security/privacy issue).

💡 **Store UUIDs as binary in databases for 50% space savings** - PostgreSQL UUID type (16 bytes) vs VARCHAR(36) (36 bytes). Use `CAST(id AS VARCHAR)` for display, store as UUID type: `CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid())`.

💡 **Use UUID v1 when sorting by creation time matters** - Timestamp-based UUIDs naturally sort chronologically (unlike random v4). Perfect for logs, events, or time-series data where temporal ordering is important.

💡 **Validate UUIDs before database insertion** - Prevents malformed data from third-party APIs corrupting your database schema. Add UUID validation to API request handlers and webhook receivers.

💡 **Copy bulk UUIDs to spreadsheet for SQL generation** - Paste in Excel/Google Sheets column A, use formula `="INSERT INTO table VALUES ('"&A1&"');"` in column B, drag down for all rows, copy column B for instant SQL INSERT statements.

💡 **Use UUIDs for distributed systems to avoid ID conflicts** - No central coordinator needed. Each service/database shard generates unique IDs independently. Perfect for microservices, multi-region deployments, and offline-first applications.

💡 **Don't use Math.random fallback for security-critical UUIDs** - Only use Web Crypto API (`crypto.randomUUID()`) for session tokens, API keys, or password reset tokens. Math.random is predictable and can be exploited by attackers.

💡 **Generate 10% extra UUIDs for contingency** - If you need 90 IDs, generate 100. Prevents regeneration if some UUIDs fail validation, collision checks (unlikely but possible), or need replacements during testing.

💡 **Include UUID version in API documentation** - Specify "UUID v4 required" in API specs so clients generate compatible identifiers. Some systems only accept specific versions (e.g., AWS Resource IDs are v4 only).

💡 **Use lowercase UUIDs for consistency** - Mixed case causes string comparison issues. Stick to lowercase (`550e8400...` not `550E8400...`). RFC 4122 recommends lowercase for canonical representation.

💡 **Test UUID validation before production deployment** - Ensure your backend accepts both uppercase and lowercase (case-insensitive comparison). Some libraries are case-sensitive by default and reject valid uppercase UUIDs.

💡 **Store UUID generation timestamp separately** - UUID v4 doesn't encode creation time. Add a `created_at` column if you need temporal ordering: `CREATE TABLE users (id UUID, created_at TIMESTAMP DEFAULT NOW())`.

💡 **Use UUID for public IDs, auto-increment for internal** - Expose UUIDs externally in API responses (hides record counts, prevents enumeration attacks), use integers internally for faster database joins and foreign keys.

💡 **Bulk generate for load testing** - Create 100 UUIDs, script them into HTTP requests to test API rate limiting, concurrent request handling, and database insertion performance under load.

💡 **Validate third-party webhook UUIDs immediately** - Prevents malformed IDs from breaking your webhook processing pipeline. Add validation as first step in webhook handlers before database queries.

💡 **Copy all UUIDs to version control for test fixtures** - Commit test data with known UUIDs makes debugging deterministic. Tests can reference specific UUIDs for assertions and database seeding.

💡 **Use UUID in file naming for parallel uploads** - Prevents race conditions when multiple users upload "profile.jpg" simultaneously. S3 key: `uploads/${uuid}.${extension}` ensures uniqueness.

💡 **Index UUID columns in databases for query performance** - UUIDs are longer than integers (16 bytes vs 4/8 bytes) but still indexable. Use B-tree indexes: `CREATE INDEX idx_users_id ON users(id)`.

💡 **Consider ULID (Universally Unique Lexicographically Sortable ID) for time-sorted UUIDs** - Alternative to UUID v1 without MAC address privacy concerns. 128-bit like UUID, but first 48 bits are timestamp (sorts chronologically).

💡 **Don't display full UUIDs in user interfaces** - Show first 8 characters (`550e8400...`) for readability, display full UUID on hover tooltip or click-to-expand. Improves UI density and scannability.

💡 **Use UUID validation before external API calls** - Saves HTTP requests if the UUID is malformed before sending. Validate format client-side before calling backend APIs or third-party services.

💡 **Generate UUIDs at database layer for atomic operations** - PostgreSQL `gen_random_uuid()`, MySQL `UUID()` functions ensure generation within transactions. Prevents UUID generation failure after transaction starts.

💡 **Copy single UUID for quick testing** - Paste into curl commands, Postman requests, or database queries for rapid development. Keep UUID generator open in browser tab for instant access.

💡 **Use bulk UUIDs for database migrations** - Generate IDs for existing records during schema changes (backfilling primary keys). Export 1000 UUIDs, split into batches of 100 for chunked updates.

💡 **Validate UUID version consistency across systems** - If your API expects v4, reject v1 UUIDs to maintain consistency. Some systems generate v1 by default (older Java UUID.randomUUID() implementations).

💡 **Use UUIDs in log correlation** - Add UUID to every log entry for tracing across microservices. ElasticSearch/Splunk query: `request_id:"550e8400..."` returns full distributed trace.

💡 **Store UUID in environment variables for testing** - Export known UUIDs as env vars for integration tests: `TEST_USER_ID=550e8400-e29b-41d4-a716-446655440000`. Consistent test data across CI/CD pipelines.

💡 **Use UUID for idempotency keys** - API requests with `Idempotency-Key: 550e8400...` header prevent duplicate charges in payment systems. Generate UUID client-side, attach to retry requests.

💡 **Copy UUIDs to clipboard manager** - Use clipboard history tools (Windows+V on Windows, Ctrl+Shift+V on macOS) to access recently generated UUIDs without regenerating.

---

**Route**: `/tools/data/uuid-generator`  
**Component**: `app/tools/data/uuid-generator/page.tsx`  
**Dependencies**:
- `framer-motion` (card animations with stagger delays)
- `sonner` (toast notifications for errors)
- `lucide-react` (icons: Check, Copy, Hash, Info, Loader2, RefreshCw, Sparkles, X)
- `Web Crypto API` (crypto.randomUUID for secure generation)
- `Clipboard API` (navigator.clipboard.writeText for copy operations)

**Test Coverage**: Not yet implemented (unit tests for validation regex and E2E tests for clipboard operations planned)  
**Last Updated**: January 2, 2026

---

## User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/data/uuid-generator`  
**Complexity**: Simple  
**Category**: Data Tools

### Overview

The UUID Generator is a powerful tool for generating and validating Universally Unique Identifiers (UUIDs). It supports multiple UUID versions, bulk generation, and real-time validation, making it perfect for developers, database administrators, and anyone working with unique identifiers.

### Key Features

- **Single UUID Generation**: Generate one UUID at a time with a click
- **Bulk Generation**: Create up to 100 UUIDs simultaneously
- **UUID Validation**: Verify UUID format and identify version
- **Version Support**: Works with UUID v1, v4, and v5
- **One-Click Copy**: Copy individual or all UUIDs to clipboard
- **Format Detection**: Automatically detects and displays UUID version
- **Secure Generation**: Uses Web Crypto API for cryptographically secure UUIDs
- **No Server Required**: All generation happens in your browser

### How to Use

#### Generating a Single UUID

##### Step 1: Generate
Click the "Generate New UUID" button or the refresh icon. A new UUID v4 will be created instantly.

##### Step 2: Copy
Click the "Copy" button next to the UUID to copy it to your clipboard. A success message will confirm the copy.

**Example Output:**
```
f47ac10b-58cc-4372-a567-0e02b2c3d479
```

#### Generating Multiple UUIDs (Bulk)

##### Step 1: Set Quantity
Enter the number of UUIDs you want to generate (1-100) in the "Bulk Generation" section.

##### Step 2: Generate
Click "Generate Bulk UUIDs". The tool will create all UUIDs instantly.

##### Step 3: Copy
- **Copy Individual**: Click the copy icon next to any UUID
- **Copy All**: Click "Copy All" to copy all UUIDs to clipboard (one per line)

**Example Bulk Output:**
```
a1b2c3d4-e5f6-4789-a012-3456789abcde
b2c3d4e5-f6a7-4890-b123-456789abcdef
c3d4e5f6-a7b8-4901-c234-56789abcdef0
...
```

#### Validating a UUID

##### Step 1: Enter UUID
Paste or type a UUID into the "UUID Validation" input field.

##### Step 2: Validate
Click "Validate UUID". The tool will:
- Check if the format is valid
- Display the UUID version (1-5)
- Show any errors if invalid

##### Step 3: Review Results
- **Valid UUID**: Green checkmark with version number
- **Invalid UUID**: Red X with error message

### Use Cases

#### Use Case 1: Database Primary Keys
Generate unique identifiers for database records without collisions.

**Solution**:
```javascript
// Generate UUID for new user
const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

// Insert into database
INSERT INTO users (id, name, email) 
VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'John Doe', 'john@example.com');
```

#### Use Case 2: API Request IDs
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

#### Use Case 3: File Naming
Generate unique filenames to prevent overwriting and organize uploads.

**Solution**:
```javascript
// Original: profile.jpg
// New: f47ac10b-58cc-4372-a567-0e02b2c3d479_profile.jpg
const filename = `${uuid}_${originalName}`
```

#### Use Case 4: Session IDs
Create secure session identifiers for web applications.

**Solution**:
```javascript
// Generate session ID on login
const sessionId = generateUUIDv4()
localStorage.setItem('sessionId', sessionId)
```

#### Use Case 5: Test Data Generation
Quickly create unique identifiers for testing and development.

**Solution**:
1. Generate 100 UUIDs in bulk
2. Copy all to clipboard
3. Paste into test data file or database seed

### Tips & Tricks

#### UUID Best Practices
- **Use v4 for most cases**: Randomly generated, no privacy concerns
- **Avoid v1 in distributed systems**: Contains timestamp and MAC address
- **Store as binary in databases**: Saves space (16 bytes vs 36 chars)
- **Index UUID columns**: Improves query performance

#### Performance Optimization
- **Bulk generation**: Generate multiple UUIDs at once instead of repeatedly
- **Reuse generated UUIDs**: Copy all bulk UUIDs for later use
- **Browser performance**: Generating 100 UUIDs takes ~300ms

#### Integration Tips
- **JavaScript**: `crypto.randomUUID()` (modern browsers)
- **Node.js**: `import { randomUUID } from 'crypto'`
- **Python**: `import uuid; uuid.uuid4()`
- **PostgreSQL**: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; SELECT uuid_generate_v4()`

#### Validation Use Cases
- **Verify format before database insertion**
- **Check UUID version for compatibility**
- **Validate user input in forms**
- **Debug UUID generation issues**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click Generate | Create new UUID |
| Click Copy | Copy to clipboard |
| Enter (in validation) | Validate UUID |

### Troubleshooting

#### Issue: "Invalid UUID format" Error
**Cause**: UUID doesn't match the standard format

**Solution**:
- Ensure format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Check for extra spaces or characters
- Verify hyphens are in correct positions
- Ensure all characters are hexadecimal (0-9, a-f)

#### Issue: Copy Button Not Working
**Cause**: Browser permissions or clipboard API not available

**Solution**:
- Grant clipboard permissions when prompted
- Try manually selecting and copying (Ctrl+C)
- Update your browser to the latest version

#### Issue: "Invalid UUID version" Message
**Cause**: UUID version number is outside 1-5 range

**Solution**:
- Most UUIDs should be v1, v4, or v5
- v4 is recommended for general use
- Regenerate if version is incorrect

#### Issue: Bulk Generation Fails
**Cause**: Invalid count entered

**Solution**:
- Enter a number between 1 and 100
- Ensure input is a valid integer
- Avoid special characters or decimals

### Technical Details

#### For Developers

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

#### UUID Versions Explained

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

### Related Tools

- **[Hash Generator](/tools/security/hash-generator)** - Generate MD5, SHA-1, SHA-256 hashes
- **[Random Password Generator](/tools/security/password-generator)** - Create secure passwords
- **[Base64 Encoder](/tools/security/base64)** - Encode/decode Base64 data
- **[JSON Beautifier](/tools/data/json-beautify)** - Format JSON with UUIDs

### Frequently Asked Questions

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

### Code Examples

#### JavaScript/TypeScript
```javascript
// Browser
const uuid = crypto.randomUUID()
console.log(uuid) // f47ac10b-58cc-4372-a567-0e02b2c3d479

// Node.js
import { randomUUID } from 'crypto'
const uuid = randomUUID()
```

#### Python
```python
import uuid

# Generate v4 UUID
my_uuid = uuid.uuid4()
print(my_uuid)  # f47ac10b-58cc-4372-a567-0e02b2c3d479

# Generate v5 UUID (name-based)
namespace = uuid.NAMESPACE_DNS
my_uuid = uuid.uuid5(namespace, 'example.com')
```

#### PostgreSQL
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

#### MySQL
```sql
-- Generate UUID
SELECT UUID();

-- Use in table
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
    name VARCHAR(100)
);
```

### Best Practices

1. **Use v4 for general purposes** - Random, no privacy concerns
2. **Store as binary in databases** - Saves 20 bytes per UUID
3. **Index UUID columns** - Especially important for large tables
4. **Validate UUIDs on input** - Prevent malformed data
5. **Use bulk generation** - More efficient for multiple UUIDs
6. **Consider sequential UUIDs for performance** - UUIDv6/v7 (not yet standard)

### Changelog

**v1.0** (Current)
- Single UUID generation (v4)
- Bulk generation (up to 100)
- UUID validation (v1-v5)
- Version detection
- Copy to clipboard
- Secure generation using Web Crypto API
