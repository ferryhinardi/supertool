# 🚀 Quick Start: Structure Migration

## Run Migration (3 Steps)

### 1️⃣ Dry Run First (See what will happen)
```bash
node scripts/migrate-structure.js --dry-run
```

### 2️⃣ Run with Backup (Recommended)
```bash
node scripts/migrate-structure.js --backup
```

### 3️⃣ Update Imports
```bash
node scripts/update-imports.js
pnpm lint
```

## Expected Changes

| Category | Files Moving | From → To |
|----------|--------------|-----------|
| **Tools** | 76 dirs | `app/tools/json-beautify` → `app/tools/data/json-beautify` |
| **Components** | 22 files | `components/features/RecentTools.tsx` → `components/features/tools/RecentTools.tsx` |
| **Lib** | 28 files | `lib/analytics.ts` → `lib/services/analytics.ts` |
| **Hooks** | 6 files | `hooks/useFavorites.ts` → `hooks/common/useFavorites.ts` |
| **Docs** | 10 files | `docs/ADS_INTEGRATION.md` → `docs/features/ADS_INTEGRATION.md` |

## New Folder Structure

```
app/tools/
  ├── data/          (8 tools)   - JSON, CSV, YAML
  ├── media/         (5 tools)   - Images, Videos
  ├── development/   (18 tools)  - API, Debug, CLI
  ├── security/      (8 tools)   - Passwords, Encryption
  ├── productivity/  (25 tools)  - QR, Markdown, Timers
  ├── finance/       (5 tools)   - Split Bill, Currency
  └── design/        (9 tools)   - Colors, Gradients
```

## Verification

```bash
# Check everything works
pnpm exec tsc --noEmit   # Type check
pnpm test                # Run tests
pnpm build               # Build project
pnpm dev                 # Start dev server
```

## Rollback

```bash
# Option 1: Git reset
git reset --hard HEAD~1

# Option 2: Restore backup
cp -r backup-*/* .
```

---

📖 **Full Guide**: See `MIGRATION_GUIDE.md` for detailed instructions
