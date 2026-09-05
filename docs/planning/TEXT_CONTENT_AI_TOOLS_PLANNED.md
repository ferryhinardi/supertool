# Text, Content & AI Tools - Implementation Plan

**Created**: October 28, 2025  
**Status**: Planning Phase  
**Category**: Text, Content & AI Tools (distributed across `development` and `productivity` categories)  
**Estimated Timeline**: 5 weeks (3 phases)

## Overview

Adding 5 AI-powered and text analysis tools focused on content creation, optimization, and analysis. These tools leverage modern AI APIs (GPT, LanguageTool) and NLP algorithms for advanced text processing. Three tools require paid API access, making them subscription-based.

**Category Distribution Decision**: Instead of creating a new "Text, Content & AI Tools" category, these tools are distributed across existing categories based on their primary use case:

- **Productivity** (4 tools): Grammar Checker, Text Summarizer, Keyword Density, Text Similarity - content/writing tools
- **Development** (1 tool): AI Prompt Explainer - developer/AI tool

**Pricing Model**:

- **Free** (1 tool): Keyword Density Analyzer
- **Freemium** (2 tools): AI Prompt Explainer, Text Similarity Checker
- **Paid/Subscription** (2 tools): Grammar Checker, Text Summarizer

---

## Tools Summary

| Tool                     | Category     | Stack            | Pricing  | API Cost        | Priority |
| ------------------------ | ------------ | ---------------- | -------- | --------------- | -------- |
| Grammar & Spell Checker  | productivity | LanguageTool API | Paid     | $0.002/request  | High     |
| AI Prompt Explainer      | development  | GPT-4 API        | Freemium | $0.03/1K tokens | High     |
| Text Summarizer          | productivity | GPT-4 API        | Paid     | $0.03/1K tokens | Medium   |
| Keyword Density Analyzer | productivity | Pure JS          | Free     | None            | High     |
| Text Similarity Checker  | productivity | NLP.js / TF-IDF  | Freemium | None            | Medium   |

---

## 1. Grammar & Spell Checker ✍️

### Description

AI-powered grammar and spell checker using LanguageTool API. Detects grammar errors, spelling mistakes, style issues, and provides contextual suggestions. Supports 25+ languages with real-time checking.

### Key Features

- **Grammar Checking**: Detect grammatical errors and suggest fixes
- **Spell Checking**: Identify typos and spelling mistakes
- **Style Recommendations**: Improve writing clarity and conciseness
- **Multi-language Support**: 25+ languages including English, Spanish, French, German
- **Contextual Suggestions**: AI-powered corrections based on context
- **Tone Detector**: Formal, casual, business, academic writing styles
- **Readability Score**: Flesch-Kincaid grade level analysis
- **Export Report**: Download detailed grammar report

### Technical Stack

```typescript
// Core API
- LanguageTool API: "https://languagetool.org/api/v2"
  - Free tier: 20 requests/day
  - Paid tier: Unlimited requests ($0.002/request)

// Alternative (if LanguageTool unavailable)
- OpenAI GPT-4 API for grammar checking
- Hunspell dictionaries for spell checking

// Frontend
- React 19 with TypeScript
- CodeMirror for text editor with highlighting
- Supabase for user subscription tracking
```

### Implementation Details

**API Integration**:

```typescript
interface GrammarCheckRequest {
  text: string;
  language: string; // 'en-US', 'es', 'fr', etc.
  level?: "default" | "picky"; // strictness level
}

interface GrammarMatch {
  message: string;
  shortMessage: string;
  replacements: string[];
  offset: number;
  length: number;
  context: {
    text: string;
    offset: number;
    length: number;
  };
  rule: {
    id: string;
    category: {
      id: string;
      name: string;
    };
    issueType: string; // 'grammar', 'spelling', 'style', etc.
  };
}

interface GrammarCheckResponse {
  matches: GrammarMatch[];
  language: {
    name: string;
    code: string;
  };
}

async function checkGrammar(
  request: GrammarCheckRequest
): Promise<GrammarCheckResponse> {
  const response = await fetch("https://api.languagetool.org/v2/check", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      text: request.text,
      language: request.language,
      level: request.level || "default",
    }),
  });

  return await response.json();
}
```

**Text Highlighting**:

```typescript
function highlightErrors(
  text: string,
  matches: GrammarMatch[]
): React.ReactNode {
  let lastIndex = 0;
  const elements: React.ReactNode[] = [];

  // Sort matches by offset
  const sortedMatches = [...matches].sort((a, b) => a.offset - b.offset);

  for (const match of sortedMatches) {
    // Add text before error
    if (match.offset > lastIndex) {
      elements.push(text.substring(lastIndex, match.offset));
    }

    // Add highlighted error
    const errorText = text.substring(match.offset, match.offset + match.length);
    const errorClass =
      match.rule.issueType === "spelling" ? "spelling-error" : "grammar-error";

    elements.push(
      <span key={match.offset} className={errorClass} title={match.message}>
        {errorText}
      </span>
    );

    lastIndex = match.offset + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
}
```

**Readability Analysis**:

```typescript
interface ReadabilityScore {
  fleschReadingEase: number; // 0-100 (higher = easier)
  fleschKincaidGrade: number; // US grade level
  gunningFog: number;
  smogIndex: number;
  colemanLiauIndex: number;
  automatedReadabilityIndex: number;
}

function calculateReadability(text: string): ReadabilityScore {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const sentenceCount = sentences.length;
  const wordCount = words.length;
  const syllableCount = syllables;

  // Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const fleschReadingEase =
    206.835 -
    1.015 * (wordCount / sentenceCount) -
    84.6 * (syllableCount / wordCount);

  // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const fleschKincaidGrade =
    0.39 * (wordCount / sentenceCount) +
    11.8 * (syllableCount / wordCount) -
    15.59;

  return {
    fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
    // ... other metrics
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const syllableMatches = word.match(/[aeiouy]{1,2}/g);
  return syllableMatches ? syllableMatches.length : 1;
}
```

### UI/UX Design

- **Split Editor**: Left pane for text input (CodeMirror), right pane for suggestions
- **Inline Highlighting**: Underline errors with different colors (red=spelling, blue=grammar, yellow=style)
- **Suggestion Cards**: Click error to see suggestion card with "Apply" button
- **Language Selector**: Dropdown to choose checking language
- **Readability Panel**: Bottom panel showing readability scores and metrics
- **Error Statistics**: Count of grammar/spelling/style issues
- **Subscription Badge**: Show remaining free checks or Pro status
- **Export Options**: Download corrected text or full report

### Pricing Strategy

**Free Tier**:

- 20 grammar checks per day
- Basic English checking
- Limited to 5000 characters per check

**Pro Tier ($9.99/month)**:

- Unlimited grammar checks
- All 25+ languages
- Up to 20,000 characters per check
- Advanced style suggestions
- Tone analysis
- Priority support

### SEO Keywords

- grammar checker online
- spell checker
- grammar check free
- writing assistant
- proofreading tool
- grammar correction

---

## 2. AI Prompt Explainer 💡

### Description

Analyze and optimize AI prompts for better results with GPT models. Provides detailed explanations, improvement suggestions, and prompt engineering best practices. Helps users understand what makes a good prompt.

### Key Features

- **Prompt Analysis**: Break down prompt structure and components
- **Quality Score**: Rate prompt effectiveness (0-100)
- **Improvement Suggestions**: AI-powered recommendations
- **Best Practices**: Prompt engineering tips and examples
- **Before/After Comparison**: Show optimized version
- **Template Library**: Pre-built prompt templates by use case
- **Technique Explainer**: Explain techniques (chain-of-thought, few-shot, etc.)
- **Token Estimator**: Show estimated token usage

### Technical Stack

```typescript
// Core API
- OpenAI GPT-4 API (gpt-4-turbo-preview)
  - Cost: $0.03 per 1K tokens (input/output)
  - Free tier: 5 analyses per day
  - Pro tier: Unlimited with usage-based billing

// Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- Supabase for subscription management
```

### Implementation Details

**Prompt Analysis Algorithm**:

```typescript
interface PromptAnalysis {
  qualityScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimizedPrompt: string;
  techniques: PromptTechnique[];
  tokenEstimate: number;
  complexity: "beginner" | "intermediate" | "advanced";
}

interface PromptTechnique {
  name: string;
  description: string;
  present: boolean;
  recommendation?: string;
}

const PROMPT_TECHNIQUES: PromptTechnique[] = [
  {
    name: "Clear Instructions",
    description: "Explicit task description with specific requirements",
    present: false,
  },
  {
    name: "Context Provision",
    description: "Background information and constraints provided",
    present: false,
  },
  {
    name: "Output Format Specification",
    description: "Desired format (JSON, list, paragraph) clearly stated",
    present: false,
  },
  {
    name: "Few-Shot Examples",
    description: "Example inputs and outputs to guide the model",
    present: false,
  },
  {
    name: "Chain-of-Thought",
    description: "Encourages step-by-step reasoning",
    present: false,
  },
  {
    name: "Role Assignment",
    description: "Assigns a specific persona or expertise to the AI",
    present: false,
  },
];

async function analyzePrompt(userPrompt: string): Promise<PromptAnalysis> {
  const systemPrompt = `You are an expert in prompt engineering. Analyze the following user prompt and provide:
1. A quality score from 0-100
2. List of strengths (what works well)
3. List of weaknesses (what could be improved)
4. Specific suggestions for improvement
5. An optimized version of the prompt
6. Which prompt engineering techniques are present

Format your response as JSON matching the PromptAnalysis interface.

User Prompt:
"""
${userPrompt}
"""
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

**Token Estimation**:

```typescript
import { encoding_for_model } from "tiktoken";

function estimateTokens(text: string, model: string = "gpt-4"): number {
  try {
    const encoding = encoding_for_model(model);
    const tokens = encoding.encode(text);
    encoding.free();
    return tokens.length;
  } catch (error) {
    // Fallback: rough estimate (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}

function calculateCost(tokens: number, model: string = "gpt-4"): number {
  const pricing = {
    "gpt-4": 0.03, // per 1K tokens
    "gpt-4-turbo": 0.01,
    "gpt-3.5-turbo": 0.0015,
  };

  return (tokens / 1000) * pricing[model];
}
```

**Template Library**:

````typescript
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: "content" | "code" | "analysis" | "creative" | "general";
  template: string;
  variables: string[];
  example: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "content-summarize",
    name: "Content Summarizer",
    description: "Summarize long content into key points",
    category: "content",
    template:
      "Summarize the following text in {{length}} bullet points, focusing on {{focus}}:\n\n{{text}}",
    variables: ["length", "focus", "text"],
    example:
      "Summarize the following text in 5 bullet points, focusing on key takeaways:\n\n[Your content here]",
  },
  {
    id: "code-review",
    name: "Code Reviewer",
    description: "Get code review suggestions",
    category: "code",
    template:
      "Act as a senior {{language}} developer. Review this code and provide feedback on:\n1. Code quality\n2. Best practices\n3. Potential bugs\n4. Performance optimizations\n\n```{{language}}\n{{code}}\n```",
    variables: ["language", "code"],
    example: "Act as a senior JavaScript developer. Review this code...",
  },
  // ... more templates
];
````

### UI/UX Design

- **Two-Column Layout**: Original prompt (left), Analysis results (right)
- **Quality Gauge**: Large circular gauge showing score with color coding
- **Technique Checklist**: Visual indicators for present/missing techniques
- **Suggestion Cards**: Expandable cards with improvement tips
- **Before/After Toggle**: Switch between original and optimized prompts
- **Template Browser**: Grid of templates with preview on hover
- **Token Counter**: Live token estimation and cost calculator
- **Copy Buttons**: Quick copy for optimized prompt

### Pricing Strategy

**Free Tier**:

- 5 prompt analyses per day
- Basic quality score and suggestions
- Access to template library

**Pro Tier ($14.99/month)**:

- Unlimited prompt analyses
- Advanced AI-powered insights
- Custom template creation
- Priority processing
- Historical analysis tracking

### SEO Keywords

- ai prompt optimizer
- prompt engineering tool
- chatgpt prompt helper
- prompt analyzer
- prompt improvement tool
- ai prompt tutorial

---

## 3. Text Summarizer 📝

### Description

AI-powered text summarization tool that condenses long articles, documents, and content into concise summaries. Adjustable length and tone for different use cases (executive summary, bullet points, tweet-length).

### Key Features

- **Multiple Summary Types**: Paragraph, bullet points, key takeaways, tweet-length
- **Adjustable Length**: Short (25%), Medium (50%), Long (75%)
- **Tone Control**: Formal, casual, technical, journalistic
- **Key Highlight Extraction**: Pull out important quotes and statistics
- **Multi-document Summarization**: Combine multiple texts (Pro)
- **Language Detection**: Auto-detect and summarize in original language
- **Export Options**: Download as Markdown, PDF, or plain text
- **Summary Comparison**: See different length versions side-by-side

### Technical Stack

```typescript
// Core API
- OpenAI GPT-4 API
  - Model: gpt-4-turbo-preview
  - Cost: $0.03 per 1K tokens

// Alternative APIs
- Claude 3 (Anthropic) for longer texts (100K+ tokens)
- Cohere Summarize API (cheaper alternative)

// Frontend
- React 19
- PDF generation: jsPDF or react-pdf
- Markdown rendering: react-markdown
```

### Implementation Details

**Summarization Engine**:

```typescript
interface SummarizeRequest {
  text: string;
  length: "short" | "medium" | "long"; // 25%, 50%, 75%
  format: "paragraph" | "bullets" | "highlights" | "tweet";
  tone: "formal" | "casual" | "technical" | "journalistic";
  language?: string; // auto-detect if not provided
}

interface SummarizeResponse {
  summary: string;
  highlights: string[];
  wordCount: {
    original: number;
    summary: number;
    reduction: number; // percentage
  };
  readingTime: {
    original: number; // minutes
    summary: number;
  };
  tokenUsage: {
    input: number;
    output: number;
    cost: number;
  };
}

async function summarizeText(
  request: SummarizeRequest
): Promise<SummarizeResponse> {
  const lengthInstructions = {
    short: "Reduce to approximately 25% of original length",
    medium: "Reduce to approximately 50% of original length",
    long: "Reduce to approximately 75% of original length, keeping important details",
  };

  const formatInstructions = {
    paragraph: "Write as flowing paragraphs",
    bullets: "Format as bullet points with clear structure",
    highlights: "Extract only the most important points and quotes",
    tweet: "Condense into a single tweet (280 characters max)",
  };

  const toneInstructions = {
    formal: "Use formal, professional language",
    casual: "Use conversational, easy-to-read language",
    technical: "Preserve technical terminology and accuracy",
    journalistic: "Use journalistic style with inverted pyramid structure",
  };

  const systemPrompt = `You are an expert text summarizer. Your task is to:
1. ${lengthInstructions[request.length]}
2. ${formatInstructions[request.format]}
3. ${toneInstructions[request.tone]}
4. Preserve key facts, figures, and important information
5. Maintain the main argument or narrative flow

After the summary, provide a JSON object with:
{
  "highlights": ["key point 1", "key point 2", ...],
  "mainThemes": ["theme 1", "theme 2", ...]
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.text },
      ],
      temperature: 0.3,
      max_tokens: calculateMaxTokens(request),
    }),
  });

  const data = await response.json();

  return {
    summary: extractSummary(data.choices[0].message.content),
    highlights: extractHighlights(data.choices[0].message.content),
    wordCount: {
      original: countWords(request.text),
      summary: countWords(data.choices[0].message.content),
      reduction: calculateReduction(
        request.text,
        data.choices[0].message.content
      ),
    },
    readingTime: {
      original: calculateReadingTime(request.text),
      summary: calculateReadingTime(data.choices[0].message.content),
    },
    tokenUsage: {
      input: data.usage.prompt_tokens,
      output: data.usage.completion_tokens,
      cost: calculateCost(data.usage.total_tokens, "gpt-4"),
    },
  };
}
```

**Long Document Handling**:

```typescript
async function summarizeLongDocument(
  text: string,
  options: SummarizeRequest
): Promise<SummarizeResponse> {
  const maxChunkSize = 8000; // tokens (leave room for prompt)

  // Split into chunks if text is too long
  const chunks = splitIntoChunks(text, maxChunkSize);

  if (chunks.length === 1) {
    return summarizeText({ ...options, text });
  }

  // Recursive summarization for long texts
  // 1. Summarize each chunk
  const chunkSummaries = await Promise.all(
    chunks.map((chunk) =>
      summarizeText({ ...options, text: chunk, length: "medium" })
    )
  );

  // 2. Combine chunk summaries
  const combinedSummary = chunkSummaries.map((s) => s.summary).join("\n\n");

  // 3. Final summarization pass
  return summarizeText({ ...options, text: combinedSummary });
}

function splitIntoChunks(text: string, maxTokens: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const estimatedTokens = estimateTokens(currentChunk + "\n\n" + paragraph);

    if (estimatedTokens > maxTokens && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}
```

### UI/UX Design

- **Three-Panel Layout**: Input (left), Controls (middle), Output (right)
- **Length Slider**: Visual slider for 25%/50%/75% reduction
- **Format Toggle**: Radio buttons for paragraph/bullets/highlights/tweet
- **Tone Selector**: Dropdown for tone selection
- **Live Statistics**: Word count, reading time, reduction percentage
- **Highlight Panel**: Separate section for key takeaways
- **Export Menu**: Multiple export format options
- **Comparison View**: Toggle to see multiple summary versions

### Pricing Strategy

**Free Tier**:

- 3 summaries per day
- Max 2000 words per text
- Basic format options

**Pro Tier ($12.99/month)**:

- Unlimited summaries
- Max 50,000 words per text
- All format and tone options
- Multi-document summarization
- Priority processing
- Export to PDF

### SEO Keywords

- text summarizer online
- ai summarizer
- article summarizer
- document summarizer
- summary generator
- text condenser

---

## 4. Keyword Density Analyzer 📊

### Description

Free SEO tool to analyze keyword usage and density in content. Track keyword frequency, identify overuse, and get suggestions for optimal keyword distribution. Perfect for content writers and SEO specialists.

### Key Features

- **Keyword Tracking**: Track single keywords and phrases (1-5 words)
- **Density Calculation**: Percentage of text occupied by keywords
- **Frequency Visualization**: Bar charts and word clouds
- **Overuse Detection**: Flag keywords used too frequently (stuffing)
- **Related Keywords**: Suggest semantically related terms
- **Competitor Comparison**: Compare with target keyword density
- **SEO Score**: Overall content optimization score
- **Export Report**: Download keyword analysis as CSV/PDF

### Technical Stack

```typescript
// Pure client-side (no API costs)
- Natural language processing: compromise.js (lightweight NLP)
- Text processing: Pure JavaScript
- Visualization: Chart.js or Recharts
- Word cloud: react-wordcloud

// No backend needed - all processing in browser
```

### Implementation Details

**Keyword Extraction**:

```typescript
interface KeywordAnalysis {
  keyword: string;
  frequency: number;
  density: number; // percentage
  prominence: number; // 0-100 (based on position in text)
  firstOccurrence: number;
  contexts: string[]; // surrounding text samples
}

interface ContentAnalysis {
  totalWords: number;
  uniqueWords: number;
  keywords: KeywordAnalysis[];
  seoScore: number;
  recommendations: string[];
  keywordStuffingScore: number; // 0-100 (lower is better)
}

function analyzeKeywordDensity(
  text: string,
  targetKeywords: string[] = []
): ContentAnalysis {
  // Normalize text
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  const totalWords = words.length;

  // Extract n-grams (1-5 words)
  const ngrams = extractNGrams(words, 1, 5);

  // Count frequencies
  const frequencyMap = new Map<string, number>();
  for (const ngram of ngrams) {
    const key = ngram.join(" ");
    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  }

  // Filter out stop words and calculate density
  const keywords: KeywordAnalysis[] = [];

  for (const [keyword, frequency] of frequencyMap.entries()) {
    if (isStopWord(keyword)) continue;
    if (frequency < 2) continue; // Only include keywords used 2+ times

    const wordCount = keyword.split(" ").length;
    const density = ((frequency * wordCount) / totalWords) * 100;

    // Skip if density too low (< 0.1%)
    if (density < 0.1) continue;

    keywords.push({
      keyword,
      frequency,
      density,
      prominence: calculateProminence(text, keyword),
      firstOccurrence: text.toLowerCase().indexOf(keyword),
      contexts: extractContexts(text, keyword, 3),
    });
  }

  // Sort by density
  keywords.sort((a, b) => b.density - a.density);

  // Calculate SEO score
  const seoScore = calculateSEOScore(keywords, totalWords, targetKeywords);

  // Generate recommendations
  const recommendations = generateRecommendations(
    keywords,
    totalWords,
    targetKeywords
  );

  return {
    totalWords,
    uniqueWords: frequencyMap.size,
    keywords: keywords.slice(0, 50), // Top 50 keywords
    seoScore,
    recommendations,
    keywordStuffingScore: calculateStuffingScore(keywords),
  };
}

function extractNGrams(
  words: string[],
  minN: number,
  maxN: number
): string[][] {
  const ngrams: string[][] = [];

  for (let n = minN; n <= maxN; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n));
    }
  }

  return ngrams;
}

function calculateProminence(text: string, keyword: string): number {
  const position = text.toLowerCase().indexOf(keyword);
  const textLength = text.length;

  // Higher score for keywords appearing earlier in text
  const positionScore = 100 * (1 - position / textLength);

  // Check if in title/headings (look for ## or # markdown)
  const inHeading = /^#+.*\b${keyword}\b/m.test(text);
  const headingBonus = inHeading ? 20 : 0;

  return Math.min(100, positionScore + headingBonus);
}

function extractContexts(
  text: string,
  keyword: string,
  count: number = 3
): string[] {
  const regex = new RegExp(`.{0,50}\\b${keyword}\\b.{0,50}`, "gi");
  const matches = text.match(regex);
  return matches ? matches.slice(0, count) : [];
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
]);

function isStopWord(phrase: string): boolean {
  const words = phrase.split(" ");
  return words.length === 1 && STOP_WORDS.has(words[0]);
}

function calculateSEOScore(
  keywords: KeywordAnalysis[],
  totalWords: number,
  targetKeywords: string[]
): number {
  let score = 0;

  // Ideal keyword density: 1-3%
  const targetDensity = keywords.filter(
    (k) => k.density >= 1 && k.density <= 3
  ).length;
  score += (targetDensity / Math.max(1, targetKeywords.length)) * 30;

  // Target keywords present
  const targetPresent = targetKeywords.filter((tk) =>
    keywords.some((k) => k.keyword.includes(tk))
  ).length;
  score += (targetPresent / Math.max(1, targetKeywords.length)) * 40;

  // No keyword stuffing (density < 5%)
  const stuffed = keywords.filter((k) => k.density > 5).length;
  score += Math.max(0, 30 - stuffed * 10);

  return Math.min(100, Math.max(0, score));
}

function calculateStuffingScore(keywords: KeywordAnalysis[]): number {
  // 0 = no stuffing, 100 = severe stuffing
  const highDensity = keywords.filter((k) => k.density > 5).length;
  const veryHighDensity = keywords.filter((k) => k.density > 8).length;

  return Math.min(100, highDensity * 10 + veryHighDensity * 20);
}

function generateRecommendations(
  keywords: KeywordAnalysis[],
  totalWords: number,
  targetKeywords: string[]
): string[] {
  const recommendations: string[] = [];

  // Check for keyword stuffing
  const stuffed = keywords.filter((k) => k.density > 5);
  if (stuffed.length > 0) {
    recommendations.push(
      `⚠️ Keyword stuffing detected: "${
        stuffed[0].keyword
      }" appears too frequently (${stuffed[0].density.toFixed(
        2
      )}%). Reduce usage to 1-3%.`
    );
  }

  // Check for missing target keywords
  const missing = targetKeywords.filter(
    (tk) => !keywords.some((k) => k.keyword.includes(tk))
  );
  if (missing.length > 0) {
    recommendations.push(
      `📝 Target keywords not found: ${missing.join(
        ", "
      )}. Consider adding them naturally to your content.`
    );
  }

  // Check for low keyword density
  const lowDensity = keywords.filter(
    (k) => k.density < 0.5 && targetKeywords.includes(k.keyword)
  );
  if (lowDensity.length > 0) {
    recommendations.push(
      `📈 Low keyword density for: "${
        lowDensity[0].keyword
      }" (${lowDensity[0].density.toFixed(2)}%). Consider increasing to 1-2%.`
    );
  }

  // Content length recommendation
  if (totalWords < 300) {
    recommendations.push(
      `📏 Content is short (${totalWords} words). Aim for 500-1000 words for better SEO.`
    );
  }

  return recommendations;
}
```

**Visualization Components**:

```typescript
// Keyword Density Chart
function KeywordDensityChart({ keywords }: { keywords: KeywordAnalysis[] }) {
  const data = keywords.slice(0, 10).map((k) => ({
    keyword: k.keyword,
    density: k.density,
    frequency: k.frequency,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={100} />
        <YAxis label={{ value: "Density (%)", angle: -90 }} />
        <Tooltip />
        <Bar dataKey="density" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Word Cloud
function KeywordCloud({ keywords }: { keywords: KeywordAnalysis[] }) {
  const words = keywords.map((k) => ({
    text: k.keyword,
    value: k.frequency,
  }));

  return (
    <ReactWordcloud
      words={words}
      options={{
        rotations: 2,
        rotationAngles: [0, 90],
        fontSizes: [14, 60],
        colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"],
      }}
    />
  );
}
```

### UI/UX Design

- **Two-Panel Layout**: Input (left 40%), Analysis (right 60%)
- **Target Keywords Input**: Chips input for tracking specific keywords
- **Live Analysis**: Update results as user types (debounced)
- **Keyword Table**: Sortable table with keyword, frequency, density, prominence
- **Density Chart**: Bar chart of top 10 keywords
- **Word Cloud**: Visual representation of keyword distribution
- **SEO Score Gauge**: Large circular gauge with color coding
- **Recommendations Panel**: Actionable tips with icons
- **Export Button**: Download analysis as CSV or PDF

### Pricing Strategy

**100% Free** - No subscription needed. All features available to everyone. Monetization through:

- Display ads (non-intrusive)
- Affiliate links to SEO tools
- "Upgrade to Pro" prompts for other paid tools

### SEO Keywords

- keyword density checker
- seo keyword analyzer
- keyword frequency tool
- keyword counter
- seo analysis tool
- keyword optimization

---

## 5. Text Similarity Checker 🔍

### Description

Compare text blocks and measure similarity percentage using advanced NLP algorithms (TF-IDF, cosine similarity). Detect duplicate content, plagiarism, and text variations. Batch comparison available in Pro version.

### Key Features

- **Similarity Score**: 0-100% similarity rating
- **Algorithm Selection**: TF-IDF, Cosine Similarity, Levenshtein Distance, Jaccard Index
- **Highlighted Differences**: Visual diff showing unique and common parts
- **Sentence-level Comparison**: Break down by sentence similarity
- **Batch Mode**: Compare multiple documents (Pro)
- **Plagiarism Detection**: Flag potential copied content
- **Citation Finder**: Identify quoted or paraphrased sections
- **Export Report**: Detailed similarity report with statistics

### Technical Stack

```typescript
// NLP Libraries
- natural: "^6.0.0" // NLP toolkit for Node.js
- compromise: "^14.0.0" // Lightweight NLP
- string-similarity: "^4.0.0" // String comparison algorithms

// Algorithms
- TF-IDF (Term Frequency-Inverse Document Frequency)
- Cosine Similarity
- Levenshtein Distance
- Jaccard Index

// Frontend
- React 19
- diff library for visual comparison
- Chart.js for similarity visualization
```

### Implementation Details

**Similarity Calculation**:

```typescript
interface SimilarityResult {
  overallScore: number; // 0-100
  algorithm: "tfidf" | "cosine" | "levenshtein" | "jaccard";
  sentenceComparison: SentenceSimilarity[];
  statistics: {
    commonWords: number;
    uniqueWords: number;
    totalWords: number;
    commonPhrases: string[];
  };
  plagiarismRisk: "low" | "medium" | "high";
}

interface SentenceSimilarity {
  text1: string;
  text2: string;
  similarity: number;
  matched: boolean;
}

// TF-IDF Implementation
class TfIdfCalculator {
  private documents: string[][];
  private vocabulary: Set<string>;
  private idf: Map<string, number>;

  constructor(texts: string[]) {
    this.documents = texts.map((text) => this.tokenize(text));
    this.vocabulary = new Set(this.documents.flat());
    this.calculateIdf();
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  private calculateIdf(): void {
    this.idf = new Map();

    for (const term of this.vocabulary) {
      const docsWithTerm = this.documents.filter((doc) =>
        doc.includes(term)
      ).length;
      this.idf.set(term, Math.log(this.documents.length / docsWithTerm));
    }
  }

  private calculateTf(term: string, document: string[]): number {
    const termCount = document.filter((word) => word === term).length;
    return termCount / document.length;
  }

  public getVector(text: string): Map<string, number> {
    const tokens = this.tokenize(text);
    const vector = new Map<string, number>();

    for (const term of this.vocabulary) {
      const tf = this.calculateTf(term, tokens);
      const idf = this.idf.get(term) || 0;
      vector.set(term, tf * idf);
    }

    return vector;
  }
}

function cosineSimilarity(
  vec1: Map<string, number>,
  vec2: Map<string, number>
): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const [term, value1] of vec1) {
    const value2 = vec2.get(term) || 0;
    dotProduct += value1 * value2;
    magnitude1 += value1 * value1;
    magnitude2 += value2 * value2;
  }

  const denominator = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

function calculateSimilarity(
  text1: string,
  text2: string,
  algorithm: string
): SimilarityResult {
  let overallScore = 0;

  switch (algorithm) {
    case "tfidf": {
      const calculator = new TfIdfCalculator([text1, text2]);
      const vec1 = calculator.getVector(text1);
      const vec2 = calculator.getVector(text2);
      overallScore = cosineSimilarity(vec1, vec2) * 100;
      break;
    }

    case "cosine": {
      const tokens1 = tokenize(text1);
      const tokens2 = tokenize(text2);
      const vec1 = createBagOfWords(tokens1, [
        ...new Set([...tokens1, ...tokens2]),
      ]);
      const vec2 = createBagOfWords(tokens2, [
        ...new Set([...tokens1, ...tokens2]),
      ]);
      overallScore = cosineSimilarity(vec1, vec2) * 100;
      break;
    }

    case "levenshtein": {
      const distance = levenshteinDistance(text1, text2);
      const maxLength = Math.max(text1.length, text2.length);
      overallScore = (1 - distance / maxLength) * 100;
      break;
    }

    case "jaccard": {
      const set1 = new Set(tokenize(text1));
      const set2 = new Set(tokenize(text2));
      const intersection = new Set([...set1].filter((x) => set2.has(x)));
      const union = new Set([...set1, ...set2]);
      overallScore = (intersection.size / union.size) * 100;
      break;
    }
  }

  // Sentence-level comparison
  const sentences1 = splitIntoSentences(text1);
  const sentences2 = splitIntoSentences(text2);
  const sentenceComparison = compareSentences(sentences1, sentences2);

  // Calculate statistics
  const tokens1 = new Set(tokenize(text1));
  const tokens2 = new Set(tokenize(text2));
  const commonWords = new Set([...tokens1].filter((x) => tokens2.has(x)));

  return {
    overallScore: Math.round(overallScore),
    algorithm,
    sentenceComparison,
    statistics: {
      commonWords: commonWords.size,
      uniqueWords: tokens1.size + tokens2.size - 2 * commonWords.size,
      totalWords: tokens1.size + tokens2.size,
      commonPhrases: findCommonPhrases(text1, text2),
    },
    plagiarismRisk:
      overallScore > 80 ? "high" : overallScore > 50 ? "medium" : "low",
  };
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function compareSentences(
  sentences1: string[],
  sentences2: string[]
): SentenceSimilarity[] {
  const results: SentenceSimilarity[] = [];

  for (const s1 of sentences1) {
    let maxSimilarity = 0;
    let bestMatch = sentences2[0];

    for (const s2 of sentences2) {
      const sim = calculateSimilarity(s1, s2, "cosine").overallScore;
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        bestMatch = s2;
      }
    }

    results.push({
      text1: s1,
      text2: bestMatch,
      similarity: maxSimilarity,
      matched: maxSimilarity > 70,
    });
  }

  return results;
}

function findCommonPhrases(
  text1: string,
  text2: string,
  minLength: number = 3
): string[] {
  const words1 = tokenize(text1);
  const words2 = tokenize(text2);
  const phrases: string[] = [];

  for (let len = minLength; len <= 10; len++) {
    for (let i = 0; i <= words1.length - len; i++) {
      const phrase = words1.slice(i, i + len).join(" ");
      const phrase2 = words2.join(" ");

      if (phrase2.includes(phrase)) {
        phrases.push(phrase);
      }
    }
  }

  return [...new Set(phrases)].sort((a, b) => b.length - a.length).slice(0, 10);
}
```

**Visual Diff Component**:

```typescript
import { diffWords } from "diff";

function TextDiffViewer({ text1, text2 }: { text1: string; text2: string }) {
  const diff = diffWords(text1, text2);

  return (
    <div className="diff-container">
      {diff.map((part, index) => (
        <span
          key={index}
          className={cx({
            "bg-green-200": part.added,
            "bg-red-200": part.removed,
            "line-through": part.removed,
          })}
        >
          {part.value}
        </span>
      ))}
    </div>
  );
}
```

### UI/UX Design

- **Split View**: Two side-by-side text editors
- **Algorithm Selector**: Dropdown to choose comparison method
- **Similarity Gauge**: Large circular gauge with color coding (green < 30%, yellow 30-70%, red > 70%)
- **Statistics Panel**: Show common/unique words, phrases
- **Sentence Comparison Table**: List of sentence pairs with similarity scores
- **Visual Diff**: Highlighted text showing additions/deletions
- **Plagiarism Risk Badge**: Color-coded badge (low/medium/high)
- **Export Report**: Download detailed comparison report

### Pricing Strategy

**Free Tier**:

- Compare 2 texts at a time
- All algorithm options
- Basic statistics

**Pro Tier ($9.99/month)**:

- Batch comparison (up to 10 documents)
- Advanced plagiarism detection
- Citation finder
- Historical comparison tracking
- API access

### SEO Keywords

- text similarity checker
- plagiarism checker
- duplicate content detector
- text comparison tool
- content similarity analyzer
- text matching tool

---

## Implementation Timeline

### Phase 1: Free Tools (Week 1-2)

**Goal**: Implement free tool to gain users

1. **Keyword Density Analyzer** (8 days)
   - Day 1-2: Implement n-gram extraction and frequency counting
   - Day 3-4: Build keyword analysis algorithms (density, prominence)
   - Day 5-6: Create visualization components (charts, word cloud)
   - Day 7: Build UI with live analysis
   - Day 8: Add SEO score and recommendations

### Phase 2: Freemium Tools (Week 3-4)

**Goal**: Implement tools with free tier and upgrade path

2. **Text Similarity Checker** (6 days)

   - Day 1-2: Implement TF-IDF and cosine similarity algorithms
   - Day 3: Add Levenshtein and Jaccard index
   - Day 4: Build sentence-level comparison
   - Day 5: Create visual diff component
   - Day 6: Add freemium paywall for batch mode

3. **AI Prompt Explainer** (7 days)
   - Day 1-2: Set up OpenAI API integration
   - Day 3: Implement prompt analysis logic
   - Day 4: Build template library
   - Day 5: Create token estimation
   - Day 6: Design UI with before/after comparison
   - Day 7: Add freemium paywall (5 analyses/day)

### Phase 3: Paid Tools (Week 5)

**Goal**: Implement subscription-only tools with high API costs

4. **Grammar & Spell Checker** (5 days)

   - Day 1: Set up LanguageTool API integration
   - Day 2: Implement error highlighting
   - Day 3: Build suggestion UI
   - Day 4: Add readability analysis
   - Day 5: Create subscription paywall

5. **Text Summarizer** (5 days)
   - Day 1-2: Set up GPT-4 API for summarization
   - Day 3: Implement multiple summary types
   - Day 4: Add long document handling
   - Day 5: Create subscription paywall and export

---

## Testing Strategy

### Unit Tests

```typescript
// Keyword Density
describe("analyzeKeywordDensity", () => {
  it("should calculate correct keyword density", () => {
    const text = "react is great. react is fast. react is popular.";
    const result = analyzeKeywordDensity(text, ["react"]);
    expect(result.keywords[0].keyword).toBe("react");
    expect(result.keywords[0].frequency).toBe(3);
    expect(result.keywords[0].density).toBeCloseTo(33.33, 1);
  });
});

// Text Similarity
describe("calculateSimilarity", () => {
  it("should detect identical texts", () => {
    const text = "The quick brown fox";
    const result = calculateSimilarity(text, text, "cosine");
    expect(result.overallScore).toBe(100);
  });

  it("should detect completely different texts", () => {
    const result = calculateSimilarity("apple banana", "car house", "jaccard");
    expect(result.overallScore).toBe(0);
  });
});
```

### Integration Tests

- Grammar Checker: Test with sample texts containing known errors
- AI Prompt Explainer: Test with good/bad prompts
- Text Summarizer: Verify summary quality and length
- Keyword Density: Test with SEO-optimized content
- Text Similarity: Test with plagiarized vs original content

---

## Analytics Events

### Grammar Checker

```typescript
trackToolEvent("grammar_check", { language: "en-US", error_count: 15 });
trackToolEvent("grammar_apply_suggestion", { error_type: "spelling" });
trackToolEvent("grammar_export_report", { format: "pdf" });
```

### AI Prompt Explainer

```typescript
trackToolEvent("prompt_analyze", { quality_score: 75, token_count: 150 });
trackToolEvent("prompt_use_template", { template_id: "content-summarize" });
trackToolEvent("prompt_upgrade_click"); // Freemium CTA
```

### Text Summarizer

```typescript
trackToolEvent("text_summarize", {
  length: "short",
  format: "bullets",
  word_count: 1500,
  reduction: 75,
});
trackToolEvent("text_export_summary", { format: "pdf" });
```

### Keyword Density

```typescript
trackToolEvent("keyword_analyze", {
  word_count: 800,
  unique_keywords: 45,
  seo_score: 82,
});
trackToolEvent("keyword_export_report", { format: "csv" });
```

### Text Similarity

```typescript
trackToolEvent("text_compare", {
  algorithm: "tfidf",
  similarity_score: 67,
  plagiarism_risk: "medium",
});
trackToolEvent("text_batch_compare"); // Pro feature
```

---

## SEO Optimization

### Meta Tags (per tool)

```typescript
// Grammar Checker
export const metadata: Metadata = generateToolMetadata({
  title: "Grammar & Spell Checker - Free Online Proofreading Tool",
  description:
    "Check grammar and spelling errors with AI. Get contextual corrections, style tips, and readability analysis in 25+ languages. Free online grammar checker.",
  keywords: [
    "grammar checker",
    "spell checker",
    "proofreading",
    "writing assistant",
    "grammar correction",
  ],
  category: "productivity",
  path: "/tools/grammar-checker",
});
```

### Structured Data

Add `SoftwareApplication` schema to each tool page with pricing info.

---

## Subscription & Pricing Strategy

### Free Tools

- **Keyword Density Analyzer**: 100% free, ad-supported

### Freemium Tools

- **AI Prompt Explainer**: 5 analyses/day free, unlimited with Pro
- **Text Similarity Checker**: 2-text comparison free, batch mode with Pro

### Paid/Subscription Tools

- **Grammar Checker**: $9.99/month (20 checks/day free tier)
- **Text Summarizer**: $12.99/month (3 summaries/day free tier)

### Bundle Pricing

- **Content Creator Bundle**: $24.99/month
  - All 5 text tools unlimited
  - Priority API access
  - No ads
  - 50% savings vs individual

---

## Future Enhancements

### Grammar Checker

- [ ] Browser extension for real-time checking
- [ ] MS Word/Google Docs integration
- [ ] Custom dictionary support
- [ ] Team collaboration features

### AI Prompt Explainer

- [ ] Prompt versioning and A/B testing
- [ ] Community prompt library
- [ ] Claude/Gemini model support
- [ ] Fine-tuning suggestions

### Text Summarizer

- [ ] Video transcript summarization
- [ ] Meeting notes summarization
- [ ] Multi-language support
- [ ] Audio input (speech-to-text + summarize)

### Keyword Density

- [ ] Competitor URL analysis
- [ ] LSI keyword suggestions
- [ ] Content optimization AI
- [ ] Google Search Console integration

### Text Similarity

- [ ] Database of known plagiarism sources
- [ ] Citation generation
- [ ] Paraphrasing suggestions
- [ ] Academic paper checking

---

## API Cost Management

### OpenAI GPT-4 Costs

- **AI Prompt Explainer**: ~500 tokens/request = $0.015/request
- **Text Summarizer**: ~2000 tokens/request = $0.06/request

### LanguageTool Costs

- **Grammar Checker**: $0.002/request (paid tier)

### Monthly Cost Estimates (1000 active users)

- AI Prompt Explainer: 1000 users × 10 analyses = 10,000 × $0.015 = **$150/month**
- Text Summarizer: 1000 users × 5 summaries = 5,000 × $0.06 = **$300/month**
- Grammar Checker: 1000 users × 20 checks = 20,000 × $0.002 = **$40/month**
- **Total API Costs**: ~$490/month

### Revenue Projections (1000 users, 10% conversion)

- 100 Pro users × $24.99 = **$2,499/month**
- **Net Profit**: $2,499 - $490 = **$2,009/month** (80% margin)

---

## Completion Checklist

### Grammar & Spell Checker

- [ ] Integrate LanguageTool API
- [ ] Implement error detection and highlighting
- [ ] Build suggestion UI with apply buttons
- [ ] Add readability analysis (Flesch-Kincaid)
- [ ] Implement language selector (25+ languages)
- [ ] Add tone detection
- [ ] Create subscription paywall
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation

### AI Prompt Explainer

- [ ] Set up OpenAI API integration
- [ ] Implement prompt analysis algorithm
- [ ] Build template library (10+ templates)
- [ ] Add token estimation and cost calculator
- [ ] Create quality score gauge
- [ ] Implement before/after comparison
- [ ] Add freemium paywall (5/day limit)
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation

### Text Summarizer

- [ ] Set up GPT-4 API
- [ ] Implement multiple summary types
- [ ] Add length and tone controls
- [ ] Implement long document chunking
- [ ] Create export functionality (PDF, Markdown)
- [ ] Add highlight extraction
- [ ] Build subscription paywall
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation

### Keyword Density Analyzer

- [ ] Implement n-gram extraction (1-5 words)
- [ ] Build keyword frequency counter
- [ ] Add density calculation algorithm
- [ ] Implement prominence scoring
- [ ] Create visualization (bar chart, word cloud)
- [ ] Add SEO score calculator
- [ ] Build recommendations engine
- [ ] Add export functionality (CSV, PDF)
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation

### Text Similarity Checker

- [ ] Implement TF-IDF algorithm
- [ ] Add cosine similarity calculation
- [ ] Implement Levenshtein distance
- [ ] Add Jaccard index
- [ ] Build sentence-level comparison
- [ ] Create visual diff component
- [ ] Implement common phrases finder
- [ ] Add freemium paywall for batch mode
- [ ] Write unit tests
- [ ] Add analytics events
- [ ] Create tool documentation
