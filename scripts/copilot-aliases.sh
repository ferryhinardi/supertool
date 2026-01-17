#!/bin/bash
# ============================================================================
# GitHub Copilot CLI Aliases for SuperTool Development
# ============================================================================
#
# Usage: Add this to your shell config (~/.zshrc or ~/.bashrc):
#   source /path/to/supertool/scripts/copilot-aliases.sh
#
# Or copy the aliases you want to use directly into your shell config.
#
# Prerequisites:
#   1. Install Copilot CLI: npm install -g @github/copilot
#   2. Authenticate: copilot auth
#   3. Have an active GitHub Copilot subscription
#
# ============================================================================

# --------------------------------------------------------------------------
# Basic Copilot Commands
# --------------------------------------------------------------------------

# Interactive mode - start a conversation
alias cop="copilot"

# Quick prompt mode with common tool permissions
alias copg="copilot -p --allow-tool 'shell(git)'"       # Git operations allowed
alias copf="copilot -p --allow-tool 'shell(pnpm)'"     # pnpm commands allowed
alias copa="copilot -p --allow-all-tools"               # All tools (use carefully!)

# --------------------------------------------------------------------------
# SuperTool Development Workflows
# --------------------------------------------------------------------------

# Code Quality
alias cop-lint="copilot -p 'Run pnpm lint and fix any issues. Show me what was fixed.' --allow-tool 'shell(pnpm)'"
alias cop-typecheck="copilot -p 'Run TypeScript type checking with pnpm exec tsc --noEmit and explain any errors' --allow-tool 'shell(pnpm)'"
alias cop-format="copilot -p 'Format the codebase with pnpm format' --allow-tool 'shell(pnpm)'"

# Testing
alias cop-test="copilot -p 'Run the test suite with pnpm test and help fix any failures' --allow-tool 'shell(pnpm)'"
alias cop-test-file="copilot -p 'Run tests for the file I specify and show coverage' --allow-tool 'shell(pnpm)'"
alias cop-coverage="copilot -p 'Run tests with coverage and identify files below 95% threshold' --allow-tool 'shell(pnpm)'"

# Build
alias cop-build="copilot -p 'Build the project with pnpm build and explain any errors' --allow-tool 'shell(pnpm)'"
alias cop-dev="copilot -p 'Start the dev server with pnpm dev' --allow-tool 'shell(pnpm)'"

# Full CI Check (what runs in GitHub Actions)
alias cop-ci="copilot -p 'Run full CI checks: lint, typecheck, test, and build. Report any issues.' --allow-tool 'shell(pnpm)'"

# --------------------------------------------------------------------------
# Code Generation (SuperTool Patterns)
# --------------------------------------------------------------------------

# Create new tool page
alias cop-new-tool="copilot -p 'Help me create a new tool page. I will specify the tool name and functionality. Follow SuperTool patterns: Panda CSS styling, proper analytics, 95% test coverage.'"

# Create new component
alias cop-new-component="copilot -p 'Help me create a new UI component using Panda CSS and Ark UI patterns from our components/ui directory.'"

# Generate tests
alias cop-gen-tests="copilot -p 'Generate comprehensive tests for the file I specify. Target 95% coverage. Use Vitest and Testing Library patterns from our codebase.'"

# Add analytics
alias cop-add-analytics="copilot -p 'Add analytics tracking to the component I specify using trackToolEvent() following our privacy guidelines.'"

# --------------------------------------------------------------------------
# Git Workflows
# --------------------------------------------------------------------------

# Commit with conventional message
alias cop-commit="copilot -p 'Look at my staged changes and create a conventional commit message. Use format: type(scope): description' --allow-tool 'shell(git)'"

# Create PR description
alias cop-pr="copilot -p 'Create a detailed PR description for the current branch compared to main. Include: summary, changes, testing notes.' --allow-tool 'shell(git)'"

# Review changes
alias cop-review="copilot -p 'Review my uncommitted changes for potential issues, bugs, or improvements' --allow-tool 'shell(git)'"

# Explain recent commits
alias cop-log="copilot -p 'Show and explain the last 5 commits on this branch' --allow-tool 'shell(git)'"

# --------------------------------------------------------------------------
# Debugging & Exploration
# --------------------------------------------------------------------------

# Explain code
alias cop-explain="copilot -p 'Explain how this file/function works in the context of SuperTool'"

# Debug error
alias cop-debug="copilot -p 'Help me debug this error. I will paste the error message.'"

# Find code
alias cop-find="copilot -p 'Help me find code in this project. I will describe what I am looking for.'"

# Understand architecture
alias cop-arch="copilot -p 'Explain the architecture of SuperTool and how the main components fit together'"

# --------------------------------------------------------------------------
# Documentation
# --------------------------------------------------------------------------

# Generate docs
alias cop-docs="copilot -p 'Generate documentation for the code I specify following our docs/ patterns'"

# Update changelog
alias cop-changelog="copilot -p 'Help me write a changelog entry for the changes I made' --allow-tool 'shell(git)'"

# --------------------------------------------------------------------------
# Helper Functions
# --------------------------------------------------------------------------

# Quick prompt with context - usage: copp "your prompt here"
copp() {
  copilot -p "$*"
}

# Prompt with git access - usage: coppg "your git-related prompt"
coppg() {
  copilot -p "$*" --allow-tool 'shell(git)'
}

# Prompt with pnpm access - usage: coppf "your pnpm-related prompt"  
coppf() {
  copilot -p "$*" --allow-tool 'shell(pnpm)'
}

# Full access prompt - usage: coppa "your prompt" (use carefully!)
coppa() {
  copilot -p "$*" --allow-all-tools
}

# --------------------------------------------------------------------------
# Print available aliases
# --------------------------------------------------------------------------

cop-help() {
  echo "GitHub Copilot CLI Aliases for SuperTool"
  echo "========================================="
  echo ""
  echo "Basic Commands:"
  echo "  cop              - Interactive mode"
  echo "  copg             - Prompt with git access"
  echo "  copf             - Prompt with pnpm access"
  echo "  copa             - Prompt with all tools (careful!)"
  echo ""
  echo "Development:"
  echo "  cop-lint         - Run lint and fix issues"
  echo "  cop-typecheck    - Run TypeScript checks"
  echo "  cop-test         - Run tests"
  echo "  cop-build        - Build project"
  echo "  cop-ci           - Full CI check"
  echo ""
  echo "Code Generation:"
  echo "  cop-new-tool     - Create new tool page"
  echo "  cop-new-component - Create new component"
  echo "  cop-gen-tests    - Generate tests for a file"
  echo ""
  echo "Git:"
  echo "  cop-commit       - Create commit message"
  echo "  cop-pr           - Create PR description"
  echo "  cop-review       - Review uncommitted changes"
  echo ""
  echo "Functions:"
  echo "  copp \"prompt\"    - Quick prompt"
  echo "  coppg \"prompt\"   - Prompt with git"
  echo "  coppf \"prompt\"   - Prompt with pnpm"
  echo ""
  echo "Run 'cop-help' to see this message again."
}

echo "Copilot CLI aliases loaded. Run 'cop-help' for available commands."
