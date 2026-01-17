// Readability Score Checker Utility Functions

/**
 * Count syllables in a word using a simplified algorithm
 * Based on the English syllable counting rules
 */
export function countSyllables(word: string): number {
  word = word.toLowerCase().trim()
  if (word.length <= 3) return 1

  // Remove non-alphabetic characters
  word = word.replace(/[^a-z]/g, '')
  if (!word) return 0

  // Special endings
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')

  // Count vowel groups
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

/**
 * Count total syllables in text
 */
export function countTotalSyllables(text: string): number {
  const words = getWords(text)
  return words.reduce((total, word) => total + countSyllables(word), 0)
}

/**
 * Get array of words from text
 */
export function getWords(text: string): string[] {
  return text.match(/[a-zA-Z]+/g) || []
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  return Math.max(sentences.length, 1)
}

/**
 * Count complex words (3+ syllables)
 */
export function countComplexWords(text: string): number {
  const words = getWords(text)
  return words.filter((word) => countSyllables(word) >= 3).length
}

/**
 * Count characters (letters only)
 */
export function countCharacters(text: string): number {
  return (text.match(/[a-zA-Z]/g) || []).length
}

export interface ReadabilityStats {
  wordCount: number
  sentenceCount: number
  syllableCount: number
  characterCount: number
  complexWordCount: number
  avgWordsPerSentence: number
  avgSyllablesPerWord: number
}

export interface ReadabilityScores {
  fleschReadingEase: number
  fleschKincaidGrade: number
  gunningFog: number
  smog: number
  colemanLiau: number
  automatedReadabilityIndex: number
}

export interface ReadabilityResult {
  stats: ReadabilityStats
  scores: ReadabilityScores
  readingTime: number
  overallGradeLevel: string
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard'
}

/**
 * Calculate all readability statistics
 */
export function calculateStats(text: string): ReadabilityStats {
  const words = getWords(text)
  const wordCount = words.length
  const sentenceCount = countSentences(text)
  const syllableCount = countTotalSyllables(text)
  const characterCount = countCharacters(text)
  const complexWordCount = countComplexWords(text)

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    characterCount,
    complexWordCount,
    avgWordsPerSentence: wordCount / sentenceCount,
    avgSyllablesPerWord: wordCount > 0 ? syllableCount / wordCount : 0,
  }
}

/**
 * Flesch Reading Ease Score
 * Formula: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
 * Higher scores = easier to read (0-100 scale, can go negative for very complex text)
 */
export function calculateFleschReadingEase(stats: ReadabilityStats): number {
  if (stats.wordCount === 0) return 0

  const score = 206.835 - 1.015 * stats.avgWordsPerSentence - 84.6 * stats.avgSyllablesPerWord

  return Math.max(0, Math.min(100, Math.round(score * 10) / 10))
}

/**
 * Flesch-Kincaid Grade Level
 * Formula: 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
 * Returns US grade level (e.g., 8 = 8th grade)
 */
export function calculateFleschKincaidGrade(stats: ReadabilityStats): number {
  if (stats.wordCount === 0) return 0

  const grade = 0.39 * stats.avgWordsPerSentence + 11.8 * stats.avgSyllablesPerWord - 15.59

  return Math.max(0, Math.round(grade * 10) / 10)
}

/**
 * Gunning Fog Index
 * Formula: 0.4*((words/sentences) + 100*(complexWords/words))
 * Returns years of formal education needed
 */
export function calculateGunningFog(stats: ReadabilityStats): number {
  if (stats.wordCount === 0) return 0

  const complexWordPercent = (stats.complexWordCount / stats.wordCount) * 100
  const index = 0.4 * (stats.avgWordsPerSentence + complexWordPercent)

  return Math.max(0, Math.round(index * 10) / 10)
}

/**
 * SMOG Index (Simple Measure of Gobbledygook)
 * Formula: 1.0430*sqrt(complexWords*(30/sentences)) + 3.1291
 * Returns years of education needed to understand
 */
export function calculateSMOG(stats: ReadabilityStats): number {
  if (stats.wordCount === 0 || stats.sentenceCount === 0) return 0

  const index = 1.043 * Math.sqrt(stats.complexWordCount * (30 / stats.sentenceCount)) + 3.1291

  return Math.max(0, Math.round(index * 10) / 10)
}

/**
 * Coleman-Liau Index
 * Formula: 0.0588*L - 0.296*S - 15.8
 * L = average letters per 100 words, S = average sentences per 100 words
 */
export function calculateColemanLiau(stats: ReadabilityStats): number {
  if (stats.wordCount === 0) return 0

  const L = (stats.characterCount / stats.wordCount) * 100
  const S = (stats.sentenceCount / stats.wordCount) * 100
  const index = 0.0588 * L - 0.296 * S - 15.8

  return Math.max(0, Math.round(index * 10) / 10)
}

/**
 * Automated Readability Index (ARI)
 * Formula: 4.71*(characters/words) + 0.5*(words/sentences) - 21.43
 * Returns US grade level
 */
export function calculateARI(stats: ReadabilityStats): number {
  if (stats.wordCount === 0) return 0

  const index =
    4.71 * (stats.characterCount / stats.wordCount) + 0.5 * stats.avgWordsPerSentence - 21.43

  return Math.max(0, Math.round(index * 10) / 10)
}

/**
 * Calculate reading time in minutes
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 225
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Calculate all readability scores
 */
export function calculateScores(stats: ReadabilityStats): ReadabilityScores {
  return {
    fleschReadingEase: calculateFleschReadingEase(stats),
    fleschKincaidGrade: calculateFleschKincaidGrade(stats),
    gunningFog: calculateGunningFog(stats),
    smog: calculateSMOG(stats),
    colemanLiau: calculateColemanLiau(stats),
    automatedReadabilityIndex: calculateARI(stats),
  }
}

/**
 * Get difficulty level based on Flesch Reading Ease score
 */
export function getDifficulty(fleschScore: number): 'easy' | 'medium' | 'hard' | 'very-hard' {
  if (fleschScore >= 70) return 'easy'
  if (fleschScore >= 50) return 'medium'
  if (fleschScore >= 30) return 'hard'
  return 'very-hard'
}

/**
 * Get overall grade level interpretation
 */
export function getOverallGradeLevel(scores: ReadabilityScores): string {
  const avgGrade =
    (scores.fleschKincaidGrade +
      scores.gunningFog +
      scores.smog +
      scores.colemanLiau +
      scores.automatedReadabilityIndex) /
    5

  if (avgGrade <= 5) return '5th Grade or below'
  if (avgGrade <= 6) return '6th Grade'
  if (avgGrade <= 7) return '7th Grade'
  if (avgGrade <= 8) return '8th Grade'
  if (avgGrade <= 9) return '9th Grade'
  if (avgGrade <= 10) return '10th Grade'
  if (avgGrade <= 11) return '11th Grade'
  if (avgGrade <= 12) return '12th Grade'
  if (avgGrade <= 14) return 'College'
  return 'Graduate/Professional'
}

/**
 * Analyze text and return complete readability results
 */
export function analyzeReadability(text: string): ReadabilityResult {
  const stats = calculateStats(text)
  const scores = calculateScores(stats)

  return {
    stats,
    scores,
    readingTime: calculateReadingTime(stats.wordCount),
    overallGradeLevel: getOverallGradeLevel(scores),
    difficulty: getDifficulty(scores.fleschReadingEase),
  }
}

/**
 * Get interpretation of Flesch Reading Ease score
 */
export function getFleschInterpretation(score: number): {
  label: string
  audience: string
} {
  if (score >= 90) return { label: 'Very Easy', audience: '5th grade (11-year-old)' }
  if (score >= 80) return { label: 'Easy', audience: '6th grade (12-year-old)' }
  if (score >= 70) return { label: 'Fairly Easy', audience: '7th grade (13-year-old)' }
  if (score >= 60) return { label: 'Standard', audience: '8th-9th grade (14-15 year-old)' }
  if (score >= 50) return { label: 'Fairly Difficult', audience: '10th-12th grade (16-18)' }
  if (score >= 30) return { label: 'Difficult', audience: 'College student' }
  return { label: 'Very Difficult', audience: 'College graduate/Professional' }
}

/**
 * Sample texts for testing
 */
export const sampleTexts = {
  easy: {
    label: 'Easy (Grade 3-5)',
    text: `The cat sat on the mat. It was a big, fat cat. The cat liked to nap in the sun. One day, a small dog came by. The dog wanted to play. But the cat just yawned and went back to sleep. The dog ran away to find a friend. The cat was happy to be alone. It was a good day for a nap.`,
  },
  medium: {
    label: 'Medium (Grade 8-10)',
    text: `Climate change represents one of the most significant challenges facing our planet today. Rising global temperatures are causing ice caps to melt at unprecedented rates, leading to higher sea levels and more extreme weather patterns. Scientists around the world are working to develop sustainable solutions, including renewable energy sources and carbon capture technologies. While progress has been made, many experts argue that more aggressive action is needed to prevent irreversible damage to our environment.`,
  },
  hard: {
    label: 'Hard (College+)',
    text: `The epistemological implications of quantum mechanics fundamentally challenge our classical understanding of determinism and causality. Heisenberg's uncertainty principle demonstrates that conjugate variables cannot be simultaneously measured with arbitrary precision, suggesting inherent limitations to predictability at the quantum level. Furthermore, the phenomenon of quantum entanglement, wherein particles exhibit correlated behaviors regardless of spatial separation, necessitates a reconceptualization of locality and realism in physical theory. These considerations have profound ramifications for contemporary philosophical discourse concerning the nature of reality and our capacity to comprehend it.`,
  },
}

/**
 * Score explanations for the UI
 */
export const scoreExplanations = {
  fleschReadingEase: {
    name: 'Flesch Reading Ease',
    description:
      'Measures text readability on a scale of 0-100. Higher scores indicate easier text to read.',
    formula: '206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)',
    interpretation: [
      { range: '90-100', meaning: 'Very Easy - 5th grade' },
      { range: '80-89', meaning: 'Easy - 6th grade' },
      { range: '70-79', meaning: 'Fairly Easy - 7th grade' },
      { range: '60-69', meaning: 'Standard - 8th-9th grade' },
      { range: '50-59', meaning: 'Fairly Difficult - 10th-12th grade' },
      { range: '30-49', meaning: 'Difficult - College' },
      { range: '0-29', meaning: 'Very Difficult - Graduate' },
    ],
  },
  fleschKincaidGrade: {
    name: 'Flesch-Kincaid Grade',
    description: 'Estimates the U.S. grade level needed to understand the text.',
    formula: '0.39 × (words/sentences) + 11.8 × (syllables/words) - 15.59',
  },
  gunningFog: {
    name: 'Gunning Fog Index',
    description: 'Estimates years of formal education needed to understand text on first reading.',
    formula: '0.4 × ((words/sentences) + 100 × (complex words/words))',
  },
  smog: {
    name: 'SMOG Index',
    description: 'Simple Measure of Gobbledygook - estimates years of education needed.',
    formula: '1.043 × √(complex words × 30/sentences) + 3.129',
  },
  colemanLiau: {
    name: 'Coleman-Liau Index',
    description: 'Uses character counts rather than syllables to determine grade level.',
    formula: '0.0588 × L - 0.296 × S - 15.8 (L=letters/100 words, S=sentences/100 words)',
  },
  automatedReadabilityIndex: {
    name: 'Automated Readability Index',
    description: 'Uses characters per word and words per sentence to estimate grade level.',
    formula: '4.71 × (characters/words) + 0.5 × (words/sentences) - 21.43',
  },
}
