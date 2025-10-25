# 🎨 Code Formatting Guide

This project uses **Prettier** for code formatting and **ESLint** for linting.

---

## 🚀 Quick Commands

### Format all files

```bash
pnpm format
```

### Check formatting without writing

```bash
pnpm format:check
```

### Run linter

```bash
pnpm lint
```

### Fix lint errors automatically

```bash
pnpm lint:fix
```

### Run both lint and format

```bash
pnpm lint:fix && pnpm format
```

---

## 📝 Prettier Configuration

Located in `.prettierrc`:

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Key Settings:

- ✅ **No semicolons** - Cleaner code
- ✅ **Single quotes** - Consistent string formatting
- ✅ **100 character line width** - Readable on most screens
- ✅ **2 spaces indentation** - Standard for JS/TS

---

## 🔍 ESLint Configuration

Located in `eslint.config.mjs`:

### Rules:

- `@typescript-eslint/no-explicit-any`: **warn** - Prefer proper types
- `@typescript-eslint/no-unused-vars`: **warn** - Allow `_` prefix for unused vars
- `react-hooks/exhaustive-deps`: **warn** - Hook dependency checks

---

## 💻 VS Code Integration

### Automatic Formatting

Install recommended extensions:

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
```

Or open VS Code and install from the extensions panel (recommended extensions will show up).

### Settings

The project includes `.vscode/settings.json` with:

- ✅ **Format on save** enabled
- ✅ **ESLint auto-fix** on save
- ✅ **Prettier as default formatter**

---

## 📋 Pre-commit Checks (Recommended)

To ensure code quality before committing, run:

```bash
pnpm lint && pnpm format:check
```

Or add to your git pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/sh
pnpm lint && pnpm format:check
```

---

## 🎯 Best Practices

### Do's ✅

- Run `pnpm format` before committing
- Fix all lint warnings (`pnpm lint:fix`)
- Use single quotes for strings
- Keep lines under 100 characters
- Use proper TypeScript types (avoid `any`)

### Don'ts ❌

- Don't commit with lint errors
- Don't disable Prettier formatting
- Don't use `any` type without a good reason
- Don't ignore ESLint warnings

---

## 🔧 Troubleshooting

### Prettier not working in VS Code?

1. Ensure Prettier extension is installed
2. Check VS Code settings: `"editor.defaultFormatter": "esbenp.prettier-vscode"`
3. Reload VS Code window

### ESLint errors?

```bash
# Clear ESLint cache
rm -rf .eslintcache

# Reinstall dependencies
pnpm install

# Run lint with fix
pnpm lint:fix
```

### Format specific files only

```bash
pnpm prettier --write "app/**/*.tsx"
```

---

## 📚 Resources

- [Prettier Documentation](https://prettier.io/docs/en/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Panda CSS Documentation](https://panda-css.com)

---

**Happy coding! ✨**
