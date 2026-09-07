import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

// Biome is the primary linter/formatter (see biome.json and `pnpm lint`).
// ESLint is kept for rules Biome does not cover: the React Hooks / React Compiler
// rules and the Next.js-specific rules.
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'styled-system/**',
      '.mcp/**',
      'panda.css',
      'scripts/**',
    ],
  },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      // Tool pages render user-generated blob/data URLs that next/image cannot optimize.
      '@next/next/no-img-element': 'off',
      // React Compiler diagnostics: components that trip these rules are skipped by the
      // compiler rather than broken, so they are reported as warnings to drive incremental
      // clean-up without failing the lint run.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // CommonJS is required by Next.js config helpers and by vi.mock hoisting in tests.
    files: ['next.config.ts', '**/__tests__/**', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
)
