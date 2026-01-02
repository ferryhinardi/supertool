export type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y'

export interface RegexMatch {
  match: string
  index: number
  groups?: Record<string, string>
}

export interface RegexPattern {
  id: string
  name: string
  description: string
  pattern: string
  flags: RegexFlag[]
  category: 'validation' | 'extraction' | 'formatting' | 'advanced'
  examples: string[]
}

export const REGEX_PATTERNS: RegexPattern[] = [
  // Validation patterns
  {
    id: 'email',
    name: 'Email Address',
    description: 'Validates email addresses',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: [],
    category: 'validation',
    examples: ['user@example.com', 'test.email+tag@domain.co.uk'],
  },
  {
    id: 'url',
    name: 'URL',
    description: 'Validates HTTP/HTTPS URLs',
    pattern:
      '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    flags: ['i'],
    category: 'validation',
    examples: ['https://example.com', 'http://www.test.org/path?query=1'],
  },
  {
    id: 'phone-us',
    name: 'US Phone Number',
    description: 'Validates US phone numbers',
    pattern: '^(\\+1\\s?)?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$',
    flags: [],
    category: 'validation',
    examples: ['(555) 123-4567', '+1 555-123-4567', '5551234567'],
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    description: 'Validates IPv4 addresses',
    pattern:
      '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: [],
    category: 'validation',
    examples: ['192.168.1.1', '10.0.0.255', '172.16.254.1'],
  },
  {
    id: 'date-iso',
    name: 'ISO Date',
    description: 'Validates ISO 8601 date format',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    flags: [],
    category: 'validation',
    examples: ['2024-01-15', '2023-12-31'],
  },
  {
    id: 'hex-color',
    name: 'Hex Color Code',
    description: 'Validates hex color codes',
    pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$',
    flags: [],
    category: 'validation',
    examples: ['#FF5733', '#f00', 'aabbcc'],
  },
  {
    id: 'credit-card',
    name: 'Credit Card Number',
    description: 'Validates credit card numbers (basic format)',
    pattern:
      '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})$',
    flags: [],
    category: 'validation',
    examples: ['4532015112830366', '5425233430109903'],
  },

  // Extraction patterns
  {
    id: 'extract-emails',
    name: 'Extract Emails',
    description: 'Extracts all email addresses from text',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: ['g'],
    category: 'extraction',
    examples: ['Contact us at support@example.com or sales@test.org'],
  },
  {
    id: 'extract-urls',
    name: 'Extract URLs',
    description: 'Extracts all URLs from text',
    pattern: 'https?:\\/\\/[^\\s]+',
    flags: ['g', 'i'],
    category: 'extraction',
    examples: ['Visit https://example.com or http://test.org for more info'],
  },
  {
    id: 'extract-hashtags',
    name: 'Extract Hashtags',
    description: 'Extracts hashtags from social media text',
    pattern: '#[a-zA-Z0-9_]+',
    flags: ['g'],
    category: 'extraction',
    examples: ['Check out #javascript #webdev #coding'],
  },
  {
    id: 'extract-numbers',
    name: 'Extract Numbers',
    description: 'Extracts all numbers (integers and decimals)',
    pattern: '-?\\d+\\.?\\d*',
    flags: ['g'],
    category: 'extraction',
    examples: ['Prices: $19.99, $5.50, and $100'],
  },
  {
    id: 'extract-html-tags',
    name: 'Extract HTML Tags',
    description: 'Extracts HTML tags from markup',
    pattern: '<\\/?[a-z][^>]*>',
    flags: ['g', 'i'],
    category: 'extraction',
    examples: ['<div class="test">Hello <span>World</span></div>'],
  },

  // Formatting patterns
  {
    id: 'camelcase',
    name: 'camelCase',
    description: 'Matches camelCase identifiers',
    pattern: '^[a-z]+(?:[A-Z][a-z]*)*$',
    flags: [],
    category: 'formatting',
    examples: ['myVariable', 'getUserData', 'apiEndpoint'],
  },
  {
    id: 'pascalcase',
    name: 'PascalCase',
    description: 'Matches PascalCase identifiers',
    pattern: '^[A-Z][a-z]*(?:[A-Z][a-z]*)*$',
    flags: [],
    category: 'formatting',
    examples: ['MyComponent', 'UserProfile', 'ApiService'],
  },
  {
    id: 'snake-case',
    name: 'snake_case',
    description: 'Matches snake_case identifiers',
    pattern: '^[a-z]+(?:_[a-z]+)*$',
    flags: [],
    category: 'formatting',
    examples: ['my_variable', 'user_data', 'api_endpoint'],
  },
  {
    id: 'kebab-case',
    name: 'kebab-case',
    description: 'Matches kebab-case identifiers',
    pattern: '^[a-z]+(?:-[a-z]+)*$',
    flags: [],
    category: 'formatting',
    examples: ['my-component', 'user-profile', 'api-service'],
  },

  // Advanced patterns
  {
    id: 'password-strong',
    name: 'Strong Password',
    description: 'Requires 8+ chars, uppercase, lowercase, number, special char',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: [],
    category: 'advanced',
    examples: ['MyP@ssw0rd', 'Secure123!', 'Test$123ABC'],
  },
  {
    id: 'uuid',
    name: 'UUID',
    description: 'Validates UUID v4 format',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    flags: ['i'],
    category: 'advanced',
    examples: ['550e8400-e29b-41d4-a716-446655440000'],
  },
  {
    id: 'jwt',
    name: 'JWT Token',
    description: 'Validates JWT token format',
    pattern: '^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]*$',
    flags: [],
    category: 'advanced',
    examples: [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    ],
  },
  {
    id: 'semver',
    name: 'Semantic Version',
    description: 'Validates semantic versioning (semver)',
    pattern:
      '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    flags: [],
    category: 'advanced',
    examples: ['1.0.0', '2.3.4-beta.1', '3.0.0-rc.1+build.123'],
  },
]

export const FLAG_DESCRIPTIONS: Record<RegexFlag, string> = {
  g: 'Global - Find all matches (not just first)',
  i: 'Case Insensitive - Ignore case when matching',
  m: 'Multiline - ^ and $ match line breaks',
  s: 'Dotall - . matches newlines',
  u: 'Unicode - Treat pattern as Unicode',
  y: 'Sticky - Match from lastIndex position',
}

export const CODE_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: 'js' },
  { id: 'typescript', name: 'TypeScript', ext: 'ts' },
  { id: 'python', name: 'Python', ext: 'py' },
  { id: 'java', name: 'Java', ext: 'java' },
  { id: 'csharp', name: 'C#', ext: 'cs' },
  { id: 'php', name: 'PHP', ext: 'php' },
  { id: 'ruby', name: 'Ruby', ext: 'rb' },
  { id: 'go', name: 'Go', ext: 'go' },
]

export function generateCode(pattern: string, flags: RegexFlag[], language: string): string {
  const flagsStr = flags.join('')

  switch (language) {
    case 'javascript':
    case 'typescript':
      return `const regex = /${pattern}/${flagsStr};\nconst text = "your text here";\nconst matches = text.match(regex);`

    case 'python':
      return `import re\n\npattern = r"${pattern}"\nflags = ${getPythonFlags(flags)}\ntext = "your text here"\nmatches = re.findall(pattern, text, flags)`

    case 'java':
      return `import java.util.regex.*;\n\nString pattern = "${pattern.replace(/\\/g, '\\\\')}";\nint flags = ${getJavaFlags(flags)};\nPattern p = Pattern.compile(pattern, flags);\nMatcher m = p.matcher("your text here");\nwhile (m.find()) {\n    System.out.println(m.group());\n}`

    case 'csharp':
      return `using System.Text.RegularExpressions;\n\nstring pattern = @"${pattern}";\nRegexOptions options = ${getCSharpFlags(flags)};\nMatchCollection matches = Regex.Matches("your text here", pattern, options);`

    case 'php':
      return `$pattern = '/${pattern}/${flagsStr}';\n$text = 'your text here';\npreg_match_all($pattern, $text, $matches);`

    case 'ruby':
      return `pattern = /${pattern}/${flagsStr}\ntext = "your text here"\nmatches = text.scan(pattern)`

    case 'go':
      return `import "regexp"\n\npattern := \`${pattern}\`\nregex := regexp.MustCompile(pattern)\ntext := "your text here"\nmatches := regex.FindAllString(text, -1)`

    default:
      return `/${pattern}/${flagsStr}`
  }
}

function getPythonFlags(flags: RegexFlag[]): string {
  const pythonFlags: string[] = []
  if (flags.includes('i')) pythonFlags.push('re.IGNORECASE')
  if (flags.includes('m')) pythonFlags.push('re.MULTILINE')
  if (flags.includes('s')) pythonFlags.push('re.DOTALL')
  return pythonFlags.length > 0 ? pythonFlags.join(' | ') : '0'
}

function getJavaFlags(flags: RegexFlag[]): string {
  const javaFlags: string[] = []
  if (flags.includes('i')) javaFlags.push('Pattern.CASE_INSENSITIVE')
  if (flags.includes('m')) javaFlags.push('Pattern.MULTILINE')
  if (flags.includes('s')) javaFlags.push('Pattern.DOTALL')
  return javaFlags.length > 0 ? javaFlags.join(' | ') : '0'
}

function getCSharpFlags(flags: RegexFlag[]): string {
  const csharpFlags: string[] = []
  if (flags.includes('i')) csharpFlags.push('RegexOptions.IgnoreCase')
  if (flags.includes('m')) csharpFlags.push('RegexOptions.Multiline')
  if (flags.includes('s')) csharpFlags.push('RegexOptions.Singleline')
  return csharpFlags.length > 0 ? csharpFlags.join(' | ') : 'RegexOptions.None'
}

export function testRegex(
  pattern: string,
  flags: RegexFlag[],
  testString: string
): {
  isValid: boolean
  error?: string
  matches: RegexMatch[]
  hasMatch: boolean
} {
  try {
    const flagsStr = flags.join('')
    const regex = new RegExp(pattern, flagsStr)
    const matches: RegexMatch[] = []

    if (flags.includes('g')) {
      // Global flag - find all matches
      let match: RegExpExecArray | null = regex.exec(testString)
      while (match !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.groups,
        })
        // Prevent infinite loop on zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
        match = regex.exec(testString)
      }
    } else {
      // Single match
      const match = regex.exec(testString)
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.groups,
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
      error: error instanceof Error ? error.message : 'Invalid regex pattern',
      matches: [],
      hasMatch: false,
    }
  }
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightMatches(
  text: string,
  matches: RegexMatch[]
): Array<{
  text: string
  isMatch: boolean
  index?: number
}> {
  if (matches.length === 0) {
    return [{ text, isMatch: false }]
  }

  const result: Array<{ text: string; isMatch: boolean; index?: number }> = []
  let lastIndex = 0

  // Sort matches by index
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index)

  for (const match of sortedMatches) {
    // Add non-matching text before this match
    if (match.index > lastIndex) {
      result.push({
        text: text.slice(lastIndex, match.index),
        isMatch: false,
      })
    }

    // Add the match
    result.push({
      text: match.match,
      isMatch: true,
      index: match.index,
    })

    lastIndex = match.index + match.match.length
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    result.push({
      text: text.slice(lastIndex),
      isMatch: false,
    })
  }

  return result
}
