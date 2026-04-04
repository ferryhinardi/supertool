# Repo Structure Cleanup

## TL;DR

> **Quick Summary**: Clean up the SuperTool repo by removing committed build artifacts, relocating misplaced files, fixing .gitignore, and eliminating root-level clutter — without breaking any imports or CI.
> 
> **Deliverables**:
> - Clean .gitignore with all generated/temp files properly ignored
> - Committed build artifacts removed from git tracking (`bin/ffmpeg`, `styled-system/`, `app/panda.css`)
> - Misplaced files relocated to proper directories (`SpeculationRules.tsx`, `TOOL_PAGE_TEMPLATE.tsx`, `types/`, `test-utils/`)
> - Root-level shell scripts consolidated into `scripts/`
> - All imports and references updated to match new locations
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (.gitignore) → Task 2 (bin/ffmpeg) → Tasks 3-9 (parallel moves) → Task 10 (final verification)

---

## Context

### Original Request
User asked to review and improve the entire folder structure of the SuperTool repo, remove unused folders, and move misplaced files.

### Interview Summary
**Key Discussions**:
- Thorough codebase analysis identified 10 specific anomalies
- Root `hooks/` has 31 importers — ACTIVELY USED, do NOT move
- `lib/hooks/` has 4 importers — copilot-specific, NO overlap with root hooks
- `__mocks__/` is used by Vitest implicitly — keep in place

**Research Findings**:
- `bin/ffmpeg` is unused — video-subtitle API downloads ffmpeg at runtime from GitHub, dev uses `ffmpeg-static` npm package
- `types/payment.ts` has zero code imports (only referenced in a docs planning file)
- `vaul` does NOT ship its own types — `types/vaul.d.ts` is the ONLY typing source, must be preserved
- `TOOL_PAGE_TEMPLATE.tsx` is referenced by `.agents/skills/new-tool-scaffolder/SKILL.md` (lines 15, 54) and 2 doc files — move must be atomic with reference updates
- Root shell scripts (`check-ci-locally.sh`, `commit-and-push.sh`, `run-test.sh`) are NOT referenced by CI or package.json — safe to move
- Docker docs in `.github/agents/devops-infrastructure-specialist.agent.md` reference `COPY --from=builder /app/bin/ffmpeg` — needs updating when bin/ is removed

### Metis Review
**Identified Gaps** (addressed):
- `vaul.d.ts` must be preserved (not deleted) — moved to `lib/types/`
- `TOOL_PAGE_TEMPLATE.tsx` move requires updating scaffolder skill file + 2 doc files
- `bin/ffmpeg` removal requires updating Docker references in agent docs
- `.gitignore` has a `!turbopack-backtrace.log` typo that un-ignores it

---

## Work Objectives

### Core Objective
Remove committed build artifacts, relocate misplaced files to proper directories, and fix .gitignore to prevent future clutter — all without breaking imports, builds, or CI.

### Concrete Deliverables
- Fixed `.gitignore` with all generated/temp files properly ignored
- `bin/` directory removed from git tracking
- `styled-system/` removed from git tracking (if still tracked despite gitignore)
- `types/` contents moved to `lib/types/`
- `test-utils/userEvent.ts` moved to adjacent test utility location
- `components/SpeculationRules.tsx` moved to `components/features/`
- `TOOL_PAGE_TEMPLATE.tsx` moved to `scripts/templates/` with all references updated
- Root shell scripts moved to `scripts/`
- Root temp/debug files cleaned up

### Definition of Done
- [ ] `pnpm exec tsc --noEmit` passes with zero errors
- [ ] `pnpm lint:check` passes with zero errors
- [ ] `pnpm build` succeeds
- [ ] No file references in code point to old locations
- [ ] `.gitignore` properly ignores all generated/temp files

### Must Have
- All import paths updated after every file move
- `vaul.d.ts` ambient declaration preserved (moved, not deleted)
- `TOOL_PAGE_TEMPLATE.tsx` references in scaffolder skill + docs updated
- Docker reference in agent docs updated after `bin/` removal
- Git tracking removed for build artifacts (not just gitignored)

### Must NOT Have (Guardrails)
- **G1**: Do NOT move root `hooks/` directory — 31 active importers
- **G2**: Do NOT move `lib/hooks/` — 4 active importers, no overlap with root hooks
- **G3**: Do NOT move or modify `__mocks__/` — Vitest implicit convention
- **G4**: Do NOT rewrite git history with `git filter-branch` or BFG — only `git rm --cached` for artifact removal
- **G5**: Do NOT modify any tool logic, component behavior, or business code — structure only
- **G6**: Do NOT rename any exported symbols — only move files and update import paths
- **G7**: Do NOT reorganize `app/`, `components/ui/`, `lib/`, `scripts/`, `supabase/`, `docs/` internal structure — out of scope
- **G8**: Do NOT add new dependencies or change package.json (except removing `bin/` from vercel.json includeFiles if present)
- **G9**: Each commit must be atomic — repo must build + typecheck after every single commit

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright browser mode)
- **Automated tests**: None for this task (structural changes only — no new logic to test)
- **Framework**: Vitest (existing)
- **Rationale**: This is a file-move + gitignore task. Verification is via typecheck, lint, and build — not unit tests.

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Typecheck**: `pnpm exec tsc --noEmit` — must pass after every task
- **Lint**: `pnpm lint:check` — must pass after every task
- **Build**: `pnpm build` — must pass after final verification
- **Import verification**: `grep -r "old/import/path"` — must return zero results

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — must complete first):
├── Task 1: Fix .gitignore (no dependencies) [quick]
├── Task 2: Remove bin/ffmpeg from git tracking + update refs [quick]
└── Task 3: Remove styled-system/ and app/panda.css from git tracking [quick]

Wave 2 (File Relocations — all independent after Wave 1):
├── Task 4: Move TOOL_PAGE_TEMPLATE.tsx + update 3 reference files [quick]
├── Task 5: Move components/SpeculationRules.tsx to components/features/ [quick]
├── Task 6: Move types/ contents to lib/types/ [quick]
├── Task 7: Move test-utils/userEvent.ts to steganography test dir [quick]
├── Task 8: Move root shell scripts to scripts/ [quick]
└── Task 9: Clean up root-level temp/debug files [quick]

Wave FINAL (After ALL tasks):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review — typecheck + lint + build (unspecified-high)
├── Task F3: Real manual QA — verify all moves, no broken refs (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 (.gitignore) | — | T2, T3 |
| T2 (bin/ffmpeg) | T1 | F1-F4 |
| T3 (styled-system) | T1 | F1-F4 |
| T4 (TOOL_PAGE_TEMPLATE) | — | F1-F4 |
| T5 (SpeculationRules) | — | F1-F4 |
| T6 (types/) | — | F1-F4 |
| T7 (test-utils/) | — | F1-F4 |
| T8 (shell scripts) | — | F1-F4 |
| T9 (temp files) | — | F1-F4 |
| F1-F4 | T1-T9 all | — |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks — T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: 6 tasks — T4-T9 → all `quick`
- **Wave FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

### Wave 1 — Foundation (complete before Wave 2)

- [x] 1. Fix .gitignore — clean up garbled entries, add missing ignores, fix turbopack typo

  **What to do**:
  - Remove garbled line 54 (`styled-system-studiostyled-system/`)
  - Fix line 18: remove `!turbopack-backtrace.log` (it un-ignores the file — remove the `!` prefix or delete the line)
  - Add missing entries: `bin/`, `app/panda.css`, `test-output.txt`, `firebase-debug.log`, `turbopack-backtrace.log`
  - Verify existing entries are correct (`/coverage`, `styled-system`, `*.log`, etc.)

  **Must NOT do**:
  - Do NOT remove any currently-valid gitignore entries
  - Do NOT modify any source files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file edit with clear instructions
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed — simple file edit, not git operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 2, 3 (they rely on updated .gitignore)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `.gitignore` — The file to edit. Line 18 has the `!turbopack-backtrace.log` typo. Line 54 has the garbled `styled-system-studiostyled-system/` entry.

  **WHY Each Reference Matters**:
  - The executor needs to read `.gitignore` and identify the specific lines to fix. Line numbers may shift — search for the content patterns.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Garbled entry removed
    Tool: Bash (grep)
    Preconditions: .gitignore has been edited
    Steps:
      1. Run: grep "styled-system-studio" .gitignore
      2. Assert: zero matches returned (exit code 1)
    Expected Result: No garbled entry exists in .gitignore
    Failure Indicators: grep returns a match
    Evidence: .sisyphus/evidence/task-1-garbled-removed.txt

  Scenario: Missing entries added
    Tool: Bash (grep)
    Preconditions: .gitignore has been edited
    Steps:
      1. Run: grep "^bin/" .gitignore — assert 1 match
      2. Run: grep "^app/panda.css" .gitignore — assert 1 match
      3. Run: grep "^test-output.txt" .gitignore — assert 1 match
      4. Run: grep "^firebase-debug.log" .gitignore — assert 1 match
    Expected Result: All 4 entries present in .gitignore
    Failure Indicators: Any grep returns zero matches
    Evidence: .sisyphus/evidence/task-1-entries-added.txt

  Scenario: Turbopack typo fixed
    Tool: Bash (grep)
    Preconditions: .gitignore has been edited
    Steps:
      1. Run: grep "^!turbopack" .gitignore
      2. Assert: zero matches (the un-ignore line is removed)
    Expected Result: No line un-ignoring turbopack-backtrace.log
    Failure Indicators: grep returns a match starting with !
    Evidence: .sisyphus/evidence/task-1-turbopack-fixed.txt

  Scenario: Typecheck still passes
    Tool: Bash
    Preconditions: .gitignore changes saved
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Zero type errors
    Failure Indicators: Non-zero exit code or error output
    Evidence: .sisyphus/evidence/task-1-typecheck.txt
  ```

  **Commit**: YES
  - Message: `chore: fix .gitignore entries and add missing ignores`
  - Files: `.gitignore`
  - Pre-commit: `pnpm exec tsc --noEmit`

- [x] 2. Remove bin/ffmpeg from git tracking and update references

  **What to do**:
  - Run `git rm -r bin/` to remove the entire bin directory from git tracking
  - The `.gitignore` (from Task 1) already adds `bin/` — so it won't be re-tracked
  - Update `.github/agents/devops-infrastructure-specialist.agent.md` — find the Docker `COPY --from=builder /app/bin/ffmpeg` line and update it to reflect that ffmpeg is no longer bundled (the API downloads it at runtime)
  - Check `vercel.json` for any `includeFiles` referencing `bin/` and remove if present

  **Must NOT do**:
  - Do NOT use `git filter-branch` or BFG to rewrite history (guardrail G4)
  - Do NOT modify the video-subtitle API route logic
  - Do NOT remove `ffmpeg-static` from package.json

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Git rm + 1-2 file edits with clear instructions
  - **Skills**: [`git-master`]
    - `git-master`: Needed for `git rm` operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3, after Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (.gitignore must have `bin/` entry first)

  **References**:

  **Pattern References**:
  - `.github/agents/devops-infrastructure-specialist.agent.md` — Contains Docker `COPY --from=builder /app/bin/ffmpeg` reference that needs updating
  - `app/api/video-subtitle/route.ts` — DO NOT MODIFY. This is the API route that downloads ffmpeg at runtime. Reference only to understand behavior.

  **API/Type References**:
  - `vercel.json` — Check for `includeFiles` array referencing `bin/`

  **WHY Each Reference Matters**:
  - The devops agent doc has a Docker example that copies `bin/ffmpeg` — this will be stale after removal
  - The API route shows the runtime download pattern — executor should NOT touch this file
  - `vercel.json` may have deployment config referencing `bin/`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: bin/ directory removed from git
    Tool: Bash
    Preconditions: git rm completed
    Steps:
      1. Run: git ls-files bin/
      2. Assert: empty output (no tracked files in bin/)
      3. Run: ls bin/ 2>&1
      4. Assert: "No such file or directory" or empty
    Expected Result: bin/ is no longer tracked by git
    Failure Indicators: git ls-files returns any output
    Evidence: .sisyphus/evidence/task-2-bin-removed.txt

  Scenario: Docker reference updated
    Tool: Bash (grep)
    Preconditions: agent doc updated
    Steps:
      1. Run: grep -n "bin/ffmpeg" .github/agents/devops-infrastructure-specialist.agent.md
      2. Assert: zero matches OR updated comment explaining ffmpeg is downloaded at runtime
    Expected Result: No stale Docker COPY reference to bin/ffmpeg
    Failure Indicators: Old COPY reference still present
    Evidence: .sisyphus/evidence/task-2-docker-ref-updated.txt

  Scenario: vercel.json clean
    Tool: Bash (grep)
    Preconditions: vercel.json checked
    Steps:
      1. Run: grep "bin" vercel.json (if file exists)
      2. Assert: zero matches for bin/ references
    Expected Result: No vercel.json references to bin/
    Failure Indicators: bin reference found in vercel.json
    Evidence: .sisyphus/evidence/task-2-vercel-clean.txt

  Scenario: Typecheck still passes
    Tool: Bash
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-2-typecheck.txt
  ```

  **Commit**: YES
  - Message: `chore: remove committed ffmpeg binary and update references`
  - Files: `bin/` (rm), `.github/agents/devops-infrastructure-specialist.agent.md`, `vercel.json` (if applicable)
  - Pre-commit: `pnpm exec tsc --noEmit`

- [x] 3. Remove styled-system/ and app/panda.css from git tracking

  **What to do**:
  - Run `git rm --cached -r styled-system/` to untrack (but keep local files — they are generated by Panda CSS)
  - Run `git rm --cached app/panda.css` to untrack
  - Verify `.gitignore` (from Task 1) already has `styled-system` and now has `app/panda.css`
  - The files stay on disk (needed for dev) but are no longer tracked

  **Must NOT do**:
  - Do NOT delete the local files — they are build artifacts needed at dev time
  - Do NOT use `git filter-branch` or BFG (guardrail G4)
  - Do NOT modify panda.config.ts or any CSS-related code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple git rm --cached operations
  - **Skills**: [`git-master`]
    - `git-master`: Needed for git rm --cached operations

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2, after Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (.gitignore must be fixed first)

  **References**:

  **Pattern References**:
  - `.gitignore` — Already has `styled-system` entry. Task 1 adds `app/panda.css`.
  - `panda.config.ts` — DO NOT MODIFY. Reference only to confirm styled-system is generated output.

  **WHY Each Reference Matters**:
  - Executor must verify .gitignore is correct before untracking, otherwise files get re-added on next commit

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: styled-system/ untracked
    Tool: Bash
    Preconditions: git rm --cached completed
    Steps:
      1. Run: git ls-files styled-system/
      2. Assert: empty output (zero tracked files)
      3. Run: ls styled-system/ (verify local files still exist)
      4. Assert: files listed (not deleted locally)
    Expected Result: styled-system/ exists locally but is not tracked by git
    Failure Indicators: git ls-files returns output OR local files are missing
    Evidence: .sisyphus/evidence/task-3-styled-system-untracked.txt

  Scenario: app/panda.css untracked
    Tool: Bash
    Preconditions: git rm --cached completed
    Steps:
      1. Run: git ls-files app/panda.css
      2. Assert: empty output
      3. Run: ls app/panda.css (verify still exists locally)
    Expected Result: app/panda.css exists locally but is not tracked
    Failure Indicators: git ls-files returns output
    Evidence: .sisyphus/evidence/task-3-panda-css-untracked.txt

  Scenario: Typecheck still passes
    Tool: Bash
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-3-typecheck.txt
  ```

  **Commit**: YES
  - Message: `chore: remove tracked build artifacts (styled-system, panda.css)`
  - Files: `styled-system/` (rm --cached), `app/panda.css` (rm --cached)
  - Pre-commit: `pnpm exec tsc --noEmit`

### Wave 2 — File Relocations (all independent, after Wave 1)

- [x] 4. Move TOOL_PAGE_TEMPLATE.tsx to scripts/templates/ and update all references

  **What to do**:
  - Create `scripts/templates/` directory if it doesn't exist
  - Move `TOOL_PAGE_TEMPLATE.tsx` from repo root to `scripts/templates/TOOL_PAGE_TEMPLATE.tsx`
  - Update `.agents/skills/new-tool-scaffolder/SKILL.md` — lines 15 and 54 reference the template at repo root. Update paths to `scripts/templates/TOOL_PAGE_TEMPLATE.tsx`
  - Update `docs/IMPLEMENTATION_SUMMARY.md` — update any references to the template location
  - Update `docs/IMPLEMENTATION_ACTION_PLAN.md` — update any references to the template location
  - Search for any other references: `grep -r "TOOL_PAGE_TEMPLATE" --include="*.md" --include="*.ts" --include="*.tsx" .`

  **Must NOT do**:
  - Do NOT modify the template file content — only move it
  - Do NOT modify the scaffolder skill logic — only update the file path references

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File move + path updates in 3-4 files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5-9)
  - **Blocks**: F1-F4
  - **Blocked By**: None (independent of Wave 1)

  **References**:

  **Pattern References**:
  - `TOOL_PAGE_TEMPLATE.tsx` (repo root) — The file being moved
  - `.agents/skills/new-tool-scaffolder/SKILL.md:15,54` — References the template path. MUST be updated.
  - `docs/IMPLEMENTATION_SUMMARY.md` — References the template. Update path.
  - `docs/IMPLEMENTATION_ACTION_PLAN.md` — References the template. Update path.

  **WHY Each Reference Matters**:
  - The scaffolder skill DEPENDS on this path — if not updated, tool scaffolding will break
  - Doc files should reflect actual locations for accuracy

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Template file moved to new location
    Tool: Bash
    Steps:
      1. Run: ls scripts/templates/TOOL_PAGE_TEMPLATE.tsx
      2. Assert: file exists (exit code 0)
      3. Run: ls TOOL_PAGE_TEMPLATE.tsx 2>&1
      4. Assert: "No such file or directory"
    Expected Result: File exists at new location, gone from old
    Failure Indicators: File missing at new location or still at old
    Evidence: .sisyphus/evidence/task-4-template-moved.txt

  Scenario: All references updated
    Tool: Bash (grep)
    Steps:
      1. Run: grep -rn "TOOL_PAGE_TEMPLATE" .agents/ docs/ --include="*.md"
      2. Assert: all matches reference "scripts/templates/TOOL_PAGE_TEMPLATE.tsx" (not root)
      3. Run: grep -rn "TOOL_PAGE_TEMPLATE" . --include="*.md" --include="*.ts" | grep -v "scripts/templates" | grep -v ".sisyphus" | grep -v "node_modules"
      4. Assert: zero matches (no stale references)
    Expected Result: All references point to new location
    Failure Indicators: Any reference still points to repo root
    Evidence: .sisyphus/evidence/task-4-refs-updated.txt

  Scenario: Typecheck still passes
    Tool: Bash
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-4-typecheck.txt
  ```

  **Commit**: YES
  - Message: `refactor: move TOOL_PAGE_TEMPLATE.tsx to scripts/templates/`
  - Files: `TOOL_PAGE_TEMPLATE.tsx` (rm), `scripts/templates/TOOL_PAGE_TEMPLATE.tsx` (new), `.agents/skills/new-tool-scaffolder/SKILL.md`, `docs/IMPLEMENTATION_SUMMARY.md`, `docs/IMPLEMENTATION_ACTION_PLAN.md`
  - Pre-commit: `pnpm exec tsc --noEmit`

- [x] 5. Move SpeculationRules.tsx to components/features/

  **What to do**:
  - Move `components/SpeculationRules.tsx` to `components/features/SpeculationRules.tsx`
  - Find all importers: `grep -rn "SpeculationRules" --include="*.ts" --include="*.tsx" .`
  - Update import paths from `@/components/SpeculationRules` to `@/components/features/SpeculationRules`

  **Must NOT do**:
  - Do NOT modify the component logic or exports
  - Do NOT rename the component

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file move + import path updates
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6-9)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/SpeculationRules.tsx` — The file being moved
  - `components/features/` — Target directory (already exists with other feature components)

  **WHY Each Reference Matters**:
  - Executor must find ALL importers before moving to ensure zero broken imports after

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: File moved to features/
    Tool: Bash
    Steps:
      1. Run: ls components/features/SpeculationRules.tsx
      2. Assert: file exists
      3. Run: ls components/SpeculationRules.tsx 2>&1
      4. Assert: "No such file or directory"
    Expected Result: File at new location, gone from old
    Failure Indicators: File missing or still at old location
    Evidence: .sisyphus/evidence/task-5-speculation-moved.txt

  Scenario: No broken imports
    Tool: Bash (grep)
    Steps:
      1. Run: grep -rn "@/components/SpeculationRules" --include="*.ts" --include="*.tsx" . | grep -v "features/SpeculationRules"
      2. Assert: zero matches (no old import paths)
    Expected Result: All imports point to components/features/SpeculationRules
    Failure Indicators: Any import still references old path
    Evidence: .sisyphus/evidence/task-5-imports-clean.txt

  Scenario: Typecheck passes
    Tool: Bash
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-5-typecheck.txt
  ```

  **Commit**: YES
  - Message: `refactor: move SpeculationRules.tsx to components/features/`
  - Files: `components/SpeculationRules.tsx` (rm), `components/features/SpeculationRules.tsx` (new), updated importers
  - Pre-commit: `pnpm exec tsc --noEmit`

- [x] 6. Move types/ contents to lib/types/

  **What to do**:
  - Create `lib/types/` directory if it doesn't exist
  - Move `types/payment.ts` to `lib/types/payment.ts`
  - Move `types/vaul.d.ts` to `lib/types/vaul.d.ts` — this is an ambient type declaration, MUST be preserved
  - Check `tsconfig.json` — verify that `lib/types/vaul.d.ts` will still be picked up by TypeScript (ambient declarations need to be in the include path)
  - If `tsconfig.json` has an explicit `typeRoots` or `include` that references `types/`, update to also include `lib/types/`
  - Search for any references: `grep -rn "types/payment" --include="*.ts" --include="*.tsx" --include="*.md" .` and update
  - The only known reference is `docs/PAYMENT_GATEWAY_INTEGRATION_PLAN.md` — update if it has an import path
  - Remove the empty `types/` directory after moving

  **Must NOT do**:
  - Do NOT delete `vaul.d.ts` — it is the ONLY source of vaul types (vaul package has no shipped types)
  - Do NOT modify the contents of either file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2 file moves + potential tsconfig update
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7-9)
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `types/payment.ts` — Payment types file to move
  - `types/vaul.d.ts` — Ambient type declaration for vaul drawer library. CRITICAL: must remain discoverable by TypeScript.
  - `tsconfig.json` — Check `include`, `typeRoots`, `paths` for any `types/` references

  **WHY Each Reference Matters**:
  - `vaul.d.ts` is an ambient declaration — if TypeScript can't find it, vaul usage will have type errors
  - `tsconfig.json` may need updating to include the new `lib/types/` path

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Files moved to lib/types/
    Tool: Bash
    Steps:
      1. Run: ls lib/types/payment.ts lib/types/vaul.d.ts
      2. Assert: both files exist
      3. Run: ls types/ 2>&1
      4. Assert: "No such file or directory" (directory removed)
    Expected Result: Files at new location, old directory removed
    Failure Indicators: Files missing at new location or old dir still exists
    Evidence: .sisyphus/evidence/task-6-types-moved.txt

  Scenario: vaul types still work
    Tool: Bash
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0 (vaul ambient types are picked up)
    Expected Result: Zero type errors — vaul.d.ts is discoverable
    Failure Indicators: Type errors related to vaul module
    Evidence: .sisyphus/evidence/task-6-vaul-types-work.txt

  Scenario: No stale references
    Tool: Bash (grep)
    Steps:
      1. Run: grep -rn "from.*['\"]@/types/" --include="*.ts" --include="*.tsx" .
      2. Assert: zero matches
      3. Run: grep -rn "from.*['\"].*types/payment" --include="*.ts" --include="*.tsx" .
      4. Assert: zero matches OR all point to @/lib/types/
    Expected Result: No imports reference old types/ path
    Evidence: .sisyphus/evidence/task-6-refs-clean.txt
  ```

  **Commit**: YES
  - Message: `refactor: move types/ to lib/types/`
  - Files: `types/payment.ts` → `lib/types/payment.ts`, `types/vaul.d.ts` → `lib/types/vaul.d.ts`, `tsconfig.json` (if needed), `docs/PAYMENT_GATEWAY_INTEGRATION_PLAN.md` (if references)
  - Pre-commit: `pnpm exec tsc --noEmit`

- [x] 7. Consolidate test-utils/userEvent.ts

  **What to do**:
  - Find the exact importer: `grep -rn "test-utils/userEvent" --include="*.ts" --include="*.tsx" .`
  - The known consumer is a steganography test file
  - Move `test-utils/userEvent.ts` to be adjacent to its consumer — place it in the same `__tests__/` directory as the steganography test, or in the steganography tool's test utilities
  - Update the import path in the consumer
  - Remove the empty `test-utils/` directory

  **Must NOT do**:
  - Do NOT modify the userEvent utility logic
  - Do NOT modify `__mocks__/` directory

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file move + 1 import update
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `test-utils/userEvent.ts` — The file being moved
  - Search for consumer: `grep -rn "test-utils" --include="*.ts" --include="*.tsx" .` — Find the exact import to update

  **WHY Each Reference Matters**:
  - Executor must find the exact consumer file path to determine the best adjacent location for the utility

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: test-utils/ directory removed
    Tool: Bash
    Steps:
      1. Run: ls test-utils/ 2>&1
      2. Assert: "No such file or directory"
    Expected Result: test-utils/ directory no longer exists
    Failure Indicators: Directory still exists
    Evidence: .sisyphus/evidence/task-7-testutils-removed.txt

  Scenario: Import updated and working
    Tool: Bash (grep)
    Steps:
      1. Run: grep -rn "test-utils/userEvent" --include="*.ts" --include="*.tsx" .
      2. Assert: zero matches (old import path gone)
    Expected Result: No references to old test-utils/ path
    Failure Indicators: grep returns matches
    Evidence: .sisyphus/evidence/task-7-import-clean.txt

  Scenario: Typecheck passes
    Tool: Bash
    Steps:
      1. Run: pnpm exec tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-7-typecheck.txt
  ```

  **Commit**: YES
  - Message: `refactor: consolidate test-utils into steganography test dir`
  - Files: `test-utils/userEvent.ts` (rm), new location, updated importer
  - Pre-commit: `pnpm exec tsc --noEmit`

- [x] 8. Move root shell scripts to scripts/

  **What to do**:
  - Move `check-ci-locally.sh` to `scripts/check-ci-locally.sh`
  - Move `commit-and-push.sh` to `scripts/commit-and-push.sh`
  - Move `run-test.sh` to `scripts/run-test.sh`
  - Preserve executable permissions: `chmod +x scripts/*.sh` after move
  - Verify no CI or package.json references (already confirmed: none exist)

  **Must NOT do**:
  - Do NOT modify the script contents
  - Do NOT modify `scripts/` existing files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file moves, no code changes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `check-ci-locally.sh`, `commit-and-push.sh`, `run-test.sh` — Files at repo root to move
  - `scripts/` — Target directory (already exists with other scripts)

  **WHY Each Reference Matters**:
  - Executor needs to verify scripts/ exists and move files there with preserved permissions

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Scripts moved and executable
    Tool: Bash
    Steps:
      1. Run: ls -la scripts/check-ci-locally.sh scripts/commit-and-push.sh scripts/run-test.sh
      2. Assert: all 3 files exist with executable bit set
      3. Run: ls check-ci-locally.sh commit-and-push.sh run-test.sh 2>&1
      4. Assert: "No such file or directory" for each
    Expected Result: Scripts at new location, gone from root, still executable
    Failure Indicators: Files missing or not executable
    Evidence: .sisyphus/evidence/task-8-scripts-moved.txt

  Scenario: No CI references broken
    Tool: Bash (grep)
    Steps:
      1. Run: grep -rn "check-ci-locally\|commit-and-push\|run-test" .github/ package.json 2>/dev/null
      2. Assert: zero matches (already verified, but double-check)
    Expected Result: No CI or package.json references to these scripts
    Evidence: .sisyphus/evidence/task-8-no-ci-refs.txt
  ```

  **Commit**: YES
  - Message: `chore: move root shell scripts to scripts/`
  - Files: `check-ci-locally.sh` → `scripts/`, `commit-and-push.sh` → `scripts/`, `run-test.sh` → `scripts/`
  - Pre-commit: N/A (no code change)

- [x] 9. Clean up root-level temp/debug files

  **What to do**:
  - Remove `test-output.txt` from git tracking (if tracked): `git rm test-output.txt` or just delete
  - Remove `firebase-debug.log` from git tracking (if tracked): `git rm firebase-debug.log` or just delete
  - These are already gitignored by Task 1 entries, so they won't be re-added
  - Check for `turbopack-backtrace.log` — remove if present (Task 1 fixed the gitignore entry that was un-ignoring it)
  - Verify: `git status` should show these as deleted (staged for removal)

  **Must NOT do**:
  - Do NOT remove any other root-level files (like `panda.config.ts`, `next.config.ts`, etc.)
  - Do NOT modify .gitignore (already handled in Task 1)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple file deletions
  - **Skills**: [`git-master`]
    - `git-master`: Needed for git rm operations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1 (.gitignore entries must be in place)

  **References**:

  **Pattern References**:
  - Root directory — check for `test-output.txt`, `firebase-debug.log`, `turbopack-backtrace.log`

  **WHY Each Reference Matters**:
  - Executor must check which files exist and are tracked before attempting removal

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Temp files removed
    Tool: Bash
    Steps:
      1. Run: ls test-output.txt firebase-debug.log turbopack-backtrace.log 2>&1
      2. Assert: "No such file or directory" for each (or they exist but are gitignored)
      3. Run: git ls-files test-output.txt firebase-debug.log turbopack-backtrace.log
      4. Assert: empty output (not tracked)
    Expected Result: Temp/debug files not tracked by git
    Failure Indicators: git ls-files returns any output
    Evidence: .sisyphus/evidence/task-9-temp-files-clean.txt

  Scenario: No unintended deletions
    Tool: Bash
    Steps:
      1. Run: ls panda.config.ts next.config.ts package.json tsconfig.json
      2. Assert: all still exist (exit code 0)
    Expected Result: Important root files untouched
    Failure Indicators: Any critical root file missing
    Evidence: .sisyphus/evidence/task-9-no-collateral.txt
  ```

  **Commit**: YES
  - Message: `chore: remove root-level temp/debug files`
  - Files: `test-output.txt` (rm), `firebase-debug.log` (rm), `turbopack-backtrace.log` (rm if exists)
  - Pre-commit: N/A

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check git status). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm exec tsc --noEmit` + `pnpm lint:check` + `pnpm build`. Check that no old import paths remain. Verify .gitignore changes are correct.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Typecheck [PASS/FAIL] | Old paths [0/N found] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Verify every moved file exists at new location. Verify every old location is empty/removed. Run `pnpm dev` and confirm app starts. Check that `git status` shows no untracked generated files.
  Output: `Moves [N/N verified] | Old paths [N/N clean] | Dev server [PASS/FAIL] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check guardrails G1-G9 compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Guardrails [N/N respected] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| # | Message | Files | Pre-commit check |
|---|---------|-------|-------------------|
| 1 | `chore: fix .gitignore entries and add missing ignores` | `.gitignore` | `pnpm exec tsc --noEmit` |
| 2 | `chore: remove committed ffmpeg binary and update references` | `bin/ffmpeg` (rm), `.github/agents/devops-infrastructure-specialist.agent.md`, `vercel.json` (if applicable) | `pnpm exec tsc --noEmit` |
| 3 | `chore: remove tracked build artifacts (styled-system, panda.css)` | `styled-system/` (rm --cached), `app/panda.css` (rm --cached) | `pnpm exec tsc --noEmit` |
| 4 | `refactor: move TOOL_PAGE_TEMPLATE.tsx to scripts/templates/` | `TOOL_PAGE_TEMPLATE.tsx` → `scripts/templates/`, `.agents/skills/new-tool-scaffolder/SKILL.md`, `docs/IMPLEMENTATION_SUMMARY.md`, `docs/IMPLEMENTATION_ACTION_PLAN.md` | `pnpm exec tsc --noEmit` |
| 5 | `refactor: move SpeculationRules.tsx to components/features/` | `components/SpeculationRules.tsx` → `components/features/`, update importers | `pnpm exec tsc --noEmit` |
| 6 | `refactor: move types/ to lib/types/` | `types/payment.ts` → `lib/types/`, `types/vaul.d.ts` → `lib/types/`, update tsconfig if needed | `pnpm exec tsc --noEmit` |
| 7 | `refactor: consolidate test-utils into steganography test dir` | `test-utils/userEvent.ts` → new location, update importer | `pnpm exec tsc --noEmit` |
| 8 | `chore: move root shell scripts to scripts/` | `check-ci-locally.sh`, `commit-and-push.sh`, `run-test.sh` → `scripts/` | N/A (no code change) |
| 9 | `chore: remove root-level temp/debug files` | `test-output.txt`, `firebase-debug.log` (rm or gitignore) | N/A |

---

## Success Criteria

### Verification Commands
```bash
pnpm exec tsc --noEmit           # Expected: no errors
pnpm lint:check                   # Expected: no errors
pnpm build                        # Expected: successful build
grep -r "from.*@/types/" --include="*.ts" --include="*.tsx" .  # Expected: 0 results (old path)
grep -r "bin/ffmpeg" --include="*.ts" --include="*.tsx" .       # Expected: 0 results in source
ls bin/                            # Expected: directory not found
ls types/                          # Expected: directory not found
ls test-utils/                     # Expected: directory not found
git status                         # Expected: no untracked generated files
```

### Final Checklist
- [x] All "Must Have" items present
- [x] All "Must NOT Have" guardrails respected
- [x] All 9 commits made atomically (build passes after each)
- [x] No broken imports anywhere
- [x] .gitignore properly configured
