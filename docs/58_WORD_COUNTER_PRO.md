# 58 - Word Counter Pro

**Created:** January 2, 2026  
**Last Updated:** January 2, 2026  
**Category:** Productivity Tools  
**Status:** ✅ Active · ⭐ New

## Overview

Word Counter Pro is a comprehensive text analysis tool that provides real-time statistics for any text input. Count words, characters, sentences, paragraphs, and lines while getting reading time estimates, speaking time calculations, keyword density analysis, and detailed word metrics. Perfect for writers, students, content creators, SEO professionals, and anyone working with text.

## Purpose

Text analysis is essential for many professional and academic contexts. This tool helps users:

- **Meet Content Requirements** - Ensure text meets word/character limits for essays, articles, or social media
- **Optimize Reading Experience** - Calculate reading time to set audience expectations
- **Improve SEO** - Analyze keyword density and optimize content for search engines
- **Plan Presentations** - Estimate speaking time for speeches and presentations
- **Write Better** - Track text metrics to improve writing quality and consistency
- **Save Time** - Get instant analysis without manual counting or external tools

## Key Features

### 1. **Real-Time Text Analysis**
Instant updates as you type or paste:
- Automatic calculation without clicking "analyze" buttons
- Zero latency with client-side processing
- No page refreshes or delays

### 2. **Comprehensive Statistics**
Six core text metrics:
- **Words**: Total word count using smart word boundary detection
- **Characters**: Total including spaces and punctuation
- **Characters (no spaces)**: Useful for character limit requirements
- **Sentences**: Detected by punctuation marks (. ! ?)
- **Paragraphs**: Counted by double line breaks
- **Lines**: Number of non-empty lines

### 3. **Time Estimates**
Professional reading and speaking calculations:
- **Reading Time**: Based on 200 words/minute (average adult reading speed)
- **Speaking Time**: Based on 130 words/minute (average speaking pace)
- Formats as "X min" or "Xh Ymin" for longer content

### 4. **Advanced Word Metrics**
Detailed word-level analysis:
- **Average Word Length**: Mean characters per word (rounded to 1 decimal)
- **Longest Word**: Displays the longest word with truncation if needed
- **Longest Word Length**: Character count of longest word

### 5. **Keyword Density Analysis**
SEO-optimized keyword frequency tracking:
- Shows top 15 most frequent words
- Excludes 100+ common stop words (the, and, of, etc.)
- Displays count and percentage for each keyword
- Visual progress bars for quick comparison
- Toggle show/hide to reduce clutter

### 6. **Sample Text Loader**
Three built-in text samples for testing:
- **Short Sample**: 17 words - Pangram for quick testing
- **Medium Sample**: 100+ words - Lorem ipsum paragraphs
- **Long Sample**: 250+ words - Multi-paragraph religious text
- One-click loading for instant demonstrations

### 7. **Text Management**
Convenient text handling:
- Copy text to clipboard with one click
- Clear text instantly to start fresh
- Large resizable textarea (24rem minimum height)
- Disabled buttons when no text present

### 8. **Privacy-First Design**
All processing happens locally:
- No text sent to servers
- No data collection or storage
- Complete privacy for sensitive content
- Works offline after initial page load

## How It Works

### Text Analysis Algorithm

The tool uses regex patterns and string manipulation for accurate counting:

```typescript
interface TextStatistics {
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

function analyzeText(text: string): TextStatistics {
  // Character counts
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  
  // Word count with smart boundaries (includes hyphens and apostrophes)
  const wordMatches = text.match(/\b[\w'-]+\b/g)
  const words = wordMatches ? wordMatches.length : 0
  const wordArray = wordMatches || []
  
  // Average word length
  const totalWordLength = wordArray.reduce((sum, word) => sum + word.length, 0)
  const averageWordLength = words > 0 
    ? Number((totalWordLength / words).toFixed(1)) 
    : 0
  
  // Longest word
  const longestWord = wordArray.reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    ''
  )
  
  // Sentence count (by punctuation)
  const sentenceMatches = text.match(/[.!?]+/g)
  const sentences = sentenceMatches ? sentenceMatches.length : 0
  
  // Paragraph count (double newlines)
  const paragraphs = text.split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0)
    .length
  
  // Line count (non-empty lines)
  const lines = text.split('\n')
    .filter((line) => line.trim().length > 0)
    .length
  
  // Time calculations
  const readingTime = Number((words / 200).toFixed(1))  // 200 WPM
  const speakingTime = Number((words / 130).toFixed(1)) // 130 WPM
  
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
    longestWordLength: longestWord.length,
  }
}
```

### Keyword Density Calculation

Excludes 100+ stop words and ranks by frequency:

```typescript
interface KeywordFrequency {
  word: string
  count: number
  percentage: number
}

function calculateKeywordDensity(text: string, topN = 10): KeywordFrequency[] {
  // Extract words and convert to lowercase
  const wordMatches = text.toLowerCase().match(/\b[\w'-]+\b/g)
  if (!wordMatches) return []
  
  // Stop words list (the, and, of, to, in, etc.)
  const stopWords = new Set(['the', 'be', 'to', 'of', 'and', ...])
  
  // Count frequencies
  const frequencyMap = new Map<string, number>()
  const totalWords = wordMatches.length
  
  for (const word of wordMatches) {
    // Skip stop words and very short words (≤2 chars)
    if (stopWords.has(word) || word.length <= 2) continue
    
    frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1)
  }
  
  // Sort by frequency and return top N
  return Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: Number(((count / totalWords) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
}
```

### Time Formatting

Human-readable time display:

```typescript
function formatTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}
```

## Usage Instructions

### Basic Workflow

1. **Enter Text**
   - Type directly into the textarea
   - Paste content from clipboard (Ctrl/Cmd + V)
   - Or click a sample button to load example text

2. **View Statistics**
   - All metrics update instantly as you type
   - No need to click buttons or wait for processing
   - Statistics panels show color-coded results

3. **Analyze Keywords (Optional)**
   - Click "Show" in Keyword Density section
   - View top 15 most frequent words
   - See counts, percentages, and visual bars
   - Click "Hide" to collapse

4. **Copy or Clear**
   - Click "Copy Text" to add to clipboard
   - Click "Clear" to reset and start over
   - Both buttons disabled when textarea is empty

### Common Use Cases

**Blog Post Writing**
```
Purpose: Ensure article meets 800-1200 word target
Action: Paste draft and check word count
Key Metric: Words, Reading Time
```

**Social Media Content**
```
Purpose: Stay within character limits (280 for Twitter)
Action: Type tweet and check Characters count
Key Metric: Characters (no spaces for some platforms)
```

**Academic Essays**
```
Purpose: Meet professor's 1500-2000 word requirement
Action: Paste essay and verify word count
Key Metric: Words, Pages (estimate 250 words/page)
```

**SEO Optimization**
```
Purpose: Analyze keyword usage and density
Action: Click "Show" in Keyword Density section
Key Metric: Keyword percentages (target 2-3% for primary keywords)
```

**Speech Preparation**
```
Purpose: Calculate speech duration for 10-minute talk
Action: Paste speech script
Key Metric: Speaking Time (target ~1300 words for 10 min)
```

**Newsletter Content**
```
Purpose: Estimate reader engagement time
Action: Paste newsletter content
Key Metric: Reading Time (target 5-7 minutes)
```

**Resume/Cover Letter**
```
Purpose: Keep within one-page limit (~500 words)
Action: Paste content and check word count
Key Metric: Words, Characters
```

## Analytics Events

The tool tracks the following user interactions:

```typescript
// Text input (tracked when length > 0)
trackToolEvent('word_counter_text_changed', {
  wordCount: number // Word count of current text
})

// Clear button clicked
trackToolEvent('word_counter_cleared')

// Copy button clicked
trackToolEvent('word_counter_copied', {
  textLength: number // Character count of copied text
})

// Sample text loaded
trackToolEvent('word_counter_sample_loaded', {
  sample: 'short' | 'medium' | 'long'
})

// Keywords displayed
trackToolEvent('word_counter_keywords_viewed')
```

## UI/UX Design

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│            Header: "Word Counter Pro"                     │
│     "Comprehensive text analysis tool..."                 │
└──────────────────────────────────────────────────────────┘
┌─────────────────────────┬────────────────────────────────┐
│  Text Input Area (2fr)  │   Statistics Panels (1fr)      │
│                         │                                 │
│  [Short][Medium][Long]  │  ┌──────────────────────────┐  │
│                         │  │  Statistics              │  │
│  ┌──────────────────┐   │  │  • Words                 │  │
│  │  Large Textarea  │   │  │  • Characters            │  │
│  │  (24rem height)  │   │  │  • Chars (no spaces)     │  │
│  │                  │   │  │  • Sentences             │  │
│  │  "Type or paste"│   │  │  • Paragraphs            │  │
│  │                  │   │  │  • Lines                 │  │
│  └──────────────────┘   │  └──────────────────────────┘  │
│                         │                                 │
│  [Copy] [Clear]         │  ┌──────────────────────────┐  │
│                         │  │  Time Estimates          │  │
│                         │  │  • Reading Time (200wpm) │  │
│                         │  │  • Speaking (130wpm)     │  │
│                         │  └──────────────────────────┘  │
│                         │                                 │
│                         │  ┌──────────────────────────┐  │
│                         │  │  Additional Stats        │  │
│                         │  │  • Avg Word Length       │  │
│                         │  │  • Longest Word          │  │
│                         │  │  • Longest Word Length   │  │
│                         │  └──────────────────────────┘  │
│                         │                                 │
│                         │  ┌──────────────────────────┐  │
│                         │  │  Keyword Density [Show]  │  │
│                         │  │  (Collapsible list)      │  │
│                         │  └──────────────────────────┘  │
└─────────────────────────┴────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                Tips & Features (3-column grid)            │
│  [Real-time]  [Reading Time]  [Speaking Time]            │
│  [Keywords]   [Samples]        [Privacy]                 │
└──────────────────────────────────────────────────────────┘
```

### Visual Design

**Color Palette:**
- Primary gradient: Blue-400 → Cyan-400
- Stat icons: Color-coded (Blue, Cyan, Teal, Green, Emerald, Lime, Purple, Pink)
- Panels: Gray-900 with Gray-800 borders
- Keyword bars: Blue-500 progress indicators

**Interactive Elements:**
- Glassmorphic cards with backdrop blur
- Resizable textarea with focus ring (Blue-500)
- Hover states on all buttons (color transition)
- Disabled state for empty text (50% opacity)
- Keyword toggle button changes color when active

**Typography:**
- Sans-serif for UI and statistics
- Monospace not used (plain text display)
- Responsive font sizes for header (3xl/4xl/5xl)
- Truncation with title attribute for long words

### Responsive Behavior

**Desktop (lg+):**
- 2-column grid: Text area (2fr) | Statistics (1fr)
- Tips section: 3-column grid
- All panels visible simultaneously

**Tablet (md):**
- 2-column grid maintained
- Tips: 2-column grid
- Slightly reduced spacing

**Mobile (base):**
- Single column stacked layout
- Statistics stack below text area
- Tips: Single column
- Reduced padding (4 instead of 6)

## Performance Optimizations

1. **Memoized Calculations**
   - `useMemo` for statistics (only recalculates when text changes)
   - `useMemo` for keywords (only when text changes AND shown)
   - Prevents unnecessary re-renders on other state changes

2. **Lazy Keyword Analysis**
   - Keywords only calculated when "Show" is clicked
   - Reduces initial render time for large texts
   - Empty array returned immediately when hidden

3. **Efficient Regex**
   - Single-pass word extraction: `/\b[\w'-]+\b/g`
   - Optimized sentence detection: `/[.!?]+/g`
   - Paragraph splitting with whitespace handling

4. **Smart Stop Words**
   - Set data structure for O(1) lookup
   - 100+ stop words pre-filtered
   - Reduces frequency map size significantly

5. **Minimal DOM Updates**
   - Controlled components with React state
   - No unnecessary re-renders with proper memoization
   - Conditional rendering for keyword section

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Text Analysis | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ 63+ | ✅ 53+ | ✅ 13.1+ | ✅ 79+ |
| Textarea Resize | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |
| Backdrop Filter | ✅ 76+ | ⚠️ 103+ | ✅ 9+ | ✅ 79+ |
| useMemo Hook | ✅ | ✅ | ✅ | ✅ |

**Fallbacks:**
- Clipboard API: Silent failure (no error shown to user)
- Backdrop filter: Degrades to solid background color

## Common Questions

**Q: How accurate is the word count?**  
A: Very accurate. Uses regex `/\b[\w'-]+\b/g` which correctly handles hyphenated words, contractions, and apostrophes (e.g., "don't", "self-aware").

**Q: Why does my sentence count seem off?**  
A: Sentence detection looks for `.`, `!`, and `?` characters. Abbreviations (e.g., "Dr.", "U.S.A.") may be counted as sentence endings.

**Q: What's the difference between paragraphs and lines?**  
A: Paragraphs are separated by double line breaks (`\n\n`), while lines are single line breaks. Useful for poetry vs. prose.

**Q: Why don't I see my keyword in the density list?**  
A: Keywords must be 3+ characters and not in the stop words list (100+ common words like "the", "and", "of" are excluded).

**Q: Is the reading time accurate?**  
A: It's based on the industry standard of 200 words per minute. Actual reading speed varies by complexity, familiarity, and individual reader.

**Q: How is speaking time different from reading time?**  
A: Speaking is slower (130 WPM vs 200 WPM). Useful for presentations, podcasts, or videos where you're narrating text.

**Q: Can I customize the stop words list?**  
A: Not currently through the UI. Stop words are hardcoded but may become customizable in future versions.

**Q: Does this work for non-English text?**  
A: Partially. Word/character counts work for all languages, but stop words are English-only, affecting keyword density for other languages.

**Q: Can I save my text?**  
A: Not directly in the tool. Use the Copy button and paste into your preferred note-taking app or text editor.

**Q: Why does keyword percentage exceed 100% total?**  
A: Each keyword's percentage is calculated independently (keyword count / total words). They don't need to sum to 100%.

## Future Enhancements

- [ ] **Download statistics as PDF/CSV** - Export analysis report for documentation
- [ ] **Text comparison mode** - Compare two texts side-by-side with diff highlighting
- [ ] **Custom stop words** - Add/remove words from keyword density exclusion list
- [ ] **Multi-language support** - Stop words and analysis for Spanish, French, German, etc.
- [ ] **Readability scores** - Flesch-Kincaid, Gunning Fog, SMOG index
- [ ] **Grammar statistics** - Passive voice detection, sentence complexity analysis
- [ ] **Text history** - Save and restore previous analyses
- [ ] **Batch analysis** - Upload multiple documents and compare statistics
- [ ] **API access** - Programmatic text analysis endpoint
- [ ] **Custom WPM rates** - Adjust reading/speaking speed assumptions
- [ ] **Character frequency chart** - Visualize letter distribution
- [ ] **Sentiment analysis** - Basic positive/negative tone detection
- [ ] **Export highlights** - Download keyword-highlighted text as HTML
- [ ] **Voice input** - Dictate text using Web Speech API
- [ ] **Dark mode toggle** - Switch between light/dark themes

## Related Tools

- **Lorem Ipsum Generator** - Generate placeholder text to analyze
- **Text Transformer & Counter** - Transform and manipulate text with 20+ operations
- **Grammar & Spell Checker** - Check text for errors with AI-powered suggestions
- **Markdown Editor & Preview** - Write and analyze markdown documents
- **Keyword Density Analyzer** - Dedicated SEO keyword analysis tool
- **Text Summarizer** - AI-powered text summarization

## Tips & Best Practices

💡 **Use sample texts to explore** - Click the sample buttons to instantly see how the tool works with different text lengths.

💡 **Check keyword density for SEO** - Aim for 2-3% density for primary keywords, 1-2% for secondary keywords. Higher percentages risk keyword stuffing penalties.

💡 **Estimate blog post length** - Target 1,500-2,500 words for long-form content, 300-600 words for short posts. Check reading time to set expectations.

💡 **Optimize for readability** - Shorter average word length (4-5 chars) and shorter sentences generally improve readability for web content.

💡 **Plan speech timing** - Add 10-15% buffer time to speaking estimates for pauses, questions, and transitions in presentations.

💡 **Track writing progress** - Paste your draft periodically to see word count grow toward your target (e.g., 50,000 words for NaNoWriMo).

💡 **Test social media limits** - Twitter allows 280 characters, Instagram captions 2,200, Facebook posts have no limit but optimal is 40-80 chars.

💡 **Analyze competitor content** - Copy successful blog posts or articles to see their structure (word count, sentence length, keyword usage).

💡 **Use for accessibility** - Shorter paragraphs (3-5 sentences) and sentences (15-20 words) improve accessibility for readers with cognitive disabilities.

💡 **Compare before/after editing** - Analyze original draft vs. edited version to see how revisions affect length, readability, and keyword distribution.

---

**Route:** `/tools/productivity/word-counter`  
**Component:** `app/tools/productivity/word-counter/page.tsx`  
**Dependencies:** 
- `lucide-react` - Icons (FileText, Type, Hash, Clock, Mic, Copy, RotateCcw)
- `@/lib/services/analytics` - Event tracking
- `@/styled-system/css` - Panda CSS styling
- React hooks: `useState`, `useMemo`

**Templates File:** `app/tools/productivity/word-counter/templates.ts`  
**Stop Words:** 100+ common English words excluded from keyword analysis  
**Test Coverage:** Not yet implemented (TODO: Add vitest tests for analysis functions)
