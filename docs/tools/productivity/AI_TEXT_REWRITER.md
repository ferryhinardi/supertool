# AI Text Rewriter - User Guide

## Overview

The **AI Text Rewriter** is an advanced productivity tool that uses OpenAI's GPT-4o-mini model to intelligently rewrite and transform text with different tones, styles, and complexity levels. Whether you need to make content more professional, casual, persuasive, or creative, this tool helps you adapt your writing for different audiences and purposes while maintaining the original meaning.

Perfect for content creators, marketers, business professionals, students, and anyone who needs to adjust the tone and style of their written communication quickly and effectively.

## Key Features

### 10 Tone Options
- **Professional**: Business-appropriate and formal language
- **Casual**: Conversational and relaxed style
- **Friendly**: Warm and approachable writing
- **Formal**: Structured and academic tone
- **Persuasive**: Compelling and action-oriented content
- **Creative**: Imaginative and expressive writing
- **Concise**: Brief and to-the-point (reduces length)
- **Detailed**: Comprehensive and thorough explanations
- **Humorous**: Witty and entertaining style
- **Empathetic**: Understanding and compassionate tone

### 3 Language Styles
- **Simple**: Easy-to-understand language, avoiding complex words
- **Balanced**: Clear and professional (default)
- **Advanced**: Sophisticated vocabulary and complex structures

### Multiple Variants
- Generate 1-3 different versions of your rewritten text
- Compare approaches and choose the best fit
- Slider control for easy variant selection

### AI-Powered Improvements
- Automatic grammar and spelling corrections
- Clarity enhancements
- Readability improvements
- Detailed improvement summaries

### Quick Start Examples
- Business Email template
- Error Message template
- Marketing Copy template
- One-click loading for instant testing

## How to Use

### Basic Workflow

1. **Enter Your Text**
   - Type or paste text into the input area (max 5,000 characters)
   - Character counter displays current length in real-time
   - Example: "We need to discuss the project timeline and budget constraints at our next meeting."

2. **Select Tone**
   - Click on one of the 10 tone options
   - Each tone shows a description to help you choose
   - Visual feedback highlights your selection

3. **Choose Style**
   - Select Simple, Balanced, or Advanced
   - Simple: "Use simple words"
   - Balanced: "Clear and professional"
   - Advanced: "Sophisticated vocabulary"

4. **Set Number of Variants** (Optional)
   - Use the slider to select 1-3 variants
   - Multiple variants help you compare different approaches
   - Default is 1 variant

5. **Click "Rewrite Text"**
   - Processing typically takes 2-5 seconds
   - Loading indicator shows progress
   - Results appear below the form

6. **Review Results**
   - See all variants with tone badges
   - View key improvements made by AI
   - Character count comparison (original vs. rewritten)
   - Copy any variant to clipboard with one click

### Advanced Usage

#### Example-Driven Approach
1. Click on one of the Quick Start examples
2. Observe how the tool handles different text types
3. Modify the example to match your needs
4. Experiment with different tone/style combinations

#### Multi-Variant Comparison
1. Set variants slider to 3
2. Generate all three versions
3. Compare tone, length, and style differences
4. Copy your preferred version
5. Re-run with adjusted settings if needed

#### Tone Stacking Strategy
1. Start with your base text
2. First pass: Rewrite with "Concise" to reduce length
3. Copy the result back to input
4. Second pass: Apply "Professional" or "Persuasive" tone
5. Achieve compound improvements

## Use Cases

### 1. Business Communication
**Scenario**: Convert informal notes into professional emails
```
Original: "Hey, can we push the meeting? Got a conflict."
Professional Tone Result: "Good morning, I hope this message finds you well. I'm writing to request if we could reschedule our upcoming meeting due to an unexpected scheduling conflict. Would you have any alternative times available?"
```

### 2. Marketing & Sales
**Scenario**: Transform product descriptions into persuasive copy
```
Original: "Our software helps teams work better together."
Persuasive Tone Result: "Transform your team's productivity with our cutting-edge collaboration software. Experience seamless communication, streamlined workflows, and measurable results that drive your business forward."
```

### 3. Customer Support
**Scenario**: Make error messages more friendly and empathetic
```
Original: "The system encountered an error during data processing."
Friendly/Empathetic Tone Result: "Oops! We ran into a small hiccup while processing your data. Don't worry – our team is on it, and we'll have things running smoothly again in no time. Thanks for your patience!"
```

### 4. Academic Writing
**Scenario**: Elevate casual research notes to formal academic style
```
Original: "The study shows that kids learn better with interactive stuff."
Formal/Advanced Style Result: "The research demonstrates that children exhibit enhanced learning outcomes when engaged with interactive educational materials and pedagogical methodologies."
```

### 5. Social Media Content
**Scenario**: Create engaging posts from plain announcements
```
Original: "We're launching a new product next week."
Creative/Humorous Tone Result: "Drumroll, please! 🎉 Next week, we're unleashing something absolutely game-changing. Think of it as your new best friend, but in product form. Stay tuned – you won't want to miss this!"
```

### 6. Email Length Reduction
**Scenario**: Make long-winded emails concise
```
Original: "I wanted to reach out to you regarding the matter we discussed in our last meeting about the upcoming project timeline and the various deliverables that need to be completed before the deadline."
Concise Tone Result: "Following up on our meeting: we need to finalize project deliverables before the deadline."
```

### 7. Content Localization
**Scenario**: Adjust American English to British English formality
```
Original: "Hey folks, check out our awesome new features!"
Formal Tone Result: "Dear valued users, we invite you to explore our latest feature enhancements."
```

## Tips & Best Practices

### Getting the Best Results

1. **Start with Clear Input**
   - Ensure your original text is grammatically sound
   - Remove formatting artifacts (extra spaces, line breaks)
   - Provide complete sentences when possible

2. **Match Tone to Audience**
   - Professional: Business emails, reports, proposals
   - Casual: Blog posts, social media, personal communication
   - Persuasive: Sales copy, marketing materials, CTAs
   - Empathetic: Customer support, apologies, sensitive topics

3. **Leverage Multiple Variants**
   - Generate 3 variants for important content
   - Compare word choices and structure
   - Mix and match elements from different variants

4. **Optimize Length Control**
   - Use "Concise" to reduce by ~30-50%
   - Use "Detailed" to expand by ~20-40%
   - Other tones maintain similar length (±20%)

5. **Combine with Other Tools**
   - Use Grammar Checker first to fix errors
   - Use Text Summarizer for extremely long content
   - Copy rewritten text to word processors for final edits

6. **Experiment with Style Settings**
   - Simple + Casual = Everyday conversation
   - Advanced + Formal = Academic papers
   - Balanced + Professional = Business standard

### Common Pitfalls to Avoid

- **Don't exceed 5,000 characters** (tool will reject)
- **Don't expect perfect first results** (iterate if needed)
- **Don't forget to proofread** (AI is smart but not infallible)
- **Don't use for critical legal documents** (always have human review)
- **Don't lose original meaning** (check that intent is preserved)

## Technical Details

### OpenAI Integration
- **Model**: GPT-4o-mini
- **Max Tokens**: 2,000 per request
- **Temperature**: 0.8 (balanced creativity and consistency)
- **Response Format**: JSON structured output
- **API Key**: Required in environment variables (`OPENAI_API_KEY`)

### Input Constraints
- **Maximum Length**: 5,000 characters
- **Minimum Length**: 1 word (though 10+ words recommended)
- **Supported Languages**: Primarily English (multilingual support varies)
- **Processing Time**: 2-10 seconds depending on text length

### Output Features
- **Variant Count**: 1-3 per request
- **Improvement List**: 2-3 key changes highlighted
- **Length Comparison**: Character count (original vs. rewritten)
- **Copy to Clipboard**: Instant copy functionality

### Performance Considerations
- Each rewrite consumes OpenAI API tokens
- Longer text + more variants = higher token usage
- Typical usage: 500-1,500 tokens per request
- Failed requests return detailed error messages

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
- **Recommendation**: Avoid pasting sensitive/confidential information

## Keyboard Shortcuts

- **Tab**: Navigate between tone options
- **Enter**: Submit form when focused on "Rewrite Text" button
- **Ctrl/Cmd + A**: Select all text in input area
- **Ctrl/Cmd + C**: Copy selected variant text
- **Ctrl/Cmd + V**: Paste into input area

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution**: Administrator needs to add `OPENAI_API_KEY` to environment variables. Contact your system admin or check deployment settings.

### Issue: "Text is too long"
**Solution**: Reduce text to under 5,000 characters. Use the Text Summarizer tool first if you have longer content, then rewrite the summary.

### Issue: "Rate limit exceeded"
**Solution**: OpenAI API rate limits hit. Wait 1-2 minutes and try again. For high-volume usage, consider upgrading your OpenAI plan.

### Issue: Rewritten text doesn't match expected tone
**Solution**: 
- Try generating multiple variants (set slider to 3)
- Adjust the Style setting (Simple/Balanced/Advanced)
- Provide more context in your original text
- Rephrase your input to be clearer

### Issue: Grammar errors in rewritten text
**Solution**: The AI aims to fix grammar, but isn't perfect. Run the output through the Grammar Checker tool for a final polish.

### Issue: Meaning changed significantly
**Solution**: 
- Use more specific language in original text
- Avoid idioms or culture-specific references
- Choose "Balanced" style instead of "Advanced"
- Regenerate with different tone selection

### Issue: Loading takes too long (>30 seconds)
**Solution**: 
- Check internet connection
- Reduce text length
- Decrease number of variants to 1
- Refresh page and try again
- Check OpenAI API status at status.openai.com

### Issue: Copy button doesn't work
**Solution**: 
- Ensure your browser allows clipboard access
- Try selecting text manually and using Ctrl/Cmd+C
- Check browser permissions for the site
- Test in a different browser

## API Reference (For Developers)

### Endpoint
```
POST /api/ai-text-rewriter
```

### Request Body
```json
{
  "text": "Text to rewrite",
  "tone": "professional",
  "style": "balanced",
  "variants": 1
}
```

### Parameters
| Parameter | Type | Required | Valid Values |
|-----------|------|----------|--------------|
| text | string | Yes | 1-5,000 characters |
| tone | string | Yes | professional, casual, friendly, formal, persuasive, creative, concise, detailed, humorous, empathetic |
| style | string | Yes | simple, balanced, advanced |
| variants | number | Yes | 1-3 |

### Response (Success)
```json
{
  "variants": ["Rewritten text version 1", "Version 2", "Version 3"],
  "improvements": ["Fixed grammar", "Improved clarity", "Enhanced tone"],
  "tone": "professional",
  "style": "balanced",
  "originalLength": 125,
  "usage": {
    "prompt_tokens": 450,
    "completion_tokens": 180,
    "total_tokens": 630
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
| 400 | Invalid input (missing text, invalid tone, text too long) |
| 401 | Invalid OpenAI API key |
| 429 | Rate limit exceeded |
| 500 | Server error or OpenAI API error |

## Frequently Asked Questions

**Q: Is my text stored or logged?**  
A: No. Text is sent to OpenAI for processing but is not stored on Supertool servers. OpenAI's data retention policies apply (typically 30 days for API requests).

**Q: Can I rewrite text in languages other than English?**  
A: The tool is optimized for English but may work with other languages. Results quality varies by language.

**Q: How many times can I use this tool?**  
A: Unlimited, subject to OpenAI API rate limits and your organization's API quota.

**Q: What's the difference between "Concise" tone and other tones?**  
A: "Concise" actively reduces text length while preserving meaning. Other tones maintain similar length (±20%).

**Q: Can I save my rewritten text?**  
A: Use the Copy button to copy to clipboard, then paste into your preferred application. No built-in save feature.

**Q: Why do variants look similar?**  
A: At temperature 0.8, the AI balances creativity and consistency. For more variation, regenerate multiple times or try different tone combinations.

**Q: Can I use this for SEO content?**  
A: Yes, but use the "Persuasive" or "Creative" tones and always verify factual accuracy and keyword placement.

**Q: Does it work offline?**  
A: No. Requires internet connection to communicate with OpenAI API.

**Q: Can I integrate this into my own app?**  
A: Developers can use the API endpoint (see API Reference section). Requires proper authentication and OpenAI API key.

**Q: What if I need more than 3 variants?**  
A: Run the tool multiple times. Each run generates independent results with natural variation.

## Related Tools

- **Grammar Checker**: Fix grammar and spelling errors before rewriting
- **Text Summarizer**: Condense long content before rewriting
- **AI Command Explainer**: Understand technical commands in different tones
- **AI JSON Analyzer**: Work with structured data using AI

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

**Note**: This tool uses AI and may occasionally produce unexpected results. Always review and verify rewritten content before using it in production environments or critical communications.
