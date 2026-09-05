# 🚀 SuperTool - WARP Development Guide

> **Comprehensive development guide for the SuperTool project**  
> Last Updated: October 25, 2025

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Initial Setup](#-initial-setup)
- [Environment Variables](#-environment-variables)
- [Development Workflow](#-development-workflow)
- [Common Commands](#-common-commands)
- [Project Structure](#-project-structure)
- [Coding Standards](#-coding-standards)
- [Testing Strategy](#-testing-strategy)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Adding New Tools](#-adding-new-tools)
- [MCP Integration](#-mcp-integration)
- [Performance Guidelines](#-performance-guidelines)
- [Key Configuration Files](#-key-configuration-files)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)

---

## 🎯 Project Overview

**SuperTool** is a modern, beautifully designed developer toolkit that provides essential utilities for developers. Built with cutting-edge web technologies, it emphasizes:

- 🎨 **Beautiful UI** - Dark theme with gradient aesthetics and glassmorphism effects
- ⚡ **Performance** - Optimized bundle sizes, streaming, and incremental computation
- 🧪 **Quality** - Comprehensive test coverage with Vitest and Playwright
- 🤖 **AI-Enhanced** - MCP integration for AI-assisted development
- ♿ **Accessible** - WCAG compliant with keyboard navigation support

### Current Tools

- 🎨 **JSON Beautifier** - Format, validate, and minify JSON with syntax highlighting
- 🔄 **Diff Viewer** - Compare text/JSON side-by-side like GitHub PR reviews
- 📁 **File Upload** - Upload files to cloud storage with drag-and-drop
- ✂️ **URL Shortener** - Create short URLs with QR codes
- 📝 **Markdown Editor** - Real-time markdown editor with preview
- 🎯 **More Coming** - Image optimization, API testing, and more!

---

## 🛠️ Tech Stack

| Category            | Technology             | Version     | Documentation                               |
| ------------------- | ---------------------- | ----------- | ------------------------------------------- |
| **Framework**       | Next.js                | 16.0.0      | [Docs](https://nextjs.org/docs)             |
| **React**           | React                  | 19.2.0      | [Docs](https://react.dev)                   |
| **Language**        | TypeScript             | ^5          | [Docs](https://www.typescriptlang.org/docs) |
| **Styling**         | Panda CSS              | ^1.4.3      | [Docs](https://panda-css.com)               |
| **UI Components**   | Ark UI + Radix UI      | Latest      | [Docs](https://ark-ui.com)                  |
| **Animation**       | Framer Motion          | ^12.23.24   | [Docs](https://www.framer.com/motion)       |
| **Testing**         | Vitest + Playwright    | ^2.1.8      | [Docs](https://vitest.dev)                  |
| **Code Quality**    | ESLint + Prettier      | ^9 / ^3.6.2 | -                                           |
| **Git Hooks**       | Husky + lint-staged    | ^9.1.7      | -                                           |
| **Package Manager** | pnpm                   | 8+          | [Docs](https://pnpm.io)                     |
| **Backend**         | Supabase               | ^2.76.1     | [Docs](https://supabase.com/docs)           |
| **CI/CD**           | GitHub Actions         | -           | [Docs](https://docs.github.com/actions)     |
| **MCP**             | Model Context Protocol | 1.0.0       | [Docs](https://modelcontextprotocol.io)     |

### Key Features

- **React 19** with React Compiler enabled (automatic optimizations)
- **Next.js 16** with App Router (server components by default)
- **Panda CSS** with zero-runtime CSS-in-JS and type-safe styling
- **Ark UI** for accessible, headless UI components
- **Vitest Browser Mode** for real browser testing with Playwright
- **CodeMirror** for advanced code editing with syntax highlighting
- **Supabase** for database, authentication, and file storage

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ferryhinardi/supertool.git
cd supertool

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Install Playwright browsers (for testing)
pnpm exec playwright install chromium

# Start development server
pnpm dev

# Open http://localhost:3000
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Check Command   | Install                         |
| ----------- | ------- | --------------- | ------------------------------- |
| **Node.js** | 20+     | `node -v`       | [Download](https://nodejs.org)  |
| **pnpm**    | 8+      | `pnpm -v`       | `npm install -g pnpm`           |
| **Git**     | Latest  | `git --version` | [Download](https://git-scm.com) |

### Optional (for full functionality)

- **GitHub Personal Access Token** - For MCP GitHub integration
- **Supabase Account** - For file upload and database features
- **Google Analytics** - For analytics tracking

---

## 🔧 Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies from `package.json` and set up Husky git hooks automatically.

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Open and edit with your preferred editor
code .env.local  # VS Code
vim .env.local   # Vim
nano .env.local  # Nano
```

### 3. Install Browser for Testing

```bash
# Install Chromium (required for Vitest browser tests)
pnpm exec playwright install chromium

# Or install all browsers
pnpm exec playwright install --with-deps
```

### 4. Verify Setup

```bash
# Run linter
pnpm lint

# Run type check
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Start development server
pnpm dev
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required for Full Functionality

```bash
# Supabase Configuration (for file upload and database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics 4 (for analytics tracking)
# Get from: https://analytics.google.com/analytics/web/
# Navigate to: Admin → Data Streams → Web → Copy Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Optional - MCP Integration

```bash
# GitHub MCP Server (for AI-assisted development)
GITHUB_TOKEN=your_github_personal_access_token

# Brave Search (for web search capabilities)
# BRAVE_API_KEY=your_brave_api_key

# Slack Integration
# SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
# SLACK_TEAM_ID=your-team-id

# PostgreSQL (if using database MCP server)
# DATABASE_URL=postgresql://user:password@localhost:5432/supertool
```

### How to Get Credentials

**Supabase:**

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy `URL` and `anon` public key

**GitHub Token (for MCP):**

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`, `read:org`
4. Copy the token

**Google Analytics:**

1. Sign up at [analytics.google.com](https://analytics.google.com)
2. Create a property
3. Add a data stream (Web)
4. Copy the Measurement ID (G-XXXXXXXXXX)

---

## 💻 Development Workflow

### Daily Development Cycle

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create a feature branch
git checkout -b feat/my-feature

# 3. Start development server
pnpm dev

# 4. Make changes and test
pnpm test              # Run tests in watch mode
pnpm lint              # Check code quality

# 5. Format and commit
pnpm format            # Format all files
git add .
git commit -m "feat: add my feature"  # Husky runs pre-commit hooks

# 6. Push and create PR
git push origin feat/my-feature
```

### Branch Naming Convention

| Type          | Prefix      | Example                   |
| ------------- | ----------- | ------------------------- |
| New Feature   | `feat/`     | `feat/image-optimizer`    |
| Bug Fix       | `fix/`      | `fix/json-parse-error`    |
| Maintenance   | `chore/`    | `chore/update-deps`       |
| Documentation | `docs/`     | `docs/update-readme`      |
| Refactoring   | `refactor/` | `refactor/simplify-utils` |
| Performance   | `perf/`     | `perf/optimize-bundle`    |

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

**Examples:**

```bash
feat(json-beautify): add syntax highlighting with CodeMirror
fix(upload): handle large file uploads correctly
docs(readme): update installation instructions
style(sidebar): adjust gradient colors
refactor(utils): simplify cn function
perf(json-beautify): optimize parsing for large files
chore(deps): update Next.js to 16.0.1
```

---

## 📝 Common Commands

### Development Commands

| Command             | Description              | When to Use           |
| ------------------- | ------------------------ | --------------------- |
| `pnpm dev`          | Start development server | Daily development     |
| `pnpm build`        | Build for production     | Before deployment     |
| `pnpm start`        | Start production server  | Test production build |
| `pnpm lint`         | Run ESLint               | Before commit         |
| `pnpm lint:fix`     | Fix ESLint errors        | Auto-fix issues       |
| `pnpm format`       | Format with Prettier     | Before commit         |
| `pnpm format:check` | Check formatting         | CI pipeline           |

### Testing Commands

| Command                    | Description             | When to Use           |
| -------------------------- | ----------------------- | --------------------- |
| `pnpm test`                | Run tests in watch mode | During development    |
| `pnpm test:ui`             | Open Vitest UI          | Interactive testing   |
| `pnpm test:browser`        | Run browser tests       | Test browser features |
| `pnpm test run`            | Run tests once          | CI pipeline           |
| `pnpm test run --coverage` | Generate coverage       | Check test coverage   |

### Utility Commands

| Command                   | Description             | When to Use          |
| ------------------------- | ----------------------- | -------------------- |
| `pnpm ui:add <component>` | Add shadcn/ui component | Add new UI component |
| `pnpm mcp:validate`       | Validate MCP config     | Check MCP setup      |
| `pnpm mcp:setup`          | Set up MCP integration  | First-time MCP setup |
| `pnpm exec tsc --noEmit`  | Type check              | Verify TypeScript    |

### Examples

```bash
# Add a new UI component
pnpm ui:add dialog
pnpm ui:add dropdown-menu

# Run specific test file
pnpm test json-beautify

# Run tests with coverage
pnpm test run --coverage

# Watch specific files
pnpm test --grep "Button"

# Check types
pnpm exec tsc --noEmit
```

---

## 📁 Project Structure

```
supertool/
├── app/                       # Next.js App Router (pages & routing)
│   ├── tools/                 # Tool pages
│   │   ├── json-beautify/     # JSON beautifier tool
│   │   ├── diff/              # Diff viewer tool
│   │   ├── upload/            # File upload tool
│   │   ├── url-shortener/     # URL shortener tool
│   │   └── markdown-editor/   # Markdown editor tool
│   ├── api/                   # API routes
│   │   ├── feedback/          # Feedback API
│   │   └── shorten/           # URL shortener API
│   ├── s/[code]/              # Short URL redirect
│   ├── layout.tsx             # Root layout with sidebar
│   ├── page.tsx               # Homepage
│   ├── globals.css            # Global Tailwind styles
│   └── __tests__/             # Page-level tests
│
├── components/                # React components
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx         # Button component
│   │   ├── card.tsx           # Card component
│   │   ├── input.tsx          # Input component
│   │   └── __tests__/         # UI component tests
│   ├── layout/                # Layout components
│   │   ├── Header.tsx         # Header with navigation
│   │   └── Sidebar.tsx        # Sidebar with tool links
│   └── features/              # Feature-specific components
│       ├── DragDropZone.tsx   # Drag and drop file upload
│       └── __tests__/         # Feature component tests
│
├── lib/                       # Utilities and shared libraries
│   ├── utils.ts               # Helper functions (cn, etc.)
│   ├── supabaseClient.ts      # Supabase client config
│   └── types.ts               # Shared TypeScript types
│
├── public/                    # Static assets
│   ├── images/                # Images
│   └── fonts/                 # Custom fonts
│
├── docs/                      # Project documentation
│   ├── README.md              # Docs overview
│   ├── TESTING.md             # Testing guide
│   ├── MCP_SETUP.md           # MCP configuration
│   ├── CI_CD_SETUP.md         # CI/CD guide
│   └── TESTING_QUICKSTART.md  # Quick testing guide
│
├── scripts/                   # Utility scripts
│   └── validate-mcp.js        # MCP validation script
│
├── .github/                   # GitHub configuration
│   ├── workflows/             # GitHub Actions
│   │   └── ci.yml             # CI/CD pipeline
│   └── ISSUE_TEMPLATE/        # Issue templates
│
├── .husky/                    # Git hooks
│   └── pre-commit             # Pre-commit hook
│
├── .mcp/                      # MCP configuration
│   └── mcp.json               # MCP servers config
│
├── .vscode/                   # VS Code settings
│   └── settings.json          # Editor config
│
├── vitest.config.ts           # Vitest configuration
├── next.config.ts             # Next.js configuration
├── panda.config.ts            # Panda CSS configuration
├── eslint.config.mjs          # ESLint configuration
├── prettier.config.js         # Prettier configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── pnpm-lock.yaml             # Lock file
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── README.md                  # Project README
├── CONTRIBUTING.md            # Contribution guidelines
├── copilot-instructions.md    # AI assistant guidelines
└── WARP.md                    # This file!
```

### Directory Purposes

| Directory              | Purpose                     | Naming Convention |
| ---------------------- | --------------------------- | ----------------- |
| `app/`                 | Next.js pages and routing   | kebab-case        |
| `components/ui/`       | Reusable UI primitives      | PascalCase        |
| `components/layout/`   | Layout components           | PascalCase        |
| `components/features/` | Feature-specific components | PascalCase        |
| `lib/`                 | Utilities and helpers       | camelCase         |
| `public/`              | Static assets               | kebab-case        |
| `docs/`                | Documentation files         | UPPERCASE.md      |
| `__tests__/`           | Test files                  | \*.test.tsx       |

---

## 📐 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ DO: Use strict mode (already enabled)
interface User {
  id: string
  name: string
  email: string
}

// ✅ DO: Prefer type inference
const users = ['Alice', 'Bob'] // inferred as string[]

// ✅ DO: Use interfaces for public APIs
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

// ❌ DON'T: Use any types
const handleData = (data: any) => {} // Avoid this

// ✅ DO: Use proper types
const handleData = (data: unknown) => {
  if (typeof data === 'string') {
    // Handle string
  }
}
```

### React Patterns

```tsx
// ✅ DO: Functional components with hooks
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}

// ✅ DO: Server components by default (no 'use client')
export function StaticHeader() {
  return <header>SuperTool</header>
}

// ✅ DO: Custom hooks for reusable logic
function useLocalStorage(key: string) {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key)
  })

  return [value, setValue] as const
}
```

### Styling with Panda CSS

```tsx
import { css, cx } from '@/styled-system/css'
import { styled } from '@/styled-system/jsx'

// ✅ DO: Use Panda CSS styled system
export function Card({ children, className }) {
  return (
    <div className={cx(
      css({
        borderRadius: 'lg',
        border: '1px solid',
        bg: 'card',
        p: 6,
        shadow: 'sm',
        backdropFilter: 'blur(16px)',
      }),
      className
    )}>
      {children}
    </div>
  )
}

// ✅ DO: Use styled components for reusable patterns
const Hero = styled('div', {
  base: {
    fontSize: 'lg',
    md: { fontSize: 'xl' },
    lg: { fontSize: '2xl' },
  }
})

// ✅ DO: Use consistent spacing tokens
<div className={css({ spaceY: 4, p: 6 })}>
  <h1 className={css({ mb: 8 })}>Title</h1>
</div>

// ❌ DON'T: Use arbitrary values unless necessary
<div className={css({ p: '13px' })}>  {/* Avoid - use tokens */}

// ✅ DO: Use Panda CSS for dynamic styles
const dynamicStyle = css({ p: isPadded ? 4 : 0 })
```

### Import Organization

```tsx
// ✅ DO: Organize imports in this order
'use client'

// 1. React and Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 2. Third-party libraries
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// 3. UI components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Feature components
import { DragDropZone } from '@/components/features/DragDropZone'

// 5. Utilities and libs
import { cx, css } from '@/styled-system/css'
import { supabase } from '@/lib/supabaseClient'

// 6. Types
import type { User } from '@/lib/types'
```

### Code Formatting Rules

The project uses Prettier with these settings:

```json
{
  "semi": false, // No semicolons
  "singleQuote": true, // Single quotes for strings
  "printWidth": 100, // 100 character line width
  "tabWidth": 2, // 2 spaces indentation
  "trailingComma": "es5", // Trailing commas in ES5
  "arrowParens": "always" // Always wrap arrow function params
}
```

**Panda CSS** provides type-safe styling with zero runtime overhead.

---

## 🧪 Testing Strategy

### Test File Structure

```
components/
  ui/
    button.tsx
    __tests__/
      button.test.tsx      # Unit tests for Button
  features/
    DragDropZone.tsx
    __tests__/
      DragDropZone.test.tsx

app/
  tools/
    json-beautify/
      page.tsx
      __tests__/
        page.test.tsx       # Integration tests for JSON Beautify page
```

### Vitest Configuration

**vitest.config.ts** includes:

- Browser mode enabled (Playwright + Chromium)
- Coverage reporting with Istanbul
- React Testing Library integration
- jsdom environment for unit tests

### Writing Tests

#### Unit Test Example

```tsx
// components/ui/__tests__/button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

#### Integration Test Example

```tsx
// app/tools/json-beautify/__tests__/page.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import JsonBeautifyPage from '../page'

describe('JSON Beautify Page', () => {
  it('renders the page with title', () => {
    render(<JsonBeautifyPage />)
    expect(screen.getByText(/JSON Beautifier/i)).toBeInTheDocument()
  })

  it('formats JSON correctly', async () => {
    render(<JsonBeautifyPage />)
    const input = screen.getByRole('textbox')

    await userEvent.type(input, '{"name":"John"}')
    await userEvent.click(screen.getByText(/Format/i))

    expect(input).toHaveValue('{\n  "name": "John"\n}')
  })
})
```

### Testing Best Practices

**✅ DO:**

- Write tests at the page level (integration tests)
- Place tests in `__tests__` directories
- Mock external dependencies (Supabase, APIs)
- Use descriptive test names
- Test user interactions, not implementation details
- Aim for >80% coverage on critical paths

**❌ DON'T:**

- Test implementation details (state, internal functions)
- Write overly complex tests
- Skip tests for critical features
- Ignore failing tests

### Running Specific Tests

```bash
# Run all tests
pnpm test

# Run tests in a specific file
pnpm test button.test.tsx

# Run tests matching a pattern
pnpm test --grep "Button"

# Run tests in browser mode
pnpm test:browser

# Run tests with coverage
pnpm test run --coverage

# Open Vitest UI
pnpm test:ui
```

### Coverage Thresholds

The project maintains these coverage goals:

| Metric     | Target | Critical Paths |
| ---------- | ------ | -------------- |
| Statements | >70%   | >80%           |
| Branches   | >70%   | >80%           |
| Functions  | >70%   | >80%           |
| Lines      | >70%   | >80%           |

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated CI/CD. The workflow runs on:

- Every push to `main` branch
- Every pull request targeting `main`

### Workflow Jobs

```
┌─────────────────┐
│ Lint & Typecheck│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──┐
│ Tests │ │Build│
└───────┘ └─────┘
  (parallel)
```

#### 1. Lint & Type Check (Required)

- Runs ESLint to check code quality
- Runs TypeScript compiler to verify types
- Must pass before other jobs run

**Commands:**

```bash
pnpm lint
pnpm exec tsc --noEmit
```

#### 2. Tests (Parallel after Lint)

- Installs Playwright Chromium
- Runs all unit and integration tests
- Generates code coverage reports
- Uploads coverage to Codecov (optional)
- Captures screenshots on test failures

**Commands:**

```bash
pnpm exec playwright install chromium
pnpm test run --coverage
```

#### 3. Build (Parallel after Lint)

- Verifies Next.js production build succeeds
- Uses environment variables (with fallbacks)
- Uploads build artifacts

**Commands:**

```bash
pnpm build
```

### Performance Targets

| Stage             | Max Duration | Notes                      |
| ----------------- | ------------ | -------------------------- |
| Lint & Type Check | 30-45 sec    | Fast fail for code quality |
| Tests             | 1-2 min      | Parallel with build        |
| Build             | 1-2 min      | Parallel with tests        |
| **Total**         | **~2-3 min** | Thanks to parallelization  |

### Local CI Simulation

Run these commands before pushing to catch issues early:

```bash
# Full CI simulation
pnpm lint                     # ESLint check
pnpm exec tsc --noEmit        # Type check
pnpm test run                 # Run all tests
pnpm test run --coverage      # Generate coverage
pnpm build                    # Production build
```

### Required Repository Secrets

For full CI/CD functionality, add these secrets in GitHub:

**Settings → Secrets and variables → Actions**

| Secret                          | Purpose              | Required   |
| ------------------------------- | -------------------- | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL | Optional\* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key    | Optional\* |
| `CODECOV_TOKEN`                 | Codecov upload token | Optional   |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID  | Optional   |

\*Has fallback values for build verification

### Viewing CI Results

- **Actions Tab**: View all workflow runs
- **PR Checks**: See status before merging
- **Artifacts**: Download screenshots from failed tests

---

## 🎯 Adding New Tools

Follow this step-by-step guide to add a new tool to SuperTool:

### 1. Create Tool Directory and Page

```bash
# Create the tool directory
mkdir -p app/tools/my-tool

# Create the page file
touch app/tools/my-tool/page.tsx
```

### 2. Implement the Tool Page

```tsx
// app/tools/my-tool/page.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function MyToolPage() {
  const [result, setResult] = useState('')

  const handleProcess = () => {
    // Your tool logic here
    toast.success('Processed successfully!')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-4xl font-extrabold text-transparent">
          My Tool
        </h1>
        <p className="text-lg text-gray-400">Brief description of what your tool does</p>
      </div>

      {/* Tool UI */}
      <Card className="p-6">
        {/* Your tool implementation */}
        <Button onClick={handleProcess}>Process</Button>
      </Card>
    </main>
  )
}
```

### 3. Add Tool to Sidebar Navigation

```tsx
// components/layout/Sidebar.tsx
import { Sparkles } from 'lucide-react' // Choose an appropriate icon

const navigation = [
  // ... existing tools
  {
    name: 'My Tool',
    href: '/tools/my-tool',
    icon: Sparkles,
    description: 'Brief description',
  },
]
```

### 4. Create Tests

```bash
# Create test directory
mkdir -p app/tools/my-tool/__tests__

# Create test file
touch app/tools/my-tool/__tests__/page.test.tsx
```

```tsx
// app/tools/my-tool/__tests__/page.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyToolPage from '../page'

describe('My Tool Page', () => {
  it('renders the page with title', () => {
    render(<MyToolPage />)
    expect(screen.getByText(/My Tool/i)).toBeInTheDocument()
  })

  it('processes input correctly', async () => {
    render(<MyToolPage />)
    const button = screen.getByText(/Process/i)

    await userEvent.click(button)

    // Add assertions for expected behavior
  })
})
```

### 5. Run Tests and Verify

```bash
# Run your tests
pnpm test my-tool

# Check coverage
pnpm test run --coverage

# Verify build
pnpm build
```

### 6. Performance Check

```bash
# Build and analyze bundle size
pnpm build

# Check the build output for bundle sizes
# Flag if your tool adds > 20KB gzipped
```

### 7. Create Pull Request

```bash
# Create feature branch
git checkout -b feat/my-tool

# Commit your changes
git add .
git commit -m "feat(my-tool): add new tool for X"

# Push and create PR
git push origin feat/my-tool
```

### Checklist

Before submitting your PR, ensure:

- [ ] Tool page created in `app/tools/[tool-name]/`
- [ ] Tests created in `__tests__/` directory
- [ ] Tool added to sidebar navigation
- [ ] Tests passing (`pnpm test`)
- [ ] Linting passing (`pnpm lint`)
- [ ] Type checking passing (`pnpm exec tsc --noEmit`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Bundle size increase < 20KB gzipped
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Dark theme styling consistent
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] Documentation updated (README, etc.)

---

## 🤖 MCP Integration

### What is MCP?

Model Context Protocol (MCP) is a standardized protocol that enables AI assistants to connect to external systems and data sources. In SuperTool, MCP provides:

- 🔗 **GitHub Integration** - Issues, PRs, CI/CD status
- 📁 **Filesystem Access** - Read files, navigate directories
- 🔄 **Git Operations** - Status, diffs, commit history
- 🌐 **HTTP Requests** - Fetch external APIs
- 🧠 **Memory/Knowledge** - Persistent context across sessions
- 🤔 **Sequential Thinking** - Step-by-step problem solving

### Quick MCP Setup

```bash
# 1. Set up GitHub token (required)
export GITHUB_TOKEN="your_github_personal_access_token"

# 2. Reload your shell
source ~/.zshrc  # or ~/.bashrc

# 3. Validate MCP configuration
pnpm mcp:validate

# 4. Test MCP server
npx -y @modelcontextprotocol/server-github --help
```

### Enabled MCP Servers

| Server                  | Purpose            | Status      | Required Env      |
| ----------------------- | ------------------ | ----------- | ----------------- |
| **github**              | GitHub integration | ✅ Enabled  | `GITHUB_TOKEN`    |
| **filesystem**          | File operations    | ✅ Enabled  | None              |
| **git**                 | Git operations     | ✅ Enabled  | None              |
| **fetch**               | HTTP requests      | ✅ Enabled  | None              |
| **memory**              | Knowledge graph    | ✅ Enabled  | None              |
| **sequential-thinking** | Enhanced reasoning | ✅ Enabled  | None              |
| brave-search            | Web search         | ❌ Disabled | `BRAVE_API_KEY`   |
| postgres                | Database ops       | ❌ Disabled | `DATABASE_URL`    |
| puppeteer               | Browser automation | ❌ Disabled | None              |
| slack                   | Slack integration  | ❌ Disabled | `SLACK_BOT_TOKEN` |

### Common MCP Use Cases

**Code Review:**

```
"Check GitHub for open PRs and review the changes"
"What's the CI status on the latest commit?"
```

**Issue Management:**

```
"Create a GitHub issue for improving test coverage"
"Show me all open bugs in the repository"
```

**Code Analysis:**

```
"Find all files using useState hook"
"Show me the git diff for uncommitted changes"
```

**Documentation:**

```
"Read all markdown files and identify outdated sections"
"Search for TODO comments across the project"
```

### Detailed Setup

For comprehensive MCP setup instructions, see:

- **[docs/guides/MCP_SETUP.md](./MCP_SETUP.md)** - Complete MCP configuration guide
- **Configuration file**: `.mcp/mcp.json`

---

## ⚡ Performance Guidelines

### Bundle Size

**Rule:** Flag any bundle increase > 20KB gzipped and suggest optimizations.

```bash
# Check bundle sizes after build
pnpm build

# Look for large chunks in build output
# Example output:
# ✓ Compiled successfully
# Route (app)                              Size     First Load JS
# ┌ ○ /                                    5.2 kB         95 kB
# ├ ○ /tools/json-beautify                 12 kB          107 kB  ⚠️ Large!
```

### Optimization Strategies

**1. Dynamic Imports for Heavy Components**

```tsx
// ❌ DON'T: Import heavy components directly
import CodeMirror from '@uiw/react-codemirror'

// ✅ DO: Use dynamic imports
import dynamic from 'next/dynamic'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
})
```

**2. Optimize Images**

```tsx
// ✅ DO: Use next/image for optimized images
import Image from 'next/image'
;<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  height={600}
  priority // For above-the-fold images
/>
```

**3. Code Splitting**

```tsx
// ✅ DO: Split large components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false,
})

// Only load when needed
{
  showChart && <HeavyChart data={chartData} />
}
```

**4. Streaming and Incremental Computation**

```tsx
// ✅ DO: Stream data instead of loading all at once
export async function ServerComponent() {
  const data = await fetchData() // Streamed to client

  return <DataDisplay data={data} />
}
```

### Performance Checklist

When adding new features:

- [ ] Note expected perf impact (TTI, bundle size, network calls)
- [ ] Use streaming where possible
- [ ] Implement caching for expensive operations
- [ ] Prefer incremental computation over batch processing
- [ ] Measure bundle size before and after changes
- [ ] Check Lighthouse scores (aim for >90 on all metrics)

---

## 🔑 Key Configuration Files

### Next.js Configuration

**File:** `next.config.ts`

```typescript
// Key configurations:
// - React Compiler enabled
// - Image optimization
// - Environment variables
// - Build output settings
```

### Panda CSS Configuration

**File:** `panda.config.ts`

```typescript
// Key configurations:
// - Design tokens (colors, spacing, etc.)
// - Utilities and patterns
// - Theme configuration
// - Global styles
// - JSX framework integration
```

### Vitest Configuration

**File:** `vitest.config.ts`

```typescript
// Key configurations:
// - Browser mode (Playwright + Chromium)
// - Coverage reporting
// - Test environment (jsdom)
// - Path aliases (@/)
```

### ESLint Configuration

**File:** `eslint.config.mjs`

```javascript
// Key configurations:
// - Next.js rules
// - React Compiler rules
// - TypeScript rules
// - Prettier integration
```

### TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true, // Strict type checking
    "target": "ES2020", // Modern JavaScript
    "lib": ["ES2020", "DOM"], // Available APIs
    "jsx": "preserve", // JSX for React
    "module": "ESNext", // ES modules
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"] // Absolute imports
    }
  }
}
```

### Package Manager

**File:** `package.json`

Key scripts and dependencies. Always use `pnpm` for consistency.

---

## 🔧 Troubleshooting

### Common Issues

#### 1. `pnpm install` fails

**Solution:**

```bash
# Clear cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

#### 2. Playwright tests fail

**Solution:**

```bash
# Reinstall browsers
pnpm exec playwright install --with-deps chromium

# Or install all browsers
pnpm exec playwright install --with-deps
```

#### 3. ESLint errors

**Solution:**

```bash
# Auto-fix linting errors
pnpm lint:fix

# Format code
pnpm format
```

#### 4. TypeScript errors

**Solution:**

```bash
# Run type check
pnpm exec tsc --noEmit

# Check specific file
pnpm exec tsc --noEmit path/to/file.tsx
```

#### 5. Build fails

**Solution:**

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

#### 6. Environment variables not working

**Solution:**

```bash
# Check .env.local exists
ls -la .env.local

# Verify variables start with NEXT_PUBLIC_ for client-side access
# Restart dev server after changes
pnpm dev
```

#### 7. MCP servers not working

**Solution:**

```bash
# Validate MCP configuration
pnpm mcp:validate

# Check environment variables
echo $GITHUB_TOKEN

# Test MCP server directly
npx -y @modelcontextprotocol/server-github --help
```

#### 8. Tests pass locally but fail on CI

**Solution:**

```bash
# Use same Node version as CI (20.x)
node -v

# Install dependencies with frozen lockfile
pnpm install --frozen-lockfile

# Check for environment-specific code
# Review test screenshots in CI artifacts
```

---

## 📚 Resources

### Documentation

| Resource                 | Description                      | Link                                                         |
| ------------------------ | -------------------------------- | ------------------------------------------------------------ |
| **Project Docs**         | Full documentation               | [./docs/README.md](../README.md)                         |
| **Testing Guide**        | Testing setup and best practices | [./docs/guides/TESTING.md](./TESTING.md)                       |
| **MCP Setup**            | MCP configuration guide          | [./docs/guides/MCP_SETUP.md](./MCP_SETUP.md)                   |
| **CI/CD Setup**          | GitHub Actions workflow          | [./docs/CI_CD_SETUP.md](../setup/CI_CD_SETUP.md)               |
| **Testing Quick Start**  | Quick testing guide              | [./docs/guides/TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) |
| **Contributing**         | Contribution guidelines          | [./CONTRIBUTING.md](../../CONTRIBUTING.md)                       |
| **Copilot Instructions** | AI assistant guidelines          | [./copilot-instructions.md](../../.github/copilot-instructions.md)       |

### External Resources

| Technology        | Documentation                                                  |
| ----------------- | -------------------------------------------------------------- |
| **Next.js**       | [nextjs.org/docs](https://nextjs.org/docs)                     |
| **React**         | [react.dev](https://react.dev)                                 |
| **TypeScript**    | [typescriptlang.org/docs](https://www.typescriptlang.org/docs) |
| **Panda CSS**     | [panda-css.com](https://panda-css.com)                         |
| **Ark UI**        | [ark-ui.com](https://ark-ui.com)                               |
| **Radix UI**      | [radix-ui.com](https://www.radix-ui.com)                       |
| **Framer Motion** | [framer.com/motion](https://www.framer.com/motion)             |
| **Vitest**        | [vitest.dev](https://vitest.dev)                               |
| **Playwright**    | [playwright.dev](https://playwright.dev)                       |
| **Supabase**      | [supabase.com/docs](https://supabase.com/docs)                 |
| **MCP**           | [modelcontextprotocol.io](https://modelcontextprotocol.io)     |

### Community & Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/ferryhinardi/supertool/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ferryhinardi/supertool/discussions)
- 📧 **Contact**: [@ferryhinardi](https://github.com/ferryhinardi)

---

## 🤝 Contributing

We welcome contributions! Please see:

- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - Detailed contribution guidelines
- **[copilot-instructions.md](../../.github/copilot-instructions.md)** - AI assistant guidelines

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes and write tests
4. Run checks: `pnpm lint && pnpm test && pnpm build`
5. Commit with conventional commits: `git commit -m "feat: add feature"`
6. Push and create a pull request

---

## 📄 License

This project is open source and available under the [MIT License](../../LICENSE).

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Panda CSS](https://panda-css.com/) - Modern CSS-in-JS
- [Ark UI](https://ark-ui.com/) - Headless UI components
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Vitest](https://vitest.dev/) - Next-gen testing framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Model Context Protocol](https://modelcontextprotocol.io/) - AI integration

---

**Last Updated:** October 25, 2025  
**Project:** SuperTool - Modern Developer Toolkit  
**Version:** 0.1.0  
**Maintainer:** [@ferryhinardi](https://github.com/ferryhinardi)

---

🚀 **Ready to build something amazing? Start with `pnpm dev`!**
