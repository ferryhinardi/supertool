# SuperTool GitHub Copilot Agents

Specialized agents for AI-assisted development in SuperTool - a Next.js 15 web application with 74+ productivity tools.

## Quick Reference

| Agent | Focus Area | When to Use |
|-------|-----------|-------------|
| **AI Features** | AI-powered tools (Command Explainer, JSON Analyzer, Snippet Generator, Image Caption) | Building/fixing AI tools that use GPT-4o-mini |
| **AI Integration** | OpenAI API patterns, rate limiting, cost optimization | API routes, error handling, prompt engineering |
| **Analytics & Privacy** | PostHog, privacy-first tracking, GDPR compliance | Adding analytics events, privacy audits |
| **Backend & API** | Next.js API routes, Supabase, authentication | Building API endpoints, database queries |
| **Data Tools** | JSON, CSV, Date, UUID tools | JSON/CSV/Date/UUID-related features |
| **Design Tools** | Color, SVG, Image, Canvas tools | Visual/design utilities |
| **Development Tools** | API testing, JWT, RegEx, Docker, Git | Developer productivity features |
| **DevOps** | Build config, CI/CD, Vercel, performance | Deployment, build optimization, monitoring |
| **Finance Tools** | Currency, loan calculator, split bill | Financial calculations with Decimal.js |
| **Frontend & Panda CSS** | Panda CSS, React 19, component patterns | UI components, styling, theming |
| **Media Tools** | FFmpeg, video/image processing | Media conversion, compression, editing |
| **Performance** | React Query, virtualization, lazy loading | Performance optimization, Core Web Vitals |
| **Productivity Tools** | PDF, Timer, Grammar, Pomodoro | Productivity utilities |
| **Security & Auth** | Supabase Auth, password tools, encryption | Authentication, security features |
| **Security Tools** | Encryption, password gen, hash, Base64 | Crypto operations, password tools |
| **Testing & Coverage** | Vitest, React Testing Library, browser tests | Writing tests, improving coverage |

## Agent Invocation

Use the `@agent-name` syntax in GitHub Copilot chat:

```
@ai-features-specialist How do I add streaming responses to the AI snippet generator?

@ai-integration-specialist What's the best temperature setting for code generation?

@frontend-panda-css-specialist Fix this invalid grid layout syntax

@data-tools-specialist Add CSV export functionality to this component
```

## Tool Category Agents (9 Total)

### 1. AI Features Specialist (`@ai-features-specialist`)
**File**: `.github/agents/ai/ai-features-specialist.agent.md`

**Covers**:
- AI Command Explainer - CLI command explanations
- AI JSON Analyzer - JSON structure analysis
- AI Snippet Generator - Code generation (11 languages)
- AI Image Caption - Alt text, SEO, social captions
- AI Text Rewriter - Tone transformation
- AI Text Summarizer - Text summarization
- AI Prompt Explainer - Prompt analysis

**Key Expertise**:
- GPT-4o-mini integration patterns
- Vision API with base64 images
- Structured JSON responses
- Copy-paste code examples
- Privacy-first analytics (no content logging)

**Example Questions**:
- "How do I handle Vision API errors?"
- "What's the pattern for JSON mode responses?"
- "How should I track analytics for AI features without logging user data?"

---

### 2. AI Integration Specialist (`@ai-integration-specialist`)
**File**: `.github/agents/ai/ai-integration-specialist.agent.md`

**Covers**:
- OpenAI SDK v4.x setup and usage
- API route patterns (Next.js 15 App Router)
- Error handling (401, 429, 400, 500)
- Rate limiting strategies
- Cost optimization (token management, max_tokens)
- Prompt engineering best practices
- Security (API key management, input sanitization)

**Key Expertise**:
- Complete API route templates
- Error handling deep dive
- Temperature settings guide (0.0-1.0)
- Token estimation and cost calculation
- Frontend integration patterns (fetch, abort controller)
- Mock testing strategies

**Example Questions**:
- "How do I handle rate limiting (429 errors)?"
- "What's the right max_tokens for code generation?"
- "How should I structure system prompts for JSON output?"

---

### 3. Data Tools Specialist (`@data-tools-specialist`)
**File**: `.github/agents/tools/data-tools-specialist.agent.md`

**Covers**:
- JSON Beautifier, Validator, Diff, Minifier, Schema Generator
- CSV Parser, Generator, Validator
- UUID Generator (v4, v5, NIL)
- Date Formatter, Parser, Calculator

**Key Technologies**:
- nuqs for URL state persistence
- Monaco Editor for JSON editing
- date-fns for date operations

**Example Questions**:
- "How do I add JSON-to-CSV conversion?"
- "What's the pattern for URL-persisted state with nuqs?"

---

### 4. Design Tools Specialist (`@design-tools-specialist`)
**File**: `.github/agents/tools/design-tools-specialist.agent.md`

**Covers**:
- Color Picker, Palette Generator, Contrast Checker
- SVG Editor, Minifier, Icon Generator
- Image Optimizer, Resizer, Cropper, Compressor
- Canvas-based tools (Signature, Drawing)

**Key Technologies**:
- Canvas API for drawing
- sharp/browser-image-compression for optimization
- react-colorful for color picking

**Example Questions**:
- "How do I implement canvas-based signature generation?"
- "What's the pattern for client-side image optimization?"

---

### 5. Development Tools Specialist (`@development-tools-specialist`)
**File**: `.github/agents/tools/development-tools-specialist.agent.md`

**Covers**:
- API Tester (REST, GraphQL, WebSocket)
- JWT Decoder, Generator, Verifier
- RegEx Tester, Library, Debugger
- Docker Command Generator
- Git Command Helper

**Key Technologies**:
- jose library for JWT operations
- Monaco Editor for request/response
- WebSocket API for real-time testing

**Example Questions**:
- "How do I add GraphQL schema validation?"
- "What's the pattern for WebSocket testing?"

---

### 6. Finance Tools Specialist (`@finance-tools-specialist`)
**File**: `.github/agents/tools/finance-tools-specialist.agent.md`

**Covers**:
- Currency Converter (real-time rates)
- Loan Calculator (amortization schedules)
- Split Bill Calculator (Supabase integration)

**Key Technologies**:
- Decimal.js for precision arithmetic
- Exchange rate APIs (exchangerate-api.com)
- Supabase for split bill persistence

**Example Questions**:
- "How do I prevent floating-point errors in calculations?"
- "What's the pattern for real-time exchange rates?"

---

### 7. Media Tools Specialist (`@media-tools-specialist`)
**File**: `.github/agents/tools/media-tools-specialist.agent.md`

**Covers**:
- Video Converter (FFmpeg.wasm)
- Image-to-PDF Converter
- Photo Editor (Pintura)
- Video Subtitle Generator

**Key Technologies**:
- FFmpeg.wasm for browser-based video processing
- @pqina/pintura for photo editing
- pdfkit for PDF generation

**Example Questions**:
- "How do I handle large video files with FFmpeg?"
- "What's the pattern for chunked file uploads?"

---

### 8. Productivity Tools Specialist (`@productivity-tools-specialist`)
**File**: `.github/agents/tools/productivity-tools-specialist.agent.md`

**Covers**:
- PDF Tools Suite (17 operations)
- Pomodoro Timer
- Grammar Checker
- Tally Counter
- Daily Note Generator

**Key Technologies**:
- pdf-lib for PDF manipulation
- Tesseract.js for OCR
- LanguageTool API for grammar

**Example Questions**:
- "How do I merge PDFs with pdf-lib?"
- "What's the pattern for localStorage persistence?"

---

### 9. Security Tools Specialist (`@security-tools-specialist`)
**File**: `.github/agents/tools/security-tools-specialist.agent.md`

**Covers**:
- Encryption Tool (AES-256-GCM)
- Password Generator, Strength Analyzer
- Hash Generator (SHA-256/512, MD5, bcrypt)
- Base64 Encoder/Decoder

**Key Technologies**:
- Web Crypto API (client-side only)
- zxcvbn for password strength
- Have I Been Pwned API for breach checking

**Example Questions**:
- "How do I implement AES-256-GCM encryption in the browser?"
- "What's the pattern for password breach checking?"

---

## Infrastructure Agents (7 Total)

### Analytics & Privacy Specialist (`@analytics-privacy-specialist`)
**File**: `.github/agents/analytics-privacy-specialist.agent.md`

**Focus**: PostHog analytics, GDPR compliance, privacy-first tracking

**Use for**:
- Adding `trackToolEvent()` calls
- Ensuring no PII is logged
- Privacy audits

---

### Backend & API Specialist (`@backend-api-specialist`)
**File**: `.github/agents/backend-api-specialist.agent.md`

**Focus**: Next.js API routes, Supabase, authentication

**Use for**:
- Building API endpoints (`app/api/*`)
- Database queries with Supabase
- Server-side authentication

---

### DevOps & Infrastructure Specialist (`@devops-infrastructure-specialist`)
**File**: `.github/agents/devops-infrastructure-specialist.agent.md`

**Focus**: Build config, CI/CD, Vercel, performance monitoring

**Use for**:
- `next.config.ts` modifications
- GitHub Actions workflows
- Vercel deployment issues
- Bundle size optimization

---

### Frontend & Panda CSS Specialist (`@frontend-panda-css-specialist`)
**File**: `.github/agents/frontend-panda-css-specialist.agent.md`

**Focus**: Panda CSS styling, React 19, component patterns

**Use for**:
- Fixing invalid Panda CSS syntax
- Responsive grid layouts
- Dark glassmorphic theme
- Component composition

**Critical**: SuperTool uses **Panda CSS**, NOT Tailwind! Always use `css()` from `@/styled-system/css`.

---

### Performance & Observability Specialist (`@performance-observability-specialist`)
**File**: `.github/agents/performance-observability-specialist.agent.md`

**Focus**: React Query, virtualization, lazy loading, Core Web Vitals

**Use for**:
- Performance optimization
- Reducing bundle size
- Improving LCP, FID, CLS
- Data caching strategies

---

### Security & Auth Specialist (`@security-auth-specialist`)
**File**: `.github/agents/security-auth-specialist.agent.md`

**Focus**: Supabase Auth, RLS policies, session management

**Use for**:
- User authentication flows
- Protected routes
- Database security policies
- Session handling

---

### Testing & Coverage Specialist (`@testing-coverage-specialist`)
**File**: `.github/agents/testing-coverage-specialist.agent.md`

**Focus**: Vitest, React Testing Library, browser tests, coverage reports

**Use for**:
- Writing unit tests
- Component testing
- Browser-based tests (Canvas, File APIs)
- Improving coverage

---

## Project Context

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Styling**: Panda CSS (NOT Tailwind)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + React Testing Library
- **Analytics**: PostHog (privacy-first)
- **Deployment**: Vercel
- **AI**: OpenAI GPT-4o-mini

### Key Files
- `app/page.tsx` - Homepage with 74 tool cards
- `app/tools/[category]/[tool]/page.tsx` - Tool pages
- `app/api/[route]/route.ts` - API endpoints
- `panda.config.ts` - Panda CSS configuration
- `lib/services/analytics.ts` - PostHog integration
- `.github/copilot-instructions.md` - Comprehensive guide (1271 lines)

### Code Style
- **Imports**: Use `@/` prefix, ordered (React → 3rd party → UI → Features → Utils)
- **Formatting**: Biome enforces 2-space indent, single quotes, no semicolons
- **Components**: Client components must have `'use client'` directive
- **Styling**: Always use Panda CSS `css()` - NOT Tailwind utilities
- **Analytics**: Use `trackToolEvent()` - never log PII or user content

### Critical Patterns
```typescript
// ✅ Correct: Panda CSS
import { css } from '@/styled-system/css'

<main className={css({
  mx: 'auto',
  maxW: '7xl',
  w: 'full',
  px: { base: '4', sm: '6', md: '8' },
  py: { base: '6', sm: '8', md: '10' },
})}>

// ❌ Wrong: Tailwind
<main className="mx-auto max-w-7xl w-full px-4 sm:px-6 md:px-8">
```

### Common Commands
```bash
pnpm dev                         # Dev server (localhost:3000)
pnpm lint                        # Biome format + lint
pnpm test                        # Vitest watch mode
CI=true pnpm test run           # CI mode
pnpm build                       # Production build
```

---

## Agent Creation Guidelines

When creating new agents:

1. **Naming**: Use `kebab-case` with `-specialist` suffix
2. **Frontmatter**: Include `name` and `description`
3. **Structure**:
   - Domain Overview
   - Core Technologies (with code examples)
   - Tool-specific patterns (if applicable)
   - Quality Checklist
   - Common Pitfalls (❌ Don't / ✅ Do)
   - Success Criteria
   - Reference Files
4. **Code Examples**: Use actual code from the project
5. **Practical Focus**: Copy-paste examples, not theory
6. **Length**: Aim for 500-1000 lines for comprehensive coverage

---

## Contributing

To add or update agents:

1. Edit agent files in `.github/agents/`
2. Update this `AGENTS.md` table
3. Test agent invocation with `@agent-name` in Copilot
4. Commit with descriptive message: `feat: add [agent-name] specialist agent`

---

## Troubleshooting

### Agent Not Found
- Ensure file has `.agent.md` extension
- Check frontmatter has `name` and `description`
- Restart VS Code if needed

### Agent Not Helpful
- Agent might not have context for that tool/pattern
- Try a more specific agent (e.g., `@ai-integration-specialist` vs `@ai-features-specialist`)
- Provide more context in your prompt

### Multiple Relevant Agents
- Use the most specific agent first
- Chain agents if needed: Ask one, then refine with another

---

## License

MIT License - Same as SuperTool project

---

**Last Updated**: December 27, 2025
**Total Agents**: 16 (9 tool category + 7 infrastructure)
**Total Lines**: ~12,000+ across all agent files
