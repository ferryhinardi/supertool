import zxcvbn, { type ZXCVBNResult } from 'zxcvbn'

export type StrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong'

export interface PasswordAnalysis {
  score: number // 0-4 from zxcvbn
  strengthLevel: StrengthLevel
  crackTime: string
  crackTimeDisplay: string
  feedback: {
    warning: string
    suggestions: string[]
  }
  entropy: number
  length: number
  hasLowercase: boolean
  hasUppercase: boolean
  hasNumbers: boolean
  hasSymbols: boolean
  hasSequences: boolean
  hasRepeats: boolean
  guesses: number
  guessesLog10: number
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      strengthLevel: 'very-weak',
      crackTime: '0 seconds',
      crackTimeDisplay: 'instantly',
      feedback: {
        warning: 'Password is empty',
        suggestions: ['Enter a password to analyze its strength'],
      },
      entropy: 0,
      length: 0,
      hasLowercase: false,
      hasUppercase: false,
      hasNumbers: false,
      hasSymbols: false,
      hasSequences: false,
      hasRepeats: false,
      guesses: 0,
      guessesLog10: 0,
    }
  }

  const result: ZXCVBNResult = zxcvbn(password)

  return {
    score: result.score,
    strengthLevel: getStrengthLevel(result.score),
    crackTime: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
    crackTimeDisplay: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
    feedback: {
      warning: result.feedback.warning || '',
      suggestions: result.feedback.suggestions || [],
    },
    entropy: calculateEntropy(password),
    length: password.length,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSymbols: /[^a-zA-Z0-9]/.test(password),
    hasSequences: detectSequences(password),
    hasRepeats: detectRepeats(password),
    guesses: result.guesses,
    guessesLog10: result.guesses_log10,
  }
}

function getStrengthLevel(score: number): StrengthLevel {
  switch (score) {
    case 0:
      return 'very-weak'
    case 1:
      return 'weak'
    case 2:
      return 'fair'
    case 3:
      return 'strong'
    case 4:
      return 'very-strong'
    default:
      return 'very-weak'
  }
}

export function getStrengthColor(level: StrengthLevel): string {
  switch (level) {
    case 'very-weak':
      return 'red'
    case 'weak':
      return 'orange'
    case 'fair':
      return 'yellow'
    case 'strong':
      return 'green'
    case 'very-strong':
      return 'emerald'
    default:
      return 'gray'
  }
}

export function getStrengthLabel(level: StrengthLevel): string {
  switch (level) {
    case 'very-weak':
      return 'Very Weak'
    case 'weak':
      return 'Weak'
    case 'fair':
      return 'Fair'
    case 'strong':
      return 'Strong'
    case 'very-strong':
      return 'Very Strong'
    default:
      return 'Unknown'
  }
}

export function calculateEntropy(password: string): number {
  if (!password) return 0

  let charsetSize = 0

  if (/[a-z]/.test(password)) charsetSize += 26 // lowercase
  if (/[A-Z]/.test(password)) charsetSize += 26 // uppercase
  if (/[0-9]/.test(password)) charsetSize += 10 // numbers
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32 // symbols (approximate)

  // Entropy = log2(charset^length)
  const entropy = Math.log2(charsetSize ** password.length)
  return Math.round(entropy * 100) / 100
}

function detectSequences(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '01234567890',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ]

  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const pattern = seq.substring(i, i + 3)
      if (password.toLowerCase().includes(pattern)) {
        return true
      }
      // Check reverse
      if (password.toLowerCase().includes(pattern.split('').reverse().join(''))) {
        return true
      }
    }
  }

  return false
}

function detectRepeats(password: string): boolean {
  // Check for 3 or more repeated characters
  const repeatPattern = /(.)\1{2,}/
  return repeatPattern.test(password)
}

export function generatePasswordSuggestions(analysis: PasswordAnalysis): string[] {
  const suggestions: string[] = []

  if (analysis.length < 8) {
    suggestions.push('Use at least 8 characters (12+ recommended)')
  }

  if (!analysis.hasLowercase) {
    suggestions.push('Add lowercase letters (a-z)')
  }

  if (!analysis.hasUppercase) {
    suggestions.push('Add uppercase letters (A-Z)')
  }

  if (!analysis.hasNumbers) {
    suggestions.push('Add numbers (0-9)')
  }

  if (!analysis.hasSymbols) {
    suggestions.push('Add special characters (!@#$%^&*)')
  }

  if (analysis.hasSequences) {
    suggestions.push('Avoid common sequences (abc, 123, qwerty)')
  }

  if (analysis.hasRepeats) {
    suggestions.push('Avoid repeated characters (aaa, 111)')
  }

  if (analysis.length < 12 && analysis.score < 4) {
    suggestions.push('Consider using a passphrase with 4+ random words')
  }

  // Add zxcvbn suggestions
  if (analysis.feedback.suggestions.length > 0) {
    suggestions.push(...analysis.feedback.suggestions)
  }

  // Remove duplicates
  return Array.from(new Set(suggestions))
}

export function getPasswordStrengthPercentage(score: number): number {
  return (score / 4) * 100
}

export function estimateCrackTime(guesses: number): {
  online: string
  offline: string
  description: string
} {
  // Online attack: 10 attempts per second (with rate limiting)
  const onlineSeconds = guesses / 10
  // Offline attack: 10,000 attempts per second (with bcrypt/scrypt)
  const offlineSeconds = guesses / 10000

  return {
    online: formatTime(onlineSeconds),
    offline: formatTime(offlineSeconds),
    description: 'Estimated time to crack this password',
  }
}

function formatTime(seconds: number): string {
  if (seconds < 1) return 'instantly'
  if (seconds < 60) return `${Math.ceil(seconds)} seconds`
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)} hours`
  if (seconds < 2592000) return `${Math.ceil(seconds / 86400)} days`
  if (seconds < 31536000) return `${Math.ceil(seconds / 2592000)} months`
  if (seconds < 3153600000) return `${Math.ceil(seconds / 31536000)} years`
  return 'centuries'
}
