import { describe, expect, it } from 'vitest'
import {
  analyzePassword,
  calculateEntropy,
  estimateCrackTime,
  generatePasswordSuggestions,
  getPasswordStrengthPercentage,
  getStrengthColor,
  getStrengthLabel,
} from '../utils'

describe('Password Strength Analyzer Utilities', () => {
  describe('analyzePassword', () => {
    describe('empty password', () => {
      it('should return very-weak for empty password', () => {
        const analysis = analyzePassword('')
        expect(analysis.score).toBe(0)
        expect(analysis.strengthLevel).toBe('very-weak')
        expect(analysis.length).toBe(0)
        expect(analysis.entropy).toBe(0)
      })

      it('should provide feedback for empty password', () => {
        const analysis = analyzePassword('')
        expect(analysis.feedback.warning).toBe('Password is empty')
        expect(analysis.feedback.suggestions).toContain('Enter a password to analyze its strength')
      })
    })

    describe('weak passwords', () => {
      it('should detect very weak password "password"', () => {
        const analysis = analyzePassword('password')
        expect(analysis.score).toBe(0)
        expect(analysis.strengthLevel).toBe('very-weak')
        expect(analysis.length).toBe(8)
      })

      it('should detect weak password "password123"', () => {
        const analysis = analyzePassword('password123')
        expect(analysis.score).toBeLessThanOrEqual(1)
        expect(analysis.length).toBe(11)
      })

      it('should detect common patterns like "123456"', () => {
        const analysis = analyzePassword('123456')
        expect(analysis.score).toBe(0)
        expect(analysis.strengthLevel).toBe('very-weak')
      })

      it('should detect keyboard patterns like "qwerty"', () => {
        const analysis = analyzePassword('qwerty')
        expect(analysis.score).toBeLessThanOrEqual(1)
        expect(analysis.hasSequences).toBe(true)
      })
    })

    describe('strong passwords', () => {
      it('should rate complex password as strong', () => {
        const analysis = analyzePassword('MyP@ssw0rd!2024')
        expect(analysis.score).toBeGreaterThanOrEqual(3)
        expect(analysis.length).toBe(15)
        expect(analysis.hasLowercase).toBe(true)
        expect(analysis.hasUppercase).toBe(true)
        expect(analysis.hasNumbers).toBe(true)
        expect(analysis.hasSymbols).toBe(true)
      })

      it('should rate passphrase as very strong', () => {
        const analysis = analyzePassword('correct-horse-battery-staple-2024')
        expect(analysis.score).toBeGreaterThanOrEqual(3)
        expect(analysis.length).toBeGreaterThan(20)
      })

      it('should rate random string as very strong', () => {
        const analysis = analyzePassword('x9K#mQ2@pL5$wR8^tN3')
        expect(analysis.score).toBeGreaterThanOrEqual(3)
        expect(analysis.hasLowercase).toBe(true)
        expect(analysis.hasUppercase).toBe(true)
        expect(analysis.hasNumbers).toBe(true)
        expect(analysis.hasSymbols).toBe(true)
      })
    })

    describe('character type detection', () => {
      it('should detect lowercase letters', () => {
        const analysis = analyzePassword('abc')
        expect(analysis.hasLowercase).toBe(true)
        expect(analysis.hasUppercase).toBe(false)
        expect(analysis.hasNumbers).toBe(false)
        expect(analysis.hasSymbols).toBe(false)
      })

      it('should detect uppercase letters', () => {
        const analysis = analyzePassword('ABC')
        expect(analysis.hasLowercase).toBe(false)
        expect(analysis.hasUppercase).toBe(true)
        expect(analysis.hasNumbers).toBe(false)
        expect(analysis.hasSymbols).toBe(false)
      })

      it('should detect numbers', () => {
        const analysis = analyzePassword('123')
        expect(analysis.hasLowercase).toBe(false)
        expect(analysis.hasUppercase).toBe(false)
        expect(analysis.hasNumbers).toBe(true)
        expect(analysis.hasSymbols).toBe(false)
      })

      it('should detect symbols', () => {
        const analysis = analyzePassword('!@#$%')
        expect(analysis.hasLowercase).toBe(false)
        expect(analysis.hasUppercase).toBe(false)
        expect(analysis.hasNumbers).toBe(false)
        expect(analysis.hasSymbols).toBe(true)
      })

      it('should detect mixed character types', () => {
        const analysis = analyzePassword('Abc123!@#')
        expect(analysis.hasLowercase).toBe(true)
        expect(analysis.hasUppercase).toBe(true)
        expect(analysis.hasNumbers).toBe(true)
        expect(analysis.hasSymbols).toBe(true)
      })
    })

    describe('pattern detection', () => {
      it('should detect sequences in "abc123"', () => {
        const analysis = analyzePassword('abc123')
        expect(analysis.hasSequences).toBe(true)
      })

      it('should detect sequences in "qwerty"', () => {
        const analysis = analyzePassword('qwerty')
        expect(analysis.hasSequences).toBe(true)
      })

      it('should detect reverse sequences', () => {
        const analysis = analyzePassword('cba321')
        expect(analysis.hasSequences).toBe(true)
      })

      it('should detect repeated characters "aaa"', () => {
        const analysis = analyzePassword('aaa')
        expect(analysis.hasRepeats).toBe(true)
      })

      it('should detect repeated characters "111"', () => {
        const analysis = analyzePassword('password111')
        expect(analysis.hasRepeats).toBe(true)
      })

      it('should not detect repeats for non-repeated patterns', () => {
        const analysis = analyzePassword('abcdefgh')
        expect(analysis.hasRepeats).toBe(false)
      })
    })

    describe('entropy calculation', () => {
      it('should calculate entropy for simple password', () => {
        const analysis = analyzePassword('abc')
        expect(analysis.entropy).toBeGreaterThan(0)
      })

      it('should have higher entropy for longer passwords', () => {
        const short = analyzePassword('abc')
        const long = analyzePassword('abcdefghijklmnop')
        expect(long.entropy).toBeGreaterThan(short.entropy)
      })

      it('should have higher entropy for diverse character sets', () => {
        const simple = analyzePassword('aaaaaaaa')
        const complex = analyzePassword('Abc123!@')
        expect(complex.entropy).toBeGreaterThan(simple.entropy)
      })
    })
  })

  describe('getStrengthLevel', () => {
    it('should return correct strength labels', () => {
      expect(getStrengthLabel('very-weak')).toBe('Very Weak')
      expect(getStrengthLabel('weak')).toBe('Weak')
      expect(getStrengthLabel('fair')).toBe('Fair')
      expect(getStrengthLabel('strong')).toBe('Strong')
      expect(getStrengthLabel('very-strong')).toBe('Very Strong')
    })
  })

  describe('getStrengthColor', () => {
    it('should return correct colors for strength levels', () => {
      expect(getStrengthColor('very-weak')).toBe('red')
      expect(getStrengthColor('weak')).toBe('orange')
      expect(getStrengthColor('fair')).toBe('yellow')
      expect(getStrengthColor('strong')).toBe('green')
      expect(getStrengthColor('very-strong')).toBe('emerald')
    })
  })

  describe('calculateEntropy', () => {
    it('should return 0 for empty string', () => {
      expect(calculateEntropy('')).toBe(0)
    })

    it('should calculate entropy for lowercase only', () => {
      const entropy = calculateEntropy('abcdefgh')
      expect(entropy).toBeGreaterThan(0)
    })

    it('should calculate higher entropy for mixed case', () => {
      const lower = calculateEntropy('abcdefgh')
      const mixed = calculateEntropy('AbCdEfGh')
      expect(mixed).toBeGreaterThan(lower)
    })

    it('should calculate highest entropy for all character types', () => {
      const lower = calculateEntropy('abcdefgh')
      const withAll = calculateEntropy('Abc123!@')
      expect(withAll).toBeGreaterThan(lower)
    })
  })

  describe('generatePasswordSuggestions', () => {
    it('should suggest adding length for short passwords', () => {
      const analysis = analyzePassword('abc')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('at least 8 characters'))).toBe(true)
    })

    it('should suggest adding lowercase if missing', () => {
      const analysis = analyzePassword('ABC123')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('lowercase'))).toBe(true)
    })

    it('should suggest adding uppercase if missing', () => {
      const analysis = analyzePassword('abc123')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('uppercase'))).toBe(true)
    })

    it('should suggest adding numbers if missing', () => {
      const analysis = analyzePassword('abcdef')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('numbers'))).toBe(true)
    })

    it('should suggest adding symbols if missing', () => {
      const analysis = analyzePassword('Abc123')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('special characters'))).toBe(true)
    })

    it('should suggest avoiding sequences if detected', () => {
      const analysis = analyzePassword('abc123')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('sequences'))).toBe(true)
    })

    it('should suggest avoiding repeats if detected', () => {
      const analysis = analyzePassword('aaa111')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.some((s) => s.includes('repeated'))).toBe(true)
    })

    it('should have minimal suggestions for strong password', () => {
      const analysis = analyzePassword('MyStr0ng!P@ssw0rd2024')
      const suggestions = generatePasswordSuggestions(analysis)
      expect(suggestions.length).toBeLessThan(3)
    })
  })

  describe('getPasswordStrengthPercentage', () => {
    it('should return 0% for score 0', () => {
      expect(getPasswordStrengthPercentage(0)).toBe(0)
    })

    it('should return 25% for score 1', () => {
      expect(getPasswordStrengthPercentage(1)).toBe(25)
    })

    it('should return 50% for score 2', () => {
      expect(getPasswordStrengthPercentage(2)).toBe(50)
    })

    it('should return 75% for score 3', () => {
      expect(getPasswordStrengthPercentage(3)).toBe(75)
    })

    it('should return 100% for score 4', () => {
      expect(getPasswordStrengthPercentage(4)).toBe(100)
    })
  })

  describe('estimateCrackTime', () => {
    it('should estimate crack time for weak password', () => {
      const result = estimateCrackTime(1000)
      expect(result.online).toBeTruthy()
      expect(result.offline).toBeTruthy()
      expect(result.description).toBeTruthy()
    })

    it('should estimate crack time for strong password', () => {
      const result = estimateCrackTime(1e12)
      expect(result.online).toBeTruthy()
      expect(result.offline).toBeTruthy()
    })

    it('should show "instantly" for very low guesses', () => {
      const result = estimateCrackTime(1)
      expect(result.offline).toContain('instantly')
    })

    it('should format time units correctly', () => {
      const seconds = estimateCrackTime(100)
      const minutes = estimateCrackTime(10000)
      const hours = estimateCrackTime(100000)

      expect(seconds.online).toBeTruthy()
      expect(minutes.online).toBeTruthy()
      expect(hours.online).toBeTruthy()
    })
  })
})
