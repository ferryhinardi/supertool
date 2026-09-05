# Grammar & Spell Checker

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/productivity/grammar-checker`
**Category**: Productivity Tools
**Complexity**: Moderate (655 lines)

## Overview

The Grammar & Spell Checker is an AI-powered writing assistant that analyzes text for grammar, spelling, punctuation, style, and clarity issues. Powered by OpenAI's GPT-4o-mini model, it provides detailed explanations and one-click fixes for each identified issue.

## Key Features

### 1. Comprehensive Error Detection

Five categories of issues identified:

| Category | Color | Description |
|----------|-------|-------------|
| **Grammar** | Red | Subject-verb agreement, tense consistency, sentence structure |
| **Spelling** | Orange | Misspelled words, typos, incorrect word forms |
| **Punctuation** | Yellow | Missing/incorrect commas, periods, apostrophes |
| **Style** | Blue | Awkward phrasing, wordiness, unclear constructions |
| **Clarity** | Purple | Ambiguous language, confusing sentences |

### 2. Interactive Issue Cards

- Click any issue to expand detailed explanation
- View the problematic text highlighted
- See AI-suggested corrections
- One-click "Apply Fix" button for each issue

### 3. Analysis Summary

- Total issue count displayed prominently
- Breakdown by category (grammar, spelling, etc.)
- Visual statistics in card format

### 4. Corrected Text Output

- Full corrected version generated automatically
- Side-by-side comparison capability
- One-click copy to clipboard

### 5. Real-Time Character Count

- Live character counter (max 10,000)
- Visual warning when limit exceeded
- Badge indicator for text length status

## How to Use

### Basic Workflow

1. **Enter Text**: Paste or type text in the input area
2. **Check Grammar**: Click the green "Check Grammar" button
3. **Review Issues**: Click each issue card to see details
4. **Apply Fixes**: Use "Apply Fix" buttons individually
5. **Copy Result**: Use "Copy" button on corrected text

### Understanding Issue Cards

Each issue card displays:

1. **Badge**: Category type (grammar, spelling, etc.)
2. **Quoted Text**: The problematic phrase
3. **Message**: Explanation of the issue (on expand)
4. **Suggestion**: Recommended correction (on expand)
5. **Apply Fix**: One-click correction button (on expand)

### Using One-Click Fixes

1. Click on an issue card to expand it
2. Review the suggested fix
3. Click "Apply Fix" to apply the correction
4. The text updates and results clear
5. Click "Check Grammar" again to verify

## Use Cases

### Professional Writing

- Proofread business emails before sending
- Review reports for grammar errors
- Polish presentations and documents

### Academic Work

- Check essays and research papers
- Verify citation formatting consistency
- Improve clarity in technical writing

### Content Creation

- Edit blog posts and articles
- Review social media content
- Polish marketing copy

### Non-Native Speakers

- Learn from detailed explanations
- Improve English writing skills
- Understand common grammar mistakes

### Quick Proofreading

- Last-minute document checks
- Email review before sending
- Chat message polish

## Tips & Tricks

1. **Check Incrementally**: For long documents, check sections separately for better accuracy
2. **Review Before Applying**: Read the explanation before using "Apply Fix"
3. **Re-check After Fixes**: Run another check after applying fixes to catch any new issues
4. **Use for Learning**: The explanations help understand why changes are needed
5. **Trust Your Judgment**: AI suggestions are recommendations, not requirements

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Please enter text" | Empty input | Add text before checking |
| "Too long" badge | Over 10,000 characters | Reduce text length or check in parts |
| No issues found | Text is error-free | No action needed - text is clean |
| Check button disabled | Text empty or too long | Ensure valid text length |
| API error | Service unavailable | Check API status; retry later |

### False Positives

The AI may occasionally flag:

- Intentional stylistic choices
- Industry-specific terminology
- Proper nouns it doesn't recognize
- Informal language in casual contexts

Simply ignore suggestions that don't apply to your context.

## Technical Details

### Architecture

- **Frontend**: React 19 with Panda CSS
- **Backend**: Next.js API route (`/api/grammar-check`)
- **AI Model**: OpenAI GPT-4o-mini
- **Animation**: Framer Motion transitions

### Issue Data Structure

```typescript
interface GrammarIssue {
  text: string          // Problematic text
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'clarity'
  message: string       // Explanation
  suggestion: string    // Recommended fix
  offset: number        // Position in original text
  length: number        // Length of problematic text
}
```

### Response Structure

```typescript
interface CheckResult {
  issues: GrammarIssue[]              // Array of found issues
  correctedText: string               // Full corrected version
  summary: Record<string, number>     // Counts by category
  originalLength: number              // Original text length
  issueCount: number                  // Total issues found
}
```

### Fix Application Logic

When applying a fix, the tool:

1. Extracts text before the issue (`offset`)
2. Extracts text after the issue (`offset + length`)
3. Concatenates: `before + suggestion + after`
4. Updates the input text
5. Clears results for re-checking

## Analytics Events

| Event | Description | Properties |
|-------|-------------|------------|
| `grammar_checker_open` | Page loaded | None |
| `grammar_checker_check` | Grammar checked | `text_length`, `issue_count` |
| `grammar_checker_apply_fix` | Fix applied | `issue_type` |
| `grammar_checker_error` | Check failed | `error` |

## Related Tools

- [AI Text Rewriter](/tools/productivity/ai-text-rewriter) - Rewrite with different tones
- [Text Summarizer](/tools/productivity/text-summarizer) - Condense long text
- [Word Counter](/tools/productivity/word-counter) - Detailed text statistics
- [Text Transformer](/tools/productivity/text-transformer) - Case conversions

## FAQ

### Q: Is my text stored?

A: No, text is sent to OpenAI's API for processing and is not stored on our servers. OpenAI's data retention policies apply.

### Q: How accurate is the grammar checker?

A: Powered by GPT-4o-mini, it catches most common errors. However, always review suggestions as context-specific choices may be flagged incorrectly.

### Q: Can I check multiple languages?

A: The tool is optimized for English. Other languages may work partially but with reduced accuracy.

### Q: Why does it flag correct text?

A: AI may flag stylistic choices, technical terms, or intentional informality. Use your judgment to accept or ignore suggestions.

### Q: Is there a word limit?

A: The tool supports up to 10,000 characters per check. For longer documents, check in sections.

### Q: Can I undo applied fixes?

A: After applying a fix, you can manually edit the text or use browser undo (Ctrl+Z). Running a new check after fixes helps verify changes.

## Best Practices

1. **Check Final Drafts**: Use as a final review step, not during initial writing
2. **Understand Suggestions**: Read explanations to improve your writing skills
3. **Context Matters**: Consider your audience when accepting/rejecting style suggestions
4. **Verify Technical Terms**: The AI may not recognize industry jargon
5. **Combine with Proofreading**: AI catches different errors than human review

## Changelog

- **January 2026**: Initial release with GPT-4o-mini integration, 5 error categories, one-click fixes
