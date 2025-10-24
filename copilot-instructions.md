# SuperTool - Copilot Instructions

This is a **Next.js 16** application built with **React 19**, **TypeScript**, and **Tailwind CSS**. It provides a collection of modern, beautifully designed developer tools with a focus on user experience and performance. Please follow these guidelines when contributing:

## Code Standards

### Required Before Each Commit

- Run `pnpm format` before committing to ensure consistent code formatting
- Run `pnpm lint` to check for linting errors
- Husky pre-commit hooks will automatically format staged files
- Ensure TypeScript types are valid: `npx tsc --noEmit`

### Development Flow

- **Install dependencies**: `pnpm install`
- **Development server**: `pnpm dev` (runs on http://localhost:3000)
- **Build**: `pnpm build`
- **Production server**: `pnpm start`
- **Linting**: `pnpm lint` or `pnpm lint:fix` for auto-fix
- **Format check**: `pnpm format:check`

## Repository Structure

- `app/`: Next.js App Router pages and layouts
  - `app/page.tsx`: Homepage
  - `app/layout.tsx`: Root layout with sidebar and global styles
  - `app/tools/`: Individual tool pages (e.g., `json-beautify/`, `upload/`)
  - `app/globals.css`: Global Tailwind styles
- `components/`: React components organized by category
  - `components/ui/`: shadcn/ui components (Button, Card, Input, etc.)
  - `components/layout/`: Layout components (Header, Sidebar)
  - `components/features/`: Feature-specific components (DragDropZone)
- `lib/`: Utility functions and shared libraries
  - `lib/utils.ts`: Helper functions (cn utility for class merging)
  - `lib/supabaseClient.ts`: Supabase client configuration
- `docs/`: Documentation files
- `public/`: Static assets

## Key Technologies

- **Framework**: Next.js 16 with App Router
- **React**: Version 19.2.0 with React Compiler enabled
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 with custom dark theme
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Code Editor**: CodeMirror for JSON editing
- **Icons**: Lucide React
- **Notifications**: Sonner for toast messages
- **Animation**: Framer Motion
- **Backend**: Supabase for database and storage
- **Package Manager**: pnpm

## Coding Guidelines

### TypeScript

- Use TypeScript for all code files
- Enable strict mode (already configured)
- Avoid `any` types - use proper type definitions
- Prefer interfaces for object shapes, types for unions/intersections
- Use type inference where possible

### React

- Use functional components with hooks
- Add `'use client'` directive for client components (interactive UI)
- Keep components small and focused (single responsibility)
- Use React 19 features appropriately
- Follow React Compiler guidelines (no manual memoization unless necessary)

### Styling

- Use Tailwind CSS utility classes exclusively
- Follow the dark theme gradient aesthetic (`from-purple-500`, `via-pink-500`, etc.)
- Ensure responsive design with mobile-first approach
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Maintain glassmorphism effects: `backdrop-blur-xl`, `bg-gradient-to-br`, etc.
- Apply consistent spacing with Tailwind's spacing scale

### Import Organization

- Use absolute imports with `@/` prefix
- Group imports in this order:
  1. React and Next.js imports
  2. Third-party libraries
  3. UI components (`@/components/ui`)
  4. Feature components (`@/components`)
  5. Utils and libs (`@/lib`)
  6. Types
- Example:

  ```tsx
  'use client'

  import { useState } from 'react'
  import { toast } from 'sonner'
  import { Button } from '@/components/ui/button'
  import { DragDropZone } from '@/components/features/DragDropZone'
  import { cn } from '@/lib/utils'
  ```

### Code Formatting

- **No semicolons** (enforced by Prettier)
- **Single quotes** for strings
- **100 character line width**
- **2 spaces indentation**
- **Trailing commas** in ES5-compatible locations
- **Tailwind classes automatically sorted** by prettier-plugin-tailwindcss

### Performance Considerations

- Flag bundle increases > 20KB gzipped and suggest optimizations
- Use dynamic imports for heavy components: `next/dynamic`
- Optimize images with `next/image`
- Prefer streaming and incremental computation
- Leverage React 19's automatic optimizations
- Use `useMemo` and `useCallback` only when profiling shows benefit

## Adding a New Tool

1. **Create tool directory and page**

   ```bash
   mkdir -p app/tools/my-tool
   touch app/tools/my-tool/page.tsx
   ```

2. **Implement the tool page**

   ```tsx
   'use client'

   import { Button } from '@/components/ui/button'
   import { toast } from 'sonner'

   export default function MyToolPage() {
     return (
       <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
         <h1 className="text-4xl font-extrabold">My Tool</h1>
         {/* Your tool implementation */}
       </main>
     )
   }
   ```

3. **Add to sidebar navigation**
   - Edit `components/layout/Sidebar.tsx`
   - Add entry to the `navigation` array with appropriate icon from `lucide-react`

4. **Test locally**
   ```bash
   pnpm dev
   # Visit http://localhost:3000/tools/my-tool
   ```

## Component Guidelines

### Using shadcn/ui Components

- Import from `@/components/ui/*`
- Components are pre-styled with Radix UI primitives
- Customize via className prop with Tailwind utilities
- Available components: Button, Card, Input, Textarea, Badge, Tooltip, Progress

### Creating New Components

- Place in appropriate directory (`components/ui/`, `components/layout/`, or `components/features/`)
- Export as named or default export
- Include TypeScript prop types
- Follow existing component patterns for consistency

## Commit Guidelines

Use **conventional commits** format:

```
<type>(<scope>): <subject>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(json-beautify): add syntax highlighting with CodeMirror
fix(upload): handle large file uploads correctly
docs(readme): update installation instructions
style(sidebar): adjust gradient colors
refactor(utils): simplify cn function
perf(json-beautify): optimize JSON parsing for large files
chore(deps): update Next.js to 16.0.1
```

## Pull Request Checklist

Before submitting a PR:

- [ ] Code is formatted (`pnpm format`)
- [ ] No linting errors (`pnpm lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Tested locally in development mode
- [ ] Production build succeeds (`pnpm build`)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Dark theme styling consistent with existing design
- [ ] No console errors or warnings
- [ ] Added JSDoc comments for complex functions
- [ ] Updated documentation if needed

## Common Patterns

### Toast Notifications

```tsx
import { toast } from 'sonner'

toast.success('Operation successful! ✅')
toast.error('Something went wrong ⚠️')
```

### Conditional Styling

```tsx
import { cn } from '@/lib/utils'
;<div
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    variant === 'primary' && 'primary-classes'
  )}
/>
```

### Client-Side State

```tsx
'use client'

import { useState, useMemo } from 'react'

export default function Component() {
  const [value, setValue] = useState('')

  const derived = useMemo(() => {
    // Expensive computation
    return computeValue(value)
  }, [value])

  return <div>{derived}</div>
}
```

## Design System

### Colors

- **Primary gradient**: Purple → Pink → Blue
- **Background**: Gray-950 → Gray-900 gradient
- **Accents**: Purple-500/Pink-500/Blue-500 with opacity
- **Glass effects**: `backdrop-blur-xl` with semi-transparent backgrounds

### Typography

- **Font**: Inter (Google Fonts)
- **Headers**: `font-extrabold` with gradient text
- **Body**: Default weight with `text-gray-*` shades

### Animation

- Use Tailwind's `animate-pulse` for subtle effects
- Framer Motion for complex animations
- Keep animations performant and subtle

## Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Need Help?

- 📖 Check `CONTRIBUTING.md` for detailed contribution guidelines
- 🎨 See `docs/CODE_FORMATTING.md` for formatting standards
- 🐛 [Open an issue](https://github.com/ferryhinardi/supertool/issues)
- 💬 Ask questions in pull request discussions

---

**Remember**: This project emphasizes beautiful UI, smooth interactions, and excellent developer experience. Maintain the high-quality aesthetic and user-focused design in all contributions. 🚀
