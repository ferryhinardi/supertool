# Contributing to SuperTool

Thank you for your interest in contributing to SuperTool! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Tool](#adding-a-new-tool)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/supertool.git
   cd supertool
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ferryhinardi/supertool.git
   ```

4. **Install dependencies**
   ```bash
   yarn install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

6. **Run the development server**
   ```bash
   yarn dev
   ```

## Development Workflow

### Create a feature branch

Follow the branch naming convention:
- `feat/<scope>` - New features (e.g., `feat/markdown-editor`)
- `fix/<scope>` - Bug fixes (e.g., `fix/json-parse-error`)
- `chore/<scope>` - Maintenance tasks (e.g., `chore/update-deps`)
- `docs/<scope>` - Documentation updates

```bash
git checkout -b feat/my-awesome-feature
```

### Keep your fork updated

```bash
git fetch upstream
git rebase upstream/main
```

## Adding a New Tool

1. **Create the tool page**
   ```bash
   mkdir -p app/tools/my-tool
   touch app/tools/my-tool/page.tsx
   ```

2. **Implement the tool**
   ```tsx
   // app/tools/my-tool/page.tsx
   'use client'
   
   import { Button } from '@/components/ui/button'
   
   export default function MyToolPage() {
     return (
       <main className="max-w-5xl mx-auto space-y-4">
         <h1 className="text-2xl font-semibold">My Tool</h1>
         {/* Your tool UI */}
       </main>
     )
   }
   ```

3. **Add to sidebar navigation**
   ```tsx
   // components/layout/Sidebar.tsx
   // Add your tool to the navItems array
   ```

4. **Test your tool**
   ```bash
   yarn dev
   # Visit http://localhost:3000/tools/my-tool
   ```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use proper typing

### React
- Use functional components with hooks
- Use `'use client'` directive for client components
- Keep components small and focused

### Styling
- Use Tailwind CSS utility classes
- Follow existing color scheme (dark theme)
- Ensure responsive design (mobile-first)

### Imports
- Use absolute imports with `@/` prefix
- Group imports: React → Third-party → Local
- Example:
  ```tsx
  import { useState } from 'react'
  import { Button } from '@/components/ui/button'
  import { supabase } from '@/lib/supabaseClient'
  ```

### Performance
- Note expected performance impact (TTI, bundle size, network calls)
- Prefer streaming, caching, and incremental computation
- Flag any bundle increase > 20KB gzip and suggest reductions

## Commit Guidelines

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(json-beautify): add syntax highlighting
fix(upload): handle large file uploads
docs(readme): update installation steps
```

## Pull Request Process

1. **Ensure your code is ready**
   - [ ] Run linter: `yarn lint`
   - [ ] Type check: `npx tsc --noEmit`
   - [ ] Test locally: `yarn dev`
   - [ ] Build successfully: `yarn build`

2. **Update documentation**
   - Update README.md if adding a new tool
   - Add JSDoc comments for complex functions
   - Update type definitions if needed

3. **Create the PR**
   - Use the PR template
   - Link related issues
   - Add screenshots/videos if UI changes
   - Request review from maintainers

4. **Address feedback**
   - Respond to review comments
   - Make requested changes
   - Re-request review when ready

5. **Squash merge**
   - PRs will be squash merged to keep history clean
   - Ensure your PR title follows commit guidelines

## Need Help?

- 📖 Check the [README](./README.md)
- 🐛 [Open an issue](https://github.com/ferryhinardi/supertool/issues/new/choose)
- 💬 Ask questions in your PR

---

Thank you for contributing! 🚀
