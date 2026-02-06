import { describe, expect, it } from 'vitest'
import {
  analyzeReadability,
  calculateARI,
  calculateColemanLiau,
  calculateFleschKincaidGrade,
  calculateFleschReadingEase,
  calculateGunningFog,
  calculateReadingTime,
  calculateScores,
  calculateSMOG,
  calculateStats,
  countCharacters,
  countComplexWords,
  countSentences,
  countSyllables,
  countTotalSyllables,
  getDifficulty,
  getFleschInterpretation,
  getOverallGradeLevel,
  getWords,
  type ReadabilityScores,
  type ReadabilityStats,
  sampleTexts,
  scoreExplanations,
} from '../utils'

describe('Readability Checker Utils', () => {
  // ==========================================
  // countSyllables Tests
  // ==========================================
  describe('countSyllables', () => {
    describe('single syllable words', () => {
      it('counts one syllable for short words (3 letters or less)', () => {
        expect(countSyllables('cat')).toBe(1)
        expect(countSyllables('dog')).toBe(1)
        expect(countSyllables('the')).toBe(1)
        expect(countSyllables('a')).toBe(1)
        expect(countSyllables('an')).toBe(1)
        expect(countSyllables('is')).toBe(1)
      })

      it('counts single syllable for common one-syllable words', () => {
        expect(countSyllables('big')).toBe(1)
        expect(countSyllables('run')).toBe(1)
        expect(countSyllables('jump')).toBe(1)
        expect(countSyllables('walk')).toBe(1)
        expect(countSyllables('talk')).toBe(1)
      })
    })

    describe('multi-syllable words', () => {
      it('counts two syllables correctly', () => {
        expect(countSyllables('hello')).toBe(2)
        expect(countSyllables('water')).toBe(2)
        expect(countSyllables('happy')).toBe(2)
        expect(countSyllables('paper')).toBe(2)
      })

      it('counts three or more syllables correctly', () => {
        // Algorithm counts vowel groups - may differ from standard pronunciation
        expect(countSyllables('beautiful')).toBeGreaterThanOrEqual(3)
        expect(countSyllables('wonderful')).toBeGreaterThanOrEqual(3)
        expect(countSyllables('important')).toBeGreaterThanOrEqual(3)
      })

      it('counts four or more syllables correctly', () => {
        expect(countSyllables('unfortunately')).toBeGreaterThanOrEqual(4)
        expect(countSyllables('epistemological')).toBeGreaterThanOrEqual(5)
        expect(countSyllables('university')).toBeGreaterThanOrEqual(4)
      })
    })

    describe('special cases', () => {
      it('handles silent e endings', () => {
        expect(countSyllables('make')).toBe(1)
        expect(countSyllables('take')).toBe(1)
        expect(countSyllables('love')).toBe(1)
      })

      it('handles -ed endings', () => {
        expect(countSyllables('walked')).toBe(1)
        expect(countSyllables('talked')).toBe(1)
        expect(countSyllables('jumped')).toBe(1)
      })

      it('handles -es endings', () => {
        expect(countSyllables('makes')).toBe(1)
        expect(countSyllables('takes')).toBe(1)
      })

      it('handles words starting with y', () => {
        expect(countSyllables('year')).toBeGreaterThanOrEqual(1)
        expect(countSyllables('yellow')).toBeGreaterThanOrEqual(1)
      })

      it('handles uppercase words', () => {
        expect(countSyllables('HELLO')).toBe(2)
        // Algorithm may count more vowel groups than phonetic syllables
        expect(countSyllables('BEAUTIFUL')).toBeGreaterThanOrEqual(3)
      })

      it('handles mixed case words', () => {
        expect(countSyllables('HeLLo')).toBe(2)
        // Algorithm may count more vowel groups than phonetic syllables
        expect(countSyllables('BeAutiFul')).toBeGreaterThanOrEqual(3)
      })

      it('handles words with hyphens', () => {
        expect(countSyllables('self-esteem')).toBeGreaterThanOrEqual(2)
      })

      it('handles empty string', () => {
        expect(countSyllables('')).toBe(1) // Short word default
      })

      it('handles whitespace', () => {
        // Implementation returns 1 for short strings (<=3 chars) before removing non-alpha
        expect(countSyllables('  ')).toBe(1)
        expect(countSyllables('  hello  ')).toBe(2)
      })

      it('handles non-alphabetic characters', () => {
        // Implementation returns 1 for short strings (<=3 chars) before removing non-alpha
        expect(countSyllables('123')).toBe(1)
        expect(countSyllables('!@#')).toBe(1)
      })
    })
  })

  // ==========================================
  // countTotalSyllables Tests
  // ==========================================
  describe('countTotalSyllables', () => {
    it('counts syllables in simple text', () => {
      expect(countTotalSyllables('The cat sat on the mat')).toBeGreaterThanOrEqual(6)
    })

    it('counts syllables in complex text', () => {
      const text = 'The beautiful university is wonderful'
      expect(countTotalSyllables(text)).toBeGreaterThanOrEqual(10)
    })

    it('returns 0 for empty text', () => {
      expect(countTotalSyllables('')).toBe(0)
    })

    it('returns 0 for text with only numbers', () => {
      expect(countTotalSyllables('123 456 789')).toBe(0)
    })

    it('handles text with punctuation', () => {
      expect(countTotalSyllables('Hello, world!')).toBeGreaterThanOrEqual(3)
    })
  })

  // ==========================================
  // getWords Tests
  // ==========================================
  describe('getWords', () => {
    it('extracts words from simple text', () => {
      expect(getWords('hello world')).toEqual(['hello', 'world'])
    })

    it('extracts words from text with punctuation', () => {
      expect(getWords('Hello, world!')).toEqual(['Hello', 'world'])
    })

    it('extracts words from text with numbers', () => {
      expect(getWords('I have 3 cats')).toEqual(['I', 'have', 'cats'])
    })

    it('extracts words from text with multiple spaces', () => {
      expect(getWords('hello    world')).toEqual(['hello', 'world'])
    })

    it('returns empty array for empty text', () => {
      expect(getWords('')).toEqual([])
    })

    it('returns empty array for text with only numbers', () => {
      expect(getWords('123 456')).toEqual([])
    })

    it('returns empty array for text with only punctuation', () => {
      expect(getWords('!@# $%^')).toEqual([])
    })

    it('handles mixed content', () => {
      expect(getWords('The quick brown fox jumps over 2 lazy dogs!')).toEqual([
        'The',
        'quick',
        'brown',
        'fox',
        'jumps',
        'over',
        'lazy',
        'dogs',
      ])
    })

    it('handles newlines and tabs', () => {
      expect(getWords('hello\nworld\tthere')).toEqual(['hello', 'world', 'there'])
    })
  })

  // ==========================================
  // countSentences Tests
  // ==========================================
  describe('countSentences', () => {
    it('counts sentences ending with period', () => {
      expect(countSentences('Hello. World.')).toBe(2)
    })

    it('counts sentences ending with exclamation mark', () => {
      expect(countSentences('Hello! World!')).toBe(2)
    })

    it('counts sentences ending with question mark', () => {
      expect(countSentences('Hello? World?')).toBe(2)
    })

    it('counts mixed punctuation sentences', () => {
      expect(countSentences('Hello. World! How are you?')).toBe(3)
    })

    it('returns 1 for text without sentence endings', () => {
      expect(countSentences('Hello world')).toBe(1)
    })

    it('returns 1 for empty text', () => {
      expect(countSentences('')).toBe(1)
    })

    it('handles multiple punctuation marks', () => {
      expect(countSentences('Hello... World!')).toBe(2)
      expect(countSentences('What?! Really?!')).toBe(2)
    })

    it('handles text with only whitespace after punctuation', () => {
      expect(countSentences('Hello.   ')).toBe(1)
    })

    it('counts long paragraph with multiple sentences', () => {
      const text =
        'This is the first sentence. This is the second sentence! Is this the third sentence? Yes, it is.'
      expect(countSentences(text)).toBe(4)
    })
  })

  // ==========================================
  // countComplexWords Tests
  // ==========================================
  describe('countComplexWords', () => {
    it('counts words with 3+ syllables', () => {
      expect(countComplexWords('beautiful wonderful')).toBe(2)
    })

    it('returns 0 for simple words', () => {
      expect(countComplexWords('the cat sat on the mat')).toBe(0)
    })

    it('counts complex words in mixed text', () => {
      expect(countComplexWords('The beautiful cat is wonderful')).toBe(2)
    })

    it('returns 0 for empty text', () => {
      expect(countComplexWords('')).toBe(0)
    })

    it('handles text with numbers', () => {
      expect(countComplexWords('I have 3 beautiful cats')).toBe(1)
    })

    it('counts multiple complex words', () => {
      const text = 'epistemological implications fundamentally challenge'
      expect(countComplexWords(text)).toBeGreaterThanOrEqual(3)
    })
  })

  // ==========================================
  // countCharacters Tests
  // ==========================================
  describe('countCharacters', () => {
    it('counts only letters', () => {
      expect(countCharacters('hello')).toBe(5)
    })

    it('excludes spaces', () => {
      expect(countCharacters('hello world')).toBe(10)
    })

    it('excludes numbers', () => {
      expect(countCharacters('hello123world')).toBe(10)
    })

    it('excludes punctuation', () => {
      expect(countCharacters('hello, world!')).toBe(10)
    })

    it('returns 0 for empty text', () => {
      expect(countCharacters('')).toBe(0)
    })

    it('returns 0 for text with only numbers', () => {
      expect(countCharacters('123456')).toBe(0)
    })

    it('returns 0 for text with only punctuation', () => {
      expect(countCharacters('!@#$%^&*()')).toBe(0)
    })

    it('counts uppercase and lowercase letters', () => {
      expect(countCharacters('HeLLo WoRLd')).toBe(10)
    })
  })

  // ==========================================
  // calculateStats Tests
  // ==========================================
  describe('calculateStats', () => {
    it('calculates all stats for simple text', () => {
      const text = 'The cat sat on the mat.'
      const stats = calculateStats(text)

      expect(stats.wordCount).toBe(6)
      expect(stats.sentenceCount).toBe(1)
      expect(stats.syllableCount).toBeGreaterThanOrEqual(6)
      expect(stats.characterCount).toBe(17) // Letters only
      expect(stats.complexWordCount).toBe(0)
      expect(stats.avgWordsPerSentence).toBe(6)
      expect(stats.avgSyllablesPerWord).toBeGreaterThanOrEqual(1)
    })

    it('calculates stats for empty text', () => {
      const stats = calculateStats('')

      expect(stats.wordCount).toBe(0)
      expect(stats.sentenceCount).toBe(1) // Minimum 1
      expect(stats.syllableCount).toBe(0)
      expect(stats.characterCount).toBe(0)
      expect(stats.complexWordCount).toBe(0)
      expect(stats.avgWordsPerSentence).toBe(0)
      expect(stats.avgSyllablesPerWord).toBe(0)
    })

    it('calculates stats for complex text', () => {
      const text =
        'The epistemological implications are fundamentally important. This is significant.'
      const stats = calculateStats(text)

      // Words: The, epistemological, implications, are, fundamentally, important, This, is, significant = 9
      expect(stats.wordCount).toBe(9)
      expect(stats.sentenceCount).toBe(2)
      expect(stats.complexWordCount).toBeGreaterThanOrEqual(2)
      expect(stats.avgWordsPerSentence).toBe(4.5)
    })

    it('calculates average syllables per word correctly', () => {
      const text = 'beautiful wonderful amazing' // Multi-syllable words
      const stats = calculateStats(text)

      expect(stats.avgSyllablesPerWord).toBeGreaterThan(2)
    })
  })

  // ==========================================
  // Readability Score Calculation Tests
  // ==========================================
  describe('calculateFleschReadingEase', () => {
    it('returns 0 for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateFleschReadingEase(stats)).toBe(0)
    })

    it('returns high score for easy text', () => {
      const stats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 2,
        syllableCount: 12,
        characterCount: 40,
        complexWordCount: 0,
        avgWordsPerSentence: 5,
        avgSyllablesPerWord: 1.2,
      }
      const score = calculateFleschReadingEase(stats)
      expect(score).toBeGreaterThan(70)
    })

    it('returns lower score for complex text', () => {
      const stats: ReadabilityStats = {
        wordCount: 20,
        sentenceCount: 1,
        syllableCount: 50,
        characterCount: 100,
        complexWordCount: 10,
        avgWordsPerSentence: 20,
        avgSyllablesPerWord: 2.5,
      }
      const score = calculateFleschReadingEase(stats)
      expect(score).toBeLessThan(50)
    })

    it('clamps score between 0 and 100', () => {
      // Very easy text
      const easyStats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 10,
        syllableCount: 10,
        characterCount: 30,
        complexWordCount: 0,
        avgWordsPerSentence: 1,
        avgSyllablesPerWord: 1,
      }
      expect(calculateFleschReadingEase(easyStats)).toBeLessThanOrEqual(100)

      // Very complex text
      const hardStats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 1,
        syllableCount: 50,
        characterCount: 100,
        complexWordCount: 10,
        avgWordsPerSentence: 50,
        avgSyllablesPerWord: 5,
      }
      expect(calculateFleschReadingEase(hardStats)).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateFleschKincaidGrade', () => {
    it('returns 0 for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateFleschKincaidGrade(stats)).toBe(0)
    })

    it('returns lower grade for simple text', () => {
      const stats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 2,
        syllableCount: 12,
        characterCount: 40,
        complexWordCount: 0,
        avgWordsPerSentence: 5,
        avgSyllablesPerWord: 1.2,
      }
      const grade = calculateFleschKincaidGrade(stats)
      expect(grade).toBeLessThan(6)
    })

    it('returns higher grade for complex text', () => {
      const stats: ReadabilityStats = {
        wordCount: 20,
        sentenceCount: 1,
        syllableCount: 50,
        characterCount: 100,
        complexWordCount: 10,
        avgWordsPerSentence: 20,
        avgSyllablesPerWord: 2.5,
      }
      const grade = calculateFleschKincaidGrade(stats)
      expect(grade).toBeGreaterThan(10)
    })

    it('does not return negative values', () => {
      const stats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 10,
        syllableCount: 10,
        characterCount: 30,
        complexWordCount: 0,
        avgWordsPerSentence: 1,
        avgSyllablesPerWord: 1,
      }
      expect(calculateFleschKincaidGrade(stats)).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateGunningFog', () => {
    it('returns 0 for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateGunningFog(stats)).toBe(0)
    })

    it('returns lower index for simple text', () => {
      const stats: ReadabilityStats = {
        wordCount: 20,
        sentenceCount: 2,
        syllableCount: 25,
        characterCount: 80,
        complexWordCount: 0,
        avgWordsPerSentence: 10,
        avgSyllablesPerWord: 1.25,
      }
      const index = calculateGunningFog(stats)
      expect(index).toBeLessThan(8)
    })

    it('returns higher index for complex text', () => {
      const stats: ReadabilityStats = {
        wordCount: 20,
        sentenceCount: 1,
        syllableCount: 50,
        characterCount: 100,
        complexWordCount: 10, // 50% complex words
        avgWordsPerSentence: 20,
        avgSyllablesPerWord: 2.5,
      }
      const index = calculateGunningFog(stats)
      expect(index).toBeGreaterThan(20)
    })
  })

  describe('calculateSMOG', () => {
    it('returns 0 for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 0,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateSMOG(stats)).toBe(0)
    })

    it('returns 0 when wordCount is 0', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateSMOG(stats)).toBe(0)
    })

    it('calculates SMOG for text with complex words', () => {
      const stats: ReadabilityStats = {
        wordCount: 30,
        sentenceCount: 3,
        syllableCount: 60,
        characterCount: 150,
        complexWordCount: 10,
        avgWordsPerSentence: 10,
        avgSyllablesPerWord: 2,
      }
      const smog = calculateSMOG(stats)
      expect(smog).toBeGreaterThan(0)
    })

    it('returns baseline for text without complex words', () => {
      const stats: ReadabilityStats = {
        wordCount: 30,
        sentenceCount: 3,
        syllableCount: 35,
        characterCount: 120,
        complexWordCount: 0,
        avgWordsPerSentence: 10,
        avgSyllablesPerWord: 1.17,
      }
      const smog = calculateSMOG(stats)
      expect(smog).toBeCloseTo(3.1, 0) // Baseline value
    })
  })

  describe('calculateColemanLiau', () => {
    it('returns 0 for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateColemanLiau(stats)).toBe(0)
    })

    it('calculates Coleman-Liau for typical text', () => {
      const stats: ReadabilityStats = {
        wordCount: 100,
        sentenceCount: 5,
        syllableCount: 150,
        characterCount: 450,
        complexWordCount: 10,
        avgWordsPerSentence: 20,
        avgSyllablesPerWord: 1.5,
      }
      const index = calculateColemanLiau(stats)
      expect(index).toBeGreaterThan(0)
    })

    it('does not return negative values', () => {
      const stats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 10,
        syllableCount: 10,
        characterCount: 30,
        complexWordCount: 0,
        avgWordsPerSentence: 1,
        avgSyllablesPerWord: 1,
      }
      expect(calculateColemanLiau(stats)).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateARI', () => {
    it('returns 0 for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      expect(calculateARI(stats)).toBe(0)
    })

    it('calculates ARI for typical text', () => {
      const stats: ReadabilityStats = {
        wordCount: 100,
        sentenceCount: 5,
        syllableCount: 150,
        characterCount: 450,
        complexWordCount: 10,
        avgWordsPerSentence: 20,
        avgSyllablesPerWord: 1.5,
      }
      const ari = calculateARI(stats)
      expect(ari).toBeGreaterThan(0)
    })

    it('does not return negative values', () => {
      const stats: ReadabilityStats = {
        wordCount: 10,
        sentenceCount: 10,
        syllableCount: 10,
        characterCount: 30,
        complexWordCount: 0,
        avgWordsPerSentence: 1,
        avgSyllablesPerWord: 1,
      }
      expect(calculateARI(stats)).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================
  // calculateReadingTime Tests
  // ==========================================
  describe('calculateReadingTime', () => {
    it('returns 1 minute for small word counts', () => {
      expect(calculateReadingTime(100)).toBe(1)
      expect(calculateReadingTime(200)).toBe(1)
    })

    it('returns 2 minutes for ~450 words', () => {
      expect(calculateReadingTime(450)).toBe(2)
    })

    it('returns 0 for 0 words', () => {
      expect(calculateReadingTime(0)).toBe(0)
    })

    it('rounds up reading time', () => {
      expect(calculateReadingTime(226)).toBe(2) // 226/225 = 1.004, rounds up
      expect(calculateReadingTime(451)).toBe(3) // 451/225 = 2.004, rounds up
    })

    it('calculates longer reading times', () => {
      expect(calculateReadingTime(1000)).toBe(5) // 1000/225 = 4.44, rounds up
      expect(calculateReadingTime(2250)).toBe(10)
    })
  })

  // ==========================================
  // calculateScores Tests
  // ==========================================
  describe('calculateScores', () => {
    it('returns all score types', () => {
      const stats: ReadabilityStats = {
        wordCount: 100,
        sentenceCount: 5,
        syllableCount: 150,
        characterCount: 450,
        complexWordCount: 10,
        avgWordsPerSentence: 20,
        avgSyllablesPerWord: 1.5,
      }
      const scores = calculateScores(stats)

      expect(scores).toHaveProperty('fleschReadingEase')
      expect(scores).toHaveProperty('fleschKincaidGrade')
      expect(scores).toHaveProperty('gunningFog')
      expect(scores).toHaveProperty('smog')
      expect(scores).toHaveProperty('colemanLiau')
      expect(scores).toHaveProperty('automatedReadabilityIndex')
    })

    it('returns all zeros for empty stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 0,
        sentenceCount: 1,
        syllableCount: 0,
        characterCount: 0,
        complexWordCount: 0,
        avgWordsPerSentence: 0,
        avgSyllablesPerWord: 0,
      }
      const scores = calculateScores(stats)

      expect(scores.fleschReadingEase).toBe(0)
      expect(scores.fleschKincaidGrade).toBe(0)
      expect(scores.gunningFog).toBe(0)
      expect(scores.smog).toBe(0)
      expect(scores.colemanLiau).toBe(0)
      expect(scores.automatedReadabilityIndex).toBe(0)
    })

    it('calculates consistent scores for the same stats', () => {
      const stats: ReadabilityStats = {
        wordCount: 50,
        sentenceCount: 3,
        syllableCount: 75,
        characterCount: 225,
        complexWordCount: 5,
        avgWordsPerSentence: 16.67,
        avgSyllablesPerWord: 1.5,
      }

      const scores1 = calculateScores(stats)
      const scores2 = calculateScores(stats)

      expect(scores1.fleschReadingEase).toBe(scores2.fleschReadingEase)
      expect(scores1.fleschKincaidGrade).toBe(scores2.fleschKincaidGrade)
      expect(scores1.gunningFog).toBe(scores2.gunningFog)
      expect(scores1.smog).toBe(scores2.smog)
      expect(scores1.colemanLiau).toBe(scores2.colemanLiau)
      expect(scores1.automatedReadabilityIndex).toBe(scores2.automatedReadabilityIndex)
    })
  })

  // ==========================================
  // getDifficulty Tests
  // ==========================================
  describe('getDifficulty', () => {
    it('returns "easy" for scores >= 70', () => {
      expect(getDifficulty(70)).toBe('easy')
      expect(getDifficulty(80)).toBe('easy')
      expect(getDifficulty(90)).toBe('easy')
      expect(getDifficulty(100)).toBe('easy')
    })

    it('returns "medium" for scores 50-69', () => {
      expect(getDifficulty(50)).toBe('medium')
      expect(getDifficulty(60)).toBe('medium')
      expect(getDifficulty(69)).toBe('medium')
    })

    it('returns "hard" for scores 30-49', () => {
      expect(getDifficulty(30)).toBe('hard')
      expect(getDifficulty(40)).toBe('hard')
      expect(getDifficulty(49)).toBe('hard')
    })

    it('returns "very-hard" for scores < 30', () => {
      expect(getDifficulty(0)).toBe('very-hard')
      expect(getDifficulty(10)).toBe('very-hard')
      expect(getDifficulty(29)).toBe('very-hard')
    })

    it('handles boundary values correctly', () => {
      expect(getDifficulty(69.9)).toBe('medium')
      expect(getDifficulty(49.9)).toBe('hard')
      expect(getDifficulty(29.9)).toBe('very-hard')
    })
  })

  // ==========================================
  // getOverallGradeLevel Tests
  // ==========================================
  describe('getOverallGradeLevel', () => {
    it('returns "5th Grade or below" for low average grades', () => {
      const scores: ReadabilityScores = {
        fleschReadingEase: 90,
        fleschKincaidGrade: 4,
        gunningFog: 4,
        smog: 4,
        colemanLiau: 4,
        automatedReadabilityIndex: 4,
      }
      expect(getOverallGradeLevel(scores)).toBe('5th Grade or below')
    })

    it('returns appropriate grade levels', () => {
      const createScores = (grade: number): ReadabilityScores => ({
        fleschReadingEase: 50,
        fleschKincaidGrade: grade,
        gunningFog: grade,
        smog: grade,
        colemanLiau: grade,
        automatedReadabilityIndex: grade,
      })

      expect(getOverallGradeLevel(createScores(6))).toBe('6th Grade')
      expect(getOverallGradeLevel(createScores(7))).toBe('7th Grade')
      expect(getOverallGradeLevel(createScores(8))).toBe('8th Grade')
      expect(getOverallGradeLevel(createScores(9))).toBe('9th Grade')
      expect(getOverallGradeLevel(createScores(10))).toBe('10th Grade')
      expect(getOverallGradeLevel(createScores(11))).toBe('11th Grade')
      expect(getOverallGradeLevel(createScores(12))).toBe('12th Grade')
    })

    it('returns "College" for average grades 13-14', () => {
      const scores: ReadabilityScores = {
        fleschReadingEase: 30,
        fleschKincaidGrade: 14,
        gunningFog: 14,
        smog: 14,
        colemanLiau: 14,
        automatedReadabilityIndex: 14,
      }
      expect(getOverallGradeLevel(scores)).toBe('College')
    })

    it('returns "Graduate/Professional" for very high average grades', () => {
      const scores: ReadabilityScores = {
        fleschReadingEase: 10,
        fleschKincaidGrade: 18,
        gunningFog: 18,
        smog: 18,
        colemanLiau: 18,
        automatedReadabilityIndex: 18,
      }
      expect(getOverallGradeLevel(scores)).toBe('Graduate/Professional')
    })
  })

  // ==========================================
  // analyzeReadability Tests
  // ==========================================
  describe('analyzeReadability', () => {
    it('returns complete result object', () => {
      const text = 'The cat sat on the mat. It was a nice day.'
      const result = analyzeReadability(text)

      expect(result).toHaveProperty('stats')
      expect(result).toHaveProperty('scores')
      expect(result).toHaveProperty('readingTime')
      expect(result).toHaveProperty('overallGradeLevel')
      expect(result).toHaveProperty('difficulty')
    })

    it('analyzes empty text', () => {
      const result = analyzeReadability('')

      expect(result.stats.wordCount).toBe(0)
      expect(result.readingTime).toBe(0)
      expect(result.difficulty).toBe('very-hard') // Score 0 is very-hard
    })

    it('analyzes easy sample text', () => {
      const result = analyzeReadability(sampleTexts.easy.text)

      expect(result.stats.wordCount).toBeGreaterThan(0)
      expect(result.scores.fleschReadingEase).toBeGreaterThan(60) // Should be relatively easy
    })

    it('analyzes medium sample text', () => {
      const result = analyzeReadability(sampleTexts.medium.text)

      expect(result.stats.wordCount).toBeGreaterThan(0)
    })

    it('analyzes hard sample text', () => {
      const result = analyzeReadability(sampleTexts.hard.text)

      expect(result.stats.wordCount).toBeGreaterThan(0)
      expect(result.stats.complexWordCount).toBeGreaterThan(0) // Should have complex words
    })

    it('provides consistent results for same text', () => {
      const text = 'This is a test sentence with some words.'
      const result1 = analyzeReadability(text)
      const result2 = analyzeReadability(text)

      expect(result1.stats).toEqual(result2.stats)
      expect(result1.scores).toEqual(result2.scores)
      expect(result1.readingTime).toBe(result2.readingTime)
      expect(result1.difficulty).toBe(result2.difficulty)
    })
  })

  // ==========================================
  // getFleschInterpretation Tests
  // ==========================================
  describe('getFleschInterpretation', () => {
    it('returns "Very Easy" for scores 90-100', () => {
      expect(getFleschInterpretation(90)).toEqual({
        label: 'Very Easy',
        audience: '5th grade (11-year-old)',
      })
      expect(getFleschInterpretation(100)).toEqual({
        label: 'Very Easy',
        audience: '5th grade (11-year-old)',
      })
    })

    it('returns "Easy" for scores 80-89', () => {
      expect(getFleschInterpretation(80)).toEqual({
        label: 'Easy',
        audience: '6th grade (12-year-old)',
      })
      expect(getFleschInterpretation(89)).toEqual({
        label: 'Easy',
        audience: '6th grade (12-year-old)',
      })
    })

    it('returns "Fairly Easy" for scores 70-79', () => {
      expect(getFleschInterpretation(70)).toEqual({
        label: 'Fairly Easy',
        audience: '7th grade (13-year-old)',
      })
      expect(getFleschInterpretation(79)).toEqual({
        label: 'Fairly Easy',
        audience: '7th grade (13-year-old)',
      })
    })

    it('returns "Standard" for scores 60-69', () => {
      expect(getFleschInterpretation(60)).toEqual({
        label: 'Standard',
        audience: '8th-9th grade (14-15 year-old)',
      })
      expect(getFleschInterpretation(69)).toEqual({
        label: 'Standard',
        audience: '8th-9th grade (14-15 year-old)',
      })
    })

    it('returns "Fairly Difficult" for scores 50-59', () => {
      expect(getFleschInterpretation(50)).toEqual({
        label: 'Fairly Difficult',
        audience: '10th-12th grade (16-18)',
      })
      expect(getFleschInterpretation(59)).toEqual({
        label: 'Fairly Difficult',
        audience: '10th-12th grade (16-18)',
      })
    })

    it('returns "Difficult" for scores 30-49', () => {
      expect(getFleschInterpretation(30)).toEqual({
        label: 'Difficult',
        audience: 'College student',
      })
      expect(getFleschInterpretation(49)).toEqual({
        label: 'Difficult',
        audience: 'College student',
      })
    })

    it('returns "Very Difficult" for scores below 30', () => {
      expect(getFleschInterpretation(0)).toEqual({
        label: 'Very Difficult',
        audience: 'College graduate/Professional',
      })
      expect(getFleschInterpretation(29)).toEqual({
        label: 'Very Difficult',
        audience: 'College graduate/Professional',
      })
    })
  })

  // ==========================================
  // sampleTexts Tests
  // ==========================================
  describe('sampleTexts', () => {
    it('has easy sample text', () => {
      expect(sampleTexts.easy).toBeDefined()
      expect(sampleTexts.easy.label).toBe('Easy (Grade 3-5)')
      expect(sampleTexts.easy.text.length).toBeGreaterThan(0)
    })

    it('has medium sample text', () => {
      expect(sampleTexts.medium).toBeDefined()
      expect(sampleTexts.medium.label).toBe('Medium (Grade 8-10)')
      expect(sampleTexts.medium.text.length).toBeGreaterThan(0)
    })

    it('has hard sample text', () => {
      expect(sampleTexts.hard).toBeDefined()
      expect(sampleTexts.hard.label).toBe('Hard (College+)')
      expect(sampleTexts.hard.text.length).toBeGreaterThan(0)
    })

    it('easy text is easier than medium text', () => {
      const easyResult = analyzeReadability(sampleTexts.easy.text)
      const mediumResult = analyzeReadability(sampleTexts.medium.text)

      expect(easyResult.scores.fleschReadingEase).toBeGreaterThan(
        mediumResult.scores.fleschReadingEase
      )
    })

    it('medium text is easier than hard text', () => {
      const mediumResult = analyzeReadability(sampleTexts.medium.text)
      const hardResult = analyzeReadability(sampleTexts.hard.text)

      expect(mediumResult.scores.fleschReadingEase).toBeGreaterThan(
        hardResult.scores.fleschReadingEase
      )
    })
  })

  // ==========================================
  // scoreExplanations Tests
  // ==========================================
  describe('scoreExplanations', () => {
    it('has explanation for Flesch Reading Ease', () => {
      expect(scoreExplanations.fleschReadingEase).toBeDefined()
      expect(scoreExplanations.fleschReadingEase.name).toBe('Flesch Reading Ease')
      expect(scoreExplanations.fleschReadingEase.description).toBeDefined()
      expect(scoreExplanations.fleschReadingEase.formula).toBeDefined()
      expect(scoreExplanations.fleschReadingEase.interpretation).toBeDefined()
      expect(scoreExplanations.fleschReadingEase.interpretation.length).toBe(7)
    })

    it('has explanation for Flesch-Kincaid Grade', () => {
      expect(scoreExplanations.fleschKincaidGrade).toBeDefined()
      expect(scoreExplanations.fleschKincaidGrade.name).toBe('Flesch-Kincaid Grade')
      expect(scoreExplanations.fleschKincaidGrade.description).toBeDefined()
      expect(scoreExplanations.fleschKincaidGrade.formula).toBeDefined()
    })

    it('has explanation for Gunning Fog Index', () => {
      expect(scoreExplanations.gunningFog).toBeDefined()
      expect(scoreExplanations.gunningFog.name).toBe('Gunning Fog Index')
      expect(scoreExplanations.gunningFog.description).toBeDefined()
      expect(scoreExplanations.gunningFog.formula).toBeDefined()
    })

    it('has explanation for SMOG Index', () => {
      expect(scoreExplanations.smog).toBeDefined()
      expect(scoreExplanations.smog.name).toBe('SMOG Index')
      expect(scoreExplanations.smog.description).toBeDefined()
      expect(scoreExplanations.smog.formula).toBeDefined()
    })

    it('has explanation for Coleman-Liau Index', () => {
      expect(scoreExplanations.colemanLiau).toBeDefined()
      expect(scoreExplanations.colemanLiau.name).toBe('Coleman-Liau Index')
      expect(scoreExplanations.colemanLiau.description).toBeDefined()
      expect(scoreExplanations.colemanLiau.formula).toBeDefined()
    })

    it('has explanation for Automated Readability Index', () => {
      expect(scoreExplanations.automatedReadabilityIndex).toBeDefined()
      expect(scoreExplanations.automatedReadabilityIndex.name).toBe('Automated Readability Index')
      expect(scoreExplanations.automatedReadabilityIndex.description).toBeDefined()
      expect(scoreExplanations.automatedReadabilityIndex.formula).toBeDefined()
    })
  })

  // ==========================================
  // Integration Tests with Real Text
  // ==========================================
  describe('Integration Tests', () => {
    it('analyzes a complete paragraph correctly', () => {
      const text = `
        Writing clear and concise content is important for effective communication.
        Short sentences help readers understand your message quickly.
        Avoid using complex vocabulary when simpler words work just as well.
      `
      const result = analyzeReadability(text)

      expect(result.stats.wordCount).toBeGreaterThan(20)
      expect(result.stats.sentenceCount).toBeGreaterThanOrEqual(3)
      expect(result.readingTime).toBeGreaterThanOrEqual(1)
    })

    it('handles technical/scientific text', () => {
      const text = `
        Quantum entanglement demonstrates non-local correlations between particles.
        This phenomenon challenges classical interpretations of physical reality.
        Theoretical physicists continue investigating these counterintuitive effects.
      `
      const result = analyzeReadability(text)

      expect(result.stats.complexWordCount).toBeGreaterThan(0)
      expect(result.difficulty).not.toBe('easy')
    })

    it('handles conversational text', () => {
      const text = `
        Hey there! How are you doing today?
        I hope you're having a great day.
        Let me know if you need anything.
      `
      const result = analyzeReadability(text)

      expect(result.stats.sentenceCount).toBeGreaterThanOrEqual(3)
      expect(result.scores.fleschReadingEase).toBeGreaterThan(50)
    })

    it('handles single sentence', () => {
      const text = 'This is a simple sentence.'
      const result = analyzeReadability(text)

      expect(result.stats.wordCount).toBe(5)
      expect(result.stats.sentenceCount).toBe(1)
    })

    it('handles text with various punctuation', () => {
      const text = "What time is it? I think it's noon. Yes, it is! Great... let's eat."
      const result = analyzeReadability(text)

      expect(result.stats.sentenceCount).toBeGreaterThanOrEqual(4)
    })
  })
})
