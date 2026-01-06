# Password Generator

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/security/password-generator`
**Category**: Security Tools
**Complexity**: Very Complex (1722 lines + 2000+ lines utils)

## Overview

The Password Generator is a comprehensive, cryptographically secure password creation tool that offers multiple generation modes, advanced strength analysis, breach checking via Have I Been Pwned (HIBP), bulk generation, and password history management. All passwords are generated using the Web Crypto API's `crypto.getRandomValues()` for true randomness, and all processing happens 100% client-side - no data is ever transmitted to any server.

## Key Features

### Generation Modes

#### 1. Random Mode (Default)
Traditional random character passwords with customizable options:
- **Length**: 8-64 characters (default: 16)
- **Character Sets**: Uppercase (A-Z), Lowercase (a-z), Numbers (0-9), Symbols (!@#$%^&*)
- Maximum entropy for security-critical applications

#### 2. Diceware Mode
Word-based passphrases using the EFF wordlist:
- **Word Count**: 4-10 words (default: 6)
- **Separator**: Hyphen (-) between words
- 6 words = ~77 bits of entropy (highly secure)
- Easy to memorize, hard to crack

#### 3. Pronounceable Mode
Easy-to-say passwords using consonant-vowel patterns:
- **Length**: 8-32 characters
- Alternating consonants and vowels
- Better for phone dictation or memory

#### 4. Template Mode
Pre-configured patterns for specific use cases:
- **Banking**: 16+ chars, all character types (`Xk5@-Pm7#-Qs2&-Lv9*`)
- **Social Media**: 12+ chars, mixed case + numbers (`Tp3Mk8Qr2Zv7`)
- **WiFi Network**: 16+ chars, no special chars (`Xk5pm7Qs2lv9Hn4x`)
- **Email Account**: 14+ chars, all types (`Tp3@Mk8#Qr2&Zv7`)
- **PIN Code**: 6-8 digit numeric (`842759`)

### Security Features

#### Strength Analysis
Real-time password strength evaluation using zxcvbn library:
- **Score**: 0-4 scale (Very Weak to Very Strong)
- **Entropy**: Bits of randomness
- **Crack Time**: Estimated time to crack (seconds to centuries)
- **Feedback**: Specific suggestions for improvement

#### Have I Been Pwned (HIBP) Integration
Check if passwords appear in known data breaches:
- Uses k-anonymity (only first 5 characters of hash sent)
- Checks against billions of leaked passwords
- Your full password is never transmitted

#### Common Password Detection
Warns if password matches known common patterns from the top 100 most-used passwords.

### Productivity Features

#### Bulk Generation
Generate multiple passwords at once:
- Up to 100 unique passwords per batch
- All passwords guaranteed unique within batch
- Export to CSV for password managers

#### Password History
Local storage of generated passwords:
- Last 10 passwords stored
- Favorites system with star toggle
- Export history to CSV
- Clear all or individual entries

### User Experience
- **URL State**: Settings persist in URL for sharing/bookmarking
- **Keyboard Shortcuts**: Quick access to common actions
- **One-Click Copy**: Copy password to clipboard instantly
- **Responsive Design**: Works on all device sizes

## How to Use

### Basic Password Generation

1. **Navigate** to `/tools/security/password-generator`
2. **Select Mode** using the mode selector (Random, Diceware, Pronounceable, Template)
3. **Configure Settings** based on your chosen mode:
   - Random: Adjust length slider and toggle character types
   - Diceware: Set number of words (4-10)
   - Pronounceable: Set length (8-32)
   - Template: Choose template from dropdown
4. **Click "Generate Password"** to create your secure password
5. **Review** the strength meter, entropy, and crack time
6. **Copy** using the copy button or keyboard shortcut

### Verifying Password Security

1. Generate or enter a password
2. Check the **Strength Meter** for immediate feedback
3. Click **"Check if Pwned"** to verify against breach databases
4. Review the result:
   - Green: Not found in known breaches
   - Red: Found in X number of breaches (generate a new one!)

### Bulk Generation

1. Scroll to the **"Bulk Generation"** section
2. Enter the number of passwords (1-100)
3. Click **"Generate X"** to create the batch
4. Click the **Download** button to export as CSV
5. Use **Copy** buttons to copy individual passwords

### Managing Password History

1. Toggle **"Show"** on the History panel
2. Click the **Star** icon to mark favorites
3. Click **Copy** to copy any historical password
4. Click **Trash** to remove individual entries
5. Use **"Export"** for CSV download
6. Use **"Clear All"** to reset history

## Use Cases

### High-Security Accounts (Banking, Email)
- Use **Random mode** with 16+ characters
- Enable all character types (uppercase, lowercase, numbers, symbols)
- Verify with HIBP check before use
- Or use **Template** mode with "Banking" preset

### Memorable Passwords
- Use **Diceware mode** with 6+ words
- Creates phrases like "correct-horse-battery-staple"
- 77+ bits of entropy with easy memorization

### WiFi Network Keys
- Use **Template** mode with "WiFi Network" preset
- 16+ characters without special characters
- Avoids issues with device compatibility

### Quick Account Creation
- Use **Bulk Generation** for multiple accounts
- Export to CSV for password manager import
- Each password is unique within the batch

### API Keys & Tokens
- Use **Random mode** with maximum length (64 characters)
- All character types for maximum entropy
- Bulk generate for multiple services

## Tips & Tricks

### Security Best Practices

| Practice | Recommendation |
|----------|---------------|
| Minimum Length | 16+ characters for important accounts |
| Character Variety | Enable all types when possible |
| Uniqueness | Never reuse passwords across accounts |
| Storage | Use a password manager (1Password, Bitwarden, LastPass) |
| Verification | Always check HIBP before using |

### Entropy Guidelines

| Entropy (bits) | Security Level | Use Case |
|----------------|----------------|----------|
| < 40 | Very Weak | Not recommended |
| 40-60 | Weak | Low-value accounts only |
| 60-80 | Good | Standard accounts |
| 80-100 | Strong | Important accounts |
| 100+ | Very Strong | Maximum security |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Generate new password |
| `Cmd/Ctrl + C` | Copy password |
| `Cmd/Ctrl + H` | Toggle history panel |
| `Cmd/Ctrl + R` | Reset form |
| `Cmd/Ctrl + /` | Show help dialog |

### URL Parameters
Share your settings via URL:
```
/tools/security/password-generator?length=20&uppercase=true&lowercase=true&numbers=true&symbols=true&mode=random
```

## Troubleshooting

### "At least one character set must be selected"
**Problem**: No character types enabled in Random mode
**Solution**: Enable at least one option (uppercase, lowercase, numbers, or symbols)

### HIBP Check Fails
**Problem**: "Failed to check password" error
**Possible Causes**:
- Network connectivity issues
- HIBP API temporarily unavailable
**Solution**: Try again in a few moments or proceed without the check

### Weak Password Warning Despite Settings
**Problem**: Password shows as weak despite long length
**Possible Causes**:
- Repeated characters detected
- Common pattern in password
- Predictable sequence
**Solution**: Generate a new password - truly random passwords should score higher

### History Not Saving
**Problem**: Passwords not appearing in history
**Possible Causes**:
- Private/Incognito browsing mode
- localStorage disabled
- Browser storage full
**Solution**: Use regular browsing mode and ensure storage is enabled

### Copy Not Working
**Problem**: Copy to clipboard fails
**Possible Causes**:
- Browser security restrictions
- Not using HTTPS
**Solution**: Ensure you're using HTTPS and the page is focused

## Technical Details

### Architecture
```
PasswordGeneratorPage (page.tsx)
├── PasswordGeneratorContent (main component)
│   ├── Header & Description
│   ├── Pro Tips Section
│   ├── How to Use Guide
│   ├── Mode Selector (Desktop/Mobile)
│   │   ├── Random
│   │   ├── Diceware
│   │   ├── Pronounceable
│   │   └── Template
│   ├── Password Generator Card
│   │   ├── Generated Password Display
│   │   ├── Common Password Warning
│   │   ├── Strength Meter
│   │   ├── Entropy & Crack Time Display
│   │   ├── HIBP Check Button
│   │   ├── Mode-specific Options
│   │   └── Generate Button
│   ├── Bulk Generation Card
│   ├── Password History Card
│   ├── Security Notice
│   ├── Social Share
│   ├── FAQ Accordion
│   ├── Related Tools
│   └── Tool Rating
└── Utilities (utils.ts)
    ├── generatePassword()
    ├── generateDiceware()
    ├── generatePronounceable()
    ├── generateFromTemplate()
    ├── calculateStrength()
    ├── checkPasswordPwned()
    ├── checkCommonPassword()
    └── History Management Functions
```

### Key Interfaces

```typescript
interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

interface StrengthResult {
  score: number        // 0-4 from zxcvbn
  label: string        // Weak, Fair, Good, Strong, Very Strong
  color: string        // Hex color
  feedback: string[]   // Suggestions from zxcvbn
  entropy?: number     // Bits of entropy
  crackTime?: string   // Human-readable crack time
  crackTimeSeconds?: number
}

interface PasswordHistory {
  password: string
  timestamp: number
  strength: StrengthResult
  favorite: boolean
  length: number
}

interface PasswordTemplate {
  id: string
  name: string
  description: string
  pattern: string
  example: string
  category: 'banking' | 'social' | 'wifi' | 'email' | 'custom'
}
```

### Cryptographic Security

```typescript
// All random generation uses crypto.getRandomValues()
const randomValues = new Uint32Array(options.length)
crypto.getRandomValues(randomValues)

// HIBP uses k-anonymity with SHA-1 hashing
const hashBuffer = await crypto.subtle.digest('SHA-1', data)
const prefix = hashHex.slice(0, 5) // Only first 5 chars sent
```

### Character Sets

```typescript
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}
```

### Dependencies
- `zxcvbn`: Password strength estimation library
- `nuqs`: URL state management for settings
- `framer-motion`: Smooth animations
- `lucide-react`: Icons
- `sonner`: Toast notifications
- Web Crypto API: Native cryptographic functions

### Storage
- **localStorage key**: `password-generator-history`
- **Maximum entries**: 10 passwords
- **Data stored**: Password, timestamp, strength metrics, favorite status

## Analytics Events

| Event | Description | Data |
|-------|-------------|------|
| `password_generate_random` | Random password generated | `length`, `has_uppercase`, `has_lowercase`, `has_numbers`, `has_symbols` |
| `password_generate_diceware` | Diceware passphrase generated | `words` |
| `password_generate_pronounceable` | Pronounceable password generated | `length` |
| `password_generate_template` | Template password generated | `template` |
| `password_copy` | Password copied to clipboard | `success` |
| `password_bulk_generate` | Bulk passwords generated | `count`, `unique` |
| `password_bulk_export` | Bulk passwords exported to CSV | `count` |
| `password_pwned_check` | HIBP breach check performed | `isPwned` |
| `password_history_export` | History exported to CSV | `count` |

## Related Tools

| Tool | Relationship |
|------|--------------|
| [Hash Generator](/tools/security/hash-generator) | Create hashes for passwords/files |
| [File Verifier](/tools/security/file-verifier) | Verify file integrity with hashes |
| [Base64 Encoder](/tools/security/base64) | Encode/decode Base64 data |
| [SSL Checker](/tools/security/ssl-checker) | Check website security certificates |

## FAQ

### Q: Are the passwords truly random?
**A**: Yes. We use the Web Crypto API's `crypto.getRandomValues()` function, which provides cryptographically secure random numbers suitable for generating encryption keys and passwords.

### Q: Are my passwords stored on a server?
**A**: No. All password generation and storage happens 100% in your browser. Passwords are never transmitted to any server. History is stored in your browser's localStorage.

### Q: What is k-anonymity and how does HIBP protect my password?
**A**: When checking HIBP, we hash your password with SHA-1, then only send the first 5 characters of the hash. The API returns all leaked passwords starting with those 5 characters, and we check locally if your full hash is in the list. Your actual password never leaves your browser.

### Q: What's the recommended password length?
**A**: For important accounts (banking, email), use 16+ characters with all character types. For maximum security, use 20+ characters or a 6+ word diceware passphrase.

### Q: What is entropy and why does it matter?
**A**: Entropy measures password randomness in bits. Higher entropy = more possible combinations = harder to crack. A 16-character random password with all character types has ~95 bits of entropy, which would take centuries to crack.

### Q: Should I use Diceware or Random passwords?
**A**: 
- **Random**: Maximum security, harder to remember, best for password managers
- **Diceware**: Very secure (77+ bits with 6 words), easy to memorize, good for master passwords

### Q: How do password templates work?
**A**: Templates use patterns where `A` = uppercase, `a` = lowercase, `1` = number, `!` = symbol. The pattern `Aa1!` generates one of each type. Literal characters (like `-`) are kept as-is.

### Q: Can I generate passwords offline?
**A**: Yes! All password generation works offline since it uses your browser's crypto API. Only the HIBP breach check requires internet connectivity.

## Best Practices

### For Personal Accounts
1. Use unique passwords for every account
2. Store passwords in a password manager
3. Enable 2FA wherever possible
4. Use 16+ character passwords for important accounts
5. Check HIBP before using any password

### For Enterprise/Team Use
1. Use bulk generation for provisioning
2. Export to CSV for secure distribution
3. Use template mode for compliance requirements
4. Document password policies and share URL presets
5. Regular rotation for high-security accounts

### For Developers
1. Never log generated passwords
2. Use maximum entropy for API keys
3. Rotate credentials regularly
4. Store only hashed passwords in databases
5. Use secure password hashing (bcrypt, Argon2)

## Changelog

### Version 1.0.0 (January 2026)
- Initial release with 4 generation modes
- Random, Diceware, Pronounceable, Template
- zxcvbn-powered strength analysis
- Have I Been Pwned breach checking with k-anonymity
- Bulk generation (up to 100 passwords)
- Password history with favorites
- CSV export for bulk and history
- URL state persistence
- Keyboard shortcuts
- Responsive design with glassmorphic UI
- Comprehensive FAQ section
- Related tools integration
- Social sharing
- Tool rating system

---

*Part of SuperTool - Your Developer Toolkit*
*Security Tools Category*
