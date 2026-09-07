# Password Generator Pro - Usage Examples & Guide

**Last Updated:** November 2025  
**Tool URL:** `/tools/password-generator`

## Table of Contents

1. [Quick Start](#quick-start)
2. [Feature Examples](#feature-examples)
3. [Real-World Use Cases](#real-world-use-cases)
4. [Advanced Workflows](#advanced-workflows)
5. [Security Best Practices](#security-best-practices)
6. [Pro Tips](#pro-tips)

---

## Quick Start

### Basic Password Generation

**Default Settings:**
- Length: 16 characters
- Character types: Uppercase, lowercase, numbers, symbols
- Pattern: Random (cryptographically secure)

**Example Output:**
```
K7@mPx2nQ9#vLwZt
```

**Strength Analysis:**
- Score: 4/4 (Very Strong)
- Entropy: 95.4 bits
- Crack time: centuries
- HIBP status: ✅ Not found in breaches

---

## Feature Examples

### 1. Advanced Strength Analyzer (zxcvbn)

#### Example 1: Very Weak Password
**Input:** `password123`

**Analysis:**
- Score: 0/4 (Very Weak)
- Entropy: 13.2 bits
- Crack time: Less than a second
- Feedback: "This is a top-10 common password"
- HIBP: ⚠️ Found in 11,245,978 breaches

#### Example 2: Weak Password
**Input:** `abcdefgh`

**Analysis:**
- Score: 1/4 (Weak)
- Entropy: 37.6 bits
- Crack time: 2 minutes
- Feedback: "Add another word or two. Uncommon words are better."
- Strength indicator: Red (#ef4444)

#### Example 3: Fair Password
**Input:** `MyP@ssw0rd2024`

**Analysis:**
- Score: 2/4 (Fair)
- Entropy: 63.8 bits
- Crack time: 3 hours
- Feedback: "Predictable substitutions like '@' for 'a' don't help much"
- Strength indicator: Orange (#f97316)

#### Example 4: Good Password
**Input:** `Tr0p!c@l-F1$h-92`

**Analysis:**
- Score: 3/4 (Good)
- Entropy: 82.3 bits
- Crack time: 5 years
- Feedback: "Great password!"
- Strength indicator: Yellow (#eab308)

#### Example 5: Very Strong Password
**Input:** `K7@mPx2nQ9#vLwZt`

**Analysis:**
- Score: 4/4 (Very Strong)
- Entropy: 95.4 bits
- Crack time: centuries
- Feedback: "Excellent! This is a secure password."
- Strength indicator: Emerald (#10b981)

---

### 2. Pattern-Based Generation

#### A. Random Mode (Default)

**Configuration:**
- Length: 20 characters
- ✅ Uppercase (A-Z)
- ✅ Lowercase (a-z)
- ✅ Numbers (0-9)
- ✅ Symbols (!@#$%^&*)

**Example Outputs:**
```
8Kp#Qz2@mX9vLwTn7Rf!
Yx4&Bh9!Zm3@Pq7*Kv2
Wn5#Tr8@Lm1!Qx9&Jy3
```

**Characteristics:**
- Truly random (CSPRNG)
- Maximum entropy
- Ideal for high-security accounts (banking, email)

---

#### B. Diceware Passphrases

**Configuration:**
- Words: 5
- Separator: `-` (hyphen)
- Wordlist: EFF Long List (7,776 words)

**Example Outputs:**
```
correct-horse-battery-staple-coconut
tropical-guitar-moonlight-dolphin-cascade
keyboard-sunshine-elephant-volcano-crystal
```

**Use Cases:**
- Master passwords for password managers
- Encryption passphrases
- Disk encryption passwords
- WiFi passwords you need to share verbally

**Strength Comparison:**

| Words | Separator | Example | Entropy | Strength |
|-------|-----------|---------|---------|----------|
| 4 | space | `word word word word` | 51.7 bits | Fair |
| 5 | hyphen | `word-word-word-word-word` | 64.6 bits | Good |
| 6 | underscore | `word_word_word_word_word_word` | 77.5 bits | Very Strong |
| 7 | none | `wordwordwordwordwordwordword` | 90.5 bits | Very Strong |

**Pro Tip:** 5+ words with separators = excellent balance of security and memorability

---

#### C. Pronounceable Passwords

**Configuration:**
- Length: 16 characters
- Pattern: Consonant-vowel alternation
- Includes numbers and symbols

**Example Outputs:**
```
Tuvokafa12!Zexir
Ralomitu34#Qafun
Pixevora87@Lumak
```

**Benefits:**
- Easier to read aloud (phone support)
- Faster to type (no awkward key combinations)
- More memorable than pure random
- Still cryptographically secure

**Comparison to Random:**

| Type | Example | Typability | Memorability | Security |
|------|---------|------------|--------------|----------|
| Random | `K7@mPx2nQ9#v` | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Pronounceable | `Tuvokafa12!Ze` | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Diceware | `word-word-word` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

#### D. Template-Based Generation

##### Template 1: Banking & Finance
**Pattern:** `AAAAAA1111!!`  
**Example:** `KQMXPZ2847@#`

**Features:**
- All uppercase for clarity
- Strong symbol presence
- 12 characters minimum
- Ideal for: Banks, investment accounts, tax portals

##### Template 2: Social Media
**Pattern:** `Aaaaaa1111!`  
**Example:** `Tropical9572!`

**Features:**
- Mixed case for readability
- Moderate symbols
- 11 characters
- Ideal for: Facebook, Twitter, Instagram, LinkedIn

##### Template 3: WiFi Password
**Pattern:** `AAAA-AAAA-1111`  
**Example:** `KQMX-PZTR-2847`

**Features:**
- Uppercase only
- Hyphen separators
- Easy to read aloud
- Ideal for: Home WiFi, guest networks, router admin

##### Template 4: Email
**Pattern:** `aaaa.aaaa.1111`  
**Example:** `kqmx.pztr.2847`

**Features:**
- Lowercase only
- Dot separators
- Email-friendly format
- Ideal for: Gmail, Outlook, ProtonMail

##### Template 5: PIN/Numeric
**Pattern:** `1111111111`  
**Example:** `2847639512`

**Features:**
- Numbers only
- 10 digits
- Ideal for: Phone PINs, lock codes, card PINs

---

### 3. Password History Management

#### Workflow Example

**Step 1: Generate Password**
```
Generate: K7@mPx2nQ9#vLwZt
→ Automatically saved to history
```

**Step 2: View History**
```
History (10 most recent):
1. ⭐ K7@mPx2nQ9#vLwZt - Very Strong - 2025-11-08 10:30 AM
2.    Tr0p!c@l-F1$h-92 - Good - 2025-11-08 10:25 AM
3. ⭐ correct-horse-battery-staple - Good - 2025-11-08 10:20 AM
4.    MyP@ssw0rd2024 - Fair - 2025-11-08 10:15 AM
...
```

**Step 3: Export to CSV**
```csv
Password,Timestamp,Strength,Score,Entropy (bits),Crack Time,Length,Favorite
K7@mPx2nQ9#vLwZt,2025-11-08T10:30:00Z,Very Strong,4,95.4,centuries,16,true
Tr0p!c@l-F1$h-92,2025-11-08T10:25:00Z,Good,3,82.3,5 years,17,false
correct-horse-battery-staple,2025-11-08T10:20:00Z,Good,3,64.6,2 days,29,true
```

**Use Cases:**
- Track passwords for multiple accounts
- Compare strength across old passwords
- Export for password manager import
- Audit password security over time

---

### 4. Enhanced Bulk Generation

#### Example 1: Generate 10 Passwords

**Configuration:**
- Count: 10
- Length: 16
- Pattern: Random (all character types)

**Output:**
```
1. K7@mPx2nQ9#vLwZt - Very Strong (95.4 bits) - centuries
2. Yx4&Bh9!Zm3@Pq7 - Very Strong (90.2 bits) - centuries
3. Wn5#Tr8@Lm1!Qx9 - Very Strong (89.7 bits) - centuries
4. Qz2@Rv7!Kp3#Mn8 - Very Strong (94.1 bits) - centuries
5. Lw9&Tx4!Yz2@Bh5 - Very Strong (91.8 bits) - centuries
6. Zm1#Qx7@Wn3!Jy9 - Very Strong (93.5 bits) - centuries
7. Kv8!Tr2@Lm5#Px7 - Very Strong (92.3 bits) - centuries
8. Yx3&Bh9!Zm2@Qz8 - Very Strong (90.9 bits) - centuries
9. Wn7#Lw1@Tx5!Ry4 - Very Strong (94.7 bits) - centuries
10. Kp2!Qx8@Zm4#Jy6 - Very Strong (91.2 bits) - centuries
```

**Features:**
- ✅ All unique (deduplication guaranteed)
- ✅ Individual copy buttons
- ✅ Strength analysis per password
- ✅ Export all to CSV

---

#### Example 2: Bulk Diceware for Team

**Configuration:**
- Count: 5
- Pattern: Diceware
- Words: 4
- Separator: `-`

**Output (Team WiFi Passwords):**
```
1. tropical-guitar-moonlight-dolphin (51.7 bits) - Good
2. keyboard-sunshine-elephant-volcano (51.7 bits) - Good
3. crystal-rainbow-fountain-cascade (51.7 bits) - Good
4. thunder-meadow-blossom-harmony (51.7 bits) - Good
5. lantern-breeze-horizon-journey (51.7 bits) - Good
```

**Use Case:**
- Generate WiFi passwords for multiple office locations
- Easy to share verbally or in email
- Strong enough for guest networks

---

### 5. Have I Been Pwned Integration

#### Example 1: Safe Password
**Password:** `K7@mPx2nQ9#vLwZt`

**HIBP Check:**
```
✅ Great! This password has not been found in any known data breaches.
```

**Technical Details:**
- SHA-1 Hash: `7A3F2...` (first 5 chars: `7A3F2`)
- API Request: `https://api.pwnedpasswords.com/range/7A3F2`
- Response: 475 hashes checked
- Match: None found

---

#### Example 2: Compromised Password
**Password:** `password123`

**HIBP Check:**
```
⚠️ WARNING: This password has been found in 11,245,978 data breaches!
Never use this password. Generate a new one immediately.
```

**Technical Details:**
- Breach count: 11,245,978 times
- Risk level: CRITICAL
- Recommendation: Generate new password

---

#### Example 3: Common Password Blocked
**Password:** `qwerty`

**HIBP Check:**
```
⚠️ WARNING: This is a commonly used password!
It's on the top-30 most common passwords list.
```

**Common Password Blacklist (Top 30):**
```
1. password
2. 123456
3. password123
4. qwerty
5. 12345678
6. 111111
7. abc123
8. 1234567
9. password1
10. 12345
... (and 20 more)
```

---

### 6. Templates & Custom Rules Engine

#### Custom Template Creation

**Example 1: Custom Banking Template**
**Pattern:** `AAA.aaa.111.!!`

**Breakdown:**
- `AAA` = 3 uppercase letters
- `.` = Literal dot separator
- `aaa` = 3 lowercase letters
- `.` = Literal dot separator
- `111` = 3 numbers
- `.` = Literal dot separator
- `!!` = 2 symbols

**Example Output:** `KQM.pzt.284.@#`

---

**Example 2: Custom Gaming Template**
**Pattern:** `Aaaaa1111`

**Breakdown:**
- `A` = 1 uppercase letter
- `aaaa` = 4 lowercase letters
- `1111` = 4 numbers

**Example Output:** `Pixel9572`

---

**Example 3: Custom API Key Template**
**Pattern:** `AAAAAAAAAA-1111111111-aaaaaaaaaa`

**Breakdown:**
- `AAAAAAAAAA` = 10 uppercase
- `-` = Literal separator
- `1111111111` = 10 numbers
- `-` = Literal separator
- `aaaaaaaaaa` = 10 lowercase

**Example Output:** `KQMXPZTRLW-2847639512-bvfhnmcxqa`

---

### 7. Comprehensive Export System

#### History Export Format

**CSV Structure:**
```csv
Password,Timestamp,Strength,Score,Entropy (bits),Crack Time,Length,Favorite
K7@mPx2nQ9#vLwZt,2025-11-08T10:30:00Z,Very Strong,4,95.4,centuries,16,true
Tr0p!c@l-F1$h-92,2025-11-08T10:25:00Z,Good,3,82.3,5 years,17,false
```

**Use Cases:**
- Import to 1Password, LastPass, Bitwarden
- Audit password strength over time
- Backup password history
- Share with team (securely)

---

#### Bulk Export Format

**CSV Structure:**
```csv
Password,Strength,Score,Entropy (bits),Crack Time,Length
K7@mPx2nQ9#vLwZt,Very Strong,4,95.4,centuries,16
Yx4&Bh9!Zm3@Pq7,Very Strong,4,90.2,centuries,15
```

**Use Cases:**
- Generate passwords for multiple accounts at once
- Pre-generate passwords for new employee onboarding
- Create password pools for testing
- Mass password rotation

---

## Real-World Use Cases

### Use Case 1: Password Manager Master Password

**Requirement:**
- Extremely strong (max security)
- Memorable (you'll type it daily)
- Easy to type on mobile

**Recommended Solution: Diceware**

**Configuration:**
- Pattern: Diceware
- Words: 6
- Separator: `-` (hyphen)

**Example:**
```
tropical-guitar-moonlight-dolphin-cascade-harmony
```

**Strength:**
- Entropy: 77.5 bits
- Crack time: centuries
- Memorability: ⭐⭐⭐⭐⭐
- Mobile-friendly: ⭐⭐⭐⭐

---

### Use Case 2: Banking Website

**Requirement:**
- Maximum security
- Stored in password manager (doesn't need to be memorable)
- No restrictions on character types

**Recommended Solution: Random (Max Settings)**

**Configuration:**
- Pattern: Random
- Length: 32 characters
- All character types enabled

**Example:**
```
K7@mPx2nQ9#vLwZtYx4&Bh9!Zm3@Pq7
```

**Strength:**
- Entropy: 190.8 bits
- Crack time: beyond comprehension
- Security: Maximum possible

---

### Use Case 3: Home WiFi Password

**Requirement:**
- Secure enough for home network
- Easy to read aloud to guests
- Easy to type on TV remote

**Recommended Solution: WiFi Template or Diceware**

**Option A: Template**
**Pattern:** `AAAA-AAAA-1111`
**Example:** `KQMX-PZTR-2847`

**Option B: Diceware**
**Pattern:** Diceware, 4 words, hyphen
**Example:** `tropical-guitar-moonlight-dolphin`

**Comparison:**

| Aspect | Template | Diceware |
|--------|----------|----------|
| Security | Good (65 bits) | Good (51.7 bits) |
| Readability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Memorability | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| TV Remote | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

### Use Case 4: Social Media Account

**Requirement:**
- Strong but not maximum
- Occasionally typed on mobile
- Can be stored in password manager

**Recommended Solution: Pronounceable**

**Configuration:**
- Pattern: Pronounceable
- Length: 16 characters

**Example:**
```
Tuvokafa12!Zexir
```

**Strength:**
- Entropy: 75.3 bits
- Crack time: decades
- Typability: ⭐⭐⭐⭐
- Security: Good

---

### Use Case 5: Work Computer Login

**Requirement:**
- Typed multiple times per day
- Must be memorable
- Company requires 14+ characters

**Recommended Solution: Diceware**

**Configuration:**
- Pattern: Diceware
- Words: 4
- Separator: `.` (dot)

**Example:**
```
tropical.guitar.moonlight.dolphin
```

**Strength:**
- Entropy: 51.7 bits
- Crack time: 2 days (offline attack) / years (online attack)
- Memorability: ⭐⭐⭐⭐⭐
- Meets corporate policy: ✅ (33 characters)

---

### Use Case 6: API Keys & Tokens

**Requirement:**
- Long and complex
- Never typed by humans
- Must be URL-safe

**Recommended Solution: Custom Template**

**Configuration:**
- Pattern: `AAAAAAAAAA1111111111aaaaaaaaaa`
- Length: 30 characters
- No symbols (URL-safe)

**Example:**
```
KQMXPZTRLW2847639512bvfhnmcxqa
```

**Strength:**
- Entropy: 178.2 bits
- Crack time: beyond comprehension
- URL-safe: ✅

---

## Advanced Workflows

### Workflow 1: Complete Password Audit

**Step 1: Check Current Password**
```
1. Enter current password: MyP@ssw0rd2024
2. Analyze strength
   Result: Fair (63.8 bits) - 3 hours to crack
3. Check HIBP
   Result: ⚠️ Found in 5,284 breaches
```

**Step 2: Generate Replacement**
```
1. Select Random mode
2. Set length: 20 characters
3. Enable all character types
4. Generate: K7@mPx2nQ9#vLwZtYx4&
5. Verify strength: Very Strong (119.2 bits)
6. Check HIBP: ✅ Not found
```

**Step 3: Document**
```
1. Add to favorites (⭐)
2. Export to CSV
3. Import to password manager
4. Update account password
```

---

### Workflow 2: Team Password Generation

**Scenario:** Generate 10 WiFi passwords for different office locations

**Step 1: Configure Bulk Generation**
```
- Pattern: Diceware
- Words: 4
- Separator: -
- Count: 10
```

**Step 2: Generate & Review**
```
1. tropical-guitar-moonlight-dolphin
2. keyboard-sunshine-elephant-volcano
3. crystal-rainbow-fountain-cascade
4. thunder-meadow-blossom-harmony
5. lantern-breeze-horizon-journey
6. compass-whisper-galaxy-timber
7. anchor-valley-ember-phoenix
8. summit-river-zenith-maple
9. prism-meadow-echo-comet
10. glacier-harbor-nebula-cedar
```

**Step 3: Export & Distribute**
```
1. Export to CSV
2. Add location column manually
3. Share via secure channel (1Password, encrypted email)
```

---

### Workflow 3: Password Rotation Schedule

**Goal:** Rotate passwords for all critical accounts every 90 days

**Step 1: Export Current History**
```
1. Click "Export to CSV"
2. Save as: password_history_2025_11_08.csv
3. Review accounts that need rotation
```

**Step 2: Generate New Passwords**
```
1. Bulk generate: 15 passwords
2. Length: 20 characters
3. Pattern: Random
4. Export to: new_passwords_2025_11_08.csv
```

**Step 3: Update Accounts**
```
1. Match new passwords to accounts
2. Update accounts one by one
3. Mark as favorite after successful update
4. Delete old passwords from history
```

**Step 4: Schedule Next Rotation**
```
Next rotation date: February 8, 2026
Reminder: Add to calendar
```

---

### Workflow 4: New Employee Onboarding

**Goal:** Generate 8 passwords for new employee

**Required Passwords:**
1. Workstation login (memorable)
2. Company email (max security)
3. Project management tool (balanced)
4. VPN (balanced)
5. Slack (balanced)
6. GitHub (max security)
7. AWS Console (max security)
8. Company WiFi (readable)

**Generation Strategy:**

```
1. Workstation: Diceware (5 words, hyphen) → tropical-guitar-moonlight-dolphin-cascade
2. Email: Random (24 chars) → K7@mPx2nQ9#vLwZtYx4&Bh9!
3. Project: Pronounceable (16 chars) → Tuvokafa12!Zexir
4. VPN: Pronounceable (16 chars) → Ralomitu34#Qafun
5. Slack: Pronounceable (16 chars) → Pixevora87@Lumak
6. GitHub: Random (24 chars) → Zm1#Qx7@Wn3!Jy9Kv8!Tr2@
7. AWS: Random (24 chars) → Lm5#Px7Yx3&Bh9!Zm2@Qz8
8. WiFi: Template (WiFi pattern) → KQMX-PZTR-2847
```

**Export to CSV:**
```csv
Account,Password,Strength,Type
Workstation,tropical-guitar-moonlight-dolphin-cascade,Good,Diceware
Email,K7@mPx2nQ9#vLwZtYx4&Bh9!,Very Strong,Random
Project,Tuvokafa12!Zexir,Good,Pronounceable
VPN,Ralomitu34#Qafun,Good,Pronounceable
Slack,Pixevora87@Lumak,Good,Pronounceable
GitHub,Zm1#Qx7@Wn3!Jy9Kv8!Tr2@,Very Strong,Random
AWS,Lm5#Px7Yx3&Bh9!Zm2@Qz8,Very Strong,Random
WiFi,KQMX-PZTR-2847,Good,Template
```

---

## Security Best Practices

### 1. Password Length Recommendations

| Account Type | Minimum Length | Recommended Length | Pattern |
|--------------|----------------|-------------------|---------|
| Critical (banking, email) | 20 | 24-32 | Random |
| Important (work, cloud) | 16 | 20 | Random or Pronounceable |
| Standard (social media) | 12 | 16 | Pronounceable |
| Low-risk (forums, games) | 10 | 12 | Pronounceable |
| Master password | 25 | 30+ | Diceware (6+ words) |

---

### 2. Character Set Guidelines

| Scenario | Uppercase | Lowercase | Numbers | Symbols |
|----------|-----------|-----------|---------|---------|
| Maximum security | ✅ | ✅ | ✅ | ✅ |
| URL-safe | ✅ | ✅ | ✅ | ❌ |
| Email-friendly | ✅ | ✅ | ✅ | ⚠️ (limited) |
| Phone typing | ✅ | ✅ | ✅ | ❌ |
| Voice dictation | ❌ | ✅ | ❌ | ❌ |

---

### 3. Pattern Selection Guide

**Choose Random when:**
- Maximum security required
- Password stored in manager (not typed often)
- No character restrictions
- Examples: Banking, email, cryptocurrency

**Choose Diceware when:**
- Need to memorize password
- Master password for password manager
- Shared passwords (WiFi)
- Examples: Workstation login, master password

**Choose Pronounceable when:**
- Balance of security and usability
- Typed on mobile occasionally
- Need to read over phone
- Examples: Social media, work tools

**Choose Template when:**
- Specific format requirements
- Easy to communicate format
- Industry-specific needs
- Examples: WiFi (AAAA-AAAA-1111), API keys

---

### 4. HIBP Integration Best Practices

**Always check passwords that:**
- Are reused from old accounts
- Were generated years ago
- Seem "too simple" or "too common"
- Contain dictionary words
- Follow predictable patterns

**Never worry about passwords that:**
- Are 16+ characters with all character types
- Are freshly generated by this tool (Random mode)
- Have 85+ bits of entropy
- Score "Very Strong" (4/4)

---

### 5. Password Rotation Strategy

**Rotate immediately if:**
- Account was breached (confirmed)
- Password found in HIBP
- Password strength is "Weak" or "Very Weak"
- Password is reused across accounts
- Password is older than 2 years

**Rotate periodically (every 90 days) for:**
- Banking and financial accounts
- Work email and critical systems
- Admin/root accounts
- Cloud infrastructure (AWS, Azure, GCP)

**No need to rotate if:**
- Password is Very Strong (4/4)
- Password is unique to this account
- Account has 2FA enabled
- No breach indicators
- Password less than 1 year old

---

## Pro Tips

### Tip 1: Favorite System for Quick Access
Mark your most important passwords with ⭐ to quickly find them in history. Perfect for:
- Master passwords
- Primary email passwords
- Work account passwords

---

### Tip 2: Bulk Generation for Password Rotation
Generate 10-20 passwords at once, export to CSV, then update all accounts in one session. More efficient than generating one-by-one.

---

### Tip 3: Diceware for Memorization
Use the **story method** to remember Diceware passwords:
- Password: `tropical-guitar-moonlight-dolphin`
- Story: "I played a **tropical guitar** under the **moonlight** while a **dolphin** watched"

---

### Tip 4: Template Customization
Create your own templates for recurring needs:
- Company format: `Aaaa.Aaaa.1111`
- API keys: `AAAAAAAA-1111-aaaa`
- Game accounts: `Aaaaaaa1111`

---

### Tip 5: Password Manager Integration
Export history to CSV and import directly to:
- **1Password**: Logins → Import → CSV
- **LastPass**: More Options → Advanced → Import
- **Bitwarden**: Tools → Import Data → CSV

---

### Tip 6: Mobile-Friendly Patterns
For passwords you'll type on mobile, prefer:
1. **Diceware** (autocomplete helps)
2. **Pronounceable** (easier than random)
3. **Lowercase-only templates** (no shift key)

Avoid:
- Excessive symbols (hard to find on mobile keyboard)
- Mixed case every character (constant shift key)
- Very long random strings (error-prone)

---

### Tip 7: WiFi Password Sharing
Best formats for sharing WiFi passwords:
1. **Diceware (4 words)**: Easy to say verbally
2. **Template (AAAA-AAAA-1111)**: Easy to read off paper
3. **Pronounceable**: Balance of both

Worst formats:
- Random with symbols (hard to communicate)
- Very long strings (transcription errors)

---

### Tip 8: Entropy vs. Memorability Trade-off

| Pattern | Entropy (16 chars) | Memorability | Use Case |
|---------|-------------------|--------------|----------|
| Random | 95 bits | ⭐ | Stored passwords |
| Pronounceable | 75 bits | ⭐⭐⭐ | Occasional typing |
| Diceware (4 words) | 52 bits | ⭐⭐⭐⭐⭐ | Memorized passwords |

**Rule of thumb:** 
- Need to memorize? → Diceware
- Type occasionally? → Pronounceable
- Store in manager? → Random

---

### Tip 9: Check Old Passwords
Run your old passwords through the tool periodically:
1. Check current strength score
2. Run HIBP check
3. If Weak or found in breaches → rotate immediately

---

### Tip 10: Export Regularly
Export password history monthly to:
- Backup your password metadata
- Track strength improvements over time
- Audit account security
- Identify accounts needing rotation

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + G` | Generate new password |
| `Cmd/Ctrl + C` | Copy password (when focused) |
| `Escape` | Clear password field |
| `Tab` | Navigate between options |

---

## Common Questions

### Q: Why is my password rated "Weak" even with symbols?
**A:** zxcvbn detects patterns and common substitutions. `P@ssw0rd!` is weak because it's based on "password" with predictable substitutions. Generate a truly random password instead.

---

### Q: Should I use Diceware or Random?
**A:** 
- **Diceware**: If you need to memorize it (master passwords, workstation login)
- **Random**: If it's stored in a password manager (everything else)

---

### Q: How long should my password be?
**A:**
- **Minimum**: 12 characters (Fair)
- **Recommended**: 16 characters (Good to Very Strong)
- **High-security**: 20-24 characters (Very Strong)
- **Master password**: 25+ characters or 6+ Diceware words

---

### Q: Is it safe to check passwords with Have I Been Pwned?
**A:** Yes! The tool uses **k-anonymity**: only the first 5 characters of your password's hash are sent. Your full password never leaves your browser.

---

### Q: Why does HIBP sometimes show warnings for strong passwords?
**A:** If you're testing common passwords like "password123", HIBP will warn you even if the tool rates it. Trust HIBP for breach checks, trust zxcvbn for strength analysis.

---

### Q: Can I export passwords to my password manager?
**A:** Yes! Export to CSV and import to:
- 1Password, LastPass, Bitwarden, Dashlane
- Excel/Sheets for analysis
- Custom password management systems

---

### Q: How often should I rotate passwords?
**A:**
- **Critical accounts (banking)**: Every 90 days
- **Work accounts**: Per company policy (usually 90-180 days)
- **Personal accounts**: Annually or when breached
- **Low-risk accounts**: Only if compromised

---

### Q: What's the difference between entropy and crack time?
**A:**
- **Entropy**: Mathematical measure of randomness (bits)
- **Crack time**: Real-world estimate based on attack speed
- Example: 95 bits of entropy = centuries to crack with current hardware

---

## Analytics Events

The tool tracks these anonymous events for improvement:

```
- password_generated (pattern: random/diceware/pronounceable/template)
- strength_analyzed (score: 0-4)
- hibp_checked (found: true/false)
- password_copied
- bulk_generated (count: 1-100)
- history_exported
- bulk_exported
- template_selected (template: banking/social/wifi/email/pin)
```

All analytics are privacy-focused (no password data collected).

---

## Technical Details

### Cryptographic Security
- **Algorithm**: `crypto.getRandomValues()` (Web Crypto API)
- **CSPRNG**: Yes (cryptographically secure pseudorandom number generator)
- **Entropy source**: Operating system entropy pool
- **Bias**: None (uniform distribution)

### zxcvbn Strength Analysis
- **Version**: 4.4.2
- **Dictionary**: 30,000+ common passwords
- **Pattern detection**: Sequences, repeats, dates, spatial patterns
- **Scoring**: 0-4 (exponential scale)
- **Language**: English (with leet-speak detection)

### Have I Been Pwned
- **API**: v3 (k-anonymity)
- **Method**: SHA-1 hash range search
- **Privacy**: First 5 chars of hash sent only
- **Database**: 850+ million compromised passwords
- **Update frequency**: Real-time

### Performance
- **Generation time**: <10ms (all patterns)
- **zxcvbn analysis**: <50ms (typical)
- **HIBP check**: <500ms (network dependent)
- **History operations**: <5ms (LocalStorage)
- **Bulk generation (100)**: <100ms

---

## Changelog

### v2.0 (November 8, 2025) - Pro Upgrade
- ✅ Added zxcvbn strength analyzer
- ✅ Added Diceware passphrase generation
- ✅ Added pronounceable password mode
- ✅ Added 5 template presets
- ✅ Added Have I Been Pwned integration
- ✅ Added password history management
- ✅ Enhanced bulk generation (1-100 passwords)
- ✅ Added comprehensive CSV export system
- ✅ 1,700+ lines of new functionality

### v1.0 (October 26, 2024) - Initial Release
- Basic random password generation
- Character type selection
- Length control (8-64)
- Copy to clipboard
- Simple strength indicator

---

## Support & Feedback

**Found a bug?** Report at: https://github.com/sst/opencode  
**Feature request?** Open an issue with the "enhancement" label  
**Need help?** Check the examples above or contact support

---

**Generated by Password Generator Pro v2.0**  
**Last Updated:** November 2025  
**© 2025 SuperTool.id - All Rights Reserved**
