# GitHub Agentic Workflows Setup Guide

## Overview

GitHub Agentic Workflows (gh-aw) has been installed and configured for the SuperTool repository. This system enables AI-powered automation for code reviews, issue triage, test coverage analysis, and dependency management.

## What Was Installed

### 1. Extension Installation
- ✅ Installed `github/gh-aw` extension via GitHub CLI
- ✅ Repository initialized for agentic workflows

### 2. Created Workflows

Four agentic workflows have been created in `.github/workflows/`:

#### a) **Code Review Assistant** (`code-review.md`)
- **Trigger**: On pull request (opened, synchronized)
- **Purpose**: Automated code review following SuperTool standards
- **Key Features**:
  - Verifies Panda CSS usage (NOT Tailwind)
  - Checks TypeScript patterns (no `any` types)
  - Validates import order and formatting
  - Reviews analytics implementation (no PII logging)
  - Flags bundle size increases > 20KB
  - Checks AI tool integration patterns
- **Output**: One comprehensive PR comment with feedback

#### b) **Test Coverage Analysis** (`test-coverage-check.md`)
- **Trigger**: On pull request (opened, synchronized)
- **Purpose**: Analyzes test coverage for new/modified code
- **Key Features**:
  - Identifies missing test files
  - Checks test quality (React Testing Library patterns)
  - Verifies coverage thresholds (>70% general, >80% critical)
  - Provides test templates for missing tests
- **Output**: Coverage summary comment on PR

#### c) **Dependency Update Helper** (`dependency-update-helper.md`)
- **Trigger**: Weekly (Monday)
- **Purpose**: Monitor and report outdated dependencies
- **Key Features**:
  - Categorizes updates (security, major, minor, patch)
  - Assesses risk and impact
  - Provides update commands
  - Links to migration guides
  - Includes testing checklist
- **Output**: Weekly issue with update recommendations

#### d) **Issue Triage Assistant** (`issue-triage.md`)
- **Trigger**: On issue (opened, reopened)
- **Purpose**: Automatically categorize and respond to issues
- **Key Features**:
  - Categorizes issue type (bug, feature, enhancement, etc.)
  - Determines tool category (AI tools, data tools, etc.)
  - Adds appropriate labels
  - Provides helpful initial response
  - Requests missing information
- **Output**: Comment + labels on new issues

### 3. Additional Files Created

- `.github/agents/agentic-workflows.agent.md` - Agent definition for workflow system
- `.github/workflows/copilot-setup-steps.yml` - Setup configuration
- `.gitattributes` - Git configuration for workflow files

## Next Steps: Required Setup

### 1. Configure GitHub Secrets

The workflows require GitHub secrets to function. You need to set up the required token:

#### Required Secret for AI-Powered Workflows

```bash
# Create a Personal Access Token (PAT) with these permissions:
# - repo (full repository access)
# - workflow
# - read:org
# The account must have an active GitHub Copilot subscription.

gh aw secrets set COPILOT_GITHUB_TOKEN --owner ferryhinardi --repo supertool
```

> **⚠️ Important:** `COPILOT_GITHUB_TOKEN` is **required** (not optional) for all AI-powered agentic workflows to function.
> Without this token, the workflows will gracefully skip with a warning instead of failing.
> See `.github/SECRETS_SETUP.md` for detailed instructions on obtaining and configuring this token.

#### Optional Additional Secrets (for advanced features)

```bash
# For using a separate token for GitHub MCP server (advanced isolation)
gh aw secrets set GH_AW_GITHUB_MCP_SERVER_TOKEN --owner ferryhinardi --repo supertool

# For agent assignment features
gh aw secrets set GH_AW_AGENT_TOKEN --owner ferryhinardi --repo supertool
```

### 2. Create Personal Access Tokens

#### COPILOT_GITHUB_TOKEN (Required for Copilot engine)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow` (update GitHub Action workflows)
   - ✅ `read:org` (read organization info)
   - ✅ `copilot` (access to GitHub Copilot)
4. Generate and copy the token
5. Set it as `COPILOT_GITHUB_TOKEN` in repository secrets

#### GH_AW_GITHUB_TOKEN (Required for GitHub API access)

1. Create a separate PAT (or reuse the same one) with:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow` (update GitHub Action workflows)
   - ✅ `read:org` (read organization info)
2. Set it as `GH_AW_GITHUB_TOKEN` in repository secrets

#### Setting Secrets via GitHub Web UI

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `COPILOT_GITHUB_TOKEN` with the PAT value
5. Add `GH_AW_GITHUB_TOKEN` with the PAT value

### 3. Compile Workflows

After setting up secrets, compile the workflows to generate GitHub Actions YAML:

```bash
# Compile all workflows
gh aw compile

# Check compilation status
gh aw status

# List all workflows
gh aw list
```

### 4. Commit and Push

```bash
# Add the workflow files
git add .github/

# Commit
git commit -m "feat: add GitHub Agentic Workflows for automation"

# Push to enable workflows
git push origin main
```

## Workflow Management Commands

### Common Commands

```bash
# List all workflows
gh aw list

# Check workflow status
gh aw status

# Compile workflows after editing
gh aw compile

# Run a specific workflow manually
gh aw run <workflow-name>

# View workflow logs
gh aw logs <workflow-name>

# Audit a failed workflow run
gh aw audit <run-id>

# Enable/disable workflows
gh aw enable
gh aw disable

# Update workflows from source
gh aw update
```

### Editing Workflows

To modify a workflow:

1. Edit the `.md` file in `.github/workflows/`
2. Run `gh aw compile` to regenerate YAML
3. Commit and push changes

### Testing Workflows

```bash
# Trial run (simulate without actually running)
gh aw trial <workflow-name>

# Manual trigger for testing
gh aw run <workflow-name>
```

## Integration with Existing Setup

### Compatibility with Current Workflows

The agentic workflows complement your existing GitHub Actions:

- **Existing**: `ci.yml` - Runs tests, builds, type checks
- **Existing**: `coverage.yml` - Generates test coverage reports
- **Existing**: `copilot-review.yml` - Basic code review
- **New**: Agentic workflows provide AI-powered analysis and automation

### How They Work Together

```
PR Opened
  ↓
├─ ci.yml (runs tests, build, lint)
├─ coverage.yml (generates coverage report)
├─ code-review.md (AI reviews code quality) ← NEW
└─ test-coverage-check.md (AI analyzes coverage) ← NEW

Issue Opened
  ↓
└─ issue-triage.md (AI categorizes + responds) ← NEW

Weekly Schedule
  ↓
└─ dependency-update-helper.md (AI checks deps) ← NEW
```

## SuperTool-Specific Configuration

The workflows are tailored to SuperTool's tech stack and standards:

- **Panda CSS enforcement** (not Tailwind)
- **Privacy-first analytics** (no PII logging)
- **React 19 + Next.js 15** patterns
- **TypeScript strict mode** compliance
- **Bundle size monitoring** (>20KB threshold)
- **Test coverage targets** (>70% general, >80% critical)
- **Tool categories** (AI, Data, Design, Dev, Finance, Media, Productivity, Security)

## Documentation References

The workflows reference these project docs:

- `docs/reference/WARP.md` - Complete development guide
- `.github/agents/AGENTS.md` - Specialist agents overview
- `panda.config.ts` - Panda CSS configuration
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines

## Troubleshooting

### ⚠️ Secret Verification Failed

**Symptom**: Workflow run fails with "Secret Verification Failed" error. Log shows:
```
Error: None of the following secrets are set: COPILOT_GITHUB_TOKEN
The GitHub Copilot CLI engine requires either COPILOT_GITHUB_TOKEN secret to be configured.
```

**Cause**: The `COPILOT_GITHUB_TOKEN` secret is not configured in the repository settings.

**Fix**:
1. Create a GitHub Personal Access Token (PAT) with `repo`, `workflow`, `read:org`, and `copilot` scopes
2. Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Add the secret with name `COPILOT_GITHUB_TOKEN` and the PAT value
4. Re-run the failed workflow

All four agentic workflows (Issue Triage, Code Review, Test Coverage, Dependency Update) require this secret.

### Compilation Errors

If `gh aw compile` fails:

1. Check secrets are configured: `gh aw secrets bootstrap`
2. Validate frontmatter: `gh aw hash-frontmatter <workflow.md>`
3. Check verbose output: `gh aw compile --verbose`

### Workflow Not Triggering

1. Ensure `COPILOT_GITHUB_TOKEN` and `GH_AW_GITHUB_TOKEN` secrets are set in repository settings
2. Check workflow permissions in Actions settings
3. Verify trigger conditions match (PR, issue, schedule)
4. Check GitHub Actions tab for error details

### "Secret Verification Failed" or Workflow Skipped with Warning

**Cause:** `COPILOT_GITHUB_TOKEN` is not configured in repository secrets.

**Symptoms:**
- Workflow shows "skipped" status
- Warning message: `COPILOT_GITHUB_TOKEN secret is not configured`

**Fix:**
1. Ensure your GitHub account has an active GitHub Copilot subscription
2. Generate a Personal Access Token at [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
3. Select scopes: `repo`, `workflow`, `read:org`
4. Add the token as `COPILOT_GITHUB_TOKEN` in repository secrets:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `COPILOT_GITHUB_TOKEN`, Value: your PAT
5. See `.github/SECRETS_SETUP.md` for detailed instructions

**Note:** Without `COPILOT_GITHUB_TOKEN`, workflows will skip gracefully instead of failing. All other CI/CD checks will continue to work normally.

### Performance Issues

Workflows run on GitHub infrastructure and may take 1-3 minutes per run depending on complexity.

## Cost Considerations

- GitHub Actions minutes are used for workflow runs
- Copilot API calls may incur costs (if using Copilot engine)
- Free tier: 2,000 minutes/month for private repos, unlimited for public

## Resources

- **Documentation**: https://github.github.com/gh-aw/
- **Extension repo**: https://github.com/github/gh-aw
- **MCP Integration**: Model Context Protocol support included
- **Community**: GitHub Discussions for gh-aw extension

## Summary

✅ **Installed**: GitHub Agentic Workflows extension
✅ **Created**: 4 custom workflows for SuperTool
✅ **Configured**: Workflows tailored to project standards
⚠️ **Required**: `COPILOT_GITHUB_TOKEN` secret must be set for all workflows to function
⚠️ **Required**: `GH_AW_GITHUB_TOKEN` secret must be set for GitHub API access

**Action Required**: Set up `COPILOT_GITHUB_TOKEN` and `GH_AW_GITHUB_TOKEN` in repository secrets to activate all agentic workflows. See the [Required Setup](#1-configure-github-secrets) section above.
