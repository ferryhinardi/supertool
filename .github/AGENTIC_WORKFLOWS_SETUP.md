# GitHub Agentic Workflows Setup Guide

## Overview

GitHub Agentic Workflows (gh-aw) has been installed and configured for the SuperTool repository. This system enables AI-powered automation for code reviews, issue triage, and dependency management.

## What Was Installed

### 1. Extension Installation
- ✅ Installed `github/gh-aw` extension via GitHub CLI
- ✅ Repository initialized for agentic workflows

### 2. Created Workflows

Three agentic workflows have been created in `.github/workflows/`:

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

#### b) **Dependency Update Helper** (`dependency-update-helper.md`)
- **Trigger**: Weekly (Monday)
- **Purpose**: Monitor and report outdated dependencies
- **Key Features**:
  - Categorizes updates (security, major, minor, patch)
  - Assesses risk and impact
  - Provides update commands
  - Links to migration guides
  - Includes testing checklist
- **Output**: Weekly issue with update recommendations

#### c) **Issue Triage Assistant** (`issue-triage.md`)
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

The workflows require GitHub secrets to function. You need to set up at least the required token:

#### Required Secret

```bash
# Create a Personal Access Token (PAT) with these permissions:
# - repo (full control)
# - workflow
# - read:org

gh aw secrets set GH_AW_GITHUB_TOKEN --owner ferryhinardi --repo supertool
```

#### Optional Secrets (for full functionality)

```bash
# For Copilot-powered workflows
gh aw secrets set COPILOT_GITHUB_TOKEN --owner ferryhinardi --repo supertool

# For agent assignment features
gh aw secrets set GH_AW_AGENT_TOKEN --owner ferryhinardi --repo supertool

# For isolated MCP server permissions (advanced)
gh aw secrets set GH_AW_GITHUB_MCP_SERVER_TOKEN --owner ferryhinardi --repo supertool
```

### 2. Create Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow` (update GitHub Action workflows)
   - ✅ `read:org` (read organization info)
4. Generate and copy the token
5. Use it when running the `gh aw secrets set` commands above

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

### Compilation Errors

If `gh aw compile` fails:

1. Check secrets are configured: `gh aw secrets bootstrap`
2. Validate frontmatter: `gh aw hash-frontmatter <workflow.md>`
3. Check verbose output: `gh aw compile --verbose`

### Workflow Not Triggering

1. Ensure secrets are set in repository settings
2. Check workflow permissions in Actions settings
3. Verify trigger conditions match (PR, issue, schedule)
4. Check GitHub Actions tab for error details

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
✅ **Created**: 3 custom workflows for SuperTool
✅ **Configured**: Workflows tailored to project standards
⏳ **Pending**: GitHub secrets setup (required to enable)
⏳ **Pending**: Workflow compilation + deployment

Next action: Set up GitHub secrets and compile workflows to activate!
