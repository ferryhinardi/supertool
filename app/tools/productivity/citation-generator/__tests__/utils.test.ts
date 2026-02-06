import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type Author,
  CITATION_STYLES,
  type CitationStyleId,
  createEmptySourceData,
  formatCitationAsPlainText,
  formatCitationWithHtml,
  generateCitation,
  getFieldLabel,
  getFieldPlaceholder,
  isFieldRequired,
  parseAuthors,
  SOURCE_TYPES,
  type SourceData,
  type SourceTypeId,
  validateSourceData,
} from '../utils'

describe('Citation Generator Utils', () => {
  // Helper to create test source data
  const createTestSourceData = (overrides: Partial<SourceData> = {}): SourceData => ({
    sourceType: 'book',
    authors: [{ firstName: 'John', lastName: 'Smith' }],
    title: 'Test Book Title',
    year: '2024',
    ...overrides,
  })

  const createAuthor = (firstName: string, lastName: string, middleName?: string): Author => ({
    firstName,
    lastName,
    ...(middleName ? { middleName } : {}),
  })

  describe('CITATION_STYLES', () => {
    it('should have 6 citation styles', () => {
      expect(Object.keys(CITATION_STYLES)).toHaveLength(6)
    })

    it('should include all expected styles', () => {
      expect(CITATION_STYLES.apa).toBeDefined()
      expect(CITATION_STYLES.mla).toBeDefined()
      expect(CITATION_STYLES.chicago).toBeDefined()
      expect(CITATION_STYLES.harvard).toBeDefined()
      expect(CITATION_STYLES.ieee).toBeDefined()
      expect(CITATION_STYLES.vancouver).toBeDefined()
    })

    it('should have correct structure for each style', () => {
      for (const [key, style] of Object.entries(CITATION_STYLES)) {
        expect(style.id).toBe(key)
        expect(style.name).toBeDefined()
        expect(style.description).toBeDefined()
        expect(typeof style.name).toBe('string')
        expect(typeof style.description).toBe('string')
      }
    })

    it('should have APA 7th Edition', () => {
      expect(CITATION_STYLES.apa.name).toBe('APA 7th Edition')
      expect(CITATION_STYLES.apa.description).toContain('social sciences')
    })

    it('should have MLA 9th Edition', () => {
      expect(CITATION_STYLES.mla.name).toBe('MLA 9th Edition')
      expect(CITATION_STYLES.mla.description).toContain('humanities')
    })

    it('should have Chicago 17th Edition', () => {
      expect(CITATION_STYLES.chicago.name).toBe('Chicago 17th Edition')
      expect(CITATION_STYLES.chicago.description).toContain('history')
    })

    it('should have Harvard style', () => {
      expect(CITATION_STYLES.harvard.name).toBe('Harvard')
      expect(CITATION_STYLES.harvard.description).toContain('UK')
    })

    it('should have IEEE style', () => {
      expect(CITATION_STYLES.ieee.name).toBe('IEEE')
      expect(CITATION_STYLES.ieee.description).toContain('engineering')
    })

    it('should have Vancouver style', () => {
      expect(CITATION_STYLES.vancouver.name).toBe('Vancouver')
      expect(CITATION_STYLES.vancouver.description).toContain('medical')
    })
  })

  describe('SOURCE_TYPES', () => {
    it('should have 9 source types', () => {
      expect(Object.keys(SOURCE_TYPES)).toHaveLength(9)
    })

    it('should include all expected source types', () => {
      expect(SOURCE_TYPES.book).toBeDefined()
      expect(SOURCE_TYPES.journal).toBeDefined()
      expect(SOURCE_TYPES.website).toBeDefined()
      expect(SOURCE_TYPES.newspaper).toBeDefined()
      expect(SOURCE_TYPES.video).toBeDefined()
      expect(SOURCE_TYPES.conference).toBeDefined()
      expect(SOURCE_TYPES.thesis).toBeDefined()
      expect(SOURCE_TYPES.report).toBeDefined()
      expect(SOURCE_TYPES.chapter).toBeDefined()
    })

    it('should have correct structure for each source type', () => {
      for (const [key, sourceType] of Object.entries(SOURCE_TYPES)) {
        expect(sourceType.id).toBe(key)
        expect(sourceType.name).toBeDefined()
        expect(sourceType.icon).toBeDefined()
        expect(Array.isArray(sourceType.fields)).toBe(true)
        expect(sourceType.fields.length).toBeGreaterThan(0)
      }
    })

    it('should have correct fields for book', () => {
      expect(SOURCE_TYPES.book.fields).toContain('authors')
      expect(SOURCE_TYPES.book.fields).toContain('title')
      expect(SOURCE_TYPES.book.fields).toContain('publisher')
      expect(SOURCE_TYPES.book.fields).toContain('year')
    })

    it('should have correct fields for journal', () => {
      expect(SOURCE_TYPES.journal.fields).toContain('journalName')
      expect(SOURCE_TYPES.journal.fields).toContain('volume')
      expect(SOURCE_TYPES.journal.fields).toContain('issue')
      expect(SOURCE_TYPES.journal.fields).toContain('pages')
    })

    it('should have correct fields for website', () => {
      expect(SOURCE_TYPES.website.fields).toContain('websiteName')
      expect(SOURCE_TYPES.website.fields).toContain('url')
      expect(SOURCE_TYPES.website.fields).toContain('accessDate')
    })

    it('should have correct fields for thesis', () => {
      expect(SOURCE_TYPES.thesis.fields).toContain('thesisType')
      expect(SOURCE_TYPES.thesis.fields).toContain('university')
    })

    it('should have correct fields for chapter', () => {
      expect(SOURCE_TYPES.chapter.fields).toContain('chapterTitle')
      expect(SOURCE_TYPES.chapter.fields).toContain('editors')
      expect(SOURCE_TYPES.chapter.fields).toContain('bookTitle')
    })
  })

  describe('parseAuthors', () => {
    it('should return empty array for empty string', () => {
      expect(parseAuthors('')).toEqual([])
      expect(parseAuthors('   ')).toEqual([])
    })

    it('should parse single author with two names', () => {
      const result = parseAuthors('John Smith')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
    })

    it('should parse single author with single name', () => {
      const result = parseAuthors('Madonna')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ firstName: '', lastName: 'Madonna' })
    })

    it('should parse single author with middle name', () => {
      const result = parseAuthors('John Michael Smith')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Smith',
      })
    })

    it('should parse single author with multiple middle names', () => {
      const result = parseAuthors('John Michael David Smith')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        firstName: 'John',
        middleName: 'Michael David',
        lastName: 'Smith',
      })
    })

    it('should parse multiple authors separated by comma', () => {
      const result = parseAuthors('John Smith, Jane Doe')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    })

    it('should parse multiple authors separated by semicolon', () => {
      const result = parseAuthors('John Smith; Jane Doe')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    })

    it('should parse multiple authors separated by ampersand', () => {
      const result = parseAuthors('John Smith & Jane Doe')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    })

    it('should parse multiple authors separated by "and"', () => {
      const result = parseAuthors('John Smith and Jane Doe')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    })

    it('should parse three authors with mixed separators', () => {
      const result = parseAuthors('John Smith, Jane Doe and Bob Wilson')
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
      expect(result[2]).toEqual({ firstName: 'Bob', lastName: 'Wilson' })
    })

    it('should handle extra whitespace', () => {
      const result = parseAuthors('  John   Smith  ,   Jane   Doe  ')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    })

    it('should handle case-insensitive "and"', () => {
      const result = parseAuthors('John Smith AND Jane Doe')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ firstName: 'John', lastName: 'Smith' })
      expect(result[1]).toEqual({ firstName: 'Jane', lastName: 'Doe' })
    })
  })

  describe('createEmptySourceData', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should create empty source data with default type book', () => {
      const result = createEmptySourceData()
      expect(result.sourceType).toBe('book')
    })

    it('should create empty source data with specified source type', () => {
      const result = createEmptySourceData('journal')
      expect(result.sourceType).toBe('journal')
    })

    it('should have current year as default year', () => {
      const result = createEmptySourceData()
      expect(result.year).toBe('2024')
    })

    it('should have empty authors array', () => {
      const result = createEmptySourceData()
      expect(result.authors).toEqual([])
    })

    it('should have empty title', () => {
      const result = createEmptySourceData()
      expect(result.title).toBe('')
    })

    it('should have all fields initialized', () => {
      const result = createEmptySourceData()
      expect(result.url).toBe('')
      expect(result.doi).toBe('')
      expect(result.accessDate).toBe('')
      expect(result.publishDate).toBe('')
      expect(result.pages).toBe('')
      expect(result.publisher).toBe('')
      expect(result.city).toBe('')
      expect(result.edition).toBe('')
      expect(result.journalName).toBe('')
      expect(result.volume).toBe('')
      expect(result.issue).toBe('')
      expect(result.websiteName).toBe('')
      expect(result.newspaperName).toBe('')
      expect(result.platform).toBe('')
      expect(result.conferenceName).toBe('')
      expect(result.thesisType).toBe('doctoral')
      expect(result.university).toBe('')
      expect(result.organization).toBe('')
      expect(result.reportNumber).toBe('')
      expect(result.chapterTitle).toBe('')
      expect(result.editors).toEqual([])
      expect(result.bookTitle).toBe('')
    })

    it('should create empty data for all source types', () => {
      const sourceTypes: SourceTypeId[] = [
        'book',
        'journal',
        'website',
        'newspaper',
        'video',
        'conference',
        'thesis',
        'report',
        'chapter',
      ]

      for (const type of sourceTypes) {
        const result = createEmptySourceData(type)
        expect(result.sourceType).toBe(type)
        expect(result.authors).toEqual([])
        expect(result.title).toBe('')
      }
    })
  })

  describe('validateSourceData', () => {
    it('should return error when title is missing', () => {
      const data = createTestSourceData({ title: '' })
      const errors = validateSourceData(data)
      expect(errors).toContain('Title is required')
    })

    it('should return error when title is only whitespace', () => {
      const data = createTestSourceData({ title: '   ' })
      const errors = validateSourceData(data)
      expect(errors).toContain('Title is required')
    })

    it('should not return title error when title is provided', () => {
      const data = createTestSourceData({ title: 'Valid Title' })
      const errors = validateSourceData(data)
      expect(errors).not.toContain('Title is required')
    })

    it('should require URL for website sources', () => {
      const data = createTestSourceData({
        sourceType: 'website',
        title: 'Website Title',
        url: '',
      })
      const errors = validateSourceData(data)
      expect(errors).toContain('URL is required for website sources')
    })

    it('should not require URL error when website has URL', () => {
      const data = createTestSourceData({
        sourceType: 'website',
        title: 'Website Title',
        url: 'https://example.com',
      })
      const errors = validateSourceData(data)
      expect(errors).not.toContain('URL is required for website sources')
    })

    it('should require journal name for journal sources', () => {
      const data = createTestSourceData({
        sourceType: 'journal',
        title: 'Article Title',
        journalName: '',
      })
      const errors = validateSourceData(data)
      expect(errors).toContain('Journal name is required')
    })

    it('should not require journal name error when provided', () => {
      const data = createTestSourceData({
        sourceType: 'journal',
        title: 'Article Title',
        journalName: 'Nature',
      })
      const errors = validateSourceData(data)
      expect(errors).not.toContain('Journal name is required')
    })

    it('should require newspaper name for newspaper sources', () => {
      const data = createTestSourceData({
        sourceType: 'newspaper',
        title: 'Article Title',
        newspaperName: '',
      })
      const errors = validateSourceData(data)
      expect(errors).toContain('Newspaper name is required')
    })

    it('should require URL for video sources', () => {
      const data = createTestSourceData({
        sourceType: 'video',
        title: 'Video Title',
        url: '',
      })
      const errors = validateSourceData(data)
      expect(errors).toContain('Video URL is required')
    })

    it('should require university for thesis sources', () => {
      const data = createTestSourceData({
        sourceType: 'thesis',
        title: 'Thesis Title',
        university: '',
      })
      const errors = validateSourceData(data)
      expect(errors).toContain('University is required for thesis')
    })

    it('should return empty array for valid book data', () => {
      const data = createTestSourceData({
        sourceType: 'book',
        title: 'Book Title',
      })
      const errors = validateSourceData(data)
      expect(errors).toHaveLength(0)
    })

    it('should return multiple errors when multiple validations fail', () => {
      const data = createTestSourceData({
        sourceType: 'website',
        title: '',
        url: '',
      })
      const errors = validateSourceData(data)
      expect(errors.length).toBeGreaterThanOrEqual(2)
      expect(errors).toContain('Title is required')
      expect(errors).toContain('URL is required for website sources')
    })
  })

  describe('formatCitationWithHtml', () => {
    it('should convert asterisks to em tags', () => {
      const result = formatCitationWithHtml('This is *italic* text')
      expect(result).toBe('This is <em>italic</em> text')
    })

    it('should convert multiple italic sections', () => {
      const result = formatCitationWithHtml('*First* and *second* italic')
      expect(result).toBe('<em>First</em> and <em>second</em> italic')
    })

    it('should return text unchanged if no asterisks', () => {
      const result = formatCitationWithHtml('Plain text without formatting')
      expect(result).toBe('Plain text without formatting')
    })

    it('should handle citation with journal name', () => {
      const citation = 'Smith, J. (2024). Title. *Nature*, 12(3), 45-67.'
      const result = formatCitationWithHtml(citation)
      expect(result).toBe('Smith, J. (2024). Title. <em>Nature</em>, 12(3), 45-67.')
    })

    it('should handle empty string', () => {
      expect(formatCitationWithHtml('')).toBe('')
    })

    it('should handle book title with edition', () => {
      const citation = 'Smith, J. (2024). *Introduction to Testing* (3rd ed.). Publisher.'
      const result = formatCitationWithHtml(citation)
      expect(result).toBe(
        'Smith, J. (2024). <em>Introduction to Testing</em> (3rd ed.). Publisher.'
      )
    })
  })

  describe('formatCitationAsPlainText', () => {
    it('should remove asterisks', () => {
      const result = formatCitationAsPlainText('This is *italic* text')
      expect(result).toBe('This is italic text')
    })

    it('should remove multiple asterisks', () => {
      const result = formatCitationAsPlainText('*First* and *second* italic')
      expect(result).toBe('First and second italic')
    })

    it('should return text unchanged if no asterisks', () => {
      const result = formatCitationAsPlainText('Plain text')
      expect(result).toBe('Plain text')
    })

    it('should handle empty string', () => {
      expect(formatCitationAsPlainText('')).toBe('')
    })

    it('should handle complex citation', () => {
      const citation = 'Smith, J. (2024). Title. *Nature*, *12*(3), 45-67.'
      const result = formatCitationAsPlainText(citation)
      expect(result).toBe('Smith, J. (2024). Title. Nature, 12(3), 45-67.')
    })
  })

  describe('getFieldLabel', () => {
    it('should return "Author(s)" for authors field', () => {
      expect(getFieldLabel('authors')).toBe('Author(s)')
    })

    it('should return "Title" for title field', () => {
      expect(getFieldLabel('title')).toBe('Title')
    })

    it('should return "Journal Name" for journalName field', () => {
      expect(getFieldLabel('journalName')).toBe('Journal Name')
    })

    it('should return "Website Name" for websiteName field', () => {
      expect(getFieldLabel('websiteName')).toBe('Website Name')
    })

    it('should return "DOI" for doi field', () => {
      expect(getFieldLabel('doi')).toBe('DOI')
    })

    it('should return "URL" for url field', () => {
      expect(getFieldLabel('url')).toBe('URL')
    })

    it('should return "Access Date" for accessDate field', () => {
      expect(getFieldLabel('accessDate')).toBe('Access Date')
    })

    it('should return "Page(s)" for pages field', () => {
      expect(getFieldLabel('pages')).toBe('Page(s)')
    })

    it('should return "Editor(s)" for editors field', () => {
      expect(getFieldLabel('editors')).toBe('Editor(s)')
    })

    it('should return "Thesis Type" for thesisType field', () => {
      expect(getFieldLabel('thesisType')).toBe('Thesis Type')
    })

    it('should return capitalized field name for unknown fields', () => {
      expect(getFieldLabel('unknownField')).toBe('UnknownField')
    })

    it('should return correct labels for all known fields', () => {
      const knownFields = [
        'authors',
        'title',
        'year',
        'url',
        'doi',
        'accessDate',
        'publishDate',
        'pages',
        'publisher',
        'city',
        'edition',
        'journalName',
        'volume',
        'issue',
        'websiteName',
        'newspaperName',
        'platform',
        'conferenceName',
        'thesisType',
        'university',
        'organization',
        'reportNumber',
        'chapterTitle',
        'editors',
        'bookTitle',
      ]

      for (const field of knownFields) {
        const label = getFieldLabel(field)
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getFieldPlaceholder', () => {
    it('should return placeholder for authors field', () => {
      expect(getFieldPlaceholder('authors')).toBe('e.g., John Smith, Jane Doe')
    })

    it('should return placeholder for title field', () => {
      expect(getFieldPlaceholder('title')).toBe('Enter the title')
    })

    it('should return placeholder for url field', () => {
      expect(getFieldPlaceholder('url')).toBe('https://example.com')
    })

    it('should return placeholder for doi field', () => {
      expect(getFieldPlaceholder('doi')).toBe('e.g., 10.1000/xyz123')
    })

    it('should return placeholder for journalName field', () => {
      expect(getFieldPlaceholder('journalName')).toBe('e.g., Nature')
    })

    it('should return placeholder for publisher field', () => {
      expect(getFieldPlaceholder('publisher')).toBe('e.g., Oxford University Press')
    })

    it('should return placeholder for pages field', () => {
      expect(getFieldPlaceholder('pages')).toBe('e.g., 15-25 or 42')
    })

    it('should return placeholder for university field', () => {
      expect(getFieldPlaceholder('university')).toBe('e.g., Harvard University')
    })

    it('should return empty string for unknown fields', () => {
      expect(getFieldPlaceholder('unknownField')).toBe('')
    })

    it('should return placeholder for platform field', () => {
      expect(getFieldPlaceholder('platform')).toBe('e.g., YouTube')
    })
  })

  describe('isFieldRequired', () => {
    it('should return true for title on book', () => {
      expect(isFieldRequired('book', 'title')).toBe(true)
    })

    it('should return false for publisher on book', () => {
      expect(isFieldRequired('book', 'publisher')).toBe(false)
    })

    it('should return true for journalName on journal', () => {
      expect(isFieldRequired('journal', 'journalName')).toBe(true)
    })

    it('should return true for title on journal', () => {
      expect(isFieldRequired('journal', 'title')).toBe(true)
    })

    it('should return true for url on website', () => {
      expect(isFieldRequired('website', 'url')).toBe(true)
    })

    it('should return true for url on video', () => {
      expect(isFieldRequired('video', 'url')).toBe(true)
    })

    it('should return true for newspaperName on newspaper', () => {
      expect(isFieldRequired('newspaper', 'newspaperName')).toBe(true)
    })

    it('should return true for conferenceName on conference', () => {
      expect(isFieldRequired('conference', 'conferenceName')).toBe(true)
    })

    it('should return true for university on thesis', () => {
      expect(isFieldRequired('thesis', 'university')).toBe(true)
    })

    it('should return true for bookTitle on chapter', () => {
      expect(isFieldRequired('chapter', 'bookTitle')).toBe(true)
    })

    it('should return false for optional fields', () => {
      expect(isFieldRequired('book', 'year')).toBe(false)
      expect(isFieldRequired('book', 'edition')).toBe(false)
      expect(isFieldRequired('journal', 'volume')).toBe(false)
      expect(isFieldRequired('journal', 'issue')).toBe(false)
    })
  })

  describe('generateCitation', () => {
    describe('APA style', () => {
      describe('book citations', () => {
        it('should generate book citation with single author', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            authors: [createAuthor('John', 'Smith')],
            title: 'Introduction to Testing',
            year: '2024',
            publisher: 'Academic Press',
          })

          const result = generateCitation(data, 'apa')
          expect(result.style).toBe('apa')
          expect(result.sourceType).toBe('book')
          expect(result.fullCitation).toContain('Smith, J.')
          expect(result.fullCitation).toContain('(2024)')
          expect(result.fullCitation).toContain('*Introduction to Testing*')
          expect(result.fullCitation).toContain('Academic Press')
          expect(result.inTextCitation).toBe('(Smith, 2024)')
        })

        it('should generate book citation with two authors', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            authors: [createAuthor('John', 'Smith'), createAuthor('Jane', 'Doe')],
            title: 'Collaborative Testing',
            year: '2024',
            publisher: 'Academic Press',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Smith, J., & Doe, J.')
          expect(result.inTextCitation).toBe('(Smith & Doe, 2024)')
        })

        it('should generate book citation with three authors', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            authors: [
              createAuthor('John', 'Smith'),
              createAuthor('Jane', 'Doe'),
              createAuthor('Bob', 'Wilson'),
            ],
            title: 'Team Testing',
            year: '2024',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Smith, J., Doe, J., & Wilson, B.')
          expect(result.inTextCitation).toBe('(Smith et al., 2024)')
        })

        it('should generate book citation with edition', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            title: 'Testing Guide',
            year: '2024',
            edition: '3rd',
            publisher: 'Publisher',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('(3rd ed.)')
        })

        it('should generate book citation with DOI', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            title: 'Testing Guide',
            year: '2024',
            doi: '10.1000/test123',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('https://doi.org/10.1000/test123')
        })

        it('should handle missing year with n.d.', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            title: 'Unknown Date Book',
            year: undefined,
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('(n.d.)')
          expect(result.inTextCitation).toContain('n.d.')
        })

        it('should handle author with middle name', () => {
          const data = createTestSourceData({
            sourceType: 'book',
            authors: [createAuthor('John', 'Smith', 'Michael')],
            title: 'Test Book',
            year: '2024',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Smith, J. M.')
        })
      })

      describe('journal citations', () => {
        it('should generate journal citation', () => {
          const data = createTestSourceData({
            sourceType: 'journal',
            authors: [createAuthor('John', 'Smith')],
            title: 'Testing in Software',
            year: '2024',
            journalName: 'Journal of Testing',
            volume: '12',
            issue: '3',
            pages: '45-67',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Testing in Software')
          expect(result.fullCitation).toContain('*Journal of Testing*')
          expect(result.fullCitation).toContain('*12*')
          expect(result.fullCitation).toContain('(3)')
          expect(result.fullCitation).toContain('45-67')
        })

        it('should generate journal citation with DOI', () => {
          const data = createTestSourceData({
            sourceType: 'journal',
            title: 'Article',
            journalName: 'Journal',
            doi: '10.1000/article',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('https://doi.org/10.1000/article')
        })

        it('should generate journal citation with URL when no DOI', () => {
          const data = createTestSourceData({
            sourceType: 'journal',
            title: 'Article',
            journalName: 'Journal',
            url: 'https://example.com/article',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('https://example.com/article')
        })
      })

      describe('website citations', () => {
        it('should generate website citation', () => {
          const data = createTestSourceData({
            sourceType: 'website',
            authors: [createAuthor('John', 'Smith')],
            title: 'Online Resource',
            websiteName: 'Example Site',
            url: 'https://example.com',
            accessDate: '2024-06-15',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Online Resource')
          expect(result.fullCitation).toContain('*Example Site*')
          expect(result.fullCitation).toContain('https://example.com')
          expect(result.fullCitation).toContain('Retrieved')
        })

        it('should generate website citation without author', () => {
          const data = createTestSourceData({
            sourceType: 'website',
            authors: [],
            title: 'Anonymous Page',
            websiteName: 'Example Site',
            url: 'https://example.com',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Anonymous Page')
        })
      })

      describe('newspaper citations', () => {
        it('should generate newspaper citation', () => {
          const data = createTestSourceData({
            sourceType: 'newspaper',
            authors: [createAuthor('John', 'Smith')],
            title: 'Breaking News',
            newspaperName: 'Daily News',
            publishDate: '2024-06-15',
            pages: 'A1',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Breaking News')
          expect(result.fullCitation).toContain('*Daily News*')
          expect(result.fullCitation).toContain('A1')
        })
      })

      describe('video citations', () => {
        it('should generate video citation', () => {
          const data = createTestSourceData({
            sourceType: 'video',
            authors: [createAuthor('John', 'Smith')],
            title: 'Tutorial Video',
            platform: 'YouTube',
            url: 'https://youtube.com/watch?v=123',
            publishDate: '2024-06-15',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('*Tutorial Video*')
          expect(result.fullCitation).toContain('[Video]')
          expect(result.fullCitation).toContain('YouTube')
        })
      })

      describe('conference citations', () => {
        it('should generate conference citation', () => {
          const data = createTestSourceData({
            sourceType: 'conference',
            authors: [createAuthor('John', 'Smith')],
            title: 'Research Findings',
            conferenceName: 'Annual Conference 2024',
            year: '2024',
            city: 'New York',
            pages: '100-110',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Research Findings')
          expect(result.fullCitation).toContain('*Annual Conference 2024*')
          expect(result.fullCitation).toContain('(pp. 100-110)')
        })
      })

      describe('thesis citations', () => {
        it('should generate doctoral thesis citation', () => {
          const data = createTestSourceData({
            sourceType: 'thesis',
            authors: [createAuthor('John', 'Smith')],
            title: 'Research on Testing',
            thesisType: 'doctoral',
            university: 'Harvard University',
            year: '2024',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('*Research on Testing*')
          expect(result.fullCitation).toContain('[Doctoral dissertation')
          expect(result.fullCitation).toContain('Harvard University')
        })

        it('should generate masters thesis citation', () => {
          const data = createTestSourceData({
            sourceType: 'thesis',
            authors: [createAuthor('John', 'Smith')],
            title: 'Testing Study',
            thesisType: 'masters',
            university: 'MIT',
            year: '2024',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain("[Master's thesis")
        })
      })

      describe('report citations', () => {
        it('should generate report citation', () => {
          const data = createTestSourceData({
            sourceType: 'report',
            authors: [createAuthor('John', 'Smith')],
            title: 'Annual Report',
            organization: 'Research Institute',
            reportNumber: 'RI-2024-001',
            year: '2024',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('*Annual Report*')
          expect(result.fullCitation).toContain('(Report No. RI-2024-001)')
          expect(result.fullCitation).toContain('Research Institute')
        })
      })

      describe('chapter citations', () => {
        it('should generate chapter citation', () => {
          const data = createTestSourceData({
            sourceType: 'chapter',
            authors: [createAuthor('John', 'Smith')],
            chapterTitle: 'Testing Fundamentals',
            editors: [createAuthor('Jane', 'Doe')],
            bookTitle: 'Handbook of Testing',
            publisher: 'Academic Press',
            year: '2024',
            pages: '50-75',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('Testing Fundamentals')
          expect(result.fullCitation).toContain('In Doe, J.')
          expect(result.fullCitation).toContain('(Ed.)')
          expect(result.fullCitation).toContain('*Handbook of Testing*')
          expect(result.fullCitation).toContain('(pp. 50-75)')
        })

        it('should handle multiple editors', () => {
          const data = createTestSourceData({
            sourceType: 'chapter',
            authors: [createAuthor('John', 'Smith')],
            chapterTitle: 'Chapter Title',
            editors: [createAuthor('Jane', 'Doe'), createAuthor('Bob', 'Wilson')],
            bookTitle: 'Edited Book',
            year: '2024',
          })

          const result = generateCitation(data, 'apa')
          expect(result.fullCitation).toContain('(Eds.)')
        })
      })
    })

    describe('MLA style', () => {
      it('should generate book citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith')],
          title: 'Testing Guide',
          publisher: 'Publisher',
          year: '2024',
        })

        const result = generateCitation(data, 'mla')
        expect(result.style).toBe('mla')
        expect(result.fullCitation).toContain('Smith, John')
        expect(result.fullCitation).toContain('*Testing Guide*')
        expect(result.fullCitation).toContain('Publisher')
        expect(result.fullCitation).toContain('2024')
      })

      it('should format first author differently from others', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith'), createAuthor('Jane', 'Doe')],
          title: 'Collaborative Work',
          year: '2024',
        })

        const result = generateCitation(data, 'mla')
        // First author: Last, First; Second author: First Last
        expect(result.fullCitation).toContain('Smith, John')
        expect(result.fullCitation).toContain('Jane Doe')
      })

      it('should use et al. for 3+ authors', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [
            createAuthor('John', 'Smith'),
            createAuthor('Jane', 'Doe'),
            createAuthor('Bob', 'Wilson'),
          ],
          title: 'Team Book',
          year: '2024',
        })

        const result = generateCitation(data, 'mla')
        expect(result.fullCitation).toContain('Smith, John, et al.')
      })

      it('should generate journal citation with quotes around title', () => {
        const data = createTestSourceData({
          sourceType: 'journal',
          title: 'Article Title',
          journalName: 'Journal Name',
          year: '2024',
        })

        const result = generateCitation(data, 'mla')
        expect(result.fullCitation).toContain('"Article Title."')
      })

      it('should include page number in in-text citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith')],
          title: 'Book',
          pages: '45',
        })

        const result = generateCitation(data, 'mla')
        expect(result.inTextCitation).toContain('Smith')
        expect(result.inTextCitation).toContain('45')
      })

      it('should generate video citation with uploaded by', () => {
        const data = createTestSourceData({
          sourceType: 'video',
          authors: [createAuthor('John', 'Smith')],
          title: 'Video Title',
          platform: 'YouTube',
          publishDate: '2024-06-15',
        })

        const result = generateCitation(data, 'mla')
        expect(result.fullCitation).toContain('"Video Title."')
        expect(result.fullCitation).toContain('*YouTube*')
        expect(result.fullCitation).toContain('uploaded by John Smith')
      })
    })

    describe('Chicago style', () => {
      it('should generate book citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith')],
          title: 'Testing History',
          publisher: 'Publisher',
          city: 'Chicago',
          year: '2024',
        })

        const result = generateCitation(data, 'chicago')
        expect(result.style).toBe('chicago')
        expect(result.fullCitation).toContain('Smith, John')
        expect(result.fullCitation).toContain('*Testing History*')
        expect(result.fullCitation).toContain('Chicago:')
        expect(result.fullCitation).toContain('Publisher')
      })

      it('should format two authors with and', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith'), createAuthor('Jane', 'Doe')],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'chicago')
        expect(result.fullCitation).toContain('Smith, John and Jane Doe')
      })

      it('should use et al. for 4+ authors', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [
            createAuthor('John', 'Smith'),
            createAuthor('Jane', 'Doe'),
            createAuthor('Bob', 'Wilson'),
            createAuthor('Alice', 'Brown'),
          ],
          title: 'Team Book',
          year: '2024',
        })

        const result = generateCitation(data, 'chicago')
        expect(result.fullCitation).toContain('Smith, John et al.')
      })

      it('should include three authors in in-text citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [
            createAuthor('John', 'Smith'),
            createAuthor('Jane', 'Doe'),
            createAuthor('Bob', 'Wilson'),
          ],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'chicago')
        expect(result.inTextCitation).toContain('Smith')
        expect(result.inTextCitation).toContain('Doe')
        expect(result.inTextCitation).toContain('Wilson')
      })

      it('should generate conference paper as presented at', () => {
        const data = createTestSourceData({
          sourceType: 'conference',
          title: 'Research Paper',
          conferenceName: 'Annual Conference',
          city: 'Boston',
          year: '2024',
        })

        const result = generateCitation(data, 'chicago')
        expect(result.fullCitation).toContain('Paper presented at Annual Conference')
      })

      it('should generate thesis with PhD diss.', () => {
        const data = createTestSourceData({
          sourceType: 'thesis',
          title: 'Dissertation',
          thesisType: 'doctoral',
          university: 'University',
          year: '2024',
        })

        const result = generateCitation(data, 'chicago')
        expect(result.fullCitation).toContain('PhD diss.')
      })
    })

    describe('Harvard style', () => {
      it('should generate book citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith')],
          title: 'Testing Methodology',
          publisher: 'Publisher',
          city: 'London',
          year: '2024',
        })

        const result = generateCitation(data, 'harvard')
        expect(result.style).toBe('harvard')
        expect(result.fullCitation).toContain('Smith, J.')
        expect(result.fullCitation).toContain('(2024)')
        expect(result.fullCitation).toContain('*Testing Methodology*')
        expect(result.fullCitation).toContain('London:')
      })

      it('should format authors with initials and no spaces', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith', 'Michael')],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'harvard')
        expect(result.fullCitation).toContain('Smith, J.M.')
      })

      it('should use and between authors', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith'), createAuthor('Jane', 'Doe')],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'harvard')
        expect(result.fullCitation).toContain('Smith, J. and Doe, J.')
      })

      it('should generate journal citation with single quotes', () => {
        const data = createTestSourceData({
          sourceType: 'journal',
          title: 'Article Title',
          journalName: 'Journal',
          year: '2024',
        })

        const result = generateCitation(data, 'harvard')
        expect(result.fullCitation).toContain("'Article Title'")
      })

      it('should include Available at for URLs', () => {
        const data = createTestSourceData({
          sourceType: 'website',
          title: 'Web Page',
          url: 'https://example.com',
          year: '2024',
        })

        const result = generateCitation(data, 'harvard')
        expect(result.fullCitation).toContain('Available at:')
      })

      it('should generate video citation with title first', () => {
        const data = createTestSourceData({
          sourceType: 'video',
          title: 'Video Title',
          platform: 'YouTube',
          year: '2024',
        })

        const result = generateCitation(data, 'harvard')
        expect(result.fullCitation).toMatch(/^\*Video Title\*/)
      })
    })

    describe('IEEE style', () => {
      it('should generate numbered citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith')],
          title: 'Engineering Book',
          publisher: 'Publisher',
          city: 'New York',
          year: '2024',
        })

        const result = generateCitation(data, 'ieee', 1)
        expect(result.style).toBe('ieee')
        expect(result.fullCitation).toMatch(/^\[1\]/)
        expect(result.inTextCitation).toBe('[1]')
      })

      it('should format authors as F. M. Last', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith', 'Michael')],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'ieee')
        expect(result.fullCitation).toContain('J. M. Smith')
      })

      it('should use different reference numbers', () => {
        const data = createTestSourceData()

        const result1 = generateCitation(data, 'ieee', 1)
        const result5 = generateCitation(data, 'ieee', 5)

        expect(result1.fullCitation).toMatch(/^\[1\]/)
        expect(result1.inTextCitation).toBe('[1]')
        expect(result5.fullCitation).toMatch(/^\[5\]/)
        expect(result5.inTextCitation).toBe('[5]')
      })

      it('should generate journal citation with vol. and no.', () => {
        const data = createTestSourceData({
          sourceType: 'journal',
          title: 'Article',
          journalName: 'IEEE Trans.',
          volume: '25',
          issue: '3',
          pages: '100-110',
          year: '2024',
        })

        const result = generateCitation(data, 'ieee')
        expect(result.fullCitation).toContain('vol. 25')
        expect(result.fullCitation).toContain('no. 3')
        expect(result.fullCitation).toContain('pp. 100-110')
      })

      it('should use et al. for 7+ authors', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [
            createAuthor('A', 'One'),
            createAuthor('B', 'Two'),
            createAuthor('C', 'Three'),
            createAuthor('D', 'Four'),
            createAuthor('E', 'Five'),
            createAuthor('F', 'Six'),
            createAuthor('G', 'Seven'),
          ],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'ieee')
        expect(result.fullCitation).toContain('et al.')
      })

      it('should generate website citation with Online', () => {
        const data = createTestSourceData({
          sourceType: 'website',
          title: 'Online Resource',
          websiteName: 'Site',
          url: 'https://example.com',
        })

        const result = generateCitation(data, 'ieee')
        expect(result.fullCitation).toContain('[Online]')
        expect(result.fullCitation).toContain('Available:')
      })

      it('should generate thesis with Ph.D. dissertation', () => {
        const data = createTestSourceData({
          sourceType: 'thesis',
          title: 'Dissertation',
          thesisType: 'doctoral',
          university: 'MIT',
          year: '2024',
        })

        const result = generateCitation(data, 'ieee')
        expect(result.fullCitation).toContain('Ph.D. dissertation')
      })

      it('should generate thesis with M.S. thesis', () => {
        const data = createTestSourceData({
          sourceType: 'thesis',
          title: 'Thesis',
          thesisType: 'masters',
          university: 'Stanford',
          year: '2024',
        })

        const result = generateCitation(data, 'ieee')
        expect(result.fullCitation).toContain('M.S. thesis')
      })
    })

    describe('Vancouver style', () => {
      it('should generate numbered citation', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith')],
          title: 'Medical Testing',
          publisher: 'Publisher',
          city: 'Boston',
          year: '2024',
        })

        const result = generateCitation(data, 'vancouver', 1)
        expect(result.style).toBe('vancouver')
        expect(result.fullCitation).toMatch(/^1\./)
        expect(result.inTextCitation).toBe('(1)')
      })

      it('should format authors as Last FM (no periods)', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [createAuthor('John', 'Smith', 'Michael')],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('Smith JM')
      })

      it('should use different reference numbers', () => {
        const data = createTestSourceData()

        const result3 = generateCitation(data, 'vancouver', 3)
        const result10 = generateCitation(data, 'vancouver', 10)

        expect(result3.fullCitation).toMatch(/^3\./)
        expect(result3.inTextCitation).toBe('(3)')
        expect(result10.fullCitation).toMatch(/^10\./)
        expect(result10.inTextCitation).toBe('(10)')
      })

      it('should generate journal citation with semicolon format', () => {
        const data = createTestSourceData({
          sourceType: 'journal',
          title: 'Article',
          journalName: 'Medical Journal',
          volume: '50',
          issue: '2',
          pages: '25-30',
          year: '2024',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('2024;50(2):25-30')
      })

      it('should use et al. for 7+ authors', () => {
        const data = createTestSourceData({
          sourceType: 'book',
          authors: [
            createAuthor('A', 'One'),
            createAuthor('B', 'Two'),
            createAuthor('C', 'Three'),
            createAuthor('D', 'Four'),
            createAuthor('E', 'Five'),
            createAuthor('F', 'Six'),
            createAuthor('G', 'Seven'),
          ],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('et al.')
      })

      it('should generate website citation with [Internet]', () => {
        const data = createTestSourceData({
          sourceType: 'website',
          title: 'Health Resource',
          websiteName: 'WHO',
          url: 'https://who.int',
          accessDate: '2024-06-15',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('[Internet]')
        expect(result.fullCitation).toContain('[cited')
        expect(result.fullCitation).toContain('Available from:')
      })

      it('should generate thesis with [dissertation] or [thesis]', () => {
        const doctoralData = createTestSourceData({
          sourceType: 'thesis',
          title: 'Dissertation',
          thesisType: 'doctoral',
          university: 'University',
          year: '2024',
        })

        const mastersData = createTestSourceData({
          sourceType: 'thesis',
          title: 'Thesis',
          thesisType: 'masters',
          university: 'University',
          year: '2024',
        })

        const doctoralResult = generateCitation(doctoralData, 'vancouver')
        const mastersResult = generateCitation(mastersData, 'vancouver')

        expect(doctoralResult.fullCitation).toContain('[dissertation]')
        expect(mastersResult.fullCitation).toContain('[thesis]')
      })

      it('should generate newspaper with Sect. for pages', () => {
        const data = createTestSourceData({
          sourceType: 'newspaper',
          title: 'News Article',
          newspaperName: 'Daily Paper',
          publishDate: '2024-06-15',
          pages: 'A1',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain(';Sect. A1')
      })

      it('should generate video with [Video]', () => {
        const data = createTestSourceData({
          sourceType: 'video',
          title: 'Medical Video',
          platform: 'YouTube',
          url: 'https://youtube.com',
          publishDate: '2024-06-15',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('[Video]')
        expect(result.fullCitation).toContain('Available from:')
      })

      it('should generate chapter with In: and editors', () => {
        const data = createTestSourceData({
          sourceType: 'chapter',
          authors: [createAuthor('John', 'Smith')],
          chapterTitle: 'Chapter Title',
          editors: [createAuthor('Jane', 'Doe')],
          bookTitle: 'Medical Book',
          publisher: 'Publisher',
          city: 'Boston',
          year: '2024',
          pages: '50-75',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('In:')
        expect(result.fullCitation).toContain('Doe J, editor')
        expect(result.fullCitation).toContain('p. 50-75')
      })

      it('should handle multiple editors', () => {
        const data = createTestSourceData({
          sourceType: 'chapter',
          chapterTitle: 'Chapter',
          editors: [createAuthor('Jane', 'Doe'), createAuthor('Bob', 'Wilson')],
          bookTitle: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'vancouver')
        expect(result.fullCitation).toContain('editors')
      })
    })

    describe('default style fallback', () => {
      it('should default to APA style for unknown style', () => {
        const data = createTestSourceData({
          title: 'Test Title',
          year: '2024',
        })

        // Cast to bypass TypeScript checking for testing purposes
        const result = generateCitation(data, 'unknown' as CitationStyleId)
        expect(result.style).toBe('apa')
      })
    })

    describe('edge cases', () => {
      it('should handle empty authors array', () => {
        const data = createTestSourceData({
          authors: [],
          title: 'No Author Book',
          year: '2024',
        })

        const result = generateCitation(data, 'apa')
        expect(result.fullCitation).toContain('No Author Book')
        // Should not crash
      })

      it('should handle very long author list (21+ authors in APA)', () => {
        const authors: Author[] = Array.from({ length: 25 }, (_, i) => ({
          firstName: `Author${i + 1}`,
          lastName: `Last${i + 1}`,
        }))

        const data = createTestSourceData({
          authors,
          title: 'Many Authors Book',
          year: '2024',
        })

        const result = generateCitation(data, 'apa')
        expect(result.fullCitation).toContain('...')
        expect(result.fullCitation).toContain('Last25')
      })

      it('should handle author with only last name', () => {
        const data = createTestSourceData({
          authors: [{ firstName: '', lastName: 'OnlyLast' }],
          title: 'Book',
          year: '2024',
        })

        const result = generateCitation(data, 'apa')
        expect(result.fullCitation).toContain('OnlyLast')
      })

      it('should handle special characters in title', () => {
        const data = createTestSourceData({
          title: 'Testing & Analysis: A "Comprehensive" Guide',
          year: '2024',
        })

        const result = generateCitation(data, 'apa')
        expect(result.fullCitation).toContain('Testing & Analysis')
      })
    })
  })
})
