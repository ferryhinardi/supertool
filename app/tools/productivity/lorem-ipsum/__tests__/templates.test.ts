import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  generateLoremIpsum,
  getCharacterCount,
  getParagraphCount,
  getSentenceCount,
  getWordCount,
  type OutputType,
} from '../templates'

describe('Lorem Ipsum Templates', () => {
  describe('generateLoremIpsum', () => {
    describe('paragraphs output', () => {
      it('generates the specified number of paragraphs', () => {
        const result = generateLoremIpsum({
          type: 'paragraphs',
          count: 3,
          startWithLorem: false,
          htmlFormat: false,
        })

        // Should have 3 paragraphs separated by double newlines
        const paragraphs = result.split('\n\n')
        expect(paragraphs.length).toBe(3)
      })

      it('starts with "Lorem ipsum" when startWithLorem is true', () => {
        const result = generateLoremIpsum({
          type: 'paragraphs',
          count: 1,
          startWithLorem: true,
          htmlFormat: false,
        })

        expect(result.startsWith('Lorem ipsum')).toBe(true)
      })

      it('wraps paragraphs in <p> tags when htmlFormat is true', () => {
        const result = generateLoremIpsum({
          type: 'paragraphs',
          count: 2,
          startWithLorem: false,
          htmlFormat: true,
        })

        expect(result).toContain('<p>')
        expect(result).toContain('</p>')
        const pTagCount = (result.match(/<p>/g) || []).length
        expect(pTagCount).toBe(2)
      })

      it('does not include HTML tags when htmlFormat is false', () => {
        const result = generateLoremIpsum({
          type: 'paragraphs',
          count: 2,
          startWithLorem: false,
          htmlFormat: false,
        })

        expect(result).not.toContain('<p>')
        expect(result).not.toContain('</p>')
      })

      it('generates paragraphs with multiple sentences', () => {
        const result = generateLoremIpsum({
          type: 'paragraphs',
          count: 1,
          startWithLorem: false,
          htmlFormat: false,
        })

        // Each paragraph should have at least 3 sentences (ends with period)
        const sentenceCount = (result.match(/\./g) || []).length
        expect(sentenceCount).toBeGreaterThanOrEqual(3)
      })
    })

    describe('sentences output', () => {
      it('generates the specified number of sentences', () => {
        const result = generateLoremIpsum({
          type: 'sentences',
          count: 5,
          startWithLorem: false,
          htmlFormat: false,
        })

        // Count periods
        const periodCount = (result.match(/\./g) || []).length
        expect(periodCount).toBe(5)
      })

      it('starts with "Lorem ipsum" when startWithLorem is true', () => {
        const result = generateLoremIpsum({
          type: 'sentences',
          count: 1,
          startWithLorem: true,
          htmlFormat: false,
        })

        expect(result.startsWith('Lorem ipsum')).toBe(true)
      })

      it('capitalizes the first word of each sentence', () => {
        const result = generateLoremIpsum({
          type: 'sentences',
          count: 3,
          startWithLorem: false,
          htmlFormat: false,
        })

        // First character should be uppercase
        expect(result[0]).toBe(result[0].toUpperCase())
      })

      it('generates sentences with 5-15 words', () => {
        // Generate multiple to test randomness
        for (let i = 0; i < 10; i++) {
          const result = generateLoremIpsum({
            type: 'sentences',
            count: 1,
            startWithLorem: false,
            htmlFormat: false,
          })

          // Remove period and count words
          const words = result.replace('.', '').split(' ')
          expect(words.length).toBeGreaterThanOrEqual(5)
          expect(words.length).toBeLessThanOrEqual(15)
        }
      })
    })

    describe('words output', () => {
      it('generates the specified number of words', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 10,
          startWithLorem: false,
          htmlFormat: false,
        })

        // Remove trailing period and count words
        const words = result.replace(/\.$/, '').split(' ')
        expect(words.length).toBe(10)
      })

      it('starts with "Lorem ipsum dolor sit amet" when startWithLorem is true and count >= 5', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 10,
          startWithLorem: true,
          htmlFormat: false,
        })

        expect(result.startsWith('Lorem ipsum dolor sit amet')).toBe(true)
      })

      it('does not start with Lorem when startWithLorem is true but count < 5', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 3,
          startWithLorem: true,
          htmlFormat: false,
        })

        // Should still capitalize first word but not force Lorem ipsum
        expect(result[0]).toBe(result[0].toUpperCase())
      })

      it('capitalizes the first word', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 5,
          startWithLorem: false,
          htmlFormat: false,
        })

        expect(result[0]).toBe(result[0].toUpperCase())
      })

      it('ends with a period', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 5,
          startWithLorem: false,
          htmlFormat: false,
        })

        expect(result.endsWith('.')).toBe(true)
      })

      it('generates exactly 1 word when count is 1', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 1,
          startWithLorem: false,
          htmlFormat: false,
        })

        const words = result.replace(/\.$/, '').split(' ')
        expect(words.length).toBe(1)
      })
    })

    describe('edge cases', () => {
      it('handles count of 0', () => {
        const result = generateLoremIpsum({
          type: 'paragraphs',
          count: 0,
          startWithLorem: false,
          htmlFormat: false,
        })

        expect(result).toBe('')
      })

      it('handles large count', () => {
        const result = generateLoremIpsum({
          type: 'words',
          count: 100,
          startWithLorem: false,
          htmlFormat: false,
        })

        const words = result.replace(/\.$/, '').split(' ')
        expect(words.length).toBe(100)
      })

      it('generates different text on each call (randomness)', () => {
        const results = new Set<string>()
        for (let i = 0; i < 10; i++) {
          const result = generateLoremIpsum({
            type: 'sentences',
            count: 3,
            startWithLorem: false,
            htmlFormat: false,
          })
          results.add(result)
        }
        // Should have at least some variation
        expect(results.size).toBeGreaterThan(1)
      })
    })
  })

  describe('getCharacterCount', () => {
    it('counts all characters including spaces', () => {
      const text = 'Hello world'
      expect(getCharacterCount(text, false)).toBe(11)
    })

    it('counts characters excluding spaces', () => {
      const text = 'Hello world'
      expect(getCharacterCount(text, true)).toBe(10)
    })

    it('removes HTML tags before counting', () => {
      const text = '<p>Hello world</p>'
      expect(getCharacterCount(text, false)).toBe(11)
    })

    it('handles empty string', () => {
      expect(getCharacterCount('', false)).toBe(0)
      expect(getCharacterCount('', true)).toBe(0)
    })

    it('handles multiple spaces', () => {
      const text = 'Hello   world'
      expect(getCharacterCount(text, false)).toBe(13)
      expect(getCharacterCount(text, true)).toBe(10)
    })

    it('handles newlines and tabs', () => {
      const text = 'Hello\nworld\ttab'
      expect(getCharacterCount(text, false)).toBe(15)
      expect(getCharacterCount(text, true)).toBe(13)
    })

    it('handles nested HTML tags', () => {
      const text = '<div><p>Hello <strong>world</strong></p></div>'
      expect(getCharacterCount(text, false)).toBe(11)
    })
  })

  describe('getWordCount', () => {
    it('counts words correctly', () => {
      const text = 'Hello world test'
      expect(getWordCount(text)).toBe(3)
    })

    it('removes HTML tags before counting', () => {
      const text = '<p>Hello world</p>'
      expect(getWordCount(text)).toBe(2)
    })

    it('handles multiple spaces between words', () => {
      const text = 'Hello   world'
      expect(getWordCount(text)).toBe(2)
    })

    it('handles empty string', () => {
      expect(getWordCount('')).toBe(0)
    })

    it('handles single word', () => {
      expect(getWordCount('Hello')).toBe(1)
    })

    it('handles text with punctuation', () => {
      const text = 'Hello, world! How are you?'
      expect(getWordCount(text)).toBe(5)
    })

    it('handles newlines', () => {
      const text = 'Hello\nworld'
      expect(getWordCount(text)).toBe(2)
    })

    it('handles tabs', () => {
      const text = 'Hello\tworld'
      expect(getWordCount(text)).toBe(2)
    })
  })

  describe('getSentenceCount', () => {
    it('counts sentences ending with period', () => {
      const text = 'Hello world. This is a test.'
      expect(getSentenceCount(text)).toBe(2)
    })

    it('counts sentences ending with exclamation mark', () => {
      const text = 'Hello world! This is a test!'
      expect(getSentenceCount(text)).toBe(2)
    })

    it('counts sentences ending with question mark', () => {
      const text = 'Hello world? This is a test?'
      expect(getSentenceCount(text)).toBe(2)
    })

    it('handles mixed sentence endings', () => {
      const text = 'Hello world. Is this a test? Yes it is!'
      expect(getSentenceCount(text)).toBe(3)
    })

    it('removes HTML tags before counting', () => {
      const text = '<p>Hello world.</p><p>Test.</p>'
      expect(getSentenceCount(text)).toBe(2)
    })

    it('handles empty string', () => {
      expect(getSentenceCount('')).toBe(0)
    })

    it('handles text without sentence endings', () => {
      const text = 'Hello world'
      expect(getSentenceCount(text)).toBe(1)
    })

    it('handles multiple consecutive punctuation', () => {
      const text = 'Hello world... Test.'
      expect(getSentenceCount(text)).toBe(2)
    })
  })

  describe('getParagraphCount', () => {
    it('counts paragraphs by <p> tags when HTML is present', () => {
      const text = '<p>First paragraph.</p><p>Second paragraph.</p>'
      expect(getParagraphCount(text)).toBe(2)
    })

    it('counts paragraphs by double newlines when no HTML', () => {
      const text = 'First paragraph.\n\nSecond paragraph.'
      expect(getParagraphCount(text)).toBe(2)
    })

    it('handles single paragraph', () => {
      const text = 'Single paragraph.'
      expect(getParagraphCount(text)).toBe(1)
    })

    it('handles empty string', () => {
      expect(getParagraphCount('')).toBe(0)
    })

    it('handles multiple newlines between paragraphs', () => {
      const text = 'First paragraph.\n\n\n\nSecond paragraph.'
      expect(getParagraphCount(text)).toBe(2)
    })

    it('ignores single newlines', () => {
      const text = 'Line one.\nLine two.'
      expect(getParagraphCount(text)).toBe(1)
    })

    it('handles HTML with newlines between tags', () => {
      const text = '<p>First.</p>\n\n<p>Second.</p>'
      // Should count by <p> tags since HTML is present
      expect(getParagraphCount(text)).toBe(2)
    })
  })

  describe('integration tests', () => {
    it('generated paragraphs have correct statistics', () => {
      const result = generateLoremIpsum({
        type: 'paragraphs',
        count: 2,
        startWithLorem: false,
        htmlFormat: false,
      })

      expect(getParagraphCount(result)).toBe(2)
      expect(getWordCount(result)).toBeGreaterThan(0)
      expect(getSentenceCount(result)).toBeGreaterThan(0)
      expect(getCharacterCount(result, false)).toBeGreaterThan(0)
    })

    it('generated HTML paragraphs have correct paragraph count', () => {
      const result = generateLoremIpsum({
        type: 'paragraphs',
        count: 3,
        startWithLorem: false,
        htmlFormat: true,
      })

      expect(getParagraphCount(result)).toBe(3)
    })

    it('generated sentences have correct statistics', () => {
      const result = generateLoremIpsum({
        type: 'sentences',
        count: 5,
        startWithLorem: false,
        htmlFormat: false,
      })

      expect(getSentenceCount(result)).toBe(5)
      expect(getWordCount(result)).toBeGreaterThanOrEqual(25) // At least 5 words per sentence
    })

    it('generated words have correct statistics', () => {
      const result = generateLoremIpsum({
        type: 'words',
        count: 20,
        startWithLorem: false,
        htmlFormat: false,
      })

      expect(getWordCount(result)).toBe(20)
    })
  })
})
