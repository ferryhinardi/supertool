---
name: ai-features-specialist
description: Expert in AI-powered tools (Command Explainer, JSON Analyzer, Snippet Generator, Image Caption, Text Rewriter/Summarizer) using GPT-4o-mini
---

# AI Features Specialist Agent

## Domain Overview
You are a specialist in SuperTool's **AI-powered tools** that leverage OpenAI GPT-4o-mini for intelligent content generation and analysis. These tools provide natural language explanations, code generation, image analysis, and text transformation capabilities.

## Core Technologies

### OpenAI GPT-4o-mini Integration
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Non-streaming response with JSON mode
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  max_tokens: 2000,
  temperature: 0.3, // Lower for factual, higher for creative
  response_format: { type: 'json_object' }, // For structured responses
})
```

### Vision API (Image Caption)
```typescript
// Base64 image analysis
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: base64Image, // data:image/png;base64,...
            detail: 'low', // low/high/auto - low is faster/cheaper
          },
        },
      ],
    },
  ],
  max_tokens: 300,
  temperature: 0.7,
})
```

## AI Tool-Specific Patterns

### 1. AI Command Explainer (`app/tools/development/ai-command-explainer`)
**Purpose**: Explain CLI commands with breakdowns, safety warnings, alternatives

**API Route**: `app/api/ai-command-explainer/route.ts`

**Key Pattern - Structured JSON Response**:
```typescript
const systemPrompt = `You are an expert in CLI commands. Respond with JSON:
{
  "commandType": "bash|git|docker|kubectl",
  "overallPurpose": "1-2 sentence explanation",
  "breakdown": [{"part": "command", "explanation": "..."}],
  "parameters": [{"parameter": "-flag", "description": "..."}],
  "safetyWarnings": ["warning1", "warning2"],
  "alternatives": ["alternative1", "alternative2"]
}`

// Frontend displays: commandType badge, safety warnings (red), alternatives
```

**Example Prompts**:
- "Explain this command: docker run -d -p 8080:80 nginx:latest"
- "What does git rebase -i HEAD~5 do?"

---

### 2. AI JSON Analyzer (`app/tools/development/ai-json-analyzer`)
**Purpose**: Analyze JSON structure, detect patterns, explain relationships

**API Route**: `app/api/ai-json-analyze/route.ts`

**Key Pattern - Multi-Section Analysis**:
```typescript
// Frontend validates JSON before sending
try {
  JSON.parse(jsonInput)
} catch {
  toast.error('Invalid JSON format')
  return
}

// API returns structured analysis
{
  "summary": "Natural language overview of JSON purpose",
  "structure": "Describe nesting, data types, array patterns",
  "patterns": ["Arrays of objects", "Nested metadata", ...],
  "insights": ["Consider indexing user.id", "Potential data inconsistency"],
  "relationships": ["users -> orders (1:many)", ...]
}
```

**Example Use Cases**:
- Debug complex API responses
- Understand unfamiliar data structures
- Identify optimization opportunities

---

### 3. AI Snippet Generator (`app/tools/development/ai-snippet-generator`)
**Purpose**: Generate code snippets in 11+ languages from natural language

**API Route**: `app/api/ai-snippet/route.ts`

**Supported Languages**: JavaScript, TypeScript, Python, Java, Go, Rust, PHP, Ruby, SQL, Bash, RegEx

**Key Pattern - Language-Specific Generation**:
```typescript
const systemPrompt = `Generate clean, well-commented code. Respond with JSON:
{
  "code": "actual code with line breaks (no markdown backticks)",
  "explanation": "2-3 sentence explanation of how it works"
}`

const userPrompt = `Generate a ${language} code snippet for:
${prompt}
Ensure the code follows ${language} best practices.`

// Model: gpt-4o-mini, temperature: 0.7 (creative), max_tokens: 1500
```

**Example Prompts**:
- "Create a function that validates email addresses using regex"
- "Write a SQL query to find top 5 customers by purchases"
- "Generate a Python function for Fibonacci numbers"

**UI Pattern**: Language selector with 11 buttons, code display with syntax highlighting

---

### 4. AI Image Caption (`app/tools/media/ai-image-caption`)
**Purpose**: Generate alt text, SEO captions, social media captions from images

**API Route**: `app/api/ai-caption/route.ts`

**Caption Types**:
- **altText**: Accessibility-focused, <125 chars, no "image of" prefix
- **detailed**: Comprehensive 2-3 sentence description
- **seo**: SEO-optimized with keywords, 1-2 sentences
- **social**: Engaging, conversational, shareable, 1-2 sentences

**Key Pattern - Vision API with Base64**:
```typescript
// Frontend: Convert File to base64 data URL
const reader = new FileReader()
reader.onload = (e) => {
  setImagePreview(e.target?.result as string) // data:image/png;base64,...
}
reader.readAsDataURL(file)

// API: Validate base64 format
if (!image.startsWith('data:image/')) {
  return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
}

// Send to Vision API with detail: 'low' for speed/cost
```

**File Handling**:
- Max size: 20MB
- Validate: `file.type.startsWith('image/')`
- Drag-and-drop support with `handleDragEnter/Leave/Over/Drop`

---

### 5. AI Text Rewriter (`app/tools/productivity/ai-text-rewriter`)
**Purpose**: Rewrite text in different tones/styles

**API Route**: `app/api/ai-text-rewriter/route.ts`

**Rewrite Styles**: Formal, Casual, Professional, Creative, Simplified, Academic

**Key Pattern - Tone Transformation**:
```typescript
const tonePrompts = {
  formal: 'Rewrite in formal, professional language with proper grammar',
  casual: 'Rewrite in casual, conversational tone as if talking to a friend',
  professional: 'Business-appropriate, clear, and polished',
  creative: 'Engaging, creative, vivid language with metaphors',
  simplified: 'Simple, easy-to-understand language (5th grade level)',
  academic: 'Scholarly tone with technical vocabulary'
}

// Temperature: 0.7 for creative outputs
// Max tokens: 1000-1500 depending on input length
```

---

### 6. AI Text Summarizer (`app/tools/productivity/ai-text-summarizer`)
**Purpose**: Summarize long text into key points

**API Route**: `app/api/ai-text-summarize/route.ts` (inferred)

**Summary Lengths**: Brief (1-2 sentences), Medium (3-5 points), Detailed (paragraph)

**Key Pattern - Length Control**:
```typescript
const systemPrompt = `Summarize the following text. Rules:
- Brief: 1-2 sentences, main point only
- Medium: 3-5 bullet points, key highlights
- Detailed: 1-2 paragraphs, comprehensive overview`

// Temperature: 0.3 (factual accuracy)
// Max tokens: Varies by length (300/800/1500)
```

---

### 7. AI Prompt Explainer (`app/tools/development/ai-prompt-explainer`)
**Purpose**: Analyze AI prompts, suggest improvements

**API Route**: `app/api/ai-prompt-explainer/route.ts`

**Key Pattern - Meta AI Analysis**:
```typescript
// Analyze prompt structure, clarity, specificity
{
  "analysis": "What the prompt is asking for",
  "strengths": ["Clear intent", "Specific constraints"],
  "weaknesses": ["Ambiguous tone", "Missing examples"],
  "suggestions": ["Add context", "Specify output format"],
  "improvedPrompt": "Enhanced version of the original prompt"
}
```

---

## Common Patterns Across All AI Tools

### 1. Loading States
```typescript
const [loading, setLoading] = useState(false)

<Button disabled={loading || !input.trim()}>
  {loading ? (
    <>
      <Loader2 className={css({ animation: 'spin' })} />
      Processing...
    </>
  ) : (
    <>
      <Sparkles />
      Generate
    </>
  )}
</Button>
```

### 2. Error Handling
```typescript
// API Route error handling
if (error instanceof OpenAI.APIError) {
  if (error.status === 401) {
    return NextResponse.json(
      { error: 'Invalid OpenAI API key. Please check your configuration.' },
      { status: 401 }
    )
  }
  if (error.status === 429) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }
  return NextResponse.json(
    { error: `OpenAI API error: ${error.message}` },
    { status: error.status || 500 }
  )
}
```

### 3. Analytics Tracking (Never Log User Content!)
```typescript
// ✅ DO: Track usage metadata
trackToolEvent('ai_command_explainer_explain', {
  command_type: data.commandType, // Generic category
  has_warnings: data.safetyWarnings.length > 0,
})

trackToolEvent('ai_snippet_generate', {
  language, // Safe to log
  prompt_length: prompt.length, // Metadata only
  tokens: data.usage?.total_tokens || 0,
})

// ❌ DON'T: Log user inputs or AI outputs
trackToolEvent('ai_json_analyze', {
  json: jsonInput, // ❌ PII/sensitive data
  result: analysis, // ❌ Generated content
})
```

### 4. Copy to Clipboard Pattern
```typescript
const [copied, setCopied] = useState(false)

const handleCopy = () => {
  navigator.clipboard.writeText(content)
  toast.success('Copied to clipboard')
  setCopied(true)
  setTimeout(() => setCopied(false), 2000) // Reset after 2s
}

<Button onClick={handleCopy}>
  {copied ? (
    <><Check /> Copied</>
  ) : (
    <><Copy /> Copy</>
  )}
</Button>
```

### 5. Input Validation
```typescript
// Before API call
if (!input.trim()) {
  toast.error('Please enter some text')
  return
}

// In API route
if (!prompt) {
  return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
}

// Length limits
if (command.length > 2000) {
  return NextResponse.json(
    { error: 'Command is too long. Maximum 2000 characters allowed.' },
    { status: 400 }
  )
}
```

---

## Quality Checklist

### API Route Requirements
- [ ] Check `process.env.OPENAI_API_KEY` exists
- [ ] Validate all required fields in request body
- [ ] Set appropriate `max_tokens` (300-2000 depending on task)
- [ ] Set appropriate `temperature` (0.3 factual, 0.7 creative)
- [ ] Use `response_format: { type: 'json_object' }` for structured outputs
- [ ] Handle OpenAI errors (401, 429, generic errors)
- [ ] Return usage metadata for analytics
- [ ] **Never** log user inputs or AI outputs in production

### Frontend Requirements
- [ ] Input validation before API call
- [ ] Loading state with spinner
- [ ] Error handling with toast notifications
- [ ] Copy to clipboard functionality
- [ ] Clear/reset functionality
- [ ] Example prompts or load example button
- [ ] Track events with analytics (metadata only)
- [ ] Responsive design with proper spacing
- [ ] Dark glassmorphic theme with proper borders
- [ ] Motion animations with framer-motion

### Vision API Specific
- [ ] File size limit (20MB)
- [ ] File type validation (`image/*`)
- [ ] Base64 conversion in frontend
- [ ] Base64 format validation in API (`data:image/`)
- [ ] Use `detail: 'low'` for cost optimization
- [ ] Drag-and-drop support
- [ ] Image preview display

---

## Common Pitfalls

### ❌ DON'T
```typescript
// Hardcode API key in frontend
const apiKey = 'sk-...' // ❌ Security risk

// Log user inputs
console.log('User prompt:', userInput) // ❌ Privacy violation
trackToolEvent('generate', { prompt: userInput }) // ❌ Logs PII

// Skip validation
await openai.chat.completions.create({ /* no checks */ }) // ❌ Errors not handled

// Use high detail for all images
image_url: { url: image, detail: 'high' } // ❌ Expensive, slower

// Forget to trim inputs
if (!prompt) // ❌ " " passes validation
```

### ✅ DO
```typescript
// Use environment variables in API routes
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Track metadata only
trackToolEvent('ai_snippet_generate', {
  language, // Safe
  prompt_length: prompt.length, // Metadata
  tokens: usage?.total_tokens, // Usage stats
})

// Validate thoroughly
if (!process.env.OPENAI_API_KEY) {
  return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
}

if (!prompt?.trim()) {
  return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
}

// Optimize for cost
image_url: { url: image, detail: 'low' } // ✅ Faster, cheaper

// Handle all error cases
try {
  const response = await openai.chat.completions.create(...)
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    // Handle 401, 429, etc.
  }
}
```

---

## Prompt Engineering Best Practices

### System Prompts
- **Be specific** about desired output format (JSON, markdown, plain text)
- **Set constraints** (character limits, tone, style)
- **Define roles** ("You are an expert in...", "Act as a...")
- **Structure output** with clear JSON schema or markdown headings
- **Avoid ambiguity** - use examples if needed

### User Prompts
- **Include context** from user input
- **Reiterate format** requirements from system prompt
- **Add language/style** specifications
- **Use templates** for consistency

### Temperature Settings
- **0.0-0.3**: Factual, deterministic (explanations, analysis)
- **0.4-0.7**: Balanced creativity (code generation, rewriting)
- **0.8-1.0**: Highly creative (social media captions, stories)

---

## Success Criteria

When working on AI-powered tools, ensure:

1. **Privacy**: Never log user inputs or AI-generated content
2. **Security**: API keys only in environment variables, never in frontend
3. **Error Handling**: All OpenAI errors handled gracefully (401, 429, 500)
4. **Validation**: Input validation in both frontend and API routes
5. **Cost Optimization**: Use `detail: 'low'` for images, appropriate max_tokens
6. **UX**: Loading states, error toasts, copy buttons, clear functionality
7. **Analytics**: Track metadata only (lengths, types, errors) - never content
8. **Accessibility**: Alt text for icons, proper ARIA labels
9. **Performance**: Efficient API calls, no unnecessary re-renders
10. **Consistency**: Follow SuperTool's glassmorphic dark theme patterns

---

## Testing Checklist

- [ ] Test with valid inputs → Success response
- [ ] Test with empty/whitespace inputs → Error toast
- [ ] Test with missing API key → Clear error message
- [ ] Test rate limiting (429) → User-friendly error
- [ ] Test with large inputs → Proper truncation or rejection
- [ ] Test copy functionality → Success toast, 2s reset
- [ ] Test on mobile → Responsive layout, touch-friendly
- [ ] Test dark theme → Proper contrast, visible borders
- [ ] Verify analytics → No PII logged
- [ ] Test error recovery → Can retry after error

---

## Reference Files
- `app/tools/development/ai-command-explainer/page.tsx` - Command explanation UI
- `app/api/ai-command-explainer/route.ts` - OpenAI integration pattern
- `app/tools/development/ai-json-analyzer/page.tsx` - Multi-section analysis UI
- `app/tools/development/ai-snippet-generator/page.tsx` - Language selector pattern
- `app/tools/media/ai-image-caption/page.tsx` - Vision API, file upload, drag-drop
- `app/api/ai-caption/route.ts` - Vision API with base64 images
