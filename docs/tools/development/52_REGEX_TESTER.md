# 52 - Regex Tester

**Created:** January 2, 2026  
**Last Updated:** January 2, 2026  
**Category:** Development Tools  
**Status:** ✅ Active · ⭐ New

## Overview

Test and validate regular expressions with live matching, syntax highlighting, and pattern library. Generate code in 12+ programming languages, access 30+ pre-built patterns, and debug regex with detailed match results—perfect for developers learning regex or debugging patterns.

## Purpose

Regular expressions are powerful but notoriously difficult to write and debug. This tool provides instant visual feedback, highlights matches in real-time, offers a comprehensive pattern library, and generates ready-to-use code in multiple languages—making regex development faster and less error-prone.

## Key Features

### 1. **Live Regex Testing**

- Real-time pattern matching as you type
- Instant validation and error detection
- Highlighted matches in test string
- Match count and position tracking
- Support for all standard regex flags
- Unicode and extended syntax support

### 2. **Comprehensive Pattern Library (30+ Patterns)**

**Validation Patterns:**
- Email addresses (RFC 5322 compliant)
- URLs (HTTP/HTTPS)
- IP addresses (IPv4 and IPv6)
- Phone numbers (US and international)
- Credit card numbers (Visa, MasterCard, AMEX)
- Postal codes (US ZIP, UK, Canada)
- Social Security Numbers

**Format Patterns:**
- Dates (ISO 8601, US, EU formats)
- Times (12/24 hour)
- Currency (USD, EUR, GBP)
- Hex colors (#RGB, #RRGGBB)
- MAC addresses
- UUID/GUID

**Programming Patterns:**
- Variable names (camelCase, snake_case)
- Function declarations
- Import statements
- HTML tags
- CSS selectors
- JSON objects

**Text Patterns:**
- Whitespace normalization
- Duplicate lines
- Words extraction
- Numbers extraction
- File extensions
- Markdown headings

### 3. **Regex Flags Support**

- `g` - Global (find all matches)
- `i` - Case insensitive
- `m` - Multiline mode
- `s` - Dotall mode (`.` matches newlines)
- `u` - Unicode mode
- `y` - Sticky mode

### 4. **Multi-Language Code Generation (12 Languages)**

- **JavaScript** - `/pattern/flags` syntax
- **TypeScript** - With type annotations
- **Python** - `re` module
- **Java** - `Pattern` and `Matcher` classes
- **C#** - `Regex` class with options
- **PHP** - `preg_match` functions
- **Ruby** - Regex literals
- **Go** - `regexp` package
- **Rust** - `regex` crate
- **Swift** - `NSRegularExpression`
- **Perl** - Native regex syntax
- **Shell** - `grep` and `sed` commands

### 5. **Match Details Panel**

- Total match count
- Individual match positions
- Captured groups extraction
- Named groups display
- Match indices (start/end)
- Copy individual matches

### 6. **Pattern Quick Reference**

- Common metacharacters (., *, +, ?, |, ^, $)
- Character classes ([abc], \d, \w, \s)
- Quantifiers ({n}, {n,m}, *, +, ?)
- Anchors (^, $, \b, \B)
- Groups and backreferences ((abc), \1)
- Lookahead/lookbehind assertions

## How It Works

### Regex Testing Engine

```typescript
interface RegexMatch {
  match: string
  index: number
  groups?: string[]
  namedGroups?: Record<string, string>
}

function testRegex(
  pattern: string,
  flags: string[],
  testString: string
): {
  isValid: boolean
  matches: RegexMatch[]
  error?: string
  hasMatch: boolean
} {
  try {
    const regex = new RegExp(pattern, flags.join(''))
    const matches: RegexMatch[] = []
    
    if (flags.includes('g')) {
      // Global flag: find all matches
      let match: RegExpExecArray | null
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups,
        })
      }
    } else {
      // No global flag: find first match only
      const match = regex.exec(testString)
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups,
        })
      }
    }
    
    return {
      isValid: true,
      matches,
      hasMatch: matches.length > 0,
    }
  } catch (error) {
    return {
      isValid: false,
      matches: [],
      error: error.message,
      hasMatch: false,
    }
  }
}
```

### Match Highlighting

```typescript
function highlightMatches(
  text: string,
  matches: RegexMatch[]
): React.ReactNode {
  if (matches.length === 0) return text
  
  let lastIndex = 0
  const parts: React.ReactNode[] = []
  
  matches.forEach((match, idx) => {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Add highlighted match
    parts.push(
      <span
        key={idx}
        className={css({
          bg: 'green.500/20',
          color: 'green.300',
          fontWeight: 'semibold',
          px: '1',
          rounded: 'sm',
        })}
      >
        {match.match}
      </span>
    )
    
    lastIndex = match.index + match.match.length
  })
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts
}
```

### Code Generation

```typescript
function generateCode(
  pattern: string,
  flags: string[],
  language: string
): string {
  const flagsStr = flags.join('')
  
  switch (language) {
    case 'javascript':
      return `const regex = /${pattern}/${flagsStr};
const matches = text.match(regex);`
    
    case 'python':
      return `import re
regex = re.compile(r'${pattern}', re.${flags.map(f => FLAG_MAP[f]).join(' | re.')})
matches = regex.findall(text)`
    
    case 'java':
      return `Pattern pattern = Pattern.compile("${pattern}", ${getJavaFlags(flags)});
Matcher matcher = pattern.matcher(text);
while (matcher.find()) {
    System.out.println(matcher.group());
}`
    
    case 'php':
      return `preg_match_all('/${pattern}/${flagsStr}', $text, $matches);
print_r($matches);`
    
    // ... other languages
  }
}
```

## Usage Instructions

### Basic Pattern Testing

1. **Enter Pattern**: Type regex in pattern field
   - Example: `\d{3}-\d{3}-\d{4}` for phone numbers
2. **Add Test String**: Enter text to match against
   - Example: `Call me at 555-123-4567`
3. **Toggle Flags**: Enable flags as needed
   - `g` for multiple matches
   - `i` for case-insensitive
4. **View Results**: See matches highlighted in real-time
5. **Check Match Details**: Review match count and positions

### Using Pattern Library

1. **Browse Patterns**: Click "Pattern Library" button
2. **Filter by Category**: Select Validation, Format, Programming, or Text
3. **Select Pattern**: Click a pattern to load it
4. **View Examples**: See pre-filled test cases
5. **Customize**: Modify pattern for your needs

### Generating Code

1. **Test Your Regex**: Ensure pattern works correctly
2. **Open Code Generator**: Click "Generate Code" button
3. **Select Language**: Choose from 12 supported languages
4. **Copy Code**: Click copy button or manually select
5. **Paste in Project**: Use generated code directly

### Example Workflows

#### Workflow 1: Validate Email Addresses
```
1. Load "Email Validation" pattern from library
2. Pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
3. Test string: "user@example.com, invalid@, test@domain.co.uk"
4. Enable 'g' flag for multiple matches
5. Result: Highlights valid emails only
6. Generate Python code for use in validation script
```

#### Workflow 2: Extract URLs from Text
```
1. Load "URL Extraction" pattern
2. Pattern: https?://[^\s]+
3. Test string: "Visit https://example.com and http://test.org"
4. Enable 'g' and 'i' flags
5. Result: Both URLs highlighted
6. Copy matches for processing
```

#### Workflow 3: Format Phone Numbers
```
1. Load "US Phone Number" pattern
2. Pattern: \(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})
3. Test string: "(555) 123-4567, 555.987.6543, 5551234567"
4. Enable 'g' flag
5. Result: All formats matched with captured groups
6. Use groups to standardize format
```

#### Workflow 4: Debug Complex Pattern
```
1. Write custom pattern for parsing log files
2. Pattern: ^\[(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})\]\s(\w+):\s(.+)$
3. Test string: "[2024-01-15 14:32:01] ERROR: Connection timeout"
4. Enable 'm' flag for multiline
5. View captured groups: date, time, level, message
6. Adjust pattern if matches are incorrect
```

## Pattern Library Categories

### Validation (Email, URLs, IPs)
- Email (RFC 5322): `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- URL (HTTP/S): `https?://[^\s]+`
- IPv4: `^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`
- Phone (US): `^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$`

### Format (Dates, Currency, Hex)
- ISO Date: `^\d{4}-\d{2}-\d{2}$`
- US Date: `^(0?[1-9]|1[0-2])/(0?[1-9]|[12][0-9]|3[01])/\d{4}$`
- Currency: `^\$?[\d,]+(\.\d{2})?$`
- Hex Color: `^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`

### Programming (Variables, Functions)
- camelCase: `^[a-z]+([A-Z][a-z]*)*$`
- snake_case: `^[a-z]+(_[a-z]+)*$`
- HTML Tag: `<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)`
- Function Call: `\b\w+\s*\([^)]*\)`

### Text (Words, Numbers, Files)
- Extract Words: `\b\w+\b`
- Extract Numbers: `\d+(\.\d+)?`
- File Extension: `\.([a-zA-Z0-9]+)$`
- Duplicate Lines: `^(.*)(\r?\n\1)+$`

## Regex Quick Reference

### Metacharacters
| Character | Meaning | Example |
|-----------|---------|---------|
| `.` | Any character (except newline) | `a.c` matches "abc", "a9c" |
| `*` | 0 or more repetitions | `ab*` matches "a", "ab", "abb" |
| `+` | 1 or more repetitions | `ab+` matches "ab", "abb" (not "a") |
| `?` | 0 or 1 repetition | `colou?r` matches "color", "colour" |
| `|` | OR operator | `cat|dog` matches "cat" or "dog" |
| `^` | Start of string/line | `^Hello` matches "Hello world" |
| `$` | End of string/line | `world$` matches "Hello world" |

### Character Classes
| Class | Meaning | Equivalent |
|-------|---------|------------|
| `\d` | Digit | `[0-9]` |
| `\D` | Non-digit | `[^0-9]` |
| `\w` | Word character | `[A-Za-z0-9_]` |
| `\W` | Non-word character | `[^A-Za-z0-9_]` |
| `\s` | Whitespace | `[ \t\n\r\f\v]` |
| `\S` | Non-whitespace | `[^ \t\n\r\f\v]` |
| `[abc]` | Any of a, b, c | |
| `[^abc]` | Not a, b, or c | |
| `[a-z]` | Range a to z | |

### Quantifiers
| Quantifier | Meaning | Example |
|------------|---------|---------|
| `{n}` | Exactly n times | `a{3}` matches "aaa" |
| `{n,}` | n or more times | `a{2,}` matches "aa", "aaa", "aaaa" |
| `{n,m}` | Between n and m times | `a{2,4}` matches "aa", "aaa", "aaaa" |

### Anchors & Boundaries
| Anchor | Meaning | Example |
|--------|---------|---------|
| `^` | Start of string/line | `^\d+` matches leading numbers |
| `$` | End of string/line | `\d+$` matches trailing numbers |
| `\b` | Word boundary | `\bcat\b` matches "cat" not "catch" |
| `\B` | Non-word boundary | `\Bcat\B` matches "concatenate" |

### Groups & Backreferences
| Syntax | Meaning | Example |
|--------|---------|---------|
| `(abc)` | Capturing group | `(ab)+` captures "ab", "abab" |
| `(?:abc)` | Non-capturing group | `(?:ab)+` matches but doesn't capture |
| `(?<name>abc)` | Named group | `(?<year>\d{4})` captures as "year" |
| `\1`, `\2` | Backreference | `(\w+)\s\1` matches repeated words |

## Analytics Events

```typescript
// Pattern testing
trackToolEvent('regex_tester_open')
trackToolEvent('regex_tester_pattern_changed', { pattern_length: 25 })
trackToolEvent('regex_tester_test_string_changed', { length: 100 })
trackToolEvent('regex_tester_flag_toggled', { flag: 'i' })

// Match results
trackToolEvent('regex_tester_match_found', { match_count: 5 })
trackToolEvent('regex_tester_invalid_pattern', { error: 'Unterminated group' })

// Library usage
trackToolEvent('regex_tester_pattern_loaded', { pattern_id: 'email_validation' })
trackToolEvent('regex_tester_category_filtered', { category: 'validation' })

// Code generation
trackToolEvent('regex_tester_code_generated', { language: 'python' })
trackToolEvent('regex_tester_code_copied', { language: 'javascript' })

// Actions
trackToolEvent('regex_tester_cleared')
trackToolEvent('regex_tester_pattern_copied')
```

## UI/UX Design

### Layout Structure
```
┌──────────────────────────────────────────────────┐
│  Header: Regex Tester + Pattern Library Button  │
├──────────────────────────────────────────────────┤
│  Pattern Input                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  /  [pattern input]  /  [g][i][m][s][u]   │ │
│  └────────────────────────────────────────────┘ │
│  ⚠️ Error message (if invalid)                  │
├──────────────────────────────────────────────────┤
│  Test String                                     │
│  ┌────────────────────────────────────────────┐ │
│  │  Multiline text area with highlighted      │ │
│  │  matches in green                          │ │
│  └────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  Match Results                                   │
│  ✅ 5 matches found                             │
│  1. "example" at position 10                    │
│  2. "test" at position 25  [Copy]              │
│  ... (show all matches)                         │
├──────────────────────────────────────────────────┤
│  Actions                                         │
│  [Copy Pattern] [Generate Code] [Clear]         │
├──────────────────────────────────────────────────┤
│  Code Generator (Expandable)                    │
│  Language: [JavaScript ▼]                       │
│  ┌────────────────────────────────────────────┐ │
│  │  const regex = /pattern/gi;                │ │
│  │  const matches = text.match(regex);       │ │
│  └────────────────────────────────────────────┘ │
│  [Copy Code]                                    │
└──────────────────────────────────────────────────┘
```

### Visual Design
- **Gradient**: Purple to pink (pattern/matching theme)
- **Monospace Font**: For pattern and test string
- **Syntax Highlighting**: Different colors for regex components
- **Match Highlighting**: Green background for matches
- **Error States**: Red border and message for invalid patterns
- **Flag Badges**: Toggle buttons with active state

## Performance Optimizations

- **Debounced Testing**: 300ms delay to avoid excessive re-renders
- **Memoized Matches**: Cache results until pattern/string changes
- **Virtualized Match List**: For 100+ matches
- **Lazy Code Generation**: Generate only when requested
- **Pattern Caching**: Store loaded patterns in memory

## Browser Compatibility

✅ Chrome 64+, Firefox 78+, Safari 11.1+, Edge 79+  
✅ Requires modern JavaScript (ES2018+)  
✅ Unicode regex support varies by browser  
✅ Lookbehind assertions require recent browsers

## Common Questions

**Q: Why doesn't my pattern match?**  
A: Check flags (especially `g` for multiple matches), escape special characters, and verify syntax.

**Q: What's the difference between `*` and `+`?**  
A: `*` matches 0 or more (optional), `+` matches 1 or more (required at least once).

**Q: How do I match a literal `.` or `*`?**  
A: Escape with backslash: `\.` matches period, `\*` matches asterisk.

**Q: Why use non-capturing groups `(?:)`?**  
A: Improves performance when you don't need to extract the group, just group for operators.

**Q: How do I match newlines with `.`?**  
A: Enable the `s` (dotall) flag, or use `[\s\S]` explicitly.

## Future Enhancements

- [ ] Visual regex builder (drag-and-drop)
- [ ] Regex explainer (plain English breakdown)
- [ ] Performance benchmarking
- [ ] Saved patterns library (user-created)
- [ ] Regex challenges/tutorials
- [ ] Export match results to CSV
- [ ] Share regex via URL
- [ ] AI-powered pattern suggestions
- [ ] Syntax error autocorrection
- [ ] Regex to NFA/DFA visualization

## Related Tools

- **Text Transformer** - Manipulate text with replacements
- **JSON Beautifier** - Parse and format JSON
- **Code Diff Viewer** - Compare text changes
- **API Tester** - Test endpoints with regex validation

## Tips & Best Practices

💡 **Start Simple**: Build complex patterns incrementally  
💡 **Test Edge Cases**: Empty strings, special characters, long text  
💡 **Use Non-Capturing Groups**: `(?:)` when not extracting  
💡 **Avoid Greedy Quantifiers**: Use `*?` or `+?` for minimal matching  
💡 **Anchor Your Pattern**: Use `^` and `$` for exact matches  
💡 **Escape Metacharacters**: `\.`, `\*`, `\+`, `\?`, etc.  
💡 **Use Character Classes**: `[a-z]` instead of `(a|b|c|...)`  

## Learning Resources

**Regex Tutorials:**
- RegexOne (interactive lessons)
- Regex101 (community patterns)
- Regular-Expressions.info (comprehensive guide)

**Practice Sites:**
- HackerRank Regex Challenges
- RegexCrossword (puzzle game)
- RegexGolf (code golf style)

---

**Route:** `/tools/development/regex-tester`  
**Component:** `app/tools/development/regex-tester/page.tsx`  
**Pattern Library:** 30+ pre-built patterns  
**Dependencies:** Native JavaScript RegExp API  
**Tests:** Pattern validation, match highlighting, code generation  
**Performance:** <10ms for typical patterns

---

## User Guide

**Last Updated**: January 5, 2026  
**Tool Path**: `/tools/development/regex-tester`  
**Complexity**: Complex  
**Category**: Development Tools

### Overview

The Regex Tester is a powerful tool for testing, validating, and debugging regular expressions. It provides real-time pattern matching, syntax highlighting, pre-built patterns for common use cases, code generation in multiple languages, and detailed match information.

### Key Features

- **Real-time Testing**: Instant pattern matching as you type
- **Syntax Validation**: Immediate error detection and feedback
- **Match Highlighting**: Visual highlighting of matched text
- **50+ Pre-built Patterns**: Common regex patterns ready to use
- **Code Generation**: Export regex to 8+ programming languages
- **Flag Support**: All standard regex flags (g, i, m, s, u, y)
- **Capture Groups**: View and analyze capture groups
- **Match Details**: Index, position, and group information
- **Pattern Library**: Categorized patterns (validation, extraction, formatting)
- **Copy to Clipboard**: One-click copy for patterns and code

### How to Use

#### Basic Pattern Testing

##### Step 1: Enter Your Pattern
Type your regular expression in the "Pattern" field.

**Example:**
```regex
\d{3}-\d{3}-\d{4}
```

##### Step 2: Add Test String
Enter the text you want to test against in the "Test String" field.

**Example:**
```
My phone number is 555-123-4567
```

##### Step 3: View Results
- **Matches Found**: Number of matches displayed
- **Highlighted Text**: Matched portions highlighted in the test string
- **Match Details**: Index, text, and capture groups shown

#### Understanding Regex Flags

Click flag buttons to toggle them on/off:

##### g (Global)
- Finds all matches, not just the first
- **Example**: `/cat/g` finds all "cat" in "cat cat cat" (3 matches)
- **Without g**: Only finds first "cat" (1 match)

##### i (Case Insensitive)
- Ignores uppercase/lowercase differences
- **Example**: `/hello/i` matches "Hello", "HELLO", "hello"
- **Without i**: Only matches exact case

##### m (Multiline)
- `^` and `$` match line starts/ends, not just string start/end
- **Example**: `/^test/m` matches "test" at start of each line
- **Use case**: Processing multiple lines of text

##### s (Dotall)
- `.` matches newline characters
- **Example**: `/a.b/s` matches "a\nb" (with newline between)
- **Without s**: `.` doesn't match newlines

##### u (Unicode)
- Enables Unicode mode
- **Example**: `/\u{1F600}/u` matches 😀 emoji
- **Use case**: Working with Unicode characters

##### y (Sticky)
- Matches only at exact position
- **Advanced use case**: Parsing from specific position
- **Rarely used**: Most cases use `g` instead

#### Using Pre-built Patterns

##### Step 1: Click "Pattern Library"
Browse 50+ ready-to-use patterns organized by category.

##### Step 2: Select Category
- **Validation**: Email, URL, phone, IP, dates, colors
- **Extraction**: Extract emails, URLs, numbers from text
- **Formatting**: Clean whitespace, format phone numbers
- **Advanced**: Capture groups, lookaheads, complex patterns

##### Step 3: Load Pattern
Click any pattern to instantly load it with example text.

**Popular Patterns:**

**Email Validation:**
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```
Validates: `user@example.com`

**URL Validation:**
```regex
^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b
```
Validates: `https://example.com`

**US Phone Number:**
```regex
^(\+1\s?)?\(?([0-9]{3})\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$
```
Validates: `(555) 123-4567`, `555-123-4567`, `5551234567`

**IPv4 Address:**
```regex
^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$
```
Validates: `192.168.1.1`

**Hex Color Code:**
```regex
^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$
```
Validates: `#FF5733`, `#f00`

**Credit Card Number:**
```regex
^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$
```
Validates: Visa, MasterCard, Amex formats

#### Generating Code

##### Step 1: Click "Generate Code"
Open the code generation panel.

##### Step 2: Select Language
Choose from 8+ programming languages:
- JavaScript/TypeScript
- Python
- Java
- C#
- PHP
- Ruby
- Go
- Perl

##### Step 3: Copy Code
Click "Copy Code" to copy the implementation.

**Example Output (JavaScript):**
```javascript
const pattern = /\d{3}-\d{3}-\d{4}/g;
const text = "My phone number is 555-123-4567";
const matches = text.match(pattern);

// Result: ["555-123-4567"]
```

**Example Output (Python):**
```python
import re

pattern = r'\d{3}-\d{3}-\d{4}'
text = "My phone number is 555-123-4567"
matches = re.findall(pattern, text)

# Result: ['555-123-4567']
```

#### Understanding Capture Groups

Capture groups extract parts of matches.

**Pattern:**
```regex
(\d{3})-(\d{3})-(\d{4})
```

**Test String:**
```
555-123-4567
```

**Results:**
- **Full Match**: `555-123-4567`
- **Group 1**: `555` (area code)
- **Group 2**: `123` (prefix)
- **Group 3**: `4567` (line number)

**Named Capture Groups:**
```regex
(?<area>\d{3})-(?<prefix>\d{3})-(?<line>\d{4})
```

Access groups by name:
```javascript
const match = text.match(/(?<area>\d{3})-(?<prefix>\d{3})-(?<line>\d{4})/);
console.log(match.groups.area);    // "555"
console.log(match.groups.prefix);  // "123"
console.log(match.groups.line);    // "4567"
```

### Use Cases

#### Use Case 1: Form Validation
Validate user input in web forms.

**Scenario**: Email signup form needs validation.

**Solution**:
```regex
Pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
Test: user@example.com ✅
Test: invalid-email ❌
Test: test@domain ❌
```

Implement in JavaScript:
```javascript
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (emailPattern.test(userInput)) {
  // Valid email
} else {
  // Show error
}
```

#### Use Case 2: Data Extraction
Extract specific data from large text files.

**Scenario**: Extract all email addresses from log files.

**Solution**:
```regex
Pattern: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
Flags: g (global)
Text: "Contact support@example.com or sales@test.org for help"
Matches: ["support@example.com", "sales@test.org"]
```

#### Use Case 3: URL Parsing
Parse and validate URLs from user input.

**Scenario**: Link checker for markdown documents.

**Solution**:
```regex
Pattern: https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)
Flags: gi (global, case-insensitive)
Text: "Visit HTTPS://Example.COM or http://test.org"
Matches: All valid URLs extracted
```

#### Use Case 4: Log File Analysis
Parse structured log entries.

**Scenario**: Extract timestamps and error codes from logs.

**Solution**:
```regex
Pattern: \[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] ERROR (\d{3}): (.+)
Test: "[2026-01-05 14:30:15] ERROR 500: Database connection failed"
Groups:
  1: "2026-01-05 14:30:15" (timestamp)
  2: "500" (error code)
  3: "Database connection failed" (message)
```

#### Use Case 5: Text Formatting
Clean and format text data.

**Scenario**: Normalize phone numbers to consistent format.

**Solution**:
```regex
Find: (\d{3})[\s.-]?(\d{3})[\s.-]?(\d{4})
Replace: ($1) $2-$3
Input: "5551234567" or "555-123-4567"
Output: "(555) 123-4567"
```

#### Use Case 6: Code Refactoring
Find and replace patterns in source code.

**Scenario**: Update old function calls to new API.

**Solution**:
```regex
Find: oldFunction\(([^)]+)\)
Replace: newFunction($1, options)
Input: oldFunction("test")
Output: newFunction("test", options)
```

### Tips & Tricks

#### Common Regex Patterns

**Digits:**
- `\d` = any digit (0-9)
- `\d+` = one or more digits
- `\d{3}` = exactly 3 digits
- `\d{3,5}` = 3 to 5 digits

**Letters:**
- `\w` = word character (a-z, A-Z, 0-9, _)
- `[a-z]` = lowercase letter
- `[A-Z]` = uppercase letter
- `[a-zA-Z]` = any letter

**Whitespace:**
- `\s` = any whitespace (space, tab, newline)
- `\s+` = one or more whitespace
- `\S` = non-whitespace

**Boundaries:**
- `^` = start of string/line
- `$` = end of string/line
- `\b` = word boundary
- `\B` = non-word boundary

**Quantifiers:**
- `*` = 0 or more
- `+` = 1 or more
- `?` = 0 or 1 (optional)
- `{n}` = exactly n times
- `{n,}` = n or more times
- `{n,m}` = n to m times

**Character Classes:**
- `.` = any character (except newline)
- `[abc]` = a, b, or c
- `[^abc]` = not a, b, or c
- `[a-z]` = range a to z

**Groups:**
- `(abc)` = capture group
- `(?:abc)` = non-capturing group
- `(?<name>abc)` = named capture group

**Lookahead/Lookbehind:**
- `(?=abc)` = positive lookahead
- `(?!abc)` = negative lookahead
- `(?<=abc)` = positive lookbehind
- `(?<!abc)` = negative lookbehind

#### Performance Tips

**Avoid Catastrophic Backtracking:**
```regex
❌ Bad: (a+)+b
✅ Good: a+b
```

**Be Specific:**
```regex
❌ Slow: .*@.*\..*
✅ Fast: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
```

**Use Non-Capturing Groups:**
```regex
❌ Slower: (https?://)
✅ Faster: (?:https?://)  (when you don't need the capture)
```

**Anchor Patterns:**
```regex
❌ Unanchored: \d{3}-\d{3}-\d{4}
✅ Anchored: ^\d{3}-\d{3}-\d{4}$  (if you want exact match)
```

#### Debugging Regex

1. **Start Simple**: Build pattern incrementally
2. **Test Each Part**: Verify components work individually
3. **Use Capture Groups**: See what each group matches
4. **Check Flags**: Wrong flags cause unexpected results
5. **Test Edge Cases**: Empty strings, special characters, etc.
6. **Use Online Tools**: Multiple perspectives help

#### Common Mistakes

**Forgetting to Escape:**
```regex
❌ Wrong: .+  (matches ANY character)
✅ Right: \.+ (matches literal dots)

Special characters that need escaping: . * + ? ^ $ { } ( ) | [ ] \
```

**Greedy vs Lazy:**
```regex
Text: <div>content</div><div>more</div>
❌ Greedy: <div>.*</div>  → matches entire string
✅ Lazy: <div>.*?</div>   → matches each div separately
```

**Not Using Word Boundaries:**
```regex
Text: "cat catastrophe"
❌ Without: cat  → matches both "cat" in cat AND catastrophe
✅ With: \bcat\b → matches only standalone "cat"
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + Enter | Test pattern |
| Ctrl/Cmd + C | Copy pattern |
| Ctrl/Cmd + K | Copy code |
| Ctrl/Cmd + L | Load pattern library |
| Ctrl/Cmd + / | Toggle help |
| Tab | Navigate fields |
| Escape | Close dialogs |

### Troubleshooting

#### Issue: "Invalid Regular Expression" Error
**Cause**: Syntax error in pattern

**Solutions**:
- Check for unescaped special characters: `. * + ? ^ $ { } ( ) | [ ] \`
- Ensure brackets are balanced: `()`, `[]`, `{}`
- Escape backslashes: Use `\\` instead of `\` in patterns
- Check quantifiers: `{3,2}` is invalid (min > max)

**Example Fixes:**
```regex
❌ (unclosed group
✅ (closed group)

❌ [unclosed class
✅ [closed class]

❌ {3,2}  (min > max)
✅ {2,3}
```

#### Issue: Pattern Not Matching Expected Text
**Causes**: Wrong flags, incorrect pattern, or edge case

**Solutions**:
- **Add `i` flag** for case-insensitive matching
- **Add `g` flag** to find all matches, not just first
- **Add `m` flag** if testing multiline text with `^` or `$`
- Test with simpler pattern to isolate issue
- Check for invisible characters (tabs, newlines)

#### Issue: Too Many or Too Few Matches
**Cause**: Greedy vs lazy quantifiers

**Solutions**:
```regex
❌ Too greedy: <.+>  → matches <tag>content</tag> as one match
✅ Lazy: <.+?>       → matches <tag> and </tag> separately

❌ Too greedy: ".+"  → matches entire quoted string
✅ Lazy: ".+?"       → matches each quoted string separately
```

#### Issue: Catastrophic Backtracking (Hanging)
**Cause**: Complex pattern with nested quantifiers

**Solutions**:
```regex
❌ Dangerous: (a+)+b
❌ Dangerous: (.*)*
❌ Dangerous: (a*)*

✅ Safe: a+b
✅ Safe: .*
✅ Safe: a*
```

Use atomic groups or possessive quantifiers for complex patterns.

#### Issue: Capture Groups Not Working
**Cause**: Using non-capturing groups or no matches

**Solutions**:
```regex
❌ Non-capturing: (?:\d{3})  → no group captured
✅ Capturing: (\d{3})        → group available

Check:
- Pattern has parentheses: ()
- Pattern matches text
- Not using (?:...) non-capturing syntax
```

#### Issue: Unicode Characters Not Matching
**Cause**: Missing `u` flag

**Solution**:
```regex
❌ Without u flag: /\u{1F600}/  → fails
✅ With u flag: /\u{1F600}/u    → matches 😀

Enable "Unicode (u)" flag for emoji and Unicode support
```

### Technical Details

#### For Developers

**Regex Engine**: JavaScript RegExp (ECMAScript 2022)

**Flag Support:**
- `g` (global): Find all matches
- `i` (case insensitive): Ignore case
- `m` (multiline): `^` and `$` match line boundaries
- `s` (dotall): `.` matches newline
- `u` (unicode): Full Unicode support
- `y` (sticky): Match at exact index

**Browser Compatibility:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers with ES2022 support

**Performance:**
- Real-time matching: < 10ms for typical patterns
- Complex patterns: May take longer on large text
- Recommended: Test with actual data size

**Pattern Limits:**
- Max pattern length: No hard limit (browser dependent)
- Max test string: ~1MB recommended
- Capture groups: Up to 99 groups supported

**Code Generation Languages:**
1. JavaScript/TypeScript
2. Python (re module)
3. Java (Pattern/Matcher)
4. C# (Regex class)
5. PHP (preg functions)
6. Ruby (Regexp)
7. Go (regexp package)
8. Perl (native regex)

### Related Tools

- **[Diff Checker](/tools/development/diff)** - Compare text differences
- **[SQL Formatter](/tools/development/sql-formatter)** - Format SQL with regex patterns
- **[Text Transformer](/tools/productivity/text-transformer)** - Transform text using patterns
- **[Code Beautifier](/tools/data/json-beautify)** - Format code (uses regex internally)

### Frequently Asked Questions

**Q: What's the difference between `.*` and `.+`?**  
A: `.*` matches 0 or more characters (including empty string), `.+` requires at least 1 character.

**Q: How do I match a literal dot?**  
A: Escape it: `\.` (backslash-dot). Without escape, `.` matches any character.

**Q: Why does my pattern match too much?**  
A: Quantifiers are greedy by default. Use lazy quantifiers: `*?`, `+?`, `??`, `{n,m}?`

**Q: How do I test for NOT containing something?**  
A: Use negative lookahead: `^(?!.*forbidden).*` (doesn't contain "forbidden")

**Q: Can I use regex for HTML/XML parsing?**  
A: Not recommended for complex HTML. Use proper parsers. Regex works for simple extraction.

**Q: What's the performance impact of regex?**  
A: Simple patterns are fast. Complex patterns with backtracking can be slow. Test with real data.

**Q: How do I match across multiple lines?**  
A: Use `m` flag for multiline mode, or `s` flag to make `.` match newlines.

**Q: Can I use variables in regex patterns?**  
A: Yes! In JavaScript: `new RegExp(variable, 'flags')`

**Q: What's a word boundary `\b`?**  
A: Position between word character (\w) and non-word character. Useful for whole-word matching.

**Q: How do I make regex case-insensitive?**  
A: Enable the `i` flag (case insensitive).

### Best Practices

1. **Start simple, build complexity** - Test each component
2. **Use raw strings** - In Python: `r'\d+'`, in other languages: proper escaping
3. **Anchor patterns** - Use `^` and `$` for exact matches
4. **Be specific** - `[a-z]+` is better than `.+` for letters
5. **Use character classes** - `\d` instead of `[0-9]`
6. **Name capture groups** - `(?<name>...)` for clarity
7. **Comment complex patterns** - Use `(?#comment)` or external docs
8. **Test edge cases** - Empty strings, special characters, long text
9. **Consider alternatives** - Sometimes string methods are simpler
10. **Document your regex** - Explain what it does for future you

### Regex Cheat Sheet

#### Basic Syntax
```
.       Any character except newline
\d      Digit (0-9)
\w      Word character (a-z, A-Z, 0-9, _)
\s      Whitespace (space, tab, newline)
\D      Not a digit
\W      Not a word character
\S      Not whitespace

^       Start of string/line
$       End of string/line
\b      Word boundary
\B      Not word boundary

*       0 or more (greedy)
+       1 or more (greedy)
?       0 or 1 (optional)
*?      0 or more (lazy)
+?      1 or more (lazy)
??      0 or 1 (lazy)

{n}     Exactly n times
{n,}    n or more times
{n,m}   n to m times

[abc]   Character class (a, b, or c)
[^abc]  Negated class (not a, b, or c)
[a-z]   Range (a through z)
(...)   Capture group
(?:...) Non-capturing group
|       Alternation (OR)
```

### Changelog

**v1.0** (Current)
- 50+ pre-built regex patterns
- Real-time pattern testing
- Syntax validation and error detection
- Match highlighting
- Code generation (8 languages)
- All regex flags supported (g, i, m, s, u, y)
- Capture group visualization
- Pattern library with categories
- Copy pattern/code to clipboard
- Responsive mobile design
