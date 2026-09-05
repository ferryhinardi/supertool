# Text Similarity Checker

> **Category**: Productivity  
> **Path**: `/tools/productivity/text-similarity`  
> **Status**: Active  
> **Processing**: 100% Client-side

## Overview

The Text Similarity Checker compares two text blocks using advanced NLP (Natural Language Processing) algorithms to measure how similar they are. Perfect for detecting duplicate content, plagiarism, and text variations.

## Features

### Core Features

- **Three NLP Algorithms**: Cosine Similarity, Levenshtein Distance, Jaccard Index
- **Real-time Comparison**: Instant results as you type
- **Similarity Percentage**: Clear 0-100% similarity score
- **Detailed Metrics**: Matches, total items, edit distance

### Additional Features

- **Compare All Algorithms**: View results from all three algorithms simultaneously
- **Example Text Pairs**: Pre-loaded examples to test the tool
- **Copy Results**: Copy analysis to clipboard
- **Visual Progress Bars**: Graphical representation of similarity

## Algorithms Explained

### Cosine Similarity

**Best for**: Semantic similarity, document comparison

Creates word frequency vectors for both texts and measures the angle between them. Ignores word order, focuses on vocabulary overlap.

| Input | "The cat sat on the mat" vs "The mat has a cat on it" |
|-------|-------------------------------------------------------|
| Output | High similarity (same words, different order) |

### Levenshtein Distance

**Best for**: Typo detection, character-level edits

Counts the minimum number of single-character edits (insertions, deletions, substitutions) needed to transform one text into another.

| Input | "hello" vs "hallo" |
|-------|-------------------|
| Output | Distance: 1, Similarity: 80% |

### Jaccard Index

**Best for**: Word overlap, set-based comparison

Measures similarity as the size of word intersection divided by the size of word union between two texts.

| Input | "apple banana cherry" vs "apple banana date" |
|-------|---------------------------------------------|
| Output | Intersection: 2, Union: 4, Similarity: 50% |

## How to Use

1. **Select Algorithm**: Choose Cosine, Levenshtein, or Jaccard (or enable "Show all algorithms")
2. **Enter Text 1**: Paste or type the first text block
3. **Enter Text 2**: Paste or type the second text block
4. **View Results**: Similarity percentage and details appear automatically
5. **Copy Results**: Click "Copy" to save analysis to clipboard

## Similarity Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100% | Nearly Identical | Texts are almost the same |
| 80-89% | Very Similar | Minor differences only |
| 60-79% | Moderately Similar | Shared content with variations |
| 40-59% | Somewhat Similar | Some common elements |
| 0-39% | Different | Texts have little in common |

## Algorithm Comparison

| Algorithm | Best For | Word Order | Case Sensitive |
|-----------|----------|------------|----------------|
| Cosine | Document comparison | Ignored | No |
| Levenshtein | Typo detection | Preserved | No |
| Jaccard | Keyword overlap | Ignored | No |

## Example Text Pairs

The tool includes pre-loaded examples:

| Example | Text 1 | Text 2 |
|---------|--------|--------|
| Similar Articles | "Artificial intelligence is revolutionizing..." | "AI is transforming how we approach..." |
| Duplicate Detection | "The quick brown fox jumps..." | "The quick brown fox jumps..." |
| Paraphrased Content | "Climate change poses significant..." | "Environmental issues related to global warming..." |

## Result Details

### Cosine Similarity Details

| Metric | Description |
|--------|-------------|
| Matches | Dot product of term frequency vectors |
| Total | Total vocabulary size (unique words) |

### Levenshtein Details

| Metric | Description |
|--------|-------------|
| Distance | Number of edits required |
| Max Length | Length of longer text |

### Jaccard Details

| Metric | Description |
|--------|-------------|
| Matches | Words in both texts (intersection) |
| Total | Unique words across both texts (union) |

## Use Cases

- **Plagiarism Detection**: Check if content has been copied
- **Content Auditing**: Find duplicate pages on a website
- **Document Comparison**: Compare different versions of a document
- **Data Deduplication**: Identify similar records in datasets
- **SEO**: Check for thin or duplicate content
- **Academic Writing**: Verify originality of submissions

## Technical Details

### Processing

| Aspect | Details |
|--------|---------|
| Processing Location | 100% client-side (browser) |
| Data Storage | None - texts not persisted |
| Performance | Handles texts up to 10,000+ characters |
| Privacy | No data sent to server |

### Algorithm Implementations

**Cosine Similarity**:
1. Tokenize text into words
2. Create term frequency vectors
3. Calculate dot product
4. Divide by product of magnitudes

**Levenshtein Distance**:
1. Create distance matrix
2. Fill with edit distances
3. Return bottom-right cell value
4. Convert to similarity percentage

**Jaccard Index**:
1. Create word sets from both texts
2. Calculate intersection size
3. Calculate union size
4. Divide intersection by union

### Performance Note

For texts longer than 10,000 characters, a warning appears suggesting shorter excerpts for faster processing.

## Related Tools

- [Word Counter](/tools/productivity/word-counter) - Count words and characters
- [Keyword Density](/tools/productivity/keyword-density) - Analyze keyword usage
- [Code Diff Viewer](/tools/development/diff) - Compare code files
- [Grammar Checker](/tools/productivity/grammar-checker) - Check writing quality

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with three NLP algorithms and example pairs |
