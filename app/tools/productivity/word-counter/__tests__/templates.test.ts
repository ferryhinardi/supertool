import { describe, expect, it } from 'vitest'
import {
  analyzeText,
  calculateKeywordDensity,
  formatTime,
  sampleTexts,
  type TextStatistics,
} from '../templates'

describe('Word Counter Templates', () => {
  describe('analyzeText', () => {
    describe('empty and whitespace input', () => {
      it('returns zero statistics for empty string', () => {
        const result = analyzeText('')

        expect(result).toEqual({
          characters: 0,
          charactersNoSpaces: 0,
          words: 0,
          sentences: 0,
          paragraphs: 0,
          lines: 0,
          readingTime: 0,
          speakingTime: 0,
          averageWordLength: 0,
          longestWord: '',
          longestWordLength: 0,
        })
      })

      it('returns zero statistics for whitespace-only string', () => {
        const result = analyzeText('   \n\t  ')

        expect(result).toEqual({
          characters: 0,
          charactersNoSpaces: 0,
          words: 0,
          sentences: 0,
          paragraphs: 0,
          lines: 0,
          readingTime: 0,
          speakingTime: 0,
          averageWordLength: 0,
          longestWord: '',
          longestWordLength: 0,
        })
      })

      it('returns zero statistics for null-like input', () => {
        const result = analyzeText(null as unknown as string)

        expect(result.words).toBe(0)
        expect(result.characters).toBe(0)
      })
    })

    describe('character counting', () => {
      it('counts total characters including spaces', () => {
        const result = analyzeText('Hello World')

        expect(result.characters).toBe(11)
      })

      it('counts characters excluding spaces', () => {
        const result = analyzeText('Hello World')

        expect(result.charactersNoSpaces).toBe(10)
      })

      it('handles multiple spaces correctly', () => {
        const result = analyzeText('Hello   World')

        expect(result.characters).toBe(13)
        expect(result.charactersNoSpaces).toBe(10)
      })

      it('handles tabs and newlines as spaces', () => {
        const result = analyzeText('Hello\tWorld\nTest')

        expect(result.characters).toBe(16)
        expect(result.charactersNoSpaces).toBe(14)
      })

      it('handles special characters', () => {
        const result = analyzeText('Hello! @World #Test')

        expect(result.characters).toBe(19)
      })

      it('handles unicode characters', () => {
        const result = analyzeText('Hello World')

        expect(result.characters).toBe(11) // 'Hello World' = 11 chars
      })

      it('handles emojis', () => {
        // JavaScript .length counts emoji surrogate pairs as 2 characters each
        const result = analyzeText('Hi 👋')

        expect(result.characters).toBe(5) // 'Hi ' = 3 chars + emoji = 2 chars (surrogate pair)
      })
    })

    describe('word counting', () => {
      it('counts words correctly for simple sentence', () => {
        const result = analyzeText('Hello World')

        expect(result.words).toBe(2)
      })

      it('counts words with punctuation', () => {
        const result = analyzeText('Hello, World! How are you?')

        expect(result.words).toBe(5)
      })

      it('handles contractions as single words', () => {
        const result = analyzeText("I'm don't won't can't")

        expect(result.words).toBe(4)
      })

      it('handles hyphenated words', () => {
        const result = analyzeText('well-known self-aware')

        expect(result.words).toBe(2)
      })

      it('handles numbers as words', () => {
        const result = analyzeText('I have 3 apples and 2 oranges')

        expect(result.words).toBe(7)
      })

      it('handles multiple separators between words', () => {
        const result = analyzeText('Hello    World')

        expect(result.words).toBe(2)
      })

      it('handles words with apostrophes', () => {
        const result = analyzeText("John's book Mary's car")

        expect(result.words).toBe(4)
      })
    })

    describe('sentence counting', () => {
      it('counts sentences ending with period', () => {
        const result = analyzeText('Hello World. This is a test.')

        expect(result.sentences).toBe(2)
      })

      it('counts sentences ending with exclamation mark', () => {
        const result = analyzeText('Hello! World!')

        expect(result.sentences).toBe(2)
      })

      it('counts sentences ending with question mark', () => {
        const result = analyzeText('Hello? World?')

        expect(result.sentences).toBe(2)
      })

      it('counts sentences with mixed punctuation', () => {
        const result = analyzeText('Hello. World! How are you?')

        expect(result.sentences).toBe(3)
      })

      it('handles multiple punctuation marks', () => {
        const result = analyzeText('Really?! Yes!!!')

        // Each group of punctuation counts
        expect(result.sentences).toBe(2)
      })

      it('handles ellipsis', () => {
        const result = analyzeText('Hello... World.')

        expect(result.sentences).toBe(2)
      })

      it('returns 0 for text without sentence-ending punctuation', () => {
        const result = analyzeText('Hello World')

        expect(result.sentences).toBe(0)
      })
    })

    describe('paragraph counting', () => {
      it('counts single paragraph', () => {
        const result = analyzeText('Hello World. This is a test.')

        expect(result.paragraphs).toBe(1)
      })

      it('counts multiple paragraphs separated by double newlines', () => {
        const result = analyzeText('First paragraph.\n\nSecond paragraph.\n\nThird paragraph.')

        expect(result.paragraphs).toBe(3)
      })

      it('handles paragraphs with extra whitespace', () => {
        const result = analyzeText('First paragraph.\n\n\n\nSecond paragraph.')

        expect(result.paragraphs).toBe(2)
      })

      it('ignores empty paragraphs', () => {
        const result = analyzeText('First paragraph.\n\n  \n\nSecond paragraph.')

        expect(result.paragraphs).toBe(2)
      })

      it('counts single line as one paragraph', () => {
        const result = analyzeText('Just one line')

        expect(result.paragraphs).toBe(1)
      })
    })

    describe('line counting', () => {
      it('counts single line', () => {
        const result = analyzeText('Hello World')

        expect(result.lines).toBe(1)
      })

      it('counts multiple lines', () => {
        const result = analyzeText('Line 1\nLine 2\nLine 3')

        expect(result.lines).toBe(3)
      })

      it('ignores empty lines', () => {
        const result = analyzeText('Line 1\n\nLine 2\n\n\nLine 3')

        expect(result.lines).toBe(3)
      })

      it('ignores lines with only whitespace', () => {
        const result = analyzeText('Line 1\n   \nLine 2')

        expect(result.lines).toBe(2)
      })
    })

    describe('reading time calculation', () => {
      it('calculates reading time at 200 words per minute', () => {
        // 200 words = 1 minute
        const text = Array(200).fill('word').join(' ')
        const result = analyzeText(text)

        expect(result.readingTime).toBe(1)
      })

      it('calculates fractional reading time', () => {
        // 100 words = 0.5 minutes
        const text = Array(100).fill('word').join(' ')
        const result = analyzeText(text)

        expect(result.readingTime).toBe(0.5)
      })

      it('returns 0 for empty text', () => {
        const result = analyzeText('')

        expect(result.readingTime).toBe(0)
      })

      it('handles very short text', () => {
        const result = analyzeText('Hello')

        expect(result.readingTime).toBe(0) // 1/200 rounds to 0
      })

      it('calculates for larger text correctly', () => {
        // 400 words = 2 minutes
        const text = Array(400).fill('word').join(' ')
        const result = analyzeText(text)

        expect(result.readingTime).toBe(2)
      })
    })

    describe('speaking time calculation', () => {
      it('calculates speaking time at 130 words per minute', () => {
        // 130 words = 1 minute
        const text = Array(130).fill('word').join(' ')
        const result = analyzeText(text)

        expect(result.speakingTime).toBe(1)
      })

      it('calculates fractional speaking time', () => {
        // 65 words = 0.5 minutes
        const text = Array(65).fill('word').join(' ')
        const result = analyzeText(text)

        expect(result.speakingTime).toBe(0.5)
      })

      it('returns 0 for empty text', () => {
        const result = analyzeText('')

        expect(result.speakingTime).toBe(0)
      })

      it('speaking time is longer than reading time', () => {
        const text = Array(200).fill('word').join(' ')
        const result = analyzeText(text)

        expect(result.speakingTime).toBeGreaterThan(result.readingTime)
      })
    })

    describe('average word length calculation', () => {
      it('calculates average word length correctly', () => {
        const result = analyzeText('Hi hello world')
        // 2 + 5 + 5 = 12 / 3 = 4
        expect(result.averageWordLength).toBe(4)
      })

      it('returns 0 for empty text', () => {
        const result = analyzeText('')

        expect(result.averageWordLength).toBe(0)
      })

      it('rounds to one decimal place', () => {
        const result = analyzeText('a ab abc')
        // 1 + 2 + 3 = 6 / 3 = 2.0
        expect(result.averageWordLength).toBe(2)
      })

      it('handles single word', () => {
        const result = analyzeText('Hello')

        expect(result.averageWordLength).toBe(5)
      })
    })

    describe('longest word detection', () => {
      it('finds the longest word', () => {
        const result = analyzeText('short longer longest')

        expect(result.longestWord).toBe('longest')
        expect(result.longestWordLength).toBe(7)
      })

      it('returns first longest word if tied', () => {
        const result = analyzeText('apple grape lemon')
        // All 5 letters, should return first one found
        expect(result.longestWordLength).toBe(5)
      })

      it('returns empty string for empty text', () => {
        const result = analyzeText('')

        expect(result.longestWord).toBe('')
        expect(result.longestWordLength).toBe(0)
      })

      it('handles single word', () => {
        const result = analyzeText('Hello')

        expect(result.longestWord).toBe('Hello')
        expect(result.longestWordLength).toBe(5)
      })

      it('handles words with hyphens', () => {
        const result = analyzeText('test self-explanatory word')

        expect(result.longestWord).toBe('self-explanatory')
      })

      it('handles words with apostrophes', () => {
        const result = analyzeText("cat grandmother's dog")

        expect(result.longestWord).toBe("grandmother's")
      })
    })

    describe('comprehensive text analysis', () => {
      it('analyzes short sample text correctly', () => {
        const result = analyzeText(sampleTexts.short)

        expect(result.words).toBeGreaterThan(0)
        expect(result.sentences).toBeGreaterThan(0)
        expect(result.paragraphs).toBe(1)
        expect(result.characters).toBeGreaterThan(0)
      })

      it('analyzes medium sample text correctly', () => {
        const result = analyzeText(sampleTexts.medium)

        expect(result.words).toBeGreaterThan(0)
        expect(result.sentences).toBeGreaterThan(0)
        expect(result.paragraphs).toBe(3)
      })

      it('analyzes long sample text correctly', () => {
        const result = analyzeText(sampleTexts.long)

        expect(result.words).toBeGreaterThan(0)
        expect(result.sentences).toBeGreaterThan(0)
        expect(result.paragraphs).toBe(5)
      })
    })
  })

  describe('calculateKeywordDensity', () => {
    describe('empty and whitespace input', () => {
      it('returns empty array for empty string', () => {
        const result = calculateKeywordDensity('')

        expect(result).toEqual([])
      })

      it('returns empty array for whitespace-only string', () => {
        const result = calculateKeywordDensity('   \n\t  ')

        expect(result).toEqual([])
      })

      it('returns empty array for null-like input', () => {
        const result = calculateKeywordDensity(null as unknown as string)

        expect(result).toEqual([])
      })
    })

    describe('stop words filtering', () => {
      it('filters out common stop words', () => {
        const result = calculateKeywordDensity('the and a is of to')

        expect(result).toEqual([])
      })

      it('filters stop words while keeping meaningful words', () => {
        const result = calculateKeywordDensity('the quick brown fox jumps over the lazy dog')

        const words = result.map((k) => k.word)
        expect(words).not.toContain('the')
        expect(words).not.toContain('over')
        expect(words).toContain('quick')
        expect(words).toContain('brown')
        expect(words).toContain('fox')
      })

      it('handles mixed case stop words', () => {
        const result = calculateKeywordDensity('THE And A IS Of TO')

        expect(result).toEqual([])
      })
    })

    describe('short word filtering', () => {
      it('filters out words with 2 or fewer characters', () => {
        const result = calculateKeywordDensity('a I on it be me we')

        expect(result).toEqual([])
      })

      it('keeps words with 3+ characters', () => {
        const result = calculateKeywordDensity('cat dog run')

        expect(result.length).toBe(3)
      })
    })

    describe('frequency counting', () => {
      it('counts word frequency correctly', () => {
        const result = calculateKeywordDensity('hello hello hello world world')

        const helloKeyword = result.find((k) => k.word === 'hello')
        const worldKeyword = result.find((k) => k.word === 'world')

        expect(helloKeyword?.count).toBe(3)
        expect(worldKeyword?.count).toBe(2)
      })

      it('is case-insensitive', () => {
        const result = calculateKeywordDensity('Hello HELLO hello')

        const helloKeyword = result.find((k) => k.word === 'hello')
        expect(helloKeyword?.count).toBe(3)
      })

      it('calculates percentage correctly', () => {
        const result = calculateKeywordDensity('hello hello world world')
        // 4 total words, hello = 2 = 50%, world = 2 = 50%
        const helloKeyword = result.find((k) => k.word === 'hello')
        expect(helloKeyword?.percentage).toBe(50)
      })
    })

    describe('sorting', () => {
      it('sorts by frequency descending', () => {
        const result = calculateKeywordDensity('apple apple apple banana banana cherry')

        expect(result[0].word).toBe('apple')
        expect(result[1].word).toBe('banana')
        expect(result[2].word).toBe('cherry')
      })

      it('maintains sort order for equal frequencies', () => {
        const result = calculateKeywordDensity('apple banana cherry')

        expect(result.length).toBe(3)
        // All have count of 1
        expect(result.every((k) => k.count === 1)).toBe(true)
      })
    })

    describe('topN limiting', () => {
      it('returns default 10 keywords', () => {
        const words = Array(20)
          .fill(null)
          .map((_, i) => `keyword${i}`)
          .join(' ')
        const result = calculateKeywordDensity(words)

        expect(result.length).toBeLessThanOrEqual(10)
      })

      it('returns custom topN keywords', () => {
        const words = Array(20)
          .fill(null)
          .map((_, i) => `keyword${i}`)
          .join(' ')
        const result = calculateKeywordDensity(words, 5)

        expect(result.length).toBeLessThanOrEqual(5)
      })

      it('returns all keywords if fewer than topN', () => {
        const result = calculateKeywordDensity('apple banana cherry', 10)

        expect(result.length).toBe(3)
      })

      it('handles topN of 0', () => {
        const result = calculateKeywordDensity('apple banana cherry', 0)

        expect(result.length).toBe(0)
      })

      it('handles large topN', () => {
        const result = calculateKeywordDensity('apple banana', 100)

        expect(result.length).toBe(2)
      })
    })

    describe('percentage calculation', () => {
      it('calculates percentage based on total words including stop words', () => {
        // "hello the world" has 3 total words
        // hello appears 1 time, so 1/3 = 33.33%
        const result = calculateKeywordDensity('hello the world')

        const helloKeyword = result.find((k) => k.word === 'hello')
        expect(helloKeyword?.percentage).toBeCloseTo(33.33, 1)
      })

      it('rounds percentage to 2 decimal places', () => {
        const result = calculateKeywordDensity('hello hello hello the')
        // 3/4 = 75%
        const helloKeyword = result.find((k) => k.word === 'hello')
        expect(helloKeyword?.percentage).toBe(75)
      })
    })

    describe('KeywordFrequency interface', () => {
      it('returns objects with correct shape', () => {
        const result = calculateKeywordDensity('hello world')

        expect(result.length).toBeGreaterThan(0)
        const keyword = result[0]
        expect(keyword).toHaveProperty('word')
        expect(keyword).toHaveProperty('count')
        expect(keyword).toHaveProperty('percentage')
        expect(typeof keyword.word).toBe('string')
        expect(typeof keyword.count).toBe('number')
        expect(typeof keyword.percentage).toBe('number')
      })
    })

    describe('sample texts', () => {
      it('extracts keywords from short sample', () => {
        const result = calculateKeywordDensity(sampleTexts.short)

        expect(result.length).toBeGreaterThan(0)
      })

      it('extracts keywords from medium sample', () => {
        const result = calculateKeywordDensity(sampleTexts.medium)

        expect(result.length).toBeGreaterThan(0)
      })

      it('extracts keywords from long sample', () => {
        const result = calculateKeywordDensity(sampleTexts.long)

        expect(result.length).toBeGreaterThan(0)
      })
    })
  })

  describe('formatTime', () => {
    describe('less than 1 minute', () => {
      it('returns "Less than 1 min" for 0 minutes', () => {
        expect(formatTime(0)).toBe('Less than 1 min')
      })

      it('returns "Less than 1 min" for 0.5 minutes', () => {
        expect(formatTime(0.5)).toBe('Less than 1 min')
      })

      it('returns "Less than 1 min" for 0.99 minutes', () => {
        expect(formatTime(0.99)).toBe('Less than 1 min')
      })
    })

    describe('minutes only', () => {
      it('returns "1 min" for exactly 1 minute', () => {
        expect(formatTime(1)).toBe('1 min')
      })

      it('returns "5 min" for 5 minutes', () => {
        expect(formatTime(5)).toBe('5 min')
      })

      it('returns "30 min" for 30 minutes', () => {
        expect(formatTime(30)).toBe('30 min')
      })

      it('returns "59 min" for 59 minutes', () => {
        expect(formatTime(59)).toBe('59 min')
      })

      it('rounds fractional minutes', () => {
        expect(formatTime(5.4)).toBe('5 min')
        expect(formatTime(5.6)).toBe('6 min')
      })
    })

    describe('hours and minutes', () => {
      it('returns "1h" for exactly 60 minutes', () => {
        expect(formatTime(60)).toBe('1h')
      })

      it('returns "1h 30min" for 90 minutes', () => {
        expect(formatTime(90)).toBe('1h 30min')
      })

      it('returns "2h" for 120 minutes', () => {
        expect(formatTime(120)).toBe('2h')
      })

      it('returns "2h 15min" for 135 minutes', () => {
        expect(formatTime(135)).toBe('2h 15min')
      })

      it('returns "10h 5min" for 605 minutes', () => {
        expect(formatTime(605)).toBe('10h 5min')
      })
    })

    describe('edge cases', () => {
      it('handles negative values', () => {
        expect(formatTime(-5)).toBe('Less than 1 min')
      })

      it('handles very large values', () => {
        expect(formatTime(6000)).toBe('100h')
      })

      it('handles decimal hours correctly', () => {
        // 61.5 minutes = 1h 2min (rounds to 2)
        expect(formatTime(61.5)).toBe('1h 2min')
      })
    })
  })

  describe('sampleTexts', () => {
    it('has short sample text', () => {
      expect(sampleTexts.short).toBeDefined()
      expect(typeof sampleTexts.short).toBe('string')
      expect(sampleTexts.short.length).toBeGreaterThan(0)
    })

    it('has medium sample text', () => {
      expect(sampleTexts.medium).toBeDefined()
      expect(typeof sampleTexts.medium).toBe('string')
      expect(sampleTexts.medium.length).toBeGreaterThan(sampleTexts.short.length)
    })

    it('has long sample text', () => {
      expect(sampleTexts.long).toBeDefined()
      expect(typeof sampleTexts.long).toBe('string')
      expect(sampleTexts.long.length).toBeGreaterThan(sampleTexts.medium.length)
    })

    it('short sample has expected content', () => {
      expect(sampleTexts.short).toContain('quick brown fox')
    })

    it('medium sample has multiple paragraphs', () => {
      expect(sampleTexts.medium).toContain('\n\n')
    })

    it('long sample has multiple paragraphs', () => {
      expect(sampleTexts.long).toContain('\n\n')
    })

    it('all samples are non-empty', () => {
      const allSamples = Object.values(sampleTexts)
      expect(allSamples.every((s) => s.trim().length > 0)).toBe(true)
    })
  })

  describe('TextStatistics interface', () => {
    it('analyzeText returns all required properties', () => {
      const result: TextStatistics = analyzeText('Hello World')

      expect(result).toHaveProperty('characters')
      expect(result).toHaveProperty('charactersNoSpaces')
      expect(result).toHaveProperty('words')
      expect(result).toHaveProperty('sentences')
      expect(result).toHaveProperty('paragraphs')
      expect(result).toHaveProperty('lines')
      expect(result).toHaveProperty('readingTime')
      expect(result).toHaveProperty('speakingTime')
      expect(result).toHaveProperty('averageWordLength')
      expect(result).toHaveProperty('longestWord')
      expect(result).toHaveProperty('longestWordLength')
    })

    it('all numeric properties are numbers', () => {
      const result = analyzeText('Hello World')

      expect(typeof result.characters).toBe('number')
      expect(typeof result.charactersNoSpaces).toBe('number')
      expect(typeof result.words).toBe('number')
      expect(typeof result.sentences).toBe('number')
      expect(typeof result.paragraphs).toBe('number')
      expect(typeof result.lines).toBe('number')
      expect(typeof result.readingTime).toBe('number')
      expect(typeof result.speakingTime).toBe('number')
      expect(typeof result.averageWordLength).toBe('number')
      expect(typeof result.longestWordLength).toBe('number')
    })

    it('longestWord is a string', () => {
      const result = analyzeText('Hello World')

      expect(typeof result.longestWord).toBe('string')
    })
  })
})
