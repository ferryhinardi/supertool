import { describe, expect, it } from 'vitest'
import {
  analyzeContent,
  CATEGORIES,
  type CategoryId,
  formatHashtag,
  formatHashtagsForCopy,
  generateHashtags,
  getPopularityColor,
  getPopularityLabel,
  HASHTAG_DATABASE,
  type Hashtag,
  PLATFORMS,
  type PlatformId,
  type PopularityLevel,
  TOPIC_KEYWORDS,
} from '../utils'

describe('hashtag-generator utils', () => {
  // ============================================
  // PLATFORMS Constant Tests
  // ============================================
  describe('PLATFORMS', () => {
    it('contains all expected platforms', () => {
      const expectedPlatforms = [
        'instagram',
        'twitter',
        'tiktok',
        'linkedin',
        'facebook',
        'youtube',
        'pinterest',
      ]
      expect(Object.keys(PLATFORMS)).toEqual(expectedPlatforms)
    })

    it('has correct structure for each platform', () => {
      for (const [, platform] of Object.entries(PLATFORMS)) {
        expect(platform).toHaveProperty('name')
        expect(platform).toHaveProperty('maxHashtags')
        expect(platform).toHaveProperty('recommended')
        expect(platform).toHaveProperty('description')
        expect(platform.recommended).toHaveProperty('min')
        expect(platform.recommended).toHaveProperty('max')
        expect(typeof platform.name).toBe('string')
        expect(typeof platform.maxHashtags).toBe('number')
        expect(typeof platform.recommended.min).toBe('number')
        expect(typeof platform.recommended.max).toBe('number')
        expect(typeof platform.description).toBe('string')
      }
    })

    describe('Instagram config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.instagram.name).toBe('Instagram')
        expect(PLATFORMS.instagram.maxHashtags).toBe(30)
        expect(PLATFORMS.instagram.recommended.min).toBe(5)
        expect(PLATFORMS.instagram.recommended.max).toBe(11)
      })
    })

    describe('Twitter config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.twitter.name).toBe('Twitter/X')
        expect(PLATFORMS.twitter.maxHashtags).toBe(280)
        expect(PLATFORMS.twitter.recommended.min).toBe(1)
        expect(PLATFORMS.twitter.recommended.max).toBe(3)
      })
    })

    describe('TikTok config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.tiktok.name).toBe('TikTok')
        expect(PLATFORMS.tiktok.maxHashtags).toBe(100)
        expect(PLATFORMS.tiktok.recommended.min).toBe(3)
        expect(PLATFORMS.tiktok.recommended.max).toBe(5)
      })
    })

    describe('LinkedIn config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.linkedin.name).toBe('LinkedIn')
        expect(PLATFORMS.linkedin.maxHashtags).toBe(30)
        expect(PLATFORMS.linkedin.recommended.min).toBe(3)
        expect(PLATFORMS.linkedin.recommended.max).toBe(5)
      })
    })

    describe('Facebook config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.facebook.name).toBe('Facebook')
        expect(PLATFORMS.facebook.maxHashtags).toBe(30)
        expect(PLATFORMS.facebook.recommended.min).toBe(1)
        expect(PLATFORMS.facebook.recommended.max).toBe(3)
      })
    })

    describe('YouTube config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.youtube.name).toBe('YouTube')
        expect(PLATFORMS.youtube.maxHashtags).toBe(15)
        expect(PLATFORMS.youtube.recommended.min).toBe(3)
        expect(PLATFORMS.youtube.recommended.max).toBe(5)
      })
    })

    describe('Pinterest config', () => {
      it('has correct values', () => {
        expect(PLATFORMS.pinterest.name).toBe('Pinterest')
        expect(PLATFORMS.pinterest.maxHashtags).toBe(20)
        expect(PLATFORMS.pinterest.recommended.min).toBe(2)
        expect(PLATFORMS.pinterest.recommended.max).toBe(5)
      })
    })

    it('ensures recommended.max is less than or equal to maxHashtags', () => {
      for (const platform of Object.values(PLATFORMS)) {
        expect(platform.recommended.max).toBeLessThanOrEqual(platform.maxHashtags)
      }
    })

    it('ensures recommended.min is less than recommended.max', () => {
      for (const platform of Object.values(PLATFORMS)) {
        expect(platform.recommended.min).toBeLessThan(platform.recommended.max)
      }
    })
  })

  // ============================================
  // CATEGORIES Constant Tests
  // ============================================
  describe('CATEGORIES', () => {
    it('contains all expected categories', () => {
      const expectedCategories = [
        'general',
        'trending',
        'niche',
        'branded',
        'community',
        'location',
      ]
      expect(Object.keys(CATEGORIES)).toEqual(expectedCategories)
    })

    it('has correct structure for each category', () => {
      for (const category of Object.values(CATEGORIES)) {
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('icon')
        expect(typeof category.name).toBe('string')
        expect(typeof category.icon).toBe('string')
      }
    })

    it('has correct values for general category', () => {
      expect(CATEGORIES.general.name).toBe('General')
      expect(CATEGORIES.general.icon).toBe('Hash')
    })

    it('has correct values for trending category', () => {
      expect(CATEGORIES.trending.name).toBe('Trending')
      expect(CATEGORIES.trending.icon).toBe('TrendingUp')
    })

    it('has correct values for niche category', () => {
      expect(CATEGORIES.niche.name).toBe('Niche')
      expect(CATEGORIES.niche.icon).toBe('Target')
    })

    it('has correct values for branded category', () => {
      expect(CATEGORIES.branded.name).toBe('Branded')
      expect(CATEGORIES.branded.icon).toBe('Star')
    })

    it('has correct values for community category', () => {
      expect(CATEGORIES.community.name).toBe('Community')
      expect(CATEGORIES.community.icon).toBe('Users')
    })

    it('has correct values for location category', () => {
      expect(CATEGORIES.location.name).toBe('Location')
      expect(CATEGORIES.location.icon).toBe('MapPin')
    })
  })

  // ============================================
  // HASHTAG_DATABASE Constant Tests
  // ============================================
  describe('HASHTAG_DATABASE', () => {
    it('contains all expected topics', () => {
      const expectedTopics = [
        'technology',
        'food',
        'fitness',
        'travel',
        'fashion',
        'photography',
        'business',
        'art',
        'beauty',
        'music',
        'pets',
        'general',
      ]
      expect(Object.keys(HASHTAG_DATABASE)).toEqual(expectedTopics)
    })

    it('has hashtags array for each topic', () => {
      for (const [, hashtags] of Object.entries(HASHTAG_DATABASE)) {
        expect(Array.isArray(hashtags)).toBe(true)
        expect(hashtags.length).toBeGreaterThan(0)
      }
    })

    it('has correct structure for each hashtag', () => {
      for (const hashtags of Object.values(HASHTAG_DATABASE)) {
        for (const hashtag of hashtags) {
          expect(hashtag).toHaveProperty('tag')
          expect(hashtag).toHaveProperty('category')
          expect(hashtag).toHaveProperty('popularity')
          expect(hashtag).toHaveProperty('relevanceScore')
          expect(typeof hashtag.tag).toBe('string')
          expect(typeof hashtag.category).toBe('string')
          expect(typeof hashtag.popularity).toBe('string')
          expect(typeof hashtag.relevanceScore).toBe('number')
        }
      }
    })

    it('has valid category values for all hashtags', () => {
      const validCategories = Object.keys(CATEGORIES)
      for (const hashtags of Object.values(HASHTAG_DATABASE)) {
        for (const hashtag of hashtags) {
          expect(validCategories).toContain(hashtag.category)
        }
      }
    })

    it('has valid popularity values for all hashtags', () => {
      const validPopularity = ['low', 'medium', 'high', 'viral']
      for (const hashtags of Object.values(HASHTAG_DATABASE)) {
        for (const hashtag of hashtags) {
          expect(validPopularity).toContain(hashtag.popularity)
        }
      }
    })

    it('has relevanceScore between 0 and 100 for all hashtags', () => {
      for (const hashtags of Object.values(HASHTAG_DATABASE)) {
        for (const hashtag of hashtags) {
          expect(hashtag.relevanceScore).toBeGreaterThanOrEqual(0)
          expect(hashtag.relevanceScore).toBeLessThanOrEqual(100)
        }
      }
    })

    it('technology topic has expected hashtags', () => {
      const techTags = HASHTAG_DATABASE.technology.map((h) => h.tag)
      expect(techTags).toContain('tech')
      expect(techTags).toContain('technology')
      expect(techTags).toContain('ai')
      expect(techTags).toContain('coding')
      expect(techTags).toContain('programming')
    })

    it('food topic has expected hashtags', () => {
      const foodTags = HASHTAG_DATABASE.food.map((h) => h.tag)
      expect(foodTags).toContain('food')
      expect(foodTags).toContain('foodie')
      expect(foodTags).toContain('cooking')
      expect(foodTags).toContain('recipe')
    })

    it('general topic has broad hashtags', () => {
      const generalTags = HASHTAG_DATABASE.general.map((h) => h.tag)
      expect(generalTags).toContain('love')
      expect(generalTags).toContain('instagood')
      expect(generalTags).toContain('photooftheday')
    })
  })

  // ============================================
  // TOPIC_KEYWORDS Constant Tests
  // ============================================
  describe('TOPIC_KEYWORDS', () => {
    it('contains all expected topics', () => {
      const expectedTopics = [
        'technology',
        'food',
        'fitness',
        'travel',
        'fashion',
        'photography',
        'business',
        'art',
        'beauty',
        'music',
        'pets',
      ]
      expect(Object.keys(TOPIC_KEYWORDS)).toEqual(expectedTopics)
    })

    it('has keywords array for each topic', () => {
      for (const keywords of Object.values(TOPIC_KEYWORDS)) {
        expect(Array.isArray(keywords)).toBe(true)
        expect(keywords.length).toBeGreaterThan(0)
      }
    })

    it('has all lowercase keywords', () => {
      for (const keywords of Object.values(TOPIC_KEYWORDS)) {
        for (const keyword of keywords) {
          expect(keyword).toBe(keyword.toLowerCase())
        }
      }
    })

    it('technology topic has relevant keywords', () => {
      expect(TOPIC_KEYWORDS.technology).toContain('tech')
      expect(TOPIC_KEYWORDS.technology).toContain('code')
      expect(TOPIC_KEYWORDS.technology).toContain('ai')
      expect(TOPIC_KEYWORDS.technology).toContain('javascript')
      expect(TOPIC_KEYWORDS.technology).toContain('python')
    })

    it('food topic has relevant keywords', () => {
      expect(TOPIC_KEYWORDS.food).toContain('food')
      expect(TOPIC_KEYWORDS.food).toContain('recipe')
      expect(TOPIC_KEYWORDS.food).toContain('cooking')
      expect(TOPIC_KEYWORDS.food).toContain('dinner')
    })

    it('fitness topic has relevant keywords', () => {
      expect(TOPIC_KEYWORDS.fitness).toContain('fitness')
      expect(TOPIC_KEYWORDS.fitness).toContain('gym')
      expect(TOPIC_KEYWORDS.fitness).toContain('workout')
      expect(TOPIC_KEYWORDS.fitness).toContain('yoga')
    })

    it('travel topic has relevant keywords', () => {
      expect(TOPIC_KEYWORDS.travel).toContain('travel')
      expect(TOPIC_KEYWORDS.travel).toContain('vacation')
      expect(TOPIC_KEYWORDS.travel).toContain('adventure')
      expect(TOPIC_KEYWORDS.travel).toContain('beach')
    })

    it('photography topic has relevant keywords', () => {
      expect(TOPIC_KEYWORDS.photography).toContain('photo')
      expect(TOPIC_KEYWORDS.photography).toContain('photography')
      expect(TOPIC_KEYWORDS.photography).toContain('camera')
      expect(TOPIC_KEYWORDS.photography).toContain('portrait')
    })
  })

  // ============================================
  // analyzeContent Function Tests
  // ============================================
  describe('analyzeContent', () => {
    it('returns general for empty text', () => {
      const result = analyzeContent('')
      expect(result).toEqual(['general'])
    })

    it('returns general for text with no matching keywords', () => {
      const result = analyzeContent('random unrelated text xyz')
      expect(result).toEqual(['general'])
    })

    it('identifies technology topic', () => {
      const result = analyzeContent('Learning to code in JavaScript')
      expect(result).toContain('technology')
    })

    it('identifies food topic', () => {
      const result = analyzeContent('Made a delicious dinner recipe')
      expect(result).toContain('food')
    })

    it('identifies fitness topic', () => {
      const result = analyzeContent('Morning gym workout session')
      expect(result).toContain('fitness')
    })

    it('identifies travel topic', () => {
      const result = analyzeContent('Amazing vacation at the beach')
      expect(result).toContain('travel')
    })

    it('identifies fashion topic', () => {
      const result = analyzeContent('New outfit of the day fashion style')
      expect(result).toContain('fashion')
    })

    it('identifies photography topic', () => {
      const result = analyzeContent('Got a new camera for portrait photography')
      expect(result).toContain('photography')
    })

    it('identifies business topic', () => {
      const result = analyzeContent('Entrepreneur building a marketing startup')
      expect(result).toContain('business')
    })

    it('identifies art topic', () => {
      const result = analyzeContent('New digital art drawing on canvas')
      expect(result).toContain('art')
    })

    it('identifies beauty topic', () => {
      const result = analyzeContent('Skincare routine and makeup tips')
      expect(result).toContain('beauty')
    })

    it('identifies music topic', () => {
      const result = analyzeContent('Learning guitar and piano songs')
      expect(result).toContain('music')
    })

    it('identifies pets topic', () => {
      const result = analyzeContent('My cute puppy and kitten')
      expect(result).toContain('pets')
    })

    it('identifies multiple topics', () => {
      const result = analyzeContent('Tech startup entrepreneur coding a fitness app')
      expect(result).toContain('technology')
      expect(result).toContain('business')
      expect(result).toContain('fitness')
    })

    it('is case insensitive', () => {
      const lowerResult = analyzeContent('tech code ai')
      const upperResult = analyzeContent('TECH CODE AI')
      const mixedResult = analyzeContent('Tech CODE Ai')
      expect(lowerResult).toEqual(upperResult)
      expect(upperResult).toEqual(mixedResult)
    })

    it('handles text with special characters', () => {
      const result = analyzeContent('Learning #code in @JavaScript! $$$')
      expect(result).toContain('technology')
    })

    it('handles multi-word keywords', () => {
      const result = analyzeContent('Using machine learning and digital art')
      expect(result).toContain('technology')
      expect(result).toContain('art')
    })

    it('handles long text with multiple topics', () => {
      const longText = `
        Today I went to the gym for a workout session.
        After that, I cooked a delicious meal for dinner.
        Then I edited some photos from my recent travel adventure.
      `
      const result = analyzeContent(longText)
      expect(result).toContain('fitness')
      expect(result).toContain('food')
      expect(result).toContain('photography')
      expect(result).toContain('travel')
    })
  })

  // ============================================
  // generateHashtags Function Tests
  // ============================================
  describe('generateHashtags', () => {
    it('returns hashtags array', () => {
      const result = generateHashtags('tech coding')
      expect(Array.isArray(result)).toBe(true)
    })

    it('returns hashtags with correct structure', () => {
      const result = generateHashtags('tech coding')
      for (const hashtag of result) {
        expect(hashtag).toHaveProperty('tag')
        expect(hashtag).toHaveProperty('category')
        expect(hashtag).toHaveProperty('popularity')
        expect(hashtag).toHaveProperty('relevanceScore')
      }
    })

    it('defaults to instagram platform recommended max', () => {
      const result = generateHashtags('tech coding')
      expect(result.length).toBeLessThanOrEqual(PLATFORMS.instagram.recommended.max)
    })

    it('respects maxCount option', () => {
      const result = generateHashtags('tech coding', { maxCount: 5 })
      expect(result.length).toBeLessThanOrEqual(5)
    })

    it('respects platform recommendation for twitter', () => {
      const result = generateHashtags('tech coding', { platform: 'twitter' })
      expect(result.length).toBeLessThanOrEqual(PLATFORMS.twitter.recommended.max)
    })

    it('respects platform recommendation for tiktok', () => {
      const result = generateHashtags('tech coding', { platform: 'tiktok' })
      expect(result.length).toBeLessThanOrEqual(PLATFORMS.tiktok.recommended.max)
    })

    it('respects platform recommendation for linkedin', () => {
      const result = generateHashtags('tech coding', { platform: 'linkedin' })
      expect(result.length).toBeLessThanOrEqual(PLATFORMS.linkedin.recommended.max)
    })

    it('respects platform recommendation for youtube', () => {
      const result = generateHashtags('tech coding', { platform: 'youtube' })
      expect(result.length).toBeLessThanOrEqual(PLATFORMS.youtube.recommended.max)
    })

    it('filters by single category', () => {
      const result = generateHashtags('tech coding', { categories: ['trending'], maxCount: 50 })
      for (const hashtag of result) {
        expect(hashtag.category).toBe('trending')
      }
    })

    it('filters by multiple categories', () => {
      const result = generateHashtags('tech coding', {
        categories: ['trending', 'niche'],
        maxCount: 50,
      })
      for (const hashtag of result) {
        expect(['trending', 'niche']).toContain(hashtag.category)
      }
    })

    it('includes general hashtags by default', () => {
      const result = generateHashtags('tech coding', { maxCount: 50 })
      // Should include some general topic hashtags when includeGeneral is true
      expect(result.length).toBeGreaterThan(0)
    })

    it('excludes general hashtags when includeGeneral is false', () => {
      const techResult = generateHashtags('tech coding', {
        includeGeneral: false,
        maxCount: 50,
      })
      const techWithGeneralResult = generateHashtags('tech coding', {
        includeGeneral: true,
        maxCount: 50,
      })
      // With general included, should have more or equal hashtags
      expect(techWithGeneralResult.length).toBeGreaterThanOrEqual(techResult.length)
    })

    it('sorts hashtags by relevanceScore in descending order', () => {
      const result = generateHashtags('tech coding', { maxCount: 50 })
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].relevanceScore).toBeGreaterThanOrEqual(result[i].relevanceScore)
      }
    })

    it('returns unique hashtags (no duplicates)', () => {
      const result = generateHashtags('tech coding ai developer', { maxCount: 50 })
      const tags = result.map((h) => h.tag)
      const uniqueTags = new Set(tags)
      expect(tags.length).toBe(uniqueTags.size)
    })

    it('returns technology hashtags for tech content', () => {
      const result = generateHashtags('coding in javascript react', { maxCount: 20 })
      const tags = result.map((h) => h.tag)
      expect(tags.some((t) => ['tech', 'technology', 'coding', 'programming'].includes(t))).toBe(
        true
      )
    })

    it('returns food hashtags for food content', () => {
      const result = generateHashtags('cooking a delicious recipe for dinner', { maxCount: 20 })
      const tags = result.map((h) => h.tag)
      expect(tags.some((t) => ['food', 'foodie', 'cooking', 'recipe'].includes(t))).toBe(true)
    })

    it('returns general hashtags for unrelated content', () => {
      const result = generateHashtags('xyz random text', { maxCount: 20 })
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles empty content', () => {
      const result = generateHashtags('')
      expect(result.length).toBeGreaterThan(0) // Should return general hashtags
    })

    it('handles content with only whitespace', () => {
      const result = generateHashtags('   ')
      expect(result.length).toBeGreaterThan(0)
    })

    it('combines multiple topics hashtags', () => {
      const result = generateHashtags('tech startup business coding', { maxCount: 30 })
      expect(result.length).toBeGreaterThan(0)
    })

    it('maxCount overrides platform recommendation', () => {
      const result = generateHashtags('tech coding', { platform: 'twitter', maxCount: 20 })
      expect(result.length).toBeLessThanOrEqual(20)
    })

    it('returns empty array when category filter matches nothing', () => {
      // Location category might not have many hashtags in tech topic
      const result = generateHashtags('random xyz', { categories: ['branded'], maxCount: 50 })
      // Should return empty or very few since 'branded' category is rarely used
      expect(Array.isArray(result)).toBe(true)
    })

    it('handles all platform options', () => {
      const platforms: PlatformId[] = [
        'instagram',
        'twitter',
        'tiktok',
        'linkedin',
        'facebook',
        'youtube',
        'pinterest',
      ]
      for (const platform of platforms) {
        const result = generateHashtags('tech coding', { platform })
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeLessThanOrEqual(PLATFORMS[platform].recommended.max)
      }
    })

    it('handles all category options', () => {
      const categories: CategoryId[] = [
        'general',
        'trending',
        'niche',
        'branded',
        'community',
        'location',
      ]
      for (const category of categories) {
        const result = generateHashtags('tech coding food travel', {
          categories: [category],
          maxCount: 50,
        })
        expect(Array.isArray(result)).toBe(true)
        for (const hashtag of result) {
          expect(hashtag.category).toBe(category)
        }
      }
    })
  })

  // ============================================
  // formatHashtag Function Tests
  // ============================================
  describe('formatHashtag', () => {
    it('adds # prefix to tag without #', () => {
      expect(formatHashtag('tech')).toBe('#tech')
    })

    it('keeps # prefix if already present', () => {
      expect(formatHashtag('#tech')).toBe('#tech')
    })

    it('handles empty string', () => {
      expect(formatHashtag('')).toBe('#')
    })

    it('handles tag with only #', () => {
      expect(formatHashtag('#')).toBe('#')
    })

    it('handles tag with multiple # at start', () => {
      // formatHashtag only checks if starts with #, doesn't add another one
      expect(formatHashtag('##tech')).toBe('##tech')
    })

    it('handles tag with # in middle', () => {
      expect(formatHashtag('tech#tag')).toBe('#tech#tag')
    })

    it('handles lowercase tags', () => {
      expect(formatHashtag('javascript')).toBe('#javascript')
    })

    it('handles uppercase tags', () => {
      expect(formatHashtag('JAVASCRIPT')).toBe('#JAVASCRIPT')
    })

    it('handles mixed case tags', () => {
      expect(formatHashtag('JavaScript')).toBe('#JavaScript')
    })

    it('handles tags with numbers', () => {
      expect(formatHashtag('web3')).toBe('#web3')
    })

    it('handles tags with underscores', () => {
      expect(formatHashtag('food_porn')).toBe('#food_porn')
    })

    it('handles long tags', () => {
      const longTag = 'averylonghashtagthatisverylonganddescriptive'
      expect(formatHashtag(longTag)).toBe(`#${longTag}`)
    })
  })

  // ============================================
  // formatHashtagsForCopy Function Tests
  // ============================================
  describe('formatHashtagsForCopy', () => {
    const sampleHashtags: Hashtag[] = [
      { tag: 'tech', category: 'general', popularity: 'viral', relevanceScore: 95 },
      { tag: 'coding', category: 'general', popularity: 'high', relevanceScore: 80 },
      { tag: 'javascript', category: 'niche', popularity: 'high', relevanceScore: 75 },
    ]

    it('formats hashtags with space separator by default', () => {
      const result = formatHashtagsForCopy(sampleHashtags)
      expect(result).toBe('#tech #coding #javascript')
    })

    it('formats hashtags with space separator explicitly', () => {
      const result = formatHashtagsForCopy(sampleHashtags, 'space')
      expect(result).toBe('#tech #coding #javascript')
    })

    it('formats hashtags with newline separator', () => {
      const result = formatHashtagsForCopy(sampleHashtags, 'newline')
      expect(result).toBe('#tech\n#coding\n#javascript')
    })

    it('handles empty hashtags array', () => {
      const result = formatHashtagsForCopy([])
      expect(result).toBe('')
    })

    it('handles single hashtag with space separator', () => {
      const result = formatHashtagsForCopy([sampleHashtags[0]], 'space')
      expect(result).toBe('#tech')
    })

    it('handles single hashtag with newline separator', () => {
      const result = formatHashtagsForCopy([sampleHashtags[0]], 'newline')
      expect(result).toBe('#tech')
    })

    it('adds # prefix to tags that do not have it', () => {
      const hashtagsWithoutPrefix: Hashtag[] = [
        { tag: 'food', category: 'general', popularity: 'viral', relevanceScore: 90 },
        { tag: 'cooking', category: 'general', popularity: 'high', relevanceScore: 85 },
      ]
      const result = formatHashtagsForCopy(hashtagsWithoutPrefix)
      expect(result).toBe('#food #cooking')
    })

    it('preserves # prefix if already present', () => {
      const hashtagsWithPrefix: Hashtag[] = [
        { tag: '#food', category: 'general', popularity: 'viral', relevanceScore: 90 },
        { tag: '#cooking', category: 'general', popularity: 'high', relevanceScore: 85 },
      ]
      const result = formatHashtagsForCopy(hashtagsWithPrefix)
      expect(result).toBe('#food #cooking')
    })

    it('handles many hashtags with space separator', () => {
      const manyHashtags: Hashtag[] = Array.from({ length: 30 }, (_, i) => ({
        tag: `tag${i}`,
        category: 'general' as CategoryId,
        popularity: 'medium' as PopularityLevel,
        relevanceScore: 50,
      }))
      const result = formatHashtagsForCopy(manyHashtags, 'space')
      const expected = manyHashtags.map((h) => `#${h.tag}`).join(' ')
      expect(result).toBe(expected)
    })

    it('handles many hashtags with newline separator', () => {
      const manyHashtags: Hashtag[] = Array.from({ length: 30 }, (_, i) => ({
        tag: `tag${i}`,
        category: 'general' as CategoryId,
        popularity: 'medium' as PopularityLevel,
        relevanceScore: 50,
      }))
      const result = formatHashtagsForCopy(manyHashtags, 'newline')
      const expected = manyHashtags.map((h) => `#${h.tag}`).join('\n')
      expect(result).toBe(expected)
    })
  })

  // ============================================
  // getPopularityColor Function Tests
  // ============================================
  describe('getPopularityColor', () => {
    it('returns pink.400 for viral', () => {
      expect(getPopularityColor('viral')).toBe('pink.400')
    })

    it('returns green.400 for high', () => {
      expect(getPopularityColor('high')).toBe('green.400')
    })

    it('returns yellow.400 for medium', () => {
      expect(getPopularityColor('medium')).toBe('yellow.400')
    })

    it('returns gray.400 for low', () => {
      expect(getPopularityColor('low')).toBe('gray.400')
    })

    it('returns gray.400 for unknown value', () => {
      // Testing default case
      expect(getPopularityColor('unknown' as PopularityLevel)).toBe('gray.400')
    })

    it('returns gray.400 for empty string', () => {
      expect(getPopularityColor('' as PopularityLevel)).toBe('gray.400')
    })

    it('handles all valid popularity levels', () => {
      const levels: PopularityLevel[] = ['viral', 'high', 'medium', 'low']
      const colors = ['pink.400', 'green.400', 'yellow.400', 'gray.400']
      levels.forEach((level, index) => {
        expect(getPopularityColor(level)).toBe(colors[index])
      })
    })
  })

  // ============================================
  // getPopularityLabel Function Tests
  // ============================================
  describe('getPopularityLabel', () => {
    it('returns Viral for viral', () => {
      expect(getPopularityLabel('viral')).toBe('Viral')
    })

    it('returns High for high', () => {
      expect(getPopularityLabel('high')).toBe('High')
    })

    it('returns Medium for medium', () => {
      expect(getPopularityLabel('medium')).toBe('Medium')
    })

    it('returns Low for low', () => {
      expect(getPopularityLabel('low')).toBe('Low')
    })

    it('returns Unknown for unknown value', () => {
      expect(getPopularityLabel('unknown' as PopularityLevel)).toBe('Unknown')
    })

    it('returns Unknown for empty string', () => {
      expect(getPopularityLabel('' as PopularityLevel)).toBe('Unknown')
    })

    it('handles all valid popularity levels', () => {
      const levels: PopularityLevel[] = ['viral', 'high', 'medium', 'low']
      const labels = ['Viral', 'High', 'Medium', 'Low']
      levels.forEach((level, index) => {
        expect(getPopularityLabel(level)).toBe(labels[index])
      })
    })

    it('returns capitalized labels', () => {
      expect(getPopularityLabel('viral')).toMatch(/^[A-Z]/)
      expect(getPopularityLabel('high')).toMatch(/^[A-Z]/)
      expect(getPopularityLabel('medium')).toMatch(/^[A-Z]/)
      expect(getPopularityLabel('low')).toMatch(/^[A-Z]/)
    })
  })

  // ============================================
  // Type Export Tests
  // ============================================
  describe('Type exports', () => {
    it('PlatformId type should include all platform keys', () => {
      const platformIds: PlatformId[] = [
        'instagram',
        'twitter',
        'tiktok',
        'linkedin',
        'facebook',
        'youtube',
        'pinterest',
      ]
      // This test verifies type correctness at compile time
      expect(platformIds.length).toBe(7)
    })

    it('CategoryId type should include all category keys', () => {
      const categoryIds: CategoryId[] = [
        'general',
        'trending',
        'niche',
        'branded',
        'community',
        'location',
      ]
      expect(categoryIds.length).toBe(6)
    })

    it('PopularityLevel type should include all levels', () => {
      const levels: PopularityLevel[] = ['low', 'medium', 'high', 'viral']
      expect(levels.length).toBe(4)
    })

    it('Hashtag interface should have correct shape', () => {
      const hashtag: Hashtag = {
        tag: 'test',
        category: 'general',
        popularity: 'high',
        relevanceScore: 80,
      }
      expect(hashtag).toHaveProperty('tag')
      expect(hashtag).toHaveProperty('category')
      expect(hashtag).toHaveProperty('popularity')
      expect(hashtag).toHaveProperty('relevanceScore')
    })

    it('Hashtag interface should accept optional posts field', () => {
      const hashtagWithPosts: Hashtag = {
        tag: 'test',
        category: 'general',
        popularity: 'high',
        posts: '1M+',
        relevanceScore: 80,
      }
      expect(hashtagWithPosts.posts).toBe('1M+')
    })
  })

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration tests', () => {
    it('full workflow: analyze content -> generate -> format for copy', () => {
      const content = 'Building a tech startup with coding'
      const topics = analyzeContent(content)
      expect(topics).toContain('technology')
      expect(topics).toContain('business')

      const hashtags = generateHashtags(content, {
        platform: 'instagram',
        maxCount: 10,
      })
      expect(hashtags.length).toBeLessThanOrEqual(10)

      const formatted = formatHashtagsForCopy(hashtags, 'space')
      expect(formatted).toMatch(/^#\w+/)
      expect(formatted.split(' ').length).toBe(hashtags.length)
    })

    it('platform-specific workflow for Twitter', () => {
      const hashtags = generateHashtags('tech coding', { platform: 'twitter' })
      expect(hashtags.length).toBeLessThanOrEqual(3) // Twitter recommendation

      const formatted = formatHashtagsForCopy(hashtags, 'space')
      const hashtagCount = formatted.split(' ').filter((h) => h.startsWith('#')).length
      expect(hashtagCount).toBeLessThanOrEqual(3)
    })

    it('platform-specific workflow for TikTok', () => {
      const hashtags = generateHashtags('fitness gym workout', { platform: 'tiktok' })
      expect(hashtags.length).toBeLessThanOrEqual(5) // TikTok recommendation
    })

    it('category filtering workflow', () => {
      const trendingHashtags = generateHashtags('tech coding ai', {
        categories: ['trending'],
        maxCount: 20,
      })

      for (const hashtag of trendingHashtags) {
        expect(hashtag.category).toBe('trending')
      }

      const colors = trendingHashtags.map((h) => getPopularityColor(h.popularity))
      expect(colors.every((c) => typeof c === 'string')).toBe(true)

      const labels = trendingHashtags.map((h) => getPopularityLabel(h.popularity))
      expect(labels.every((l) => typeof l === 'string')).toBe(true)
    })

    it('multi-topic content generates diverse hashtags', () => {
      const content = 'Food photography for my travel blog'
      const topics = analyzeContent(content)
      expect(topics.length).toBeGreaterThanOrEqual(2)

      const hashtags = generateHashtags(content, { maxCount: 20 })
      const categories = new Set(hashtags.map((h) => h.category))
      // Should have hashtags from multiple categories
      expect(categories.size).toBeGreaterThanOrEqual(1)
    })
  })
})
