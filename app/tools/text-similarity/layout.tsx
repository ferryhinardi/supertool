import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Text Similarity Checker - Compare Texts with NLP Algorithms',
  description:
    'Free online text similarity checker using advanced NLP algorithms (Cosine Similarity, Levenshtein Distance, Jaccard Index). Compare text blocks, detect duplicate content, plagiarism, and measure text similarity percentage instantly. Privacy-focused with client-side processing.',
  keywords: [
    'text similarity',
    'text comparison',
    'similarity checker',
    'plagiarism detection',
    'duplicate content checker',
    'text analyzer',
    'cosine similarity',
    'levenshtein distance',
    'jaccard index',
    'NLP tools',
    'text matching',
    'semantic similarity',
    'text difference',
    'compare texts',
    'similarity score',
    'text analysis',
  ],
  category: 'productivity',
  path: '/tools/text-similarity',
})

export default function TextSimilarityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
