// Classic Lorem Ipsum words
const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'suscipit',
  'gravida',
  'ornare',
  'arcu',
  'odio',
  'euismod',
  'lacinia',
  'quat',
  'volutpat',
  'blandit',
  'turpis',
  'cursus',
  'mattis',
  'molestie',
  'a',
  'iaculis',
  'at',
  'erat',
  'pellentesque',
  'adipiscing',
  'commodo',
  'elit',
  'at',
  'imperdiet',
  'dui',
  'accumsan',
  'vitae',
  'sapien',
  'faucibus',
  'et',
  'molestie',
  'ac',
  'feugiat',
]

export type OutputType = 'paragraphs' | 'sentences' | 'words'

export interface GenerateOptions {
  type: OutputType
  count: number
  startWithLorem: boolean
  htmlFormat: boolean
}

/**
 * Generate a random sentence with 5-15 words
 */
function generateSentence(startWithLorem = false): string {
  const wordCount = Math.floor(Math.random() * 11) + 5 // 5-15 words
  const words: string[] = []

  if (startWithLorem) {
    words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet')
    for (let i = 0; i < wordCount - 5; i++) {
      const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
      words.push(randomWord)
    }
  } else {
    for (let i = 0; i < wordCount; i++) {
      const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
      words.push(randomWord)
    }
  }

  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)

  return `${words.join(' ')}.`
}

/**
 * Generate a paragraph with 3-7 sentences
 */
function generateParagraph(startWithLorem = false): string {
  const sentenceCount = Math.floor(Math.random() * 5) + 3 // 3-7 sentences
  const sentences: string[] = []

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(startWithLorem && i === 0))
  }

  return sentences.join(' ')
}

/**
 * Generate Lorem Ipsum text based on options
 */
export function generateLoremIpsum(options: GenerateOptions): string {
  const { type, count, startWithLorem, htmlFormat } = options

  let result = ''

  switch (type) {
    case 'paragraphs': {
      const paragraphs: string[] = []
      for (let i = 0; i < count; i++) {
        const paragraph = generateParagraph(startWithLorem && i === 0)
        if (htmlFormat) {
          paragraphs.push(`<p>${paragraph}</p>`)
        } else {
          paragraphs.push(paragraph)
        }
      }
      result = htmlFormat ? paragraphs.join('\n\n') : paragraphs.join('\n\n')
      break
    }

    case 'sentences': {
      const sentences: string[] = []
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence(startWithLorem && i === 0))
      }
      result = sentences.join(' ')
      break
    }

    case 'words': {
      const words: string[] = []
      if (startWithLorem && count >= 5) {
        words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet')
        for (let i = 0; i < count - 5; i++) {
          const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
          words.push(randomWord)
        }
      } else {
        for (let i = 0; i < count; i++) {
          const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
          words.push(
            i === 0 ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1) : randomWord
          )
        }
      }
      result = `${words.join(' ')}.`
      break
    }
  }

  return result
}

/**
 * Get character count (excluding HTML tags if present)
 */
export function getCharacterCount(text: string, excludeSpaces = false): number {
  // Remove HTML tags
  const textWithoutHTML = text.replace(/<[^>]*>/g, '')

  if (excludeSpaces) {
    return textWithoutHTML.replace(/\s/g, '').length
  }

  return textWithoutHTML.length
}

/**
 * Get word count
 */
export function getWordCount(text: string): number {
  // Remove HTML tags
  const textWithoutHTML = text.replace(/<[^>]*>/g, '')

  // Split by whitespace and filter out empty strings
  return textWithoutHTML.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Get sentence count
 */
export function getSentenceCount(text: string): number {
  // Remove HTML tags
  const textWithoutHTML = text.replace(/<[^>]*>/g, '')

  // Split by sentence endings
  return textWithoutHTML.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length
}

/**
 * Get paragraph count
 */
export function getParagraphCount(text: string): number {
  // Count <p> tags if HTML, otherwise count double line breaks
  if (text.includes('<p>')) {
    return (text.match(/<p>/g) || []).length
  }

  return text.split(/\n\n+/).filter((para) => para.trim().length > 0).length
}
