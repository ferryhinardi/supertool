// Language definitions for AI Code Converter
export interface Language {
  id: string
  name: string
  extension: string
  highlightLanguage: string
  icon: string
}

export interface ConversionOptions {
  addComments: boolean
  preserveStructure: boolean
  optimizeCode: boolean
}

export interface ConversionRequest {
  sourceCode: string
  sourceLanguage: string
  targetLanguage: string
  options: ConversionOptions
}

export interface ConversionResponse {
  convertedCode: string
  explanation?: string
  warnings?: string[]
  remaining?: number
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Supported programming languages
export const LANGUAGES: Language[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    highlightLanguage: 'javascript',
    icon: '🟨',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    highlightLanguage: 'typescript',
    icon: '🔷',
  },
  {
    id: 'python',
    name: 'Python',
    extension: '.py',
    highlightLanguage: 'python',
    icon: '🐍',
  },
  {
    id: 'java',
    name: 'Java',
    extension: '.java',
    highlightLanguage: 'java',
    icon: '☕',
  },
  {
    id: 'csharp',
    name: 'C#',
    extension: '.cs',
    highlightLanguage: 'csharp',
    icon: '🔷',
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    highlightLanguage: 'cpp',
    icon: '⚙️',
  },
  {
    id: 'go',
    name: 'Go',
    extension: '.go',
    highlightLanguage: 'go',
    icon: '🐹',
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    highlightLanguage: 'rust',
    icon: '🦀',
  },
  {
    id: 'php',
    name: 'PHP',
    extension: '.php',
    highlightLanguage: 'php',
    icon: '🐘',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: '.rb',
    highlightLanguage: 'ruby',
    icon: '💎',
  },
  {
    id: 'swift',
    name: 'Swift',
    extension: '.swift',
    highlightLanguage: 'swift',
    icon: '🦅',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    extension: '.kt',
    highlightLanguage: 'kotlin',
    icon: '🟣',
  },
]

// Get language by ID
export function getLanguageById(id: string): Language | undefined {
  return LANGUAGES.find((lang) => lang.id === id)
}

// Get language extension
export function getLanguageExtension(id: string): string {
  return getLanguageById(id)?.extension || '.txt'
}

// Generate system prompt for AI conversion
export function generateSystemPrompt(
  sourceLanguage: string,
  targetLanguage: string,
  options: ConversionOptions
): string {
  const sourceLang = getLanguageById(sourceLanguage)?.name || sourceLanguage
  const targetLang = getLanguageById(targetLanguage)?.name || targetLanguage

  return `You are an expert software engineer proficient in multiple programming languages. Your task is to convert code from ${sourceLang} to ${targetLang}.

**Conversion Requirements:**
1. **Accuracy**: Preserve the exact logic and functionality of the original code
2. **Idiomatic Code**: Write ${targetLang} code following best practices and language conventions
3. **Structure**: ${options.preserveStructure ? 'Maintain the original code structure as closely as possible' : 'Refactor to use idiomatic patterns in the target language'}
4. **Comments**: ${options.addComments ? 'Add explanatory comments for complex conversions or language-specific idioms' : 'Minimize comments unless necessary for clarity'}
5. **Optimization**: ${options.optimizeCode ? 'Optimize the code for performance and readability in the target language' : 'Focus on direct translation without optimization'}

**Output Format:**
Return a JSON object with:
- "convertedCode": string (the converted code)
- "explanation": string (brief explanation of major changes or considerations, 2-3 sentences)
- "warnings": array of strings (potential issues, edge cases, or things to watch out for)

**Important:**
- Do not include markdown code blocks or language tags in the "convertedCode" field
- Ensure the converted code is syntactically correct and runnable
- Handle language-specific features appropriately (e.g., async/await, error handling, type systems)
- Preserve variable names and function names when possible
- Convert data types appropriately (e.g., list → array, dict → object)

Be thorough and accurate. The user expects production-ready code.`
}
