# Grammar & Spell Checker - User Guide

## Overview

The **Grammar & Spell Checker** is an AI-powered writing assistant that analyzes your text for grammar mistakes, spelling errors, punctuation issues, style improvements, and clarity problems. Using OpenAI's GPT-4o-mini model, it provides detailed explanations, suggested corrections, and a fully corrected version of your text.

Perfect for writers, students, professionals, content creators, and anyone who wants to ensure their written communication is error-free and polished.

## Key Features

### Comprehensive Error Detection
- **Grammar Errors**: Subject-verb agreement, tense consistency, sentence structure
- **Spelling Mistakes**: Typos, misspellings, wrong word usage
- **Punctuation Errors**: Commas, periods, apostrophes, quotation marks
- **Style Improvements**: Wordiness, passive voice, unclear phrasing
- **Clarity Issues**: Ambiguous statements, confusing structure

### Intelligent Analysis
- AI-powered detection using GPT-4o-mini
- Context-aware suggestions
- Detailed explanations for each issue
- Character offset tracking for precise error location

### Interactive Issue Management
- Click to expand issue details
- One-click fix application
- Color-coded issue types
- Issue count by category

### Full Text Correction
- Complete corrected text provided
- Copy corrected version to clipboard
- Original vs. corrected comparison
- Word and character reduction statistics

### Real-Time Feedback
- Character count display (10,000 max)
- Processing indicator with progress feedback
- Toast notifications for success/errors
- Error handling with helpful messages

## How to Use

### Basic Workflow

1. **Enter Your Text**
   - Type or paste text into the input area
   - Maximum length: 10,000 characters
   - Counter shows current character count
   - Example: "Their going to the store tommorow to buy some thing."

2. **Click "Check Grammar"**
   - Processing takes 3-8 seconds depending on text length
   - Loading spinner indicates analysis in progress
   - Results appear below when complete

3. **Review Issue Summary**
   - See total issue count
   - View breakdown by issue type (Grammar, Spelling, Punctuation, Style, Clarity)
   - Color-coded statistics cards

4. **Examine Individual Issues**
   - Click any issue card to expand details
   - View problematic text segment
   - Read explanation of the issue
   - See suggested fix highlighted in green

5. **Apply Fixes**
   - Click "Apply Fix" button on any issue
   - Text input updates with the correction
   - Click "Check Grammar" again to verify
   - Repeat until all issues resolved

6. **Copy Corrected Text**
   - View full corrected text in the results section
   - Click "Copy" button to copy to clipboard
   - Paste into your document or application

### Advanced Usage

#### Iterative Improvement Workflow
1. Run initial grammar check
2. Review all issues and their explanations
3. Apply fixes selectively (maintain your style)
4. Clear and re-check to find any new issues
5. Repeat until perfect

#### Manual vs. Automatic Correction
- **Manual**: Click "Apply Fix" on each issue individually
- **Automatic**: Copy the full "Corrected Text" provided at the bottom
- **Hybrid**: Apply some fixes manually, then copy corrected text for remaining issues

#### Learning Mode
1. Don't apply fixes immediately
2. Read each issue explanation carefully
3. Understand why it's an error
4. Learn grammar rules and style guidelines
5. Use tool as an educational resource

## Use Cases

### 1. Email Proofreading
**Scenario**: Check professional emails before sending
```
Original: "Hi John, I wanted to reach out and touch base with you regarding the meeting we had last week which was very productive."
Issues Found:
- Style: "reach out and touch base" is wordy (Suggestion: "contact you")
- Style: "which was very productive" is vague (Suggestion: "where we discussed X")
```

### 2. Academic Papers
**Scenario**: Ensure research papers are error-free
```
Original: "The study were conducted over a period of three years and it's findings shows significant results."
Issues Found:
- Grammar: "study were" should be "study was" (subject-verb agreement)
- Punctuation: "it's" should be "its" (possessive, not contraction)
- Grammar: "findings shows" should be "findings show" (plural subject)
```

### 3. Blog Post Editing
**Scenario**: Polish blog content before publishing
```
Original: "In todays world, alot of people doesnt understand the importance of proofreading they're content."
Issues Found:
- Punctuation: "todays" should be "today's" (possessive apostrophe)
- Spelling: "alot" should be "a lot" (two words)
- Grammar: "doesnt" should be "don't" (plural subject agreement)
- Spelling: "they're" should be "their" (possessive, not contraction)
```

### 4. Cover Letter Review
**Scenario**: Perfect job application cover letters
```
Original: "I am very interested in this position because I think I would be good at it and I have alot of experience."
Issues Found:
- Style: Passive and vague (Suggestion: "I am an excellent fit for this position due to my 5 years of experience in...")
- Spelling: "alot" should be "a lot"
- Clarity: "good at it" is non-specific (Suggestion: name specific skills)
```

### 5. Social Media Posts
**Scenario**: Ensure tweets and posts are professional
```
Original: "Excited to announce our new product launch next week! Their will be special discounts for early bird's."
Issues Found:
- Spelling: "Their" should be "There" (existence, not possessive)
- Punctuation: "bird's" should be "birds" (plural, not possessive)
```

### 6. Report Writing
**Scenario**: Corporate reports with zero errors
```
Original: "The teams performance has improved significantly however we still faces several challenges moving forward."
Issues Found:
- Punctuation: "teams" should be "team's" (possessive)
- Punctuation: Missing comma or semicolon before "however"
- Grammar: "we still faces" should be "we still face" (plural subject)
```

### 7. Resume Optimization
**Scenario**: Error-free resumes for job applications
```
Original: "Managed a team of 5 peoples and lead several projects that was completed on time."
Issues Found:
- Grammar: "peoples" should be "people" (people is already plural)
- Grammar: "lead" should be "led" (past tense)
- Grammar: "projects that was" should be "projects that were" (plural subject)
```

## Tips & Best Practices

### Getting the Best Results

1. **Paste Clean Text**
   - Remove formatting from Word/Google Docs
   - Clear extra line breaks and spaces
   - Use plain text for best analysis

2. **Check in Chunks**
   - For documents over 10,000 characters, split into sections
   - Check each section individually
   - Reassemble after all corrections

3. **Review Explanations**
   - Don't just apply fixes blindly
   - Read why each issue is flagged
   - Learn from the feedback for future writing

4. **Preserve Your Voice**
   - Some "style" suggestions are optional
   - Maintain your personal or brand voice
   - Apply grammar/spelling fixes, consider style suggestions

5. **Use Context**
   - AI may miss context-specific correctness
   - Creative writing may intentionally break rules
   - Technical terms may be flagged incorrectly

6. **Iterative Checking**
   - Apply a batch of fixes
   - Re-run the check
   - Catch any newly introduced errors
   - Repeat until clean

### Common Pitfalls to Avoid

- **Don't exceed 10,000 characters** (tool will reject)
- **Don't apply all fixes without review** (some may alter meaning)
- **Don't ignore context** (AI doesn't understand your full intent)
- **Don't rely solely on AI** (human proofreading still valuable)
- **Don't skip re-checking** (applying one fix can introduce new issues)

## Technical Details

### OpenAI Integration
- **Model**: GPT-4o-mini
- **Max Tokens**: 4,000 per request (allows detailed analysis)
- **Temperature**: 0.3 (low temperature for consistent, reliable results)
- **Response Format**: JSON structured output
- **API Key**: Required in environment variables (`OPENAI_API_KEY`)

### Input Constraints
- **Maximum Length**: 10,000 characters
- **Minimum Length**: 1 word (though 5+ words recommended for meaningful analysis)
- **Supported Languages**: Primarily English
- **Processing Time**: 3-10 seconds depending on text length and complexity

### Error Detection Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Grammar** | Subject-verb agreement, tense errors, sentence structure | "They was going" → "They were going" |
| **Spelling** | Typos, misspellings, wrong words | "recieve" → "receive" |
| **Punctuation** | Commas, apostrophes, periods, quotes | "its a test" → "it's a test" |
| **Style** | Wordiness, passive voice, unclear phrasing | "In order to achieve" → "To achieve" |
| **Clarity** | Ambiguous statements, confusing structure | Suggests restructuring for better flow |

### Output Structure
```json
{
  "issues": [
    {
      "text": "they was",
      "type": "grammar",
      "message": "Subject-verb agreement error. Plural subject requires plural verb.",
      "suggestion": "they were",
      "offset": 15,
      "length": 8
    }
  ],
  "correctedText": "Full text with all corrections applied",
  "summary": {
    "grammar": 2,
    "spelling": 3,
    "punctuation": 1
  },
  "originalLength": 150,
  "issueCount": 6
}
```

### Performance Considerations
- Each check consumes OpenAI API tokens
- Longer text = higher token usage
- Typical usage: 500-2,000 tokens per request
- Rate limits apply (429 error if exceeded)

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required Features**: JavaScript, Fetch API, Clipboard API
- **Mobile**: Fully responsive on iOS and Android
- **Network**: Requires stable internet connection

### Data Privacy & Security
- **Text Processing**: Sent to OpenAI API over HTTPS
- **No Storage**: Text is not saved on Supertool servers
- **OpenAI Policy**: Subject to OpenAI's data usage policies
- **Analytics**: Anonymized usage statistics only (no content logged)
- **Recommendation**: Avoid pasting highly sensitive information

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution**: Administrator needs to add `OPENAI_API_KEY` to environment variables. Contact your system admin.

### Issue: "Text is too long"
**Solution**: Reduce text to under 10,000 characters. Split long documents into sections and check each part separately.

### Issue: "Rate limit exceeded"
**Solution**: You've hit OpenAI's rate limit. Wait 60 seconds and try again. Consider upgrading your OpenAI API plan for higher limits.

### Issue: No issues found but text has obvious errors
**Solution**: 
- Ensure text is in English
- Check if errors are context-dependent
- Try rephrasing for clarity
- Manually verify suspicious sections

### Issue: False positives (correct text flagged as error)
**Solution**: 
- Review the explanation carefully
- AI may not understand specialized terminology
- Technical jargon may be flagged incorrectly
- Use your judgment to ignore false flags

### Issue: Applying fix doesn't work
**Solution**: 
- Try copying the full corrected text instead
- Clear the input and paste fresh
- Refresh the page if issues persist
- Check browser console for errors

### Issue: Loading takes too long
**Solution**: 
- Check internet connection
- Reduce text length
- Refresh page and try again
- Verify OpenAI API status at status.openai.com

### Issue: Some issues missing explanations
**Solution**: AI may have encountered token limits. Shorten your text and re-run for more detailed feedback.

### Issue: Copy button doesn't work
**Solution**: 
- Enable clipboard permissions in browser
- Try manual copy (Ctrl/Cmd + C)
- Test in a different browser
- Check browser security settings

## API Reference (For Developers)

### Endpoint
```
POST /api/grammar-check
```

### Request Body
```json
{
  "text": "Text to check for grammar and spelling"
}
```

### Parameters
| Parameter | Type | Required | Valid Values |
|-----------|------|----------|--------------|
| text | string | Yes | 1-10,000 characters |

### Response (Success)
```json
{
  "issues": [
    {
      "text": "problematic text",
      "type": "grammar",
      "message": "Explanation of issue",
      "suggestion": "corrected text",
      "offset": 50,
      "length": 15
    }
  ],
  "correctedText": "Full corrected version of input text",
  "summary": {
    "grammar": 2,
    "spelling": 1,
    "punctuation": 3,
    "style": 1,
    "clarity": 0
  },
  "originalLength": 145,
  "issueCount": 7,
  "usage": {
    "prompt_tokens": 550,
    "completion_tokens": 320,
    "total_tokens": 870
  }
}
```

### Response (Error)
```json
{
  "error": "Error message description"
}
```

### Error Codes
| Status | Description |
|--------|-------------|
| 400 | Invalid input (missing text, text too long) |
| 401 | Invalid OpenAI API key |
| 429 | Rate limit exceeded |
| 500 | Server error or OpenAI API error |

## Frequently Asked Questions

**Q: Does this work for languages other than English?**  
A: The tool is optimized for English. Other languages may work but with reduced accuracy.

**Q: Why does it flag correct text?**  
A: AI models can produce false positives, especially with technical terms, proper nouns, or creative writing. Use your judgment.

**Q: Can I check the same text multiple times?**  
A: Yes, unlimited checks within your API rate limits.

**Q: How accurate is the grammar checking?**  
A: Very high accuracy (~95%+) but not perfect. Always review suggestions before applying.

**Q: Does it understand context?**  
A: Yes, better than traditional grammar checkers. GPT-4o-mini considers context, but may miss highly specialized contexts.

**Q: Can I ignore certain issue types?**  
A: Not currently, but you can selectively apply only the fixes you want.

**Q: Is this better than Grammarly?**  
A: Different approach. This uses cutting-edge AI (GPT-4o-mini) for context-aware checking. Grammarly uses proprietary algorithms. Both have strengths.

**Q: Can I use this offline?**  
A: No. Requires internet connection to communicate with OpenAI API.

**Q: Does it learn from my corrections?**  
A: No. Each check is independent. No learning or personalization across sessions.

**Q: Can I integrate this into my CMS or text editor?**  
A: Developers can use the API endpoint. See API Reference section for details.

**Q: What if I disagree with a suggestion?**  
A: Simply don't apply that fix. AI suggestions are recommendations, not requirements.

**Q: Does it check for plagiarism?**  
A: No. This tool only checks grammar, spelling, style, and clarity.

## Related Tools

- **AI Text Rewriter**: Rewrite text with different tones after fixing grammar
- **Text Summarizer**: Condense long text while maintaining grammar quality
- **AI Command Explainer**: Check grammar in technical documentation
- **Markdown Editor**: Format corrected text with Markdown syntax

## Version Information

- **Last Updated**: January 2026
- **AI Model**: GPT-4o-mini (OpenAI)
- **Tool Version**: 1.0
- **Framework**: Next.js 15, React 19, Panda CSS

## Support & Feedback

For issues, questions, or feature requests:
- Report bugs via GitHub issues
- Check OpenCode documentation at https://opencode.ai/docs
- Contact your system administrator for API configuration help

---

**Note**: AI-powered grammar checking is highly accurate but not infallible. Always review suggestions in context before applying. This tool is designed to assist, not replace, human proofreading.
