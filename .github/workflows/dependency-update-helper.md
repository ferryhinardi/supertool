---
# Trigger - when should this workflow run?
on:
  schedule: weekly on monday

# Permissions - what can this workflow access?
permissions:
  contents: read
  issues: write

# Outputs - what APIs and tools can the AI use?
safe-outputs:
  create-issue:
    max: 1

---

# Dependency Update Helper

Weekly check for outdated dependencies and create an issue with update recommendations.

## Instructions

1. **Check Package Status**:
   - Read `package.json` to get current dependencies
   - Check for outdated packages (major, minor, patch updates)
   - Focus on critical dependencies: Next.js, React, TypeScript, Vitest

2. **Categorize Updates**:
   - **Security Updates**: High priority (vulnerabilities)
   - **Major Updates**: Breaking changes (e.g., Next.js 15 → 16)
   - **Minor Updates**: New features, backward compatible
   - **Patch Updates**: Bug fixes, safe to apply

3. **Assess Impact**:
   - **High Risk**: Major version bumps of core frameworks (Next.js, React)
   - **Medium Risk**: Major versions of UI libraries, build tools
   - **Low Risk**: Patch updates, dev dependencies
   - Check CHANGELOG/release notes for breaking changes

4. **Create Weekly Update Issue**:
   - Title: `📦 Weekly Dependency Updates - [DATE]`
   - Body sections:
     - 🚨 **Security Updates** (if any)
     - 🔴 **High Priority** (major core updates)
     - 🟡 **Medium Priority** (minor/major non-core)
     - 🟢 **Low Priority** (patches, dev deps)
   - For each update, include:
     - Current version → New version
     - Brief description of changes
     - Breaking changes warning (if applicable)
     - Recommended action (e.g., "Test thoroughly", "Safe to update")

5. **Provide Update Commands**:
   ```bash
   # Safe patch updates
   pnpm update --latest --filter "patch"
   
   # Specific package update
   pnpm update package-name@latest
   
   # Test after updates
   pnpm lint && pnpm test run && pnpm build
   ```

6. **Reference Docs**:
   - Link to relevant migration guides
   - Reference project's `docs/reference/WARP.md` for testing procedures

## Context

**Current Tech Stack** (as of package.json):
- Next.js 16.0.0
- React 19.2.0
- TypeScript ^5
- Panda CSS ^1.4.3
- Vitest ^2.1.8
- Supabase ^2.76.1

**Update Priority**:
1. Security vulnerabilities (immediate)
2. Next.js, React (plan carefully)
3. Build tools, TypeScript (medium priority)
4. UI libraries, utilities (low risk)
5. Dev dependencies (lowest priority)

**Testing Checklist**:
```bash
# After any dependency update:
1. pnpm install
2. pnpm lint
3. pnpm exec tsc --noEmit
4. pnpm test run
5. pnpm build
6. Test critical features manually
```

**Breaking Change Keywords**:
- Look for: "BREAKING", "breaking change", "migration guide"
- Check: CHANGELOG.md, MIGRATION.md, release notes
