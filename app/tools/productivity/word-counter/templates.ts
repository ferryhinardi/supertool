/**
 * Word Counter Pro - Text Analysis Utilities
 * Provides comprehensive text statistics and analysis
 */

export interface TextStatistics {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  lines: number
  readingTime: number // in minutes
  speakingTime: number // in minutes
  averageWordLength: number
  longestWord: string
  longestWordLength: number
}

export interface KeywordFrequency {
  word: string
  count: number
  percentage: number
}

/**
 * Calculate comprehensive text statistics
 */
export function analyzeText(text: string): TextStatistics {
  if (!text || text.trim().length === 0) {
    return {
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
    }
  }

  // Character counts
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length

  // Word count and analysis
  const wordMatches = text.match(/\b[\w'-]+\b/g)
  const words = wordMatches ? wordMatches.length : 0
  const wordArray = wordMatches || []

  // Average word length
  const totalWordLength = wordArray.reduce((sum, word) => sum + word.length, 0)
  const averageWordLength = words > 0 ? Number((totalWordLength / words).toFixed(1)) : 0

  // Longest word
  const longestWord = wordArray.reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    ''
  )
  const longestWordLength = longestWord.length

  // Sentence count (sentences end with . ! ? or new line)
  const sentenceMatches = text.match(/[.!?]+/g)
  const sentences = sentenceMatches ? sentenceMatches.length : 0

  // Paragraph count (separated by double newlines or more)
  const paragraphMatches = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  const paragraphs = paragraphMatches.length

  // Line count
  const lineMatches = text.split('\n').filter((line) => line.trim().length > 0)
  const lines = lineMatches.length

  // Reading time (average 200 words per minute)
  const readingTime = Number((words / 200).toFixed(1))

  // Speaking time (average 130 words per minute)
  const speakingTime = Number((words / 130).toFixed(1))

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTime,
    speakingTime,
    averageWordLength,
    longestWord,
    longestWordLength,
  }
}

/**
 * Calculate keyword density and frequency
 */
export function calculateKeywordDensity(text: string, topN = 10): KeywordFrequency[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // Extract all words, convert to lowercase
  const wordMatches = text.toLowerCase().match(/\b[\w'-]+\b/g)
  if (!wordMatches) return []

  // Common words to exclude (stop words)
  const stopWords = new Set([
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'i',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'this',
    'but',
    'his',
    'by',
    'from',
    'they',
    'we',
    'say',
    'her',
    'she',
    'or',
    'an',
    'will',
    'my',
    'one',
    'all',
    'would',
    'there',
    'their',
    'what',
    'so',
    'up',
    'out',
    'if',
    'about',
    'who',
    'get',
    'which',
    'go',
    'me',
    'when',
    'make',
    'can',
    'like',
    'time',
    'no',
    'just',
    'him',
    'know',
    'take',
    'people',
    'into',
    'year',
    'your',
    'good',
    'some',
    'could',
    'them',
    'see',
    'other',
    'than',
    'then',
    'now',
    'look',
    'only',
    'come',
    'its',
    'over',
    'think',
    'also',
    'back',
    'after',
    'use',
    'two',
    'how',
    'our',
    'work',
    'first',
    'well',
    'way',
    'even',
    'new',
    'want',
    'because',
    'any',
    'these',
    'give',
    'day',
    'most',
    'us',
    'is',
    'was',
    'are',
    'been',
    'has',
    'had',
    'were',
    'said',
    'did',
  ])

  // Count word frequencies
  const frequencyMap = new Map<string, number>()
  const totalWords = wordMatches.length

  for (const word of wordMatches) {
    // Skip stop words and very short words
    if (stopWords.has(word) || word.length <= 2) continue

    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1)
  }

  // Convert to array and sort by frequency
  const frequencies: KeywordFrequency[] = Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: Number(((count / totalWords) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)

  return frequencies
}

/**
 * Format reading/speaking time for display
 */
export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than 1 min'
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

/**
 * Sample texts for examples
 */
export const sampleTexts = {
  short: `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.`,
  medium: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.`,
  long: `In the beginning was the Word, and the Word was with God, and the Word was God. Through him all things were made; without him nothing was made that has been made. In him was life, and that life was the light of all mankind.

The light shines in the darkness, and the darkness has not overcome it. There was a man sent from God whose name was John. He came as a witness to testify concerning that light, so that through him all might believe.

He himself was not the light; he came only as a witness to the light. The true light that gives light to everyone was coming into the world. He was in the world, and though the world was made through him, the world did not recognize him.

He came to that which was his own, but his own did not receive him. Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God—children born not of natural descent, nor of human decision or a husband's will, but born of God.

The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.`,
}
