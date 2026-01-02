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
