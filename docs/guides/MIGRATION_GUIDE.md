# 🚀 SuperTool Structure Migration Guide

This guide helps you reorganize the SuperTool repository structure for better maintainability and scalability.

## 📊 Overview

The migration reorganizes **77 tools**, components, utilities, and documentation into a clear, category-based structure.

### Before Migration:
```
app/tools/
  ├── json-beautify/
  ├── split-bill/
  ├── qr-code/
  └── ... (77 tools in flat structure)
```

### After Migration:
```
app/tools/
  ├── data/         (JSON, CSV, YAML tools)
  ├── media/        (Image, Video tools)
  ├── development/  (API, Debugging tools)
  ├── security/     (Encryption, Password tools)
  ├── productivity/ (QR, Markdown, Pomodoro tools)
  ├── finance/      (Split bill, Currency tools)
  └── design/       (Color, Gradient tools)
```

## 🎯 Migration Steps

### Step 1: Dry Run (Test without making changes)

```bash
# See what will be changed without modifying files
node scripts/migrate-structure.js --dry-run
```

### Step 2: Create Backup (Recommended)

```bash
# Create backup before migration
node scripts/migrate-structure.js --backup
```

This creates `backup-YYYY-MM-DD-HH-MM-SS/` with copies of:
- `app/tools`
- `components/features`
- `lib`
- `hooks`
- `docs`

### Step 3: Run Migration

```bash
# Run the actual migration
node scripts/migrate-structure.js
```

The script will:
- ✅ Move 77 tools into category folders
- ✅ Reorganize components by feature domain
- ✅ Restructure lib utilities
- ✅ Organize hooks into common/tools
- ✅ Categorize documentation

### Step 4: Update Import Paths

```bash
# Update all import statements across the codebase
node scripts/update-imports.js
```

This scans all `.ts`, `.tsx`, `.js`, `.jsx` files and updates import paths to match the new structure.

### Step 5: Format and Lint

```bash
# Format code with Biome
pnpm lint

# Check TypeScript types
pnpm exec tsc --noEmit
```

### Step 6: Test Everything

```bash
# Run tests
pnpm test

# Build the application
pnpm build

# Start dev server to verify
pnpm dev
```

## 📁 New Structure Details

### Tools by Category

| Category | Count | Examples |
|----------|-------|----------|
| **Data** | 8 | JSON Beautifier, CSV Converter, UUID Generator |
| **Media** | 5 | Image Optimizer, Video Converter, Photo Editor |
| **Development** | 18 | API Tester, Diff Viewer, JWT Debugger |
| **Security** | 8 | Password Generator, Encryption, Hash Generator |
| **Productivity** | 25 | Markdown Editor, QR Code, Pomodoro Timer |
| **Finance** | 5 | Split Bill, Currency Converter, Tip Calculator |
| **Design** | 9 | Color Picker, Gradient Generator, SVG Optimizer |

### Components Organization

```
components/features/
  ├── tools/         # Tool-specific UI components
  ├── ads/           # Advertisement components
  ├── media/         # Media processing components
  ├── currency/      # Currency-related components
  └── shared/        # Shared feature components
```

### Lib Utilities Organization

```
lib/
  ├── auth/          # Authentication utilities
  ├── media/         # Media processing (FFmpeg, compression)
  ├── tools/         # Tool-specific utilities
  │   ├── qr/        # QR code services
  │   ├── split-bill/ # Split bill calculator
  │   ├── currency/  # Currency conversion
  │   └── stopwatch/ # Timer utilities
  ├── services/      # Core services (analytics, ratings)
  ├── data/          # Data management (tool definitions)
  └── utils/         # General utilities
```

### Documentation Organization

```
docs/
  ├── setup/         # Setup guides (Auth, CI/CD, Domain)
  ├── architecture/  # Architecture docs
  ├── features/      # Feature-specific docs
  └── tools/         # Tool-specific docs (by category)
```

## 🔄 Rollback Instructions

If something goes wrong:

### Option 1: Git Reset (if committed)
```bash
git reset --hard HEAD~1
```

### Option 2: Restore from Backup
```bash
# If you used --backup flag
cp -r backup-YYYY-MM-DD-HH-MM-SS/* .
```

### Option 3: Manual Revert
```bash
# Undo git moves
git reset HEAD
git checkout .
```

## 🐛 Troubleshooting

### Import Errors After Migration

**Problem**: `Module not found: Can't resolve '@/lib/tools'`

**Solution**:
```bash
# Re-run import update script
node scripts/update-imports.js

# Check if path alias is correct in tsconfig.json
cat tsconfig.json | grep "@/"
```

### Build Errors

**Problem**: TypeScript errors after migration

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild
pnpm build
```

### Git Conflicts

**Problem**: Git merge conflicts during migration

**Solution**:
```bash
# Stash current changes
git stash

# Complete migration
git checkout main
git pull origin main

# Apply migration
node scripts/migrate-structure.js
```

## 📝 Manual Tasks After Migration

### 1. Update Tool Routes (Optional)

If you want category-based URLs (e.g., `/tools/data/json-beautify`):

1. Update `lib/data/tools.ts` to include category in `href`
2. Update Next.js routing in `app/tools/[category]/[tool]/page.tsx`
3. Update internal links and navigation

### 2. Update Documentation

- [ ] Update README.md with new structure
- [ ] Update CONTRIBUTING.md with new paths
- [ ] Update any hardcoded paths in docs

### 3. Update Tests

- [ ] Update test import paths
- [ ] Verify all tests pass
- [ ] Update test documentation

### 4. Update CI/CD

- [ ] Verify GitHub Actions workflows
- [ ] Update deployment scripts if needed
- [ ] Check Vercel build settings

## ✅ Verification Checklist

After migration, verify:

- [ ] All tools load correctly in browser
- [ ] Navigation works properly
- [ ] Search functionality works
- [ ] Favorites/recent tools work
- [ ] Tests pass: `pnpm test`
- [ ] TypeScript compiles: `pnpm exec tsc --noEmit`
- [ ] Build succeeds: `pnpm build`
- [ ] Dev server runs: `pnpm dev`
- [ ] No console errors in browser
- [ ] Analytics tracking works
- [ ] Authentication flow works

## 🎉 Post-Migration Benefits

✅ **Better Organization**: Tools grouped by category
✅ **Easier Navigation**: Clear folder structure
✅ **Faster Development**: Find files quickly
✅ **Better Scalability**: Add new tools easily
✅ **Cleaner Imports**: Semantic import paths
✅ **Improved Maintenance**: Related code together

## 📞 Need Help?

- Check GitHub Issues: `https://github.com/yourrepo/issues`
- Review migration logs: Check console output
- Restore backup: Use backup folder created with `--backup`

---

**Last Updated**: December 2024
**Script Version**: 1.0.0
