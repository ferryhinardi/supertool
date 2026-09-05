# Keyword Density Analyzer

> **Category**: Productivity  
> **Path**: `/tools/productivity/keyword-density`  
> **Status**: Active  
> **Processing**: 100% Client-side

## Overview

The Keyword Density Analyzer is an SEO optimization tool that analyzes text content to measure keyword frequency, identify overused terms, and provide recommendations for better content balance. It analyzes single words, two-word phrases, and three-word phrases.

## Features

### Core Features

- **Single Word Analysis**: Frequency and density for individual keywords
- **Phrase Analysis**: Two-word and three-word phrase frequency
- **SEO Score**: Overall content optimization score (0-100)
- **Warnings & Recommendations**: Actionable SEO suggestions

### Additional Features

- **Visual Bar Charts**: Graphical representation of keyword frequency
- **Copy Results**: Copy analysis summary to clipboard
- **Export to CSV**: Download complete analysis as CSV file
- **Stop Word Filtering**: Automatically excludes common words (the, and, is, etc.)

## How to Use

1. **Enter Content**: Paste or type your text in the input area (minimum 100 characters recommended)
2. **Click Analyze**: Press the "Analyze" button to process content
3. **Review Results**:
   - SEO Score and content statistics
   - Warnings for potential issues
   - Recommendations for improvement
   - Top keywords with density percentages
   - Two-word and three-word phrases
4. **Export**: Copy results or export as CSV

## SEO Metrics

### SEO Score Calculation

| Factor | Score Impact |
|--------|--------------|
| Keyword stuffing (>5% density) | -20 points |
| Short content (<300 words) | -15 points |
| Low keyword diversity | -10 points |
| Starting score | 100 points |

### Score Interpretation

| Score Range | Rating | Meaning |
|-------------|--------|---------|
| 80-100 | Excellent | Well-optimized content |
| 60-79 | Good | Minor improvements needed |
| 40-59 | Fair | Several issues to address |
| 0-39 | Poor | Significant optimization needed |

## Keyword Density Guidelines

| Density | Color | Recommendation |
|---------|-------|----------------|
| < 2% | Yellow | Consider using keyword more |
| 2-5% | Green | Optimal range |
| > 5% | Red | Possible keyword stuffing |

## Analysis Output

### Content Statistics

- **Total Words**: Complete word count
- **Unique Words**: Number of distinct words
- **Characters**: Total character count
- **Diversity %**: Unique words / Total words ratio

### Top Keywords Table

| Column | Description |
|--------|-------------|
| Rank | Position by frequency |
| Keyword | The word itself |
| Count | Number of occurrences |
| Density | Percentage of total words |

### Phrase Analysis

- **Two-Word Phrases**: Top 15 most frequent word pairs
- **Three-Word Phrases**: Top 10 most frequent word triplets

## Stop Words

The analyzer automatically excludes these common words from keyword analysis:

```
the, be, to, of, and, a, in, that, have, i, it, for, not, on, with, 
he, as, you, do, at, this, but, his, by, from, they, we, say, her, 
she, or, an, will, my, one, all, would, there, their, what, so, up, 
out, if, about, who, get, which, go, me, when, make, can, like, time, 
no, just, him, know, take, people, into, year, your, good, some, could, 
them, see, other, than, then, now, look, only, come, its, over, think, 
also, back, after, use, two, how, our, work, first, well, way, even, 
new, want, because, any, these, give, day, most, us, is, was, are, 
been, has, had, were, said, did, having, may, should
```

## Use Cases

- **SEO Optimization**: Analyze blog posts before publishing
- **Content Auditing**: Review existing content for keyword balance
- **Competitor Analysis**: Examine competitor content strategies
- **Academic Writing**: Check for repetitive language
- **Marketing Copy**: Ensure key terms are properly emphasized

## Technical Details

### Processing

| Aspect | Details |
|--------|---------|
| Processing Location | 100% client-side (browser) |
| Data Storage | None - content not persisted |
| Export Formats | CSV, clipboard text |
| Privacy | No data sent to server |

### Analysis Algorithm

1. **Tokenization**: Text split by whitespace
2. **Cleaning**: Punctuation removed, converted to lowercase
3. **Stop Word Removal**: Common words filtered out
4. **Frequency Count**: Word and phrase occurrences tallied
5. **Density Calculation**: (Count / Total Words) * 100

### CSV Export Format

```csv
Type,Keyword/Phrase,Count,Density (%)
Single Word,"keyword",15,2.50
Two Words,"example phrase",8,1.33
Three Words,"longer keyword phrase",3,0.50
```

## Best Practices

- Target 2-5% density for main keywords
- Aim for at least 300 words for blog posts, 500+ for landing pages
- Maintain 30-40% unique word ratio for good diversity
- Use varied vocabulary to avoid repetition
- Include related two and three-word phrases for topic coverage

## Related Tools

- [Word Counter](/tools/productivity/word-counter) - Detailed text statistics
- [Text Similarity](/tools/productivity/text-similarity) - Compare text blocks
- [Grammar Checker](/tools/productivity/grammar-checker) - Check grammar and style
- [SEO Meta Generator](/tools/productivity/seo-meta-generator) - Generate SEO metadata

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with single word, phrase analysis, and SEO scoring |
