# GitHub Copilot CLI Integration for SuperTool

This guide covers how to use GitHub Copilot CLI to accelerate SuperTool development.

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [SuperTool Aliases](#supertool-aliases)
- [Common Workflows](#common-workflows)
- [MCP Server Configuration](#mcp-server-configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- Node.js 18+ installed
- Active GitHub Copilot subscription (Individual, Business, or Enterprise)
- GitHub account authenticated

### Install Copilot CLI

```bash
# Install globally via npm
npm install -g @github/copilot

# Verify installation
copilot --version
```

### Load SuperTool Aliases

Add the following to your shell configuration file (`~/.zshrc` or `~/.bashrc`):

```bash
# Load SuperTool Copilot CLI aliases
source /path/to/supertool/scripts/copilot-aliases.sh
```

Then reload your shell:

```bash
source ~/.zshrc  # or ~/.bashrc
```

---

## Authentication

### Initial Setup

```bash
# Authenticate with GitHub
copilot auth

# This will open a browser window to complete GitHub OAuth
# Follow the prompts to authorize Copilot CLI
```

### Verify Authentication

```bash
# Check auth status
copilot auth status

# Re-authenticate if needed
copilot auth refresh
```

---

## SuperTool Aliases

After loading `scripts/copilot-aliases.sh`, you have access to these commands:

### Basic Commands

| Alias | Description |
|-------|-------------|
| `cop` | Start interactive Copilot session |
| `copg` | Prompt mode with git tool access |
| `copf` | Prompt mode with pnpm tool access |
| `copa` | Prompt mode with all tools (use carefully) |

### Development Workflows

| Alias | Description |
|-------|-------------|
| `cop-lint` | Run linting and auto-fix issues |
| `cop-typecheck` | Run TypeScript type checking |
| `cop-format` | Format codebase with Biome |
| `cop-test` | Run test suite |
| `cop-test-file` | Run tests for a specific file |
| `cop-coverage` | Run tests with coverage report |
| `cop-build` | Build the project |
| `cop-dev` | Start development server |
| `cop-ci` | Full CI check (lint + typecheck + test + build) |

### Code Generation

| Alias | Description |
|-------|-------------|
| `cop-new-tool` | Create a new tool page with proper patterns |
| `cop-new-component` | Create a new UI component |
| `cop-gen-tests` | Generate tests for a file (95% coverage target) |
| `cop-add-analytics` | Add analytics tracking to a component |

### Git Workflows

| Alias | Description |
|-------|-------------|
| `cop-commit` | Generate conventional commit message |
| `cop-pr` | Create PR description from branch diff |
| `cop-review` | Review uncommitted changes |
| `cop-log` | Explain recent commits |

### Debugging & Documentation

| Alias | Description |
|-------|-------------|
| `cop-explain` | Explain how code works |
| `cop-debug` | Help debug an error |
| `cop-find` | Find code in the project |
| `cop-arch` | Explain project architecture |
| `cop-docs` | Generate documentation |
| `cop-changelog` | Write changelog entry |

### Helper Functions

```bash
# Quick prompt
copp "explain how the unit converter works"

# Prompt with git access
coppg "show me what changed in the last commit"

# Prompt with pnpm access
coppf "run the tests for image-optimizer"

# Full tool access (use carefully!)
coppa "refactor this component and run tests"
```

### Show All Aliases

```bash
cop-help
```

---

## Common Workflows

### 1. Creating a New Tool

```bash
# Start the guided workflow
cop-new-tool

# Copilot will ask for:
# - Tool name
# - Category
# - Core functionality
# Then generate the page with proper patterns
```

### 2. Before Committing

```bash
# Review your changes
cop-review

# Run full CI checks locally
cop-ci

# Generate commit message
cop-commit
```

### 3. Writing Tests

```bash
# Generate tests for a specific file
cop-gen-tests

# Then specify the file path when prompted
# Copilot targets 95% coverage using our Vitest patterns
```

### 4. Debugging

```bash
# Start debug session
cop-debug

# Then paste the error message
# Copilot will analyze with project context
```

### 5. Code Exploration

```bash
# Understand a specific file
cop-explain
# Then provide the file path

# Understand overall architecture
cop-arch
```

---

## MCP Server Configuration

SuperTool uses Model Context Protocol (MCP) servers to enhance Copilot capabilities.

### Current Configuration

Located at `.mcp/mcp.json`:

| Server | Status | Purpose |
|--------|--------|---------|
| `github` | Enabled | GitHub API access |
| `ark-ui` | Enabled | Ark UI component patterns |
| `filesystem` | Enabled | File operations |
| `git` | Enabled | Git operations |
| `fetch` | Enabled | HTTP requests |
| `memory` | Enabled | Persistent context |
| `sequential-thinking` | Enabled | Complex reasoning |
| `brave-search` | Enabled | Web search |
| `postgres` | Disabled | Database access |
| `puppeteer` | Disabled | Browser automation |
| `slack` | Disabled | Slack integration |

### Enabling Additional Servers

Edit `.mcp/mcp.json` and set `"disabled": false` for the server you want to enable.

For `brave-search`, you need a Brave Search API key:

```bash
# Add to your shell config or .env.local
export BRAVE_API_KEY="your-api-key-here"
```

---

## CI/CD Integration

SuperTool includes an AI-powered PR review workflow (`.github/workflows/copilot-review.yml`) that automatically analyzes pull requests.

### Workflow Overview

The `copilot-review.yml` workflow runs on:
- Pull requests (opened, synchronized, reopened)
- Push to `main` branch
- Manual dispatch via GitHub Actions UI

### The 4 Jobs

#### 1. Commit Validation (`commit-validation`)

Validates that all commits follow [Conventional Commits](https://www.conventionalcommits.org/) format.

**What it checks:**
- Commit message format: `type(scope): description`
- Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Example valid commits:**
```
feat(tools): add new unit converter
fix(json-beautifier): handle empty input
docs: update README with new features
```

#### 2. Security Analysis (`security-scan`)

Comprehensive security scanning of dependencies and code changes.

**What it checks:**
- Dependency vulnerabilities via `pnpm audit`
- Potential secrets in code (API keys, passwords, tokens)
- Security anti-patterns:
  - `eval()` usage (code injection risk)
  - `dangerouslySetInnerHTML` (XSS risk)
  - `innerHTML` assignments (XSS risk)
  - SQL string concatenation (injection risk)

**Severity levels:**
- **Critical/High vulnerabilities:** Blocks merge
- **Secrets detected:** Warning requiring review
- **Anti-patterns:** Warning with file locations

#### 3. AI Code Analysis (`ai-review`)

The main code review job that analyzes your changes.

**What it checks:**
- **Lint errors** - Runs `pnpm lint`
- **Type errors** - Runs `pnpm exec tsc --noEmit`
- **Changed files** - Categorizes by type (components, pages, tests, configs)
- **Code quality metrics:**
  - TODO/FIXME comments
  - Console statements
  - TypeScript `any` usage
  - ESLint disable comments

**AI-powered suggestions for:**
- Missing error handling in async functions
- Missing loading states
- Hardcoded URLs/values
- Missing accessibility attributes
- Large component files
- Missing test coverage

#### 4. AI Fix Suggestions (`suggest-fixes`)

Runs when CI fails to provide actionable fix guidance.

**What it provides:**
- Parsed lint error explanations
- TypeScript error fixes (TS2322, TS2345, TS2531, TS7006, TS2339)
- Quick fix commands
- Copilot CLI commands to resolve issues

### Interpreting PR Comments

When a PR is opened, the workflow posts a comment with:

```
## Copilot AI Code Review

## AI Code Review Analysis
**PR:** #123
**Branch:** feature/new-tool -> main
**Author:** @username

### Changed Files
| File | Type | Lines Changed |
|------|------|---------------|
| `app/tools/new-tool/page.tsx` | tsx | +150/-0 |

### Change Categories
- Components: 1 files
- Pages/Routes: 1 files
- Tests: 0 files

### Code Quality Metrics
| Metric | Count | Status |
|--------|-------|--------|
| TODO comments | 2 | Consider addressing before merge |
| Console statements | 0 | - |
| TypeScript `any` | 0 | - |

### AI-Powered Suggestions
- **Testing:** Component changes detected without corresponding test updates

## Summary
| Check | Status |
|-------|--------|
| Lint | Passed |
| Type Check | Passed |
| Commits | Valid |
| Security | Passed |

**Recommendation:** This PR looks good to merge!
```

### Status Indicators

| Check | Passed | Failed |
|-------|--------|--------|
| Lint | Passed | **Failed** (blocking) |
| Type Check | Passed | **Failed** (blocking) |
| Commits | Valid | Warning (non-blocking) |
| Security | Passed | **Issues Found** (blocking) or Warning |

### Workflow Outputs

All jobs produce artifacts stored for 7-30 days:

| Artifact | Description | Retention |
|----------|-------------|-----------|
| `commit-validation-report` | Commit format analysis | 7 days |
| `security-report` | Security scan results | 30 days |
| `ai-review-report` | Full code analysis | 30 days |
| `fix-suggestions` | Remediation guidance | 7 days |

### Manual Workflow Dispatch

You can trigger the workflow manually:

1. Go to **Actions** tab in GitHub
2. Select **Copilot AI Review**
3. Click **Run workflow**
4. Optionally toggle security scan

### Integration with Local Development

Before pushing, run the same checks locally:

```bash
# Source aliases
source scripts/copilot-aliases.sh

# Run full CI check (lint + typecheck + test + build)
cop-ci

# Or run individual checks
cop-lint          # Lint with auto-fix
cop-typecheck     # Type checking only
cop-review        # Review uncommitted changes
cop-commit        # Generate conventional commit message
```

---

## Best Practices

### 1. Tool Permissions

- Use specific tool aliases (`copg`, `copf`) instead of `copa` when possible
- Only use `--allow-all-tools` for trusted, well-defined tasks
- Review generated commands before executing

### 2. SuperTool Patterns

When generating code, remind Copilot of our patterns:

```bash
copp "Create a color picker using Panda CSS (not Tailwind) following patterns in app/tools/unit-converter/page.tsx"
```

### 3. Test Coverage

Always request 95% coverage when generating tests:

```bash
copp "Generate tests for app/tools/json-beautifier/page.tsx targeting 95% coverage using Vitest and Testing Library"
```

### 4. Commit Messages

Use conventional commit format:

```
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
# Scope: tool name or component area
```

### 5. Context Enhancement

For complex tasks, provide context:

```bash
copp "Looking at app/tools/unit-converter/page.tsx as reference, create a temperature converter tool with the same styling patterns and analytics tracking"
```

---

## Troubleshooting

### "copilot: command not found"

```bash
# Ensure global npm bin is in PATH
export PATH="$PATH:$(npm bin -g)"

# Or reinstall
npm install -g @github/copilot
```

### Authentication Issues

```bash
# Clear and re-authenticate
copilot auth logout
copilot auth
```

### Aliases Not Working

```bash
# Check if script is sourced
echo $0  # Should show your shell

# Re-source the aliases
source /path/to/supertool/scripts/copilot-aliases.sh

# Verify aliases loaded
type cop-help
```

### Rate Limiting

If you hit rate limits:

1. Wait a few minutes before retrying
2. Use more specific prompts to reduce API calls
3. Consider using batch operations

### Tool Permission Errors

```bash
# If a tool is blocked, add explicit permission
copilot -p "your prompt" --allow-tool 'shell(command-name)'

# Or use the full access alias (carefully)
copa "your prompt"
```

### MCP Server Issues

```bash
# Check if MCP servers are running
# Look for errors in your IDE's output panel

# Restart the MCP connection
# In VS Code: Cmd+Shift+P -> "MCP: Restart Servers"
```

---

## Related Resources

- [GitHub Copilot CLI Documentation](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [SuperTool Development Guide](.github/copilot-instructions.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [Copilot Agents](.github/agents/)

---

## Quick Reference Card

```
cop-help                 # Show all aliases
cop                      # Interactive mode
cop-ci                   # Full CI check
cop-commit               # Generate commit message
cop-new-tool             # Create new tool page
cop-gen-tests            # Generate tests
copp "prompt"            # Quick prompt
coppg "git prompt"       # Prompt with git access
coppf "pnpm prompt"      # Prompt with pnpm access
```
