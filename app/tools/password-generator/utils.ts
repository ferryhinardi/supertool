// Password generation and strength calculation utilities

interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

interface StrengthResult {
  score: number
  label: string
  color: string
  feedback: string[]
}

// Character sets for password generation
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

// Cryptographically secure password generation
export function generatePassword(options: PasswordOptions): string {
  let charset = ''
  if (options.uppercase) charset += CHAR_SETS.uppercase
  if (options.lowercase) charset += CHAR_SETS.lowercase
  if (options.numbers) charset += CHAR_SETS.numbers
  if (options.symbols) charset += CHAR_SETS.symbols

  if (charset === '') {
    throw new Error('At least one character set must be selected')
  }

  const password: string[] = []
  const randomValues = new Uint32Array(options.length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < options.length; i++) {
    const randomIndex = randomValues[i] % charset.length
    password.push(charset[randomIndex])
  }

  return password.join('')
}

// Calculate password strength
export function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'No Password',
      color: 'gray.500',
      feedback: ['Enter a password to see strength analysis'],
    }
  }

  let score = 0
  const feedback: string[] = []

  // Length scoring
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (password.length < 8) feedback.push('Use at least 8 characters')
  if (password.length < 12) feedback.push('Longer passwords are more secure')

  // Character variety scoring
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length

  if (varietyCount >= 3) score += 1
  if (varietyCount === 4) score += 1

  if (!hasUppercase) feedback.push('Add uppercase letters')
  if (!hasLowercase) feedback.push('Add lowercase letters')
  if (!hasNumbers) feedback.push('Add numbers')
  if (!hasSymbols) feedback.push('Add special characters')

  // Pattern detection (penalize weak patterns)
  if (/(.)\1{2,}/.test(password)) {
    score -= 1
    feedback.push('Avoid repeating characters')
  }
  if (/^[a-zA-Z]+$/.test(password) && password.length < 12) {
    feedback.push('Mix letters with numbers and symbols')
  }

  // Scoring to label mapping
  if (score <= 1)
    return {
      score: 1,
      label: 'Weak',
      color: 'red.500',
      feedback: feedback.length ? feedback.slice(0, 3) : ['Very easy to crack'],
    }
  if (score === 2)
    return {
      score: 2,
      label: 'Fair',
      color: 'orange.500',
      feedback: feedback.length ? feedback.slice(0, 2) : ['Could be stronger'],
    }
  if (score === 3)
    return {
      score: 3,
      label: 'Good',
      color: 'yellow.500',
      feedback: feedback.length ? feedback.slice(0, 2) : ['Good password strength'],
    }
  if (score === 4)
    return {
      score: 4,
      label: 'Strong',
      color: 'green.500',
      feedback: ['Strong password!'],
    }

  return {
    score: 5,
    label: 'Very Strong',
    color: 'emerald.500',
    feedback: ['Excellent password security!'],
  }
}
